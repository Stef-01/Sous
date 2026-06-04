/**
 * compose — derive a recipe's per-serving nutrition from its resolved
 * ingredient lines (Layer 3 of the ingredient nutrition architecture).
 *
 * `PerServingNutrition` stops being a hand-authored input and becomes this
 * pure function's output: Σ over lines of (per-100g vector × grams / 100),
 * divided by servings. The result feeds the EXISTING claim-thresholds /
 * dri-pediatric / fda-dv code unchanged. Deterministic; uses the Result
 * pattern (CLAUDE.md engine convention) so a missing ingredient is a typed
 * error, not a silent zero.
 */

import type {
  Ingredient,
  NutrientVector,
  ResolvedIngredientLine,
} from "@/types/ingredient";
import type { PerServingNutrition } from "@/types/nutrition";

const NUTRIENT_KEYS: ReadonlyArray<keyof NutrientVector> = [
  "calories",
  "calcium_mg",
  "iron_mg",
  "vitaminD_mcg",
  "vitaminA_mcg_rae",
  "fiber_g",
  "potassium_mg",
  "omega3_g",
  "zinc_mg",
  "magnesium_mg",
  "vitaminB12_mcg",
  "choline_mg",
  "sodium_mg",
  "addedSugar_g",
  "saturatedFat_g",
];

export type ComposeResult =
  | { success: true; data: PerServingNutrition }
  | { success: false; error: string };

function zeroVector(): NutrientVector {
  return {
    calories: 0,
    calcium_mg: 0,
    iron_mg: 0,
    vitaminD_mcg: 0,
    vitaminA_mcg_rae: 0,
    fiber_g: 0,
    potassium_mg: 0,
    omega3_g: 0,
    zinc_mg: 0,
    magnesium_mg: 0,
    vitaminB12_mcg: 0,
    choline_mg: 0,
    sodium_mg: 0,
    addedSugar_g: 0,
    saturatedFat_g: 0,
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Fraction of a deep-frying oil bath actually absorbed into the food. Deep-fried
 * foods take on roughly 8–12% of their own weight in oil while the listed bath
 * is far larger; counting the whole bath inflated dishes (karaage → ~1900 kcal).
 * A flat 0.10 is a documented heuristic, refined once cooked-weight data exists.
 */
export const FRYING_ABSORPTION = 0.1;

/**
 * Compose per-serving nutrition for a recipe.
 *
 * `ingredients` is the canonical registry keyed by id. The composed
 * `provenance`/`confidence` reflect the WEAKEST line: any non-USDA or
 * approximated ingredient downgrades the whole recipe to
 * `manual-estimate`/`approximated` (honest provenance, never overstated).
 */
export function composeRecipeNutrition(
  recipeSlug: string,
  servingsPerRecipe: number,
  lines: ReadonlyArray<ResolvedIngredientLine>,
  ingredients: Readonly<Record<string, Ingredient>>,
  ingestedAt: string,
): ComposeResult {
  if (servingsPerRecipe <= 0) {
    return { success: false, error: "servingsPerRecipe must be > 0" };
  }

  const total = zeroVector();
  let mapped = true;

  for (const line of lines) {
    const ing = ingredients[line.ingredientId];
    if (!ing) {
      return {
        success: false,
        error: `unknown ingredient: ${line.ingredientId}`,
      };
    }
    if (ing.provenance !== "usda-fdc" || ing.confidence !== "mapped") {
      mapped = false;
    }
    // Frying medium contributes only the absorbed fraction, not the whole bath.
    const grams = line.fryingMedium
      ? line.grams * FRYING_ABSORPTION
      : line.grams;
    const factor = grams / 100;
    for (const key of NUTRIENT_KEYS) {
      total[key] += ing.per100g[key] * factor;
    }
  }

  const perServing = zeroVector();
  for (const key of NUTRIENT_KEYS) {
    perServing[key] = round2(total[key] / servingsPerRecipe);
  }

  return {
    success: true,
    data: {
      recipeSlug,
      servingsPerRecipe,
      ...perServing,
      provenance: mapped ? "usda-fdc" : "manual-estimate",
      confidence: mapped ? "mapped" : "approximated",
      ingestedAt,
    },
  };
}
