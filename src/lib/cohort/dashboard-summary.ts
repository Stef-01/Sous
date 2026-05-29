/**
 * Cohort dashboard summary helper (Y5 W3).
 *
 * Pure: composes the W1 segmentation + W2 snapshot ledger
 * into the strip the cohort-internals dashboard renders.
 * Mirrors the Y4 W3 / W7 / W22 / W27 dashboard summary
 * pattern.
 *
 * Pure / dependency-free.
 */

import type { EngagementTier } from "./segmentation";
import { diffSnapshots, type CohortSnapshot } from "./snapshot-ledger";

export interface CohortDashboardSummary {
  /** Currently-most-recent snapshot timestamp; null when no
   *  snapshots have been captured. */
  latestCapturedAt: string | null;
  totalUsers: number;
  tierTotals: Record<EngagementTier, number>;
  /** Up to 5 biggest segment movers since the previous
   *  snapshot. Empty when fewer than 2 snapshots exist. */
  topMovers: ReadonlyArray<{
    segmentKey: string;
    delta: number;
    current: number;
    previous: number;
  }>;
  /** Per-tier delta (current minus previous). 0 when fewer
   *  than 2 snapshots. */
  tierDeltas: Record<EngagementTier, number>;
  /** Ratio of "engaged" (regular + core) to total. Returns 0
   *  when no users in the snapshot. */
  engagementRate: number;
}

const TIER_KEYS: ReadonlyArray<EngagementTier> = [
  "dormant",
  "casual",
  "regular",
  "core",
];

const EMPTY_TIER_RECORD: Record<EngagementTier, number> = {
  dormant: 0,
  casual: 0,
  regular: 0,
  core: 0,
};

export function summariseCohortDashboard(input: {
  snapshots: ReadonlyArray<CohortSnapshot>;
}): CohortDashboardSummary {
  if (input.snapshots.length === 0) {
    return {
      latestCapturedAt: null,
      totalUsers: 0,
      tierTotals: { ...EMPTY_TIER_RECORD },
      topMovers: [],
      tierDeltas: { ...EMPTY_TIER_RECORD },
      engagementRate: 0,
    };
  }
  // Pick latest + previous (sorted ascending by capturedAt).
  const sorted = [...input.snapshots].sort((a, b) =>
    a.capturedAt.localeCompare(b.capturedAt),
  );
  const latest = sorted[sorted.length - 1];
  const previous = sorted.length >= 2 ? sorted[sorted.length - 2] : undefined;

  const totalUsers = TIER_KEYS.reduce(
    (sum, tier) => sum + latest.tierTotals[tier],
    0,
  );
  const engagementRate =
    totalUsers > 0
      ? (latest.tierTotals.regular + latest.tierTotals.core) / totalUsers
      : 0;

  let topMovers: CohortDashboardSummary["topMovers"] = [];
  const tierDeltas: Record<EngagementTier, number> = { ...EMPTY_TIER_RECORD };
  if (previous) {
    const movers = diffSnapshots({ current: latest, previous });
    topMovers = movers.slice(0, 5);
    for (const tier of TIER_KEYS) {
      tierDeltas[tier] = latest.tierTotals[tier] - previous.tierTotals[tier];
    }
  }

  return {
    latestCapturedAt: latest.capturedAt,
    totalUsers,
    tierTotals: { ...latest.tierTotals },
    topMovers,
    tierDeltas,
    engagementRate,
  };
}
