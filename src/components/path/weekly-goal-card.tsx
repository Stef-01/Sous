"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

interface WeeklyGoalCardProps {
  completedSessions: CookSessionRecord[];
  weeklyTarget?: number;
}

/**
 * Weekly goal — dot-based progress toward "Cook N times this week".
 * Gamified: each dot fills with a satisfying spring animation.
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

  const isComplete = cooksThisWeek >= weeklyTarget;
  const remaining = Math.max(weeklyTarget - cooksThisWeek, 0);

  // Build dots array
  const dots = Array.from({ length: weeklyTarget }, (_, i) => ({
    filled: i < cooksThisWeek,
    index: i,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--nourish-dark)]">
            Weekly goal
          </h3>
          <p className="text-xs text-[var(--nourish-subtext)] mt-0.5">
            Cook {weeklyTarget}× this week
          </p>
        </div>
        {isComplete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className="text-2xl"
          >
            🎉
          </motion.div>
        ) : (
          <span className="text-xs font-medium text-[var(--nourish-subtext)] tabular-nums">
            {cooksThisWeek}/{weeklyTarget}
          </span>
        )}
      </div>

      {/* Dot progress row */}
      <div className="flex items-center gap-2">
        {dots.map((dot) => (
          <motion.div
            key={dot.index}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 18,
              delay: 0.15 + dot.index * 0.08,
            }}
            className="flex-1"
          >
            <motion.div
              className="h-3 rounded-full overflow-hidden relative"
              style={{ background: dot.filled ? undefined : "#f3f4f6" }}
            >
              {dot.filled && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #22c55e 0%, #4ade80 100%)",
                  }}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.2 + dot.index * 0.1,
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Message */}
      <p className="text-[11px] text-[var(--nourish-subtext)]">
        {isComplete
          ? "Week complete! Incredible consistency 🔥"
          : cooksThisWeek > 0
            ? `${remaining} more to hit your goal — keep it up!`
            : "Start your first cook of the week!"}
      </p>
    </motion.div>
  );
}
