import { describe, expect, it } from "vitest";
import { nutrientDensity, isNutrientDense } from "./nutrient-density";
import type { PerServingNutrition } from "@/types/nutrition";

const N = (over: Record<string, number>) =>
  over as unknown as PerServingNutrition;

describe("nutrientDensity", () => {
  it("is 0 for negligible-calorie items", () => {
    expect(nutrientDensity(N({ calories: 0, iron_mg: 5 }))).toBe(0);
  });

  it("scores a low-cal micro-rich side above a high-cal empty one", () => {
    const dense = N({
      calories: 40,
      iron_mg: 9,
      fiber_g: 14,
      vitaminC_mg: 45,
      magnesium_mg: 200,
    });
    const empty = N({ calories: 400, iron_mg: 0.5 });
    expect(nutrientDensity(dense)).toBeGreaterThan(nutrientDensity(empty));
    expect(isNutrientDense(dense)).toBe(true);
    expect(isNutrientDense(empty)).toBe(false);
  });

  it("is invariant to scaling calories + nutrients together (a ratio)", () => {
    const a = N({ calories: 100, iron_mg: 9, fiber_g: 14 });
    const b = N({ calories: 200, iron_mg: 18, fiber_g: 28 });
    expect(nutrientDensity(a)).toBe(nutrientDensity(b));
  });
});
