/**
 * Per-dish serving counts (the real base for nutrition + the serving slider).
 *
 * `DEFAULT_SIDE_SERVINGS` (4) is a defensible standard yield for a shared side
 * dish. `DISH_SERVINGS` overrides it for dishes whose real yield clearly
 * differs — dips/condiments that serve a crowd, single-portion items, etc. —
 * so the per-serving nutrition isn't divided by a wrong count. Meals carry their
 * own authored serving counts (meal-ingredients.ts); this is for the sides.
 *
 * Honest scope: this is curated data, not a derivation — a mass-based estimate
 * fails for low-density foods (a caesar salad's mass implies "1 serving"). Real
 * yields are the trustworthy source, so overrides are authored where they matter.
 */

export const DEFAULT_SIDE_SERVINGS = 4;

export const DISH_SERVINGS: Record<string, number> = {
  // Dips / salsas / relishes — serve a table, not a plate.
  guacamole: 6,
  "pico-de-gallo": 6,
  tzatziki: 6,
  raita: 6,
  "onion-raita": 6,
  "mango-chutney": 10,
  kimchi: 10,
  // Chip / cracker bowls.
  "tortilla-chips": 6,
  // Single- / small-portion items.
  "baked-potato": 2,
  // Snack / dumpling platters that stretch further.
  "bao-buns": 6,
  churros: 6,
  "spring-rolls": 6,
  "summer-rolls": 6,
  "crispy-wontons": 6,
  gyoza: 6,
  satay: 6,
  // Condiment-scale.
  "smashed-cucumber-salad": 6,
  sunomono: 6,
};

/** The base serving count for a side dish (override → default). */
export function sideServings(slug: string): number {
  return DISH_SERVINGS[slug] ?? DEFAULT_SIDE_SERVINGS;
}
