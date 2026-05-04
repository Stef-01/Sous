"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

interface StreakHeatmapProps {
  sessions: CookSessionRecord[];
}

/** Format a date as YYYY-MM-DD for map keying. */
function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Short weekday labels. */
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * Streak Heatmap — 30-day grid showing cooking activity.
 * Green dots for cook days, subtle grey for missed. Like a simplified
 * GitHub contribution graph.
 */
export function StreakHeatmap({ sessions }: StreakHeatmapProps) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  // Build a Set of date keys where the user cooked (completed sessions only)
  const cookDays = useMemo(() => {
    const set = new Set<string>();
    for (const s of sessions) {
      if (s.completedAt) {
        set.add(toDateKey(new Date(s.completedAt)));
      }
    }
    return set;
  }, [sessions]);

  // Generate the 30-day grid: 5 rows × 7 columns (last 35 days, show 30)
  const { days, monthLabel } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result: {
      date: Date;
      key: string;
      cooked: boolean;
      isToday: boolean;
      isFuture: boolean;
    }[] = [];

    // Go back 29 days from today (30 days total including today)
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      result.push({
        date: d,
        key,
        cooked: cookDays.has(key),
        isToday: i === 0,
        isFuture: false,
      });
    }

    // Pad to fill the last row (up to 35)
    const remainder = result.length % 7;
    if (remainder > 0) {
      const padCount = 7 - remainder;
      for (let i = 1; i <= padCount; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const key = toDateKey(d);
        result.push({
          date: d,
          key,
          cooked: false,
          isToday: false,
          isFuture: true,
        });
      }
    }

    const firstDate = result[0].date;
    const lastDate = result[result.length - 1].date;
    const months = new Set([
      firstDate.toLocaleDateString("en-US", { month: "short" }),
      lastDate.toLocaleDateString("en-US", { month: "short" }),
    ]);
    const label = Array.from(months).join(" – ");

    return { days: result, monthLabel: label };
  }, [cookDays]);

  // Count cook days in last 30
  const cookCount = useMemo(
    () => days.filter((d) => d.cooked && !d.isFuture).length,
    [days],
  );

  if (sessions.length === 0) return null;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--nourish-subtext)] hover:text-[var(--nourish-green)] transition-colors"
        aria-expanded={open}
        aria-label="Toggle cooking activity heatmap"
      >
        <Calendar size={12} strokeWidth={2} />
        {cookCount} cook{cookCount !== 1 ? "s" : ""} this month
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-neutral-100 bg-white p-3">
              {/* Month label */}
              <p className="mb-2 text-[10px] font-medium text-[var(--nourish-subtext)]">
                {monthLabel}
              </p>

              {/* Day-of-week labels */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAY_LABELS.map((label, i) => (
                  <span
                    key={i}
                    className="text-center text-[9px] font-medium text-[var(--nourish-subtext)]/60"
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => (
                  <div
                    key={day.key}
                    title={
                      day.isFuture
                        ? ""
                        : day.cooked
                          ? `Cooked on ${day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                          : day.date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                    }
                    className={cn(
                      "aspect-square rounded-sm transition-colors",
                      day.isFuture
                        ? "bg-transparent"
                        : day.cooked
                          ? "bg-[var(--nourish-green)]"
                          : "bg-neutral-100",
                      day.isToday &&
                        !day.cooked &&
                        "ring-1 ring-[var(--nourish-green)]/40",
                      day.isToday &&
                        day.cooked &&
                        "ring-1 ring-[var(--nourish-green)]",
                    )}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="mt-2 flex items-center gap-3 text-[9px] text-[var(--nourish-subtext)]">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-neutral-100" />
                  No cook
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-[var(--nourish-green)]" />
                  Cooked
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
