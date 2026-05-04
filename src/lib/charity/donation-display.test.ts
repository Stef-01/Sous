import { describe, expect, it } from "vitest";
import {
  YEAR_BADGE_MIN_MINOR,
  aggregateYearlyDonations,
  formatMoneyMinor,
  formatWeeklyDonationLine,
  formatYearIdentityBadge,
  type YearTotalEntry,
} from "./donation-display";

// ── formatMoneyMinor ──────────────────────────────────────

describe("formatMoneyMinor", () => {
  it("USD whole-dollar amounts", () => {
    const out = formatMoneyMinor(2000, "USD");
    expect(out).toContain("20");
    expect(out).toContain("$");
  });

  it("USD cents amounts", () => {
    const out = formatMoneyMinor(2050, "USD");
    expect(out).toContain("20.50");
  });

  it("GBP", () => {
    expect(formatMoneyMinor(1500, "GBP")).toMatch(/£/);
  });

  it("0 → 0-shaped output", () => {
    const out = formatMoneyMinor(0, "USD");
    expect(out).toContain("0");
  });

  it("negative → falls back to 0", () => {
    const out = formatMoneyMinor(-100, "USD");
    expect(out).toContain("0");
  });

  it("NaN → falls back to 0", () => {
    expect(formatMoneyMinor(Number.NaN, "USD")).toBeTruthy();
  });
});

// ── formatWeeklyDonationLine ──────────────────────────────

describe("formatWeeklyDonationLine", () => {
  it("happy path with non-zero amount + nonprofit name", () => {
    const out = formatWeeklyDonationLine({
      amountMinor: 3600,
      currency: "USD",
      nonprofitName: "Sample Charity",
    });
    expect(out).toContain("$36");
    expect(out).toContain("Sample Charity");
    expect(out.toLowerCase()).toContain("raised");
  });

  it("0 amount + nonprofit → 'Pledge active' with name", () => {
    const out = formatWeeklyDonationLine({
      amountMinor: 0,
      currency: "USD",
      nonprofitName: "Sample Charity",
    });
    expect(out).toContain("Sample Charity");
    expect(out.toLowerCase()).toContain("pledge active");
    expect(out).not.toContain("$0");
  });

  it("missing nonprofit name → fallback copy", () => {
    const out = formatWeeklyDonationLine({
      amountMinor: 0,
      currency: "USD",
      nonprofitName: "",
    });
    expect(out.toLowerCase()).toContain("pledge active");
  });

  it("trims whitespace in nonprofit name", () => {
    const out = formatWeeklyDonationLine({
      amountMinor: 1000,
      currency: "USD",
      nonprofitName: "  Sample  ",
    });
    expect(out).toContain("Sample");
    expect(out).not.toContain("  Sample  ");
  });
});

// ── aggregateYearlyDonations ──────────────────────────────

describe("aggregateYearlyDonations", () => {
  const charges: YearTotalEntry[] = [
    {
      chargedAt: "2026-03-15T00:00:00Z",
      amountMinor: 1000,
      currency: "USD",
    },
    {
      chargedAt: "2026-06-20T00:00:00Z",
      amountMinor: 2000,
      currency: "USD",
    },
    {
      chargedAt: "2026-08-01T00:00:00Z",
      amountMinor: 500,
      currency: "EUR",
    },
    {
      chargedAt: "2025-12-31T00:00:00Z",
      amountMinor: 9999,
      currency: "USD",
    },
    {
      chargedAt: "not-a-date",
      amountMinor: 100,
      currency: "USD",
    },
  ];

  it("sums charges in the given year by currency", () => {
    const out = aggregateYearlyDonations(charges, 2026);
    expect(out.USD).toBe(3000);
    expect(out.EUR).toBe(500);
  });

  it("excludes charges from other years", () => {
    expect(aggregateYearlyDonations(charges, 2025).USD).toBe(9999);
  });

  it("ignores invalid timestamps", () => {
    const out = aggregateYearlyDonations(charges, 2026);
    // 100 minor with bad date does NOT contribute
    expect(out.USD).toBe(3000);
  });

  it("ignores 0 / negative / NaN amounts", () => {
    const charges2: YearTotalEntry[] = [
      {
        chargedAt: "2026-01-01T00:00:00Z",
        amountMinor: 0,
        currency: "USD",
      },
      {
        chargedAt: "2026-02-01T00:00:00Z",
        amountMinor: -100,
        currency: "USD",
      },
      {
        chargedAt: "2026-03-01T00:00:00Z",
        amountMinor: Number.NaN,
        currency: "USD",
      },
    ];
    expect(aggregateYearlyDonations(charges2, 2026)).toEqual({});
  });

  it("empty charges → empty record", () => {
    expect(aggregateYearlyDonations([], 2026)).toEqual({});
  });
});

// ── formatYearIdentityBadge ───────────────────────────────

describe("formatYearIdentityBadge", () => {
  it("below threshold → null (no identity claim)", () => {
    expect(
      formatYearIdentityBadge({
        totalsByCurrency: { USD: YEAR_BADGE_MIN_MINOR - 1 },
        year: 2026,
      }),
    ).toBeNull();
  });

  it("at threshold → badge fires", () => {
    const out = formatYearIdentityBadge({
      totalsByCurrency: { USD: YEAR_BADGE_MIN_MINOR },
      year: 2026,
    });
    expect(out).not.toBeNull();
    expect(out).toContain("2026");
  });

  it("above threshold → badge with formatted money", () => {
    const out = formatYearIdentityBadge({
      totalsByCurrency: { USD: 12000 },
      year: 2026,
    });
    expect(out).toContain("$120");
    expect(out).toContain("2026");
  });

  it("multi-currency → mentions dominant + count", () => {
    const out = formatYearIdentityBadge({
      totalsByCurrency: { USD: 20000, EUR: 6000 },
      year: 2026,
    });
    expect(out).toContain("USD");
    expect(out).toContain("2 currencies");
  });

  it("empty totals → null", () => {
    expect(
      formatYearIdentityBadge({ totalsByCurrency: {}, year: 2026 }),
    ).toBeNull();
  });

  it("YEAR_BADGE_MIN_MINOR is 5000 (≈ $50)", () => {
    expect(YEAR_BADGE_MIN_MINOR).toBe(5000);
  });
});
