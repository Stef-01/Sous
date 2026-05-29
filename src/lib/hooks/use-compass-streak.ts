"use client";

/**
 * useCompassStreak — Cuisine Compass daily-streak persistence
 * (Y5 N substrate per `docs/CUISINE-COMPASS-MAP-GAME-PLAN.md`).
 *
 * localStorage-backed Wordle-style streak: each completed daily
 * puzzle bumps the streak iff played within the same UTC day or
 * the next consecutive day. Otherwise the streak resets to 1.
 * Per-puzzle results are kept keyed by ISO date so the user can
 * see their share grid for past days.
 *
 * W15 RCA pattern: freshDefault factory + schema-version check +
 * defensive parser (per-record drop on corruption).
 *
 * Pure helpers exported alongside the hook so tests exercise the
 * persistence layer without a DOM.
 */

import { useCallback, useEffect, useState } from "react";
import {
  COMPASS_SCHEMA_VERSION,
  compassResultSchema,
  type CompassResult,
  type CompassStreak,
} from "@/types/cuisine-compass";

export const COMPASS_STREAK_STORAGE_KEY = "sous-compass-streak-v1";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Pure: fresh state factory. */
export function freshCompassStreak(): CompassStreak {
  return {
    schemaVersion: COMPASS_SCHEMA_VERSION,
    current: 0,
    best: 0,
    lastPlayedDate: "",
    results: {},
  };
}

/** Pure: parse a stored payload defensively. Drops corrupt
 *  individual results rather than nuking the whole map. */
export function parseStoredCompassStreak(
  raw: string | null | undefined,
): CompassStreak {
  if (!raw) return freshCompassStreak();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return freshCompassStreak();
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return freshCompassStreak();
  }
  const obj = parsed as Partial<CompassStreak>;
  if (obj.schemaVersion !== COMPASS_SCHEMA_VERSION) return freshCompassStreak();

  const results: Record<string, CompassResult> = {};
  if (obj.results && typeof obj.results === "object") {
    for (const [k, v] of Object.entries(obj.results)) {
      const r = compassResultSchema.safeParse(v);
      if (r.success) results[k] = r.data;
    }
  }

  return {
    schemaVersion: COMPASS_SCHEMA_VERSION,
    current:
      typeof obj.current === "number" && obj.current >= 0
        ? Math.floor(obj.current)
        : 0,
    best:
      typeof obj.best === "number" && obj.best >= 0 ? Math.floor(obj.best) : 0,
    lastPlayedDate:
      typeof obj.lastPlayedDate === "string" ? obj.lastPlayedDate : "",
    results,
  };
}

/** Pure: ISO YYYY-MM-DD from a Date (UTC). */
function isoUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Pure: are two ISO dates exactly one UTC day apart? */
export function isConsecutiveUtcDay(prev: string, next: string): boolean {
  if (!prev || !next) return false;
  const a = Date.parse(`${prev}T00:00:00Z`);
  const b = Date.parse(`${next}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return b - a === DAY_MS;
}

/** Pure: apply a result to the streak state — caller decides
 *  the puzzle date so tests can drive the clock. Idempotent on
 *  same-day re-submits (replaces the result without bumping the
 *  streak twice). */
export function applyCompassResult(input: {
  prev: CompassStreak;
  result: CompassResult;
}): CompassStreak {
  const { prev, result } = input;
  const date = result.puzzleDate;
  const alreadyPlayed = prev.lastPlayedDate === date;
  let nextCurrent: number;
  if (alreadyPlayed) {
    // Re-submit on the same day — streak unchanged.
    nextCurrent = prev.current;
  } else if (isConsecutiveUtcDay(prev.lastPlayedDate, date)) {
    nextCurrent = prev.current + 1;
  } else {
    // First puzzle ever, or a gap — restart at 1.
    nextCurrent = 1;
  }
  const nextBest = Math.max(prev.best, nextCurrent);
  return {
    schemaVersion: COMPASS_SCHEMA_VERSION,
    current: nextCurrent,
    best: nextBest,
    lastPlayedDate: date,
    results: { ...prev.results, [date]: result },
  };
}

export interface UseCompassStreakResult {
  mounted: boolean;
  streak: CompassStreak;
  /** Append a result + bump the streak. Returns the next state
   *  for callers that want to chain (e.g. show a celebration
   *  when current crosses a milestone). */
  recordResult: (result: CompassResult) => CompassStreak;
  /** Convenience accessor — has the user already played today? */
  hasPlayedToday: (now?: Date) => boolean;
  /** Lookup a past day's result by ISO date. */
  resultFor: (isoDate: string) => CompassResult | null;
  /** Wipe everything (used by Profile sheet's demo-reset
   *  affordance for parity with the pod state reset). */
  reset: () => void;
}

export function useCompassStreak(): UseCompassStreakResult {
  const [streak, setStreak] = useState<CompassStreak>(() =>
    freshCompassStreak(),
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(COMPASS_STREAK_STORAGE_KEY);
      setStreak(parseStoredCompassStreak(raw));
    } catch {
      setStreak(freshCompassStreak());
    }
    setMounted(true);
  }, []);

  const persist = useCallback((next: CompassStreak) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(COMPASS_STREAK_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore — quota / privacy mode
    }
  }, []);

  const recordResult = useCallback(
    (result: CompassResult): CompassStreak => {
      let next: CompassStreak = freshCompassStreak();
      setStreak((prev) => {
        next = applyCompassResult({ prev, result });
        persist(next);
        return next;
      });
      return next;
    },
    [persist],
  );

  const hasPlayedToday = useCallback(
    (now: Date = new Date()): boolean => streak.lastPlayedDate === isoUtc(now),
    [streak.lastPlayedDate],
  );

  const resultFor = useCallback(
    (isoDate: string): CompassResult | null => streak.results[isoDate] ?? null,
    [streak.results],
  );

  const reset = useCallback(() => {
    setStreak(() => {
      const next = freshCompassStreak();
      persist(next);
      return next;
    });
  }, [persist]);

  return {
    mounted,
    streak,
    recordResult,
    hasPlayedToday,
    resultFor,
    reset,
  };
}
