"use client";

/**
 * WeekDayList — the planned week rendered day-by-day (Mon→Sun). Each day is a
 * section with a date-aware header (today highlighted), and each scheduled meal
 * is a row: a rounded thumbnail (recipe photo or gradient+emoji fallback) +
 * name + a colour-coded meal-type pill. Warm cream bars separate days; hairline
 * dividers separate meals within a day.
 *
 * Pure / motion-free presentational component — the page owns data + handlers.
 */

import Image from "next/image";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { imageSrc } from "@/lib/image/image-src";
import { getDishEmoji } from "@/lib/utils/dish-emoji";
import { lookupDish, type DishRef } from "@/lib/utils/dish-lookup";
import { recipeCreditShort } from "@/lib/utils/recipe-credit";
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
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[var(--nourish-green)]/[0.08] text-xl"
      aria-hidden
    >
      {getDishEmoji(dish.tags, dish.cuisine ?? "")}
    </div>
  );
}

export function WeekDayList({
  weekDates,
  slotMap,
  todayKey,
  onAddToDay,
  onTapMeal,
}: {
  /** 7 Dates, Monday→Sunday, for the displayed week. */
  weekDates: Date[];
  slotMap: Record<string, string>;
  /** DayKey of "today", or null when the displayed week isn't this week. */
  todayKey: DayKey | null;
  onAddToDay: (day: DayKey) => void;
  onTapMeal: (slot: string, recipeSlug: string) => void;
}) {
  return (
    <div>
      {DAY_ORDER.map((dayKey, di) => {
        const date = weekDates[di];
        const isToday = dayKey === todayKey;
        const meals = MEAL_ORDER.flatMap((mk) => {
          const slug = slotMap[buildSlotKey(dayKey, mk)];
          return slug ? [{ mealKey: mk, dish: lookupDish(slug) }] : [];
        });

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
                <button
                  type="button"
                  onClick={() => onAddToDay(dayKey)}
                  aria-label={`Add a meal to ${DAY_NAMES[dayKey]}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--nourish-subtext)] transition-colors duration-150 hover:bg-white hover:text-[var(--nourish-dark)] active:scale-90 motion-reduce:active:scale-100"
                >
                  <Plus size={18} aria-hidden />
                </button>
              </div>

              {meals.length === 0 ? (
                <button
                  type="button"
                  onClick={() => onAddToDay(dayKey)}
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
