"use client";

import { Target, X } from "lucide-react";
import {
  useNutritionGoal,
  NUTRITION_GOALS,
  type NutritionGoal,
} from "@/lib/hooks/use-nutrition-goal";

const GOAL_UI: Record<NutritionGoal, { label: string; emoji: string }> = {
  balanced: { label: "Keep it balanced", emoji: "⚖️" },
  protein: { label: "More protein", emoji: "💪" },
  veg: { label: "More veg", emoji: "🥗" },
  hydration: { label: "Stay hydrated", emoji: "💧" },
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
      className="rounded-[var(--radius-lg)] border border-[var(--nourish-green)]/25 bg-[var(--nourish-green)]/5 p-4"
      aria-label="Pick a nutrition focus"
    >
      <div className="flex items-start gap-2">
        <Target
          size={16}
          className="mt-0.5 shrink-0 text-[var(--nourish-green)]"
          aria-hidden
        />
        <p className="flex-1 text-[13px] font-semibold text-[var(--nourish-dark)]">
          Anything you&apos;d like me to lean toward?
        </p>
        <button
          type="button"
          onClick={skip}
          aria-label="Skip — keep it balanced"
          className="-m-1 shrink-0 rounded-full p-1 text-[var(--nourish-subtext)] hover:bg-black/5"
        >
          <X size={15} />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {NUTRITION_GOALS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGoal(g)}
            className="flex items-center gap-2 rounded-xl border border-neutral-200/80 bg-white px-3 py-2.5 text-left text-[13px] font-medium text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/50 hover:bg-[var(--nourish-green)]/5"
          >
            <span aria-hidden>{GOAL_UI[g].emoji}</span>
            {GOAL_UI[g].label}
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-[11px] leading-snug text-[var(--nourish-subtext)]">
        I&apos;ll gently lean your ideas this way — never force it. You can
        change it any time.
      </p>
    </section>
  );
}
