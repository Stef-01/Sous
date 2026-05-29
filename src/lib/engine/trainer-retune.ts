/**
 * V3 trainer cohort + retune contract (Y4 W26).
 *
 * Pure helpers that compose the W25 feedback log into a
 * weight-update proposal. The retune itself runs offline
 * (founder-gated; needs real cohort data) — this module is
 * the deterministic transformation that takes "feedback
 * deltas + minimum sample threshold" → "proposed weight
 * updates + diagnostic signals".
 *
 * Same rate-limit posture as the V3 trainer (Y2 W7): per-
 * dimension cap of ±0.10 per cycle to prevent oscillation;
 * cohort minimum of 30 cooks-with-feedback for a retune to
 * fire (raised from V3's 8-cook personal threshold because
 * cohort retune affects all users).
 *
 * Pure / dependency-free.
 */

import type { TrainerFeedbackAggregate } from "./trainer-feedback-log";

export const COHORT_MIN_COOKS = 30;
export const COHORT_PER_DIM_CAP = 0.1;

export interface CohortWeights {
  cuisineFit: number;
  flavorContrast: number;
  nutritionBalance: number;
  prepBurden: number;
  temperatureComplement: number;
  userPreference: number;
}

export const DEFAULT_COHORT_WEIGHTS: CohortWeights = {
  cuisineFit: 0.2,
  flavorContrast: 0.2,
  nutritionBalance: 0.15,
  prepBurden: 0.15,
  temperatureComplement: 0.1,
  userPreference: 0.2,
};

export type RetuneStatus = "ready" | "blocked-cold-start" | "blocked-no-signal";

export interface RetuneProposal {
  status: RetuneStatus;
  /** Why we are or aren't proposing a retune. */
  rationale: string;
  /** Current weights (input). */
  current: CohortWeights;
  /** Proposed weights. Equal to current when status != "ready". */
  proposed: CohortWeights;
  /** Per-dim delta applied (proposed - current). */
  deltas: CohortWeights;
}

/** Pure: clamp value to [-cap, cap]. */
function clampDelta(value: number, cap: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-cap, Math.min(cap, value));
}

/** Pure: renormalise weights so they sum to 1. Falls back to
 *  the input when the sum collapses to zero. */
function renormaliseWeights(w: CohortWeights): CohortWeights {
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

export interface ProposeRetuneInput {
  current: CohortWeights;
  feedback: TrainerFeedbackAggregate;
}

/** Pure: produce a retune proposal. Returns blocked status
 *  when sample size is below threshold. */
export function proposeCohortRetune(input: ProposeRetuneInput): RetuneProposal {
  const empty: CohortWeights = {
    cuisineFit: 0,
    flavorContrast: 0,
    nutritionBalance: 0,
    prepBurden: 0,
    temperatureComplement: 0,
    userPreference: 0,
  };

  if (input.feedback.totalShown < COHORT_MIN_COOKS) {
    return {
      status: "blocked-cold-start",
      rationale: `Cohort needs ${COHORT_MIN_COOKS} cooks-with-feedback; have ${input.feedback.totalShown}.`,
      current: input.current,
      proposed: input.current,
      deltas: empty,
    };
  }

  const totalSignal =
    Math.abs(input.feedback.dimensionDeltas.cuisineFit) +
    Math.abs(input.feedback.dimensionDeltas.flavorContrast) +
    Math.abs(input.feedback.dimensionDeltas.nutritionBalance) +
    Math.abs(input.feedback.dimensionDeltas.prepBurden) +
    Math.abs(input.feedback.dimensionDeltas.temperatureComplement) +
    Math.abs(input.feedback.dimensionDeltas.userPreference);

  if (totalSignal < 0.05) {
    return {
      status: "blocked-no-signal",
      rationale: `Per-dimension delta magnitude ${totalSignal.toFixed(3)} below 0.05 floor.`,
      current: input.current,
      proposed: input.current,
      deltas: empty,
    };
  }

  // Apply clamped delta per dimension; renormalise.
  const deltas: CohortWeights = {
    cuisineFit: clampDelta(
      input.feedback.dimensionDeltas.cuisineFit,
      COHORT_PER_DIM_CAP,
    ),
    flavorContrast: clampDelta(
      input.feedback.dimensionDeltas.flavorContrast,
      COHORT_PER_DIM_CAP,
    ),
    nutritionBalance: clampDelta(
      input.feedback.dimensionDeltas.nutritionBalance,
      COHORT_PER_DIM_CAP,
    ),
    prepBurden: clampDelta(
      input.feedback.dimensionDeltas.prepBurden,
      COHORT_PER_DIM_CAP,
    ),
    temperatureComplement: clampDelta(
      input.feedback.dimensionDeltas.temperatureComplement,
      COHORT_PER_DIM_CAP,
    ),
    userPreference: clampDelta(
      input.feedback.dimensionDeltas.userPreference,
      COHORT_PER_DIM_CAP,
    ),
  };

  // Float weights up by delta, never below 0.
  const raw: CohortWeights = {
    cuisineFit: Math.max(0, input.current.cuisineFit + deltas.cuisineFit),
    flavorContrast: Math.max(
      0,
      input.current.flavorContrast + deltas.flavorContrast,
    ),
    nutritionBalance: Math.max(
      0,
      input.current.nutritionBalance + deltas.nutritionBalance,
    ),
    prepBurden: Math.max(0, input.current.prepBurden + deltas.prepBurden),
    temperatureComplement: Math.max(
      0,
      input.current.temperatureComplement + deltas.temperatureComplement,
    ),
    userPreference: Math.max(
      0,
      input.current.userPreference + deltas.userPreference,
    ),
  };
  const proposed = renormaliseWeights(raw);

  return {
    status: "ready",
    rationale: `Cohort signal magnitude ${totalSignal.toFixed(3)} above floor; per-dim cap ±${COHORT_PER_DIM_CAP}.`,
    current: input.current,
    proposed,
    deltas,
  };
}
