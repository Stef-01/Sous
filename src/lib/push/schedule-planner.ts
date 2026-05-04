/**
 * Push-notification scheduling helper (Y4 W21).
 *
 * Pure planner: takes a notification "intent" (rhythm-nudge,
 * pod-reveal, viral-recipe-saved, charity-progress) and returns
 * a target dispatch time + retry policy. The Y2 W22 queue's
 * `scheduledFor` column gets fed from this planner once the
 * notification surface enters real mode.
 *
 * Behavioural overlay alignment: rhythm-nudge times follow the
 * Y2 W19 user rhythm window so we never push outside the
 * user's cooking-active hours.
 *
 * Pure / dependency-free.
 */

export type NotificationIntent =
  | "rhythm-nudge"
  | "pod-reveal"
  | "viral-recipe-saved"
  | "charity-progress"
  | "cook-reminder";

export interface ScheduleInput {
  intent: NotificationIntent;
  /** Caller's "now" reference. */
  now: Date;
  /** User's cooking-active hour range from the Y2 W19 hook
   *  ([startHour, endHour) in 24h local time). */
  rhythmWindow: { startHour: number; endHour: number };
  /** Optional explicit dispatch target — bypasses the planner
   *  for ad-hoc scheduling. */
  preferredAt?: Date;
}

export interface SchedulePlan {
  /** When to dispatch (ISO). */
  scheduledFor: string;
  /** Maximum attempts before giving up. */
  maxAttempts: number;
  /** Backoff base in ms. */
  retryBackoffMs: number;
  /** Why this time was picked. */
  rationale: string;
}

const HOUR_MS = 60 * 60 * 1000;

/** Pure: clamp a Date into the rhythm window of the same day,
 *  bumping to the next day's start if needed. */
function clampIntoRhythmWindow(
  target: Date,
  window: { startHour: number; endHour: number },
): Date {
  const out = new Date(target.getTime());
  const hr = out.getHours();
  if (hr < window.startHour) {
    out.setHours(window.startHour, 0, 0, 0);
    return out;
  }
  if (hr >= window.endHour) {
    // Next day at start.
    out.setDate(out.getDate() + 1);
    out.setHours(window.startHour, 0, 0, 0);
    return out;
  }
  return out;
}

/** Pure: classify the dispatch time + retry policy by intent. */
export function planNotificationSchedule(input: ScheduleInput): SchedulePlan {
  if (input.preferredAt) {
    return {
      scheduledFor: input.preferredAt.toISOString(),
      maxAttempts: 3,
      retryBackoffMs: 5_000,
      rationale: "Caller specified preferredAt — using as-is.",
    };
  }
  switch (input.intent) {
    case "rhythm-nudge": {
      // Schedule for the user's rhythm window today (or tomorrow
      // if we're past it).
      const target = clampIntoRhythmWindow(input.now, input.rhythmWindow);
      return {
        scheduledFor: target.toISOString(),
        maxAttempts: 2,
        retryBackoffMs: 60_000,
        rationale: "Aligned to user rhythm window.",
      };
    }
    case "pod-reveal": {
      // Pod reveal fires Sundays at the cohort's "reveal hour"
      // — defaulted to 18:00 local. The pod schema has the
      // exact hour; this planner just uses the rhythm window
      // end as a proxy when called without it.
      const target = new Date(input.now.getTime() + HOUR_MS);
      return {
        scheduledFor: target.toISOString(),
        maxAttempts: 3,
        retryBackoffMs: 30_000,
        rationale: "Pod reveal — 1h delay for round-up to settle.",
      };
    }
    case "viral-recipe-saved": {
      // Immediate-ish (5 min delay so quick saves don't double-
      // fire). Never push outside rhythm.
      const target = clampIntoRhythmWindow(
        new Date(input.now.getTime() + 5 * 60 * 1000),
        input.rhythmWindow,
      );
      return {
        scheduledFor: target.toISOString(),
        maxAttempts: 2,
        retryBackoffMs: 30_000,
        rationale: "Viral save — 5m debounce, rhythm-bound.",
      };
    }
    case "charity-progress": {
      // Charity progress = once per event milestone — schedule
      // for next rhythm window start.
      const next = new Date(input.now.getTime());
      next.setDate(next.getDate() + 1);
      next.setHours(input.rhythmWindow.startHour, 0, 0, 0);
      return {
        scheduledFor: next.toISOString(),
        maxAttempts: 2,
        retryBackoffMs: 60_000,
        rationale: "Charity progress — next-day rhythm-start.",
      };
    }
    case "cook-reminder": {
      // Rhythm-aligned 10 minutes from now (or next window).
      const target = clampIntoRhythmWindow(
        new Date(input.now.getTime() + 10 * 60 * 1000),
        input.rhythmWindow,
      );
      return {
        scheduledFor: target.toISOString(),
        maxAttempts: 2,
        retryBackoffMs: 30_000,
        rationale: "Cook reminder — 10m lead, rhythm-bound.",
      };
    }
  }
}
