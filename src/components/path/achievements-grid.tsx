"use client";

import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lock } from "lucide-react";
import type { Achievement } from "@/data/achievements";

interface AchievementsGridProps {
  unlocked: Achievement[];
  locked: Achievement[];
  /** Hide the section title (e.g. when the parent sheet already has a heading). */
  showHeading?: boolean;
}

export const AchievementsGrid = memo(function AchievementsGrid({
  unlocked,
  locked,
  showHeading = true,
}: AchievementsGridProps) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const total = unlocked.length + locked.length;

  return (
    <div className="mx-auto max-w-md px-4 pt-2 pb-2">
      {showHeading ? (
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-[var(--nourish-dark)]">
            Achievements
          </h2>
          <span className="text-xs text-[var(--nourish-subtext)]">
            {unlocked.length}/{total}
          </span>
        </div>
      ) : null}

      <div className="grid grid-cols-5 gap-2">
        {unlocked.map((a, idx) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: idx * 0.03,
            }}
            className="flex flex-col items-center gap-1"
            title={`${a.name}: ${a.description}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-sm">
              <span className="text-xl">{a.emoji}</span>
            </div>
            <span className="text-[9px] font-medium text-[var(--nourish-dark)] text-center leading-tight line-clamp-2">
              {a.name}
            </span>
          </motion.div>
        ))}
        {locked.slice(0, Math.max(0, 10 - unlocked.length)).map((a, idx) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (unlocked.length + idx) * 0.03 }}
            className="flex flex-col items-center gap-1 opacity-40"
            title={a.description}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 border border-neutral-200/50">
              <Lock size={14} className="text-neutral-400" />
            </div>
            <span className="text-[9px] font-medium text-neutral-400 text-center leading-tight line-clamp-2">
              {a.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
});
