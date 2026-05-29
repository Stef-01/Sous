/**
 * V4 trainer — temporal recency-weighted cohort retune (Y5 W5).
 *
 * Builds on the Y4 W26 cohort retune by adding two refinements:
 *   1. Recency weighting: more-recent feedback entries count more
 *      than older entries inside the lookback window. Half-life
 *      defaults to 14 days (older-than-half-life entries weigh
 *      <50%).
 *   2. Per-segment vectors: instead of one cohort-wide weight
 *      vector, the trainer produces a {segmentKey →
 *      weight-vector} map so the engine can pick a personalised
 *      starting point for the user's segment.
 *
 * Pure / dependency-free / deterministic.
 */

import type { TrainerFeedbackEntry } from "./trainer-feedback-log";
import {
  COHORT_PER_DIM_CAP,
  DEFAULT_COHORT_WEIGHTS,
  type CohortWeights,
} from "./trainer-retune";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface V4TrainerInput {
  /** Feedback entries (W25 shape) for the cohort. */
  entries: ReadonlyArray<TrainerFeedbackEntry>;
  /** Caller's "now" reference. */
  now: Date;
  /** Half-life for the recency decay (in days). After this
   *  many days, an entry's weight is 0.5. Default 14d. */
  halfLifeDays?: number;
  /** Lookback window for the entries to include (days). Older
   *  entries are dropped entirely. Default 60d. */
  lookbackDays?: number;
  /** Per-entry segment-key resolver. The hosting layer maps
   *  recipeSlug + user state to the W1 segmentKey. Returns
   *  null for entries that can't be segmented; those land in
   *  the "all" bucket only. */
  segmentResolver?: (entry: TrainerFeedbackEntry) => string | null;
  /** Starting weight vector. Defaults to W26
   *  DEFAULT_COHORT_WEIGHTS. */
  baseWeights?: CohortWeights;
}

export interface V4Proposal {
  /** Per-segment weight vector. Always includes the "all"
   *  bucket as a fallback. */
  perSegment: Record<string, CohortWeights>;
  /** Diagnostic: per-segment effective sample size after
   *  recency weighting. */
  perSegmentEffectiveN: Record<string, number>;
  /** Half-life used for the calc. */
  halfLifeDays: number;
}

const DIMENSION_KEYS = [
  "cuisineFit",
  "flavorContrast",
  "nutritionBalance",
  "prepBurden",
  "temperatureComplement",
  "userPreference",
] as const;

/** Pure: compute the recency weight for an entry's age. Uses
 *  exponential decay so weight = 0.5 ^ (age / halfLife). */
export function recencyWeight(input: {
  ageDays: number;
  halfLifeDays: number;
}): number {
  if (input.halfLifeDays <= 0) return 1;
  if (!Number.isFinite(input.ageDays) || input.ageDays < 0) return 1;
  return Math.pow(0.5, input.ageDays / input.halfLifeDays);
}

/** Pure: clamp delta to ±cap. */
function clampDelta(value: number, cap: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-cap, Math.min(cap, value));
}

/** Pure: renormalise a weight vector to sum=1. */
function renormalise(w: CohortWeights): CohortWeights {
  const sum =
    w.cuisineFit +
    w.flavorContrast +
    w.nutritionBalance +
    w.prepBurden +
    w.temperatureComplement +
    w.userPreference;
  if (sum <= 0) return w;
  return {
    cuisineFit: w.cuisineFit / sum,
    flavorContrast: w.flavorContrast / sum,
    nutritionBalance: w.nutritionBalance / sum,
    prepBurden: w.prepBurden / sum,
    temperatureComplement: w.temperatureComplement / sum,
    userPreference: w.userPreference / sum,
  };
}

interface BucketAccumulator {
  cookedSum: Record<(typeof DIMENSION_KEYS)[number], number>;
  rerolledSum: Record<(typeof DIMENSION_KEYS)[number], number>;
  cookedWeight: number;
  rerolledWeight: number;
}

