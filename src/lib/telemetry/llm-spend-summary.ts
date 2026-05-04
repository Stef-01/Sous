/**
 * LLM-spend dashboard summary helper (Y4 W3).
 *
 * Pure: shapes the W1 aggregate + W2 monthly projection into
 * the strip the W3 dashboard card renders. Lifting the lookups
 * here keeps the card a thin presenter + lets us test the
 * data shape without renderer setup.
 */

import type { SpendAggregate } from "./llm-spend";

export interface LlmSpendDashboardSummary {
  today: { costMicroUsd: number; callCount: number };
  window: { costMicroUsd: number; callCount: number };
  /** Monthly burn projection in micro-USD. 0 when too few days
   *  of data accumulated. */
  monthlyMicroUsd: number;
  outcomes: { ok: number; error: number; rejected: number };
}

export interface SummariseInput {
  aggregate: SpendAggregate;
  /** ISO YYYY-MM-DD of "today" so the today bucket lookup is
   *  deterministic in tests. */
  todayKey: string;
  monthlyBurnMicroUsd: number;
}

export function summariseLlmSpendForDashboard(
  input: SummariseInput,
): LlmSpendDashboardSummary {
  const todayBucket = input.aggregate.daily.find(
    (d) => d.dayKey === input.todayKey,
  );
  return {
    today: {
      costMicroUsd: todayBucket?.costMicroUsd ?? 0,
      callCount: todayBucket?.callCount ?? 0,
    },
    window: {
      costMicroUsd: input.aggregate.totalCostMicroUsd,
      callCount: input.aggregate.totalCalls,
    },
    monthlyMicroUsd: input.monthlyBurnMicroUsd,
    outcomes: {
      ok:
        input.aggregate.byOutcome.find((o) => o.outcome === "ok")?.callCount ??
        0,
      error:
        input.aggregate.byOutcome.find((o) => o.outcome === "error")
          ?.callCount ?? 0,
      rejected:
        input.aggregate.byOutcome.find((o) => o.outcome === "rejected")
          ?.callCount ?? 0,
    },
  };
}
