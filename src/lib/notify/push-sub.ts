/**
 * Push subscription state + nudge text formatter (Y2 W20).
 *
 * Pure helpers for the push-notification platform — separated
 * from the actual browser-API subscribe / unsubscribe so they
 * can be tested without mocking Service Workers + Push APIs.
 *
 * Two pieces here:
 *   1. PushSubState — the persistence shape for the user's
 *      current subscription status (parsed/written via
 *      localStorage so a fresh tab knows whether to re-subscribe).
 *   2. formatNudgeText — the implementation-intention-shaped
 *      copy generator the W21 scheduler will use for both real
 *      OS pushes + stub-mode in-app toasts.
 *
 * Real-mode subscribe / dispatch lands in a follow-on commit
 * when VAPID keys are configured.
 */

const SUB_STORAGE_KEY = "sous-push-sub-v1";
const SUB_SCHEMA_VERSION = 1 as const;

export type PushSubStatus =
  /** Haven't checked browser support / permission yet. */
  | "unknown"
  /** Browser doesn't support Web Push (Safari pre-16.4, etc). */
  | "unsupported"
  /** Supported, user hasn't been asked yet. */
  | "idle"
  /** Subscription request in flight. */
  | "requesting"
  /** Active subscription on file. */
  | "subscribed"
  /** User declined permission. */
  | "denied"
  /** Subscription request failed (network / server). */
  | "error";

export interface PushSubState {
  schemaVersion: typeof SUB_SCHEMA_VERSION;
  status: PushSubStatus;
  /** Endpoint URL of the active subscription. Null when not
   *  subscribed. Stored so we can de-dupe subscription requests
   *  + signal the server which sub to revoke. */
  endpoint: string | null;
  /** Last status change ISO timestamp — for debug / UX
   *  ("Subscribed yesterday"). */
  lastChangedAt: string;
}

/** Pure: a fresh-default state, used on cold start + every time
 *  the persistence parser bails. */
export function freshDefaultPushSubState(): PushSubState {
  return {
    schemaVersion: SUB_SCHEMA_VERSION,
    status: "unknown",
    endpoint: null,
    lastChangedAt: new Date(0).toISOString(),
  };
}

const VALID_STATUSES: ReadonlyArray<PushSubStatus> = [
  "unknown",
  "unsupported",
  "idle",
  "requesting",
  "subscribed",
  "denied",
  "error",
];

/** Pure parser. Defends against missing key, corrupt JSON,
 *  schema mismatch, unknown status enum values. Same shape as
 *  the W15-RCA-pattern persistence parsers across the codebase. */
export function parseStoredPushSubState(
  raw: string | null | undefined,
): PushSubState {
  if (!raw) return freshDefaultPushSubState();
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return freshDefaultPushSubState();
    }
    const obj = parsed as Partial<PushSubState>;
    if (obj.schemaVersion !== SUB_SCHEMA_VERSION) {
      return freshDefaultPushSubState();
    }
    if (
      typeof obj.status !== "string" ||
      !VALID_STATUSES.includes(obj.status as PushSubStatus)
    ) {
      return freshDefaultPushSubState();
    }
    const endpoint =
      obj.status === "subscribed" && typeof obj.endpoint === "string"
        ? obj.endpoint
        : null;
    return {
      schemaVersion: SUB_SCHEMA_VERSION,
      status: obj.status as PushSubStatus,
      endpoint,
      lastChangedAt:
        typeof obj.lastChangedAt === "string"
          ? obj.lastChangedAt
          : new Date(0).toISOString(),
    };
  } catch {
    return freshDefaultPushSubState();
  }
}

export const SUB_KEY_FOR_TEST = SUB_STORAGE_KEY;

// ── Nudge text formatter ──────────────────────────────────

export interface FormatNudgeOptions {
  /** Day-of-week label for the nudge ("Tuesday"). */
  dayLabel: string;
  /** "5:30pm" — formatted nudge time. */
  timeLabel: string;
  /** When true, the user missed last week's typical day; W21
   *  streak-forgiveness overlay kicks in instead of the usual
   *  intention prompt. */
  missedLastWeek?: boolean;
}

/** Pure: implementation-intention-shaped nudge text per the W21
 *  plan. Anchored on the rhythm + time so the prompt feels
 *  earned, never generic. The "missed last week" variant uses
 *  streak-forgiveness language ("just data — what sounds good?")
 *  rather than "you broke your streak".
 *
 *  Behavioural overlays this anchors:
 *    - implementation intentions ("when X, you'll do Y")
 *    - streak forgiveness (no guilt language) */
export function formatNudgeText(opts: FormatNudgeOptions): string {
  const { dayLabel, timeLabel, missedLastWeek } = opts;
  if (missedLastWeek) {
    return `Skipping last ${dayLabel} is just data. What sounds good tonight?`;
  }
  return `${dayLabel} ${timeLabel} — when you're heading home, what'll you cook?`;
}

/** Pure: identity-language formatter for the rhythm widget on
 *  /path. "You're a Tuesday-night cook (12 weeks running)."
 *  Hides the badge entirely below 4 weeks (not enough signal). */
export function formatRhythmIdentity(opts: {
  dayLabel: string;
  weeksRunning: number;
  hourLabel?: string;
}): string | null {
  const { dayLabel, weeksRunning, hourLabel } = opts;
  if (weeksRunning < 4) return null;
  const evening = hourLabel
    ? `${dayLabel}-${hourLabel} `
    : `${dayLabel}-night `;
  return `You're a ${evening}cook (${weeksRunning} weeks running).`;
}
