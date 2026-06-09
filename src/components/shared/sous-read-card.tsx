import { sousRead } from "@/lib/nutrition/sous-read";
import type { PerServingNutrition } from "@/types/nutrition";
import type { FoodGroup } from "@/types/ingredient";
import { cn } from "@/lib/utils/cn";

/**
 * Phase 2 — the glance headline. One claim-safe COMPOSITION sentence + 2–4 facet
 * pills (no numbers, Rule 13d). Reuses the existing green-tint chip styling.
 * Renders nothing when there's no read (thin coverage). Droppable later into the
 * Win screen + side-pairing detail.
 */
export function SousReadCard({
  nutrition,
  foodGroups,
  coverage,
  className,
}: {
  nutrition: PerServingNutrition | null | undefined;
  foodGroups: readonly FoodGroup[];
  coverage?: number;
  className?: string;
}) {
  const read = sousRead(nutrition, foodGroups, coverage);
  if (!read) return null;
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[15px] font-medium leading-snug text-[var(--nourish-dark)]">
        {read.headline}
      </p>
      {read.facets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {read.facets.map((f) => (
            <span
              key={f}
              className="rounded-full bg-[var(--tier-strong-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--tier-strong)]"
            >
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
