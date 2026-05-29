/**
 * Trainer drift evaluator (Y4 W27).
 *
 * Pure helpers for the eval harness + drift summary the Sprint
 * G dashboard surfaces. Two pieces:
 *   - evaluateRetuneDrift({before, after}) → diagnostic on
 *     how much the retune actually shifted the weight vector.
 *   - summariseDriftForDashboard({proposal, feedback}) →
 *     dashboard-ready bundle the W27 surface renders.
 *
 * Pure / dependency-free.
 */

import type { TrainerFeedbackAggregate } from "./trainer-feedback-log";
import type { CohortWeights, RetuneProposal } from "./trainer-retune";

export interface RetuneDriftReport {
  /** L1 distance ||proposed - current||_1 across 6 dims. */
  l1Distance: number;
  /** Largest per-dim absolute delta. */
  maxAbsoluteDelta: number;
  /** Which dimension moved the most. */
  topDriverDimension: keyof CohortWeights;
  /** Drift category for the dashboard chip. */
  category: "stable" | "minor" | "moderate" | "major";
}

const DIMENSION_KEYS: ReadonlyArray<keyof CohortWeights> = [
  "cuisineFit",
  "flavorContrast",
  "nutritionBalance",
  "prepBurden",
  "temperatureComplement",
  "userPreference",
];

/** Pure: compare a before/after weight pair. */
export function evaluateRetuneDrift(input: {
  before: CohortWeights;
  after: CohortWeights;
}): RetuneDriftReport {
  let l1 = 0;
  let maxAbs = 0;
  let topDriver: keyof CohortWeights = "cuisineFit";
  for (const dim of DIMENSION_KEYS) {
    const delta = Math.abs(input.after[dim] - input.before[dim]);
    l1 += delta;
    if (delta > maxAbs) {
      maxAbs = delta;
      topDriver = dim;
    }
  }
  let category: RetuneDriftReport["category"];
  if (l1 < 0.02) category = "stable";
  else if (l1 < 0.06) category = "minor";
  else if (l1 < 0.15) category = "moderate";
  else category = "major";
  return {
    l1Distance: l1,
    maxAbsoluteDelta: maxAbs,
    topDriverDimension: topDriver,
    category,
  };
}

export interface TrainerDriftSummary {
  status: RetuneProposal["status"];
  rationale: string;
  drift: RetuneDriftReport;
  cookRate: number | null;
  totalShown: number;
  totalCooked: number;
}

/** Pure: compose proposal + feedback into the dashboard bundle. */
export function summariseDriftForDashboard(input: {
  proposal: RetuneProposal;
  feedback: TrainerFeedbackAggregate;
}): TrainerDriftSummary {
  const drift = evaluateRetuneDrift({
    before: input.proposal.current,
    after: input.proposal.proposed,
  });
  const cookRate =
    input.feedback.totalShown === 0
      ? null
      : input.feedback.totalCooked / input.feedback.totalShown;
  return {
    status: input.proposal.status,
    rationale: input.proposal.rationale,
    drift,
    cookRate,
    totalShown: input.feedback.totalShown,
    totalCooked: input.feedback.totalCooked,
  };
}
