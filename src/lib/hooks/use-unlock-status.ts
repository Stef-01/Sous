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

  useEffect(() => {
    const applyStats = (stats: { completedCooks?: number }) => {
      setStatus({
        pathUnlocked: (stats.completedCooks ?? 0) >= 3,
        communityUnlocked: false, // deferred
        completedCooks: stats.completedCooks ?? 0,
      });
    };

    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) applyStats(JSON.parse(raw));
    } catch {
      // localStorage unavailable
    }

    // Cross-tab changes (StorageEvent)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STATS_KEY && e.newValue) {
        try {
          applyStats(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    // Same-tab changes (custom event dispatched by persistStats)
    const handleCustom = (e: Event) => {
      applyStats((e as CustomEvent<{ completedCooks?: number }>).detail);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("sous:stats-updated", handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("sous:stats-updated", handleCustom);
    };
  }, []);

  return status;
}
