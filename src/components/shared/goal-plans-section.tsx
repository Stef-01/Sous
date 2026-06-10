"use client";

/**
 * GoalPlansSection (profile sheet) — pick ONE goal plan; its nutrients get
 * starred and pin to the top of every Key-nutrients readout. Chips only
 * (rule 13): the plan's one-line note appears only once selected.
 */

import { Star } from "lucide-react";
import { useNutrientGoals } from "@/lib/hooks/use-nutrient-goals";
import { haptic } from "@/lib/motion/haptics";
import { cn } from "@/lib/utils/cn";

export function GoalPlansSection() {
  const { goals, plan, plans, setPlan } = useNutrientGoals();

  return (
    <section className="mt-4 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Star size={13} className="text-[var(--nourish-gold)]" aria-hidden />
        <p className="sous-label">Focus</p>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {plans.map((p) => {
          const active = goals.planId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                haptic("select");
                setPlan(active ? null : p.id);
              }}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                active
                  ? "border-[var(--nourish-green)] bg-[var(--nourish-green)] text-white"
                  : "border-neutral-200 bg-white text-[var(--nourish-dark)] hover:border-[var(--nourish-green)]/50",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      {plan && (
        <p className="mt-2.5 text-[12px] leading-snug text-[var(--nourish-subtext)]">
          {plan.note}
          {plan.avoid ? ` ${plan.avoid}` : ""}
        </p>
      )}
    </section>
  );
}
