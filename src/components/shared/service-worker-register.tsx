"use client";

import { useEffect } from "react";

/**
 * Registers the Sous service worker (public/sw.js) for offline resilience.
 *
 * Production-only by design: a service worker in dev would intercept requests
 * and fight HMR / the live preview iframe. Registration is deferred to the
 * `load` event so it never competes with first paint, and failures are
 * swallowed (the app works fine without the SW — it's pure enhancement).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-fatal: offline support simply won't be available this session.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
