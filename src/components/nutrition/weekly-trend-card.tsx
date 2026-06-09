"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useNutritionWeek } from "@/lib/hooks/use-nutrition-diary";
import { strongestNutrient } from "@/lib/nutrition/weekly-trend";

/**
 * WeeklyTrendCard (W25) — the last 7 days of the diary rolled into the nutrients
 * you're consistently short on, plus the one you keep strong. Needs a couple of
 * cooking days before a trend is meaningful, so it stays hidden until then.
 */
export function WeeklyTrendCard() {
  const { mounted, daysWithCooks, trend } = useNutritionWeek();

  if (!mounted || daysWithCooks < 2) return null;

  const gaps = trend.filter((t) => t.daysShort > 0).slice(0, 3);
  const strong = strongestNutrient({ daysWithCooks, trend });
  if (gaps.length === 0 && !strong) return null;

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--nourish-border-strong)] bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="sous-label">This week</p>
        <span className="text-[12px] text-[var(--nourish-subtext)]">
          {daysWithCooks} cooking days
        </span>
      </div>

      {gaps.length > 0 && (
        <ul className="space-y-2">
          {gaps.map((g) => (
            <li
              key={g.key}
              className="flex items-center justify-between gap-2 text-[13px]"
            >
              <span className="flex items-center gap-1.5 text-[var(--nourish-dark)]">
                <TrendingDown
                  size={14}
                  className="text-[var(--data-carb)]"
                  aria-hidden
                />
                {g.label}
              </span>
              <span className="text-[var(--nourish-subtext)]">
                {g.daysShort === g.daysLogged
                  ? "short every cook"
                  : `short ${g.daysShort}/${g.daysLogged} days`}
              </span>
            </li>
          ))}
        </ul>
      )}

      {strong && strong.avgPct >= 80 && (
        <p className="flex items-center gap-1.5 text-[13px] text-[var(--nourish-green)]">
          <TrendingUp size={14} aria-hidden />
          Strong on {strong.label}
        </p>
      )}
    </section>
  );
}
