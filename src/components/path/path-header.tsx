"use client";

import { motion } from "framer-motion";
import { Flame, Zap, Trophy } from "lucide-react";

interface PathHeaderProps {
  streak: number;
  totalXP: number;
  level: number;
  levelProgress: number;
  skillsCompleted: number;
}

/**
 * Path Header — compact stats bar at the top of the skill tree.
 * Shows XP level bar, streak, and skills mastered.
 */
export function PathHeader({
  streak,
  totalXP,
  level,
  levelProgress,
  skillsCompleted,
}: PathHeaderProps) {
  return (
    <header className="border-b border-neutral-100/80 bg-white px-4 py-3">
      <div className="mx-auto max-w-md">
        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            Your Path
          </h1>
          <div className="flex items-center gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1 text-sm">
              <Flame size={16} className="text-orange-500" />
              <span className="font-semibold text-[var(--nourish-dark)]">
                {streak}
              </span>
            </div>
            {/* Skills */}
            <div className="flex items-center gap-1 text-sm">
              <Trophy size={16} className="text-[var(--nourish-gold)]" />
              <span className="font-semibold text-[var(--nourish-dark)]">
                {skillsCompleted}
              </span>
            </div>
          </div>
        </div>

        {/* XP level bar */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2.5"
        >
          <div className="flex items-center gap-1">
            <Zap size={14} className="text-[var(--nourish-green)]" />
            <span className="text-xs font-bold text-[var(--nourish-green)]">
              Lv.{level}
            </span>
          </div>

          <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[var(--nourish-green)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(levelProgress, 3)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          <span className="text-[10px] text-[var(--nourish-subtext)] font-medium tabular-nums">
            {totalXP} XP
          </span>
        </motion.div>
      </div>
    </header>
  );
}
