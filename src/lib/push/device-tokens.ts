/**
 * Push device-token ledger (Y4 W17).
 *
 * Pure helpers for managing the per-device push token a user
 * accumulates as they install Sous across surfaces (web, iOS,
 * Android). The W22 delivery dispatcher iterates this list to
 * fan out a notification to all of a user's devices.
 *
 * Stale-token pruning + last-seen freshness gates so we don't
 * keep dispatching to dead devices.
 *
 * Pure / dependency-free.
 */

import type { PushChannel } from "./key-registry";

export interface DeviceToken {
  /** Stable id for the (user, device) pair. */
  id: string;
  /** Which transport this token is for. */
  channel: PushChannel;
  /** The opaque token string the channel uses. APNs device
   *  token, FCM registration token, or VAPID endpoint URL. */
  token: string;
  /** ISO timestamp the token was first registered. */
  registeredAt: string;
  /** ISO timestamp last seen alive (e.g. last successful
   *  delivery, last app foreground heartbeat). */
  lastSeenAt: string;
  /** Optional human label ("iPhone 15 / Safari 17" etc.). */
  label?: string;
}

export const DEVICE_TOKEN_STALE_DAYS = 60;

/** Pure: classify a token as stale based on last-seen +
 *  threshold. */
export function isDeviceTokenStale(
  token: Pick<DeviceToken, "lastSeenAt">,
  now: Date,
  thresholdDays: number = DEVICE_TOKEN_STALE_DAYS,
): boolean {
  const lastSeen = new Date(token.lastSeenAt).getTime();
  if (!Number.isFinite(lastSeen)) return true;
  const elapsedDays = (now.getTime() - lastSeen) / (24 * 60 * 60 * 1000);
  return elapsedDays >= thresholdDays;
}

/** Pure: filter a token list to only the live entries. */
export function activeDeviceTokens(
  tokens: ReadonlyArray<DeviceToken>,
  now: Date,
  thresholdDays: number = DEVICE_TOKEN_STALE_DAYS,
): ReadonlyArray<DeviceToken> {
  return tokens.filter((t) => !isDeviceTokenStale(t, now, thresholdDays));
}

/** Pure: dedupe by token string. The same device can re-
 *  register if the OS rotates it; the storage layer keeps the
 *  newest registeredAt. */
export function dedupeDeviceTokens(
  tokens: ReadonlyArray<DeviceToken>,
): ReadonlyArray<DeviceToken> {
  const seen = new Map<string, DeviceToken>();
  for (const t of tokens) {
    const existing = seen.get(t.token);
    if (!existing) {
      seen.set(t.token, t);
      continue;
    }
    // Prefer the entry with the newer registeredAt.
    if (t.registeredAt > existing.registeredAt) {
      seen.set(t.token, t);
    }
  }
  return Array.from(seen.values());
}

/** Pure: register or upsert a token. Returns a new list. */
export function upsertDeviceToken(
  tokens: ReadonlyArray<DeviceToken>,
  next: DeviceToken,
): ReadonlyArray<DeviceToken> {
  const filtered = tokens.filter((t) => t.id !== next.id);
  return [...filtered, next];
}

/** Pure: bump last-seen on an existing token. */
export function touchDeviceToken(
  tokens: ReadonlyArray<DeviceToken>,
  id: string,
  now: Date,
): ReadonlyArray<DeviceToken> {
  return tokens.map((t) =>
    t.id === id ? { ...t, lastSeenAt: now.toISOString() } : t,
  );
}

/** Pure: remove a stale or unregistered token. */
export function removeDeviceToken(
  tokens: ReadonlyArray<DeviceToken>,
  id: string,
): ReadonlyArray<DeviceToken> {
  return tokens.filter((t) => t.id !== id);
}
