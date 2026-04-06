"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useCookStore } from "@/lib/hooks/use-cook-store";
import { cn } from "@/lib/utils/cn";

/**
 * Cook Timer — floating countdown overlay.
 * Shows when timerActive is true. Counts down, vibrates + sounds at zero.
 */
export function CookTimer() {
  const { timerActive, timerRemaining, tickTimer, stopTimer } = useCookStore();

  useEffect(() => {
    if (!timerActive || timerRemaining <= 0) return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timerRemaining, tickTimer]);

  // Timer completion effect
  useEffect(() => {
    if (timerActive && timerRemaining === 0) {
      // Vibrate if supported
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
      stopTimer();
    }
  }, [timerActive, timerRemaining, stopTimer]);

  if (!timerActive && timerRemaining <= 0) return null;

  const minutes = Math.floor(timerRemaining / 60);
  const seconds = timerRemaining % 60;
  const display = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-full px-5 py-3 shadow-lg",
          "bg-[var(--nourish-dark)] text-white"
        )}
      >
        {/* Timer display */}
        <span className="font-mono text-lg font-bold tabular-nums">
          {display}
        </span>

        {/* Dismiss */}
        <button
          onClick={stopTimer}
          className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
          aria-label="Stop timer"
          type="button"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}
