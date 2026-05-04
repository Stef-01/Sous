import { describe, it, expect } from "vitest";
import { createAntiMonotonyScorer } from "./anti-monotony";
import type { MainDishIntent, SideDishCandidate } from "../types";

const mockMain: MainDishIntent = {
  dishName: "Chicken Tikka Masala",
  cuisineSignals: ["indian"],
  isHomemade: true,
  effortTolerance: "moderate",
  healthOrientation: "balanced",
  moodSignals: [],
};

function makeSide(id: string): SideDishCandidate {
  return {
    id,
    slug: id,
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
  };
}

describe("anti-monotony scorer", () => {
  it("returns 0.9 for sides never served", () => {
    const scorer = createAntiMonotonyScorer(new Map());
    const score = scorer.score(mockMain, makeSide("raita"));
    expect(score).toBe(0.9);
  });

  it("returns 0.1 for sides served today", () => {
    const map = new Map([["raita", 0.2]]);
    const scorer = createAntiMonotonyScorer(map);
    const score = scorer.score(mockMain, makeSide("raita"));
    expect(score).toBe(0.1);
  });

  it("returns 0.3 for sides served 2 days ago", () => {
    const map = new Map([["raita", 2]]);
    const scorer = createAntiMonotonyScorer(map);
    const score = scorer.score(mockMain, makeSide("raita"));
    expect(score).toBe(0.3);
  });

  it("returns 0.5 for sides served 4 days ago", () => {
    const map = new Map([["raita", 4]]);
    const scorer = createAntiMonotonyScorer(map);
    const score = scorer.score(mockMain, makeSide("raita"));
    expect(score).toBe(0.5);
  });

  it("returns 0.7 for sides served 6 days ago", () => {
    const map = new Map([["raita", 6]]);
    const scorer = createAntiMonotonyScorer(map);
    const score = scorer.score(mockMain, makeSide("raita"));
    expect(score).toBe(0.7);
  });

  it("does not penalize sides not in the recency map", () => {
    const map = new Map([["raita", 0.5]]);
    const scorer = createAntiMonotonyScorer(map);
    const score = scorer.score(mockMain, makeSide("naan-bread"));
    expect(score).toBe(0.9);
  });
});
