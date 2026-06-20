/**
 * dish-to-food — turn a REAL Sous dish (a meals.json / sides.json id) into a
 * feedable DogeFoodDef. This is the bridge for "cook one pho in Sous → gain one
 * pho you can feed the dog."
 *
 * Rule 7 (no invented dishes/images/nutrition):
 *   - Only ids that exist in meals.json or sides.json produce a food; anything
 *     else (user-created `custom-*`, unknown) returns null and grants nothing.
 *   - The chip image is the dish's OWN /food_images/*.png when it has one, else a
 *     real existing foods_on.png cell — never a generated sprite.
 *   - hunger/fun/health are a deterministic GAMEPLAY band, never surfaced as a
 *     nutrition claim (any real nutrition text comes only from the sourced
 *     fun-facts pool).
 */
import mealsData from "@/data/meals.json";
import sidesData from "@/data/sides.json";
import type { DogeFoodDef } from "./bridge-protocol";

interface MealRow {
  id: string;
  name: string;
  heroImageUrl?: string | null;
  cuisine?: string | null;
}
interface SideRow {
  id: string;
  name: string;
  imageUrl?: string | null;
}

const MEALS = mealsData as MealRow[];
const SIDES = sidesData as SideRow[];

// Real existing foods_on.png cells (33x33 grid, 1-based) used only when a dish
// has no photo of its own.
const MEAL_FALLBACK_SPRITE = 542;
const SIDE_FALLBACK_SPRITE = 515;

// Deterministic gameplay bands (mirror native food magnitudes: bread 15 / meal 40).
const MEAL_BAND = { hunger: 40, fun: 8, health: 6 };
const SIDE_BAND = { hunger: 18, fun: 4, health: 3 };

function cleanImage(url: string | null | undefined): string | null {
  return typeof url === "string" && url.trim().length > 0 ? url : null;
}

/**
 * Map a dish slug to a feedable food, or null if it isn't a real catalog dish.
 * Meals are checked first (a few ids could be reused, meals win).
 */
export function dishToFood(slug: string): DogeFoodDef | null {
  if (!slug || slug.startsWith("custom-")) return null;

  const meal = MEALS.find((m) => m.id === slug);
  if (meal) {
    return {
      id: meal.id,
      name: meal.name,
      customImage: cleanImage(meal.heroImageUrl),
      spriteFallback: MEAL_FALLBACK_SPRITE,
      hunger_replenish: MEAL_BAND.hunger,
      fun_replenish: MEAL_BAND.fun,
      health_replenish: MEAL_BAND.health,
      cuisine: meal.cuisine ?? "",
    };
  }

  const side = SIDES.find((s) => s.id === slug);
  if (side) {
    return {
      id: side.id,
      name: side.name,
      customImage: cleanImage(side.imageUrl),
      spriteFallback: SIDE_FALLBACK_SPRITE,
      hunger_replenish: SIDE_BAND.hunger,
      fun_replenish: SIDE_BAND.fun,
      health_replenish: SIDE_BAND.health,
      cuisine: "",
    };
  }

  return null;
}
