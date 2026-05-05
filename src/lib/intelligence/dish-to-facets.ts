/**
 * dish-to-facets — best-effort mapping from a recipe / side / quest
 * card into the SignalFacets shape consumed by the intelligence
 * layer (Y5 D, audit P0 #6).
 *
 * Most call sites carry partial metadata: the QuestCard knows
 * cuisine + tags + ingredient names; the ResultStack knows
 * cuisine + tags. This helper accepts whatever the caller has
 * and returns a well-formed SignalFacets — empty arrays for
 * unknown axes.
 *
 * Pure / dependency-free.
 */

import type { SignalFacets } from "@/types/preference-profile";

const KNOWN_FLAVOR_TAGS = new Set([
  "spicy",
  "sweet",
  "sour",
  "umami",
  "savoury",
  "savory",
  "bitter",
  "tangy",
  "smoky",
  "fresh",
  "creamy",
  "crunchy",
  "rich",
  "light",
]);

const KNOWN_PROTEIN_TAGS = new Set([
  "chicken",
  "beef",
  "pork",
  "lamb",
  "fish",
  "salmon",
  "tuna",
  "shrimp",
  "tofu",
  "tempeh",
  "egg",
  "eggs",
  "lentil",
  "lentils",
  "bean",
  "beans",
  "chickpea",
  "chickpeas",
  "paneer",
  "vegetarian",
  "vegan",
]);

const KNOWN_DISH_CLASS_TAGS = new Set([
  "curry",
  "stir-fry",
  "noodle",
  "noodles",
  "bowl",
  "salad",
  "soup",
  "stew",
  "pasta",
  "rice",
  "taco",
  "tacos",
  "wrap",
  "sandwich",
  "burger",
  "pizza",
  "dumpling",
  "dumplings",
  "kebab",
  "roast",
]);

interface DishLike {
  cuisineFamily?: string | null;
  tags?: ReadonlyArray<string> | null;
  ingredients?: ReadonlyArray<string> | null;
  /** Optional explicit dish-class. Defaults to first hit in tags. */
  dishClass?: string | null;
}

/**
 * Pure: build a SignalFacets from any DishLike. Lowercases tags
 * and deduplicates each axis. Unknown values map to empty arrays
 * so the signal still records cleanly.
 */
export function dishToFacets(input: DishLike): SignalFacets {
  const tags = (input.tags ?? []).map((t) => t.toLowerCase().trim());
  const flavors = unique(tags.filter((t) => KNOWN_FLAVOR_TAGS.has(t)));
  const proteins = unique(tags.filter((t) => KNOWN_PROTEIN_TAGS.has(t)));
  const dishClassFromTags = tags.find((t) => KNOWN_DISH_CLASS_TAGS.has(t));
  const dishClass = (input.dishClass ?? dishClassFromTags ?? "").toLowerCase();
  const ingredients = unique(
    (input.ingredients ?? [])
      .map((i) => i.toLowerCase().trim())
      .filter(Boolean),
  );
  return {
    cuisine: (input.cuisineFamily ?? "").toLowerCase(),
    flavors,
    proteins,
    dishClass,
    ingredients,
  };
}

function unique<T>(arr: ReadonlyArray<T>): T[] {
  return Array.from(new Set(arr));
}
