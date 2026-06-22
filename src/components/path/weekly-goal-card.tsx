"use client";

import { memo, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Award,
  Flame,
  ChefHat,
  UtensilsCrossed,
  Star,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import {
  getCurrentChallenge,
  getWeekStart,
  getDaysRemainingInWeek,
} from "@/data/weekly-challenges";

interface WeeklyGoalCardProps {
  completedSessions: CookSessionRecord[];
  /** When true, drop the card chrome so this composes as one row inside a
   *  shared grouped card (the parent owns the border/bg/padding). */
  bare?: boolean;
}

export const WeeklyGoalCard = memo(function WeeklyGoalCard({
  completedSessions,
  bare = false,
}: WeeklyGoalCardProps) {
  const reducedMotion = useReducedMotion();
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
          weekSessions.map((s) => new Date(s.completedAt!).toDateString()),
        ).size;
        return { current: uniqueDays, target: goal.target };
      }
    }
  }, [challenge.goal, weekSessions]);

  const isComplete = progress.current >= progress.target;

  const dots = Array.from({ length: progress.target }, (_, i) => ({
    filled: i < progress.current,
    index: i,
  }));

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.3, delay: 0.1 }}
      className={
        bare
          ? "space-y-3"
          : "rounded-2xl bg-white p-4 space-y-3 shadow-[var(--shadow-card)]"
      }
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ChallengeIcon goalType={challenge.goal.type} />
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
            initial={reducedMotion ? { opacity: 0 } : { scale: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className="flex flex-col items-center"
          >
            <Award size={24} className="text-[var(--nourish-green)]" />
            <span className="text-[9px] font-bold text-[var(--nourish-green)]">
              +{challenge.bonusXP} XP
            </span>
          </motion.div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-[var(--nourish-subtext)] tabular-nums">
              {progress.current}/{progress.target}
            </span>
            <span className="text-[11px] text-[var(--nourish-subtext-faint)]">
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

      {/* Only the completion celebration earns a line here — the in-progress
          "X more to go / Y days left" just restated the count + days already
          shown top-right. (rule 13: one source per signal.) */}
      {isComplete && (
        <p className="text-[11px] font-medium text-[var(--nourish-green)]">
          Challenge complete! +{challenge.bonusXP} XP earned
        </p>
      )}
    </motion.div>
  );
});

const GOAL_ICON: Record<string, LucideIcon> = {
  cook_count: ChefHat,
  cuisine_cook: UtensilsCrossed,
  unique_dishes: Sparkles,
  rate_dishes: Star,
  streak_days: Flame,
};

function ChallengeIcon({ goalType }: { goalType: string }) {
  const Icon = GOAL_ICON[goalType] ?? Target;
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--nourish-green)]/10">
      <Icon size={16} className="text-[var(--nourish-green)]" strokeWidth={2} />
    </div>
  );
}
