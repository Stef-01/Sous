/**
 * Dish → therapeutic profile (the ingredient-registry bridge).
 *
 * Reads a dish's resolved ingredient links and unions the food groups +
 * therapeutic classes its ingredients realize. This is what lets the evidence
 * engine match on food identity ("Masoor Dal" → red-lentils → legume) instead
 * of substring spelling. Pure + deterministic; empty for dishes without
 * resolved ingredients (the matcher then falls back to substring on dish text).
 */

import type { FoodGroup, TherapeuticClass } from "@/types/ingredient";
import { getRecipeLink } from "@/data/ingredients/recipe-links";
import { getIngredient, resolveIngredientsInText } from "@/data/ingredients";

export interface DishTherapeuticProfile {
  foodGroups: FoodGroup[];
  therapeuticClasses: TherapeuticClass[];
}

const EMPTY: DishTherapeuticProfile = {
  foodGroups: [],
  therapeuticClasses: [],
};

function profileFromIngredientIds(
  ids: ReadonlyArray<string>,
): DishTherapeuticProfile {
  const groups = new Set<FoodGroup>();
  const classes = new Set<TherapeuticClass>();
  for (const id of ids) {
    const ing = getIngredient(id);
    if (!ing) continue;
    groups.add(ing.foodGroup);
    for (const c of ing.therapeuticClasses) classes.add(c);
  }
  return {
    foodGroups: [...groups],
    therapeuticClasses: [...classes],
  };
}

/**
 * A dish's food-identity profile. Prefers the structured ingredient links
 * (sides / guided-cook dishes); for dishes WITHOUT links (meals carry only a
 * name + tags), falls back to resolving `fallbackText` against the registry —
 * so "Masoor Dal" still surfaces a legume identity from its own name. The
 * fallback only reports ingredients actually named, never guessed.
 */
export function getDishTherapeuticProfile(
  slug: string | undefined,
  fallbackText?: string,
): DishTherapeuticProfile {
  const link = slug ? getRecipeLink(slug) : null;
  if (link && link.lines.length > 0) {
    return profileFromIngredientIds(link.lines.map((l) => l.ingredientId));
  }
  if (fallbackText) {
    const ids = resolveIngredientsInText(fallbackText);
    if (ids.length > 0) return profileFromIngredientIds(ids);
  }
  return EMPTY;
}
