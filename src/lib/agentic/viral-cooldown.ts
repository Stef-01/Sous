/**
 * Viral-suggestion cool-down state machine (Y2 Sprint J W41).
 *
 * Per-user gating layer for the W42 viral chip on /today. Rules:
 *   - At most 1 viral suggestion per 7 days at baseline.
 *   - If the user dismisses a suggestion, increment a per-user
 *     dismissalCount.
 *   - dismissalCount >= 2 → cool-down stretches to bi-weekly
 *     (14 days) so we stop bothering this user.
 *   - dismissalCount >= 4 → off entirely (suppressed
 *     indefinitely — caller can offer a setting to reset).
 *   - Accepting a suggestion (cooking it) RESETS the dismissal
 *     counter back to 0.
 *
 * Pure state machine; persistence is the caller's concern. The
 * helper takes the current state + an event + returns the next
 * state. A separate evaluator decides whether the chip should
 * fire RIGHT NOW given the state + a reference timestamp.
 *
 * Pure / dependency-free / deterministic.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export const COOLDOWN_BASELINE_DAYS = 7;
export const COOLDOWN_BACKOFF_DAYS = 14;
export const DISMISSALS_BEFORE_BACKOFF = 2;
export const DISMISSALS_BEFORE_SUPPRESSION = 4;

export interface ViralCooldownState {
  /** ISO timestamp of the last time the chip was shown. Null
   *  for cold-start users. */
  lastShownAt: string | null;
  /** Per-user count of dismissals since the last accept. */
  dismissalCount: number;
}

export type CooldownEvent =
  | { kind: "shown"; at: Date }
  | { kind: "accepted" }
  | { kind: "dismissed" };

/** Pure: produce a fresh-default state for a new user. */
export function freshCooldownState(): ViralCooldownState {
  return { lastShownAt: null, dismissalCount: 0 };
}

/** Pure: advance the state on an event. Caller persists the
 *  returned object. */
export function advanceCooldown(
  state: ViralCooldownState,
  event: CooldownEvent,
): ViralCooldownState {
  switch (event.kind) {
    case "shown":
      return {
        ...state,
        lastShownAt: event.at.toISOString(),
      };
    case "accepted":
      return { ...state, dismissalCount: 0 };
    case "dismissed":
      return { ...state, dismissalCount: state.dismissalCount + 1 };
    default:
      return state;
  }
}

export type CooldownGateOutcome =
  | { fire: true; reason: string }
  | { fire: false; reason: string };

/** Pure: should the W42 chip fire right now? Returns false
 *  when:
 *    - dismissalCount >= DISMISSALS_BEFORE_SUPPRESSION (off
 *      entirely until a manual reset).
 *    - lastShownAt within current effective cool-down window.
 *
 *  Returns true otherwise (cold-start or window elapsed). */
export function evaluateCooldown(
  state: ViralCooldownState,
  now: Date,
): CooldownGateOutcome {
  if (state.dismissalCount >= DISMISSALS_BEFORE_SUPPRESSION) {
    return {
      fire: false,
      reason: `suppressed after ${state.dismissalCount} dismissals`,
    };
  }

  if (state.lastShownAt === null) {
    return { fire: true, reason: "no prior suggestion" };
  }

  const lastTs = new Date(state.lastShownAt).getTime();
  if (!Number.isFinite(lastTs)) {
    return { fire: true, reason: "lastShownAt invalid → reset" };
  }

  const ageMs = now.getTime() - lastTs;
  if (ageMs < 0) {
    // Clock skew defensive — treat as "shown today, hold off".
    return { fire: false, reason: "clock skew defensive hold" };
  }

  const windowDays =
    state.dismissalCount >= DISMISSALS_BEFORE_BACKOFF
      ? COOLDOWN_BACKOFF_DAYS
      : COOLDOWN_BASELINE_DAYS;
  const windowMs = windowDays * DAY_MS;

  if (ageMs < windowMs) {
    return {
      fire: false,
      reason: `inside ${windowDays}-day cool-down (${Math.floor(ageMs / DAY_MS)}d ago)`,
    };
  }

  return {
    fire: true,
    reason: `cool-down elapsed (${Math.floor(ageMs / DAY_MS)}d >= ${windowDays}d)`,
  };
}
