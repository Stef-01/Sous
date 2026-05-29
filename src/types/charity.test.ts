import { describe, expect, it } from "vitest";
import {
  nonprofitFileSchema,
  nonprofitSchema,
  podPledgeSchema,
  pledgeStatusSchema,
  supportedCurrencySchema,
} from "./charity";
import nonprofitsRaw from "@/data/nonprofits.json";

// ── supportedCurrencySchema ───────────────────────────────

describe("supportedCurrencySchema", () => {
  it("accepts USD/EUR/GBP/CAD", () => {
    expect(supportedCurrencySchema.safeParse("USD").success).toBe(true);
    expect(supportedCurrencySchema.safeParse("EUR").success).toBe(true);
    expect(supportedCurrencySchema.safeParse("GBP").success).toBe(true);
    expect(supportedCurrencySchema.safeParse("CAD").success).toBe(true);
  });

  it("rejects JPY (out of W48 launch scope)", () => {
    expect(supportedCurrencySchema.safeParse("JPY").success).toBe(false);
  });
});

// ── pledgeStatusSchema ────────────────────────────────────

describe("pledgeStatusSchema", () => {
  it("accepts the four lifecycle states", () => {
    for (const s of ["pending", "charged", "failed", "cancelled"] as const) {
      expect(pledgeStatusSchema.safeParse(s).success).toBe(true);
    }
  });

  it("rejects unknown status strings", () => {
    expect(pledgeStatusSchema.safeParse("processing").success).toBe(false);
  });
});

// ── nonprofitSchema ───────────────────────────────────────

describe("nonprofitSchema", () => {
  const valid = {
    id: "x",
    name: "Sample",
    url: "https://example.test/",
    ein: "",
    mission:
      "A clear and concise mission statement of more than twenty characters.",
    country: "US",
    verifiedByFounder: false,
  };

  it("accepts a well-formed entry", () => {
    expect(nonprofitSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects malformed URL", () => {
    expect(
      nonprofitSchema.safeParse({ ...valid, url: "not-a-url" }).success,
    ).toBe(false);
  });

  it("rejects mission shorter than min length", () => {
    expect(
      nonprofitSchema.safeParse({ ...valid, mission: "short" }).success,
    ).toBe(false);
  });

  it("rejects country code that's not 2 chars", () => {
    expect(
      nonprofitSchema.safeParse({ ...valid, country: "USA" }).success,
    ).toBe(false);
  });

  it("EIN field can be empty (international entry)", () => {
    expect(
      nonprofitSchema.safeParse({ ...valid, ein: "", country: "GB" }).success,
    ).toBe(true);
  });
});

// ── podPledgeSchema ───────────────────────────────────────

describe("podPledgeSchema", () => {
  const valid = {
    id: "p-1",
    podId: "pod-x",
    recipeWeekKey: "pick-2026-05-11",
    amountPerCookMinor: 500,
    currency: "USD",
    nonprofitId: "x",
    status: "pending",
    stripeReference: null,
    createdAt: "2026-05-11T00:00:00.000Z",
    updatedAt: "2026-05-11T00:00:00.000Z",
  };

  it("accepts a well-formed pledge", () => {
    expect(podPledgeSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects negative amount", () => {
    expect(
      podPledgeSchema.safeParse({ ...valid, amountPerCookMinor: -100 }).success,
    ).toBe(false);
  });

  it("rejects non-integer amount", () => {
    expect(
      podPledgeSchema.safeParse({ ...valid, amountPerCookMinor: 1.5 }).success,
    ).toBe(false);
  });

  it("0 amount is valid (free-tier pledge)", () => {
    expect(
      podPledgeSchema.safeParse({ ...valid, amountPerCookMinor: 0 }).success,
    ).toBe(true);
  });

  it("stripeReference can be null (stub mode + pre-charge)", () => {
    expect(
      podPledgeSchema.safeParse({ ...valid, stripeReference: null }).success,
    ).toBe(true);
  });
});

// ── seed-data integrity ───────────────────────────────────

describe("nonprofits.json seed data integrity", () => {
  const nonprofits = nonprofitFileSchema.parse(nonprofitsRaw);

  it("parses without throwing", () => {
    expect(() => nonprofitFileSchema.parse(nonprofitsRaw)).not.toThrow();
  });

  it("has at least 10 entries (substrate seed)", () => {
    expect(nonprofits.length).toBeGreaterThanOrEqual(10);
  });

  it("includes entries from at least 3 countries", () => {
    const countries = new Set(nonprofits.map((n) => n.country));
    expect(countries.size).toBeGreaterThanOrEqual(3);
  });

  it("no duplicate ids", () => {
    const ids = new Set();
    for (const n of nonprofits) {
      expect(ids.has(n.id)).toBe(false);
      ids.add(n.id);
    }
  });

  it("every entry is marked verifiedByFounder=false (placeholder)", () => {
    // Real data lands at W48 founder-unlock; today everything is
    // placeholder so the W49 charge route refuses to fire on
    // unverified entries.
    for (const n of nonprofits) {
      expect(n.verifiedByFounder).toBe(false);
    }
  });
});
