"use client";

import { X } from "lucide-react";
import { useNutritionDiary } from "@/lib/hooks/use-nutrition-diary";
import { NutritionRingCard } from "@/components/shared/nutrition-ring-card";
import { NUTRIENT_DISPLAY } from "@/data/nutrition/nutrient-display";
import type { PerServingNutrition } from "@/types/nutrition";

// Micros worth flagging a shortfall on (skip the always-easy macros + sodium).
const FLAGGABLE = new Set([
  "fiber_g",
  "iron_mg",
  "calcium_mg",
  "potassium_mg",
  "magnesium_mg",
  "vitaminC_mg",
  "vitaminD_mcg",
  "vitaminA_mcg_rae",
  "folate_mcg",
  "vitaminB12_mcg",
  "zinc_mg",
  "omega3_g",
]);

/** Lowest-coverage flaggable nutrient for the day (the deficit insight). */
function dayDeficit(
  n: PerServingNutrition,
): { label: string; pct: number } | null {
  let lowest: { label: string; pct: number } | null = null;
  for (const m of NUTRIENT_DISPLAY) {
    if (!m.dv || !FLAGGABLE.has(String(m.key))) continue;
    const v = (n[m.key] as number | undefined) ?? 0;
    const pct = Math.round((v / m.dv) * 100);
    if (lowest === null || pct < lowest.pct) lowest = { label: m.label, pct };
  }
  return lowest;
}

export function DailyNutritionCard() {
  const { mounted, entries, dayNutrition, removeEntry } = useNutritionDiary();

  if (!mounted || entries.length === 0) return null;

  const deficit = dayNutrition ? dayDeficit(dayNutrition) : null;

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--nourish-border-strong)] bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="sous-label">Today&apos;s nutrition</p>
        <span className="text-[12px] text-[var(--nourish-subtext)]">
          {entries.length} {entries.length === 1 ? "cook" : "cooks"}
        </span>
      </div>

      {deficit && deficit.pct < 60 && (
        <p className="text-[13px] text-[var(--nourish-dark)]">
          Lowest today: <span className="font-semibold">{deficit.label}</span>{" "}
          at {deficit.pct}% — a targeted side could close the gap.
        </p>
      )}

      {dayNutrition && (
        <NutritionRingCard nutrition={dayNutrition} servings={1} />
      )}

      <ul className="divide-y divide-[var(--nourish-border)] pt-1">
        {entries.map((e) => (
          <li
            key={e.at}
            className="flex items-center gap-2 py-2 text-[14px] text-[var(--nourish-dark)]"
          >
            <span className="min-w-0 flex-1 truncate">
              {e.name.replace(/\s*\([^)]*\)\s*$/, "").trim() || e.name}
              {e.servings > 1 && (
                <span className="text-[var(--nourish-subtext)]">
                  {" "}
                  × {e.servings}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => removeEntry(e.at)}
              aria-label={`Remove ${e.name}`}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-300 transition-colors hover:text-[var(--nourish-dark)]"
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
