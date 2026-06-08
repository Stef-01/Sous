"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * useHydration (W23) — a lightweight daily water tracker. Glasses of water you
 * DRINK, tracked against a simple daily goal. Deliberately separate from the
 * nutrition diary's `water` nutrient (which is moisture composed from cooked
 * ingredients) so the two never double-count. localStorage-backed, same
 * hydration guard as the diary; writes stamp the live day at call time so a
 * glass logged after midnight lands in the new day.
 */

const KEY = "sous-hydration-v1";

/** ~2 L at 250 ml/glass — the common general-population heuristic. A personalised
 *  target (by body mass / activity) is founder-gated with the EER work (W43). */
export const HYDRATION_GOAL_GLASSES = 8;
export const ML_PER_GLASS = 250;

export function glassesToMl(glasses: number): number {
  return glasses * ML_PER_GLASS;
}

type Store = Record<string, number>; // dayKey → glasses

function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // ignore quota / privacy mode
  }
}

export function useHydration() {
  const [store, setStore] = useState<Store>({});
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage on mount */
  useEffect(() => {
    setStore(read());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const glasses = store[dayKey()] ?? 0;

  const setGlasses = useCallback((n: number) => {
    const key = dayKey();
    const clamped = Math.max(0, Math.min(20, Math.round(n)));
    setStore((prev) => {
      const next = { ...prev, [key]: clamped };
      write(next);
      return next;
    });
  }, []);

  return {
    mounted,
    glasses,
    goal: HYDRATION_GOAL_GLASSES,
    ml: glassesToMl(glasses),
    setGlasses,
  };
}
