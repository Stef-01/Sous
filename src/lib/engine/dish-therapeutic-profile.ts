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
import { getIngredient } from "@/data/ingredients";

export interface DishTherapeuticProfile {
  foodGroups: FoodGroup[];
  therapeuticClasses: TherapeuticClass[];
}

const EMPTY: DishTherapeuticProfile = {
  foodGroups: [],
  therapeuticClasses: [],
};

export function getDishTherapeuticProfile(
  slug: string | undefined,
): DishTherapeuticProfile {
  if (!slug) return EMPTY;
  const link = getRecipeLink(slug);
  if (!link) return EMPTY;

  const groups = new Set<FoodGroup>();
  const classes = new Set<TherapeuticClass>();
  for (const line of link.lines) {
    const ing = getIngredient(line.ingredientId);
    if (!ing) continue;
    groups.add(ing.foodGroup);
    for (const c of ing.therapeuticClasses) classes.add(c);
  }
  return {
    foodGroups: [...groups],
    therapeuticClasses: [...classes],
  };
}
