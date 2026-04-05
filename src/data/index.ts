import type { Meal, SideDish } from "@/types";
import mealsData from "./meals.json";
import sidesData from "./sides.json";

export const meals: Meal[] = mealsData;
export const sides: SideDish[] = sidesData as SideDish[];

const sidesMap = new Map<string, SideDish>();
for (const side of sides) {
  sidesMap.set(side.id, side);
}

export function getSideById(id: string): SideDish | undefined {
  return sidesMap.get(id);
}

export function getSidesByIds(ids: string[]): SideDish[] {
  return ids
    .map((id) => sidesMap.get(id))
    .filter((s): s is SideDish => s !== undefined);
}

/**
 * Resolve a freeform main dish text to a meal slug via fuzzy name/alias matching.
 * Returns the meal ID (slug) if found, null otherwise.
 */
export function resolveMealSlug(text: string): string | null {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return null;

  // Exact match on name or alias
  for (const meal of meals) {
    if (meal.name.toLowerCase() === normalized) return meal.id;
    if (meal.aliases.some((a) => a.toLowerCase() === normalized)) return meal.id;
  }

  // Substring match — meal name contained in query or query contained in meal name
  for (const meal of meals) {
    const mealLower = meal.name.toLowerCase();
    if (normalized.includes(mealLower) || mealLower.includes(normalized)) return meal.id;
    for (const alias of meal.aliases) {
      const aliasLower = alias.toLowerCase();
      if (normalized.includes(aliasLower) || aliasLower.includes(normalized)) return meal.id;
    }
  }

  return null;
}
