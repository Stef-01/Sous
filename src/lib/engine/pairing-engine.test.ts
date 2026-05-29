import { describe, it, expect } from "vitest";
import { suggestSides } from "./pairing-engine";
import { getCuisineCompatibility } from "./data/cuisine-matrix";
import { cuisineFitScorer } from "./scorers/cuisine-fit";
import { flavorContrastScorer } from "./scorers/flavor-contrast";
import { nutritionBalanceScorer } from "./scorers/nutrition-balance";
import { prepBurdenScorer } from "./scorers/prep-burden";
import { temperatureScorer } from "./scorers/temperature";
import { preferenceScorer } from "./scorers/preference";
import { rankCandidates, topK } from "./ranker";
import { generateExplanation } from "./explainer";
import type {
  MainDishIntent,
  SideDishCandidate,
  ScoredCandidate,
} from "./types";
import { DEFAULT_WEIGHTS } from "./types";

// ── Test fixtures ──────────────────────────────────────

const chickenMain: MainDishIntent = {
  dishName: "Butter Chicken",
  cuisineSignals: ["indian"],
  isHomemade: false,
  effortTolerance: "moderate",
  healthOrientation: "balanced",
  moodSignals: ["rich", "creamy"],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- test fixture for future use
const saladMain: MainDishIntent = {
  dishName: "Caesar Salad",
  cuisineSignals: ["italian", "american"],
  isHomemade: true,
  effortTolerance: "minimal",
  healthOrientation: "health-forward",
  moodSignals: ["fresh", "light"],
};

const tabbouleh: SideDishCandidate = {
  id: "tabbouleh-id",
  slug: "tabbouleh",
  name: "Tabbouleh",
  cuisineFamily: "mediterranean",
  prepTimeMinutes: 15,
  cookTimeMinutes: 0,
  skillLevel: "beginner",
  flavorProfile: ["bright", "herby", "crunchy"],
  temperature: "cold",
  proteinGrams: 4,
  fiberGrams: 6,
  caloriesPerServing: 120,
  bestPairedWith: ["grilled-meat", "kebab"],
  tags: ["no-cook", "vegan", "high-fiber"],
  pairingReason: "Adds brightness",
  nutritionCategory: "vegetable",
  dietaryFlags: ["vegan", "vegetarian", "dairy-free"],
};

const naan: SideDishCandidate = {
  id: "naan-id",
  slug: "naan-bread",
  name: "Naan Bread",
  cuisineFamily: "indian",
  prepTimeMinutes: 5,
  cookTimeMinutes: 10,
  skillLevel: "beginner",
  flavorProfile: ["warm", "bread"],
  temperature: "hot",
  proteinGrams: 3,
  fiberGrams: 1,
  caloriesPerServing: 260,
  bestPairedWith: ["curry", "dal", "chicken"],
  tags: ["bread", "indian"],
  pairingReason: "Warm bread for scooping",
  nutritionCategory: "carb",
  dietaryFlags: ["vegetarian", "nut-allergy", "shellfish-allergy"],
};

const raita: SideDishCandidate = {
  id: "raita-id",
  slug: "raita",
  name: "Raita",
  cuisineFamily: "indian",
  prepTimeMinutes: 5,
  cookTimeMinutes: 0,
  skillLevel: "beginner",
  flavorProfile: ["cooling", "creamy", "fresh"],
  temperature: "cold",
  proteinGrams: 3,
  fiberGrams: 0,
  caloriesPerServing: 60,
  bestPairedWith: ["curry", "biryani", "spicy"],
  tags: ["yogurt", "indian", "no-cook"],
  pairingReason: "Cooling contrast to spice",
  nutritionCategory: "protein",
  dietaryFlags: [
    "vegetarian",
    "gluten-free",
    "nut-allergy",
    "shellfish-allergy",
  ],
};

const fries: SideDishCandidate = {
  id: "fries-id",
  slug: "french-fries",
  name: "French Fries",
  cuisineFamily: "american",
  prepTimeMinutes: 5,
  cookTimeMinutes: 20,
  skillLevel: "beginner",
  flavorProfile: ["salty", "crispy"],
  temperature: "hot",
  proteinGrams: 2,
  fiberGrams: 2,
  caloriesPerServing: 350,
  bestPairedWith: ["burger", "steak"],
  tags: ["fried", "american"],
  pairingReason: "Classic combo",
  nutritionCategory: "carb",
  dietaryFlags: [
    "vegan",
    "vegetarian",
    "gluten-free",
    "dairy-free",
    "nut-allergy",
    "shellfish-allergy",
  ],
};

const allCandidates = [tabbouleh, naan, raita, fries];

// ── Cuisine compatibility matrix tests ─────────────────

describe("Cuisine Compatibility Matrix", () => {
  it("returns 1.0 for same cuisine", () => {
    expect(getCuisineCompatibility("indian", "indian")).toBe(1.0);
    expect(getCuisineCompatibility("japanese", "japanese")).toBe(1.0);
  });

  it("returns high score for regional affinities", () => {
    const score = getCuisineCompatibility("indian", "middle-eastern");
    expect(score).toBeGreaterThanOrEqual(0.75);
  });

  it("returns moderate score for comfort-classic with anything", () => {
    const score = getCuisineCompatibility("comfort-classic", "japanese");
    expect(score).toBeGreaterThanOrEqual(0.5);
  });

  it("returns default for distant cuisines", () => {
    const score = getCuisineCompatibility("west-african", "japanese");
    expect(score).toBe(0.5);
  });
});

// ── Individual scorer tests ────────────────────────────

describe("Cuisine Fit Scorer", () => {
  it("scores Indian side higher for Indian main", () => {
    const naanScore = cuisineFitScorer.score(chickenMain, naan);
    const friesScore = cuisineFitScorer.score(chickenMain, fries);
    expect(naanScore).toBeGreaterThan(friesScore);
  });

  it("gives bonus for bestPairedWith match", () => {
    const naanWithChicken = cuisineFitScorer.score(chickenMain, naan);
    // naan has "chicken" in bestPairedWith, should get bonus
    expect(naanWithChicken).toBeGreaterThan(0.8);
  });
});

describe("Flavor Contrast Scorer", () => {
  it("rewards cooling side for rich/creamy main", () => {
    const raitaScore = flavorContrastScorer.score(chickenMain, raita);
    // raita is cooling + creamy + fresh, butter chicken is rich + creamy
    expect(raitaScore).toBeGreaterThan(0.3);
  });

  it("returns mid score when no flavor data", () => {
    const emptyMain: MainDishIntent = {
      ...chickenMain,
      moodSignals: [],
      dishName: "Unknown Dish",
    };
    const emptyCandidate: SideDishCandidate = {
      ...tabbouleh,
      flavorProfile: [],
    };
    const score = flavorContrastScorer.score(emptyMain, emptyCandidate);
    expect(score).toBe(0.5);
  });
});

describe("Nutrition Balance Scorer", () => {
  it("scores vegetable side high for protein main", () => {
    const score = nutritionBalanceScorer.score(chickenMain, tabbouleh);
    expect(score).toBeGreaterThanOrEqual(0.85);
  });

  it("penalizes carb side for carb main", () => {
    const pastaMain: MainDishIntent = {
      ...chickenMain,
      dishName: "Pasta Carbonara",
    };
    const score = nutritionBalanceScorer.score(pastaMain, fries);
    expect(score).toBeLessThanOrEqual(0.3);
  });

  it("boosts vegetables for health-forward orientation", () => {
    const healthMain: MainDishIntent = {
      ...chickenMain,
      healthOrientation: "health-forward",
    };
    const normalScore = nutritionBalanceScorer.score(chickenMain, tabbouleh);
    const healthScore = nutritionBalanceScorer.score(healthMain, tabbouleh);
    expect(healthScore).toBeGreaterThanOrEqual(normalScore);
  });
});

describe("Prep Burden Scorer", () => {
  it("scores no-cook sides high", () => {
    const score = prepBurdenScorer.score(chickenMain, tabbouleh);
    expect(score).toBeGreaterThanOrEqual(0.8);
  });

  it("penalizes long-prep sides for minimal effort tolerance", () => {
    const minimalMain: MainDishIntent = {
      ...chickenMain,
      effortTolerance: "minimal",
    };
    const score = prepBurdenScorer.score(minimalMain, fries); // 25 min total
    expect(score).toBeLessThan(0.5);
  });

  it("allows long-prep sides for willing effort tolerance", () => {
    const willingMain: MainDishIntent = {
      ...chickenMain,
      effortTolerance: "willing",
    };
    const score = prepBurdenScorer.score(willingMain, fries);
    expect(score).toBeGreaterThanOrEqual(0.8);
  });
});

describe("Temperature Scorer", () => {
  it("rewards cold side for hot main", () => {
    // Butter chicken is hot, raita is cold
    const score = temperatureScorer.score(chickenMain, raita);
    expect(score).toBeGreaterThanOrEqual(0.9);
  });

  it("gives moderate score for same temperature", () => {
    // Butter chicken is hot, naan is hot
    const score = temperatureScorer.score(chickenMain, naan);
    expect(score).toBe(0.5);
  });
});

describe("Preference Scorer", () => {
  it("returns 0.5 with no preferences", () => {
    const score = preferenceScorer.score(chickenMain, naan);
    expect(score).toBe(0.5);
  });

  it("returns higher score for liked cuisines", () => {
    const prefs = { indian: 0.8, bread: 0.5 };
    const score = preferenceScorer.score(chickenMain, naan, prefs);
    expect(score).toBeGreaterThan(0.5);
  });

  it("returns lower score for disliked features", () => {
    const prefs = { american: -0.8, fried: -0.6 };
    const score = preferenceScorer.score(chickenMain, fries, prefs);
    expect(score).toBeLessThan(0.5);
  });
});

// ── Ranker tests ───────────────────────────────────────

describe("Ranker", () => {
  it("returns candidates sorted by total score descending", () => {
    const ranked = rankCandidates(
      chickenMain,
      allCandidates,
      [
        cuisineFitScorer,
        flavorContrastScorer,
        nutritionBalanceScorer,
        prepBurdenScorer,
        temperatureScorer,
        preferenceScorer,
      ],
      DEFAULT_WEIGHTS,
    );

    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].totalScore).toBeGreaterThanOrEqual(
        ranked[i].totalScore - 0.001,
      );
    }
  });

  it("topK returns exactly K results", () => {
    const ranked = rankCandidates(
      chickenMain,
      allCandidates,
      [cuisineFitScorer],
      DEFAULT_WEIGHTS,
    );
    const top2 = topK(ranked, 2);
    expect(top2).toHaveLength(2);
  });

  it("topK returns all if fewer than K candidates", () => {
    const ranked = rankCandidates(
      chickenMain,
      [naan],
      [cuisineFitScorer],
      DEFAULT_WEIGHTS,
    );
    const top3 = topK(ranked, 3);
    expect(top3).toHaveLength(1);
  });
});

