"use client";

import { Target, X } from "lucide-react";
import {
  useNutritionGoal,
  NUTRITION_GOALS,
  type NutritionGoal,
} from "@/lib/hooks/use-nutrition-goal";

const GOAL_UI: Record<NutritionGoal, { label: string }> = {
  balanced: { label: "Balanced" },
  protein: { label: "Protein" },
  veg: { label: "More veg" },
  hydration: { label: "Hydration" },
};

/**
 * NutritionGoalCard (W47) — a one-tap coach card shown once. Captures a light
 * goal that only SOFTLY nudges suggestions (rule 3: a playful interaction, not a
 * settings form). Skippable + non-blocking; renders nothing once chosen/skipped.
 */
export function NutritionGoalCard() {
  const { chosen, mounted, setGoal, skip } = useNutritionGoal();
  if (!mounted || chosen) return null;

  return (
    <section
      className="border-y border-[var(--nourish-border)] py-2"
      aria-label="Pick a nutrition focus"
    >
      <div className="flex min-h-11 items-center gap-2">
        <Target
          size={16}
          className="shrink-0 text-[var(--nourish-green)]"
          aria-hidden
        />
        <p className="flex-1 text-[13px] font-semibold text-[var(--nourish-dark)]">
          A nutrition focus?
        </p>
        <button
          type="button"
          onClick={skip}
          aria-label="Skip — keep it balanced"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:bg-black/5"
        >
          <X size={15} />
        </button>
      </div>
      <div className="-mx-1 flex snap-x gap-1.5 overflow-x-auto px-1 pb-1">
        {NUTRITION_GOALS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGoal(g)}
            className="flex min-h-11 shrink-0 snap-start items-center rounded-full border border-[var(--nourish-border)] bg-white px-4 text-[13px] font-medium text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/50 hover:bg-[var(--nourish-green)]/5"
          >
            {GOAL_UI[g].label}
          </button>
        ))}
      </div>
    </section>
  );
}
