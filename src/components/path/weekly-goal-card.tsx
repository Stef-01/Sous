"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

interface WeeklyGoalCardProps {
  completedSessions: CookSessionRecord[];
  weeklyTarget?: number;
}

/**
 * Weekly goal — simple progress toward "Cook N times this week".
 * Defaults to 3 cooks per week as a gentle nudge.
 */
export function WeeklyGoalCard({
  completedSessions,
  weeklyTarget = 3,
}: WeeklyGoalCardProps) {
  const cooksThisWeek = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);

    return completedSessions.filter((s) => {
      if (!s.completedAt) return false;
      return new Date(s.completedAt) >= weekStart;
    }).length;
  }, [completedSessions]);

  const progress = Math.min(cooksThisWeek / weeklyTarget, 1);
  const isComplete = cooksThisWeek >= weeklyTarget;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--nourish-dark)]">
          This week&apos;s goal
        </h3>
        {isComplete && (
          <span className="text-xs font-medium text-[var(--nourish-green)]">
            Done!
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[var(--nourish-subtext)]">
          <span>
            Cook {weeklyTarget} times
          </span>
          <span>
            {cooksThisWeek}/{weeklyTarget}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[var(--nourish-green)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {!isComplete && cooksThisWeek > 0 && (
        <p className="text-[11px] text-[var(--nourish-subtext)]">
          {weeklyTarget - cooksThisWeek} more to go — you&apos;ve got this!
        </p>
      )}
      {cooksThisWeek === 0 && (
        <p className="text-[11px] text-[var(--nourish-subtext)]">
          Start your first cook of the week!
        </p>
      )}
    </motion.div>
  );
}
