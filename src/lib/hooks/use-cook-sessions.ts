"use client";

import { useState, useCallback, useMemo } from "react";
import { computeStreakWithRest, loadRestDays } from "./use-rest-days";

const SESSIONS_KEY = "sous-cook-sessions";
const STATS_KEY = "sous-cook-stats";
const MAX_SESSIONS = 100;

// ── Types ─────────────────────────────────────────────

export interface CookSessionRecord {
  sessionId: string;
  recipeSlug: string;
  dishName: string;
  cuisineFamily: string;
  mainDishInput?: string; // what main dish this side was paired with
  startedAt: string;
  completedAt?: string;
  note?: string;
  photoUri?: string;
  rating?: number; // 1-5
  /** Low-star feedback chip selection: "too-salty" | "too-dry" | "unclear". */
  feedback?: string;
  favorite: boolean;
  scrapbookSaved?: boolean;
}

export interface CookStats {
  completedCooks: number;
  currentStreak: number;
  lastCookDate: string | null;
  cuisinesCovered: string[];
}

// ── Helpers ───────────────────────────────────────────

function generateSessionId(): string {
  return `cs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadSessions(): CookSessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSessions(sessions: CookSessionRecord[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // localStorage full or unavailable
  }
}

function loadStats(): CookStats {
  if (typeof window === "undefined") {
    return {
      completedCooks: 0,
      currentStreak: 0,
      lastCookDate: null,
      cuisinesCovered: [],
    };
  }
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return {
        completedCooks: 0,
        currentStreak: 0,
        lastCookDate: null,
        cuisinesCovered: [],
      };
    }
    const parsed = JSON.parse(raw);
    return {
      completedCooks: parsed.completedCooks ?? 0,
      currentStreak: parsed.currentStreak ?? 0,
      lastCookDate: parsed.lastCookDate ?? null,
      cuisinesCovered: Array.isArray(parsed.cuisinesCovered)
        ? parsed.cuisinesCovered
        : [],
    };
  } catch {
    return {
      completedCooks: 0,
      currentStreak: 0,
      lastCookDate: null,
      cuisinesCovered: [],
    };
  }
}

function persistStats(stats: CookStats) {
  try {
    const serialized = JSON.stringify(stats);
    localStorage.setItem(STATS_KEY, serialized);
    // Dispatch a synthetic storage event so same-tab listeners (useUnlockStatus) pick up the change.
    // The native `storage` event only fires in OTHER tabs, not the originating tab.
    window.dispatchEvent(
      new StorageEvent("storage", { key: STATS_KEY, newValue: serialized }),
    );
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Calculate whether the streak is still active.
 * A streak stays alive if the user cooked today, yesterday, or if every
 * intervening day is covered by a rest day (see `use-rest-days.ts`).
 * Uses calendar-day comparison (not raw ms diff) to avoid timezone bugs.
 */
function computeStreak(
  lastCookDate: string | null,
  currentStreak: number,
): number {
  return computeStreakWithRest(lastCookDate, currentStreak, loadRestDays());
}

// ── Hook ──────────────────────────────────────────────

const DEFAULT_STATS: CookStats = {
  completedCooks: 0,
  currentStreak: 0,
  lastCookDate: null,
  cuisinesCovered: [],
};

export function useCookSessions() {
  const [sessions, setSessions] = useState<CookSessionRecord[]>(() => {
    if (typeof window === "undefined") return [];
    return loadSessions();
  });
  const [stats, setStats] = useState<CookStats>(() => {
    if (typeof window === "undefined") return DEFAULT_STATS;
    return loadStats();
  });

  /**
   * Start a new cook session. Returns the session ID.
   */
  const startSession = useCallback(
    (
      recipeSlug: string,
      dishName: string,
      cuisineFamily: string,
      mainDishInput?: string,
    ): string => {
      const sessionId = generateSessionId();
      const session: CookSessionRecord = {
        sessionId,
        recipeSlug,
        dishName,
        cuisineFamily,
        mainDishInput,
        startedAt: new Date().toISOString(),
        favorite: false,
      };

      const existing = loadSessions();
      let updated = [session, ...existing];
      if (updated.length > MAX_SESSIONS) {
        updated = updated.slice(0, MAX_SESSIONS);
      }

      persistSessions(updated);
      setSessions(updated);
      return sessionId;
    },
    [],
  );

  /**
   * Complete a cook session with optional metadata.
   * Updates stats (completedCooks, streak, cuisines).
   * Returns whether this was the 3rd cook (Path unlock trigger).
   */
  const completeSession = useCallback(
    (
      sessionId: string,
      payload: {
        rating?: number;
        note?: string;
        photoUri?: string;
      },
    ): { pathJustUnlocked: boolean; newStreak: number } => {
      const existing = loadSessions();
      const idx = existing.findIndex((s) => s.sessionId === sessionId);
      if (idx === -1) {
        return { pathJustUnlocked: false, newStreak: 0 };
      }

      // Update the session record
      existing[idx] = {
        ...existing[idx],
        completedAt: new Date().toISOString(),
        rating: payload.rating,
        note: payload.note,
        photoUri: payload.photoUri,
      };

      persistSessions(existing);
      setSessions(existing);

      // Update stats
      const currentStats = loadStats();
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const activeStreak = computeStreak(
        currentStats.lastCookDate,
        currentStats.currentStreak,
      );
      // Only increment streak once per calendar day
      const newStreak =
        currentStats.lastCookDate === today ? activeStreak : activeStreak + 1;

      // Normalize cuisine names to Title Case before deduplicating
      const normalize = (c: string) =>
        c ? c.charAt(0).toUpperCase() + c.slice(1).toLowerCase() : c;
      const cuisines = new Set(currentStats.cuisinesCovered.map(normalize));
      cuisines.add(normalize(existing[idx].cuisineFamily));

      const newStats: CookStats = {
        completedCooks: currentStats.completedCooks + 1,
        currentStreak: newStreak,
        lastCookDate: today,
        cuisinesCovered: Array.from(cuisines),
      };

      persistStats(newStats);
      setStats(newStats);

      // Notify other hooks in the same tab (StorageEvent only fires cross-tab)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sous-stats-updated"));
      }

      const pathJustUnlocked = currentStats.completedCooks === 2; // was 2, now becomes 3
      return { pathJustUnlocked, newStreak };
    },
    [],
  );

  /**
   * Update an existing session (e.g. add a note or photo after initial save).
   */
  const updateSession = useCallback(
    (
      sessionId: string,
      updates: Partial<
        Pick<
          CookSessionRecord,
          "note" | "photoUri" | "rating" | "favorite" | "feedback"
        >
      >,
    ) => {
      const existing = loadSessions();
      const idx = existing.findIndex((s) => s.sessionId === sessionId);
      if (idx === -1) return;

      existing[idx] = { ...existing[idx], ...updates };
      persistSessions(existing);
      setSessions(existing);
    },
    [],
  );

  /**
   * Toggle favorite status on a session.
   */
  const toggleFavorite = useCallback((sessionId: string) => {
    const existing = loadSessions();
    const idx = existing.findIndex((s) => s.sessionId === sessionId);
    if (idx === -1) return;

    existing[idx].favorite = !existing[idx].favorite;
    persistSessions(existing);
    setSessions(existing);
  }, []);

  /**
   * Get completed sessions (most recent first).
   */
  const completedSessions = useMemo(
    () => sessions.filter((s) => s.completedAt),
    [sessions],
  );

  /**
   * Get favorite sessions.
   */
  const favoriteSessions = useMemo(
    () => sessions.filter((s) => s.favorite),
    [sessions],
  );

  return {
    sessions,
    completedSessions,
    favoriteSessions,
    stats,
    startSession,
    completeSession,
    updateSession,
    toggleFavorite,
  };
}
