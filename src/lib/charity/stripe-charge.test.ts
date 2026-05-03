import { describe, expect, it, vi } from "vitest";
import {
  buildStripeChargeBody,
  chargeIdempotencyKey,
  computeWeeklyChargeAmount,
  isStripeChargeEnabled,
  processCharityCharge,
  stripeFormEncode,
} from "./stripe-charge";
import type { Nonprofit, PodPledge } from "@/types/charity";

const verifiedNonprofit: Nonprofit = {
  id: "verified-1",
  name: "Sample Verified Charity",
  url: "https://example.test/",
  ein: "12-3456789",
  mission: "A verified nonprofit that distributes meals to families in need.",
  country: "US",
  verifiedByFounder: true,
};

const unverifiedNonprofit: Nonprofit = {
  ...verifiedNonprofit,
  id: "unverified-1",
  verifiedByFounder: false,
};

const validPledge: PodPledge = {
  id: "p-1",
  podId: "pod-x",
  recipeWeekKey: "pick-2026-05-11",
  amountPerCookMinor: 500, // $5
  currency: "USD",
  nonprofitId: "verified-1",
  status: "pending",
  stripeReference: null,
  createdAt: "2026-05-11T00:00:00.000Z",
  updatedAt: "2026-05-11T00:00:00.000Z",
};

// ── isStripeChargeEnabled ─────────────────────────────────

describe("isStripeChargeEnabled", () => {
  it("STRIPE_SECRET_KEY present → true", () => {
    expect(isStripeChargeEnabled({ STRIPE_SECRET_KEY: "sk_test_x" })).toBe(
      true,
    );
  });

  it("missing key → false (stub mode)", () => {
    expect(isStripeChargeEnabled({})).toBe(false);
  });

  it("master switch 'false' → false even with key", () => {
    expect(
      isStripeChargeEnabled({
        STRIPE_SECRET_KEY: "sk",
        SOUS_CHARITY_CHARGE_ENABLED: "false",
      }),
    ).toBe(false);
  });
});

// ── chargeIdempotencyKey ──────────────────────────────────

describe("chargeIdempotencyKey", () => {
  it("same triple → same key (no-double-charge invariant)", () => {
    const a = chargeIdempotencyKey({
      podId: "pod-a",
      recipeWeekKey: "pick-2026-05-11",
      nonprofitId: "np-1",
    });
    const b = chargeIdempotencyKey({
      podId: "pod-a",
      recipeWeekKey: "pick-2026-05-11",
      nonprofitId: "np-1",
    });
    expect(a).toBe(b);
  });

  it("different pod → different key", () => {
    const a = chargeIdempotencyKey({
      podId: "pod-a",
      recipeWeekKey: "pick-2026-05-11",
      nonprofitId: "np-1",
    });
    const b = chargeIdempotencyKey({
      podId: "pod-b",
      recipeWeekKey: "pick-2026-05-11",
      nonprofitId: "np-1",
    });
    expect(a).not.toBe(b);
  });

  it("different week → different key", () => {
    const a = chargeIdempotencyKey({
      podId: "pod-a",
      recipeWeekKey: "pick-2026-05-11",
      nonprofitId: "np-1",
    });
    const b = chargeIdempotencyKey({
      podId: "pod-a",
      recipeWeekKey: "pick-2026-05-18",
      nonprofitId: "np-1",
    });
    expect(a).not.toBe(b);
  });

  it("key shape includes the sous-charity prefix", () => {
    expect(
      chargeIdempotencyKey({
        podId: "x",
        recipeWeekKey: "y",
        nonprofitId: "z",
      }),
    ).toContain("sous-charity-");
  });
});

// ── computeWeeklyChargeAmount ─────────────────────────────

describe("computeWeeklyChargeAmount", () => {
  it("multiplies amount × cooks", () => {
    expect(
      computeWeeklyChargeAmount({
        amountPerCookMinor: 500,
        completedCooks: 4,
      }),
    ).toBe(2000);
  });

  it("0 cooks → 0", () => {
    expect(
      computeWeeklyChargeAmount({
        amountPerCookMinor: 500,
        completedCooks: 0,
      }),
    ).toBe(0);
  });

  it("0 amount → 0", () => {
    expect(
      computeWeeklyChargeAmount({
        amountPerCookMinor: 0,
        completedCooks: 4,
      }),
    ).toBe(0);
  });

  it("negative inputs → 0 (defensive)", () => {
    expect(
      computeWeeklyChargeAmount({
        amountPerCookMinor: -100,
        completedCooks: 4,
      }),
    ).toBe(0);
    expect(
      computeWeeklyChargeAmount({
        amountPerCookMinor: 100,
        completedCooks: -1,
      }),
    ).toBe(0);
  });

  it("non-finite inputs → 0", () => {
    expect(
      computeWeeklyChargeAmount({
        amountPerCookMinor: Number.NaN,
        completedCooks: 4,
      }),
    ).toBe(0);
  });
});

// ── buildStripeChargeBody ─────────────────────────────────

describe("buildStripeChargeBody", () => {
  it("happy path returns body with amount + currency + metadata", () => {
    const body = buildStripeChargeBody({
      pledge: validPledge,
      nonprofit: verifiedNonprofit,
      completedCooks: 4,
    });
    expect(body).not.toBeNull();
    if (body) {
      expect(body.amount).toBe(2000);
      expect(body.currency).toBe("usd");
      expect(body.description).toContain("Sample Verified");
      expect(body.metadata.sousPodId).toBe("pod-x");
      expect(body.metadata.sousCompletedCooks).toBe("4");
    }
  });

  it("unverified nonprofit → null (safety gate)", () => {
    expect(
      buildStripeChargeBody({
        pledge: validPledge,
        nonprofit: unverifiedNonprofit,
        completedCooks: 4,
      }),
    ).toBeNull();
  });

  it("0 cooks → null (no chargeable amount)", () => {
    expect(
      buildStripeChargeBody({
        pledge: validPledge,
        nonprofit: verifiedNonprofit,
        completedCooks: 0,
      }),
    ).toBeNull();
  });
});

