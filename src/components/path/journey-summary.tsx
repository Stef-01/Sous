"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { CookStats } from "@/lib/hooks/use-cook-sessions";

interface JourneySummaryProps {
  stats: CookStats;
}

interface StatBlockProps {
  value: number | string;
  label: string;
  suffix?: string;
  delay?: number;
  highlight?: boolean;
}

function StatBlock({
  value,
  label,
  suffix = "",
  delay = 0,
  highlight = false,
}: StatBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex-1 text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 18,
          delay: delay + 0.1,
        }}
        className={`text-2xl font-bold tabular-nums ${highlight ? "text-[var(--nourish-green)]" : "text-[var(--nourish-dark)]"}`}
      >
        {value}
        {suffix}
      </motion.div>
      <div className="text-[10px] text-[var(--nourish-subtext)] uppercase tracking-wide mt-0.5">
        {label}
      </div>
    </motion.div>
  );
}

/**
 * Journey summary — stats card with animated number reveals.
 * Journey tone, not performance pressure.
 */
export const JourneySummary = memo(function JourneySummary({
  stats,
}: JourneySummaryProps) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-base text-[var(--nourish-dark)]">
          Your journey
        </h2>
        {stats.completedCooks >= 10 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 12,
              delay: 0.5,
            }}
            className="text-sm"
          >
            ⭐
          </motion.span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <StatBlock
          value={stats.completedCooks}
          label="Dishes made"
          delay={0.05}
          highlight={stats.completedCooks >= 10}
        />

        <div className="h-10 w-px bg-neutral-100" />

        <StatBlock
          value={stats.currentStreak}
          suffix="🔥"
          label="Day streak"
          delay={0.1}
          highlight={stats.currentStreak >= 3}
        />

        <div className="h-10 w-px bg-neutral-100" />

        <StatBlock
          value={(stats.cuisinesCovered ?? []).length}
          label="Cuisines"
          delay={0.15}
        />
      </div>

      {/* Cuisine tags — deduplicate by normalized name */}
      {(stats.cuisinesCovered ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {[
            ...new Set(
              (stats.cuisinesCovered ?? []).map(
                (c) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase(),
              ),
            ),
          ]
            .slice(0, 5)
            .map((cuisine, idx) => (
              <motion.span
                key={cuisine}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 18,
                  delay: 0.3 + idx * 0.06,
                }}
                className="rounded-full bg-[var(--nourish-green)]/8 px-2 py-0.5 text-[10px] font-medium text-[var(--nourish-green)] capitalize"
              >
                {cuisine}
              </motion.span>
            ))}
          {(stats.cuisinesCovered ?? []).length > 5 && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-[var(--nourish-subtext)]">
              +{(stats.cuisinesCovered ?? []).length - 5} more
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
});