// ── Explainer tests ────────────────────────────────────

describe("Explainer", () => {
  it("generates non-empty explanation", () => {
    const candidate: ScoredCandidate = {
      sideDish: tabbouleh,
      scores: {
        cuisineFit: 0.8,
        flavorContrast: 0.9,
        nutritionBalance: 0.7,
        prepBurden: 0.6,
        temperature: 0.5,
        preference: 0.5,
      },
      totalScore: 0.75,
      explanation: "",
    };
    const explanation = generateExplanation(candidate);
    expect(explanation).toContain("Tabbouleh");
    expect(explanation.length).toBeGreaterThan(10);
  });
});

// ── Edge case tests ───────────────────────────────────

describe("Edge Cases", () => {
  it("handles main dish with empty name", () => {
    const emptyMain: MainDishIntent = {
      ...chickenMain,
      dishName: "",
    };
    const result = suggestSides(emptyMain, allCandidates);
    expect(result.success).toBe(true);
  });

  it("handles main dish with very long name", () => {
    const longMain: MainDishIntent = {
      ...chickenMain,
      dishName: "A".repeat(1000),
    };
    const result = suggestSides(longMain, allCandidates);
    expect(result.success).toBe(true);
  });

  it("handles main dish with no cuisine signals", () => {
    const noCuisine: MainDishIntent = {
      ...chickenMain,
      cuisineSignals: [],
    };
    const result = suggestSides(noCuisine, allCandidates);
    expect(result.success).toBe(true);
  });

  it("handles main dish with no mood signals", () => {
    const noMood: MainDishIntent = {
      ...chickenMain,
      moodSignals: [],
    };
    const result = suggestSides(noMood, allCandidates);
    expect(result.success).toBe(true);
  });

  it("handles single candidate", () => {
    const result = suggestSides(chickenMain, [naan]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sides).toHaveLength(1);
    }
  });

  it("handles duplicate candidates", () => {
    const result = suggestSides(chickenMain, [naan, naan, naan]);
    expect(result.success).toBe(true);
  });
});

