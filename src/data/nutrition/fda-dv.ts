/**
 * FDA Daily Values for children 4 and older — per 21 CFR 101.9.
 *
 * These are the legally defensible numbers used to compute %DV on a
 * per-serving basis for any nutrient-content or structure-function claim
 * surfaced in Parent Mode. The DV for ages 4+ is identical to the adult
 * DV; the FDA does not issue separate DVs for narrower pediatric bands
 * (PARENT-MODE-RESEARCH §3.1).
 *
 * Do NOT use these as "what your child needs" — see ./dri-pediatric.ts
 * for age-banded NASEM DRIs that frame general guidance.
 *
 * Source: FDA Daily Value on the Nutrition and Supplement Facts Labels
 *   https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels
 */

import type { NutrientKey, NutrientUnitMeta } from "@/types/nutrition";

export const FDA_DV_4PLUS: Record<NutrientKey, NutrientUnitMeta> = {
  calcium: { unit: "mg", dv4plus: 1300, displayName: "Calcium" },
  iron: { unit: "mg", dv4plus: 18, displayName: "Iron" },
  vitaminD: { unit: "mcg", dv4plus: 20, displayName: "Vitamin D" },
  vitaminA: { unit: "mcg", dv4plus: 900, displayName: "Vitamin A" },
  fiber: { unit: "g", dv4plus: 28, displayName: "Fiber" },
  potassium: { unit: "mg", dv4plus: 4700, displayName: "Potassium" },
  omega3: { unit: "g", dv4plus: 1.6, displayName: "Omega-3" },
  zinc: { unit: "mg", dv4plus: 11, displayName: "Zinc" },
  magnesium: { unit: "mg", dv4plus: 420, displayName: "Magnesium" },
  vitaminB12: { unit: "mcg", dv4plus: 2.4, displayName: "Vitamin B12" },
  choline: { unit: "mg", dv4plus: 550, displayName: "Choline" },
};

/**
 * Returns the per-serving FDA Daily Value for a nutrient, in the unit
 * matching the per-serving amount we store in PerServingNutrition.
 */
export function getDV4Plus(nutrient: NutrientKey): number {
  return FDA_DV_4PLUS[nutrient].dv4plus;
}
