/**
 * resolveDishLines — the pure core of dish → canonical ingredient resolution.
 *
 * Extracted from scripts/nutrition/resolve-dishes.mjs so the SAME deterministic
 * logic that generates the vendored link table can be unit-tested AND used by a
 * drift guard (recompute → compare to the committed file). The script owns I/O
 * + the coverage report; this owns the resolution.
 */

import type { ResolvedIngredientLine } from "@/types/ingredient";
import { resolveIngredientByName, getIngredient } from "@/data/ingredients";
import { quantityToGrams } from "./quantity-to-grams";

export interface RawIngredientLine {
  name: string;
  quantity?: string;
  isOptional?: boolean;
}

export interface ResolvedDishLines {
  lines: ResolvedIngredientLine[];
  /** Total source lines (resolved + unresolved) — drives coverage. */
  originalLineCount: number;
  /** Names that did not resolve to a canonical ingredient. */
  unresolved: string[];
}

export function resolveDishLines(
  raw: ReadonlyArray<RawIngredientLine>,
): ResolvedDishLines {
  const lines: ResolvedIngredientLine[] = [];
  const unresolved: string[] = [];

  for (const ing of raw) {
    const id = resolveIngredientByName(ing.name);
    if (!id) {
      unresolved.push(ing.name);
      continue;
    }
    const ingredient = getIngredient(id);
    const grams = ingredient
      ? quantityToGrams(ing.quantity ?? "", ingredient)
      : null;
    lines.push({
      ingredientId: id,
      grams: grams ?? 0,
      isOptional: Boolean(ing.isOptional),
    });
  }

  return { lines, originalLineCount: raw.length, unresolved };
}
