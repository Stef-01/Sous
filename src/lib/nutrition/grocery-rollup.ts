/**
 * W33 — Grocery nutrition preview. Sums the per-serving nutrition the PLANNED
 * recipes will deliver (one serving each). Framed as "what these meals deliver",
 * not "what's in your trolley" — it's about eating, not buying.
 *
 * No double-counting: callers pass the DISTINCT recipe slugs (the shopping list
 * already dedupes by sourceRecipeSlug), and each dish is summed once. Dishes
 * below the coverage floor (incl. branded items with no recipe nutrition) are
 * excluded and counted so the UI can be honest about partial coverage.
 */

import {
  getDishPerServing,
  NUTRITION_COVERAGE_FLOOR,
} from "@/lib/engine/dish-nutrition";

export interface GroceryNutritionRollup {
  /** Distinct recipes that contributed nutrition. */
  recipeCount: number;
  /** Recipes skipped (below coverage / no recipe nutrition, e.g. branded). */
  excludedCount: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export function groceryNutritionRollup(
  recipeSlugs: readonly string[],
): GroceryNutritionRollup | null {
  let recipeCount = 0;
  let excludedCount = 0;
  const sum = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };

  for (const slug of recipeSlugs) {
    const { perServing, coverage } = getDishPerServing(slug);
    if (!perServing || coverage < NUTRITION_COVERAGE_FLOOR) {
      excludedCount++;
      continue;
    }
    recipeCount++;
    sum.calories += perServing.calories ?? 0;
    sum.protein_g += perServing.protein_g ?? 0;
    sum.carbs_g += perServing.totalCarbs_g ?? 0;
    sum.fat_g += perServing.totalFat_g ?? 0;
    sum.fiber_g += perServing.fiber_g ?? 0;
  }

  if (recipeCount === 0) return null;

  return {
    recipeCount,
    excludedCount,
    calories: Math.round(sum.calories),
    protein_g: Math.round(sum.protein_g),
    carbs_g: Math.round(sum.carbs_g),
    fat_g: Math.round(sum.fat_g),
    fiber_g: Math.round(sum.fiber_g),
  };
}
