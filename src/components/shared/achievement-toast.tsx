"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Achievement } from "@/data/achievements";

interface AchievementToastProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

export function AchievementToast({
  achievements,
  onDismiss,
}: AchievementToastProps) {
  const first = achievements[0];

  return (
    <AnimatePresence>
      {first && (
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="fixed bottom-20 left-4 right-4 z-[60] mx-auto max-w-sm"
        >
          <button
            onClick={onDismiss}
            className="w-full rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-xl shadow-amber-500/20"
            type="button"
          >
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: 0.15,
                }}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl"
              >
                {first.emoji}
              </motion.div>
              <div className="text-left">
                <motion.p
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs font-medium text-white/80 uppercase tracking-wide"
                >
                  Achievement Unlocked!
                </motion.p>
                <motion.p
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-lg font-bold"
                >
                  {first.name}
                </motion.p>
                <motion.p
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-white/90"
                >
                  {first.description}
                </motion.p>
                {achievements.length > 1 && (
                  <motion.p
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-1 text-xs text-white/70"
                  >
                    +{achievements.length - 1} more
                  </motion.p>
                )}
              </div>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
