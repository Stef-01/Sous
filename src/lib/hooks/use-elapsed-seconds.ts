"use client";

/**
 * useElapsedSeconds — Y2 Sprint F W24.
 *
 * Tracks elapsed seconds since the current step started. Companion
 * hook to the W23/W24 pointer sequence runner — the cook-step
 * UI passes the current `stepKey` and gets back a number that
 * resets to 0 on stepKey change + ticks ~4×/sec while the page
 * is visible.
 *
 * Tick cadence: 250ms (matches the W24 plan). Sub-second
 * granularity matters for the W25 reveal-time format which
 * supports "@ 0.5s" style fractional delays — coarser ticks
 * would skip those fast reveals.
 *
 * Visibility gating: the elapsed counter PAUSES when the page is
 * hidden (`document.visibilityState !== "visible"`). Resumes from
 * the same value on visibility return so the user doesn't lose
 * their place if they switch tabs to read an ingredient label.
 *
 * Pure-as-possible: the side effect surface is contained to the
 * single useEffect; the math is testable without React via the
 * `advanceElapsed` helper exported below.
 */

import { useEffect, useRef, useState } from "react";

/** Tick cadence in ms. Sub-second so fractional reveal times
 *  ("@ 0.5s") fire at the right moment. */
export const ELAPSED_TICK_MS = 250;

/** Pure: compute the new elapsed seconds given a wall-clock
 *  delta. Exported for tests + for callers driving the counter
 *  from a non-RAF source (e.g. the cook flow's own scheduler). */
export function advanceElapsed(
  prevElapsed: number,
  wallDeltaMs: number,
): number {
  if (!Number.isFinite(prevElapsed)) return 0;
  if (!Number.isFinite(wallDeltaMs) || wallDeltaMs <= 0) return prevElapsed;
  return prevElapsed + wallDeltaMs / 1000;
}

export interface UseElapsedSecondsResult {
  /** Elapsed seconds in the current step. Resets to 0 on stepKey
   *  change. Pauses while document.visibilityState !== "visible". */
  elapsed: number;
  /** Manually reset the counter to 0 — useful when the user
   *  re-engages with a step (e.g. taps "rewatch from start"). */
  reset: () => void;
}

/** Track elapsed seconds since the most recent stepKey change.
 *  Pauses while the page is hidden. */
export function useElapsedSeconds(stepKey: string): UseElapsedSecondsResult {
  const [elapsed, setElapsed] = useState(0);
  const lastTickRef = useRef<number | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: reset elapsed on stepKey change + drive timer-tick */
  useEffect(() => {
    // Reset on stepKey change (and on mount). The effect re-runs
    // whenever stepKey changes; clear the previous interval and
    // restart the counter from 0.
    setElapsed(0);
    lastTickRef.current = null;

    if (typeof window === "undefined") return;
    if (typeof document === "undefined") return;

    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      if (!mounted) return;
      if (document.visibilityState !== "visible") {
        // Pause: reset the wall-clock anchor so next visible tick
        // doesn't catch up the lost time. The cook step is
        // genuinely paused for the user, so the elapsed counter
        // should match.
        lastTickRef.current = null;
        return;
      }
      const now = performance.now();
      if (lastTickRef.current === null) {
        lastTickRef.current = now;
        return;
      }
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      setElapsed((prev) => advanceElapsed(prev, delta));
    };

    const onVisibility = () => {
      // On return-to-visible, reset the wall-clock anchor so the
      // next tick measures from "now" rather than from the
      // pre-hide timestamp (which would mass-advance the counter).
      if (document.visibilityState === "visible") {
        lastTickRef.current = performance.now();
      } else {
        lastTickRef.current = null;
      }
    };

    intervalId = setInterval(tick, ELAPSED_TICK_MS);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mounted = false;
      if (intervalId !== null) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [stepKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const reset = () => {
    setElapsed(0);
    lastTickRef.current = null;
  };

  return { elapsed, reset };
}
