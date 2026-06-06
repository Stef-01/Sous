"use client";

import { X } from "lucide-react";
import { useNutritionDiary } from "@/lib/hooks/use-nutrition-diary";
import { NutritionRingCard } from "@/components/shared/nutrition-ring-card";
import { topDeficit } from "@/lib/nutrition/deficits";

export function DailyNutritionCard() {
  const { mounted, entries, dayNutrition, removeEntry } = useNutritionDiary();

  if (!mounted || entries.length === 0) return null;

  // Shared deficit computation (no duplicated nutrient set → no drift).
  const deficit = topDeficit(dayNutrition);

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
          Biggest gap today:{" "}
          <span className="font-semibold">{deficit.label}</span> — a targeted
          side could help close it.
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
