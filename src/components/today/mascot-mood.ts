/**
 * mascotMood — the header Doberman coach's expression, computed from the user's
 * day (W22 "coach micro-animations on bounded triggers"). Pure + deterministic,
 * so the bounded-coach rule holds: the Dobe only reacts to real signals (a
 * streak, the time of night, a gentle nudge), never as an open-ended agent.
 */

export type MascotMood = "idle" | "happy" | "sleepy" | "alert" | "proud";

export interface MascotMoodInput {
  /** Local hour 0–23. */
  hour: number;
  /** Logging / cook streak (freeze-bridged). */
  streak: number;
  /** Cooks completed in the last 7 days — an active week keeps the Dobe happy. */
  cooksThisWeek?: number;
  /** A cook was completed today — the Dobe is visibly proud of it (R6). */
  cookedToday?: boolean;
  /** A soft nudge is pending (e.g. nothing cooked yet, a dinner-window prompt). */
  nudge?: boolean;
}

/**
 * The header Dobe reacts to REAL cooking, not just the streak (R6). Priority:
 * a fresh cook today makes it proud (the strongest positive signal); momentum or
 * an active week keeps it happy; a pending nudge perks it alert; late at night it
 * dozes; otherwise it idles. Hour wraps safely. Pure + deterministic so the
 * bounded-coach rule holds — it only reacts to real signals, never as an agent.
 */
export function mascotMood({
  hour,
  streak,
  cooksThisWeek = 0,
  cookedToday = false,
  nudge = false,
}: MascotMoodInput): MascotMood {
  if (cookedToday) return "proud";
  if (streak >= 3 || cooksThisWeek >= 2) return "happy";
  if (nudge) return "alert";
  const h = ((Math.trunc(hour) % 24) + 24) % 24;
  if (h >= 22 || h < 6) return "sleepy";
  return "idle";
}
