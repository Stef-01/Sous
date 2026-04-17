"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * useBigHands — session-scoped "make everything bigger" mode.
 *
 * Session-scoped by design. Lives in sessionStorage so it auto-expires when
 * the tab closes; the user re-opts-in each cook if they want it. This avoids
 * turning a cooking ergonomics toggle into a permanent preference page.
 *
 * The hook also tracks edge taps on step-advance controls. After 3 edge
 * taps inside one session it flips a nudge flag; callers can surface an
 * inline chip like "Tap here feels tight — try bigger controls?" and flip
 * `enabled` when the user accepts.
 */

const STORAGE_KEY = "sous-big-hands-v1";
const EDGE_TAP_KEY = "sous-big-hands-edge-taps-v1";
const NUDGE_THRESHOLD = 3;

function readFlag(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeFlag(key: string, value: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value === null) {
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    // sessionStorage quota / privacy mode — fail silently.
  }
}

export interface UseBigHandsResult {
  /** True while the user has opted into the larger cook UI this session. */
  enabled: boolean;
  /** True after the user has tapped near the edge of cook-nav controls 3+ times. */
  shouldNudge: boolean;
  /** Whether the hook has hydrated from sessionStorage. */
  mounted: boolean;
  setEnabled: (next: boolean) => void;
  toggle: () => void;
  registerEdgeTap: () => void;
  dismissNudge: () => void;
}

export function useBigHands(): UseBigHandsResult {
  const [enabled, setEnabledState] = useState(false);
  const [edgeTaps, setEdgeTaps] = useState(0);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabledState(readFlag(STORAGE_KEY) === "1");
    const taps = parseInt(readFlag(EDGE_TAP_KEY) ?? "0", 10);
    setEdgeTaps(Number.isFinite(taps) ? taps : 0);
    setMounted(true);
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    writeFlag(STORAGE_KEY, next ? "1" : null);
  }, []);

  const toggle = useCallback(() => {
    setEnabledState((prev) => {
      const next = !prev;
      writeFlag(STORAGE_KEY, next ? "1" : null);
      return next;
    });
  }, []);

  const registerEdgeTap = useCallback(() => {
    setEdgeTaps((prev) => {
      const next = prev + 1;
      writeFlag(EDGE_TAP_KEY, String(next));
      return next;
    });
  }, []);

  const dismissNudge = useCallback(() => {
    setNudgeDismissed(true);
  }, []);

  const shouldNudge =
    mounted && !enabled && !nudgeDismissed && edgeTaps >= NUDGE_THRESHOLD;

  return {
    enabled,
    shouldNudge,
    mounted,
    setEnabled,
    toggle,
    registerEdgeTap,
    dismissNudge,
  };
}
