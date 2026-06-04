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

export function CookNutritionReadout({
  perServing,
  servings,
}: {
  perServing: PerServingNutrition;
  servings: number;
}) {
  const round = (n: number) => Math.round(n);

  return (
    <div className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext-faint)]">
        Estimated nutrition
      </p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-serif text-2xl leading-none text-[var(--nourish-dark)]">
          {round(perServing.calories)}
        </span>
        <span className="text-xs text-[var(--nourish-subtext)]">
          cal / serving
        </span>
      </div>
      <p className="mt-1.5 text-xs text-[var(--nourish-subtext)]">
        {round(perServing.protein_g ?? 0)} g protein ·{" "}
        {round(perServing.totalCarbs_g ?? 0)} g carbs ·{" "}
        {round(perServing.totalFat_g ?? 0)} g fat · per serving
      </p>
      <p className="mt-2.5 border-t border-neutral-100 pt-2.5 text-[11px] leading-relaxed text-[var(--nourish-subtext-faint)]">
        Whole batch ({servings} {servings === 1 ? "serving" : "servings"}) ≈{" "}
        <span className="font-semibold text-[var(--nourish-subtext)]">
          {round(perServing.calories * servings)} cal
        </span>{" "}
        — recomputes from the ingredients as you move the slider.
      </p>
    </div>
  );
}
