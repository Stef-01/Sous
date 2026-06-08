"use client";

import { groceryNutritionRollup } from "@/lib/nutrition/grocery-rollup";

/**
 * GroceryNutritionPreview (W33) — a compact rollup of the nutrition the planned
 * recipes will DELIVER (one serving each). Framed as eating, not buying; honest
 * about partial coverage; clearly an estimate. Renders nothing without data.
 */
export function GroceryNutritionPreview({
  recipeSlugs,
}: {
  recipeSlugs: readonly string[];
}) {
  const roll = groceryNutritionRollup(recipeSlugs);
  if (!roll) return null;

  const stats: [string, string][] = [
    ["Calories", `${roll.calories}`],
    ["Protein", `${roll.protein_g}g`],
    ["Carbs", `${roll.carbs_g}g`],
    ["Fibre", `${roll.fiber_g}g`],
  ];

  return (
    <section className="rounded-[var(--radius-lg)] border border-neutral-200/80 bg-white p-4">
      <p className="sous-label">What these meals deliver</p>
      <p className="mt-0.5 text-[11px] text-[var(--nourish-subtext)]">
        Across {roll.recipeCount} recipe{roll.recipeCount === 1 ? "" : "s"} ·
        one serving each
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="text-center">
            <p className="text-[15px] font-semibold text-[var(--nourish-dark)]">
              {value}
            </p>
            <p className="text-[10px] text-[var(--nourish-subtext)]">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-snug text-[var(--nourish-subtext-faint)]">
        Estimated from recipe ingredients — a guide, not a label.
        {roll.excludedCount > 0
          ? ` ${roll.excludedCount} item${roll.excludedCount === 1 ? "" : "s"} without recipe nutrition aren't counted.`
          : ""}
      </p>
    </section>
  );
}
