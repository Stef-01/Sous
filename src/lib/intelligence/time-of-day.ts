/**
 * Time-of-day classifier (Y5 C foundation).
 *
 * Maps a Date → one of five buckets (morning / lunch / afternoon /
 * dinner / late-night). Used by the signal aggregator to bucket
 * each signal at capture time, and by the recommendation layer
 * to bias suggestions toward the user's time-of-day patterns.
 *
 * Buckets (local time):
 *   05:00 – 11:00  →  morning
 *   11:00 – 14:00  →  lunch
 *   14:00 – 17:00  →  afternoon
 *   17:00 – 21:00  →  dinner
 *   21:00 – 05:00  →  late-night  (wraps midnight)
 *
 * Pure / dependency-free / deterministic.
 */

import type { TimeOfDay } from "@/types/preference-profile";

export interface TimeOfDayBucketInput {
  /** Hour-of-day in 24h local time (0-23). */
  hour: number;
}

/** Pure: classify an hour-of-day into a TimeOfDay bucket. */
export function classifyHour(input: TimeOfDayBucketInput): TimeOfDay {
  const { hour } = input;
  if (!Number.isFinite(hour)) return "morning"; // defensive default
  // Normalise into 0-23 in case the caller passes a non-integer.
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 14) return "lunch";
  if (h >= 14 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "dinner";
  return "late-night"; // 21:00–04:59 inclusive (wraps midnight)
}

/** Pure: classify a Date directly. Uses the date's local-time
 *  hour. Defensive — returns "morning" when given an invalid
 *  Date so downstream code never crashes on malformed input. */
export function classifyDate(date: Date): TimeOfDay {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    return "morning";
  }
  return classifyHour({ hour: date.getHours() });
}

/** Pure: human-readable label for a bucket — used in UI copy. */
export function timeOfDayLabel(bucket: TimeOfDay): string {
  switch (bucket) {
    case "morning":
      return "Morning";
    case "lunch":
      return "Lunch";
    case "afternoon":
      return "Afternoon";
    case "dinner":
      return "Dinner";
    case "late-night":
      return "Late night";
  }
}

/** Pure: ordered list of buckets (morning → late-night). Used by
 *  the profile editor to render rows in chronological order. */
export const TIME_OF_DAY_ORDER: ReadonlyArray<TimeOfDay> = [
  "morning",
  "lunch",
  "afternoon",
  "dinner",
  "late-night",
];
