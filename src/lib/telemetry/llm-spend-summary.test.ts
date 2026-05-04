import { describe, expect, it } from "vitest";
import type { SpendAggregate } from "./llm-spend";
import { summariseLlmSpendForDashboard } from "./llm-spend-summary";

const empty: SpendAggregate = {
  totalCalls: 0,
  totalTokens: 0,
  totalCostMicroUsd: 0,
  daily: [],
  bySurface: [],
  byOutcome: [
    { outcome: "ok", callCount: 0 },
    { outcome: "error", callCount: 0 },
    { outcome: "rejected", callCount: 0 },
  ],
};

const populated: SpendAggregate = {
  totalCalls: 42,
  totalTokens: 12_000,
  totalCostMicroUsd: 4_500_000,
  daily: [
    {
      dayKey: "2026-05-01",
      callCount: 5,
      tokensBilled: 1_000,
      costMicroUsd: 500_000,
    },
    {
      dayKey: "2026-05-02",
      callCount: 17,
      tokensBilled: 5_000,
      costMicroUsd: 2_000_000,
    },
    {
      dayKey: "2026-05-03",
      callCount: 20,
      tokensBilled: 6_000,
      costMicroUsd: 2_000_000,
    },
  ],
  bySurface: [],
  byOutcome: [
    { outcome: "ok", callCount: 40 },
    { outcome: "error", callCount: 1 },
    { outcome: "rejected", callCount: 1 },
  ],
};

describe("summariseLlmSpendForDashboard", () => {
  it("returns zeros for empty aggregate", () => {
    const out = summariseLlmSpendForDashboard({
      aggregate: empty,
      todayKey: "2026-05-03",
      monthlyBurnMicroUsd: 0,
    });
    expect(out.today.costMicroUsd).toBe(0);
    expect(out.today.callCount).toBe(0);
    expect(out.window.costMicroUsd).toBe(0);
    expect(out.window.callCount).toBe(0);
    expect(out.monthlyMicroUsd).toBe(0);
    expect(out.outcomes).toEqual({ ok: 0, error: 0, rejected: 0 });
  });

  it("pulls today's bucket when matching key exists", () => {
    const out = summariseLlmSpendForDashboard({
      aggregate: populated,
      todayKey: "2026-05-03",
      monthlyBurnMicroUsd: 20_000_000,
    });
    expect(out.today.costMicroUsd).toBe(2_000_000);
    expect(out.today.callCount).toBe(20);
  });

  it("treats today as zero when no bucket matches", () => {
    const out = summariseLlmSpendForDashboard({
      aggregate: populated,
      todayKey: "2099-12-31",
      monthlyBurnMicroUsd: 0,
    });
    expect(out.today.costMicroUsd).toBe(0);
    expect(out.today.callCount).toBe(0);
  });

  it("passes through window total + monthly projection", () => {
    const out = summariseLlmSpendForDashboard({
      aggregate: populated,
      todayKey: "2026-05-03",
      monthlyBurnMicroUsd: 20_000_000,
    });
    expect(out.window.costMicroUsd).toBe(4_500_000);
    expect(out.window.callCount).toBe(42);
    expect(out.monthlyMicroUsd).toBe(20_000_000);
  });

  it("extracts outcome counts in the fixed three-bucket shape", () => {
    const out = summariseLlmSpendForDashboard({
      aggregate: populated,
      todayKey: "2026-05-03",
      monthlyBurnMicroUsd: 0,
    });
    expect(out.outcomes.ok).toBe(40);
    expect(out.outcomes.error).toBe(1);
    expect(out.outcomes.rejected).toBe(1);
  });

  it("defaults missing outcome buckets to zero", () => {
    const partial: SpendAggregate = {
      ...empty,
      byOutcome: [{ outcome: "ok", callCount: 7 }],
    };
    const out = summariseLlmSpendForDashboard({
      aggregate: partial,
      todayKey: "2026-05-03",
      monthlyBurnMicroUsd: 0,
    });
    expect(out.outcomes).toEqual({ ok: 7, error: 0, rejected: 0 });
  });
});
