"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, SkipForward } from "lucide-react";
import type { TimerEntry } from "@/lib/hooks/use-cook-store";
import { useCookStore } from "@/lib/hooks/use-cook-store";
import { playTimerChime } from "@/lib/hooks/use-timer-chime";

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
 * CookTimer  -  floating countdown ring showing the most urgent active timer.
 * When multiple timers run in parallel (combined cooks), the ring follows the
 * lowest-remaining one; the full set is visible in the TimerStack pill strip
 * above the step card.
 */
/** Auto-advance delay (ms) after timer completion before moving to next step. */
const AUTO_ADVANCE_DELAY_MS = 2500;

export function CookTimer() {
  const timers = useCookStore((s) => s.timers);
  const tickTimers = useCookStore((s) => s.tickTimers);
  const stopTimer = useCookStore((s) => s.stopTimer);
  const nextStep = useCookStore((s) => s.nextStep);
  const currentPhase = useCookStore((s) => s.currentPhase);
  const currentStepIndex = useCookStore((s) => s.currentStepIndex);
  const totalSteps = useCookStore((s) => s.totalSteps);

  const primary = pickPrimary(timers);

  const [showDone, setShowDone] = useState(false);
  /** Countdown seconds until auto-advance (null = not advancing). */
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const vibratedForRef = useRef<string | null>(null);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const isLastStep = currentStepIndex >= totalSteps - 1;
  const canAutoAdvance = currentPhase === "cook" && !isLastStep;

  const cancelAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setAutoAdvanceCountdown(null);
  }, []);

  // Global 1 Hz ticker  -  runs only while any timer is in flight.
  useEffect(() => {
    if (timers.length === 0) return;
    const interval = setInterval(() => tickTimers(), 1000);
    return () => clearInterval(interval);
  }, [timers.length, tickTimers]);

  // Play chime + vibrate once per timer when it first hits zero.
  // Then kick off auto-advance countdown if not on the last step.
  useEffect(() => {
    const justDone = timers.find(
      (t) => t.completedAt !== null && vibratedForRef.current !== t.id,
    );
    if (!justDone) return;
    vibratedForRef.current = justDone.id;

    // Chime sound via Web Audio API
    try {
      playTimerChime();
    } catch {
      /* unsupported */
    }

    // Haptic feedback
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    } catch {
      /* unsupported */
    }

    // Flash the "Done!" label for the linger window. Guard is satisfied via
    // `vibratedForRef` above  -  this effect only runs once per finished timer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowDone(true);
    const doneId = setTimeout(() => setShowDone(false), 1800);

    // Auto-advance countdown: only if we're in the cook phase and not on last step
    if (canAutoAdvance) {
      const seconds = Math.round(AUTO_ADVANCE_DELAY_MS / 1000);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAutoAdvanceCountdown(seconds);

      // Tick the countdown each second
      let remaining = seconds;
      const countdownInterval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(countdownInterval);
          setAutoAdvanceCountdown(null);
          nextStep();
        } else {
          setAutoAdvanceCountdown(remaining);
        }
      }, 1000);

      autoAdvanceTimerRef.current = countdownInterval as unknown as ReturnType<typeof setTimeout>;

      return () => {
        clearTimeout(doneId);
        clearInterval(countdownInterval);
      };
    }

    return () => clearTimeout(doneId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timers]);

  // Clean up auto-advance on unmount
  useEffect(() => cancelAutoAdvance, [cancelAutoAdvance]);

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
          prefersReducedMotion
            ? {}
            : isDone
              ? { scale: [1, 1.15, 1, 1.1, 1] }
              : isLow
                ? { scale: [1, 1.04, 1] }
                : {}
        }
        transition={
          prefersReducedMotion
            ? {}
            : isDone
              ? { duration: 0.5, ease: "easeInOut" }
              : isLow
                ? { duration: 0.6, repeat: Infinity, repeatType: "loop" }
                : {}
        }
        className="flex items-center gap-4 rounded-2xl bg-[var(--nourish-dark)] px-5 py-3 shadow-xl"
      >
        <div
          className="relative flex items-center justify-center"
          style={{ wi