// ── Integration: suggestSides ──────────────────────────

describe("suggestSides (integration)", () => {
  it("returns top 3 sides with explanations", () => {
    const result = suggestSides(chickenMain, allCandidates);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sides).toHaveLength(3);
      for (const side of result.data.sides) {
        expect(side.explanation).toBeTruthy();
        expect(side.totalScore).toBeGreaterThan(0);
      }
    }
  });

  it("returns error for empty candidates", () => {
    const result = suggestSides(chickenMain, []);
    expect(result.success).toBe(false);
  });

  it("returns fewer than 3 if fewer candidates", () => {
    const result = suggestSides(chickenMain, [naan]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sides).toHaveLength(1);
    }
  });

  it("is deterministic given same inputs", () => {
    const result1 = suggestSides(chickenMain, allCandidates);
    const result2 = suggestSides(chickenMain, allCandidates);
    expect(result1).toEqual(result2);
  });

  it("scores raita highly for butter chicken (cooling contrast + same cuisine)", () => {
    const result = suggestSides(chickenMain, allCandidates);
    if (result.success) {
      const slugs = result.data.sides.map((s) => s.sideDish.slug);
      // Raita should be in top 3: same cuisine, cooling contrast, quick prep
      expect(slugs).toContain("raita");
    }
  });

  it("respects custom weights", () => {
    const heavyPrepWeights = {
      cuisineFit: 0.1,
      flavorContrast: 0.1,
      nutritionBalance: 0.1,
      prepBurden: 0.6,
      temperature: 0.05,
      preference: 0.05,
    };
    const result = suggestSides(
      chickenMain,
      allCandidates,
      undefined,
      heavyPrepWeights,
    );
    if (result.success) {
      // Quick sides should rank higher with heavy prep weight
      const topSide = result.data.sides[0];
      const totalPrep =
        topSide.sideDish.prepTimeMinutes + topSide.sideDish.cookTimeMinutes;
      expect(totalPrep).toBeLessThanOrEqual(15);
    }
  });
});
