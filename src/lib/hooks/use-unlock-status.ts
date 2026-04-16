"use client";

import { useState, useEffect } from "react";

const STATS_KEY = "sous-cook-stats";

interface UnlockStatus {
  pathUnlocked: boolean;
  communityUnlocked: boolean;
  completedCooks: number;
}

function readStatus(): UnlockStatus {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const stats = JSON.parse(raw) as { completedCooks?: number };
      return {
        pathUnlocked: true,
        communityUnlocked: false,
        completedCooks: stats.completedCooks ?? 0,
      };
    }
  } catch {
    // localStorage unavailable
  }
  return { pathUnlocked: true, communityUnlocked: false, completedCooks: 0 };
}

/**
 * Read-only hook: cook stats from localStorage for tab visibility.
 * Path is always visible. Community is deferred (always false).
 */
export function useUnlockStatus(): UnlockStatus {
  const [status, setStatus] = useState<UnlockStatus>(() => {
    if (typeof window === "undefined")
      return {
        pathUnlocked: true,
        communityUnlocked: false,
        completedCooks: 0,
      };
    return readStatus();
  });

  useEffect(() => {
    const refreshStatus = () => setStatus(readStatus());

    // Listen for storage changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STATS_KEY) refreshStatus();
    };

    // Listen for same-tab stats updates (StorageEvent only fires cross-tab)
    window.addEventListener("storage", handleStorage);
    window.addEventListener("sous-stats-updated", refreshStatus);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("sous-stats-updated", refreshStatus);
    };
  }, []);

  return status;
}
