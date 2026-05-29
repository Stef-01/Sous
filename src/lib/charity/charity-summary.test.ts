import { describe, expect, it } from "vitest";
import type { CharityRaisedAggregate } from "./charity-ledger";
import { summariseCharityForDashboard } from "./charity-summary";

const empty: CharityRaisedAggregate = {
  totalCharges: 0,
  totalRaisedMicroUsd: 0,
  daily: [],
  byEvent: [],
  byNonprofit: [],
  byStatus: [
    { status: "succeeded", chargeCount: 0 },
    { status: "refunded", chargeCount: 0 },
    { status: "pending", chargeCount: 0 },
  ],
};

const populated: CharityRaisedAggregate = {
  totalCharges: 25,
  totalRaisedMicroUsd: 125_000_000,
  daily: [
    {
      dayKey: "2026-05-03",
      chargeCount: 10,
      raisedMicroUsd: 50_000_000,
    },
  ],
  byEvent: [
    {
      eventSlug: "spring-bake-sale",
      chargeCount: 25,
      raisedMicroUsd: 125_000_000,
    },
  ],
  byNonprofit: [
    {
      nonprofitSlug: "no-kid-hungry",
      chargeCount: 25,
      raisedMicroUsd: 125_000_000,
    },
  ],
  byStatus: [
    { status: "succeeded", chargeCount: 22 },
    { status: "refunded", chargeCount: 1 },
    { status: "pending", chargeCount: 2 },
  ],
};

describe("summariseCharityForDashboard", () => {
  it("returns zeros for empty aggregate", () => {
    const out = summariseCharityForDashboard({
      aggregate: empty,
      todayKey: "2026-05-03",
      monthlyRaisedMicroUsd: 0,
    });
    expect(out.today.raisedMicroUsd).toBe(0);
    expect(out.window.raisedMicroUsd).toBe(0);
    expect(out.statuses).toEqual({
      succeeded: 0,
      refunded: 0,
      pending: 0,
    });
    expect(out.eventCount).toBe(0);
    expect(out.nonprofitCount).toBe(0);
  });

  it("pulls today bucket when matching", () => {
    const out = summariseCharityForDashboard({
      aggregate: populated,
      todayKey: "2026-05-03",
      monthlyRaisedMicroUsd: 500_000_000,
    });
    expect(out.today.raisedMicroUsd).toBe(50_000_000);
    expect(out.today.chargeCount).toBe(10);
    expect(out.window.raisedMicroUsd).toBe(125_000_000);
    expect(out.monthlyMicroUsd).toBe(500_000_000);
    expect(out.eventCount).toBe(1);
    expect(out.nonprofitCount).toBe(1);
  });

  it("treats missing today bucket as zero", () => {
    const out = summariseCharityForDashboard({
      aggregate: populated,
      todayKey: "2099-12-31",
      monthlyRaisedMicroUsd: 0,
    });
    expect(out.today.raisedMicroUsd).toBe(0);
    expect(out.today.chargeCount).toBe(0);
  });

  it("extracts status counts in fixed three-bucket shape", () => {
    const out = summariseCharityForDashboard({
      aggregate: populated,
      todayKey: "2026-05-03",
      monthlyRaisedMicroUsd: 0,
    });
    expect(out.statuses.succeeded).toBe(22);
    expect(out.statuses.refunded).toBe(1);
    expect(out.statuses.pending).toBe(2);
  });

  it("defaults missing status buckets to zero", () => {
    const partial: CharityRaisedAggregate = {
      ...empty,
      byStatus: [{ status: "succeeded", chargeCount: 5 }],
    };
    const out = summariseCharityForDashboard({
      aggregate: partial,
      todayKey: "2026-05-03",
      monthlyRaisedMicroUsd: 0,
    });
    expect(out.statuses).toEqual({
      succeeded: 5,
      refunded: 0,
      pending: 0,
    });
  });
});
