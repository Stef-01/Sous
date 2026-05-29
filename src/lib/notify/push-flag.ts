/**
 * Push notification platform flag (Y2 Sprint E W20).
 *
 * Mirrors the auth-flag pattern (Y2 W1). When the VAPID public
 * key + private key are absent (cold-start, dev, founder hasn't
 * generated keys yet), push notifications run in **stub mode**:
 * the W21 scheduler fires an in-app toast at the typical-cook
 * time instead of dispatching an OS push notification. The user
 * still feels the nudge — they just see it inside Sous when
 * they next open the app.
 *
 * Founder-unlock: setting `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY`
 * env vars flips this flag on. Real-mode subscription + dispatch
 * land in a single follow-on commit when keys are available.
 *
 * Pure / dependency-free.
 */

export interface PushNotifyEnv {
  /** VAPID public key — exposed to the client via NEXT_PUBLIC_
   *  prefix so the subscription can be signed. */
  NEXT_PUBLIC_VAPID_PUBLIC_KEY?: string | undefined;
  /** Server-side VAPID private key. Never read in client code. */
  VAPID_PRIVATE_KEY?: string | undefined;
  /** Optional master switch for the founder to disable push
   *  even when keys are present (privacy mode, EU rollout, etc). */
  SOUS_PUSH_NOTIFY_ENABLED?: string | undefined;
}

/** Pure: is push notification dispatch enabled in this env?
 *  Returns true only when ALL of:
 *    - public key present + non-empty
 *    - private key present + non-empty
 *    - master switch is not the literal string "false"
 *  False → stub mode (in-app toast). */
export function isPushNotifyEnabled(env: PushNotifyEnv): boolean {
  if (env.SOUS_PUSH_NOTIFY_ENABLED === "false") return false;
  if (!env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return false;
  if (env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.length === 0) return false;
  if (!env.VAPID_PRIVATE_KEY) return false;
  if (env.VAPID_PRIVATE_KEY.length === 0) return false;
  return true;
}

/** Pure: read flag state from process.env. Used by callers that
 *  don't want to import process.env directly. */
export function readPushNotifyEnv(): PushNotifyEnv {
  if (typeof process === "undefined" || process.env == null) return {};
  return {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    SOUS_PUSH_NOTIFY_ENABLED: process.env.SOUS_PUSH_NOTIFY_ENABLED,
  };
}
