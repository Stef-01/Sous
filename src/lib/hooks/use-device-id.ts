"use client";

import { useSyncExternalStore } from "react";

/**
 * Device-scoped anonymous identity (MVP).
 *
 * Per-user data (progress, saved items, custom recipes) needs an owner,
 * but login is deferred to a later stage (`docs/MVP-FEATURE-PLAN.md`
 * Stage I). This gives each browser a stable UUID, stored in
 * localStorage and sent to the server as the `x-sous-device-id` header,
 * used as `user_id`. When real auth lands, this anonymous user upgrades
 * in place — no data loss.
 *
 * `getDeviceId()` is a plain function (usable outside React, e.g. in the
 * tRPC header callback); `useDeviceId()` is the hook for components.
 */
const DEVICE_ID_KEY = "sous-device-id";

function makeId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Read (or lazily create) the stable device id. SSR-safe: returns "" on
 *  the server, where there is no per-device identity. */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = makeId();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

const subscribe = () => () => {};

/** SSR-safe: "" on the server, the stable device id on the client.
 *  `useSyncExternalStore` reconciles the two without a hydration
 *  mismatch and without a setState-in-effect. */
export function useDeviceId(): string {
  return useSyncExternalStore(subscribe, getDeviceId, () => "");
}
