/**
 * User-recipe nutrition (#5) — compose a per-serving vector for a USER-typed
 * recipe through the SAME registry the catalogue uses: names resolve via the
 * alias index (resolveIngredientByName), quantities parse to grams using each
 * ingredient's own density/piece data, vectors sum from per100g and divide by
 * servings. Coverage-gated like every other dish (no vector, no claim).
 *
 * Honest approximation notes (not hidden): volume→grams uses densityGPerCup
 * when the registry has it (tbsp = cup/16, tsp = cup/48); ml assumes the same
 * density, or water-density when absent; countable units need gramsPerPiece.
 * Unparseable lines are EXCLUDED and pull coverage down rather than guessing.
 */

import { getIngredient, resolveIngredientByName } from "@/data/ingredients";
import type { Ingredient } from "@/types/ingredient";
import type { PerServingNutrition } from "@/types/nutrition";

const G_PER_OZ = 28.35;
const G_PER_LB = 453.6;
const ML_PER_CUP = 236.588;

/** "1 1/2", "3-4" (midpoint), "0.5", "2" → number. */
export function parseAmount(raw: string): number | null {
  const s = raw.trim();
  const range = s.match(/^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (range) return (Number(range[1]) + Number(range[2])) / 2;
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = s.match(/^(\d+)\/(\d+)/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const num = s.match(/^(\d+(?:\.\d+)?)/);
  return num ? Number(num[1]) : null;
}

/** Quantity string + the resolved ingredient → grams, or null (excluded). */
export function parseQuantityToGrams(
  quantity: string,
  ing: Ingredient,
): number | null {
  const q = quantity.trim().toLowerCase();
  if (!q) return null;
  const amount = parseAmount(q);
  if (amount == null || amount <= 0) return null;
  const unit = q
    .replace(/^[\d\s.\/–-]+/, "")
    .trim()
    .split(/\s+/)[0]
    ?.replace(/[.,]$/, "");

  if (/^(g|gram|grams)$/.test(unit)) return amount;
  if (/^(kg|kilogram|kilograms)$/.test(unit)) return amount * 1000;
  if (/^(oz|ounce|ounces)$/.test(unit)) return amount * G_PER_OZ;
  if (/^(lb|lbs|pound|pounds)$/.test(unit)) return amount * G_PER_LB;
  if (/^(cup|cups)$/.test(unit))
    return ing.densityGPerCup ? amount * ing.densityGPerCup : null;
  if (/^(tbsp|tablespoon|tablespoons)$/.test(unit))
    return ing.densityGPerCup ? (amount * ing.densityGPerCup) / 16 : null;
  if (/^(tsp|teaspoon|teaspoons)$/.test(unit))
    return ing.densityGPerCup ? (amount * ing.densityGPerCup) / 48 : null;
  if (/^(ml|milliliter|milliliters)$/.test(unit))
    return ing.densityGPerCup
      ? amount * (ing.densityGPerCup / ML_PER_CUP)
      : amount; // water-density fallback for liquids
  if (/^(l|liter|liters)$/.test(unit))
    return ing.densityGPerCup
      ? amount * 1000 * (ing.densityGPerCup / ML_PER_CUP)
      : amount * 1000;
  // countable: "2 cloves garlic", "1 large onion", bare "2"
  if (ing.gramsPerPiece) return amount * ing.gramsPerPiece;
  return null;
}

export interface UserRecipeNutritionResult {
  perServing: PerServingNutrition;
  /** Fraction of ingredient lines that resolved AND massed (0..1). */
  coverage: number;
  matched: number;
  total: number;
}

export function computeUserRecipeNutrition(
  ingredients: ReadonlyArray<{ name: string; quantity?: string }>,
  servings: number,
): UserRecipeNutritionResult | null {
  if (!ingredients.length || !Number.isFinite(servings) || servings <= 0)
    return null;
  const totals: Record<string, number> = {};
  let matched = 0;
  for (const line of ingredients) {
    const id = resolveIngredientByName(line.name);
    const ing = id ? getIngredient(id) : null;
    if (!ing) continue;
    const grams = parseQuantityToGrams(line.quantity ?? "", ing);
    if (grams == null || grams <= 0) continue;
    matched++;
    for (const [k, v] of Object.entries(ing.per100g)) {
      if (typeof v !== "number") continue;
      totals[k] = (totals[k] ?? 0) + (v * grams) / 100;
    }
  }
  if (matched === 0) return null;
  const perServing: Record<string, unknown> = {
    recipeSlug: "user-recipe",
    servingsPerRecipe: servings,
    provenance: "usda-fdc",
    confidence: "approximated",
    ingestedAt: "",
  };
  for (const [k, v] of Object.entries(totals)) perServing[k] = v / servings;
  return {
    perServing: perServing as unknown as PerServingNutrition,
    coverage: matched / ingredients.length,
    matched,
    total: ingredients.length,
  };
}
