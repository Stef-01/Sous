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
      <NutritionRingCard nutrition={perServing} />
      <p className="mt-4 border-t border-neutral-100 pt-3 text-[11px] leading-relaxed text-[var(--nourish-subtext-faint)]">
        Whole batch ({servings} {servings === 1 ? "serving" : "servings"}) ≈{" "}
        <span className="font-semibold text-[var(--nourish-subtext)]">
          {Math.round(perServing.calories * servings)} cal
        </span>{" "}
        — recomputes as you move the slider.
      </p>
    </div>
  );
}
