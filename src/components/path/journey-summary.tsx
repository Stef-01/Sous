"use client";

import { motion } from "framer-motion";
import type { CookStats } from "@/lib/hooks/use-cook-sessions";

interface JourneySummaryProps {
  stats: CookStats;
}

/**
 * Journey summary — top block on Path home.
 * Shows total cooks, current streak, and cuisine diversity.
 * Journey tone, not performance tone.
 */
export function JourneySummary({ stats }: JourneySummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-4"
    >
      <h2 className="font-serif text-lg text-[var(--nourish-dark)]">
        Your cooking journey
      </h2>

      <div className="flex items-center gap-4">
        {/* Total cooks */}
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-[var(--nourish-dark)]">
            {stats.completedCooks}
          </div>
          <div className="text-[10px] text-[var(--nourish-subtext)] uppercase tracking-wide mt-0.5">
            Dishes made
          </div>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-neutral-100" />

        {/* Streak */}
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-[var(--nourish-dark)]">
            {stats.currentStreak}
            <span className="text-base ml-0.5">🔥</span>
          </div>
          <div className="text-[10px] text-[var(--nourish-subtext)] uppercase tracking-wide mt-0.5">
            Day streak
          </div>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-neutral-100" />

        {/* Cuisines */}
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-[var(--nourish-dark)]">
            {stats.cuisinesCovered.length}
          </div>
          <div className="text-[10px] text-[var(--nourish-subtext)] uppercase tracking-wide mt-0.5">
            Cuisines
          </div>
        </div>
      </div>
    </motion.div>
  );
}
