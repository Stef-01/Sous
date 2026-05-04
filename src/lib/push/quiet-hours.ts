/**
 * Quiet-hours + per-user opt-out gating (Y4 W23).
 *
 * Pure helpers the W22 dispatcher consults BEFORE attempting a
 * push. Two layers:
 *   - Quiet-hours window (default 22:00-07:00 local) gates
 *     non-urgent intents.
 *   - Per-user, per-intent opt-out toggles fully suppress.
 *
 * The Y2 W22 notification queue + the Y4 W21 schedule planner
 * both feed into this gate. Output is a deterministic
 * "deliver?" decision + a rationale that surfaces in the W22
 * delivery-log entry.
 *
 * Pure / dependency-free.
 */

export interface QuietHoursWindow {
  /** Local hour [0..23] when quiet starts. */
  startHour: number;
  /** Local hour [0..23] when quiet ends. May wrap past
   *  midnight (e.g. start=22, end=7). */
  endHour: number;
}

export const DEFAULT_QUIET_HOURS: QuietHoursWindow = {
  startHour: 22,
  endHour: 7,
};

/** Pure: is the supplied local-time inside the quiet window? */
export function isInQuietHours(input: {
  localHour: number;
  window: QuietHoursWindow;
}): boolean {
  const { localHour, window } = input;
  if (window.startHour === window.endHour) return false;
  if (window.startHour < window.endHour) {
    return localHour >= window.startHour && localHour < window.endHour;
  }
  // Wraps midnight.
  return localHour >= window.startHour || localHour < window.endHour;
}

export interface UserPushPreferences {
  /** Master opt-out: nothing pushes. */
  optedOutAll: boolean;
  /** Per-intent opt-out map. */
  optedOutIntents: ReadonlySet<string>;
  /** Custom quiet-hours window override. */
  quietHours?: QuietHoursWindow;
  /** Marks an intent as urgent — bypasses quiet hours. */
  urgentIntents?: ReadonlySet<string>;
}

export interface DeliveryGateInput {
  intent: string;
  /** "Now" in local time (caller passes pre-localised value). */
  localHour: number;
  prefs: UserPushPreferences;
}

export type DeliveryGateOutcome =
  | { deliver: true }
  | {
      deliver: false;
      reason: "opted-out-all" | "opted-out-intent" | "quiet-hours";
    };

/** Pure: gate decision. The W22 dispatcher writes the reason
 *  string straight into the delivery-log outcome column. */
export function gateDelivery(input: DeliveryGateInput): DeliveryGateOutcome {
  if (input.prefs.optedOutAll) {
    return { deliver: false, reason: "opted-out-all" };
  }
  if (input.prefs.optedOutIntents.has(input.intent)) {
    return { deliver: false, reason: "opted-out-intent" };
  }
  const window = input.prefs.quietHours ?? DEFAULT_QUIET_HOURS;
  const isUrgent = input.prefs.urgentIntents?.has(input.intent) ?? false;
  if (!isUrgent && isInQuietHours({ localHour: input.localHour, window })) {
    return { deliver: false, reason: "quiet-hours" };
  }
  return { deliver: true };
}

export interface PushPreferenceTogglesInput {
  prefs: UserPushPreferences;
}

/** Pure: convert prefs to a UI-friendly toggle list (used by
 *  the future Profile sheet extension). */
export function buildPreferenceToggles(input: PushPreferenceTogglesInput): {
  intent: string;
  enabled: boolean;
}[] {
  const intents = [
    "rhythm-nudge",
    "pod-reveal",
    "viral-recipe-saved",
    "charity-progress",
    "cook-reminder",
  ];
  return intents.map((intent) => ({
    intent,
    enabled:
      !input.prefs.optedOutAll && !input.prefs.optedOutIntents.has(intent),
  }));
}
