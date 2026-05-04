"use client";

import { motion } from "framer-motion";
import { Trophy, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { WeeklyChallengeProgress } from "@/lib/hooks/use-weekly-challenge";

interface WeeklyChallengeCardProps {
  challenge: WeeklyChallengeProgress;
}

/**
 * Weekly Challenge Card — displays current week's challenge with progress.
 * Visually subordinate to the main quest card. Lives below the fold on Today.
 */
export function WeeklyChallengeCard({ challenge }: WeeklyChallengeCardProps) {
  const { challenge: ch, current, target, completed, progress, daysRemaining } =
    challenge;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
      className={cn(
        "rounded-xl border p-3.5",
        completed
          ? "border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5"
          : "border-neutral-100 bg-white",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Emoji + icon */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg",
            completed
              ? "bg-[var(--nourish-green)]/10"
              : "bg-[var(--nourish-gold)]/10",
          )}
        >
          {completed ? (
            <Check
              size={20}
              className="text-[var(--nourish-green)]"
              strokeWidth={2.5}
            />
          ) : (
            <span>{ch.emoji}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Trophy
                size={12}
                className="text-[var(--nourish-gold)]"
                strokeWidth={2}
              />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--nourish-gold)]">
                Weekly Challenge
              </span>
            </div>
            {!completed && (
              <span className="text-[10px] text-[var(--nourish-subtext)]">
                {daysRemaining === 0
                  ? "Ends today"
                  : `${daysRemaining}d left`}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={cn(
              "mt-0.5 text-sm font-semibold",
              completed
                ? "text-[var(--nourish-green)]"
                : "text-[var(--nourish-dark)]",
            )}
          >
            {completed ? `${ch.title} — Complete!` : ch.title}
          </h3>

          {/* Description */}
          <p className="mt-0.5 text-xs text-[var(--nourish-subtext)]">
            {ch.description}
          </p>

          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                className={cn(
                  "h-full rounded-full",
                  completed
                    ? "bg-[var(--nourish-green)]"
                    : "bg-[var(--nourish-gold)]",
                )}
              />
            </div>
            <span
              className={cn(
                "text-[11px] font-medium tabular-nums",
                completed
                  ? "text-[var(--nourish-green)]"
                  : "text-[var(--nourish-subtext)]",
              )}
            >
              {current}/{target}
            </span>
          </div>

          {/* XP reward */}
          {completed && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-1.5 text-[11px] font-medium text-[var(--nourish-green)]"
            >
              +{ch.bonusXP} XP earned
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
