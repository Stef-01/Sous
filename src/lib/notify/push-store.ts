/**
 * Push subscription store — where Web Push subscriptions live between
 * `/api/push/subscribe` (save) and the dispatcher (`/api/push/test` + the future
 * cron). Today this is an in-memory singleton (survives a dev session, fine for
 * the trusted-cohort phase); persistence is a single implementation swap to the
 * diary-sync write-through pattern (Supabase/Postgres) — the abstraction below
 * is the seam, so the routes never change (rule 12).
 *
 * The parse helper is pure + unit-tested; the storage wrappers are thin.
 */

export interface StoredPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** Pure, defensive parse of a browser PushSubscription JSON — never throws,
 *  returns null on anything malformed (so a bad POST body can't crash the route
 *  or poison the store). */
export function parseSubscription(raw: unknown): StoredPushSubscription | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const endpoint = o.endpoint;
  const keys = o.keys as Record<string, unknown> | undefined;
  if (typeof endpoint !== "string" || endpoint.length === 0) return null;
  if (!keys || typeof keys !== "object") return null;
  if (typeof keys.p256dh !== "string" || typeof keys.auth !== "string")
    return null;
  return { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
}

// Singleton on globalThis so it survives dev module re-evaluation (Turbopack).
const g = globalThis as unknown as {
  __sousPushStore?: Map<string, StoredPushSubscription>;
};
const store: Map<string, StoredPushSubscription> =
  g.__sousPushStore ?? (g.__sousPushStore = new Map());

export function saveSubscription(sub: StoredPushSubscription): void {
  store.set(sub.endpoint, sub);
}

export function removeSubscription(endpoint: string): void {
  store.delete(endpoint);
}

export function allSubscriptions(): StoredPushSubscription[] {
  return [...store.values()];
}

export function subscriptionCount(): number {
  return store.size;
}
