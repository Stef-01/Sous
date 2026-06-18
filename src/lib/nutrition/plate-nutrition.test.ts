import { describe, expect, it } from "vitest";
import {
  summarizePlate,
  macroCalorieShares,
  type PlateNutritionInput,
} from "./plate-nutrition";

describe("summarizePlate", () => {
  const main: PlateNutritionInput = {
    name: "Grilled Salmon",
    slug: "grilled-salmon",
    role: "main",
  };
  const side: PlateNutritionInput = {
    name: "Air Fryer Edamame",
    slug: "air-fryer-edamame",
    role: "side",
  };
  const missing: PlateNutritionInput = {
    name: "Phantom Dish",
    slug: "no-such-dish-xyz",
    role: "side",
  };

  it("reads a serving of each seeded dish (seed values, per the diary getter)", () => {
    const { rows } = summarizePlate([main]);
    expect(rows).toHaveLength(1);
    expect(rows[0].hasData).toBe(true);
    // grilled-salmon seed = 380 kcal / 34 g protein.
    expect(rows[0].calories).toBe(380);
    expect(rows[0].protein_g).toBe(34);
    expect(rows[0].role).toBe("main");
  });

  it("marks an unresolvable dish data-less and never guesses its macros", () => {
    const { rows } = summarizePlate([missing]);
    expect(rows[0].hasData).toBe(false);
    expect(rows[0].calories).toBeNull();
    expect(rows[0].protein_g).toBeNull();
  });

  it("totals only the rows that have data, and counts the gaps", () => {
    const summary = summarizePlate([main, side, missing]);
    expect(summary.rows).toHaveLength(3);
    expect(summary.withData).toBe(2);
    expect(summary.missing).toBe(1);

    // Totals are a self-consistent sum of the rows that resolved.
    const expectedCal =
      (summary.rows[0].calories ?? 0) + (summary.rows[1].calories ?? 0);
    expect(summary.totals.calories).toBe(expectedCal);
    const expectedProtein =
      (summary.rows[0].protein_g ?? 0) + (summary.rows[1].protein_g ?? 0);
    expect(summary.totals.protein_g).toBe(expectedProtein);
  });

  it("is empty-safe", () => {
    const summary = summarizePlate([]);
    expect(summary.rows).toEqual([]);
    expect(summary.totals.calories).toBe(0);
    expect(summary.withData).toBe(0);
  });
});

describe("macroCalorieShares", () => {
  it("returns zeros when there is no macro mass (caller hides the bar)", () => {
    expect(macroCalorieShares({ protein_g: 0, carbs_g: 0, fat_g: 0 })).toEqual({
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  });

  it("splits by calorie weight (fat is 9 kcal/g) and sums to 1", () => {
    const s = macroCalorieShares({ protein_g: 10, carbs_g: 10, fat_g: 10 });
    expect(s.protein + s.carbs + s.fat).toBeCloseTo(1, 5);
    // Equal grams → fat dominates the calorie share (9 vs 4 vs 4).
    expect(s.fat).toBeGreaterThan(s.protein);
    expect(s.protein).toBeCloseTo(s.carbs, 5);
  });
});
