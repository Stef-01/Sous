"use client";

/**
 * NutrientSpotlight — single-line ambient call-out for a recipe's
 * top-priority nutrient. Quiet by default per PARENT-MODE-PLAN §4.8:
 *
 *   - Returns null when no per-recipe nutrition data exists for the slug.
 *   - Returns null when no nutrient passes the FDA threshold.
 *   - Renders only when Parent Mode is on.
 *
 * Copy is generated only via safe-phrasings.ts templates; the inline
 * disclaimer reminds the reader the call-out is general guidance.
 */

import { useState } from "react";
import { Info } from "lucide-react";
import { useParentMode } from "@/lib/hooks/use-parent-mode";
import { getPerServingNutrition } from "@/data/nutrition/per-recipe";
import { pickSpotlight } from "@/lib/engine/parent-mode/nutrient-spotlight";
import {
  getSafePhrasing,
  STANDARD_DISCLAIMER,
} from "@/data/nutrition/safe-phrasings";

interface Props {
  recipeSlug: string;
  variant?: "compact" | "full";
}

export function NutrientSpotlight({ recipeSlug, variant = "compact" }: Props) {
  const { profile } = useParentMode();
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  if (!profile.enabled) return null;

  const perServing = getPerServingNutrition(recipeSlug);
  if (!perServing) return null;

  const flag = pickSpotlight(perServing, profile.ageBand);
  if (!flag) return null;

  const phrasing = getSafePhrasing(flag.nutrient, flag.tier);
  if (!phrasing) return null;

  const lead = `${phrasing.lead} ${phrasing.whyItMatters}`;

  return (
    <div className="space-y-1">
      <p className="flex items-start gap-1 text-[11px] leading-snug text-[var(--nourish-green)]/90">
        <span className="flex-1">{lead}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMethodologyOpen((v) => !v);
          }}
          aria-label="How this nutrient call-out is calculated"
          aria-expanded={methodologyOpen}
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]"
        >
          <Info size={11} />
        </button>
      </p>
      {methodologyOpen && (
        <div className="rounded-xl bg-[var(--nourish-cream)] p-2.5 text-[10px] leading-snug text-[var(--nourish-subtext)]">
          <p>
            <strong className="font-semibold text-[var(--nourish-dark)]">
              Per serving:
            </strong>{" "}
            ~{flag.percentDV}% of the FDA Daily Value for kids 4 and older.
          </p>
          <p className="mt-1">
            Source:{" "}
            {perServing.confidence === "mapped"
              ? "USDA FoodData Central"
              : "internal estimate, calibrated to USDA FoodData Central"}{" "}
            · ingested {perServing.ingestedAt.slice(0, 10)}.
          </p>
          {variant === "full" && <p className="mt-2">{STANDARD_DISCLAIMER}</p>}
        </div>
      )}
    </div>
  );
}
