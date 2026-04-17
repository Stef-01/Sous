"use client";

import { useCallback, useEffect, useState } from "react";

/** Storage key for rest-day entries (local-only; no remote sync). */
const STORAGE_KEY = "sous-rest-days";
/** Max one rest day per rolling 7-day window — prevents streak laundering. */
export const REST_WINDOW_DAYS = 7;
/** How far back `computeStreakWithRest` will walk looking for `lastCookDate`. */
export const MAX_REST_LOOKBACK_DAYS = 14;

/** Serialize a Date into a local-calendar YYYY-MM-DD key. Matches the format
 *  `useCookSessions` already uses for `lastCookDate`. */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(base: Date, delta: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + delta);
  return next;
}

/** Load the persisted rest-day list from localStorage. Returns `[]` on the
 *  server or if the stored value is malformed. Exported for the session hook
 *  so it can call this synchronously inside `completeSession`. */
export function loadRestDays(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

function persist(restDays: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restDays));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("sous-rest-days-updated"));
    }
  } catch {
    /* storage full / unavailable — silently drop */
  }
}

/** Returns true if a rest day can be taken today — i.e. none of the last
 *  `REST_WINDOW_DAYS` calendar days are already marked as rest days. */
export function canTakeRestDay(
  restDays: string[],
  today: Date = new Date(),
): boolean {
  const restSet = new Set(restDays);
  for (let i = 0; i < REST_WINDOW_DAYS; i++) {
    if (restSet.has(toDateKey(addDays(today, -i)))) return false;
  }
  return true;
}

/** Recompute whether the stored streak is still alive, allowing rest days to
 *  bridge gaps. Mirrors the original `computeStreak` semantics when no rest
 *  days exist: a streak survives as long as the last cook was today, or
 *  yesterday, or every intervening day is marked as a rest day.
 *
 *  Exported so both the UI (for the effective streak display) and the session
 *  hook (for completion) can share one rule. */
export function computeStreakWithRest(
  lastCookDate: string | null,
  currentStreak: number,
  restDays: string[],
  today: Date = new Date(),
): number {
  if (!lastCookDate) return 0;
  const todayStr = toDateKey(today);
  if (lastCookDate === todayStr) return currentStreak;

  const restSet = new Set(restDays);
  // Walk back from today. Any day between today and lastCookDate must be a
  // rest day (today itself is exempt — it is the current moment, not a miss).
  for (let i = 1; i <= MAX_REST_LOOKBACK_DAYS; i++) {
    const key = toDateKey(addDays(today, -i));
    if (key === lastCookDate) return currentStreak;
    if (!restSet.has(key)) return 0;
  }
  return 0;
}

export interface UseRestDaysResult {
  mounted: boolean;
  restDays: string[];
  /** Whether today's calendar day is in the rest-day list. */
  todayIsRestDay: boolean;
  /** Whether the user may mark today as a rest day (passes the weekly cap). */
  canRestToday: boolean;
  /** Mark today as a rest day. Idempotent; no-op if already used this week. */
  markRestDay: () => void;
  /** Remove today from the rest-day list (undo support). */
  clearRestDay: () => void;
}

/** React binding around the persisted rest-day list. Subscribes to the
 *  `sous-rest-days-updated` synthetic event so multiple mounted components
 *  stay in sync without polling. */
export function useRestDays(): UseRestDaysResult {
  const [restDays, setRestDays] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRestDays(loadRestDays());
    setMounted(true);
    const onUpdate = () => setRestDays(loadRestDays());
    window.addEventListener("sous-rest-days-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("sous-rest-days-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const markRestDay = useCallback(() => {
    const todayKey = toDateKey(new Date());
    const current = loadRestDays();
    if (current.includes(todayKey)) return;
    if (!canTakeRestDay(current)) return;
    // Keep the list small — only the last 30 days are relevant for display
    // and streak bridging combined. Older entries drop off.
    const trimmed = [...current, todayKey].slice(-30);
    persist(trimmed);
    setRestDays(trimmed);
  }, []);

  const clearRestDay = useCallback(() => {
    const todayKey = toDateKey(new Date());
    const current = loadRestDays();
    if (!current.includes(todayKey)) return;
    const next = current.filter((d) => d !== todayKey);
    persist(next);
    setRestDays(next);
  }, []);

  const todayKey = toDateKey(new Date());
  const todayIsRestDay = restDays.includes(todayKey);
  const canRestToday = !todayIsRestDay && canTakeRestDay(restDays);

  return {
    mounted,
    restDays,
    todayIsRestDay,
    canRestToday,
    markRestDay,
    clearRestDay,
  };
}
