import { describe, expect, it } from "vitest";
import type { TrainerFeedbackAggregate } from "./trainer-feedback-log";
import {
  COHORT_MIN_COOKS,
  COHORT_PER_DIM_CAP,
  DEFAULT_COHORT_WEIGHTS,
  proposeCohortRetune,
} from "./trainer-retune";

const buildFeedback = (
  overrides: Partial<TrainerFeedbackAggregate> = {},
): TrainerFeedbackAggregate => ({
  totalShown: 100,
  totalCooked: 30,
  totalScheduled: 5,
  totalRerolled: 50,
  totalDismissed: 15,
  daily: [],
  byRank: [],
  byOutcome: [],
  dimensionDeltas: {
    cuisineFit: 0.15,
    flavorContrast: 0.05,
    nutritionBalance: 0,
    prepBurden: -0.05,
    temperatureComplement: 0,
    userPreference: 0.1,
  },
  ...overrides,
});

describe("proposeCohortRetune", () => {
  it("blocks under cold-start threshold", () => {
    const out = proposeCohortRetune({
      current: DEFAULT_COHORT_WEIGHTS,
      feedback: buildFeedback({ totalShown: COHORT_MIN_COOKS - 1 }),
    });
    expect(out.status).toBe("blocked-cold-start");
    expect(out.proposed).toEqual(out.current);
  });

  it("blocks when total dimension signal magnitude is below floor", () => {
    const out = proposeCohortRetune({
      current: DEFAULT_COHORT_WEIGHTS,
      feedback: buildFeedback({
        dimensionDeltas: {
          cuisineFit: 0.005,
          flavorContrast: 0.005,
          nutritionBalance: 0.005,
          prepBurden: 0.005,
          temperatureComplement: 0.005,
          userPreference: 0.005,
        },
      }),
    });
    expect(out.status).toBe("blocked-no-signal");
  });

  it("clamps per-dimension delta to the cap", () => {
    const out = proposeCohortRetune({
      current: DEFAULT_COHORT_WEIGHTS,
      feedback: buildFeedback({
        dimensionDeltas: {
          cuisineFit: 5, // way over cap
          flavorContrast: 0,
          nutritionBalance: 0,
          prepBurden: 0,
          temperatureComplement: 0,
          userPreference: 0,
        },
      }),
    });
    expect(out.status).toBe("ready");
    expect(out.deltas.cuisineFit).toBeCloseTo(COHORT_PER_DIM_CAP);
  });

  it("clamps negative delta to negative cap", () => {
    const out = proposeCohortRetune({
      current: DEFAULT_COHORT_WEIGHTS,
      feedback: buildFeedback({
        dimensionDeltas: {
          cuisineFit: -5,
          flavorContrast: 0,
          nutritionBalance: 0,
          prepBurden: 0,
          temperatureComplement: 0,
          userPreference: 0,
        },
      }),
    });
    expect(out.deltas.cuisineFit).toBeCloseTo(-COHORT_PER_DIM_CAP);
  });

  it("renormalises proposed weights to sum 1", () => {
    const out = proposeCohortRetune({
      current: DEFAULT_COHORT_WEIGHTS,
      feedback: buildFeedback(),
    });
    const sum =
      out.proposed.cuisineFit +
      out.proposed.flavorContrast +
      out.proposed.nutritionBalance +
      out.proposed.prepBurden +
      out.proposed.temperatureComplement +
      out.proposed.userPreference;
    expect(sum).toBeCloseTo(1, 5);
  });

  it("never produces a negative weight", () => {
    const out = proposeCohortRetune({
      current: { ...DEFAULT_COHORT_WEIGHTS, cuisineFit: 0.05 },
      feedback: buildFeedback({
        dimensionDeltas: {
          cuisineFit: -0.5, // would push below zero before clamp
          flavorContrast: 0,
          nutritionBalance: 0,
          prepBurden: 0,
          temperatureComplement: 0,
          userPreference: 0,
        },
      }),
    });
    expect(out.proposed.cuisineFit).toBeGreaterThanOrEqual(0);
  });

  it("returns ready with rationale when proposing", () => {
    const out = proposeCohortRetune({
      current: DEFAULT_COHORT_WEIGHTS,
      feedback: buildFeedback(),
    });
    expect(out.status).toBe("ready");
    expect(out.rationale).toMatch(/per-dim cap/i);
  });
});
