/**
 * quantity-to-grams — turn a recipe line's quantity string into a mass in
 * grams, so all nutrient math is mass-based (Layer 2 of the ingredient
 * nutrition architecture).
 *
 * Pure + deterministic. Handles the closed set of units our recipe data uses:
 * mass (g/kg/oz/lb), volume (tsp/tbsp/cup/ml/l/fl-oz → grams via the
 * ingredient's density), and count (clove/slice/piece/egg/… → grams via the
 * ingredient's per-piece mass). Returns null when the quantity can't be
 * resolved to a mass (e.g. "to taste", or a volume/count without the needed
 * conversion on the ingredient) — the caller flags nulls; it never guesses.
 */

import type { Ingredient } from "@/types/ingredient";

/** Mass units → grams. */
const MASS_TO_G: Record<string, number> = {
  mg: 0.001,
  g: 1,
  gram: 1,
  grams: 1,
  gr: 1,
  kg: 1000,
  kilo: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,
};

/** Volume units → fraction of a US cup (combined with density g/cup). */
const VOLUME_TO_CUP: Record<string, number> = {
  cup: 1,
  cups: 1,
  tbsp: 1 / 16,
  tbsps: 1 / 16,
  tablespoon: 1 / 16,
  tablespoons: 1 / 16,
  tsp: 1 / 48,
  tsps: 1 / 48,
  teaspoon: 1 / 48,
  teaspoons: 1 / 48,
  ml: 1 / 236.588,
  milliliter: 1 / 236.588,
  milliliters: 1 / 236.588,
  l: 1000 / 236.588,
  liter: 1000 / 236.588,
  liters: 1000 / 236.588,
  litre: 1000 / 236.588,
};

/** Countable units → use the ingredient's per-piece mass. */
const COUNT_UNITS = new Set([
  "clove",
  "cloves",
  "piece",
  "pieces",
  "slice",
  "slices",
  "fillet",
  "fillets",
  "egg",
  "eggs",
  "head",
  "heads",
  "stalk",
  "stalks",
  "sprig",
  "sprigs",
  "leaf",
  "leaves",
  "can",
  "cans",
  "whole",
  "large",
  "medium",
  "small",
]);

/** Non-quantities that contribute negligible mass; resolved to null. */
const NON_QUANTITY =
  /(to taste|as needed|for (garnish|serving|drizzling)|pinch|dash|optional)/;

const UNICODE_FRACTIONS: Record<string, number> = {
  "½": 0.5,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 0.25,
  "¾": 0.75,
  "⅕": 0.2,
  "⅛": 0.125,
};

/** Parse a leading amount: "2", "1.5", "1/2", "1 1/2", "1½", "1-2", "1 to 2". */
export function parseLeadingAmount(input: string): {
  amount: number | null;
  rest: string;
} {
  let s = input.trim();

  // Expand a leading unicode fraction glued to an integer, e.g. "1½" → "1 1/2".
  for (const [glyph, val] of Object.entries(UNICODE_FRACTIONS)) {
    if (s.includes(glyph)) {
      s = s.replace(glyph, ` ${val} `);
    }
  }
  // Collapse the whitespace the expansion introduced so the `^` anchors below
  // still match (e.g. "1½ cups" → "1 0.5 cups", "½ tsp" → "0.5 tsp").
  s = s.replace(/\s+/g, " ").trim();

  // Leading word-quantities common in recipes: "a clove", "an onion", "half a
  // cup", "quarter cup". (A bare "pinch"/"dash"/"handful" is caught earlier as a
  // non-quantity.)
  const word = s.match(/^(a|an|half|quarter)\b/i);
  if (word) {
    const w = word[1].toLowerCase();
    const amount = w === "half" ? 0.5 : w === "quarter" ? 0.25 : 1;
    // Drop a following "a"/"of" connector, e.g. "half a cup" → "cup".
    const rest = s
      .slice(word[0].length)
      .replace(/^\s+(a|an|of)\b/i, "")
      .trim();
    return { amount, rest };
  }

  // Range "1-2" / "1 to 2" → average of the two ends.
  const range = s.match(/^(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\b/);
  if (range) {
    const avg = (parseFloat(range[1]) + parseFloat(range[2])) / 2;
    return { amount: avg, rest: s.slice(range[0].length).trim() };
  }

  // Mixed number "1 1/2" or decimal-from-glyph "1 0.5".
  const mixed = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)\b/);
  if (mixed) {
    const amount =
      parseInt(mixed[1], 10) + parseInt(mixed[2], 10) / parseInt(mixed[3], 10);
    return { amount, rest: s.slice(mixed[0].length).trim() };
  }
  const mixedDecimal = s.match(/^(\d+)\s+(0?\.\d+)\b/);
  if (mixedDecimal) {
    return {
      amount: parseInt(mixedDecimal[1], 10) + parseFloat(mixedDecimal[2]),
      rest: s.slice(mixedDecimal[0].length).trim(),
    };
  }

  // Simple fraction "1/2".
  const frac = s.match(/^(\d+)\s*\/\s*(\d+)\b/);
  if (frac) {
    return {
      amount: parseInt(frac[1], 10) / parseInt(frac[2], 10),
      rest: s.slice(frac[0].length).trim(),
    };
  }

  // Plain integer or decimal.
  const num = s.match(/^(\d+(?:\.\d+)?)\b/);
  if (num) {
    return { amount: parseFloat(num[1]), rest: s.slice(num[0].length).trim() };
  }

  return { amount: null, rest: s };
}

/** Resolve a quantity string to grams for a given ingredient, or null. */
export function quantityToGrams(
  quantity: string,
  ingredient: Pick<Ingredient, "densityGPerCup" | "gramsPerPiece">,
): number | null {
  const q = quantity.trim().toLowerCase();
  if (q === "" || NON_QUANTITY.test(q)) return null;

  const { amount, rest } = parseLeadingAmount(q);
  if (amount === null) return null;

  // Unit token = first word of the remainder (strip punctuation).
  const unitToken = rest.replace(/^[^a-z]+/, "").split(/[\s,(]/)[0] ?? "";

  if (unitToken in MASS_TO_G) {
    return round(amount * MASS_TO_G[unitToken]);
  }

  // "fl oz" — two tokens.
  if (/^fl\.?\s*oz/.test(rest)) {
    return ingredient.densityGPerCup === null
      ? null
      : round(amount * (1 / 8) * ingredient.densityGPerCup);
  }

  if (unitToken in VOLUME_TO_CUP) {
    if (ingredient.densityGPerCup === null) return null;
    return round(amount * VOLUME_TO_CUP[unitToken] * ingredient.densityGPerCup);
  }

  // Count unit, or a bare number with no unit (e.g. "2 eggs", "3 tomatoes").
  if (unitToken === "" || COUNT_UNITS.has(unitToken)) {
    if (ingredient.gramsPerPiece === null) return null;
    return round(amount * ingredient.gramsPerPiece);
  }

  return null;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
