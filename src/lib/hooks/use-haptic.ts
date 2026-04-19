"use client";

import { useCallback } from "react";

/**
 * useHaptic  -  triggers a short vibration on devices that support the
 * Vibration API (most Android browsers). Falls back silently on iOS and
 * desktop where the API is absent or blocked.
 *
 * @param duration - vibration duration in ms (default 10)
 */
export function useHaptic(duration = 10) {
  return useCallback(() => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(duration);
      }
    } catch {
      // Vibration API blocked or unavailable  -  silent fallback
    }
  }, [duration]);
}
