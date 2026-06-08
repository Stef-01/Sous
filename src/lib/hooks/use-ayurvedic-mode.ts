"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * useAyurvedicMode — an opt-in "Ayurvedic lens". OFF by default. When on, the
 * Info sheet surfaces evidence-validated notes for the Ayurvedic culinary herbs
 * in a dish (ginger, turmeric, fenugreek, …). localStorage-backed, same
 * hydration guard as the other preference toggles.
 */
const KEY = "sous-ayurvedic-mode-v1";

function read(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function useAyurvedicMode() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage on mount */
  useEffect(() => {
    setEnabled(read());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(KEY, next ? "1" : "0");
      } catch {
        // ignore quota / privacy mode
      }
      return next;
    });
  }, []);

  return { enabled, mounted, toggle };
}
