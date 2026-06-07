"use client";

import { useMemo } from "react";
import { Leaf } from "lucide-react";
import { useMealPlanWeek } from "@/lib/hooks/use-meal-plan-week";
import { planBalance } from "@/lib/nutrition/plan-balance";
import type { FoodGroup } from "@/types/ingredient";

// Notable groups only (skip condiments/spices/sweeteners — not balance signals).
const GROUP_LABEL: Partial<Record<FoodGroup, string>> = {
  "leafy-green": "Leafy greens",
  vegetable: "Vegetables",
  legume: "Legumes",
  fruit: "Fruit",
  "nut-seed": "Nuts & seeds",
  seafood: "Seafood",
  poultry: "Poultry",
  egg: "Egg",
  "red-meat": "Red meat",
  grain: "Grains",
  dairy: "Dairy",
  "fat-oil": "Fats",
};

/**
 * PlanBalanceCard (W32) — the planned week's whole-food variety + gentle balance
 * nudges. No daily-target comparison and no coverage-skewed macro split — just
 * the robust, serving-independent composition signal.
 */
export function PlanBalanceCard() {
  const { slotMap, mounted } = useMealPlanWeek();
  const slugs = useMemo(() => Object.values(slotMap), [slotMap]);

  if (!mounted || slugs.length < 2) return null;
  const b = planBalance(slugs);
  const groups = b.foodGroups.filter((g) => GROUP_LABEL[g]).slice(0, 8);
  if (groups.length === 0) return null;

  const missing: string[] = [];
  if (!b.hasVegetable) missing.push("a vegetable");
  if (!b.hasProtein) missing.push("a protein");

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--nourish-border-strong)] bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="sous-label">Plan balance</p>
        <span className="text-[12px] text-[var(--nourish-subtext)]">
          {groups.length} food groups
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {groups.map((g) => (
          <span
            key={g}
            className="rounded-full bg-neutral-100 px-2.5 py-1 text-[12px] font-medium text-[var(--nourish-subtext)]"
          >
            {GROUP_LABEL[g]}
          </span>
        ))}
      </div>

      {missing.length > 0 && (
        <p className="flex items-center gap-1.5 text-[13px] text-[var(--nourish-dark)]">
          <Leaf
            size={13}
            className="shrink-0 text-[var(--nourish-green)]"
            aria-hidden
          />
          Add {missing.join(" and ")} to round out the week.
        </p>
      )}
    </section>
  );
}
