"use client";

/**
 * TodayPlannedSlot — Y3 W24 Today integration of MealPlanWeek.
 *
 * Surfaces today's planned meal (if any) as a chip at the top
 * of /today. Below the streak counter, above the daily quest
 * card. Renders nothing when no slot is filled — Today falls
 * through to the existing default surfaces.
 *
 * Slot picking:
 *   - Day: derived from `new Date()` via `dayKeyFromDate`.
 *   - Meal: time-of-day routing —
 *       hour < 11 → breakfast
 *       hour < 16 → lunch
 *       else      → dinner
 *
 * The chip's primary action navigates to the cook flow for
 * the planned recipe. Secondary 'skip' action removes the
 * slot from the plan (so the user can recover from a "I'm not
 * cooking that today" without leaving Today).
 */

import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, X } from "lucide-react";
import { useMealPlanWeek } from "@/lib/hooks/use-meal-plan-week";
import { buildSlotKey, dayKeyFromDate, type MealKey } from "@/types/meal-plan";
import { cn } from "@/lib/utils/cn";

/** Pure: pick the meal-of-day from the local hour. */
export function pickCurrentMeal(now: Date): MealKey {
  if (!Number.isFinite(now.getTime())) return "dinner";
  const hour = now.getHours();
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  return "dinner";
}

/** Pure: humanise a slug for inline display. "chicken-rice-
 *  bowl" → "chicken rice bowl". */
function humaniseSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}

interface TodayPlannedSlotProps {
  /** Optional override for the time anchor. Tests inject a
   *  fixed Date; production omits + the component reads
   *  `new Date()` once. */
  now?: Date;
}

export function TodayPlannedSlot({ now }: TodayPlannedSlotProps = {}) {
  const reducedMotion = useReducedMotion();
  const { slotMap, mounted, clearSlot } = useMealPlanWeek();

  const { slot, recipeSlug } = useMemo(() => {
    const reference = now ?? new Date();
    const day = dayKeyFromDate(reference);
    const meal = pickCurrentMeal(reference);
    const key = buildSlotKey(day, meal);
    return { slot: key, recipeSlug: slotMap[key] ?? null };
  }, [slotMap, now]);

  if (!mounted) return null;
  if (!recipeSlug) return null;

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      className="rounded-2xl border border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5 shadow-sm"
      aria-label="Today's planned meal"
    >
      <Link
        href={`/cook/${recipeSlug}`}
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-left rounded-2xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
        )}
      >
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-green)]/15"
        >
          <CalendarCheck
            size={16}
            className="text-[var(--nourish-green)]"
            aria-hidden
          />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-green)]/80">
            Planned for today
          </p>
          <p className="truncate font-serif text-base font-semibold capitalize text-[var(--nourish-dark)]">
            {humaniseSlug(recipeSlug)}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            clearSlot(slot);
          }}
          aria-label="Skip today's planned meal"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--nourish-subtext)] transition-colors hover:bg-white hover:text-[var(--nourish-dark)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
          )}
        >
          <X size={14} aria-hidden />
        </button>
      </Link>
    </motion.section>
  );
}
