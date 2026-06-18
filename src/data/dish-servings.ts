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
  // Single-glass drinks — one smoothie is one serving (matches the source +
  // the per-recipe nutrition seed). Without this they'd inherit the side
  // default of 4 and the slider/diary would scale a single drink ×4.
  "turmeric-crush-smoothie": 1,
  "coconut-cloud-smoothie": 1,
  // Air-fryer edamame yields 5 (0.75-cup) servings per the Simply Scratch
  // source (simplyscratch.com/air-fryer-edamame); its per-recipe nutrition seed
  // is the source's per-serving label verbatim. Without this override the link
  // base would default to 4 and disagree with the seed's authored 5.
  "air-fryer-edamame": 5,
  // Viral recipes (founder-provided 2026-06-18) — yields match their seeds.
  "viral-caramelized-sweet-potatoes": 4,
  "scoopable-matcha-pistachio-chia-pudding": 2,
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
  // Chef Tu broth-heavy mains — a whole-chicken pho / big bone broth yields
  // ~6-8 bowls, so counting the whole protein ÷ the default 4 overstates every
  // serving. These are the big noodle soups; other mains keep the 4 default.
  "tu-pho-ga": 6,
  "tu-pho-dac-biet": 8,
  "tu-turkey-pho": 6,
  "tu-bun-bo-hue": 8,
  "tu-bun-rieu": 6,
  "tu-banh-canh-gio-heo-tom": 6,
};

/** The base serving count for a side dish (override → default). */
export function sideServings(slug: string): number {
  return DISH_SERVINGS[slug] ?? DEFAULT_SIDE_SERVINGS;
}
