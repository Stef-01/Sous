/**
 * mascotMood — the header Doberman coach's expression, computed from the user's
 * day (W22 "coach micro-animations on bounded triggers"). Pure + deterministic,
 * so the bounded-coach rule holds: the Dobe only reacts to real signals (a
 * streak, the time of night, a gentle nudge), never as an open-ended agent.
 */

export type MascotMood = "idle" | "happy" | "sleepy" | "alert";

export interface MascotMoodInput {
  /** Local hour 0–23. */
  hour: number;
  /** Logging / cook streak (freeze-bridged). */
  streak: number;
  /** A soft nudge is pending (e.g. first run, nothing cooked yet). */
  nudge?: boolean;
}

/**
 * Priority: a streak earns a happy Dobe (ears + tongue); otherwise a pending
 * nudge perks it alert; late at night it dozes; otherwise it idles. Hour wraps
 * safely.
 */
export function mascotMood({
  hour,
  streak,
  nudge = false,
}: MascotMoodInput): MascotMood {
  if (streak >= 3) return "happy";
  if (nudge) return "alert";
  const h = ((Math.trunc(hour) % 24) + 24) % 24;
  if (h >= 22 || h < 6) return "sleepy";
  return "idle";
}
