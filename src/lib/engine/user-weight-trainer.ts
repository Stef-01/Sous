/**
 * Pairing-engine V2 — per-user weight vector trained client-side.
 *
 * W30 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint F W29-W31
 * pairing-engine V2). Replaces the W6-era hand-tuned
 * `DEFAULT_WEIGHTS` with a small, conservative trainer that
 * nudges the dimension weights based on observable cook-history
 * signals.
 *
 * Design principles:
 *
 * 1. **Cold-start safe.** Below `COLD_START_THRESHOLD` cooks, the
 *    trainer returns `DEFAULT_WEIGHTS` unchanged. New users
 *    never see a degraded ranking.
 *
 * 2. **Conservative.** Each signal can only nudge a single
 *    dimension by ≤ `MAX_DELTA`. The output is then renormalised
 *    so the weights still sum to 1. Even at the extremes the
 *    user can't end up with a dimension weight beyond ~0.35,
 *    which keeps the engine's behaviour bounded.
 *
 * 3. **Pure / dependency-free.** No React, no localStorage. The
 *    persistence layer (`useUserWeights`) is a thin shell around
 *    this trainer.
 *
 * 4. **Catalog-free.** Signals come from `CookSessionRecord`
 *    fields only — cuisineFamily, rating, favorite. The trainer
 *    does NOT touch the side-dish catalog so it stays unit-
 *    testable without seed-data fixtures.
 *
 * Future revisions (V3+) can fold per-dimension scores from each
 * pairing into the signal set; that requires the engine to
 * persist its score breakdown alongside the cook session, which
 * is a bigger change deferred for a later sprint.
 */

import { DEFAULT_WEIGHTS } from "./types";
import type { ScoreBreakdown } from "./types";

export type UserWeights = Record<keyof ScoreBreakdown, number>;

/** Minimum number of completed cooks before the trainer departs
 *  from `DEFAULT_WEIGHTS`. Below this we have too little signal
 *  to trust. */
export const COLD_START_THRESHOLD = 5;

/** Maximum absolute weight delta any single signal can apply.
 *  Three signals run today, each capped at this value, so a fully
 *  saturated user shifts their distribution by at most 0.15
 *  before renormalisation. */
export const MAX_DELTA = 0.05;

/** Cooked-cuisine fraction above which the user is treated as
 *  "consistent" — boost `cuisineFit`. Half of a user's cooks
 *  in one cuisine is a strong enough signal. */
export const CUISINE_CONSISTENCY_THRESHOLD = 0.5;

/** Rated-≥4 fraction (of cooks-with-a-rating) above which the
 *  user is treated as "picky / high-bar" — boost `preference`. */
export const HIGH_RATING_THRESHOLD = 0.7;

/** Favorite fraction (of all completed cooks) above which the
 *  user is treated as "self-curating" — also boost `preference`,
 *  capped by MAX_DELTA so the two preference signals don't
 *  compound past the single-dimension cap. */
export const FAVORITE_THRESHOLD = 0.3;

/** Subset of `CookSessionRecord` the trainer reads. Defining it
 *  locally keeps the engine independent of the hook's exported
 *  type so engine tests don't have to import React. */
export interface TrainerCookRecord {
  /** ISO timestamp; only sessions with completedAt are counted. */
  completedAt?: string;
  cuisineFamily: string;
  rating?: number;
  favorite: boolean;
}

interface TrainerSignals {
  cuisineConsistency: number;
  highRatingRate: number;
  favoriteRate: number;
  totalCooks: number;
}

/** Build the raw signal numbers from a cook history. Exported
 *  for unit-testing the signal layer without going through the
 *  full trainer. */
export function deriveSignals(
  history: ReadonlyArray<TrainerCookRecord>,
): TrainerSignals {
  const completed = history.filter((h) => typeof h.completedAt === "string");
  const totalCooks = completed.length;
  if (totalCooks === 0) {
    return {
      cuisineConsistency: 0,
      highRatingRate: 0,
      favoriteRate: 0,
      totalCooks: 0,
    };
  }

  const cuisineCounts = new Map<string, number>();
  let favoriteCount = 0;
  let ratedCount = 0;
  let highRatedCount = 0;

  for (const c of completed) {
    cuisineCounts.set(
      c.cuisineFamily,
      (cuisineCounts.get(c.cuisineFamily) ?? 0) + 1,
    );
    if (c.favorite) favoriteCount += 1;
    if (typeof c.rating === "number") {
      ratedCount += 1;
      if (c.rating >= 4) highRatedCount += 1;
    }
  }

  let topCuisineCount = 0;
  for (const count of cuisineCounts.values()) {
    if (count > topCuisineCount) topCuisineCount = count;
  }

  return {
    cuisineConsistency: topCuisineCount / totalCooks,
    highRatingRate: ratedCount > 0 ? highRatedCount / ratedCount : 0,
    favoriteRate: favoriteCount / totalCooks,
    totalCooks,
  };
}

/** Renormalise a weight vector so it sums to 1. Defends against
 *  numeric drift during the apply-deltas-then-normalise step. */
function renormalise(weights: UserWeights): UserWeights {
  const sum = Object.values(weights).reduce((s, v) => s + v, 0);
  if (sum === 0) return { ...DEFAULT_WEIGHTS };
  const result = {} as UserWeights;
  for (const key of Object.keys(weights) as Array<keyof ScoreBreakdown>) {
    result[key] = weights[key] / sum;
  }
  return result;
}

/**
 * Train a user weight vector from cook history.
 *
 * Algorithm:
 *   1. If completed cooks < COLD_START_THRESHOLD → return defaults.
 *   2. Apply at most three deltas:
 *      - cuisineConsistency > threshold → +MAX_DELTA on cuisineFit,
 *        offset by -MAX_DELTA spread evenly across the other 5 dims.
 *      - highRatingRate > threshold → +MAX_DELTA on preference, offset.
 *      - favoriteRate > threshold → +MAX_DELTA on preference, offset.
 *   3. Renormalise so weights sum to 1.
 */
export function trainUserWeights(
  history: ReadonlyArray<TrainerCookRecord>,
): UserWeights {
  const signals = deriveSignals(history);
  if (signals.totalCooks < COLD_START_THRESHOLD) {
    return { ...DEFAULT_WEIGHTS };
  }

  const w: UserWeights = { ...DEFAULT_WEIGHTS };
  const allKeys = Object.keys(DEFAULT_WEIGHTS) as Array<keyof ScoreBreakdown>;

  function bump(dim: keyof ScoreBreakdown) {
    const offset = MAX_DELTA / (allKeys.length - 1);
    w[dim] += MAX_DELTA;
    for (const key of allKeys) {
      if (key !== dim) w[key] -= offset;
    }
  }

  if (signals.cuisineConsistency > CUISINE_CONSISTENCY_THRESHOLD) {
    bump("cuisineFit");
  }
  if (signals.highRatingRate > HIGH_RATING_THRESHOLD) {
    bump("preference");
  }
  if (signals.favoriteRate > FAVORITE_THRESHOLD) {
    bump("preference");
  }

  // Floor any drift to 0 (no negative weights in the engine
  // contract) and renormalise.
  for (const key of allKeys) {
    if (w[key] < 0) w[key] = 0;
  }
  return renormalise(w);
}
