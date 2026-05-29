/**
 * Cohort segmentation pure helper (Y5 W1).
 *
 * Bucket users into (acquisition cohort × engagement tier)
 * pairs so the Y5 retention analytics + V4 cohort retune +
 * editorial-targeting dashboards have a stable segment label
 * to pivot on.
 *
 * Two axes:
 *   - Acquisition cohort: ISO YYYY-Www of the user's first
 *     cook (or first session if Postgres-mode user table is
 *     live). Stable for the user's lifetime.
 *   - Engagement tier: cooks-in-last-28d bucket. Drifts as
 *     the user's behaviour changes.
 *
 * The pair-label drives downstream rollups. Pure / dependency-
 * free / deterministic.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export type EngagementTier = "dormant" | "casual" | "regular" | "core";

export interface SegmentationInput {
  /** ISO timestamp of the user's first cook. */
  firstCookAt: string;
  /** Number of cooks in the trailing 28-day window. */
  cooksLast28Days: number;
}

export interface SegmentLabel {
  /** ISO 8601 week key — "2026-W19". */
  acquisitionWeek: string;
  /** Engagement tier as of `now`. */
  engagementTier: EngagementTier;
  /** Composite label for cohort dashboards. */
  segmentKey: string;
}

/** Pure: ISO 8601 week key from a Date. Same algorithm as the
 *  Y3 W23 meal-plan isoWeekKey to keep keys aligned across
 *  surfaces. */
export function isoWeekKey(date: Date): string {
  if (!Number.isFinite(date.getTime())) return "";
  // ISO 8601: weeks start Monday; W01 contains Jan 4.
  // Use UTC getters so callers passing ISO timestamps get
  // week-keys aligned to the timestamp's date, not the
  // local-zone-shifted date.
  const tmp = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayNum = tmp.getUTCDay() || 7; // Sunday→7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(
    ((tmp.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7,
  );
  return `${tmp.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/** Pure: classify cook count into a tier. Thresholds chosen
 *  to map roughly to Sous's product expectations:
 *    - dormant: 0 cooks in 28d (lapsed)
 *    - casual:  1-3 cooks (occasional user)
 *    - regular: 4-11 cooks (~1x / week or more)
 *    - core:    12+ cooks (~3x / week — power user) */
export function classifyEngagementTier(
  cooksLast28Days: number,
): EngagementTier {
  if (cooksLast28Days <= 0) return "dormant";
  if (cooksLast28Days <= 3) return "casual";
  if (cooksLast28Days <= 11) return "regular";
  return "core";
}

/** Pure: build the full segment label. */
export function buildSegmentLabel(input: SegmentationInput): SegmentLabel {
  const first = new Date(input.firstCookAt);
  const acquisitionWeek = Number.isFinite(first.getTime())
    ? isoWeekKey(first)
    : "unknown";
  const engagementTier = classifyEngagementTier(input.cooksLast28Days);
  return {
    acquisitionWeek,
    engagementTier,
    segmentKey: `${acquisitionWeek}/${engagementTier}`,
  };
}

export interface UserCohortInput {
  userId: string;
  firstCookAt: string;
  cooksLast28Days: number;
}

export interface CohortRollup {
  acquisitionWeek: string;
  engagementTier: EngagementTier;
  segmentKey: string;
  userCount: number;
}

/** Pure: roll a list of user-segmentation inputs up into per-
 *  segment counts. */
export function rollupCohorts(input: {
  users: ReadonlyArray<UserCohortInput>;
}): ReadonlyArray<CohortRollup> {
  const map = new Map<string, CohortRollup>();
  for (const u of input.users) {
    const label = buildSegmentLabel({
      firstCookAt: u.firstCookAt,
      cooksLast28Days: u.cooksLast28Days,
    });
    const existing = map.get(label.segmentKey);
    if (existing) {
      existing.userCount += 1;
    } else {
      map.set(label.segmentKey, {
        acquisitionWeek: label.acquisitionWeek,
        engagementTier: label.engagementTier,
        segmentKey: label.segmentKey,
        userCount: 1,
      });
    }
  }
  // Sort by acquisitionWeek descending then tier order.
  const tierOrder: Record<EngagementTier, number> = {
    core: 0,
    regular: 1,
    casual: 2,
    dormant: 3,
  };
  return Array.from(map.values()).sort((a, b) => {
    if (a.acquisitionWeek !== b.acquisitionWeek) {
      return b.acquisitionWeek.localeCompare(a.acquisitionWeek);
    }
    return tierOrder[a.engagementTier] - tierOrder[b.engagementTier];
  });
}

/** Pure: per-tier total across the entire user base. Drives
 *  the dashboard headline numbers. */
export function totalsByTier(input: {
  users: ReadonlyArray<UserCohortInput>;
}): Record<EngagementTier, number> {
  const totals: Record<EngagementTier, number> = {
    dormant: 0,
    casual: 0,
    regular: 0,
    core: 0,
  };
  for (const u of input.users) {
    const tier = classifyEngagementTier(u.cooksLast28Days);
    totals[tier] += 1;
  }
  return totals;
}
