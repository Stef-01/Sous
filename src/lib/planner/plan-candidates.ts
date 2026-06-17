import { buildQuestDishes } from "@/components/today/quest-pool";
import type { PoolCandidate } from "@/lib/planner/swipe-pool";

/**
 * Pure: real catalog-backed swipe-planner candidates.
 *
 * Re-sources from `buildQuestDishes` (the Today-page builder) so every card's
 * `recipeSlug` is a real `meal.id` / `side.id` that `/cook/[slug]` and the Today
 * pin resolve. Filtered to guided-cook dishes (`hasGuidedCook`) so "Cook now"
 * never dead-ends.
 *
 * Replaces the V1 stub (`patternsToCandidates`) that slugified pattern NAMES
 * into slugs absent from the catalog — 0/16 ever resolved, so every planned
 * meal dead-ended on "Cook now". See `plan-candidates.test.ts` for the
 * resolvability guard that would have caught that.
 */
export function catalogCandidates(pantryNames: string[]): PoolCandidate[] {
  return buildQuestDishes(undefined, undefined, pantryNames)
    .filter((d) => d.hasGuidedCook)
    .map((d) => ({
      recipeSlug: d.slug,
      title: d.dishName,
      cuisineFamily: d.cuisineFamily,
      ingredients: d.ingredientNames,
      prepTimeMinutes: d.cookTimeMinutes,
      dietaryFlags: [],
      heroImageUrl: d.heroImageUrl,
      source: "seed" as const,
    }));
}
