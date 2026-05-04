"use client";

import { useCallback, useEffect, useState } from "react";

const FREEZE_KEY = "sous-streak-freeze-v1";

export interface StreakFreezeState {
  /** Number of banked freezes (max 1). */
  banked: number;
  /** ISO date string when the last freeze was earned. */
  earnedAt: string | null;
  /** ISO date string when a freeze was last consumed. */
  consumedAt: string | null;
}

function defaultState(): StreakFreezeState {
  return { banked: 0, earnedAt: null, consumedAt: null };
}

function loadState(): StreakFreezeState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(FREEZE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      banked: typeof parsed.banked === "number" ? Math.min(parsed.banked, 1) : 0,
      earnedAt: parsed.earnedAt ?? null,
      consumedAt: parsed.consumedAt ?? null,
    };
  } catch {
    return defaultState();
  }
}

function persistState(state: StreakFreezeState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FREEZE_KEY, JSON.stringify(state));
  } catch {
    // noop
  }
}

/**
 * useStreakFreeze — manages a single bankable streak freeze.
 *
 * Earning: call `earn()` when the user completes a weekly challenge.
 * Only 1 can be banked at a time.
 *
 * Consuming: call `consume()` when the streak would otherwise break
 * (e.g., user missed a day and has no rest day). Returns true if a freeze
 * was available and consumed, false otherwise.
 *
 * The streak counter shows a shield icon when a freeze is banked.
 */
export function useStreakFreeze() {
  const [state, setState] = useState<StreakFreezeState>(defaultState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);

  const earn = useCallback(() => {
    setState((prev) => {
      if (prev.banked >= 1) return prev; // max 1
      const next: StreakFreezeState = {
        ...prev,
        banked: 1,
        earnedAt: new Date().toISOString(),
      };
      persistState(next);
      return next;
    });
  }, []);

  const consume = useCallback((): boolean => {
    const current = loadState();
    if (current.banked <= 0) return false;
    const next: StreakFreezeState = {
      ...current,
      banked: 0,
      consumedAt: new Date().toISOString(),
    };
    persistState(next);
    setState(next);
    return true;
  }, []);

  return {
    banked: state.banked,
    hasFreezeAvailable: mounted && state.banked > 0,
    earn,
    consume,
    mounted,
  };
}
