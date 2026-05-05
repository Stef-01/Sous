/**
 * Cohort-aware pod matcher — Sprint G (Y5 W25–W28).
 *
 * Pure helper that ranks candidate pods for a user joining
 * Community for the first time. Composition:
 *   - Y5 W1 cohort segmentation (`buildSegmentLabel`) gives
 *     us the user's (acquisition week, engagement tier) pair.
 *   - Each candidate pod carries an aggregate cohort summary
 *     — its members' modal engagement tier + median acquisition
 *     week — which the matcher compares to the user's.
 *   - Output: ranked list with per-pod match scores in [0, 1]
 *     and a 1-line "why" string for the suggestion chip.
 *
 * The match function is intentionally simple: engagement-tier
 * agreement is worth most (people pair best with peers cooking
 * at a similar cadence), acquisition-week proximity is a soft
 * tiebreaker, dietary-flag compatibility is a hard floor.
 *
 * Pure / dependency-free / deterministic.
 */

import type { EngagementTier, SegmentLabel } from "@/lib/cohort/segmentation";

export interface PodCohortSummary {
  /** Stable pod id — passed back in the result so the UI can
   *  link straight into the pod join flow. */
  podId: string;
  /** Display name for the suggestion chip. */
  name: string;
  /** Number of members currently in the pod. */
  memberCount: number;
  /** Modal (most-common) engagement tier across members. */
  modalEngagementTier: EngagementTier;
  /** Median ISO week the members joined Sous (e.g.
   *  "2026-W14"). Acts as the "vintage" of the pod. */
  medianAcquisitionWeek: string;
  /** Pod-level dietary flags (union of members'). The user's
   *  flags must be a subset of this for the pod to be a fit. */
  dietaryFlags: ReadonlyArray<string>;
  /** True iff the pod is below member capacity and accepting
   *  joins. */
  acceptingMembers: boolean;
}

export interface UserCohortHints {
  /** The user's segmentation label. */
  segment: SegmentLabel;
  /** Diet flags the user has set (e.g. "vegetarian",
   *  "gluten-free"). Empty array = no constraints. */
  dietaryFlags: ReadonlyArray<string>;
}

export interface PodSuggestion {
  podId: string;
  name: string;
  memberCount: number;
  /** Match score in [0, 1]. */
  score: number;
  /** One-line "why we suggested this" copy. */
  reason: string;
}

/**
 * Pure: rank pods for a user. Pods that fail the dietary-flag
 * floor are dropped entirely; the remainder are scored by
 * engagement-tier match (max 0.6) + acquisition-week proximity
 * (max 0.3) + capacity bonus (max 0.1).
 *
 * Stable tie-break: input pod order.
 */
export function suggestPodsForUser(input: {
  user: UserCohortHints;
  pods: ReadonlyArray<PodCohortSummary>;
  limit?: number;
}): PodSuggestion[] {
  const limit = Math.max(1, Math.floor(input.limit ?? 3));
  const scored: Array<PodSuggestion & { _idx: number }> = [];

  input.pods.forEach((pod, idx) => {
    if (!pod.acceptingMembers) return;
    if (!dietaryFloor({ user: input.user, pod })) return;
    const tierScore = scoreEngagementTier({
      user: input.user.segment.engagementTier,
      pod: pod.modalEngagementTier,
    });
    const weekScore = scoreAcquisitionWeek({
      user: input.user.segment.acquisitionWeek,
      pod: pod.medianAcquisitionWeek,
    });
    const capacityScore = pod.memberCount < 8 ? 0.1 : 0;
    const total = clamp01(tierScore + weekScore + capacityScore);
    scored.push({
      podId: pod.id ?? pod.podId,
      name: pod.name,
      memberCount: pod.memberCount,
      score: total,
      reason: buildReason({
        user: input.user.segment,
        pod,
        tierScore,
        weekScore,
      }),
      _idx: idx,
    });
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a._idx - b._idx;
  });

  return scored.slice(0, limit).map(({ _idx, ...rest }) => {
    void _idx;
    return rest;
  });
}

// ── Scoring components ───────────────────────────────────────

const TIER_INDEX: Record<EngagementTier, number> = {
  dormant: 0,
  casual: 1,
  regular: 2,
  core: 3,
};

/** Pure: tier-match score. Same tier = 0.6; one-step away =
 *  0.3; two steps = 0.1; three+ = 0. */
export function scoreEngagementTier(input: {
  user: EngagementTier;
  pod: EngagementTier;
}): number {
  const dist = Math.abs(TIER_INDEX[input.user] - TIER_INDEX[input.pod]);
  if (dist === 0) return 0.6;
  if (dist === 1) return 0.3;
  if (dist === 2) return 0.1;
  return 0;
}

/** Pure: acquisition-week proximity. Same week = 0.3; within
 *  4 weeks = 0.2; within 12 weeks = 0.1; beyond = 0. */
export function scoreAcquisitionWeek(input: {
  user: string;
  pod: string;
}): number {
  const u = parseWeekOrdinal(input.user);
  const p = parseWeekOrdinal(input.pod);
  if (u === null || p === null) return 0;
  const dist = Math.abs(u - p);
  if (dist === 0) return 0.3;
  if (dist <= 4) return 0.2;
  if (dist <= 12) return 0.1;
  return 0;
}

function parseWeekOrdinal(weekKey: string): number | null {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekKey);
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  if (!Number.isFinite(year) || !Number.isFinite(week)) return null;
  return year * 53 + week;
}

/** Pure: dietary fit — the user's flags must be a subset of
 *  the pod's flags. Empty user-flags always pass. */
function dietaryFloor(input: {
  user: UserCohortHints;
  pod: PodCohortSummary;
}): boolean {
  if (input.user.dietaryFlags.length === 0) return true;
  const podSet = new Set(input.pod.dietaryFlags.map((f) => f.toLowerCase()));
  return input.user.dietaryFlags.every((f) => podSet.has(f.toLowerCase()));
}

function buildReason(input: {
  user: SegmentLabel;
  pod: PodCohortSummary;
  tierScore: number;
  weekScore: number;
}): string {
  const tier = input.pod.modalEngagementTier;
  if (input.tierScore >= 0.6) {
    return `Other ${tier} cooks like you`;
  }
  if (input.weekScore >= 0.2) {
    return `Pod started around the same time you did`;
  }
  if (input.pod.memberCount < 4) {
    return `Small pod, room to lead`;
  }
  return `Open pod with a similar cooking rhythm`;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

// `id` is what the existing PodState carries; expose `podId`
// alias on the input for forward-compat.
declare module "./cohort-pod-matcher" {
  interface PodCohortSummary {
    id?: string;
  }
}
