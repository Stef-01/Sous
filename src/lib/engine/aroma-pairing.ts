/**
 * Aroma-pairing helpers (Y3 W17).
 *
 * Pure-helper layer that scores how well a combination of
 * ingredients pairs by aroma-profile proximity. Replaces the
 * W8 novelty engine's stub patternPairingScore (which returned
 * 0.9 blanket).
 *
 * The W8 engine consumes `combinationPairingScore(items, profiles)`
 * — given a list of ingredient names + the aroma-profile map,
 * returns a 0..1 pairing quality.
 *
 * Algorithm:
 *   1. Map each ingredient → aroma-profile-slug (via the
 *      `INGREDIENT_TO_AROMA` lookup table).
 *   2. Resolve each profile to its aroma-tag set.
 *   3. Pairing quality = average pairwise tag-overlap across
 *      all ingredient pairs.
 *
 * Pure / dependency-free / deterministic.
 */

import aromaProfilesRaw from "@/data/aroma-profiles.json";

export interface AromaProfile {
  label: string;
  tags: ReadonlyArray<string>;
}

/** Curated aroma-profile catalog. Imported once; consumers
 *  pass-through. Eight starter profiles cover the common
 *  pantry shapes the W8 dish-shape catalog uses. */
export const AROMA_PROFILES = aromaProfilesRaw as Record<string, AromaProfile>;

/** Pure: map an ingredient name to an aroma-profile slug.
 *  V1 stub — small lookup table covering the W8 dish-shape
 *  pattern ingredients. Future expansion adds aliases as the
 *  pattern catalog grows. */
const INGREDIENT_TO_AROMA: Record<string, string> = {
  // Cured meats / proteins
  ham: "savoury-meaty",
  prosciutto: "savoury-meaty",
  salami: "savoury-meaty",
  // Cheeses
  "sharp cheese": "umami-deep",
  cheddar: "umami-deep",
  gruyere: "umami-deep",
  manchego: "umami-deep",
  parmesan: "umami-deep",
  feta: "fermented-tangy",
  "goat cheese": "fermented-tangy",
  mozzarella: "creamy-rich",
  burrata: "creamy-rich",
  // Fruits
  pear: "fruity-sweet",
  apple: "fruity-sweet",
  fig: "fruity-sweet",
  // Veg
  tomato: "fruity-sweet",
  tomatoes: "fruity-sweet",
  "cherry tomato": "fruity-sweet",
  basil: "herbal-fresh",
  spinach: "herbal-fresh",
  kale: "herbal-fresh",
  "swiss chard": "herbal-fresh",
  cucumber: "herbal-fresh",
  dill: "herbal-fresh",
  mint: "herbal-fresh",
  // Pantry staples
  chickpeas: "earthy-deep",
  garbanzo: "earthy-deep",
  lemon: "citrus-bright",
  "lemon zest": "citrus-bright",
  lime: "citrus-bright",
  "olive oil": "creamy-rich",
  // Bakery
  bread: "starchy-comforting",
  sourdough: "starchy-comforting",
  ciabatta: "starchy-comforting",
  // Other
  eggs: "creamy-rich",
  egg: "creamy-rich",
  "greek yogurt": "fermented-tangy",
  yogurt: "fermented-tangy",
  avocado: "creamy-rich",
};

/** Pure: lookup the aroma profile slug for an ingredient
 *  name. Case-insensitive. Returns null when the ingredient
 *  isn't in the table. */
export function ingredientAromaSlug(name: string): string | null {
  const norm = name.toLowerCase().trim();
  if (norm.length === 0) return null;
  return INGREDIENT_TO_AROMA[norm] ?? null;
}

/** Pure: tag-overlap fraction between two profiles. 0..1.
 *  1.0 = identical tag sets. 0 = no shared tags. Symmetric. */
export function profilePairingScore(a: AromaProfile, b: AromaProfile): number {
  if (a.tags.length === 0 || b.tags.length === 0) return 0;
  const aSet = new Set(a.tags);
  const bSet = new Set(b.tags);
  let intersection = 0;
  for (const tag of aSet) if (bSet.has(tag)) intersection += 1;
  // Jaccard-ish similarity: intersection / union.
  const unionSize = new Set([...aSet, ...bSet]).size;
  return unionSize === 0 ? 0 : intersection / unionSize;
}

/** Pure: average pairwise pairing score across a combination
 *  of ingredients. Returns 0..1.
 *
 *  Returns 0.5 (neutral) when fewer than 2 ingredients have a
 *  resolved aroma profile — too few signals to discriminate;
 *  the engine should defer to other factors. */
export function combinationPairingScore(
  ingredients: ReadonlyArray<string>,
  profiles: Record<string, AromaProfile> = AROMA_PROFILES,
): number {
  const resolvedProfiles: AromaProfile[] = [];
  for (const ing of ingredients) {
    const slug = ingredientAromaSlug(ing);
    if (!slug) continue;
    const profile = profiles[slug];
    if (profile) resolvedProfiles.push(profile);
  }

  if (resolvedProfiles.length < 2) return 0.5;

  let total = 0;
  let pairs = 0;
  for (let i = 0; i < resolvedProfiles.length; i++) {
    for (let j = i + 1; j < resolvedProfiles.length; j++) {
      const a = resolvedProfiles[i];
      const b = resolvedProfiles[j];
      if (a && b) {
        total += profilePairingScore(a, b);
        pairs += 1;
      }
    }
  }
  return pairs === 0 ? 0.5 : total / pairs;
}
