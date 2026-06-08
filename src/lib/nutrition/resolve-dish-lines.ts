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
import { quantityToGrams, isNegligibleQuantity } from "./quantity-to-grams";

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

  // Intentionally-massless lines (salt "to taste", herbs "for garnish") are not
  // missing data — they genuinely carry no real mass. Drop them up front so they
  // neither add nutrition nor count against coverage (the denominator below).
  const massBearing = raw.filter(
    (ing) => !isNegligibleQuantity(ing.quantity ?? ""),
  );

  for (const ing of massBearing) {
    const id = resolveIngredientByName(ing.name);
    if (!id) {
      unresolved.push(ing.name);
      continue;
    }
    const ingredient = getIngredient(id);
    const grams = ingredient
      ? quantityToGrams(ing.quantity ?? "", ingredient)
      : null;
    // Frying medium: a fat/oil listed for frying — the recipe lists the whole
    // bath but only a fraction is absorbed (composition handles the factor).
    // Triggered by an explicit "fry" cue OR by quantity: no dish CONSUMES ≥~1 cup
    // (≈200 g) of oil, so a bath that large is deep-frying oil, not a dressing or
    // sauté fat — this catches authored lines like "vegetable oil, 3 cups".
    const fryingMedium =
      ingredient?.foodGroup === "fat-oil" &&
      (/\bfry|frying|deep[-\s]?fr/i.test(`${ing.name} ${ing.quantity ?? ""}`) ||
        (grams ?? 0) >= 200);
    lines.push({
      ingredientId: id,
      grams: grams ?? 0,
      isOptional: Boolean(ing.isOptional),
      ...(fryingMedium ? { fryingMedium: true } : {}),
    });
  }

  return { lines, originalLineCount: massBearing.length, unresolved };
}
