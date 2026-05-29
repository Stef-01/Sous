"use client";

/**
 * RecipeFilterChips — chip row for filtering recipes by source.
 *
 * W47 from `docs/RECIPE-ECOSYSTEM-V2.md`. Rendered above
 * `/path/recipes` and the templates row. Reads the active
 * filter via `useRecipeFilter` and lets the user pivot
 * between "All / Mine / Community / Nourish ✓" with one tap.
 *
 * Stays minimal per CLAUDE.md rule 6: four pill buttons in a
 * single row, no overflow scroll, no labels beyond the chip
 * text itself.
 */

import {
  RECIPE_FILTERS,
  useRecipeFilter,
  type RecipeFilter,
} from "@/lib/recipe-authoring/use-recipe-filter";
import { cn } from "@/lib/utils/cn";

const FILTER_LABELS: Record<RecipeFilter, string> = {
  all: "All",
  mine: "Mine",
  community: "Community",
  "nourish-verified": "Nourish ✓",
};

export function RecipeFilterChips({ className }: { className?: string }) {
  const { filter, setFilter } = useRecipeFilter();

  return (
    <div
      role="tablist"
      aria-label="Filter recipes by source"
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {RECIPE_FILTERS.map((f) => {
        const isActive = filter === f;
        return (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold transition",
              isActive
                ? "bg-[var(--nourish-green)] text-white"
                : "bg-neutral-100 text-[var(--nourish-subtext)] hover:bg-neutral-200",
            )}
          >
            {FILTER_LABELS[f]}
          </button>
        );
      })}
    </div>
  );
}
