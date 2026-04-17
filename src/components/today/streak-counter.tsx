"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakCounterProps {
  streak?: number;
}

export function StreakCounter({ streak = 0 }: StreakCounterProps) {
  if (streak <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex items-center gap-0.5 rounded-full bg-[var(--nourish-warm)]/10 px-1.5 py-0.5"
    >
      <Flame
        size={12}
        className="text-[var(--nourish-warm)]"
        strokeWidth={2.2}
        aria-label="streak"
      />
      <span className="text-[11px] font-bold text-[var(--nourish-warm)]">
        {streak}
      </span>
    </motion.div>
  );
}
