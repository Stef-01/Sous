/**
 * Charity dashboard summary helper (Y4 W7).
 *
 * Pure: shapes the W5 aggregate + W6 monthly projection into
 * the strip the W7 dashboard renders. Same pattern as the
 * Y4 W3 LLM-spend summary helper.
 */

import type { CharityRaisedAggregate } from "./charity-ledger";

export interface CharityDashboardSummary {
  today: { raisedMicroUsd: number; chargeCount: number };
  window: { raisedMicroUsd: number; chargeCount: number };
  /** Monthly raised projection in micro-USD. */
  monthlyMicroUsd: number;
  statuses: { succeeded: number; refunded: number; pending: number };
  /** Number of distinct events in the window. */
  eventCount: number;
  /** Number of distinct nonprofits in the window. */
  nonprofitCount: number;
}

export interface SummariseCharityInput {
  aggregate: CharityRaisedAggregate;
  todayKey: string;
  monthlyRaisedMicroUsd: number;
}

export function summariseCharityForDashboard(
  input: SummariseCharityInput,
): CharityDashboardSummary {
  const todayBucket = input.aggregate.daily.find(
    (d) => d.dayKey === input.todayKey,
  );
  return {
    today: {
      raisedMicroUsd: todayBucket?.raisedMicroUsd ?? 0,
      chargeCount: todayBucket?.chargeCount ?? 0,
    },
    window: {
      raisedMicroUsd: input.aggregate.totalRaisedMicroUsd,
      chargeCount: input.aggregate.totalCharges,
    },
    monthlyMicroUsd: input.monthlyRaisedMicroUsd,
    statuses: {
      succeeded:
        input.aggregate.byStatus.find((s) => s.status === "succeeded")
          ?.chargeCount ?? 0,
      refunded:
        input.aggregate.byStatus.find((s) => s.status === "refunded")
          ?.chargeCount ?? 0,
      pending:
        input.aggregate.byStatus.find((s) => s.status === "pending")
          ?.chargeCount ?? 0,
    },
    eventCount: input.aggregate.byEvent.length,
    nonprofitCount: input.aggregate.byNonprofit.length,
  };
}
