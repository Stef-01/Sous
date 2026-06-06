/**
 * Deficiency-Fill signal (nutrient-platform plan, W29-W31 — Data × Engine moat).
 *
 * When the user has logged cooks today, the sides that best fill the day's
 * remaining nutrient gaps (low iron, low fibre, …) score higher — so the
 * recommendation actively closes the deficit, not just pairs by taste. Like the
 * pantry-reuse signal it rides at a small weight BELOW the taste dimensions and
 * is applied as a post-rank reblend, so a strongly gap-filling side ranked #6
 * can surface into the top 3.
 *
 * Byte-identical-safe: the reblend only runs when the caller supplies a
 * non-empty deficit map; with nothing logged the ranking is untouched (guarded
 * by a golden test, same as pantry-reuse).
 */

import type { PerServingNutrition } from "@/types/nutrition";
import { DEFICIT_TARGET } from "@/lib/nutrition/deficits";

/**
 * Weight of the deficiency-fill dimension in the post-rank reblend. Matches the
 * pantry-reuse tier (below every taste dimension): a health-nudge tie-breaker,
 * never a reason to recommend a dish you don't want.
 */
export const DEFICIENCY_FILL_WEIGHT = 0.1;

export interface DeficiencyContext {
  /** nutrient key → deficit weight (0..1). Empty ⇒ inactive (no-op reblend). */
  deficits: ReadonlyMap<string, number>;
}

/**
 * Fraction (0..1) of the day's deficit a single serving of this side closes,
 * weighted by deficit severity. Each nutrient's contribution is capped at one
 * full daily target (a side can't over-credit a single gap). Neutral 0 when
 * there's no composed nutrition or no deficits.
 */
export function scoreDeficiencyFill(
  deficits: ReadonlyMap<string, number>,
  nutrition: PerServingNutrition | undefined | null,
): number {
  if (!nutrition || deficits.size === 0) return 0;
  let num = 0;
  let den = 0;
  for (const [key, weight] of deficits) {
    const target = DEFICIT_TARGET[key];
    if (!target || weight <= 0) continue;
    const val =
      (nutrition[key as keyof PerServingNutrition] as number | undefined) ?? 0;
    const fill = Math.min(1, val / target);
    num += weight * fill;
    den += weight;
  }
  return den > 0 ? num / den : 0;
}
