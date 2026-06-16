"use client";

/**
 * Cross-surface bridge for pulse anchors (§6.2 W4 follow-up). Some app-moment
 * anchors fire on a different route than the one that hosts the PulseHost — the
 * "win-close" moment happens in the guided-cook Win screen, but the pulse is
 * surfaced when the user lands back on Today. A surface stashes the pending
 * anchor here on its way out; the hub reads-and-clears it on arrival.
 *
 * sessionStorage so it survives the route change but never leaks across app
 * restarts. One-shot: `takePendingAnchor` clears as it reads.
 */

import type { PulseAnchor } from "@/data/pulses";

const KEY = "sous-pending-pulse-anchor";

export function setPendingAnchor(anchor: PulseAnchor): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, anchor);
  } catch {
    // sessionStorage unavailable — the pulse just won't surface, no harm.
  }
}

/** Read and clear the pending anchor (one-shot). */
export function takePendingAnchor(): PulseAnchor | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.sessionStorage.getItem(KEY);
    if (v) window.sessionStorage.removeItem(KEY);
    return (v as PulseAnchor) || null;
  } catch {
    return null;
  }
}
