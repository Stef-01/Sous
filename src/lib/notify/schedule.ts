/**
 * Smart notification scheduler (Y2 Sprint E W21).
 *
 * Pure helper that, given a rhythm pattern + current time,
 * returns the next Date the nudge should fire — or null when
 * the rhythm isn't strong enough to justify a nudge.
 *
 * Logic:
 *   - Confidence below MIN_NOTIFY_CONFIDENCE (W19, 0.6) → null.
 *   - typicalDays empty / typicalHour -1 → null.
 *   - Otherwise: compute the next typicalDay-at-typicalHour
 *     in the future + subtract NUDGE_LEAD_MINUTES (30 min by
 *     default) so the user has time to plan.
 *
 * The scheduler doesn't fire the nudge — it just computes when
 * it should fire. The caller (a setTimeout, cron, or push-API
 * dispatch) is the firing surface.
 *
 * Pure / dependency-free / deterministic.
 */

import {
  MIN_NOTIFY_CONFIDENCE,
  type RhythmPattern,
} from "@/lib/engine/rhythm-pattern";

export const NUDGE_LEAD_MINUTES = 30;

/** Pure: compute the next nudge time, or null when no nudge is
 *  warranted. The returned Date is in local time (matches the
 *  RhythmPattern's day/hour semantics). */
export function scheduleNextNudge(
  rhythm: RhythmPattern,
  now: Date,
): Date | null {
  if (rhythm.confidence < MIN_NOTIFY_CONFIDENCE) return null;
  if (rhythm.typicalDays.length === 0) return null;
  if (rhythm.typicalHour < 0 || rhythm.typicalHour > 23) return null;

  // Find the smallest day-offset from `now` that lands on a
  // typical day at typical hour - lead minutes, in the future.
  let bestCandidate: Date | null = null;
  for (let offset = 0; offset < 14; offset++) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + offset);
    candidate.setHours(rhythm.typicalHour, 0, 0, 0);
    candidate.setMinutes(candidate.getMinutes() - NUDGE_LEAD_MINUTES);

    const dow = candidate.getDay();
    if (!rhythm.typicalDays.includes(dow)) continue;
    if (candidate.getTime() <= now.getTime()) continue;

    if (
      bestCandidate === null ||
      candidate.getTime() < bestCandidate.getTime()
    ) {
      bestCandidate = candidate;
    }
  }
  return bestCandidate;
}

/** Pure: detect whether the user missed last week's typical
 *  cook. The W21 streak-forgiveness overlay reads this to swap
 *  nudge copy from "implementation intention" to "just data,
 *  what sounds good tonight?".
 *
 *  Definition: last week's typical-day exists in the
 *  streakHistory window AND was NOT cooked. Window covers the
 *  last 28 days (RhythmPattern.streakHistory length). */
export function missedLastWeeksTypicalDay(
  rhythm: RhythmPattern,
  now: Date,
): boolean {
  if (rhythm.typicalDays.length === 0) return false;

  // Walk back 7 days from "now" (last week) + check if that day
  // was a typical day + whether it was cooked.
  for (let offset = 7; offset < 14; offset++) {
    const day = new Date(now);
    day.setDate(day.getDate() - offset);
    const dow = day.getDay();
    if (!rhythm.typicalDays.includes(dow)) continue;
    const entry = rhythm.streakHistory.find((s) => s.day === offset);
    if (entry && !entry.cooked) return true;
    if (entry && entry.cooked) return false;
  }
  return false;
}

/** Pure: compute the consecutive-week streak on the user's
 *  most-typical day. Counts how many weeks back from now have
 *  a "cooked" entry on that typical day, stopping at the first
 *  miss.
 *
 *  Returns 0 when no typical day, or when the most-recent
 *  occurrence wasn't cooked. */
export function rhythmWeeksRunning(rhythm: RhythmPattern, now: Date): number {
  if (rhythm.typicalDays.length === 0) return 0;
  // Use the first (lowest-numbered) typical day for the streak
  // — single-point identity language reads cleaner than
  // multi-day claims.
  const typicalDay = rhythm.typicalDays[0];
  if (typicalDay === undefined) return 0;

  let weeks = 0;
  for (let offset = 0; offset < 28; offset++) {
    const day = new Date(now);
    day.setDate(day.getDate() - offset);
    const dow = day.getDay();
    if (dow !== typicalDay) continue;
    const entry = rhythm.streakHistory.find((s) => s.day === offset);
    if (!entry) break;
    if (entry.cooked) {
      weeks += 1;
    } else {
      // Skip the just-this-week one if today hasn't reached
      // typicalDay yet — only count completed weeks.
      if (offset === 0 && weeks === 0) continue;
      break;
    }
  }
  return weeks;
}
