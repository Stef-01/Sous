/**
 * Phase 1 — the "Sous read": ONE synthesized, claim-safe line + 2–4 facet pills
 * that describe what a dish IS, so the Info glance leads with a verdict instead of
 * four un-synthesized micro-signals.
 *
 * HONESTY (binding revision R2): this is a COMPOSITION DESCRIPTOR, not a health
 * read. The headline + facets state only what the food is made of ("plant-forward",
 * "a good source of protein"). NO effect/outcome language — no "gentle on blood
 * sugar", no "good for", no "helps". All effect/estimate language (glycemic, etc.)
 * stays in the deep-dive beside its grade + hedge. Reuses the existing scorers
 * verbatim; returns null below the coverage floor so no verdict is fabricated.
 */

import type { PerServingNutrition } from "@/types/nutrition";
import type { FoodGroup } from "@/types/ingredient";
import { NUTRITION_COVERAGE_FLOOR } from "@/lib/engine/dish-nutrition";
import { isNutrientDense } from "./nutrient-density";
import { proteinQuality } from "./protein-quality";
import { foodGroupRoles } from "./plan-balance";

export interface SousRead {
  /** One claim-safe composition sentence. */
  headline: string;
  /** 2–4 short composition pills (no numbers, no effect language). */
  facets: string[];
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function sousRead(
  n: PerServingNutrition | null | undefined,
  foodGroups: readonly FoodGroup[],
  coverage?: number,
): SousRead | null {
  if (!n || (n.calories ?? 0) <= 0) return null;
  if (coverage !== undefined && coverage < NUTRITION_COVERAGE_FLOOR)
    return null;

  const roles = foodGroupRoles(foodGroups);
  const dense = isNutrientDense(n);
  const complete = proteinQuality(n)?.complete ?? false;
  const protein = n.protein_g ?? 0;
  const fiber = n.fiber_g ?? 0;
  const carbs = n.totalCarbs_g ?? 0;
  const fat = n.totalFat_g ?? 0;

  // FACETS — composition descriptors only, ranked, capped at 4.
  const facets: string[] = [];
  if (roles.hasVegetable) facets.push("Plant-forward");
  if (dense) facets.push("Nutrient-dense");
  if (complete) facets.push("Complete protein");
  else if (protein >= 15) facets.push("Good protein");
  if (fiber >= 5) facets.push("Fibre-rich");

  // HEADLINE — assembled ONLY from the descriptor bank above (never an effect).
  const stems: string[] = [];
  if (roles.hasVegetable) stems.push("plant-forward");
  if (dense) stems.push("nutrient-dense");
  if (complete) stems.push("a complete protein");
  else if (protein >= 15) stems.push("a good source of protein");
  if (fiber >= 5 && stems.length < 2) stems.push("fibre-rich");

  let headline: string;
  if (stems.length === 0) {
    // Nothing notable to praise — describe the dominant macro, still descriptive.
    const cE = carbs * 4;
    const pE = protein * 4;
    const fE = fat * 9;
    if (fE > cE && fE > pE) headline = "A richer, higher-fat dish.";
    else if (cE >= pE && cE >= fE) headline = "Mostly carbohydrate.";
    else headline = "A balanced mix of macros.";
  } else {
    const joined =
      stems.length === 1
        ? stems[0]
        : `${stems.slice(0, -1).join(", ")} and ${stems[stems.length - 1]}`;
    headline = `${cap(joined)}.`;
  }

  return { headline, facets: facets.slice(0, 4) };
}
