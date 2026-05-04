/**
 * Viral-recipe dedup (Y2 Sprint J W41).
 *
 * Avoid surfacing a viral recipe to a user who already has it
 * in their drafts, the Sous seed catalog, or recently passed on
 * a near-duplicate. The signal is a perceptual hash over the
 * recipe's stable identity:
 *   - canonical title (lowercased + qualifier-stripped)
 *   - key ingredient set (sorted, deduped)
 *   - cuisine family
 *
 * Two recipes with the same hash are "the same recipe" for the
 * purpose of the W42 chip surfaced on /today. Different
 * formulations (different oil, different garnish) survive as
 * distinct hashes — we want generosity here, since we'd rather
 * miss a dupe than suppress a recipe the user actually wants.
 *
 * Pure / dependency-free / deterministic.
 */

import { normaliseIngredientName } from "@/lib/engine/pantry-coverage";

export interface DedupShape {
  /** Recipe title — any case, any length. */
  title: string;
  /** Cuisine family (italian, indian, etc.). Lowercased
   *  internally. */
  cuisineFamily: string;
  /** Ingredient names — canonical or messy (this helper
   *  normalises). Optional ingredients should be excluded by
   *  the caller for stable hashing. */
  ingredients: ReadonlyArray<string>;
}

/** Words stripped from the title before hashing — recipe
 *  authors phrase the same dish many ways ("the BEST", "easy",
 *  "the famous"). Conservative list — keep adjacents like
 *  "spicy" / "vegan" since those genuinely mean different
 *  recipes. */
const TITLE_NOISE_WORDS: ReadonlyArray<string> = [
  "best",
  "easy",
  "quick",
  "the",
  "a",
  "an",
  "famous",
  "ultimate",
  "perfect",
  "homemade",
  "classic",
  "authentic",
  "traditional",
  "recipe",
];

/** Pure: normalise a recipe title for hashing. Lowercase +
 *  drop noise words + drop punctuation + collapse whitespace. */
export function normaliseDedupTitle(raw: string): string {
  if (typeof raw !== "string") return "";
  let s = raw.toLowerCase().trim();
  // Drop punctuation.
  s = s.replace(/[.,;:!?'"`()[\]{}]/g, "");
  // Drop noise words (whole-word).
  for (const w of TITLE_NOISE_WORDS) {
    const re = new RegExp(`(?:^|\\s)${w}(?:\\s|$)`, "g");
    s = s.replace(re, " ");
  }
  return s.replace(/\s+/g, " ").trim();
}

/** Pure: produce a stable hash string for a recipe shape. The
 *  hash is human-readable on purpose — easier to debug + grep
 *  for during dedup investigations. Format:
 *    "<cuisine>:<title-tokens>:<ingredient-tokens>"
 *
 *  Tokens are sorted so input order doesn't change the hash. */
export function recipeDedupHash(shape: DedupShape): string {
  const cuisine =
    typeof shape.cuisineFamily === "string"
      ? shape.cuisineFamily.toLowerCase().trim()
      : "";
  const title = normaliseDedupTitle(shape.title);
  const titleTokens = title
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .sort();
  const ingTokens = Array.from(
    new Set(
      shape.ingredients
        .map((i) => normaliseIngredientName(i))
        .filter((i) => i.length > 0),
    ),
  ).sort();
  return `${cuisine}:${titleTokens.join("|")}:${ingTokens.join("|")}`;
}

/** Pure: is the candidate recipe a dupe of anything in the
 *  existing pool? Returns the matching existing-pool slug when
 *  found, null otherwise. */
export function findDuplicateInPool(
  candidate: DedupShape,
  pool: ReadonlyArray<{ slug: string } & DedupShape>,
): string | null {
  const candHash = recipeDedupHash(candidate);
  for (const entry of pool) {
    if (recipeDedupHash(entry) === candHash) return entry.slug;
  }
  return null;
}
