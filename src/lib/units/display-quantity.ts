/**
 * displayQuantity — the one call sites use: original quantity + ingredient
 * NAME (resolved through the registry alias index) → the string to render in
 * the chosen unit system. Falls back to the original untouched whenever the
 * conversion would have to guess.
 */

import { getIngredient, resolveIngredientByName } from "@/data/ingredients";
import { convertQuantity, type UnitSystem } from "./convert-quantity";

export function displayQuantity(
  quantity: string | undefined,
  ingredientName: string,
  system: UnitSystem,
): string | undefined {
  if (!quantity) return quantity;
  const id = resolveIngredientByName(ingredientName);
  const ing = id ? getIngredient(id) : null;
  return convertQuantity(quantity, ing ?? null, system) ?? quantity;
}
