"use client";

/**
 * CookNutritionReadout — the nutrition the serving slider actually drives.
 *
 * Per-serving nutrition is INVARIANT (a serving is a serving). The slider scales
 * the recipe up/down, so the BATCH total = per-serving × servings moves with it.
 * This is what makes the slider a real ingredient-level system rather than a
 * relabeller: change servings → the batch calories recompute from the composed
 * per-serving values. Both numbers come from the USDA composition engine.
 */

import type { PerServingNutrition } from "@/types/nutrition";
import { NutritionRingCard } from "@/components/shared/nutrition-ring-card";

export function CookNutritionReadout({
  perServing,
  servings,
}: {
  perServing: PerServingNutrition;
  servings: number;
}) {
  return (
    <div className="p-4">
      <NutritionRingCard nutrition={perServing} servings={servings} />
    </div>
  );
}
