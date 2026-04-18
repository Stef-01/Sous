/**
 * cook-rhythm — derive the user's habitual cooking cadence from session history.
 *
 * Sprint D, Phase 1: The Path surface tells the user what Sous has learned
 * about _what_ they cook; this utility gives the Today surface a single line
 * about _when_ they cook. Deterministic, no randomness.
 *
 * Silent below MIN_COOKS. We need enough samples before claiming a pattern.
 */

import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

export const RHYTHM_MIN_COOKS = 3;

type DayName = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

const DAY_NAMES: DayName[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const LONG_NAMES: Record<DayName, string> = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

/**
 * Hour-of-day bucketing. Keep it coarse — the user does not want to read
 * "you cook at 18:37 on average".
 */
type TimeBucket = "morning" | "midday" | "evening" | "late";

function bucketFromHour(h: number): TimeBucket {
  if (h < 11) return "morning";
  if (h < 15) return "midday";
  if (h < 21) return "evening";
  return "late";
}

const BUCKET_LABEL: Record<TimeBucket, string> = {
  morning: "mornings",
  midday: "around midday",
  evening: "evenings",
  late: "late nights",
};

export interface CookRhythm {
  /** Stable copy like "You usually cook Tues + Thurs evenings." */
  sentence: string;
  /** How many completed sessions drove this observation. */
  sampleSize: number;
}

/**
 * Derive a single rhythm sentence from completed sessions.
 *
 * Returns `null` below the minimum-cooks threshold or when no pattern is
 * strong enough to be honest about (e.g. the user cooks once on every day of
 * the week — no pattern exists).
 */
export function deriveCookRhythm(
  sessions: CookSessionRecord[],
): CookRhythm | null {
  const completed = sessions.filter((s) => !!s.completedAt);
  if (completed.length < RHYTHM_MIN_COOKS) return null;

  const dayCounts = new Array<number>(7).fill(0);
  const bucketCounts: Record<TimeBucket, number> = {
    morning: 0,
    midday: 0,
    evening: 0,
    late: 0,
  };

  for (const s of completed) {
    if (!s.completedAt) continue;
    const d = new Date(s.completedAt);
    if (Number.isNaN(d.getTime())) continue;
    dayCounts[d.getDay()] += 1;
    bucketCounts[bucketFromHour(d.getHours())] += 1;
  }

  // ── Identify strongest day(s) ──────────────────────────────────────
  const peakDayCount = Math.max(...dayCounts);
  const totalDayHits = dayCounts.reduce((a, b) => a + b, 0);
  if (totalDayHits === 0) return null;

  // Require the peak day to be at least 1.5x the mean — otherwise no pattern.
  const meanPerDay = totalDayHits / 7;
  if (peakDayCount < Math.max(2, meanPerDay * 1.5)) return null;

  const peakDays: DayName[] = [];
  for (let i = 0; i < 7; i++) {
    if (dayCounts[i] === peakDayCount) peakDays.push(DAY_NAMES[i]);
    if (peakDays.length >= 2) break;
  }

  // ── Identify dominant time bucket ──────────────────────────────────
  const peakBucket = (
    Object.entries(bucketCounts) as [TimeBucket, number][]
  ).sort((a, b) => b[1] - a[1])[0][0];

  const bucketLabel = BUCKET_LABEL[peakBucket];

  const dayPhrase =
    peakDays.length === 1
      ? LONG_NAMES[peakDays[0]]
      : `${peakDays[0]} + ${peakDays[1]}`;

  const sentence = `You usually cook ${dayPhrase} ${bucketLabel}.`;

  return { sentence, sampleSize: completed.length };
}
