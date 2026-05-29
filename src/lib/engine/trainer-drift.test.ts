import { describe, expect, it } from "vitest";
import type { TrainerFeedbackAggregate } from "./trainer-feedback-log";
import type { CohortWeights, RetuneProposal } from "./trainer-retune";
import { DEFAULT_COHORT_WEIGHTS } from "./trainer-retune";
import {
  evaluateRetuneDrift,
  summariseDriftForDashboard,
} from "./trainer-drift";

const emptyDeltas: CohortWeights = {
  cuisineFit: 0,
  flavorContrast: 0,
  nutritionBalance: 0,
  prepBurden: 0,
  temperatureComplement: 0,
  userPreference: 0,
};

const emptyFeedback: TrainerFeedbackAggregate = {
  totalShown: 0,
  totalCooked: 0,
  totalScheduled: 0,
  totalRerolled: 0,
  totalDismissed: 0,
  daily: [],
  byRank: [],
  byOutcome: [],
  dimensionDeltas: {
    cuisineFit: 0,
    flavorContrast: 0,
    nutritionBalance: 0,
    prepBurden: 0,
    temperatureComplement: 0,
    userPreference: 0,
  },
};

describe("evaluateRetuneDrift", () => {
  it("zero L1 when before == after → category stable", () => {
    const out = evaluateRetuneDrift({
      before: DEFAULT_COHORT_WEIGHTS,
      after: DEFAULT_COHORT_WEIGHTS,
    });
    expect(out.l1Distance).toBe(0);
    expect(out.maxAbsoluteDelta).toBe(0);
    expect(out.category).toBe("stable");
  });

  it("classifies minor drift (0.02 <= L1 < 0.06)", () => {
    const after = { ...DEFAULT_COHORT_WEIGHTS, cuisineFit: 0.23 }; // delta 0.03
    const out = evaluateRetuneDrift({
      before: DEFAULT_COHORT_WEIGHTS,
      after,
    });
    expect(out.category).toBe("minor");
  });

  it("classifies moderate drift (0.06 <= L1 < 0.15)", () => {
    const after = { ...DEFAULT_COHORT_WEIGHTS, cuisineFit: 0.3 }; // delta 0.10
    const out = evaluateRetuneDrift({
      before: DEFAULT_COHORT_WEIGHTS,
      after,
    });
    expect(out.category).toBe("moderate");
  });

  it("classifies major drift (L1 >= 0.15)", () => {
    const after = { ...DEFAULT_COHORT_WEIGHTS, cuisineFit: 0.4 }; // delta 0.20
    const out = evaluateRetuneDrift({
      before: DEFAULT_COHORT_WEIGHTS,
      after,
    });
    expect(out.category).toBe("major");
  });

  it("identifies the top-driver dimension", () => {
    const after = {
      ...DEFAULT_COHORT_WEIGHTS,
      flavorContrast: DEFAULT_COHORT_WEIGHTS.flavorContrast + 0.08,
    };
    const out = evaluateRetuneDrift({
      before: DEFAULT_COHORT_WEIGHTS,
      after,
    });
    expect(out.topDriverDimension).toBe("flavorContrast");
  });
});

describe("summariseDriftForDashboard", () => {
  it("returns null cookRate when no shown entries", () => {
    const proposal: RetuneProposal = {
      status: "blocked-cold-start",
      rationale: "Need more data.",
      current: DEFAULT_COHORT_WEIGHTS,
      proposed: DEFAULT_COHORT_WEIGHTS,
      deltas: emptyDeltas,
    };
    const out = summariseDriftForDashboard({
      proposal,
      feedback: emptyFeedback,
    });
    expect(out.cookRate).toBeNull();
    expect(out.status).toBe("blocked-cold-start");
  });

  it("computes cookRate from feedback", () => {
    const proposal: RetuneProposal = {
      status: "ready",
      rationale: "Has signal.",
      current: DEFAULT_COHORT_WEIGHTS,
      proposed: DEFAULT_COHORT_WEIGHTS,
      deltas: emptyDeltas,
    };
    const out = summariseDriftForDashboard({
      proposal,
      feedback: { ...emptyFeedback, totalShown: 10, totalCooked: 3 },
    });
    expect(out.cookRate).toBe(0.3);
  });

  it("propagates the drift category from before/after", () => {
    const after: CohortWeights = {
      ...DEFAULT_COHORT_WEIGHTS,
      cuisineFit: 0.4,
    };
    const proposal: RetuneProposal = {
      status: "ready",
      rationale: "x",
      current: DEFAULT_COHORT_WEIGHTS,
      proposed: after,
      deltas: emptyDeltas,
    };
    const out = summariseDriftForDashboard({
      proposal,
      feedback: emptyFeedback,
    });
    expect(out.drift.category).toBe("major");
  });
});
