/**
 * Dish nutrition — compose per-serving nutrition from resolved ingredient links
 * (the capability that lets the health system "understand the nutrition
 * composition of everything").
 *
 * IMPORTANT (honesty, rule 7): the composed per-serving macros are returned for
 * the system to reason over, but are NOT yet display-grade as absolute numbers —
 * two data gaps distort them: (1) deep-frying / marinade oils are listed in full
 * but mostly not consumed (e.g. karaage composes to ~1900 kcal), and (2) serving
 * counts are a default until per-dish serving data exists. The UI therefore
 * surfaces the robust, mass- and serving-INDEPENDENT signal — the dish's
 * whole-food composition (food groups) — not raw calories. Absolute macros land
 * once cooked-weight + oil-absorption + serving data are modeled.
 */

import type { PerServingNutrition } from "@/types/nutrition";
import type { FoodGroup, TherapeuticClass } from "@/types/ingredient";
import { getRecipeLink } from "@/data/ingredients/recipe-links";
import { INGREDIENTS, getIngredient } from "@/data/ingredients";
import {
  composeRecipeNutrition,
  FRYING_ABSORPTION,
} from "@/lib/nutrition/compose";

export interface DishNutrition {
  /** Composed per-serving nutrition (system-facing; see honesty note above). */
  perServing: PerServingNutrition | null;
  /** Fraction of source ingredient lines resolved to a positive gram mass. */
  massedCoverage: number;
  /** Ingredient lines that resolved to a gram mass (and so were counted). */
  massedLines: number;
  /** Total ingredient lines in the source recipe. */
  totalLines: number;
}

export function getDishNutrition(
  slug: string | undefined,
  ingestedAt = "",
): DishNutrition {
  const empty: DishNutrition = {
    perServing: null,
    massedCoverage: 0,
    massedLines: 0,
    totalLines: 0,
  };
  if (!slug) return empty;
  const link = getRecipeLink(slug);
  if (!link || link.lines.length === 0) return empty;

  const massed = link.lines.filter((l) => l.grams > 0).length;
  const massedCoverage = link.originalLineCount
    ? massed / link.originalLineCount
    : 0;

  const result = composeRecipeNutrition(
    link.recipeSlug,
    link.servingsPerRecipe,
    link.lines,
    INGREDIENTS,
    ingestedAt,
  );
  return {
    perServing: result.success ? result.data : null,
    massedCoverage,
    massedLines: massed,
    totalLines: link.originalLineCount,
  };
}

export interface DishCompositionGrams {
  /** Per-serving grams contributed by each food group present. */
  byGroup: Partial<Record<FoodGroup, number>>;
  /** Per-serving grams contributed by each therapeutic class present. */
  byClass: Partial<Record<TherapeuticClass, number>>;
}

/**
 * Per-serving grams of each food group + therapeutic class in a dish. This is
 * the quantity context behind a match — "this dish has ~67 g legumes/serving" —
 * so the panel can show how much of the realizing food is actually present
 * (honest dose context; food grams are a proxy for the active-compound dose,
 * not the dose itself). Frying medium counts at its absorbed fraction.
 */
export function getDishCompositionGrams(
  slug: string | undefined,
): DishCompositionGrams {
  const empty: DishCompositionGrams = { byGroup: {}, byClass: {} };
  if (!slug) return empty;
  const link = getRecipeLink(slug);
  if (!link || link.servingsPerRecipe <= 0) return empty;

  const byGroup: Partial<Record<FoodGroup, number>> = {};
  const byClass: Partial<Record<TherapeuticClass, number>> = {};
  for (const line of link.lines) {
    if (line.grams <= 0) continue;
    const ing = getIngredient(line.ingredientId);
    if (!ing) continue;
    const grams =
      (line.fryingMedium ? line.grams * FRYING_ABSORPTION : line.grams) /
      link.servingsPerRecipe;
    byGroup[ing.foodGroup] = (byGroup[ing.foodGroup] ?? 0) + grams;
    for (const c of ing.therapeuticClasses) {
      byClass[c] = (byClass[c] ?? 0) + grams;
    }
  }
  return { byGroup, byClass };
}
