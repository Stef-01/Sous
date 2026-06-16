/**
 * Pantry staples + the missing-ingredient math behind Pantry Mode (Feature C).
 *
 * Pantry Mode anchors recommendations to what the user actually has. The catch:
 * nobody lists salt, oil, or the dried spice rack — so a recipe shouldn't be
 * judged "missing 4 ingredients" because it needs salt, pepper, oil and cumin.
 * `PANTRY_STAPLES` is the "~90% of kitchens always have this" set those checks
 * ignore. Superset of the engine's reuse `STAPLE_BLOCKLIST`.
 *
 * Pure + dependency-light (only the canonical name normaliser) so it unit-tests
 * without a DOM.
 */

import { STAPLE_BLOCKLIST } from "@/lib/engine/ingredient-reuse";
import { normalizePantryName } from "@/lib/hooks/use-pantry";

/** Lowercase staples. Single words match as whole words; multi-word entries
 *  match as a contained phrase (see `isStaple`). */
export const PANTRY_STAPLES: ReadonlySet<string> = new Set<string>([
  ...STAPLE_BLOCKLIST, // salt, pepper, black pepper, water, (olive/vegetable) oil, sugar, butter
  // salt / pepper family
  "kosher salt",
  "sea salt",
  "table salt",
  "white pepper",
  // oils / fats
  "canola oil",
  "sesame oil",
  "cooking spray",
  "nonstick spray",
  "ghee",
  // sweeteners + baking basics
  "brown sugar",
  "honey",
  "flour",
  "all-purpose flour",
  "baking soda",
  "baking powder",
  "cornstarch",
  "vanilla",
  "vanilla extract",
  // acids / everyday liquids
  "vinegar",
  "white vinegar",
  "soy sauce",
  // the common dried spice rack
  "cumin",
  "paprika",
  "smoked paprika",
  "chili powder",
  "chili flakes",
  "red pepper flakes",
  "cayenne",
  "garlic powder",
  "onion powder",
  "oregano",
  "dried oregano",
  "basil",
  "thyme",
  "rosemary",
  "cinnamon",
  "nutmeg",
  "turmeric",
  "curry powder",
  "garam masala",
  "coriander",
  "ground ginger",
  "cardamom",
  "cloves",
  "bay leaf",
  "bay leaves",
  "italian seasoning",
]);

const SINGLE_STAPLES: ReadonlySet<string> = new Set(
  [...PANTRY_STAPLES].filter((s) => !s.includes(" ")),
);
const PHRASE_STAPLES: ReadonlyArray<string> = [...PANTRY_STAPLES].filter((s) =>
  s.includes(" "),
);

/**
 * Is this ingredient one most kitchens always have (so Pantry Mode ignores it)?
 * Matches a whole staple word ("kosher salt" → salt) or a contained staple
 * phrase ("olive oil, divided" → olive oil) — but not a coincidental substring
 * ("salted caramel" is NOT salt). Normalises defensively.
 */
export function isStaple(rawName: string): boolean {
  const n = normalizePantryName(rawName);
  if (!n) return false;
  if (PANTRY_STAPLES.has(n)) return true;
  for (const phrase of PHRASE_STAPLES) if (n.includes(phrase)) return true;
  for (const word of n.split(/[^a-z]+/)) {
    if (word && SINGLE_STAPLES.has(word)) return true;
  }
  return false;
}

/**
 * How many of a recipe's ingredients you'd actually have to buy — not in the
 * pantry AND not a staple. `pantrySet` is expected pre-normalised; ingredient
 * names are normalised defensively. This is the number the tolerance slider
 * compares against.
 */
export function countMissingNonStaple(
  ingredientNames: ReadonlyArray<string>,
  pantrySet: ReadonlySet<string>,
): number {
  let missing = 0;
  for (const raw of ingredientNames) {
    const n = normalizePantryName(raw);
    if (!n) continue;
    if (pantrySet.has(n)) continue;
    if (isStaple(n)) continue;
    missing++;
  }
  return missing;
}

/**
 * Stable Pantry-Mode re-ranking: dishes makeable within `tolerance` missing
 * non-staple ingredients float to the top (fewest-missing first), the rest keep
 * their existing order below. A dish with no known ingredient list can't be
 * assessed, so it's treated as "beyond" — never falsely promoted as fully
 * in-pantry. Generic over anything carrying `ingredientNames`.
 */
export function prioritizeByPantry<T extends { ingredientNames: string[] }>(
  dishes: ReadonlyArray<T>,
  pantrySet: ReadonlySet<string>,
  tolerance: number,
): T[] {
  const within: { d: T; missing: number; i: number }[] = [];
  const beyond: T[] = [];
  dishes.forEach((d, i) => {
    const missing =
      d.ingredientNames.length === 0
        ? Number.POSITIVE_INFINITY
        : countMissingNonStaple(d.ingredientNames, pantrySet);
    if (missing <= tolerance) within.push({ d, missing, i });
    else beyond.push(d);
  });
  within.sort((a, b) => a.missing - b.missing || a.i - b.i);
  return [...within.map((x) => x.d), ...beyond];
}
