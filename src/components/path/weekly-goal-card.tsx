"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import {
  getCurrentChallenge,
  getWeekStart,
  getDaysRemainingInWeek,
} from "@/data/weekly-challenges";

interface WeeklyGoalCardProps {
  completedSessions: CookSessionRecord[];
}

export function WeeklyGoalCard({ completedSessions }: WeeklyGoalCardProps) {
  const challenge = getCurrentChallenge();
  const weekStart = getWeekStart();
  const daysRemaining = getDaysRemainingInWeek();

  const weekSessions = useMemo(
    () =>
      completedSessions.filter(
        (s) => s.completedAt && new Date(s.completedAt) >= weekStart,
      ),
    [completedSessions, weekStart],
  );

  const progress = useMemo(() => {
    const goal = challenge.goal;
    switch (goal.type) {
      case "cook_count":
        return { current: weekSessions.length, target: goal.target };
      case "cuisine_cook":
        return {
          current: weekSessions.filter(
            (s) =>
              s.cuisineFamily?.toLowerCase() === goal.cuisine.toLowerCase(),
          ).length,
          target: goal.target,
        };
      case "unique_dishes":
        return {
          current: new Set(weekSessions.map((s) => s.recipeSlug)).size,
          target: goal.target,
        };
      case "rate_dishes":
        return {
          current: weekSessions.filter((s) => s.rating).length,
          target: goal.target,
        };
      case "streak_days": {
        const uniqueDays = new Set(
          weekSessions.map((s) =>
            new Date(s.completedAt!).toDateString(),
          ),
        ).size;
        return { current: uniqueDays, target: goal.target };
      }
    }
  }, [challenge.goal, weekSessions]);

  const isComplete = progress.current >= progress.target;
  const remaining = Math.max(progress.target - progress.current, 0);

  const dots = Array.from({ length: progress.target }, (_, i) => ({
    filled: i < progress.current,
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
          <div className="flex items-center gap-2">
            <span className="text-lg">{challenge.emoji}</span>
            <h3 className="text-sm font-semibold text-[var(--nourish-dark)]">
              {challenge.title}
            </h3>
          </div>
          <p className="text-xs text-[var(--nourish-subtext)] mt-0.5">
            {challenge.description}
          </p>
        </div>
        {isComplete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className="flex flex-col items-center"
          >
            <span className="text-2xl">🎉</span>
            <span className="text-[9px] font-bold text-[var(--nourish-green)]">
              +{challenge.bonusXP} XP
            </span>
          </motion.div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-[var(--nourish-subtext)] tabular-nums">
              {progress.current}/{progress.target}
            </span>
            <span className="text-[10px] text-[var(--nourish-subtext)]/60">
              {daysRemaining}d left
            </span>
          </div>
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

      <p className="text-[11px] text-[var(--nourish-subtext)]">
        {isComplete
          ? `Challenge complete! +${challenge.bonusXP} XP earned 🔥`
          : progress.current > 0
            ? `${remaining} more to go — ${daysRemaining} days left!`
            : "A new challenge awaits — start cooking!"}
      </p>
    </motion.div>
  );
}
