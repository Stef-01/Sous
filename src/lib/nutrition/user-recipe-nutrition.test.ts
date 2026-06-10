import { describe, expect, it } from "vitest";
import {
  parseAmount,
  parseQuantityToGrams,
  computeUserRecipeNutrition,
} from "./user-recipe-nutrition";
import { getIngredient, resolveIngredientByName } from "@/data/ingredients";

describe("parseAmount", () => {
  it("handles integers, decimals, fractions, mixed numbers, ranges", () => {
    expect(parseAmount("2")).toBe(2);
    expect(parseAmount("0.5")).toBe(0.5);
    expect(parseAmount("1/2")).toBe(0.5);
    expect(parseAmount("1 1/2 cups")).toBe(1.5);
    expect(parseAmount("3-4 lbs")).toBe(3.5);
    expect(parseAmount("a pinch")).toBeNull();
  });
});

describe("parseQuantityToGrams (#5)", () => {
  const someId = resolveIngredientByName("olive oil");
  const oil = someId ? getIngredient(someId) : null;

  it("mass units convert directly regardless of density", () => {
    if (!oil) return;
    expect(parseQuantityToGrams("200g", oil)).toBe(200);
    expect(parseQuantityToGrams("1 lb", oil)).toBeCloseTo(453.6, 0);
  });

  it("volume units use the ingredient's own density when present", () => {
    if (!oil?.densityGPerCup) return;
    const cup = parseQuantityToGrams("1 cup", oil)!;
    expect(cup).toBeCloseTo(oil.densityGPerCup, 0);
    expect(parseQuantityToGrams("1 tbsp", oil)!).toBeCloseTo(cup / 16, 1);
  });

  it("unparseable lines return null (excluded, never guessed)", () => {
    if (!oil) return;
    expect(parseQuantityToGrams("to taste", oil)).toBeNull();
  });
});

describe("computeUserRecipeNutrition (#5)", () => {
  it("composes a real per-serving vector through the registry", () => {
    const out = computeUserRecipeNutrition(
      [
        { name: "olive oil", quantity: "2 tbsp" },
        { name: "garlic", quantity: "4 cloves" },
        { name: "unobtainium dust", quantity: "1 cup" },
      ],
      2,
    );
    // olive oil must resolve; garlic needs gramsPerPiece (may or may not) —
    // assert at least the oil contributed and coverage reflects the misses.
    expect(out).not.toBeNull();
    expect(out!.coverage).toBeLessThan(1);
    expect(out!.perServing.calories).toBeGreaterThan(50); // 1 tbsp oil/serving ≈ 119 kcal
  });

  it("nothing resolvable → null (no fabricated vectors)", () => {
    expect(
      computeUserRecipeNutrition([{ name: "xyzzy", quantity: "1 cup" }], 2),
    ).toBeNull();
    expect(computeUserRecipeNutrition([], 2)).toBeNull();
  });
});
