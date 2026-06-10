/**
 * Shopping-list quantity aggregation — the thing "automated grocery list" ads
 * promise and (per the reference mockup, which listed "granulated sugar 2 tbsp"
 * and "sugar ⅓ cup" as separate rows) don't deliver. Two additions merge when
 * their names resolve to the SAME registry ingredient via the alias index:
 *
 *  - both quantities mass via the registry (density/pieces) → "≈ 92 g"
 *  - both are bare counts ("2" eggs + "4" eggs)            → "6"
 *  - anything else                                          → "2 cups + ⅓ cup"
 *    (an honest join — never a guessed total)
 *
 * Unresolvable names (not in the registry) never merge: a separate row is the
 * honest failure mode.
 */

import { getIngredient, resolveIngredientByName } from "@/data/ingredients";
import { parseQuantityToGrams } from "@/lib/nutrition/user-recipe-nutrition";

/** Registry id a shopping name resolves to, or null (no aggregation). */
export function canonicalIngredientId(name: string): string | null {
  return resolveIngredientByName(name) ?? null;
}

const BARE_COUNT = /^\d+(\.\d+)?$/;

/**
 * Combine two display quantities for one canonical ingredient.
 * Either side may be missing — the present one wins. Returns undefined when
 * neither exists (the row simply has no quantity).
 */
export function combineQuantities(
  a: string | undefined,
  b: string | undefined,
  ingredientId: string,
): string | undefined {
  const qa = a?.trim();
  const qb = b?.trim();
  if (!qa) return qb || undefined;
  if (!qb) return qa;

  // Countables: "2" + "4" → "6" (the mockup's "6 eggs" reading).
  if (BARE_COUNT.test(qa) && BARE_COUNT.test(qb)) {
    const sum = Number(qa) + Number(qb);
    return String(Number.isInteger(sum) ? sum : Math.round(sum * 100) / 100);
  }

  const ing = getIngredient(ingredientId);
  if (ing) {
    const ga = parseQuantityToGrams(qa, ing);
    const gb = parseQuantityToGrams(qb, ing);
    if (ga != null && gb != null) return `≈ ${Math.round(ga + gb)} g`;
  }
  return `${qa} + ${qb}`;
}
