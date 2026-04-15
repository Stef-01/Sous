"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LevelUpToastProps {
  level: number | null;
  title: string;
  onDismiss: () => void;
}

export const LevelUpToast = memo(function LevelUpToast({ level, title, onDismiss }: LevelUpToastProps) {
  return (
    <AnimatePresence>
      {level !== null && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="fixed bottom-20 left-4 right-4 z-[60] mx-auto max-w-sm"
        >
          <button
            onClick={onDismiss}
            className="w-full rounded-2xl bg-gradient-to-br from-[var(--nourish-green)] to-[var(--nourish-dark-green)] p-5 text-white shadow-xl shadow-[var(--nourish-green)]/20"
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
                ⭐
              </motion.div>
              <div className="text-left">
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs font-medium text-white/80 uppercase tracking-wide"
                >
                  Level Up!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xl font-bold"
                >
                  Level {level}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-white/90"
                >
                  {title}
                </motion.p>
              </div>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
