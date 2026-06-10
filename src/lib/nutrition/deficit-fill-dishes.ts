/**
 * Deficit-fill suggestions (#3) — given today's biggest nutrient gap, the
 * catalogue dishes that close the most of it. This is the food-first loop no
 * plain tracker has: the SAME deficit signal that reweights the side reranker
 * (deficitWeightMap → pairing.rerollSide) surfaced as direct, cookable fixes.
 *
 * Real, not superficial: per-serving values come from the composed USDA
 * vectors, coverage-gated at the shared floor; the % closed is computed against
 * the same NUTRIENT_DISPLAY daily value the deficit was measured with.
 */

import { meals, sides } from "@/data";
import {
  getDishNutrition,
  NUTRITION_COVERAGE_FLOOR,
} from "@/lib/engine/dish-nutrition";
import type { PerServingNutrition } from "@/types/nutrition";
import { topDeficit, DEFICIT_TARGET, type DeficitItem } from "./deficits";

export interface DeficitFillSuggestion {
  slug: string;
  name: string;
  /** Percentage points of the daily target one serving adds (rounded). */
  closesPct: number;
  /** Whether a guided cook flow exists is the caller's concern; we only need
   *  dishes to be real catalogue entries (they all route via /cook/slug). */
}

const ALL = [...meals, ...sides].map((d) => ({ id: d.id, name: d.name }));

/** Top dishes for closing ONE nutrient gap. Deterministic; display-grade only. */
export function dishesForDeficit(
  deficit: DeficitItem,
  limit = 3,
): DeficitFillSuggestion[] {
  const target = DEFICIT_TARGET[deficit.key];
  if (!target) return [];
  const scored: DeficitFillSuggestion[] = [];
  for (const d of ALL) {
    const { perServing, massedCoverage } = getDishNutrition(d.id);
    if (!perServing || massedCoverage < NUTRITION_COVERAGE_FLOOR) continue;
    const v =
      (perServing[deficit.key as keyof PerServingNutrition] as
        | number
        | undefined) ?? 0;
    if (v <= 0) continue;
    scored.push({
      slug: d.id,
      name: d.name,
      closesPct: Math.round((v / target) * 100),
    });
  }
  return scored
    .sort((a, b) => b.closesPct - a.closesPct || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/** The full insight for a day: the biggest gap + the dishes that close it. */
export function deficitFillFor(
  cookedDayNutrition: PerServingNutrition | null,
  limit = 3,
): { deficit: DeficitItem; suggestions: DeficitFillSuggestion[] } | null {
  const deficit = topDeficit(cookedDayNutrition);
  if (!deficit || deficit.pct >= 60) return null;
  const suggestions = dishesForDeficit(deficit, limit);
  return suggestions.length > 0 ? { deficit, suggestions } : null;
}
