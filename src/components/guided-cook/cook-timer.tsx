"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { TimerEntry } from "@/lib/hooks/use-cook-store";
import { useCookStore } from "@/lib/hooks/use-cook-store";

function pickPrimary(timers: TimerEntry[]): TimerEntry | null {
  if (timers.length === 0) return null;
  const active = timers.filter((t) => t.completedAt === null);
  if (active.length > 0) {
    return active.reduce((a, b) => (a.remaining <= b.remaining ? a : b));
  }
  return timers.reduce((a, b) =>
    (a.completedAt ?? 0) >= (b.completedAt ?? 0) ? a : b,
  );
}

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * CookTimer — floating countdown ring showing the most urgent active timer.
 * When multiple timers run in parallel (combined cooks), the ring follows the
 * lowest-remaining one; the full set is visible in the TimerStack pill strip
 * above the step card.
 */
export function CookTimer() {
  const timers = useCookStore((s) => s.timers);
  const tickTimers = useCookStore((s) => s.tickTimers);
  const stopTimer = useCookStore((s) => s.stopTimer);

  const primary = pickPrimary(timers);

  const [showDone, setShowDone] = useState(false);
  const vibratedForRef = useRef<string | null>(null);

  // Global 1 Hz ticker — runs only while any timer is in flight.
  useEffect(() => {
    if (timers.length === 0) return;
    const interval = setInterval(() => tickTimers(), 1000);
    return () => clearInterval(interval);
  }, [timers.length, tickTimers]);

  // Vibrate once per timer when it first hits zero.
  useEffect(() => {
    const justDone = timers.find(
      (t) => t.completedAt !== null && vibratedForRef.current !== t.id,
    );
    if (!justDone) return;
    vibratedForRef.current = justDone.id;
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    } catch {
      /* unsupported */
    }
    // Flash the "Done!" label for the linger window. Guard is satisfied via
    // `vibratedForRef` above — this effect only runs once per finished timer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowDone(true);
    const id = setTimeout(() => setShowDone(false), 1800);
    return () => clearTimeout(id);
  }, [timers]);

  if (!primary) return null;

  const { remaining, totalSeconds } = primary;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display =
    totalSeconds >= 60
      ? `${minutes}:${String(seconds).padStart(2, "0")}`
      : `${remaining}s`;

  const fraction = totalSeconds > 0 ? remaining / totalSeconds : 1;
  const strokeDash = fraction * CIRCUMFERENCE;
  const isLow = remaining <= 10 && remaining > 0;
  const isDone = primary.completedAt !== null;

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
        <div
          className="relative flex items-center justify-center"
          style={{ width: 72, height: 72 }}
        >
          <svg width="72" height="72" className="-rotate-90">
            <circle
              cx="36"
              cy="36"
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="4"
            />
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

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {isDone && showDone ? (
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
                  style={{ fontSize: remaining >= 600 ? 16 : 20 }}
                >
                  {display}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={() => stopTimer(primary.id)}
          className="flex items-center justify-center rounded-full min-h-11 min-w-11 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={`Stop ${primary.label}`}
          type="button"
        >
          <X size={18} />
        </button>
      </motion.div>
    </motion.div>
  );
}
