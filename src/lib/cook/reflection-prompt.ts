/**
 * Reflection journaling overlay (Y2 Sprint G W29).
 *
 * The 6th NOOM-inspired behavioural overlay — at end of week, the
 * win-screen surfaces a 2-question voice prompt:
 *   - "What was your favourite cook this week?"
 *   - "What made it work?"
 *
 * Voice transcript captures the answer, stores under the cook
 * session record's existing `note` field with a NOTE_PREFIX so
 * the trigger helper can de-dup ("already reflected this week").
 *
 * Pure / dependency-free / deterministic.
 *
 * Reuses W19 RhythmPattern for "last day of the user's cook week"
 * detection; reuses CookSessionRecord.note for persistence.
 */

import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import type { RhythmPattern } from "@/lib/engine/rhythm-pattern";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Marker prefix on session notes that the reflection overlay
 *  authored. Used by the trigger helper to detect "already
 *  reflected this week" without colliding with the user's own
 *  free-text notes. */
export const REFLECTION_NOTE_PREFIX = "[reflection]";

/** The two questions the overlay asks. Plain strings so the
 *  voice TTS layer can speak them verbatim and the win-screen
 *  can render them as visible captions. */
export const REFLECTION_QUESTIONS: ReadonlyArray<string> = [
  "What was your favourite cook this week?",
  "What made it work?",
];

export interface ReflectionAnswers {
  /** Answer to question 1 — the favourite-cook recap. */
  favourite: string;
  /** Answer to question 2 — the what-made-it-work recap. */
  whatWorked: string;
}

/** Pure: format a reflection answer pair into a single string
 *  suitable for the cook-session.note field. The marker prefix
 *  lets the trigger helper de-dup "already reflected this week"
 *  without colliding with user-authored free-text notes. */
export function formatReflectionNote(answers: ReflectionAnswers): string {
  const fav = answers.favourite.trim();
  const why = answers.whatWorked.trim();
  if (fav.length === 0 && why.length === 0) return "";
  return `${REFLECTION_NOTE_PREFIX} fav: ${fav}\nworked: ${why}`.trim();
}

/** Pure: did the user already reflect this calendar week?
 *  Scans the last 7 days of session history for any note that
 *  starts with the REFLECTION_NOTE_PREFIX. */
export function alreadyReflectedThisWeek(
  sessions: ReadonlyArray<CookSessionRecord>,
  now: Date,
): boolean {
  const cutoff = now.getTime() - 7 * DAY_MS;
  for (const s of sessions) {
    if (typeof s.note !== "string") continue;
    if (!s.note.startsWith(REFLECTION_NOTE_PREFIX)) continue;
    const ts = s.completedAt
      ? new Date(s.completedAt).getTime()
      : new Date(s.startedAt ?? "").getTime();
    if (!Number.isFinite(ts)) continue;
    if (ts >= cutoff && ts <= now.getTime()) return true;
  }
  return false;
}

/** Pure: detect "user just finished their last typical cook day
 *  of the week". Returns true when:
 *   - rhythm.confidence is high enough to claim a pattern (>=0.5)
 *   - rhythm.typicalDays is non-empty
 *   - today's day-of-week is the LAST (highest dow value) in
 *     rhythm.typicalDays — i.e. the user's last expected cook
 *     of the week.
 *
 *  The 0.5 floor here is intentionally lower than W19's
 *  MIN_NOTIFY_CONFIDENCE (0.6). Reflection journaling is opt-in
 *  + transient (the user can skip), so a lower bar is fine —
 *  the cost of a false positive is one ignored prompt. */
export function isLastCookDayOfWeek(rhythm: RhythmPattern, now: Date): boolean {
  if (rhythm.confidence < 0.5) return false;
  if (rhythm.typicalDays.length === 0) return false;
  const lastTypicalDow = Math.max(...rhythm.typicalDays);
  return now.getDay() === lastTypicalDow;
}

export interface ShouldShowReflectionOptions {
  /** The user's inferred rhythm (from W19). When null / cold-
   *  start, the prompt is suppressed. */
  rhythm: RhythmPattern;
  /** Cook session history including today's just-completed cook. */
  sessions: ReadonlyArray<CookSessionRecord>;
  /** Reference "now" — the moment the win-screen renders. Tests
   *  inject a fixed Date. */
  now: Date;
}

/** Pure: should the win-screen show the reflection prompt right
 *  now? Returns true when ALL three conditions hold:
 *    1. rhythm pattern has enough confidence + at least one
 *       typical day,
 *    2. today is the user's last typical cook day of the week,
 *    3. no reflection has been recorded in the last 7 days.
 *
 *  False everywhere else. The win-screen renders the standard
 *  congrats path when this returns false. */
export function shouldShowReflectionPrompt(
  opts: ShouldShowReflectionOptions,
): boolean {
  const { rhythm, sessions, now } = opts;
  if (!isLastCookDayOfWeek(rhythm, now)) return false;
  if (alreadyReflectedThisWeek(sessions, now)) return false;
  return true;
}
