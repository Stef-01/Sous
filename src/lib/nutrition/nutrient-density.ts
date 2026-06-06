/**
 * Nutrient density (W24) — how many micronutrients a dish delivers per calorie
 * (an NRF-style index). Mean coverage of the flaggable micros (each capped at
 * one daily target so a single fortified nutrient can't dominate), normalised
 * per 100 kcal, mapped to 0..100. Leafy/veg sides score high; fried/sugary
 * dishes score low. Invariant to servings (a ratio).
 */

import type { PerServingNutrition } from "@/types/nutrition";
import { NUTRIENT_DISPLAY } from "@/data/nutrition/nutrient-display";
import { FLAGGABLE_DEFICIT_KEYS } from "./deficits";

export function nutrientDensity(n: PerServingNutrition): number {
  const cals = n.calories ?? 0;
  if (cals < 5) return 0; // negligible-calorie (a condiment) → not meaningful
  let sum = 0;
  let count = 0;
  for (const m of NUTRIENT_DISPLAY) {
    if (!m.dv || !FLAGGABLE_DEFICIT_KEYS.has(String(m.key))) continue;
    const v = (n[m.key] as number | undefined) ?? 0;
    sum += Math.min(1, v / m.dv);
    count += 1;
  }
  if (count === 0) return 0;
  const meanCovered = sum / count; // 0..1 micros provided per serving
  const per100kcal = meanCovered / (cals / 100);
  return Math.round(Math.min(100, per100kcal * 100));
}

/** A dish worth calling out as nutrient-dense (lots of micros per calorie). */
export function isNutrientDense(n: PerServingNutrition): boolean {
  return nutrientDensity(n) >= 25;
}
