import { describe, expect, it } from "vitest";
import {
  NUTRITION_GOALS,
  coerceNutritionGoal,
  nutritionGoalSoftWeights,
} from "./use-nutrition-goal";

describe("nutrition goal (W47)", () => {
  it("balanced nudges nothing; each goal maps to one small soft weight", () => {
    expect(nutritionGoalSoftWeights("balanced")).toEqual({});
    expect(nutritionGoalSoftWeights("protein")).toEqual({
      proteinAffinity: 0.15,
    });
    expect(nutritionGoalSoftWeights("veg")).toEqual({ vegAffinity: 0.15 });
    expect(nutritionGoalSoftWeights("hydration")).toEqual({
      hydrationAffinity: 0.15,
    });
  });

  it("every soft weight is small (≤0.15) so it nudges, never dominates", () => {
    for (const g of NUTRITION_GOALS) {
      for (const v of Object.values(nutritionGoalSoftWeights(g))) {
        expect(v).toBeGreaterThan(0);
        expect(v).toBeLessThanOrEqual(0.15);
      }
    }
  });

  it("coerces junk / missing values to the balanced default", () => {
    expect(coerceNutritionGoal(null)).toBe("balanced");
    expect(coerceNutritionGoal(undefined)).toBe("balanced");
    expect(coerceNutritionGoal("nonsense")).toBe("balanced");
    expect(coerceNutritionGoal("protein")).toBe("protein");
  });
});
