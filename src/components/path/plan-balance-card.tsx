"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Leaf } from "lucide-react";
import { useMealPlanWeek } from "@/lib/hooks/use-meal-plan-week";
import { planBalance } from "@/lib/nutrition/plan-balance";
import { lookupDish } from "@/lib/utils/dish-lookup";
import { cn } from "@/lib/utils/cn";
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
 *
 * Depth rule (CLAUDE.md "DEPTH OVER SPEED"): each food group is its OWN selectable
 * object (hover / focus / selected object-box), not a read-only label. Tapping one
 * drills INLINE into the distinct planned dishes that actually contribute it (e.g.
 * "Leafy greens · Tabbouleh, Guacamole") — the attribution behind the pill, on
 * demand (rule 13), so the at-rest card stays a quiet glance (rule 2).
 */
export function PlanBalanceCard() {
  const reduce = useReducedMotion();
  const { slotMap, mounted } = useMealPlanWeek();
  const slugs = useMemo(() => Object.values(slotMap), [slotMap]);
  // Which group is drilled open; null = collapsed glance.
  const [selected, setSelected] = useState<FoodGroup | null>(null);

  if (!mounted || slugs.length < 2) return null;
  const b = planBalance(slugs);
  const groups = b.foodGroups.filter((g) => GROUP_LABEL[g]).slice(0, 8);
  if (groups.length === 0) return null;

  const missing: string[] = [];
  if (!b.hasVegetable) missing.push("a vegetable");
  if (!b.hasProtein) missing.push("a protein");

  // The distinct planned dishes (by name) behind the drilled group. Capped so a
  // group spanning many dishes stays a tidy one-liner, not a wall.
  const drillNames =
    selected && GROUP_LABEL[selected]
      ? (b.byGroupSlugs[selected] ?? []).map((s) => lookupDish(s).name)
      : [];
  const shown = drillNames.slice(0, 4);
  const extra = drillNames.length - shown.length;
  const drillOpen = selected !== null && shown.length > 0;

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-baseline justify-between gap-2">
        <p className="sous-label">Plan balance</p>
        <span className="text-[12px] text-[var(--nourish-subtext)]">
          {groups.length} food groups
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {groups.map((g) => {
          const active = selected === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => setSelected((s) => (s === g ? null : g))}
              aria-pressed={active}
              aria-label={`${GROUP_LABEL[g]} — show contributing dishes`}
              className={cn(
                "rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
                active
                  ? "bg-[var(--nourish-green)]/10 text-[var(--nourish-dark)] ring-1 ring-[var(--nourish-green)]/40"
                  : "bg-neutral-100 text-[var(--nourish-subtext)] hover:bg-neutral-200",
              )}
            >
              {GROUP_LABEL[g]}
            </button>
          );
        })}
      </div>

      {/* Inline drill-down: which planned dishes give the selected group. A plain
          conditional render (reliable unmount); swaps content in place on switch. */}
      {drillOpen && (
        <motion.p
          role="status"
          initial={reduce ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="text-[12px] leading-snug text-[var(--nourish-subtext)]"
        >
          <span className="font-semibold text-[var(--nourish-dark)]">
            {GROUP_LABEL[selected!]}
          </span>{" "}
          · {shown.join(", ")}
          {extra > 0 ? ` +${extra} more` : ""}
        </motion.p>
      )}

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
