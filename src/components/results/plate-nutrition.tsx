"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import {
  summarizePlate,
  macroCalorieShares,
  type PlateNutritionInput,
} from "@/lib/nutrition/plate-nutrition";

/** Sentence-case a free-text main (the craving "butter chicken" → "Butter
 *  chicken"); leaves already-proper side names untouched. */
function tidyName(name: string): string {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * PlateNutrition — the combined per-serving nutrition view inside the Plate
 * check sheet: a serving of the main + a serving of each picked side, summed
 * into one plate total, with a calorie-weighted macro bar and a per-dish
 * breakdown. Numbers come from the same display-grade getter the diary uses.
 */
export function PlateNutrition({
  items,
}: {
  items: readonly PlateNutritionInput[];
}) {
  const summary = useMemo(() => summarizePlate(items), [items]);
  if (summary.withData === 0) return null;

  const { totals } = summary;
  const shares = macroCalorieShares(totals);
  const hasMacros = shares.protein + shares.carbs + shares.fat > 0;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--nourish-subtext)]">
        Nutrition · per serving
      </h3>

      {/* Combined plate total */}
      <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-4">
        <div className="flex items-baseline gap-2">
          <span className="tabular-nums text-[28px] font-bold leading-none tracking-tight text-[var(--nourish-dark)]">
            {totals.calories}
          </span>
          <span className="text-xs font-medium text-[var(--nourish-subtext)]">
            cal · whole plate
          </span>
        </div>

        {/* Macro bar + legend read as one unit; both hide when no macro mass
            resolves (a legacy seed) so we never print a row of "0g". */}
        {hasMacros && (
          <div className="mt-3 space-y-1.5">
            <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
              <span
                className="rounded-full"
                style={{
                  width: `${shares.protein * 100}%`,
                  background: "var(--data-protein)",
                }}
              />
              <span
                className="rounded-full"
                style={{
                  width: `${shares.carbs * 100}%`,
                  background: "var(--data-carb)",
                }}
              />
              <span
                className="rounded-full"
                style={{
                  width: `${shares.fat * 100}%`,
                  background: "var(--data-fat)",
                }}
              />
            </div>
            <div className="flex items-center gap-4 tabular-nums text-xs font-semibold">
              <span style={{ color: "var(--data-protein)" }}>
                {totals.protein_g}g protein
              </span>
              <span style={{ color: "var(--data-carb)" }}>
                {totals.carbs_g}g carbs
              </span>
              <span style={{ color: "var(--data-fat)" }}>
                {totals.fat_g}g fat
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Per-dish breakdown — a serving of each. The main anchors the plate
          (filled green dot + semibold); a hairline separates its sides. */}
      <ul className="space-y-2">
        {summary.rows.map((row, i) => {
          const isMain = row.role === "main";
          // Hairline above the first side row, only when a main precedes it.
          const firstSide =
            !isMain && i > 0 && summary.rows[i - 1].role === "main";
          return (
            <DishRow
              key={i}
              name={isMain ? tidyName(row.name) : row.name}
              calories={row.calories}
              hasData={row.hasData}
              isMain={isMain}
              dividerAbove={firstSide}
            />
          );
        })}
      </ul>

      {summary.missing > 0 && (
        <p className="border-t border-neutral-100 pt-2.5 text-[11px] text-[var(--nourish-subtext-faint)]">
          {summary.missing} item{summary.missing > 1 ? "s" : ""} without
          nutrition data yet — not counted.
        </p>
      )}
    </div>
  );
}

function DishRow({
  name,
  calories,
  hasData,
  isMain,
  dividerAbove,
}: {
  name: string;
  calories: number | null;
  hasData: boolean;
  isMain: boolean;
  dividerAbove: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2.5 text-sm leading-tight",
        dividerAbove && "border-t border-neutral-100 pt-2",
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full",
          isMain
            ? "h-2 w-2 bg-[var(--nourish-green)]"
            : "h-1.5 w-1.5 bg-neutral-300",
        )}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          isMain
            ? "font-semibold text-[var(--nourish-dark)]"
            : "text-[var(--nourish-dark)]/80",
        )}
      >
        {name}
      </span>
      {hasData ? (
        <span
          className={cn(
            "shrink-0 tabular-nums",
            isMain
              ? "font-medium text-[var(--nourish-dark)]"
              : "text-[var(--nourish-subtext)]",
          )}
        >
          {calories}
          <span className="ml-0.5 text-[11px] font-normal text-[var(--nourish-subtext)]">
            cal
          </span>
        </span>
      ) : (
        <span className="shrink-0 text-[var(--nourish-subtext-faint)]">—</span>
      )}
    </li>
  );
}