// ── stripeFormEncode ──────────────────────────────────────

describe("stripeFormEncode", () => {
  it("encodes amount + currency + description + metadata in form-url shape", () => {
    const encoded = stripeFormEncode({
      amount: 2000,
      currency: "usd",
      description: "Test description",
      metadata: {
        sousPodId: "pod-x",
        sousRecipeWeekKey: "pick-2026-05-11",
        sousNonprofitId: "np-1",
        sousCompletedCooks: "4",
      },
    });
    expect(encoded).toContain("amount=2000");
    expect(encoded).toContain("currency=usd");
    // Stripe form encoding uses literal brackets (not URL-encoded)
    // for metadata keys — that's the expected wire shape.
    expect(encoded).toContain("metadata[sousPodId]=pod-x");
  });

  it("URL-encodes special chars in description", () => {
    const encoded = stripeFormEncode({
      amount: 100,
      currency: "usd",
      description: "Pod & charity = win",
      metadata: {
        sousPodId: "x",
        sousRecipeWeekKey: "y",
        sousNonprofitId: "z",
        sousCompletedCooks: "1",
      },
    });
    expect(encoded).toContain("Pod%20%26%20charity%20%3D%20win");
  });
});

// ── processCharityCharge ──────────────────────────────────

describe("processCharityCharge — stub mode", () => {
  it("no Stripe key → stub-mode log + ok=true", async () => {
    const lines: string[] = [];
    const out = await processCharityCharge(
      {
        pledge: validPledge,
        nonprofit: verifiedNonprofit,
        completedCooks: 4,
      },
      {
        env: {},
        logImpl: (s) => lines.push(s),
      },
    );
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.mode).toBe("stub");
    expect(lines.length).toBe(1);
    expect(lines[0]).toContain("would charge");
    expect(lines[0]).toContain("2000");
  });

  it("idempotency key returned in stub mode", async () => {
    const out = await processCharityCharge(
      {
        pledge: validPledge,
        nonprofit: verifiedNonprofit,
        completedCooks: 4,
      },
      { env: {}, logImpl: () => {} },
    );
    if (out.ok) {
      expect(out.idempotencyKey).toContain("sous-charity-pod-x");
    }
  });
});

describe("processCharityCharge — refusal paths", () => {
  it("unverified nonprofit → ok=false", async () => {
    const out = await processCharityCharge(
      {
        pledge: validPledge,
        nonprofit: unverifiedNonprofit,
        completedCooks: 4,
      },
      { env: {} },
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason.toLowerCase()).toContain("unverified");
  });

  it("schema-invalid pledge (negative amount) → ok=false", async () => {
    const bad = {
      ...validPledge,
      amountPerCookMinor: -1,
    } as PodPledge;
    const out = await processCharityCharge(
      {
        pledge: bad,
        nonprofit: verifiedNonprofit,
        completedCooks: 4,
      },
      { env: {} },
    );
    expect(out.ok).toBe(false);
  });

  it("0 cooks → ok=false (no chargeable amount)", async () => {
    const out = await processCharityCharge(
      {
        pledge: validPledge,
        nonprofit: verifiedNonprofit,
        completedCooks: 0,
      },
      { env: {}, logImpl: () => {} },
    );
    expect(out.ok).toBe(false);
  });
});

describe("processCharityCharge — real mode (mocked fetch)", () => {
  it("happy path → ok=true / mode=stripe", async () => {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({ id: "ch_x" }), { status: 200 }),
    ) as unknown as typeof fetch;
    const out = await processCharityCharge(
      {
        pledge: validPledge,
        nonprofit: verifiedNonprofit,
        completedCooks: 4,
      },
      {
        env: { STRIPE_SECRET_KEY: "sk_test_x" },
        fetchImpl,
      },
    );
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.mode).toBe("stripe");
  });

  it("HTTP error → ok=false", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("err", { status: 500 }),
    ) as unknown as typeof fetch;
    const out = await processCharityCharge(
      {
        pledge: validPledge,
        nonprofit: verifiedNonprofit,
        completedCooks: 4,
      },
      {
        env: { STRIPE_SECRET_KEY: "sk_test_x" },
        fetchImpl,
      },
    );
    expect(out.ok).toBe(false);
  });

  it("network throw → ok=false (never throws)", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("boom");
    }) as unknown as typeof fetch;
    const out = await processCharityCharge(
      {
        pledge: validPledge,
        nonprofit: verifiedNonprofit,
        completedCooks: 4,
      },
      {
        env: { STRIPE_SECRET_KEY: "sk_test_x" },
        fetchImpl,
      },
    );
    expect(out.ok).toBe(false);
  });

  it("posts to Stripe with idempotency-key header", async () => {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({}), { status: 200 }),
    ) as unknown as typeof fetch;
    await processCharityCharge(
      {
        pledge: validPledge,
        nonprofit: verifiedNonprofit,
        completedCooks: 4,
      },
      {
        env: { STRIPE_SECRET_KEY: "sk_test_x" },
        fetchImpl,
      },
    );
    expect(fetchImpl).toHaveBeenCalled();
    const call = (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock
      .calls[0];
    expect(call?.[0]).toBe("https://api.stripe.com/v1/charges");
    const init = call?.[1] as RequestInit | undefined;
    const headers = init?.headers as Record<string, string> | undefined;
    expect(headers?.["idempotency-key"]).toContain("sous-charity-pod-x");
  });
});
