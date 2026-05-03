import { describe, expect, it } from "vitest";
import {
  V3_COLD_START_THRESHOLD,
  V3_MAX_DELTA,
  V3_NOISE_FLOOR,
  asBreakdownCook,
  classifyCook,
  composeV3WeightsFromDeltas,
  extractAcceptedAndRejectedPairs,
  perDimensionDelta,
  trainUserWeightsV3,
  type BreakdownCook,
} from "./user-weight-trainer-v3";
import { DEFAULT_WEIGHTS } from "./types";
import type { ScoreBreakdown } from "./types";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

function fixtureBreakdown(
  over: Partial<ScoreBreakdown> = {},
): ScoreBreakdown & { totalScore: number } {
  return {
    cuisineFit: 0.5,
    flavorContrast: 0.5,
    nutritionBalance: 0.5,
    prepBurden: 0.5,
    temperature: 0.5,
    preference: 0.5,
    totalScore: 0.5,
    ...over,
  };
}

function fixtureCook(over: Partial<BreakdownCook> = {}): BreakdownCook {
  return {
    rating: 5,
    favorite: false,
    engineScoreBreakdown: fixtureBreakdown(),
    ...over,
  };
}

// ── classifyCook ───────────────────────────────────────────

describe("classifyCook", () => {
  it("favorite=true → accepted regardless of rating", () => {
    expect(classifyCook(fixtureCook({ favorite: true, rating: 1 }))).toBe(
      "accepted",
    );
  });

  it("rating ≥ 4 → accepted", () => {
    expect(classifyCook(fixtureCook({ rating: 4 }))).toBe("accepted");
    expect(classifyCook(fixtureCook({ rating: 5 }))).toBe("accepted");
  });

  it("rating ≤ 2 → rejected", () => {
    expect(classifyCook(fixtureCook({ rating: 1 }))).toBe("rejected");
    expect(classifyCook(fixtureCook({ rating: 2 }))).toBe("rejected");
  });

  it("rating 3 → neutral (no signal)", () => {
    expect(classifyCook(fixtureCook({ rating: 3 }))).toBe("neutral");
  });

  it("no rating + no favorite + no feedback → neutral", () => {
    expect(
      classifyCook(fixtureCook({ rating: undefined, favorite: false })),
    ).toBe("neutral");
  });

  it("feedback in 'miss' bucket → rejected", () => {
    expect(
      classifyCook(fixtureCook({ rating: undefined, feedback: "too-bland" })),
    ).toBe("rejected");
    expect(
      classifyCook(fixtureCook({ rating: undefined, feedback: "miss" })),
    ).toBe("rejected");
  });

  it("unknown feedback string → neutral", () => {
    expect(
      classifyCook(fixtureCook({ rating: undefined, feedback: "spicy" })),
    ).toBe("neutral");
  });
});

// ── extractAcceptedAndRejectedPairs ────────────────────────

describe("extractAcceptedAndRejectedPairs", () => {
  it("partitions into the three buckets, drops neutral", () => {
    const cooks: BreakdownCook[] = [
      fixtureCook({ rating: 5 }),
      fixtureCook({ rating: 1 }),
      fixtureCook({ rating: 3 }),
      fixtureCook({ favorite: true, rating: 2 }),
    ];
    const { accepted, rejected } = extractAcceptedAndRejectedPairs(cooks);
    expect(accepted).toHaveLength(2); // 5 + favorite
    expect(rejected).toHaveLength(1); // 1
  });

  it("empty history → empty arrays", () => {
    const out = extractAcceptedAndRejectedPairs([]);
    expect(out.accepted).toEqual([]);
    expect(out.rejected).toEqual([]);
  });
});

// ── perDimensionDelta ──────────────────────────────────────

