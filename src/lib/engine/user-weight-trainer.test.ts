import { describe, expect, it } from "vitest";
import {
  deriveSignals,
  trainUserWeights,
  COLD_START_THRESHOLD,
  type TrainerCookRecord,
} from "./user-weight-trainer";
import { DEFAULT_WEIGHTS } from "./types";

function record(overrides: Partial<TrainerCookRecord> = {}): TrainerCookRecord {
  return {
    completedAt: "2026-04-01T12:00:00Z",
    cuisineFamily: "indian",
    favorite: false,
    ...overrides,
  };
}

describe("deriveSignals", () => {
  it("empty history returns zero signals", () => {
    expect(deriveSignals([])).toEqual({
      cuisineConsistency: 0,
      highRatingRate: 0,
      favoriteRate: 0,
      totalCooks: 0,
    });
  });

  it("counts only completed cooks", () => {
    const history: TrainerCookRecord[] = [
      record({ completedAt: undefined }),
      record({}),
      record({}),
    ];
    expect(deriveSignals(history).totalCooks).toBe(2);
  });

  it("cuisineConsistency = top-cuisine fraction", () => {
    const history: TrainerCookRecord[] = [
      record({ cuisineFamily: "indian" }),
      record({ cuisineFamily: "indian" }),
      record({ cuisineFamily: "indian" }),
      record({ cuisineFamily: "italian" }),
    ];
    expect(deriveSignals(history).cuisineConsistency).toBe(0.75);
  });

  it("highRatingRate = (rated≥4) / (rated)", () => {
    const history: TrainerCookRecord[] = [
      record({ rating: 5 }),
      record({ rating: 4 }),
      record({ rating: 2 }),
      record({}), // no rating — excluded from denom
    ];
    expect(deriveSignals(history).highRatingRate).toBeCloseTo(2 / 3);
  });

  it("highRatingRate is 0 when no cook is rated", () => {
    const history = [record({}), record({})];
    expect(deriveSignals(history).highRatingRate).toBe(0);
  });

  it("favoriteRate = favorites / total completed", () => {
    const history: TrainerCookRecord[] = [
      record({ favorite: true }),
      record({ favorite: true }),
      record({ favorite: false }),
      record({ favorite: false }),
    ];
    expect(deriveSignals(history).favoriteRate).toBe(0.5);
  });
});

describe("trainUserWeights — cold start", () => {
  it("returns DEFAULT_WEIGHTS for empty history", () => {
    expect(trainUserWeights([])).toEqual(DEFAULT_WEIGHTS);
  });

  it("returns DEFAULT_WEIGHTS when cooks below cold-start threshold", () => {
    const history = Array.from({ length: COLD_START_THRESHOLD - 1 }, () =>
      record(),
    );
    expect(trainUserWeights(history)).toEqual(DEFAULT_WEIGHTS);
  });

  it("returns a fresh object (not the DEFAULT_WEIGHTS reference)", () => {
    const result = trainUserWeights([]);
    expect(result).not.toBe(DEFAULT_WEIGHTS);
    expect(result).toEqual(DEFAULT_WEIGHTS);
  });
});

describe("trainUserWeights — signals applied", () => {
  it("cuisine-consistent user gets higher cuisineFit", () => {
    const history = Array.from({ length: 6 }, () =>
      record({ cuisineFamily: "indian" }),
    );
    const result = trainUserWeights(history);
    expect(result.cuisineFit).toBeGreaterThan(DEFAULT_WEIGHTS.cuisineFit);
  });

  it("cuisine-diverse user retains baseline cuisineFit", () => {
    const cuisines = [
      "indian",
      "italian",
      "mexican",
      "japanese",
      "thai",
      "french",
    ];
    const history = cuisines.map((c) => record({ cuisineFamily: c }));
    const result = trainUserWeights(history);
    // No cuisine bump since consistency = 1/6 < threshold.
    expect(result.cuisineFit).toBeCloseTo(DEFAULT_WEIGHTS.cuisineFit, 5);
  });

  it("high-rating user gets higher preference weight", () => {
    const history = Array.from({ length: 6 }, () =>
      record({ rating: 5, cuisineFamily: ["a", "b", "c", "d", "e", "f"][0] }),
    );
    // Rotate cuisines so cuisineFit doesn't also bump.
    const diverse = ["a", "b", "c", "d", "e", "f"].map((c) =>
      record({ cuisineFamily: c, rating: 5 }),
    );
    const result = trainUserWeights(diverse);
    expect(result.preference).toBeGreaterThan(DEFAULT_WEIGHTS.preference);
    expect(history.length).toBeGreaterThan(0);
  });

  it("self-curating user (high favorite rate) bumps preference", () => {
    const history = ["a", "b", "c", "d", "e", "f"].map((c) =>
      record({ cuisineFamily: c, favorite: true }),
    );
    const result = trainUserWeights(history);
    expect(result.preference).toBeGreaterThan(DEFAULT_WEIGHTS.preference);
  });

  it("output weights always sum to 1", () => {
    const history = Array.from({ length: 6 }, () =>
      record({ cuisineFamily: "indian", rating: 5, favorite: true }),
    );
    const result = trainUserWeights(history);
    const sum = Object.values(result).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it("output weights are all non-negative", () => {
    const history = Array.from({ length: 20 }, () =>
      record({ cuisineFamily: "indian", rating: 5, favorite: true }),
    );
    const result = trainUserWeights(history);
    for (const v of Object.values(result)) {
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it("output weights all stay below 0.5 even for fully saturated user", () => {
    const history = Array.from({ length: 100 }, () =>
      record({ cuisineFamily: "indian", rating: 5, favorite: true }),
    );
    const result = trainUserWeights(history);
    for (const v of Object.values(result)) {
      expect(v).toBeLessThan(0.5);
    }
  });

  it("is deterministic — same history → same weights", () => {
    const history = Array.from({ length: 6 }, () =>
      record({ cuisineFamily: "indian" }),
    );
    expect(trainUserWeights(history)).toEqual(trainUserWeights(history));
  });

  it("ignores incomplete cooks even past cold-start threshold", () => {
    const history = Array.from({ length: COLD_START_THRESHOLD + 5 }, () =>
      record({ completedAt: undefined, cuisineFamily: "indian" }),
    );
    expect(trainUserWeights(history)).toEqual(DEFAULT_WEIGHTS);
  });
});
