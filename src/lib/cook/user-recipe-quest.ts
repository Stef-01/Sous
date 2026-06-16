/**
 * Map a user's own recipe (a draft authored or pasted into the app) to a
 * QuestDish so "your creations" surface in the Today deck alongside curated
 * recipes — tagged `custom` (the "My creations" Source facet) and cookable
 * through the same Quest shell (the cook page already resolves drafts by slug).
 */

import type { UserRecipe } from "@/types/user-recipe";
import type { QuestDish } from "@/components/today/quest-card";

/** A user recipe as a deck candidate. pantryFit is 0 here; the live pantry
 *  recompute in QuestCard fills it in like any other dish. */
export function userRecipeToQuestDish(recipe: UserRecipe): QuestDish {
  return {
    dishName: recipe.title,
    slug: recipe.slug,
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
