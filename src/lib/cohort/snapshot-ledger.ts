/**
 * Cohort snapshot ledger (Y5 W2).
 *
 * Pure helpers for the periodic snapshots of segment counts.
 * The dashboard renders segment growth over time; the W3
 * retention curves consume the same ledger.
 *
 * Each snapshot captures the full {segment → count} map at
 * an ISO timestamp. The aggregator over the rolling window
 * produces the dashboard's "segment delta vs last week"
 * surface + the retention curve inputs.
 *
 * Pure / dependency-free.
 */

import {
  classifyEngagementTier,
  type EngagementTier,
  type UserCohortInput,
} from "./segmentation";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface CohortSnapshot {
  /** ISO timestamp the snapshot was taken. */
  capturedAt: string;
  /** Segment-key → user count at that moment. */
  segmentCounts: Readonly<Record<string, number>>;
  /** Tier-level totals (matches W1 totalsByTier shape). */
  tierTotals: Readonly<Record<EngagementTier, number>>;
}

export interface BuildSnapshotInput {
  users: ReadonlyArray<UserCohortInput>;
  capturedAt: Date;
}

/** Pure: build one snapshot from a user list. */
export function buildSnapshot(input: BuildSnapshotInput): CohortSnapshot {
  const segmentCounts: Record<string, number> = {};
  const tierTotals: Record<EngagementTier, number> = {
    dormant: 0,
    casual: 0,
    regular: 0,
    core: 0,
  };
  for (const u of input.users) {
    const tier = classifyEngagementTier(u.cooksLast28Days);
    tierTotals[tier] += 1;
    // Compose the same segment-key as buildSegmentLabel does
    // — kept inline to avoid the rebuild + extra Date parse.
    const first = new Date(u.firstCookAt);
    const acquisitionWeek = Number.isFinite(first.getTime())
      ? isoWeekKeyUtc(first)
      : "unknown";
    const key = `${acquisitionWeek}/${tier}`;
    segmentCounts[key] = (segmentCounts[key] ?? 0) + 1;
  }
  return {
    capturedAt: input.capturedAt.toISOString(),
    segmentCounts,
    tierTotals,
  };
}

// Internal: same algorithm as W1 isoWeekKey but inlined to
// keep the W2 module self-contained (avoids a circular import
// chain when the storage layer lands in W3).
function isoWeekKeyUtc(date: Date): string {
  const tmp = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(
    ((tmp.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7,
  );
  return `${tmp.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export interface TierTrendPoint {
  capturedAt: string;
  tierTotals: Readonly<Record<EngagementTier, number>>;
}

/** Pure: trend across a list of snapshots, sorted ascending
 *  by capturedAt. Used by the dashboard line chart. */
export function buildTierTrend(input: {
  snapshots: ReadonlyArray<CohortSnapshot>;
}): ReadonlyArray<TierTrendPoint> {
  return [...input.snapshots]
    .map((s) => ({ capturedAt: s.capturedAt, tierTotals: s.tierTotals }))
    .sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
}

export interface SegmentDelta {
  segmentKey: string;
  current: number;
  previous: number;
  delta: number;
}

/** Pure: per-segment delta between two snapshots. Useful for
 *  the dashboard's "this week vs last week" pill. */
export function diffSnapshots(input: {
  current: CohortSnapshot;
  previous: CohortSnapshot;
}): ReadonlyArray<SegmentDelta> {
  const keys = new Set([
    ...Object.keys(input.current.segmentCounts),
    ...Object.keys(input.previous.segmentCounts),
  ]);
  const deltas: SegmentDelta[] = [];
  for (const key of keys) {
    const cur = input.current.segmentCounts[key] ?? 0;
    const prev = input.previous.segmentCounts[key] ?? 0;
    deltas.push({
      segmentKey: key,
      current: cur,
      previous: prev,
      delta: cur - prev,
    });
  }
  // Sort by absolute delta desc — biggest movers first.
  return deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

/** Pure: pick the snapshot closest to (and at-or-before) the
 *  target time. Returns null when none are eligible. */
export function pickSnapshotAt(input: {
  snapshots: ReadonlyArray<CohortSnapshot>;
  at: Date;
}): CohortSnapshot | null {
  const target = input.at.getTime();
  let best: CohortSnapshot | null = null;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const snap of input.snapshots) {
    const ts = new Date(snap.capturedAt).getTime();
    if (!Number.isFinite(ts) || ts > target) continue;
    const delta = target - ts;
    if (delta < bestDelta) {
      bestDelta = delta;
      best = snap;
    }
  }
  return best;
}
