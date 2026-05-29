/**
 * Weekly pick-on-Monday trigger (Y2 Sprint I W36).
 *
 * Cron-equivalent gate for the pod weekly-challenge pick. Fires
 * when the pod home is opened on a Monday in the pod's local
 * time AND no current-week PodChallengeWeek exists yet AND the
 * viewer is an admin. First admin view wins; subsequent admin
 * views see the picked recipe instead of triggering again.
 *
 * Override: any admin can re-run the picker pre-Monday cutoff
 * (default 9am pod-local). Past the cutoff the choice is locked
 * for the week.
 *
 * Pure / dependency-free / deterministic.
 */

/** Default cutoff hour (pod-local) past which the Monday pick
 *  is locked. 9am gives admins all morning to override. */
export const DEFAULT_LOCK_HOUR = 9;

export interface WeeklyPickInputs {
  /** Reference "now" — when the pod home was opened. Tests
   *  inject a fixed Date. */
  now: Date;
  /** When was the current-week pick made? Null when no pick
   *  exists yet. */
  lastPickedAt: Date | null;
  /** Is the viewer an admin? Only admins trigger picks; member
   *  views never fire the cron-equivalent. */
  isAdmin: boolean;
  /** Lock-cutoff hour pod-local. Defaults to DEFAULT_LOCK_HOUR.
   *  Override to widen / narrow the override window for tests. */
  lockHour?: number;
}

export type WeeklyPickGate =
  | { trigger: "fire"; reason: string }
  | { trigger: "skip"; reason: string };

/** Pure: should this view trigger a fresh weekly pick?
 *
 *  Returns `trigger: "fire"` when ALL hold:
 *    1. Today is Monday in the pod's local time (we treat the
 *       `now` Date's day-of-week as already-localised — caller
 *       constructs the Date from pod timezone).
 *    2. The viewer is an admin.
 *    3. Either:
 *       - No pick exists yet for this week, OR
 *       - A pick exists but we're still inside the
 *         override-lock window (Monday < lockHour) AND the
 *         existing pick is from BEFORE this Monday's start of day.
 *
 *  Returns `trigger: "skip"` everywhere else with a reason
 *  string for telemetry / debugging. */
export function evaluateWeeklyPickTrigger(
  inputs: WeeklyPickInputs,
): WeeklyPickGate {
  const lockHour = inputs.lockHour ?? DEFAULT_LOCK_HOUR;

  if (!inputs.isAdmin) {
    return { trigger: "skip", reason: "viewer is not an admin" };
  }

  const dow = inputs.now.getDay();
  if (dow !== 1) {
    return { trigger: "skip", reason: `today is dow=${dow}, not Monday` };
  }

  // Find this Monday's local start-of-day boundary.
  const startOfMonday = new Date(inputs.now);
  startOfMonday.setHours(0, 0, 0, 0);
  const lockBoundary = new Date(startOfMonday);
  lockBoundary.setHours(lockHour, 0, 0, 0);

  // Case A: no pick at all → fire.
  if (inputs.lastPickedAt === null) {
    return { trigger: "fire", reason: "no current-week pick exists" };
  }

  const lastTs = inputs.lastPickedAt.getTime();
  if (!Number.isFinite(lastTs)) {
    return { trigger: "fire", reason: "lastPickedAt is invalid → re-pick" };
  }

  // Case B: existing pick is from an earlier week (before this
  // Monday's start-of-day). Always re-pick — that's the cron
  // semantic the W36 plan defines.
  if (lastTs < startOfMonday.getTime()) {
    return {
      trigger: "fire",
      reason: "existing pick is from a previous week",
    };
  }

  // Case C: existing pick is THIS Monday but we're still in
  // the override window → fire (admin override).
  if (inputs.now.getTime() < lockBoundary.getTime()) {
    return {
      trigger: "fire",
      reason: "existing this-week pick within override window",
    };
  }

  // Case D: locked. The choice stands.
  return { trigger: "skip", reason: "past lock hour, choice is locked" };
}

/** Pure: race-condition guard for the "first viewer wins"
 *  semantic. Two admins opening pod home simultaneously both
 *  pass `evaluateWeeklyPickTrigger` → "fire". The dispatcher
 *  serialises via this token check: only the viewer whose
 *  token matches the current week's start-of-day timestamp
 *  proceeds to actually call the picker.
 *
 *  Caller flow:
 *    1. evaluateWeeklyPickTrigger() → "fire"
 *    2. weeklyPickToken(now) → string
 *    3. Atomically claim the token (via DB unique constraint
 *       on PodChallengeWeek.weekStart). First claim wins;
 *       second claim sees a constraint violation + re-reads
 *       the picked recipe.
 *
 *  This helper is the token generator — pure function of the
 *  Monday's start-of-day timestamp. */
export function weeklyPickToken(now: Date): string {
  const startOfMonday = new Date(now);
  startOfMonday.setHours(0, 0, 0, 0);
  // Walk back to Monday if the input isn't already Monday.
  // dow 0=Sun..6=Sat. Days to subtract to land on Monday:
  //   Mon=0, Tue=1, Wed=2, ..., Sun=6
  const dow = startOfMonday.getDay();
  const daysBack = dow === 0 ? 6 : dow - 1;
  startOfMonday.setDate(startOfMonday.getDate() - daysBack);
  return `pick-${startOfMonday.toISOString().slice(0, 10)}`;
}
