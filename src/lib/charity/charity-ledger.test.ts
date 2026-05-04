import { describe, expect, it } from "vitest";
import {
  aggregateCharityRaised,
  charityDayKey,
  estimateMonthlyRaisedMicroUsd,
  type CharityChargeEntry,
} from "./charity-ledger";

const baseEntry = (
  overrides: Partial<CharityChargeEntry> = {},
): CharityChargeEntry => ({
  id: "c-1",
  stripeChargeId: "ch_test_1",
  eventSlug: "spring-bake-sale-2026",
  nonprofitSlug: "no-kid-hungry",
  amountMicroUsd: 5_000_000, // $5
  chargedAt: "2026-05-03T10:00:00Z",
  status: "succeeded",
  ...overrides,
});

describe("charityDayKey", () => {
  it("returns YYYY-MM-DD", () => {
    expect(charityDayKey(new Date(2026, 4, 3, 10))).toBe("2026-05-03");
  });

  it("returns empty string for invalid dates", () => {
    expect(charityDayKey(new Date("nope"))).toBe("");
  });
});

describe("aggregateCharityRaised", () => {
  it("returns zero aggregate for empty input", () => {
    const result = aggregateCharityRaised({
      entries: [],
      now: new Date("2026-05-03T12:00:00Z"),
      lookbackDays: 7,
    });
    expect(result.totalCharges).toBe(0);
    expect(result.totalRaisedMicroUsd).toBe(0);
    expect(result.daily.length).toBe(8);
  });

  it("sums succeeded charges into raised total", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregateCharityRaised({
      entries: [
        baseEntry({ id: "1", amountMicroUsd: 5_000_000 }),
        baseEntry({ id: "2", amountMicroUsd: 7_500_000 }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(result.totalCharges).toBe(2);
    expect(result.totalRaisedMicroUsd).toBe(12_500_000);
  });

  it("counts refunded charges but excludes from raised total", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregateCharityRaised({
      entries: [
        baseEntry({ id: "1", amountMicroUsd: 5_000_000, status: "succeeded" }),
        baseEntry({ id: "2", amountMicroUsd: 5_000_000, status: "refunded" }),
        baseEntry({ id: "3", amountMicroUsd: 5_000_000, status: "pending" }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(result.totalCharges).toBe(3);
    expect(result.totalRaisedMicroUsd).toBe(5_000_000);
  });

  it("rolls up by event sorted by raised desc", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregateCharityRaised({
      entries: [
        baseEntry({ id: "1", eventSlug: "small", amountMicroUsd: 1_000_000 }),
        baseEntry({ id: "2", eventSlug: "big", amountMicroUsd: 10_000_000 }),
        baseEntry({ id: "3", eventSlug: "big", amountMicroUsd: 5_000_000 }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(result.byEvent[0].eventSlug).toBe("big");
    expect(result.byEvent[0].raisedMicroUsd).toBe(15_000_000);
    expect(result.byEvent[1].eventSlug).toBe("small");
  });

  it("rolls up by nonprofit", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregateCharityRaised({
      entries: [
        baseEntry({
          id: "1",
          nonprofitSlug: "feeding-america",
          amountMicroUsd: 5_000_000,
        }),
        baseEntry({
          id: "2",
          nonprofitSlug: "no-kid-hungry",
          amountMicroUsd: 7_000_000,
        }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(result.byNonprofit[0].nonprofitSlug).toBe("no-kid-hungry");
    expect(result.byNonprofit[0].raisedMicroUsd).toBe(7_000_000);
  });

  it("provides all three status buckets", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregateCharityRaised({
      entries: [
        baseEntry({ id: "1", status: "succeeded" }),
        baseEntry({ id: "2", status: "refunded" }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(
      result.byStatus.find((s) => s.status === "succeeded")?.chargeCount,
    ).toBe(1);
    expect(
      result.byStatus.find((s) => s.status === "refunded")?.chargeCount,
    ).toBe(1);
    expect(
      result.byStatus.find((s) => s.status === "pending")?.chargeCount,
    ).toBe(0);
  });

  it("excludes entries outside the lookback window", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregateCharityRaised({
      entries: [
        baseEntry({ id: "old", chargedAt: "2025-01-01T00:00:00Z" }),
        baseEntry({ id: "new", chargedAt: now.toISOString() }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(result.totalCharges).toBe(1);
  });
});

describe("estimateMonthlyRaisedMicroUsd", () => {
  it("returns 0 when fewer than 3 days have raises", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const burn = estimateMonthlyRaisedMicroUsd({
      entries: [baseEntry({ id: "1", chargedAt: now.toISOString() })],
      now,
    });
    expect(burn).toBe(0);
  });

  it("projects 30-day from 7-day window when sufficient data", () => {
    const now = new Date("2026-05-07T12:00:00Z");
    const entries: CharityChargeEntry[] = [
      baseEntry({
        id: "1",
        chargedAt: "2026-05-04T10:00:00Z",
        amountMicroUsd: 7_000_000,
      }),
      baseEntry({
        id: "2",
        chargedAt: "2026-05-05T10:00:00Z",
        amountMicroUsd: 7_000_000,
      }),
      baseEntry({
        id: "3",
        chargedAt: "2026-05-06T10:00:00Z",
        amountMicroUsd: 7_000_000,
      }),
      baseEntry({
        id: "4",
        chargedAt: "2026-05-07T10:00:00Z",
        amountMicroUsd: 7_000_000,
      }),
    ];
    const result = estimateMonthlyRaisedMicroUsd({ entries, now });
    // 4 days × $7 = $28. Projected: (28 * 30) / 7 = $120 → 120_000_000 micro.
    expect(result).toBe(120_000_000);
  });
});
