import { describe, it, expect } from "vitest";
import { allSeededNutrition } from "./per-recipe";

/**
 * The diary + grocery rollup prefer these hand-authored seeds (getDishPerServing
 * is seed-first), so a seed missing macros silently logs calories with zero
 * protein/carbs/fat. These guards keep every seed complete and self-consistent.
 */
describe("per-recipe nutrition seeds", () => {
  const seeds = allSeededNutrition();

  it("has at least the curated set", () => {
    expect(seeds.length).toBeGreaterThanOrEqual(13);
  });

  it("covers every seed with positive calories + the core macro fields", () => {
    for (const s of seeds) {
      expect(s.calories ?? 0, `${s.recipeSlug} calories`).toBeGreaterThan(0);
      expect(typeof s.protein_g, `${s.recipeSlug} protein_g`).toBe("number");
      expect(typeof s.totalCarbs_g, `${s.recipeSlug} totalCarbs_g`).toBe(
        "number",
      );
      expect(typeof s.totalFat_g, `${s.recipeSlug} totalFat_g`).toBe("number");
    }
  });

  it("has macros that reconcile with calories (Atwater 4/4/9, within tolerance)", () => {
    for (const s of seeds) {
      const atwater =
        4 * (s.protein_g ?? 0) +
        4 * (s.totalCarbs_g ?? 0) +
        9 * (s.totalFat_g ?? 0);
      const cal = s.calories ?? 0;
      const ratio = atwater / cal;
      // Atwater on total (not net) carbs runs a touch high for high-fibre dishes;
      // manual estimates are coarse. A real seed lands well inside this band — a
      // typo (e.g. fat in mg, a dropped macro) falls outside it.
      expect(
        ratio,
        `${s.recipeSlug}: Atwater ${Math.round(atwater)} vs ${cal} kcal`,
      ).toBeGreaterThan(0.8);
      expect(
        ratio,
        `${s.recipeSlug}: Atwater ${Math.round(atwater)} vs ${cal} kcal`,
      ).toBeLessThan(1.25);
    }
  });
});
