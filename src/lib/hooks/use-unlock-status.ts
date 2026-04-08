"use client";

import { useState, useEffect } from "react";

const STATS_KEY = "sous-cook-stats";

interface UnlockStatus {
  pathUnlocked: boolean;
  communityUnlocked: boolean;
  completedCooks: number;
  /** True once localStorage has been read — guards against premature redirects */
  isLoaded: boolean;
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
    isLoaded: false,
  });

  useEffect(() => {
    const applyStats = (stats: { completedCooks?: number }) => {
      setStatus({
        pathUnlocked: (stats.completedCooks ?? 0) >= 3,
        communityUnlocked: false, // deferred
        completedCooks: stats.completedCooks ?? 0,
        isLoaded: true,
      });
    };

    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) {
        applyStats(JSON.parse(raw));
      } else {
        // No stats yet — mark as loaded so callers know the answer is "not unlocked"
        setStatus((prev) => ({ ...prev, isLoaded: true }));
      }
    } catch {
      // localStorage unavailable — mark loaded so we don't block forever
      setStatus((prev) => ({ ...prev, isLoaded: true }));
    }

    // Re-read stats from localStorage (used by both listeners)
    const refreshStatus = () => {
      try {
        const raw = localStorage.getItem(STATS_KEY);
        if (raw) {
          const stats = JSON.parse(raw);
          setStatus({
            pathUnlocked: (stats.completedCooks ?? 0) >= 3,
            communityUnlocked: false,
            completedCooks: stats.completedCooks ?? 0,
            isLoaded: true,
          });
        }
      } catch {
        // ignore
      }
    };

    // Listen for storage changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STATS_KEY) refreshStatus();
    };

    // Listen for same-tab stats updates (StorageEvent only fires cross-tab)
    const handleSameTab = () => refreshStatus();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("sous-stats-updated", handleSameTab);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("sous-stats-updated", handleSameTab);
    };
  }, []);

  return status;
}
