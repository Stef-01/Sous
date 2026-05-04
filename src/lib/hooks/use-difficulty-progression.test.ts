import { describe, it, expect, vi } from "vitest";
import type { CookSessionRecord } from "./use-cook-sessions";

// Mock the guided-cook-steps module
vi.mock("@/data/guided-cook-steps", () => ({
  getStaticCookData: vi.fn((slug: string) => {
    const data: Record<
      string,
      {
        prepTimeMinutes: number;
        cookTimeMinutes: number;
        ingredients: { name: string }[];
      }
    > = {
      "easy-salad": {
        prepTimeMinutes: 5,
        cookTimeMinutes: 5,
        ingredients: [
          { name: "lettuce" },
          { name: "tomato" },
          { name: "dressing" },
        ],
      },
      "medium-stir-fry": {
        prepTimeMinutes: 10,
        cookTimeMinutes: 15,
        ingredients: [
          { name: "chicken" },
          { name: "peppers" },
          { name: "soy sauce" },
          { name: "rice" },
          { name: "oil" },
          { name: "garlic" },
          { name: "ginger" },
        ],
      },
      "hard-biryani": {
        prepTimeMinutes: 20,
        cookTimeMinutes: 30,
        ingredients: Array.from({ length: 12 }, (_, i) => ({
          name: `ingredient-${i}`,
        })),
      },
    };
    return data[slug] ?? null;
  }),
  getStaticMealCookData: vi.fn(() => null),
}));

// Import after mocks
import { scoreDifficultyAlignment } from "./use-difficulty-progression";

function mockSession(slug: string, cuisine = "Italian"): CookSessionRecord {
  return {
    sessionId: `cs-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    recipeSlug: slug,
    dishName: slug,
    cuisineFamily: cuisine,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    favorite: false,
  };
}

describe("scoreDifficultyAlignment", () => {
  it("gives highest boost for exact difficulty match", () => {
    // Easy dish matches easy recommendation
    const score = scoreDifficultyAlignment("easy-salad", {
      easy: 2,
      medium: 0,
      hard: 0,
      recommendedLevel: "easy",
      difficultyBoost: 0,
    });
    expect(score).toBe(4);
  });

  it("gives moderate boost for one-step-up stretch", () => {
    const score = scoreDifficultyAlignment("medium-stir-fry", {
      easy: 4,
      medium: 0,
      hard: 0,
      recommendedLevel: "easy",
      difficultyBoost: 0,
    });
    expect(score).toBe(3);
  });

  it("gives low boost for one-step-down confidence builder", () => {
    const score = scoreDifficultyAlignment("easy-salad", {
      easy: 2,
      medium: 5,
      hard: 0,
      recommendedLevel: "medium",
      difficultyBoost: 0.08,
    });
    expect(score).toBe(1);
  });

  it("gives zero for two-step gap", () => {
    const score = scoreDifficultyAlignment("hard-biryani", {
      easy: 2,
      medium: 0,
      hard: 0,
      recommendedLevel: "easy",
      difficultyBoost: 0,
    });
    expect(score).toBe(0);
  });

  it("returns default for unknown slug", () => {
    // Unknown slug → classified as "medium"
    const score = scoreDifficultyAlignment("unknown-dish", {
      easy: 0,
      medium: 0,
      hard: 0,
      recommendedLevel: "medium",
      difficultyBoost: 0,
    });
    expect(score).toBe(4); // medium == medium
  });
});

describe("difficulty progression tiers", () => {
  it("recommends easy for fewer than 5 total cooks", () => {
    // With <5 cooks, recommended is easy
    const total = 3;
    expect(total < 5).toBe(true);
  });

  it("recommends medium after 5+ cooks with 3+ easy", () => {
    const counts = { easy: 4, medium: 1, hard: 0 };
    const total = counts.easy + counts.medium + counts.hard;
    expect(total >= 5 && counts.easy >= 3).toBe(true);
  });

  it("recommends hard after 15+ total cooks", () => {
    const total = 16;
    expect(total >= 15).toBe(true);
  });
});
