/**
 * Ingredient typeahead — ranks the canonical ingredient registry against a
 * free-text query so the pantry can offer search-to-add (instead of AI import
 * being the only way in). Matches the ingredient name AND its aliases (so
 * "masoor" finds Red lentils), but always returns the canonical display name.
 *
 * Pure + dependency-light (reads the static registry) so it's unit-testable.
 */

import { INGREDIENT_LIST } from "@/data/ingredients";

export interface IngredientHit {
  id: string;
  name: string;
}

/** Lowest score = best match. Infinity = no match. */
function scoreIngredient(
  name: string,
  aliases: readonly string[],
  q: string,
): number {
  const n = name.toLowerCase();
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.split(/\s+/).some((w) => w.startsWith(q))) return 2;
  if (n.includes(q)) return 3;
  const a = aliases.map((x) => x.toLowerCase());
  if (a.some((x) => x === q || x.startsWith(q))) return 4;
  if (a.some((x) => x.includes(q))) return 5;
  return Infinity;
}

/**
 * Top ingredient matches for `query`, ranked (exact → name-prefix → word-prefix
 * → name-substring → alias). Returns [] for queries under 2 chars (too broad).
 * Deduped by display name; capped at `limit`.
 */
export function searchIngredients(query: string, limit = 6): IngredientHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const scored: Array<{ hit: IngredientHit; score: number }> = [];
  for (const ing of INGREDIENT_LIST) {
    const score = scoreIngredient(ing.name, ing.aliases, q);
    if (score !== Infinity) {
      scored.push({ hit: { id: ing.id, name: ing.name }, score });
    }
  }

  scored.sort(
    (a, b) =>
      a.score - b.score ||
      a.hit.name.length - b.hit.name.length ||
      a.hit.name.localeCompare(b.hit.name),
  );

  const seen = new Set<string>();
  const out: IngredientHit[] = [];
  for (const { hit } of scored) {
    const key = hit.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(hit);
    if (out.length >= limit) break;
  }
  return out;
}
