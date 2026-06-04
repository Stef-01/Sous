/**
 * Canonical ingredient registry — public surface.
 *
 * The data lives in `registry.generated.ts` (real USDA SR Legacy nutrient
 * vectors, produced by scripts/nutrition/usda-ingest.mjs). This module adds the
 * lookup + name-resolution helpers the rest of the app reads through.
 */

import type { Ingredient } from "@/types/ingredient";
import { INGREDIENTS } from "./registry.generated";

export { INGREDIENTS };

export const INGREDIENT_LIST: ReadonlyArray<Ingredient> =
  Object.values(INGREDIENTS);

export function getIngredient(id: string): Ingredient | null {
  return INGREDIENTS[id] ?? null;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** alias (normalized) → ingredient id. Exact keys are preferred over contains. */
const ALIAS_INDEX: ReadonlyMap<string, string> = (() => {
  const m = new Map<string, string>();
  for (const ing of INGREDIENT_LIST) {
    for (const key of [ing.id, ing.name, ...ing.aliases]) {
      const norm = normalize(key);
      if (norm && !m.has(norm)) m.set(norm, ing.id);
    }
  }
  return m;
})();

/** Longest aliases first so "extra virgin olive oil" wins over "olive". */
const CONTAINS_ALIASES: ReadonlyArray<readonly [string, string]> = Array.from(
  ALIAS_INDEX.entries(),
)
  .filter(([alias]) => alias.length >= 4)
  .sort((a, b) => b[0].length - a[0].length);

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Resolve a free-text ingredient name to a canonical id. Exact (normalized)
 * match first; then the most specific alias that appears as a whole phrase in
 * the input ("2 cloves garlic, minced" → "garlic"). Returns null rather than
 * guess — unresolved names are reported by the build, never silently dropped.
 */
export function resolveIngredientByName(name: string): string | null {
  const norm = normalize(name);
  if (!norm) return null;

  const exact = ALIAS_INDEX.get(norm);
  if (exact) return exact;

  for (const [alias, id] of CONTAINS_ALIASES) {
    if (new RegExp(`(^| )${escapeRegExp(alias)}( |$)`).test(norm)) return id;
  }
  return null;
}
