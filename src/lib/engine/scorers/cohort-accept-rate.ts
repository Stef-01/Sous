/**
 * Cohort accept-rate signal (the moat flywheel reblend, Round 3).
 *
 * A gentle, tie-break-tier nudge from the cross-user accept rate: a side that
 * people genuinely pick and cook (above the impression floor) drifts up a slot;
 * it can never hijack the plate. This is the engine's consumption of the
 * pairing-outcome corpus — the only part of the recommendation stack that gets
 * *uncopiable with scale*, because a competitor can copy the rules but not the
 * accept-rate data.
 *
 * Centred on the candidate's own base score below the floor, so a slug with too
 * few impressions gets exactly zero nudge (not penalized for lack of data).
 */

import {
  COHORT_MIN_IMPRESSIONS,
  wilsonLower,
  type AcceptStat,
} from "@/lib/engine/cohort-accept-aggregate";

/** Tie-break-tier weight (matches CONTEXT_FIT_WEIGHT) — surfaces a loved side
 *  from rank 4→3, never a ranking override. */
export const COHORT_ACCEPT_WEIGHT = 0.06;

export interface CohortAcceptContext {
  /** slug → { rate, n } from buildAcceptRateMap (local or server corpus). */
  acceptRateBySlug: Map<string, AcceptStat>;
}

/**
 * The 0–1 signal for one candidate. Above the impression floor it's the Wilson
 * lower bound of the accept rate; below the floor it returns `base` so the
 * blended score is unchanged (zero nudge for cold slugs).
 */
export function scoreCohortAccept(
  slug: string,
  ctx: CohortAcceptContext,
  base: number,
): number {
  const e = ctx.acceptRateBySlug.get(slug);
  if (!e || e.n < COHORT_MIN_IMPRESSIONS) return base;
  return wilsonLower(e.rate, e.n);
}
