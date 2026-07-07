"use client";

import { Card } from "@/components/shared/layout/card";
import { SectionKicker } from "@/components/shared/section-kicker";
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
    <Card as="section" radius="lg">
      <SectionKicker as="p">What these meals deliver</SectionKicker>
      <p className="sous-meta mt-[var(--space-1)]">
        Across {roll.recipeCount} recipe{roll.recipeCount === 1 ? "" : "s"} ·
        one serving each
      </p>
      <div className="mt-[var(--row-gap)] grid grid-cols-4 gap-[var(--space-2)]">
        {stats.map(([label, value]) => (
          <div key={label} className="text-center">
            <p className="text-[15px] font-semibold text-[var(--nourish-dark)]">
              {value}
            </p>
            <p className="text-[10px] text-[var(--nourish-subtext)]">{label}</p>
          </div>
        ))}
      </div>
      <p className="sous-meta mt-[var(--row-gap)]">
        Estimated from recipe ingredients — a guide, not a label.
        {roll.excludedCount > 0
          ? ` ${roll.excludedCount} item${roll.excludedCount === 1 ? "" : "s"} without recipe nutrition aren't counted.`
          : ""}
      </p>
    </Card>
  );
}
