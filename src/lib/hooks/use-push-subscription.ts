"use client";

import { useEffect, useState } from "react";

/**
 * usePushSubscription — the client half of Web Push. DORMANT until the founder
 * provisions VAPID keys (mirrors `src/lib/notify/push-flag.ts`): with no
 * `NEXT_PUBLIC_VAPID_PUBLIC_KEY` the status is `dormant` and `subscribe()` is a
 * no-op, so the UI shows the honest in-app-nudge fallback. The moment the key is
 * set, status flips to `ready` and `subscribe()` requests permission, registers
 * `public/sw.js`, creates a real PushSubscription, and POSTs it to
 * `/api/push/subscribe`. No code change to light it up — just the env var.
 */

type Status = "unsupported" | "dormant" | "ready";
type SubscribeReason = Status | "denied" | "error";

/** VAPID public keys are base64url; the Push API wants a Uint8Array. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function usePushSubscription() {
  const [supported, setSupported] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- detect SW/Push platform support on the client after mount (avoids an SSR/hydration mismatch) */
  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window,
    );
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // NEXT_PUBLIC_ vars are inlined at build time, so this is accurate on the
  // client. The server-side private key (for dispatch) is gated separately.
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const hasKey = vapidPublicKey.length > 0;
  const status: Status = !supported
    ? "unsupported"
    : hasKey
      ? "ready"
      : "dormant";

  async function subscribe(): Promise<
    { ok: true } | { ok: false; reason: SubscribeReason }
  > {
    if (status !== "ready") return { ok: false, reason: status };
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return { ok: false, reason: "denied" };

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          // Cast around the TS lib's ArrayBufferLike/ArrayBuffer generic mismatch
          // — the runtime value is a valid BufferSource.
          applicationServerKey: urlBase64ToUint8Array(
            vapidPublicKey,
          ) as BufferSource,
        }));

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) return { ok: false, reason: "error" };
      return { ok: true };
    } catch {
      return { ok: false, reason: "error" };
    }
  }

  return { supported, status, subscribe };
}
