"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sous-invite-prompts-v1";

/**
 * Lightweight per-dish dismissal tracking for the post-cook invite sheet.
 * Once the user dismisses or acts on the prompt for a given dish, we never
 * show it again for that dish.
 */
export function useInvitePrompts() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setDismissed(new Set(arr));
      }
    } catch {
      // localStorage unavailable
    }
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const dismiss = useCallback((dishSlug: string) => {
    setDismissed((prev) => {
      if (prev.has(dishSlug)) return prev;
      const next = new Set(prev);
      next.add(dishSlug);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  const isDismissed = useCallback(
    (dishSlug: string) => dismissed.has(dishSlug),
    [dismissed],
  );

  return { isDismissed, dismiss, mounted };
}
