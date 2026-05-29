/**
 * Pairing-engine V3 — per-dimension trainer.
 *
 * Y2 Sprint B W7. Reads the engine's ScoreBreakdown captured at
 * pick time (W6 persistence) for each completed cook + classifies
 * cooks as accepted vs rejected based on the session record.
 * For each dimension, computes the mean delta between accepted
 * and rejected scores — a positive delta means "the user
 * tends to pick sides scoring high on this dimension".
 *
 * Compared to V2 (Y1 W30):
 *   - V2 reads cuisineFamily / rating / favorite ONLY. Three
 *     coarse signals.
 *   - V3 reads the full ScoreBreakdown for each cooked side.
 *     Six per-dimension signals → measurably sharper trainer.
 *
 * Conservative knobs:
 *   - Cold-start threshold raised to 8 cooks-with-breakdowns
 *     (vs V2's 5 metadata cooks). Richer per-dim signal needs
 *     more samples to be trustworthy.
 *   - Per-dimension cap: ±0.10 (vs V2's ±0.05). Aggressive
 *     because the signal is causal (we're learning from picked
 *     vs not-picked) rather than correlational.
 *   - Floor at 0 per dimension; weights sum to 1 post-renorm.
 *
 * Pure / dependency-free.
 */

import { DEFAULT_WEIGHTS } from "./types";
import type { ScoreBreakdown } from "./types";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import type { UserWeights } from "./user-weight-trainer";

/** Minimum number of completed cooks WITH score breakdowns
 *  required before the V3 trainer departs from DEFAULT_WEIGHTS.
 *  Higher than V2's threshold because per-dimension signal
 *  needs more samples. */
export const V3_COLD_START_THRESHOLD = 8;

/** Maximum absolute weight delta any single dimension can take.
 *  ±0.10 — twice V2's cap. */
export const V3_MAX_DELTA = 0.1;

/** Minimum delta magnitude to apply a shift. Smaller deltas
 *  are noise floor — don't reweight on them. */
export const V3_NOISE_FLOOR = 0.05;

/** A cook session that has a breakdown attached. Narrowed type
 *  for trainer input. */
export interface BreakdownCook {
  rating?: number;
  favorite: boolean;
  feedback?: string;
  engineScoreBreakdown: ScoreBreakdown & { totalScore: number };
}

/** Pure helper: classify a cook session as accepted, rejected,
 *  or neutral. Exported for testing.
 *
 *  - Accepted: rating ≥ 4 OR favorite=true.
 *  - Rejected: rating ≤ 2 OR feedback in the "miss" bucket.
 *  - Neutral: everything else (no rating, mid rating, no
 *    feedback). Excluded from training.
 */
export function classifyCook(
  cook: BreakdownCook,
): "accepted" | "rejected" | "neutral" {
  if (cook.favorite) return "accepted";
  if (typeof cook.rating === "number") {
    if (cook.rating >= 4) return "accepted";
    if (cook.rating <= 2) return "rejected";
  }
  if (
    cook.feedback &&
    ["too-bland", "miss", "didnt-work"].includes(cook.feedback)
  ) {
    return "rejected";
  }
  return "neutral";
}

/** Filter a history of cooks into accepted / rejected lists.
 *  Neutral cooks dropped. */
export function extractAcceptedAndRejectedPairs(
  history: ReadonlyArray<BreakdownCook>,
): { accepted: BreakdownCook[]; rejected: BreakdownCook[] } {
  const accepted: BreakdownCook[] = [];
  const rejected: BreakdownCook[] = [];
  for (const cook of history) {
    const cls = classifyCook(cook);
    if (cls === "accepted") accepted.push(cook);
    else if (cls === "rejected") rejected.push(cook);
  }
  return { accepted, rejected };
}

/** Mean score on a single dimension across a list of cooks.
 *  Returns null when the list is empty (caller decides
 *  fallback). */
function meanDimension(
  cooks: ReadonlyArray<BreakdownCook>,
  dim: keyof ScoreBreakdown,
): number | null {
  if (cooks.length === 0) return null;
  let sum = 0;
  for (const c of cooks) sum += c.engineScoreBreakdown[dim] ?? 0;
  return sum / cooks.length;
}

