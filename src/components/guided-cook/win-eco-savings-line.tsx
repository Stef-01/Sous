"use client";

/**
 * WinEcoSavingsLine — single-line carbon-savings affordance on the
 * cook win-screen (Y5 D, audit P0 #2).
 *
 * Renders only when:
 *   - the user has Eco Mode enabled, AND
 *   - the computed savings (chosen vs baseline) is positive.
 *
 * Cook context default is "home-mixed" — the safest conservative
 * pick until per-recipe ingredient classification lands. This
 * means the line under-promises rather than over-claiming, which
 * matches the Eco Mode never-shame stance.
 *
 * Pure presentation — pure helpers in `lib/eco/carbon-math` do
 * the math.
 */

import { Leaf } from "lucide-react";
import { useEcoMode } from "@/lib/hooks/use-eco-mode";
import { mealCo2eSavingsKg } from "@/lib/eco/carbon-math";
import type { MealContext } from "@/lib/eco/carbon-math";

interface WinEcoSavingsLineProps {
  /** Cook context for this meal. Defaults to the conservative
   *  "home-mixed" — the dish-level eco classifier upgrade lands
   *  in Y5 L. */
  cookContext?: MealContext;
}

export function WinEcoSavingsLine({
  cookContext = "home-mixed",
}: WinEcoSavingsLineProps) {
  const { mounted, profile } = useEcoMode();

  // Hide during hydration to avoid flicker, and when Eco Mode
  // is off entirely.
  if (!mounted || !profile.enabled) return null;

  const savedKg = mealCo2eSavingsKg({
    chosen: cookContext,
    baseline: profile.comparisonBaseline,
  });

  // Net-zero or negative savings → render nothing (e.g. user
  // baseline-set to a low-carbon meal).
  if (savedKg <= 0) return null;

  const baselineLabel = humanizeBaseline(profile.comparisonBaseline);
  // 0.1 kg precision; round-half-up via Math.round.
  const display = Math.round(savedKg * 10) / 10;

  return (
    <p
      className="inline-flex items-center justify-center gap-1.5 self-center rounded-full bg-[var(--nourish-green)]/10 px-3 py-1 text-[12px] font-medium text-[var(--nourish-green)]"
      aria-label={`Saved ${display} kilograms of CO2 equivalent versus ${baselineLabel}`}
    >
      <Leaf size={12} className="shrink-0" aria-hidden />+{display} kg CO₂e
      saved vs {baselineLabel}
    </p>
  );
}

/** Map the storage enum to a short human label for the inline
 *  copy. Kept terse — the win-screen has a lot competing for
 *  attention. */
function humanizeBaseline(b: MealContext): string {
  switch (b) {
    case "delivery":
      return "delivery";
    case "takeout-pickup":
      return "takeout";
    case "restaurant-dine-in":
      return "dining out";
    case "home-red-meat":
      return "a beef-anchored meal";
    case "home-mixed":
      return "an average meal";
    case "home-plant-seasonal":
      return "a plant-forward meal";
  }
}
