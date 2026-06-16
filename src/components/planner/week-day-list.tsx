"use client";

/**
 * WeekDayList — the planned week rendered day-by-day (Mon→Sun). Each day is a
 * section with a date-aware header (today highlighted), and each scheduled meal
 * is a row: a rounded thumbnail (recipe photo or gradient+emoji fallback) +
 * name + a colour-coded meal-type pill. Warm cream bars separate days; hairline
 * dividers separate meals within a day.
 *
 * Presentational + one bit of local state: which day's slot-picker popover is
 * open (the reference pattern: [+] → Breakfast/Lunch/Dinner, icons included).
 */

import Image from "next/image";
import { useState } from "react";
import { Moon, Plus, Sun, Sunrise } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { imageSrc } from "@/lib/image/image-src";
import { DishGlyph } from "@/components/icons/food-glyphs";
import { lookupDish, type DishRef } from "@/lib/utils/dish-lookup";
import { recipeCreditShort } from "@/lib/utils/recipe-credit";
import {
  getDishNutrition,
  NUTRITION_COVERAGE_FLOOR,
} from "@/lib/engine/dish-nutrition";
import { MealTypeTag } from "./meal-type-tag";
import { buildSlotKey, type DayKey, type MealKey } from "@/types/meal-plan";

const DAY_ORDER: readonly DayKey[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];
const DAY_NAMES: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};
const MEAL_ORDER: readonly MealKey[] = ["breakfast", "lunch", "dinner"];
const MEAL_PICKER: ReadonlyArray<{
  key: MealKey;
  label: string;
  Icon: typeof Sunrise;
}> = [
  { key: "breakfast", label: "Breakfast", Icon: Sunrise },
  { key: "lunch", label: "Lunch", Icon: Sun },
  { key: "dinner", label: "Dinner", Icon: Moon },
];

/** Engine-true kcal for a planned dish — coverage-gated like every other
 *  nutrition surface (no number is better than a made-up one). */
function plannedKcal(slug: string): number | null {
  const { perServing, massedCoverage } = getDishNutrition(slug);
  const kcal = perServing?.calories;
  if (typeof kcal !== "number" || massedCoverage < NUTRITION_COVERAGE_FLOOR)
    return null;
  return Math.round(kcal);
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function PlanThumb({ dish }: { dish: DishRef }) {
  if (dish.image) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] bg-[var(--nourish-cream)]">
        <Image
          src={imageSrc(dish.image)}
          alt=""
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[var(--nourish-green)]/[0.08] text-xl text-[var(--nourish-green)]">
      <DishGlyph tags={dish.tags} cuisine={dish.cuisine ?? ""} size={24} />
    </div>
  );
}

