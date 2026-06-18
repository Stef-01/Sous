/**
 * Cohort accept-rate aggregation (the moat flywheel's payload, Round 5).
 *
 * Rolls the append-only pairing-outcome corpus into a per-slug accept rate that
 * the engine consumes as a gentle post-rank reblend. This is the structural fix
 * for WHY the V3 per-user trainer overfit: V3 reweighted from a single user's
 * ~8 cooks (tiny sample, high variance). This aggregates across ALL devices and
 * uses a Wilson lower bound + an impression floor, so a slug only earns a nudge
 * once enough people have genuinely accepted it.
 *
 * Pure + deterministic → fully unit-tested. Runs over LOCAL outcomes today
 * (a cohort-of-one, still useful) and over the SERVER corpus when POSTGRES_URL
 * is set (the real cross-user signal).
 */

import type { PairingOutcome } from "./pairing-outcomes";

/** Per-slug impression floor — below this, the nudge is exactly zero (a slug
 *  with 2 impressions and 1 pick does NOT get a 50% boost). Matches the
 *  discipline `trainer-retune.ts` already encodes (COHORT_MIN_COOKS=30). */
export const COHORT_MIN_IMPRESSIONS = 30;

export interface AcceptStat {
  /** accepted / shown, raw. */
  rate: number;
  /** impressions (shown count) — the confidence denominator. */
  n: number;
}

/**
 * Wilson score interval, lower bound. Penalizes small samples: 1/2 picks reads
 * far below 50/100 picks even at the same raw rate, so noise can't masquerade as
 * a loved dish. z=1.96 ≈ 95% confidence.
 */
export function wilsonLower(rate: number, n: number, z = 1.96): number {
  if (n <= 0) return 0;
  const p = Math.min(1, Math.max(0, rate));
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = p + z2 / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);
  return Math.max(0, (center - margin) / denom);
}

const ACCEPTED: ReadonlySet<string> = new Set(["picked", "cooked"]);

/**
 * Build the per-slug accept-rate map from the outcome corpus.
 *
 * accept rate = (# suggestionIds for the slug that reached picked OR cooked)
 *               ÷ (# suggestionIds for the slug that were shown).
 *
 * Counting DISTINCT suggestionIds (not raw rows) makes it refresh-loop-proof:
 * a slot shown twice or cooked-then-rated counts once. Slugs below the
 * impression floor are still returned (with their real n) so the consumer can
 * decide; the floor is applied at reblend time.
 */
export function buildAcceptRateMap(
  outcomes: readonly PairingOutcome[],
): Map<string, AcceptStat> {
  // slug → { shown: Set<suggestionId>, accepted: Set<suggestionId> }
  const bySlug = new Map<
    string,
    { shown: Set<string>; accepted: Set<string> }
  >();
  for (const o of outcomes) {
    if (!o.recipeSlug) continue;
    let e = bySlug.get(o.recipeSlug);
    if (!e) {
      e = { shown: new Set(), accepted: new Set() };
      bySlug.set(o.recipeSlug, e);
    }
    if (o.outcome === "shown") e.shown.add(o.suggestionId);
    if (ACCEPTED.has(o.outcome)) {
      e.accepted.add(o.suggestionId);
      // A pick/cook implies the slot was shown even if the `shown` row was
      // dropped from the ring buffer — count it so the rate denominator is sane.
      e.shown.add(o.suggestionId);
    }
  }
  const out = new Map<string, AcceptStat>();
  for (const [slug, e] of bySlug) {
    const n = e.shown.size;
    if (n === 0) continue;
    out.set(slug, { rate: e.accepted.size / n, n });
  }
  return out;
}
