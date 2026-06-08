"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { bioavailabilityTip } from "@/lib/nutrition/bioavailability";
import type { PerServingNutrition } from "@/types/nutrition";

/**
 * BioavailabilityTip (W27) — one actionable absorption cue for a dish, with the
 * mechanism behind a tap (rule 13: disclosure on demand). Renders nothing when
 * no tip applies. Dish-level only — never on the diary day aggregate.
 */
export function BioavailabilityTip({
  nutrition,
  ingredientIds,
}: {
  nutrition: PerServingNutrition;
  /** The dish's resolved ingredient ids — enables ingredient-specific tips
   *  (e.g. turmeric + black pepper). Omit for the nutrition-only tips. */
  ingredientIds?: ReadonlySet<string>;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const t = bioavailabilityTip(nutrition, ingredientIds);
  if (!t) return null;

  return (
    <button
      type="button"
      onClick={() => setShowWhy((s) => !s)}
      aria-expanded={showWhy}
      className="flex w-full items-start gap-2 rounded-xl bg-[var(--nourish-green)]/5 p-3 text-left transition-colors hover:bg-[var(--nourish-green)]/10"
    >
      <Lightbulb
        size={15}
        className="mt-0.5 shrink-0 text-[var(--nourish-green)]"
        aria-hidden
      />
      <span className="text-[13px] leading-snug text-[var(--nourish-dark)]">
        {t.tip}
        {showWhy && (
          <span className="mt-1 block text-[12px] text-[var(--nourish-subtext)]">
            {t.why}
          </span>
        )}
      </span>
    </button>
  );
}