describe("perDimensionDelta", () => {
  it("computes mean(accepted) - mean(rejected) per dim", () => {
    const accepted = [
      fixtureCook({
        engineScoreBreakdown: fixtureBreakdown({ cuisineFit: 0.9 }),
      }),
      fixtureCook({
        engineScoreBreakdown: fixtureBreakdown({ cuisineFit: 0.7 }),
      }),
    ];
    const rejected = [
      fixtureCook({
        engineScoreBreakdown: fixtureBreakdown({ cuisineFit: 0.3 }),
      }),
    ];
    const deltas = perDimensionDelta(accepted, rejected);
    expect(deltas.cuisineFit).toBeCloseTo(0.5);
  });

  it("returns 0 for every dim when accepted pool is empty", () => {
    const out = perDimensionDelta(
      [],
      [fixtureCook({ engineScoreBreakdown: fixtureBreakdown() })],
    );
    expect(out.cuisineFit).toBe(0);
    expect(out.preference).toBe(0);
  });

  it("returns 0 for every dim when rejected pool is empty", () => {
    const out = perDimensionDelta(
      [fixtureCook({ engineScoreBreakdown: fixtureBreakdown() })],
      [],
    );
    expect(out.cuisineFit).toBe(0);
  });

  it("supports negative deltas (rejected scores higher)", () => {
    const accepted = [
      fixtureCook({
        engineScoreBreakdown: fixtureBreakdown({ prepBurden: 0.2 }),
      }),
    ];
    const rejected = [
      fixtureCook({
        engineScoreBreakdown: fixtureBreakdown({ prepBurden: 0.8 }),
      }),
    ];
    expect(perDimensionDelta(accepted, rejected).prepBurden).toBeCloseTo(-0.6);
  });
});

// ── composeV3WeightsFromDeltas ─────────────────────────────