/** Per-dimension delta between accepted + rejected pools.
 *  Positive value = user's accepted picks score higher on this
 *  dimension than their rejected picks; weight goes up.
 *  Negative = vice versa.
 *
 *  Returns 0 for any dimension where either pool is empty —
 *  no signal, no shift. */
export function perDimensionDelta(
  accepted: ReadonlyArray<BreakdownCook>,
  rejected: ReadonlyArray<BreakdownCook>,
): Partial<Record<keyof ScoreBreakdown, number>> {
  const dims: Array<keyof ScoreBreakdown> = [
    "cuisineFit",
    "flavorContrast",
    "nutritionBalance",
    "prepBurden",
    "temperature",
    "preference",
  ];
  const result: Partial<Record<keyof ScoreBreakdown, number>> = {};
  for (const dim of dims) {
    const a = meanDimension(accepted, dim);
    const r = meanDimension(rejected, dim);
    if (a === null || r === null) {
      result[dim] = 0;
    } else {
      result[dim] = a - r;
    }
  }
  return result;
}

/** Renormalise a weight vector so it sums to 1. Floors at 0
 *  per dimension. Falls back to DEFAULT_WEIGHTS on degenerate
 *  inputs (all-zero weights). */
function renormalise(weights: UserWeights): UserWeights {
  const keys = Object.keys(weights) as Array<keyof UserWeights>;
  let sum = 0;
  for (const k of keys) {
    if (weights[k] < 0) weights[k] = 0;
    sum += weights[k];
  }
  if (sum === 0) return { ...DEFAULT_WEIGHTS };
  const result = {} as UserWeights;
  for (const k of keys) {
    result[k] = weights[k] / sum;
  }
  return result;
}

/** Compose a UserWeights vector from per-dimension deltas.
 *
 *  Algorithm:
 *    1. Start with DEFAULT_WEIGHTS.
 *    2. For each dimension, if |delta| ≥ V3_NOISE_FLOOR, shift
 *       the weight by sign(delta) × min(|delta|, V3_MAX_DELTA).
 *    3. Floor any negative weight at 0.
 *    4. Renormalise so the vector sums to 1.
 */
export function composeV3WeightsFromDeltas(
  // Round-4-tolerant: seasonal + antiMonotony are now optional
  // dimensions. Trainer V3 ignores missing entries (treats them
  // as zero-delta).
  deltas: Partial<Record<keyof ScoreBreakdown, number>>,
): UserWeights {
  const w: UserWeights = { ...DEFAULT_WEIGHTS };
  const keys = Object.keys(w) as Array<keyof UserWeights>;
  for (const k of keys) {
    const d = deltas[k as keyof ScoreBreakdown] ?? 0;
    if (Math.abs(d) < V3_NOISE_FLOOR) continue;
    const shift = Math.sign(d) * Math.min(Math.abs(d), V3_MAX_DELTA);
    w[k] += shift;
  }
  return renormalise(w);
}

/** End-to-end V3 trainer. Given a history of cooks (with
 *  breakdowns), classifies → extracts deltas → composes
 *  weights. Cold-start safe — falls back to DEFAULT_WEIGHTS
 *  when there aren't enough breakdown-rich samples. */
export function trainUserWeightsV3(
  history: ReadonlyArray<BreakdownCook>,
): UserWeights {
  if (history.length < V3_COLD_START_THRESHOLD) {
    return { ...DEFAULT_WEIGHTS };
  }
  const { accepted, rejected } = extractAcceptedAndRejectedPairs(history);
  // Need at least 1 of each pool to compute meaningful deltas.
  if (accepted.length === 0 || rejected.length === 0) {
    return { ...DEFAULT_WEIGHTS };
  }
  const deltas = perDimensionDelta(accepted, rejected);
  return composeV3WeightsFromDeltas(deltas);
}

/** Pure narrower: turn a CookSessionRecord into a BreakdownCook
 *  if it has a breakdown attached, else null. Composes with
 *  `sessionsWithBreakdown` from W6 attach helper. */
export function asBreakdownCook(
  session: CookSessionRecord,
): BreakdownCook | null {
  if (
    !session.engineScoreBreakdown ||
    typeof session.engineScoreBreakdown !== "object"
  ) {
    return null;
  }
  return {
    rating: session.rating,
    favorite: session.favorite,
    feedback: session.feedback,
    engineScoreBreakdown: session.engineScoreBreakdown,
  };
}
