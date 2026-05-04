"use client";

/**
 * WeeklyRhythmWidget — small surface on /today summarising the
 * user's cooking cadence over the past 7 days.
 *
 * W36 surface from the household-memory arc (Sprint G W32-W36).
 * The pure rhythm calculation lives in
 * `lib/household/weekly-rhythm.ts` and is unit-tested
 * independently. This component is display-only.
 *
 * Renders nothing for users below 2 cooks-this-week — at that
 * level the widget would be more noise than signal. A "good
 * morning" state for 0 cooks isn't worth the pixel space when
 * the existing welcome line already covers it.
 */

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import { computeWeeklyRhythm } from "@/lib/household/weekly-rhythm";

export interface WeeklyRhythmWidgetProps {
  sessions: ReadonlyArray<CookSessionRecord>;
}

export function WeeklyRhythmWidget({ sessions }: WeeklyRhythmWidgetProps) {
  const reducedMotion = useReducedMotion();
  const rhythm = useMemo(
    () =>
      computeWeeklyRhythm(
        sessions.map((s) => ({
          completedAt: s.completedAt,
          cuisineFamily: s.cuisineFamily,
        })),
      ),
    [sessions],
  );

  // Quiet below 2 cooks-this-week — the welcome line already
  // covers cold-start; this surface earns its space once there's
  // a real rhythm to summarise.
  if (rhythm.cooksThisWeek < 2) return null;

  const cuisineLabel =
    rhythm.topCuisines.length === 0
      ? null
      : rhythm.topCuisines.length === 1
        ? rhythm.topCuisines[0]
        : `${rhythm.topCuisines[0]} + ${rhythm.cuisinesThisWeek - 1} more`;

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
      className="flex items-center gap-2.5 rounded-2xl border border-neutral-100/80 bg-white px-3 py-2 shadow-sm"
      aria-label="This week's cooking rhythm"
    >
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--nourish-green)]/10"
      >
        <CalendarDays
          size={14}
          className="text-[var(--nourish-green)]"
          strokeWidth={2}
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-[var(--nourish-dark)]">
          {rhythm.cooksThisWeek} cooks this week
          {rhythm.cookedToday ? " · cooked today" : ""}
        </p>
        {cuisineLabel && (
          <p className="text-[11px] text-[var(--nourish-subtext)]">
            mostly {cuisineLabel}
          </p>
        )}
      </div>
    </motion.section>
  );
}
