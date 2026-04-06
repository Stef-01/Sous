"use client";

import { useState, useEffect } from "react";

const STATS_KEY = "sous-cook-stats";

interface UnlockStatus {
  pathUnlocked: boolean;
  communityUnlocked: boolean;
  completedCooks: number;
}

/**
 * Read-only hook that checks localStorage for cook stats
 * and determines which tabs should be visible.
 * Path unlocks at 3 completed cooks.
 * Community is deferred (always false in prototype).
 */
export function useUnlockStatus(): UnlockStatus {
  const [status, setStatus] = useState<UnlockStatus>({
    pathUnlocked: false,
    communityUnlocked: false,
    completedCooks: 0,
  });

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage on mount + subscribe to storage events */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) {
        const stats = JSON.parse(raw);
        setStatus({
          pathUnlocked: (stats.completedCooks ?? 0) >= 3,
          communityUnlocked: false, // deferred
          completedCooks: stats.completedCooks ?? 0,
        });
      }
    } catch {
      // localStorage unavailable
    }

    // Listen for storage changes (from other tabs or cook completions)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STATS_KEY && e.newValue) {
        try {
          const stats = JSON.parse(e.newValue);
          setStatus({
            pathUnlocked: (stats.completedCooks ?? 0) >= 3,
            communityUnlocked: false,
            completedCooks: stats.completedCooks ?? 0,
          });
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return status;
}
