"use client";

import { motion } from "framer-motion";

interface StreakCounterProps {
  streak?: number;
}

/**
 * Streak Counter — tiny inline chip for the header row.
 * Shows fire emoji + number only, keeping it compact and unobtrusive.
 * Hardcoded placeholder; will connect to user data later.
 */
export function StreakCounter({ streak = 12 }: StreakCounterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5"
    >
      <span className="text-[10px]" role="img" aria-label="fire">
        🔥
      </span>
      <span className="text-[10px] font-bold text-amber-700">
        {streak}
      </span>
    </motion.div>
  );
}
