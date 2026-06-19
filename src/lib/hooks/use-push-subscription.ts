"use client";

import { useEffect, useState } from "react";

/**
 * usePushSubscription — the client half of Web Push, deliberately DORMANT until
 * the founder provisions VAPID keys (mirrors the dormant-until-gate pattern of
 * `src/lib/notify/push-flag.ts`). When `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set it
 * flips to `ready` and `subscribe()` registers the existing `public/sw.js` and
 * creates a PushSubscription; until then `subscribe()` is a no-op that reports
 * `dormant` so the UI shows the honest in-app-nudge fallback. One config edit
 * (+ the server dispatch half) lights it up — no code change here.
 */

type Status = "unsupported" | "dormant" | "ready";

export function usePushSubscription() {
  const [supported, setSupported] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- detect SW/Push platform support on the client after mount (avoids an SSR/hydration mismatch) */
  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window,
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
    { ok: true } | { ok: false; reason: Status }
  > {
    if (status !== "ready") return { ok: false, reason: status };
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });
      // The server-side subscription store + dispatch land with the VAPID
      // founder-gate commit; client registration is the only piece that's safe
      // to run now.
      return { ok: true };
    } catch {
      return { ok: false, reason: "dormant" };
    }
  }

  return { supported, status, subscribe };
}
