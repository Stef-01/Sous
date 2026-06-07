"use client";

import { AlertTriangle } from "lucide-react";
import { getMealCookSummary } from "@/data/guided-cook-summary";
import { lookupDish } from "@/lib/utils/dish-lookup";
import { dietaryDisplay } from "@/lib/nutrition/dietary-display";

/**
 * DietaryProfile (W34) — preference-diet pills + acute-allergen warnings, read
 * from the recipe's actual ingredient list (never a marketing blurb). Health-
 * stakes claims (gluten/dairy) are only ever WARNINGS, never positive "free"
 * pills. Renders nothing without an ingredient list or signal.
 */
export function DietaryProfile({ slug }: { slug?: string }) {
  if (!slug) return null;
  const ingredients = getMealCookSummary(slug)?.ingredientNames ?? [];
  const { diets, mayContain } = dietaryDisplay({
    tags: lookupDish(slug).tags,
    ingredients,
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
      {/* Load-bearing safety caveat — covers allergies AND intolerances (celiac,
          lactose), and that no warning is not a guarantee. */}
      <p className="text-[10.5px] leading-relaxed text-[var(--nourish-subtext-faint)]">
        From the recipe&apos;s ingredients — always check labels yourself for
        any allergy or intolerance.
      </p>
    </div>
  );
}
