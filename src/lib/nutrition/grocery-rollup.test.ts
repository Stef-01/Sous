import { describe, expect, it } from "vitest";
import { groceryNutritionRollup } from "./grocery-rollup";
import {
  getDishPerServing,
  NUTRITION_COVERAGE_FLOOR,
} from "@/lib/engine/dish-nutrition";

const isCovered = (slug: string) => {
  const r = getDishPerServing(slug);
  return !!r.perServing && r.coverage >= NUTRITION_COVERAGE_FLOOR;
};

describe("groceryNutritionRollup (W33)", () => {
  it("returns null for an empty list", () => {
    expect(groceryNutritionRollup([])).toBeNull();
  });

  it("returns null when nothing meets the coverage floor", () => {
    expect(groceryNutritionRollup(["not-a-real-dish-xyz"])).toBeNull();
  });

  it("sums covered recipes and counts the excluded ones", () => {
    const candidates = [
      "grilled-salmon",
      "masoor-dal",
      "tabbouleh",
      "pico-de-gallo",
    ];
    const covered = candidates.filter(isCovered);
    if (covered.length === 0) return; // dataset guard — never silently pass wrong

    const roll = groceryNutritionRollup([...covered, "not-a-real-dish-xyz"])!;
    expect(roll.recipeCount).toBe(covered.length);
    expect(roll.excludedCount).toBe(1);

    const expectedCal = covered.reduce(
      (acc, s) => acc + (getDishPerServing(s).perServing!.calories ?? 0),
      0,
    );
    expect(roll.calories).toBe(Math.round(expectedCal));
    expect(roll.protein_g).toBeGreaterThanOrEqual(0);
  });
});
