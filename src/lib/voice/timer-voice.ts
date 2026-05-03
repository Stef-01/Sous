/**
 * Voice timer helpers — pure formatting + selection logic for
 * the W39 timer-voice command wiring.
 *
 * Pairs with the existing `useCookStore` timer state and the
 * W18 `parseCookVoiceIntent` (which already extracts seconds
 * from "5 minutes" / "30 seconds" / "half a minute").
 *
 * Pure / dependency-free — testable without rendering React or
 * touching the cook store.
 */

import type { TimerEntry } from "@/lib/hooks/use-cook-store";

/** Pick the most recent ACTIVE timer (completedAt === null) for
 *  the "what's my timer at?" voice query and for "add 5 minutes"
 *  routing. Returns null when no active timer exists. */
export function findMostRecentActiveTimer(
  timers: ReadonlyArray<TimerEntry>,
): TimerEntry | null {
  let best: TimerEntry | null = null;
  let bestStart = -Infinity;
  for (const t of timers) {
    if (t.completedAt !== null) continue;
    if (t.startedAt > bestStart) {
      bestStart = t.startedAt;
      best = t;
    }
  }
  return best;
}

/** Format a remaining-seconds value as a speakable English
 *  phrase. Examples:
 *
 *    220 → "3 minutes 40 seconds"
 *     60 → "1 minute"
 *     45 → "45 seconds"
 *      0 → "0 seconds"
 *  -10  → "0 seconds"  (defensive)
 */
export function formatSpeakableRemaining(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0 seconds";
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  const parts: string[] = [];
  if (mins > 0) {
    parts.push(`${mins} ${mins === 1 ? "minute" : "minutes"}`);
  }
  if (secs > 0) {
    parts.push(`${secs} ${secs === 1 ? "second" : "seconds"}`);
  }
  if (parts.length === 0) return "0 seconds";
  return parts.join(" ");
}

/** Compose the speakable response for a "what's my timer?"
 *  query. Returns one of:
 *
 *    "no timer running"  — when no active timer exists
 *    "<label>: 3 minutes 20 seconds remaining"  — labelled timer
 *    "3 minutes 20 seconds remaining"           — unlabelled / "Timer"
 */
export function speakableTimerStatus(
  timers: ReadonlyArray<TimerEntry>,
): string {
  const active = findMostRecentActiveTimer(timers);
  if (!active) return "no timer running";
  const remaining = formatSpeakableRemaining(active.remaining);
  // Suppress the generic "Timer" label so "Timer: 3 minutes
  // remaining" doesn't sound robotic.
  if (!active.label || active.label.toLowerCase() === "timer") {
    return `${remaining} remaining`;
  }
  return `${active.label}: ${remaining} remaining`;
}

/** Compose the speakable confirmation for a "set X minutes"
 *  command — short positive feedback that the timer started. */
export function speakableTimerSet(seconds: number): string {
  return `Timer set for ${formatSpeakableRemaining(seconds)}.`;
}

/** Compose the speakable confirmation for a "cancel timer"
 *  command. */
export function speakableTimerCancel(hadActiveTimer: boolean): string {
  return hadActiveTimer ? "Timers cancelled." : "No timer to cancel.";
}

/** Compose the speakable confirmation for an "add X minutes"
 *  command. */
export function speakableTimerAdd(seconds: number, applied: boolean): string {
  if (!applied) return "No active timer to extend.";
  return `Added ${formatSpeakableRemaining(seconds)}.`;
}
