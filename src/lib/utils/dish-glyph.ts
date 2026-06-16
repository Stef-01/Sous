/**
 * Map a dish's tags + cuisine to a registered food glyph (planning.md §6.2 W2).
 * Mirrors `getDishEmoji`'s precedence (cuisine first, then dish type) so the
 * line-art glyph set can stand in for the emoji fallback anywhere. Returns
 * `null` when nothing matches — callers fall back to `getDishEmoji` (display
 * thumbnails) or the `utensils` glyph (the cuisine card fallback), so there is
 * never a regression to a blank.
 *
 * Pure + dependency-light (only a type-only import), so it is fully unit-tested.
 */

import type { FoodGlyphName } from "@/components/icons/food-glyphs";

/** Cuisine → glyph. Keyed by the same lowercase families as the dish-image
 *  gradients and `getDishEmoji`; each cuisine gets a distinct glyph (the old
 *  fallback reused four lucide icons across ten cuisines). */
const CUISINE_GLYPHS: Readonly<Record<string, FoodGlyphName>> = {
  japanese: "sushi",
  korean: "pot",
  thai: "noodles",
  chinese: "takeout",
  vietnamese: "pho",
  filipino: "egg",
  indian: "curry",
  italian: "pasta",
  mexican: "taco",
  mediterranean: "salad",
};

/** Dish-type tag groups → glyph, in `getDishEmoji` order (first match wins). */
const TYPE_GLYPH_RULES: ReadonlyArray<
  readonly [readonly string[], FoodGlyphName]
> = [
  [["salad", "fresh", "raw", "green", "greens"], "salad"],
  [["soup", "broth", "stew"], "soup"],
  [["rice", "fried rice"], "rice"],
  [["bread", "toast", "baked"], "bread"],
  [["pasta", "noodle", "noodles"], "pasta"],
  [["sweet", "dessert"], "dessert"],
  [["roasted", "grilled", "bbq", "grill"], "flame"],
  [["fish", "seafood", "shrimp"], "fish"],
  [["chicken", "poultry"], "drumstick"],
  [["beef", "pork", "meat", "lamb"], "beef"],
];

/** The cuisine glyph for a family, or `null` if the family isn't mapped. */
export function getCuisineGlyph(cuisine: string): FoodGlyphName | null {
  return CUISINE_GLYPHS[cuisine.trim().toLowerCase()] ?? null;
}

/** The best glyph for a dish: cuisine first (matches `getDishEmoji`), then dish
 *  type, else `null`. */
export function getDishGlyph(
  tags: string[],
  cuisine: string,
): FoodGlyphName | null {
  const cuisineGlyph = getCuisineGlyph(cuisine);
  if (cuisineGlyph) return cuisineGlyph;

  const lower = tags.map((t) => t.toLowerCase());
  for (const [keys, glyph] of TYPE_GLYPH_RULES) {
    if (lower.some((t) => keys.includes(t))) return glyph;
  }
  return null;
}

/** Exposed for the completeness test (every value must be a registered glyph). */
export const DISH_GLYPH_CUISINES = Object.keys(CUISINE_GLYPHS);
export const DISH_GLYPH_TYPE_RULES = TYPE_GLYPH_RULES;
