/**
 * Rhythm pattern inference (Y2 Sprint E W19).
 *
 * Given the user's cook history, infers the typical day-of-week
 * + hour they cook + a confidence score. The smart-notification
 * scheduler (W21) uses this to fire a nudge "Tuesday 5:30pm —
 * what'll you cook tonight?" half an hour before the typical
 * cook time on the typical day.
 *
 * Algorithm:
 *   - typicalDays: histogram of completedAt day-of-week, with a
 *     small uniform Bayes-prior so 1-2 cooks don't claim Tuesday.
 *     The day(s) above the smoothed mean are returned (commonly
 *     just 1 day; up to 2 when the user has a strong twin pattern
 *     like "Tuesdays + Saturdays").
 *   - typicalHour: hour-of-day mode, weighted by recency so the
 *     past month dominates older history.
 *   - confidence: peak-mass / total-mass on the day histogram. A
 *     user who cooks 8 of 10 sessions on Tuesday: confidence = 0.8.
 *     A user with cooks evenly across all 7 days: confidence ≈ 0.14.
 *   - streakHistory: last 28 days as {day, cooked} for the rhythm
 *     widget's bar visualisation.
 *
 * Confidence threshold for notifications: 0.6 (set by W21 scheduler;
 * we expose `MIN_NOTIFY_CONFIDENCE` so callers can reason about it).
 *
 * Pure / dependency-free / deterministic.
 */

import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Notifications fire only when confidence reaches this value.
 *  Below this, the helper still returns a `typicalHour` /
 *  `typicalDays` (so the widget can show "loading rhythm…"
 *  copy) but the scheduler won't act on it. */
export const MIN_NOTIFY_CONFIDENCE = 0.6;

/** Bayes-prior strength. Higher = more smoothing toward uniform.
 *  At alpha=1 (Laplace), 7 phantom cooks distributed across days
 *  sit alongside the real history. With ~14 real cooks the prior
 *  is half-influential; at 50 cooks the prior fades. Tuned for
 *  Sous's 5-15-cook typical user. */
const DAY_PRIOR_ALPHA = 1;

/** Window inside which more-recent cooks count for more in the
 *  hour-mode calculation. Cooks > 60d ago contribute 25% weight;
 *  cooks today contribute 100%. */
const HOUR_RECENCY_WINDOW_DAYS = 60;
const HOUR_RECENCY_FLOOR = 0.25;

export interface RhythmPattern {
  /** Day-of-week numbers (0=Sun..6=Sat) above the smoothed
   *  histogram mean. Empty when no data. */
  typicalDays: number[];
  /** Hour-of-day mode (0..23). Recency-weighted. -1 when no data. */
  typicalHour: number;
  /** 0..1 — how concentrated the day pattern is. */
  confidence: number;
  /** Last 28 days as {dayOffset, cooked}. dayOffset 0 = today,
   *  27 = 27 days ago. cooked = at least one completedAt
   *  session on that calendar day. */
  streakHistory: { day: number; cooked: boolean }[];
}

/** Pure: infer the rhythm pattern from a cook history. Sessions
 *  without `completedAt` or with invalid timestamps are ignored.
 *  Empty / all-skipped history returns empty / sentinel values
 *  with confidence 0. */
export function inferRhythmPattern(
  sessions: ReadonlyArray<CookSessionRecord>,
  now: Date = new Date(),
): RhythmPattern {
  const completedTimes: number[] = [];
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const ts = new Date(s.completedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    if (ts > now.getTime()) continue; // future timestamp = bad data
    completedTimes.push(ts);
  }

  // ── Day-of-week histogram with Bayes prior ───────────────
  const dayCounts: number[] = [
    DAY_PRIOR_ALPHA,
    DAY_PRIOR_ALPHA,
    DAY_PRIOR_ALPHA,
    DAY_PRIOR_ALPHA,
    DAY_PRIOR_ALPHA,
    DAY_PRIOR_ALPHA,
    DAY_PRIOR_ALPHA,
  ];
  for (const ts of completedTimes) {
    const dow = new Date(ts).getDay();
    dayCounts[dow] = (dayCounts[dow] ?? 0) + 1;
  }
  const dayTotal = dayCounts.reduce((a, b) => a + b, 0);
  const meanDayCount = dayTotal / 7;
  const typicalDays: number[] = [];
  for (let d = 0; d < 7; d++) {
    if ((dayCounts[d] ?? 0) > meanDayCount) typicalDays.push(d);
  }

  // Confidence: peak / (total real cooks). Use real cooks (no
  // prior) so confidence reflects actual data strength.
  const realCounts: number[] = [0, 0, 0, 0, 0, 0, 0];
  for (const ts of completedTimes) {
    const dow = new Date(ts).getDay();
    realCounts[dow] = (realCounts[dow] ?? 0) + 1;
  }
  const realTotal = completedTimes.length;
  let peak = 0;
  for (const c of realCounts) {
    if (c > peak) peak = c;
  }
  const confidence = realTotal === 0 ? 0 : peak / realTotal;

  // ── Hour-of-day mode (recency-weighted) ──────────────────
  const hourWeights: number[] = new Array(24).fill(0);
  const nowMs = now.getTime();
  for (const ts of completedTimes) {
    const ageDays = Math.max(0, (nowMs - ts) / DAY_MS);
    const weight =
      ageDays >= HOUR_RECENCY_WINDOW_DAYS
        ? HOUR_RECENCY_FLOOR
        : 1 - (1 - HOUR_RECENCY_FLOOR) * (ageDays / HOUR_RECENCY_WINDOW_DAYS);
    const hour = new Date(ts).getHours();
    hourWeights[hour] = (hourWeights[hour] ?? 0) + weight;
  }
  let typicalHour = -1;
  let topWeight = 0;
  for (let h = 0; h < 24; h++) {
    const w = hourWeights[h] ?? 0;
    if (w > topWeight) {
      topWeight = w;
      typicalHour = h;
    }
  }

  // ── streakHistory: last 28 days ──────────────────────────
  const streakHistory: { day: number; cooked: boolean }[] = [];
  const todayLocal = startOfLocalDay(now);
  for (let offset = 0; offset < 28; offset++) {
    const dayStart = todayLocal.getTime() - offset * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    let cooked = false;
    for (const ts of completedTimes) {
      if (ts >= dayStart && ts < dayEnd) {
        cooked = true;
        break;
      }
    }
    streakHistory.push({ day: offset, cooked });
  }

  return {
    typicalDays,
    typicalHour,
    confidence,
    streakHistory,
  };
}

/** Pure: midnight (local time) of the given Date. */
function startOfLocalDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}