describe("composeV3WeightsFromDeltas", () => {
  it("sub-noise-floor deltas leave weights at default", () => {
    const deltas = {
      cuisineFit: 0.01,
      flavorContrast: 0.02,
      nutritionBalance: 0.03,
      prepBurden: 0.04,
      temperature: 0.04,
      preference: 0.04,
    };
    const w = composeV3WeightsFromDeltas(deltas);
    expect(w).toEqual(DEFAULT_WEIGHTS);
  });

  it("a positive supra-noise delta nudges that dim up", () => {
    const deltas = {
      cuisineFit: 0.2, // capped at MAX_DELTA = 0.10
      flavorContrast: 0,
      nutritionBalance: 0,
      prepBurden: 0,
      temperature: 0,
      preference: 0,
    };
    const w = composeV3WeightsFromDeltas(deltas);
    expect(w.cuisineFit).toBeGreaterThan(DEFAULT_WEIGHTS.cuisineFit);
  });

  it("respects the MAX_DELTA cap (no dim moves more than 0.10 raw)", () => {
    const deltas = {
      cuisineFit: 5,
      flavorContrast: 0,
      nutritionBalance: 0,
      prepBurden: 0,
      temperature: 0,
      preference: 0,
    };
    const w = composeV3WeightsFromDeltas(deltas);
    // Raw cap is 0.10; renormalise will still bring weights to
    // sum to 1. Just assert the cuisineFit weight is inside a
    // sane range — not 5x the default.
    expect(w.cuisineFit).toBeLessThan(0.5);
    expect(w.cuisineFit).toBeGreaterThan(DEFAULT_WEIGHTS.cuisineFit);
  });

  it("output sums to 1 (renormalised)", () => {
    const deltas = {
      cuisineFit: 0.3,
      flavorContrast: -0.2,
      nutritionBalance: 0.15,
      prepBurden: -0.1,
      temperature: 0.1,
      preference: 0.05,
    };
    const w = composeV3WeightsFromDeltas(deltas);
    const sum = Object.values(w).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it("output dimensions are all non-negative (floored)", () => {
    const deltas = {
      cuisineFit: -5,
      flavorContrast: -5,
      nutritionBalance: -5,
      prepBurden: -5,
      temperature: -5,
      preference: -5,
    };
    const w = composeV3WeightsFromDeltas(deltas);
    for (const v of Object.values(w)) expect(v).toBeGreaterThanOrEqual(0);
  });

  it("V3_NOISE_FLOOR + V3_MAX_DELTA are the documented values", () => {
    expect(V3_NOISE_FLOOR).toBe(0.05);
    expect(V3_MAX_DELTA).toBe(0.1);
  });
});

// ── trainUserWeightsV3 — end-to-end ────────────────────────

describe("trainUserWeightsV3 — cold start", () => {
  it("returns DEFAULT_WEIGHTS for empty history", () => {
    expect(trainUserWeightsV3([])).toEqual(DEFAULT_WEIGHTS);
  });

  it("returns DEFAULT_WEIGHTS below cold-start threshold", () => {
    const history = Array.from({ length: V3_COLD_START_THRESHOLD - 1 }, () =>
      fixtureCook({ rating: 5 }),
    );
    expect(trainUserWeightsV3(history)).toEqual(DEFAULT_WEIGHTS);
  });

  it("returns DEFAULT_WEIGHTS when at threshold but no rejected pool", () => {
    const history = Array.from({ length: V3_COLD_START_THRESHOLD }, () =>
      fixtureCook({ rating: 5 }),
    );
    expect(trainUserWeightsV3(history)).toEqual(DEFAULT_WEIGHTS);
  });
});

describe("trainUserWeightsV3 — signal applied", () => {
  it("user who picks high-cuisineFit dishes gets cuisineFit weight bump", () => {
    const history: BreakdownCook[] = [
      // 5 accepted with high cuisineFit
      ...Array.from({ length: 5 }, () =>
        fixtureCook({
          rating: 5,
          engineScoreBreakdown: fixtureBreakdown({ cuisineFit: 0.9 }),
        }),
      ),
      // 5 rejected with low cuisineFit
      ...Array.from({ length: 5 }, () =>
        fixtureCook({
          rating: 1,
          engineScoreBreakdown: fixtureBreakdown({ cuisineFit: 0.2 }),
        }),
      ),
    ];
    const w = trainUserWeightsV3(history);
    expect(w.cuisineFit).toBeGreaterThan(DEFAULT_WEIGHTS.cuisineFit);
  });

  it("output sums to 1 even on saturated signal", () => {
    const history: BreakdownCook[] = [
      ...Array.from({ length: 6 }, () =>
        fixtureCook({
          rating: 5,
          favorite: true,
          engineScoreBreakdown: fixtureBreakdown({
            cuisineFit: 0.95,
            flavorContrast: 0.92,
          }),
        }),
      ),
      ...Array.from({ length: 4 }, () =>
        fixtureCook({
          rating: 1,
          engineScoreBreakdown: fixtureBreakdown({
            cuisineFit: 0.05,
            flavorContrast: 0.05,
          }),
        }),
      ),
    ];
    const w = trainUserWeightsV3(history);
    const sum = Object.values(w).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it("monotonic: stronger signal → bigger shift", () => {
    const weakHistory: BreakdownCook[] = [
      ...Array.from({ length: 5 }, () =>
        fixtureCook({
          rating: 4,
          engineScoreBreakdown: fixtureBreakdown({ preference: 0.6 }),
        }),
      ),
      ...Array.from({ length: 5 }, () =>
        fixtureCook({
          rating: 2,
          engineScoreBreakdown: fixtureBreakdown({ preference: 0.5 }),
        }),
      ),
    ];
    const strongHistory: BreakdownCook[] = [
      ...Array.from({ length: 5 }, () =>
        fixtureCook({
          rating: 5,
          engineScoreBreakdown: fixtureBreakdown({ preference: 0.95 }),
        }),
      ),
      ...Array.from({ length: 5 }, () =>
        fixtureCook({
          rating: 1,
          engineScoreBreakdown: fixtureBreakdown({ preference: 0.05 }),
        }),
      ),
    ];
    const wWeak = trainUserWeightsV3(weakHistory);
    const wStrong = trainUserWeightsV3(strongHistory);
    expect(wStrong.preference).toBeGreaterThan(wWeak.preference);
  });

  it("returns a fresh object (not a DEFAULT_WEIGHTS reference)", () => {
    const out = trainUserWeightsV3([]);
    expect(out).not.toBe(DEFAULT_WEIGHTS);
    expect(out).toEqual(DEFAULT_WEIGHTS);
  });
});

// ── asBreakdownCook ───────────────────────────────────────

describe("asBreakdownCook", () => {
  it("returns null when session has no breakdown", () => {
    const s: CookSessionRecord = {
      sessionId: "x",
      recipeSlug: "x",
      dishName: "x",
      cuisineFamily: "x",
      startedAt: "2026-01-01T00:00:00Z",
      favorite: false,
    };
    expect(asBreakdownCook(s)).toBe(null);
  });

  it("returns BreakdownCook when breakdown is set", () => {
    const s: CookSessionRecord = {
      sessionId: "x",
      recipeSlug: "x",
      dishName: "x",
      cuisineFamily: "x",
      startedAt: "2026-01-01T00:00:00Z",
      favorite: true,
      rating: 5,
      engineScoreBreakdown: fixtureBreakdown(),
    };
    const out = asBreakdownCook(s);
    expect(out).not.toBe(null);
    expect(out?.rating).toBe(5);
    expect(out?.favorite).toBe(true);
  });

  it("returns null when breakdown is explicitly null", () => {
    const s: CookSessionRecord = {
      sessionId: "x",
      recipeSlug: "x",
      dishName: "x",
      cuisineFamily: "x",
      startedAt: "2026-01-01T00:00:00Z",
      favorite: false,
      engineScoreBreakdown: null,
    };
    expect(asBreakdownCook(s)).toBe(null);
  });
});
