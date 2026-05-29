/**
 * FDA nutrient-content claim thresholds — 21 CFR 101.54.
 *
 * - "High in" / "Excellent source of" / "Rich in":  >= 20% DV per serving
 * - "Good source of" / "Contains" / "Provides":     10-19% DV per serving
 * - "More" / "Added" / "Fortified":                  >= 10% DV more vs reference food
 *
 * Per Reference Amount Customarily Consumed (RACC) per labeled serving.
 * Children 4+ DV table is in ./fda-dv.ts.
 *
 * Source: eCFR 21 CFR 101.54
 *   https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-D/section-101.54
 */

import type {
  ClaimTier,
  NutrientKey,
  PerServingNutrition,
} from "@/types/nutrition";
import { getDV4Plus } from "./fda-dv";

/** Hard FDA thresholds. Do not adjust without re-running the legal review. */
export const HIGH_IN_PCT_DV = 20;
export const GOOD_SOURCE_PCT_DV = 10;

/**
 * Map a nutrient key to the per-serving amount field on PerServingNutrition.
 * Centralised so the spotlight engine and tests use the same lookup.
 */
const NUTRIENT_FIELD_MAP: Record<NutrientKey, keyof PerServingNutrition> = {
  calcium: "calcium_mg",
  iron: "iron_mg",
  vitaminD: "vitaminD_mcg",
  vitaminA: "vitaminA_mcg_rae",
  fiber: "fiber_g",
  potassium: "potassium_mg",
  omega3: "omega3_g",
  zinc: "zinc_mg",
  magnesium: "magnesium_mg",
  vitaminB12: "vitaminB12_mcg",
  choline: "choline_mg",
};

export function getNutrientAmount(
  perServing: PerServingNutrition,
  nutrient: NutrientKey,
): number {
  const field = NUTRIENT_FIELD_MAP[nutrient];
  const value = perServing[field];
  return typeof value === "number" ? value : 0;
}

/**
 * Computes the FDA claim tier for a single nutrient on a per-serving
 * basis. Pure function. Boundary behaviour:
 *
 * - amount < 0          → below-threshold (clamps negative noise)
 * - 0%   <= pct < 10%   → below-threshold
 * - 10%  <= pct < 20%   → good-source
 * - pct >= 20%          → high-in
 *
 * Boundary value 10.0 % counts as good-source; 20.0 % counts as high-in.
 * Boundary value 19.9999 % must NOT round up — we do not round inside
 * the tier check (only when displaying percentDV in the UI).
 */
export function computeNutrientClaim(
  perServing: PerServingNutrition,
  nutrient: NutrientKey,
): { tier: ClaimTier; percentDV: number; perServingAmount: number } {
  const amount = Math.max(0, getNutrientAmount(perServing, nutrient));
  const dv = getDV4Plus(nutrient);
  if (dv <= 0) {
    return { tier: "below-threshold", percentDV: 0, perServingAmount: amount };
  }
  const rawPct = (amount / dv) * 100;
  let tier: ClaimTier;
  if (rawPct >= HIGH_IN_PCT_DV) tier = "high-in";
  else if (rawPct >= GOOD_SOURCE_PCT_DV) tier = "good-source";
  else tier = "below-threshold";
  // Display rounding only — tier already chosen on the unrounded value.
  return {
    tier,
    percentDV: Math.round(rawPct),
    perServingAmount: amount,
  };
}