function emptyAcc(): BucketAccumulator {
  return {
    cookedSum: {
      cuisineFit: 0,
      flavorContrast: 0,
      nutritionBalance: 0,
      prepBurden: 0,
      temperatureComplement: 0,
      userPreference: 0,
    },
    rerolledSum: {
      cuisineFit: 0,
      flavorContrast: 0,
      nutritionBalance: 0,
      prepBurden: 0,
      temperatureComplement: 0,
      userPreference: 0,
    },
    cookedWeight: 0,
    rerolledWeight: 0,
  };
}

function applyDeltas(
  base: CohortWeights,
  acc: BucketAccumulator,
): CohortWeights {
  if (acc.cookedWeight === 0 || acc.rerolledWeight === 0) {
    return { ...base };
  }
  const raw: CohortWeights = { ...base };
  for (const dim of DIMENSION_KEYS) {
    const cookedMean = acc.cookedSum[dim] / acc.cookedWeight;
    const rerolledMean = acc.rerolledSum[dim] / acc.rerolledWeight;
    const delta = clampDelta(cookedMean - rerolledMean, COHORT_PER_DIM_CAP);
    raw[dim] = Math.max(0, base[dim] + delta);
  }
  return renormalise(raw);
}

/** Pure: build the V4 per-segment weight proposal. */
export function buildV4Proposal(input: V4TrainerInput): V4Proposal {
  const halfLifeDays = input.halfLifeDays ?? 14;
  const lookbackDays = input.lookbackDays ?? 60;
  const base = input.baseWeights ?? DEFAULT_COHORT_WEIGHTS;
  const cutoff = input.now.getTime() - lookbackDays * DAY_MS;

  const buckets = new Map<string, BucketAccumulator>();
  const ensureBucket = (key: string): BucketAccumulator => {
    let b = buckets.get(key);
    if (!b) {
      b = emptyAcc();
      buckets.set(key, b);
    }
    return b;
  };

  for (const e of input.entries) {
    const ts = new Date(e.capturedAt).getTime();
    if (!Number.isFinite(ts) || ts < cutoff || ts > input.now.getTime())
      continue;
    if (e.outcome !== "cooked" && e.outcome !== "rerolled") continue;
    const ageDays = (input.now.getTime() - ts) / DAY_MS;
    const weight = recencyWeight({ ageDays, halfLifeDays });

    const segmentKey = input.segmentResolver?.(e) ?? null;
    const targets = ["all"];
    if (segmentKey) targets.push(segmentKey);
    for (const target of targets) {
      const bucket = ensureBucket(target);
      if (e.outcome === "cooked") {
        bucket.cookedWeight += weight;
        for (const dim of DIMENSION_KEYS) {
          bucket.cookedSum[dim] += e.dimensions[dim] * weight;
        }
      } else {
        bucket.rerolledWeight += weight;
        for (const dim of DIMENSION_KEYS) {
          bucket.rerolledSum[dim] += e.dimensions[dim] * weight;
        }
      }
    }
  }

  // Always include "all" bucket even when no entries.
  if (!buckets.has("all")) buckets.set("all", emptyAcc());

  const perSegment: Record<string, CohortWeights> = {};
  const perSegmentEffectiveN: Record<string, number> = {};
  for (const [key, acc] of buckets) {
    perSegment[key] = applyDeltas(base, acc);
    perSegmentEffectiveN[key] = acc.cookedWeight + acc.rerolledWeight;
  }

  return {
    perSegment,
    perSegmentEffectiveN,
    halfLifeDays,
  };
}

/** Pure: pick the per-segment weights for a user. Falls back
 *  to "all" when the segment isn't in the proposal. */
export function pickSegmentWeights(input: {
  proposal: V4Proposal;
  segmentKey: string | null;
}): CohortWeights {
  if (input.segmentKey && input.proposal.perSegment[input.segmentKey]) {
    return input.proposal.perSegment[input.segmentKey];
  }
  return input.proposal.perSegment.all ?? DEFAULT_COHORT_WEIGHTS;
}
