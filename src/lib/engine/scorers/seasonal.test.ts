import { describe, it, expect, vi, afterEach } from "vitest";
import { seasonalScorer } from "./seasonal";
import type { MainDishIntent, SideDishCandidate } from "../types";

const mockMain: MainDishIntent = {
  dishName: "Chicken Tikka Masala",
  cuisineSignals: ["indian"],
  isHomemade: true,
  effortTolerance: "moderate",
  healthOrientation: "balanced",
  moodSignals: [],
};

function makeSide(overrides: Partial<SideDishCandidate> = {}): SideDishCandidate {
  return {
    id: "test-side",
    slug: "test-side",
    name: "Test Side",
    cuisineFamily: "indian",
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    skillLevel: "beginner",
    flavorProfile: [],
    temperature: "warm",
    proteinGrams: null,
    fiberGrams: null,
    caloriesPerServing: null,
    bestPairedWith: [],
    tags: [],
    pairingReason: null,
    nutritionCategory: "vegetable",
    ...overrides,
  };
}

describe("seasonalScorer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("boosts salad in summer", () => {
    // Mock July (month index 6)
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 15));

    const side = makeSide({ tags: ["salad", "fresh"], temperature: "cold" });
    const score = seasonalScorer.score(mockMain, side);
    expect(score).toBeGreaterThan(0.7);

    vi.useRealTimers();
  });

  it("penalizes soup in summer", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 15));

    const side = makeSide({ tags: ["soup", "warm"], temperature: "hot" });
    const score = seasonalScorer.score(mockMain, side);
    expect(score).toBeLessThan(0.4);

    vi.useRealTimers();
  });

  it("boosts soup in winter", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15)); // January

    const side = makeSide({ tags: ["soup", "hearty"], temperature: "hot" });
    const score = seasonalScorer.score(mockMain, side);
    expect(score).toBeGreaterThan(0.7);

    vi.useRealTimers();
  });

  it("penalizes cold salad in winter", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15)); // January

    const side = makeSide({ tags: ["salad", "cold", "raw"], temperature: "cold" });
    const score = seasonalScorer.score(mockMain, side);
    expect(score).toBeLessThan(0.4);

    vi.useRealTimers();
  });

  it("returns neutral score in spring for neutral dishes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15)); // April

    const side = makeSide({ tags: ["rice", "starchy"], temperature: "warm" });
    const score = seasonalScorer.score(mockMain, side);
    expect(score).toBeCloseTo(0.5, 1);

    vi.useRealTimers();
  });
});
