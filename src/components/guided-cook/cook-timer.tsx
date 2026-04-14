"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useCookStore } from "@/lib/hooks/use-cook-store";

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * CookTimer — floating countdown with circular SVG progress ring.
 * Large centred time display. Pulses + vibrates at zero, shows "Done!" briefly.
 */
export function CookTimer() {
  const { timerActive, timerRemaining, tickTimer, stopTimer } = useCookStore();
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [showDone, setShowDone] = useState(false);

  // Capture the initial duration when the timer starts
  useEffect(() => {
    if (timerActive && timerRemaining > 0 && timerRemaining > totalSeconds) {
      const id = setTimeout(() => setTotalSeconds(timerRemaining), 0);
      return () => clearTimeout(id);
    }
  }, [timerActive, timerRemaining, totalSeconds]);

  // Tick interval
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(interval);
  }, [timerActive, tickTimer]);

  // Completion: vibrate, flash "Done!", then dismiss
  useEffect(() => {
    if (!timerActive || timerRemaining !== 0) return;

    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    } catch {
      /* unsupported */
    }

    const showId = setTimeout(() => setShowDone(true), 0);
    const hideId = setTimeout(() => {
      setShowDone(false);
      setTotalSeconds(0);
      stopTimer();
    }, 1800);
    return () => {
      clearTimeout(showId);
      clearTimeout(hideId);
    };
  }, [timerActive, timerRemaining, stopTimer]);

  if (!timerActive && timerRemaining <= 0) return null;

  const minutes = Math.floor(timerRemaining / 60);
  const seconds = timerRemaining % 60;
  const display =
    totalSeconds >= 60
      ? `${minutes}:${String(seconds).padStart(2, "0")}`
      : `${timerRemaining}s`;

  // Ring fill: fraction remaining
  const fraction = totalSeconds > 0 ? timerRemaining / totalSeconds : 1;
  const strokeDash = fraction * CIRCUMFERENCE;
  const isLow = timerRemaining <= 10 && timerRemaining > 0;
  const isDone = timerRemaining === 0;

  return (
    <motion.div
      initial={{ y: 64, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 64, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.div
        animate={
          isDone
            ? { scale: [1, 1.15, 1, 1.1, 1] }
            : isLow
              ? { scale: [1, 1.04, 1] }
              : {}
        }
        transition={
          isDone
            ? { duration: 0.5, ease: "easeInOut" }
            : isLow
              ? { duration: 0.6, repeat: Infinity, repeatType: "loop" }
              : {}
        }
        className="flex items-center gap-4 rounded-2xl bg-[var(--nourish-dark)] px-5 py-3 shadow-xl"
      >
        {/* Circular progress ring */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: 72, height: 72 }}
        >
          <svg width="72" height="72" className="-rotate-90">
            {/* Track */}
            <circle
              cx="36"
              cy="36"
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="4"
            />
            {/* Progress */}
            <motion.circle
              cx="36"
              cy="36"
              r={RADIUS}
              fill="none"
              stroke={isDone ? "#D4A84B" : isLow ? "#FF6B6B" : "#4ECDC4"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animate={{ strokeDashoffset: CIRCUMFERENCE - strokeDash }}
              transition={{ duration: 0.8, ease: "linear" }}
            />
          </svg>

          {/* Time display — centred inside the ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {showDone ? (
                <motion.span
                  key="done"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="text-sm font-bold text-[#D4A84B]"
                >
                  Done!
                </motion.span>
              ) : (
                <motion.span
                  key="time"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono font-bold tabular-nums text-white leading-none"
                  style={{ fontSize: timerRemaining >= 600 ? 16 : 20 }}
                >
                  {display}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => {
            setShowDone(false);
            setTotalSeconds(0);
            stopTimer();
          }}
          className="rounded-full p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Stop timer"
          type="button"
        >
          <X size={18} />
        </button>
      </motion.div>
    </motion.div>
  );
}
