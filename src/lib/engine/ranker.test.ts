import { describe, it, expect } from "vitest";
import { rankCandidates, topK } from "./ranker";
import type {
  MainDishIntent,
  SideDishCandidate,
  Scorer,
  ScoreBreakdown,
} from "./types";
import { DEFAULT_WEIGHTS } from "./types";

const main: MainDishIntent = {
  dishName: "Butter Chicken",
  cuisineSignals: ["indian"],
  isHomemade: false,
  effortTolerance: "moderate",
  healthOrientation: "balanced",
  moodSignals: ["rich"],
};

function makeSide(
  slug: string,
  overrides?: Partial<SideDishCandidate>,
): SideDishCandidate {
  return {
    id: slug,
    slug,
    name: slug.replace(/-/g, " "),
    cuisineFamily: "indian",
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    skillLevel: "easy",
    flavorProfile: ["savory"],
    temperature: "warm",
    proteinGrams: 4,
    fiberGrams: 2,
    caloriesPerServing: 120,
    bestPairedWith: [],
    tags: [],
    pairingReason: null,
    nutritionCategory: null,
    ...overrides,
  };
}

const constantScorer = (name: keyof ScoreBreakdown, val: number): Scorer => ({
  name,
  score: () => val,
});

describe("rankCandidates", () => {
  it("returns all candidates sorted by total score descending", () => {
    const scorers: Scorer[] = [
      constantScorer("cuisineFit", 0.8),
      constantScorer("flavorContrast", 0.6),
      constantScorer("nutritionBalance", 0.5),
      constantScorer("prepBurden", 0.5),
      constantScorer("temperature", 0.5),
      {
        name: "preference",
        score: (_m, side) => (side.slug === "raita" ? 0.9 : 0.2),
      },
    ];

    const candidates = [makeSide("naan"), makeSide("raita")];
    const ranked = rankCandidates(main, candidates, scorers, DEFAULT_WEIGHTS);

    expect(ranked).toHaveLength(2);
    expect(ranked[0].sideDish.slug).toBe("raita");
    expect(ranked[0].totalScore).toBeGreaterThan(ranked[1].totalScore);
  });

  it("fills missing scorer dimensions with 0.5 default", () => {
    const scorers: Scorer[] = [constantScorer("cuisineFit", 1.0)];
    const ranked = rankCandidates(
      main,
      [makeSide("dal")],
      scorers,
      DEFAULT_WEIGHTS,
    );

    expect(ranked[0].scores.cuisineFit).toBe(1.0);
    expect(ranked[0].scores.flavorContrast).toBe(0.5);
    expect(ranked[0].scores.preference).toBe(0.5);
  });

  it("handles empty candidate list", () => {
    const ranked = rankCandidates(main, [], [], DEFAULT_WEIGHTS);
    expect(ranked).toEqual([]);
  });

  it("single candidate returns with computed score", () => {
    const scorers: Scorer[] = [constantScorer("cuisineFit", 0.7)];
    const ranked = rankCandidates(
      main,
      [makeSide("samosa")],
      scorers,
      DEFAULT_WEIGHTS,
    );

    expect(ranked).toHaveLength(1);
    expect(ranked[0].totalScore).toBeGreaterThan(0);
    expect(ranked[0].explanation).toBe("");
  });

  it("applies weights correctly", () => {
    const scorers: Scorer[] = [
      constantScorer("cuisineFit", 1.0),
      constantScorer("flavorContrast", 0.0),
    ];
    const weights = {
      ...DEFAULT_WEIGHTS,
      cuisineFit: 1.0,
      flavorContrast: 0.0,
    };
    const ranked = rankCandidates(main, [makeSide("x")], scorers, weights);

    const expected =
      1.0 * 1.0 +
      0.0 * 0.0 +
      0.5 * weights.nutritionBalance +
      0.5 * weights.prepBurden +
      0.5 * weights.temperature +
      0.5 * weights.preference;

    expect(ranked[0].totalScore).toBeCloseTo(expected, 4);
  });
});

describe("topK", () => {
  it("returns first K items from ranked list", () => {
    const ranked = [
      {
        totalScore: 0.9,
        sideDish: makeSide("a"),
        scores: {} as ScoreBreakdown,
        explanation: "",
      },
      {
        totalScore: 0.8,
        sideDish: makeSide("b"),
        scores: {} as ScoreBreakdown,
        explanation: "",
      },
      {
        totalScore: 0.7,
        sideDish: makeSide("c"),
        scores: {} as ScoreBreakdown,
        explanation: "",
      },
    ];

    expect(topK(ranked, 2)).toHaveLength(2);
    expect(topK(ranked, 2)[0].sideDish.slug).toBe("a");
  });

  it("returns all when K exceeds list length", () => {
    const ranked = [
      {
        totalScore: 0.9,
        sideDish: makeSide("x"),
        scores: {} as ScoreBreakdown,
        explanation: "",
      },
    ];
    expect(topK(ranked, 5)).toHaveLength(1);
  });

  it("returns empty for K=0", () => {
    expect(topK([], 0)).toEqual([]);
  });
});
