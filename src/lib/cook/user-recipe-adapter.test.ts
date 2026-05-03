import { describe, expect, it } from "vitest";
import {
  adaptUserRecipeForCook,
  findUserRecipeBySlug,
} from "./user-recipe-adapter";
import type { UserRecipe } from "@/types/user-recipe";

function makeRecipe(overrides: Partial<UserRecipe> = {}): UserRecipe {
  return {
    schemaVersion: 1,
    id: "rec-chana-masala-1234",
    slug: "chana-masala",
    title: "Chana masala",
    dishName: "Chana masala",
    cuisineFamily: "indian",
    flavorProfile: ["spicy", "savory"],
    dietaryFlags: ["vegan"],
    temperature: "hot",
    skillLevel: "intermediate",
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    serves: 4,
    heroImageUrl: null,
    description: "A weeknight chickpea curry.",
    ingredients: [
      {
        id: "i-1",
        name: "chickpeas",
        quantity: "2 cans",
        isOptional: false,
        substitution: null,
      },
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: "Heat oil in a pan.",
        timerSeconds: 60,
        mistakeWarning: null,
        quickHack: null,
        donenessCue: null,
      },
      {
        stepNumber: 2,
        instruction: "Add cumin seeds and bloom.",
        timerSeconds: null,
        mistakeWarning: "Don't burn the cumin.",
        quickHack: null,
        donenessCue: "Smell should be nutty, not acrid.",
      },
    ],
    createdAt: "2026-04-01T12:00:00Z",
    updatedAt: "2026-04-01T12:00:00Z",
    ...overrides,
  };
}

describe("adaptUserRecipeForCook", () => {
  it("maps a UserRecipe to the cook page shape", () => {
    const recipe = makeRecipe();
    const result = adaptUserRecipeForCook(recipe);

    expect(result.dish).toEqual({
      id: "rec-chana-masala-1234",
      name: "Chana masala",
      slug: "chana-masala",
      description: "A weeknight chickpea curry.",
      cuisineFamily: "indian",
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      skillLevel: "intermediate",
      heroImageUrl: null,
      flavorProfile: ["spicy", "savory"],
      temperature: "hot",
    });
  });

  it("falls back to title when dishName is empty", () => {
    const recipe = makeRecipe({ dishName: "" });
    const result = adaptUserRecipeForCook(recipe);
    expect(result.dish.name).toBe(recipe.title);
  });

  it("preserves dishName when both are set", () => {
    const recipe = makeRecipe({
      title: "Friday-night curry",
      dishName: "Chana masala",
    });
    const result = adaptUserRecipeForCook(recipe);
    expect(result.dish.name).toBe("Chana masala");
  });

  it("assigns a deterministic id to each step", () => {
    const recipe = makeRecipe();
    const result = adaptUserRecipeForCook(recipe);
    expect(result.steps[0].id).toBe("chana-masala-step-1");
    expect(result.steps[1].id).toBe("chana-masala-step-2");
  });

  it("sets phase=cook on every step", () => {
    const recipe = makeRecipe();
    const result = adaptUserRecipeForCook(recipe);
    expect(result.steps.every((s) => s.phase === "cook")).toBe(true);
  });

  it("preserves step instructions, timers, mistakes, hacks, donenessCue", () => {
    const recipe = makeRecipe();
    const result = adaptUserRecipeForCook(recipe);
    expect(result.steps[0].instruction).toBe("Heat oil in a pan.");
    expect(result.steps[0].timerSeconds).toBe(60);
    expect(result.steps[1].mistakeWarning).toBe("Don't burn the cumin.");
    expect(result.steps[1].donenessCue).toBe(
      "Smell should be nutty, not acrid.",
    );
  });

  it("nulls cuisineFact and imageUrl (not yet authored on user recipes)", () => {
    const recipe = makeRecipe();
    const result = adaptUserRecipeForCook(recipe);
    expect(result.steps[0].cuisineFact).toBe(null);
    expect(result.steps[0].imageUrl).toBe(null);
  });

  it("normalises optional null fields on steps", () => {
    const recipe = makeRecipe({
      steps: [
        {
          stepNumber: 1,
          instruction: "Stir.",
          // omit timerSeconds, mistakeWarning, quickHack, donenessCue
        },
      ],
    });
    const result = adaptUserRecipeForCook(recipe);
    expect(result.steps[0].timerSeconds).toBe(null);
    expect(result.steps[0].mistakeWarning).toBe(null);
    expect(result.steps[0].quickHack).toBe(null);
    expect(result.steps[0].donenessCue).toBe(null);
  });

  it("preserves ingredient ids, names, quantities, optional flag", () => {
    const recipe = makeRecipe({
      ingredients: [
        {
          id: "i-1",
          name: "salt",
          quantity: "1 tsp",
          isOptional: true,
          substitution: "kosher salt",
        },
      ],
    });
    const result = adaptUserRecipeForCook(recipe);
    expect(result.ingredients[0]).toEqual({
      id: "i-1",
      name: "salt",
      quantity: "1 tsp",
      isOptional: true,
      substitution: "kosher salt",
    });
  });

  it("normalises ingredient substitution to null when missing", () => {
    const recipe = makeRecipe({
      ingredients: [
        {
          id: "i-1",
          name: "garlic",
          quantity: "3 cloves",
          isOptional: false,
        },
      ],
    });
    const result = adaptUserRecipeForCook(recipe);
    expect(result.ingredients[0].substitution).toBe(null);
  });

  it("preserves heroImageUrl when set", () => {
    const recipe = makeRecipe({ heroImageUrl: "/img/chana.png" });
    const result = adaptUserRecipeForCook(recipe);
    expect(result.dish.heroImageUrl).toBe("/img/chana.png");
  });
});

describe("findUserRecipeBySlug", () => {
  it("returns the recipe when slug matches", () => {
    const recipes = [makeRecipe()];
    expect(findUserRecipeBySlug(recipes, "chana-masala")).toEqual(recipes[0]);
  });

  it("returns null when no recipe matches", () => {
    const recipes = [makeRecipe()];
    expect(findUserRecipeBySlug(recipes, "nonexistent")).toBe(null);
  });

  it("returns null on empty list", () => {
    expect(findUserRecipeBySlug([], "anything")).toBe(null);
  });

  it("returns the first match when slugs collide", () => {
    const recipes = [
      makeRecipe({ id: "rec-a", slug: "duplicate" }),
      makeRecipe({ id: "rec-b", slug: "duplicate" }),
    ];
    expect(findUserRecipeBySlug(recipes, "duplicate")?.id).toBe("rec-a");
  });
});
