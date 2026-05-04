"use client";

/**
 * WeekCalendar — Y3 W27 reusable planned-week renderer.
 *
 * Pure-rendering grid: 7 day rows × 3 meal columns. Filled
 * slots show the recipe slug humanised; empty slots show a
 * "+ add" affordance the caller wires.
 *
 * The component owns no state — caller passes the slotMap
 * (from useMealPlanWeek) + handlers. Same pattern as the W3
 * RecipeHeroCard: presentation only.
 */

import { motion, useReducedMotion } from "framer-motion";
import {
  buildSlotKey,
  dayKeyFromDate,
  type DayKey,
  type MealKey,
} from "@/types/meal-plan";
import { cn } from "@/lib/utils/cn";

const DAYS: ReadonlyArray<{ key: DayKey; label: string }> = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const MEALS: ReadonlyArray<{ key: MealKey; label: string }> = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
];

export interface WeekCalendarProps {
  /** Slot key → recipe slug map. Empty slots are absent from
   *  the map. */
  slotMap: Record<string, string>;
  /** Tap handler for an empty slot (open the pool / pick). */
  onAddToSlot?: (slot: string) => void;
  /** Tap handler for a filled slot (open the recipe / swap). */
  onTapFilled?: (slot: string, recipeSlug: string) => void;
  /** Optional reference "now" for highlighting today's row.
   *  Defaults to live `new Date()`. */
  now?: Date;
  /** Optional human-readable name lookup. Falls back to slug
   *  humanisation. */
  recipeDisplayNames?: Record<string, string>;
  /** Compact mode: hide the meal-column header to save vertical
   *  space when the calendar lives inside a sub-screen. */
  compact?: boolean;
}

/** Pure: humanise a slug. */
function humaniseSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}

/** Pure: slot summary across the week — total filled vs total
 *  possible. Exposed for the per-page status strip. */
export function summariseSlotMap(slotMap: Record<string, string>): {
  filled: number;
  total: number;
} {
  const total = DAYS.length * MEALS.length;
  const filled = Object.keys(slotMap).filter(
    (k) => typeof slotMap[k] === "string" && slotMap[k]!.length > 0,
  ).length;
  return { filled, total };
}

export function WeekCalendar({
  slotMap,
  onAddToSlot,
  onTapFilled,
  now,
  recipeDisplayNames,
  compact = false,
}: WeekCalendarProps) {
  const reducedMotion = useReducedMotion();
  const todayKey = dayKeyFromDate(now ?? new Date());

  return (
    <div className="space-y-2">
      {!compact && (
        <div
          className="grid grid-cols-[64px_repeat(3,1fr)] gap-2 px-1"
          aria-hidden
        >
          <span aria-hidden />
          {MEALS.map((m) => (
            <span
              key={m.key}
              className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]"
            >
              {m.label}
            </span>
          ))}
        </div>
      )}
      <ul className="space-y-1.5">
        {DAYS.map((d, dayIdx) => {
          const isToday = d.key === todayKey;
          return (
            <motion.li
              key={d.key}
              initial={reducedMotion ? false : { opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reducedMotion ? 0 : dayIdx * 0.03 }}
              className={cn(
                "grid grid-cols-[64px_repeat(3,1fr)] items-stretch gap-2 rounded-2xl border p-2 transition-colors",
                isToday
                  ? "border-[var(--nourish-green)]/35 bg-[var(--nourish-green)]/5"
                  : "border-[var(--nourish-border-soft)] bg-white",
              )}
            >
              <div className="flex items-center justify-between pl-1">
                <span
                  className={cn(
                    "font-serif text-sm font-semibold",
                    isToday
                      ? "text-[var(--nourish-green)]"
                      : "text-[var(--nourish-dark)]",
                  )}
                >
                  {d.label}
                </span>
                {isToday && (
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-[var(--nourish-green)]"
                  />
                )}
              </div>
              {MEALS.map((m) => {
                const slot = buildSlotKey(d.key, m.key);
                const filledSlug = slotMap[slot];
                if (filledSlug) {
                  const display =
                    recipeDisplayNames?.[filledSlug] ??
                    humaniseSlug(filledSlug);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => onTapFilled?.(slot, filledSlug)}
                      className={cn(
                        "rounded-xl border border-[var(--nourish-green)]/25 bg-[var(--nourish-green)]/5 px-2 py-1.5 text-left text-[11px] font-medium leading-tight text-[var(--nourish-dark)] transition-colors",
                        "hover:border-[var(--nourish-green)]/45 hover:bg-[var(--nourish-green)]/10",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
                      )}
                      aria-label={`${m.label} on ${d.label}: ${display}. Tap to swap.`}
                    >
                      <span className="line-clamp-2 capitalize">{display}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onAddToSlot?.(slot)}
                    className={cn(
                      "flex items-center justify-center rounded-xl border border-dashed border-[var(--nourish-border-strong)] bg-transparent px-2 py-1.5 text-[10px] font-medium text-[var(--nourish-subtext)] transition-colors",
                      "hover:border-[var(--nourish-green)]/40 hover:text-[var(--nourish-green)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
                    )}
                    aria-label={`${m.label} on ${d.label}: empty. Tap to add.`}
                  >
                    + add
                  </button>
                );
              })}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