export function WeekDayList({
  weekDates,
  slotMap,
  todayKey,
  onAddToSlot,
  onTapMeal,
}: {
  /** 7 Dates, Monday→Sunday, for the displayed week. */
  weekDates: Date[];
  slotMap: Record<string, string>;
  /** DayKey of "today", or null when the displayed week isn't this week. */
  todayKey: DayKey | null;
  onAddToSlot: (day: DayKey, meal: MealKey) => void;
  onTapMeal: (slot: string, recipeSlug: string) => void;
}) {
  const [pickerDay, setPickerDay] = useState<DayKey | null>(null);
  return (
    <div>
      {DAY_ORDER.map((dayKey, di) => {
        const date = weekDates[di];
        const isToday = dayKey === todayKey;
        const meals = MEAL_ORDER.flatMap((mk) => {
          const slug = slotMap[buildSlotKey(dayKey, mk)];
          return slug ? [{ mealKey: mk, dish: lookupDish(slug) }] : [];
        });
        // Day subtotal — engine-true, only over meals whose vectors pass the
        // coverage gate (partial sums are marked approximate by the ~).
        const dayKcal = meals.reduce(
          (sum, { dish }) => sum + (plannedKcal(dish.slug) ?? 0),
          0,
        );

        return (
          <div key={dayKey}>
            {di > 0 && (
              // Full-bleed warm cream bar between days (the "premium" separator).
              <div
                className="-mx-[var(--gutter)] h-1.5 bg-[var(--divider-warm)]"
                aria-hidden
              />
            )}
            <section className="py-3">
              <div className="flex items-center justify-between gap-2">
                <h2
                  className={cn(
                    "text-[15px] font-semibold",
                    isToday
                      ? "text-[var(--nourish-green)]"
                      : "text-[var(--nourish-subtext)]",
                  )}
                >
                  {isToday && "Today · "}
                  {DAY_NAMES[dayKey]} {date ? ordinal(date.getDate()) : ""}
                </h2>
                {dayKcal > 0 && (
                  <span className="ml-auto text-[11px] font-medium tabular-nums text-[var(--nourish-subtext-faint)]">
                    ~{Math.round(dayKcal)} kcal
                  </span>
                )}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setPickerDay((d) => (d === dayKey ? null : dayKey))
                    }
                    aria-label={`Add a meal to ${DAY_NAMES[dayKey]}`}
                    aria-expanded={pickerDay === dayKey}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--nourish-subtext)] transition-colors duration-150 hover:bg-white hover:text-[var(--nourish-dark)] active:scale-90 motion-reduce:active:scale-100"
                  >
                    <Plus size={18} aria-hidden />
                  </button>
                  {pickerDay === dayKey && (
                    <>
                      {/* scrim — tap anywhere outside to dismiss */}
                      <button
                        type="button"
                        aria-label="Close meal picker"
                        onClick={() => setPickerDay(null)}
                        className="fixed inset-0 z-20 cursor-default"
                        tabIndex={-1}
                      />
                      <div className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-2xl border border-[var(--nourish-border-strong)] bg-white py-1 shadow-lg">
                        {MEAL_PICKER.map(({ key, label, Icon }) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setPickerDay(null);
                              onAddToSlot(dayKey, key);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] font-medium text-[var(--nourish-dark)] transition-colors hover:bg-[var(--nourish-cream)]"
                          >
                            <Icon
                              size={16}
                              className="text-[var(--nourish-subtext)]"
                              aria-hidden
                            />
                            {label}
                            {slotMap[buildSlotKey(dayKey, key)] && (
                              <span
                                className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--nourish-green)]"
                                aria-label="Already planned"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {meals.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setPickerDay(dayKey)}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl py-2.5 text-left text-sm text-[var(--nourish-subtext-faint)] transition-colors hover:text-[var(--nourish-subtext)]"
                >
                  Nothing planned — tap to add a meal
                </button>
              ) : (
                <ul className="mt-1 divide-y divide-[var(--nourish-border)]">
                  {meals.map(({ mealKey, dish }) => (
                    <li key={mealKey}>
                      <button
                        type="button"
                        onClick={() =>
                          onTapMeal(buildSlotKey(dayKey, mealKey), dish.slug)
                        }
                        className="flex w-full items-center gap-3 py-2.5 text-left transition-transform active:scale-[0.99] motion-reduce:active:scale-100"
                      >
                        <PlanThumb dish={dish} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium text-[var(--nourish-dark)]">
                            {/* Drop a trailing "(English translation)" so the
                                compact row stays short + scannable. */}
                            {dish.name.replace(/\s*\([^)]*\)\s*$/, "").trim() ||
                              dish.name}
                          </span>
                          <span className="mt-1.5 flex items-center gap-2">
                            <MealTypeTag type={mealKey} />
                            {plannedKcal(dish.slug) !== null && (
                              <span className="text-[11px] font-medium text-[var(--nourish-subtext)]">
                                {plannedKcal(dish.slug)} kcal
                              </span>
                            )}
                            {recipeCreditShort(dish.slug) && (
                              <span className="text-[11px] font-medium text-[var(--nourish-subtext-faint)]">
                                {recipeCreditShort(dish.slug)}
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        );
      })}
    </div>
  );
}
