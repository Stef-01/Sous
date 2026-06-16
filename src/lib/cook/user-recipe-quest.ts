/**
 * Map a user's own recipe (a draft authored or pasted into the app) to a
 * QuestDish so "your creations" surface in the Today deck alongside curated
 * recipes — tagged `custom` (the "My creations" Source facet) and cookable
 * through the same Quest shell (the cook page already resolves drafts by slug).
 */

import type { UserRecipe } from "@/types/user-recipe";
import type { QuestDish } from "@/components/today/quest-card";

/** A user recipe as a deck candidate. pantryFit starts at 0; QuestCard
 *  recomputes it against the live pantry (via computePantryFit) when it injects
 *  these into the Main feed, using the ingredientNames populated here. */
export function userRecipeToQuestDish(recipe: UserRecipe): QuestDish {
  return {
    dishName: recipe.title,
    // `custom-` prefix so the cook route is unambiguously a user creation and
    // can never collide with a catalog slug of the same name (the cook page
    // strips the prefix to resolve the draft). Also makes getRecipeSource →
    // "custom" on its own, independent of the explicit source below.
    slug: `custom-${recipe.slug}`,
    heroImageUrl: recipe.heroImageUrl ?? null,
    cookTimeMinutes: recipe.cookTimeMinutes,
    cuisineFamily: recipe.cuisineFamily,
    description: recipe.description,
    tags: recipe.flavorProfile ?? [],
    ingredientCount: recipe.ingredients.length,
    ingredientNames: recipe.ingredients.map((i) => i.name),
    hasGuidedCook: true,
    isMeal: true,
    isVerified: recipe.source === "nourish-verified",
    source: "custom",
    role: "main",
    pantryFit: 0,
  };
}
