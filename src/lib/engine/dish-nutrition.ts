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
import { getRecipeLink } from "@/data/ingredients/recipe-links";
import { INGREDIENTS } from "@/data/ingredients";
import { composeRecipeNutrition } from "@/lib/nutrition/compose";

export interface DishNutrition {
  /** Composed per-serving nutrition (system-facing; see honesty note above). */
  perServing: PerServingNutrition | null;
  /** Fraction of source ingredient lines resolved to a positive gram mass. */
  massedCoverage: number;
}

export function getDishNutrition(
  slug: string | undefined,
  ingestedAt = "",
): DishNutrition {
  const empty: DishNutrition = { perServing: null, massedCoverage: 0 };
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
  };
}
