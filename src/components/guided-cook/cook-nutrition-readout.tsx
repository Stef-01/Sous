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
import { NutritionRingCard } from "@/components/shared/nutrition-ring-card";
import { BioavailabilityTip } from "@/components/shared/bioavailability-tip";
import { LogItButton } from "@/components/shared/log-it-button";

export function CookNutritionReadout({
  perServing,
  servings,
  slug,
  name,
  coverage,
}: {
  perServing: PerServingNutrition;
  servings: number;
  slug?: string;
  name?: string;
  coverage?: { massed: number; total: number };
}) {
  return (
    <div className="space-y-4 p-4">
      <NutritionRingCard
        nutrition={perServing}
        servings={servings}
        coverage={coverage}
      />
      <BioavailabilityTip nutrition={perServing} />
      {slug && name && (
        // The one canonical logging control (Phase 3) — carries the slider's
        // servings through, so a ×2 batch logs ×2.
        <LogItButton
          slug={slug}
          name={name}
          servings={servings}
          variant="block"
        />
      )}
    </div>
  );
}
