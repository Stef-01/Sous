"use client";

import { AlertTriangle } from "lucide-react";
import { lookupDish } from "@/lib/utils/dish-lookup";
import { dietaryDisplay } from "@/lib/nutrition/dietary-display";

/**
 * DietaryProfile (W34) — the recipe's apparent diet compatibilities + acute
 * allergen warnings, honestly framed as inferred (never an allergen guarantee).
 * Renders nothing when there's no signal.
 */
export function DietaryProfile({ slug }: { slug?: string }) {
  if (!slug) return null;
  const dish = lookupDish(slug);
  const { diets, mayContain } = dietaryDisplay({
    tags: dish.tags,
    description: dish.description,
  });
  if (diets.length === 0 && mayContain.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="sous-label">Diet</p>
      {diets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {diets.map((d) => (
            <span
              key={d}
              className="rounded-full bg-[var(--nourish-green)]/10 px-2.5 py-1 text-[12px] font-medium text-[var(--nourish-green)]"
            >
              {d}
            </span>
          ))}
        </div>
      )}
      {mayContain.length > 0 && (
        <p className="flex items-center gap-1.5 text-[12px] text-[var(--nourish-subtext)]">
          <AlertTriangle
            size={13}
            className="shrink-0 text-[var(--nourish-gold)]"
            aria-hidden
          />
          May contain {mayContain.join(" · ")}
        </p>
      )}
      {/* Safety caveat is load-bearing here, so it stays visible (not hidden). */}
      <p className="text-[10.5px] leading-snug text-[var(--nourish-subtext-faint)]">
        Inferred from the recipe — always check ingredients yourself if you cook
        for allergies.
      </p>
    </div>
  );
}
