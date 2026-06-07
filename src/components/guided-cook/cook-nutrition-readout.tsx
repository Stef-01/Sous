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

import { Check, Plus } from "lucide-react";
import type { PerServingNutrition } from "@/types/nutrition";
import { NutritionRingCard } from "@/components/shared/nutrition-ring-card";
import { BioavailabilityTip } from "@/components/shared/bioavailability-tip";
import { useNutritionDiary } from "@/lib/hooks/use-nutrition-diary";
import { toast } from "@/lib/hooks/use-toast";

export function CookNutritionReadout({
  perServing,
  servings,
  slug,
  name,
}: {
  perServing: PerServingNutrition;
  servings: number;
  slug?: string;
  name?: string;
}) {
  const { logCook, entries } = useNutritionDiary();
  const logged = !!slug && entries.some((e) => e.slug === slug);

  return (
    <div className="space-y-4 p-4">
      <NutritionRingCard nutrition={perServing} servings={servings} />
      <BioavailabilityTip nutrition={perServing} />
      {slug && name && (
        <button
          type="button"
          onClick={() => {
            logCook(slug, name, servings);
            toast.push({
              variant: "success",
              title: "Added to today's nutrition",
              body: "See it on the Path tab",
              dedupKey: "diary-log",
            });
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5 py-2.5 text-sm font-medium text-[var(--nourish-green)] transition-colors hover:bg-[var(--nourish-green)]/10"
        >
          {logged ? <Check size={15} /> : <Plus size={15} />}
          {logged ? "Logged today" : "Add to today's nutrition"}
        </button>
      )}
    </div>
  );
}
