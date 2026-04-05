"use client";

import { useState, useCallback, useEffect } from "react";

const SESSIONS_KEY = "sous-cook-sessions";
const STATS_KEY = "sous-cook-stats";
const MAX_SESSIONS = 100;

// ── Types ─────────────────────────────────────────────

export interface CookSessionRecord {
  sessionId: string;
  recipeSlug: string;
  dishName: string;
  cuisineFamily: string;
  startedAt: string;
  completedAt?: string;
  note?: string;
  photoUri?: string;
  rating?: number; // 1-5
  favorite: boolean;
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
    return { completedCooks: 0, currentStreak: 0, lastCookDate: null, cuisinesCovered: [] };
  }
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw
      ? JSON.parse(raw)
      : { completedCooks: 0, currentStreak: 0, lastCookDate: null, cuisinesCovered: [] };
  } catch {
    return { completedCooks: 0, currentStreak: 0, lastCookDate: null, cuisinesCovered: [] };
  }
}

function persistStats(stats: CookStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Calculate whether the streak is still active.
 * A streak stays alive if the user cooked today or yesterday.
 */
function computeStreak(lastCookDate: string | null, currentStreak: number): number {
  if (!lastCookDate) return 0;
  const last = new Date(lastCookDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - last.getTime()) / 86400000);
  if (diffDays <= 1) return currentStreak;
  return 0; // streak broken
}

// ── Hook ──────────────────────────────────────────────

const DEFAULT_STATS: CookStats = {
  completedCooks: 0,
  currentStreak: 0,
  lastCookDate: null,
  cuisinesCovered: [],
};

export function useCookSessions() {
  const [sessions, setSessions] = useState<CookSessionRecord[]>([]);
  const [stats, setStats] = useState<CookStats>(DEFAULT_STATS);

  useEffect(() => {
    setSessions(loadSessions());
    setStats(loadStats());
  }, []);

  /**
   * Start a new cook session. Returns the session ID.
   */
  const startSession = useCallback(
    (recipeSlug: string, dishName: string, cuisineFamily: string): string => {
      const sessionId = generateSessionId();
      const session: CookSessionRecord = {
        sessionId,
        recipeSlug,
        dishName,
        cuisineFamily,
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
    []
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
      }
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
      const today = new Date().toISOString().split("T")[0];
      const activeStreak = computeStreak(currentStats.lastCookDate, currentStats.currentStreak);
      const newStreak = activeStreak + 1;

      const cuisines = new Set(currentStats.cuisinesCovered);
      cuisines.add(existing[idx].cuisineFamily);

      const newStats: CookStats = {
        completedCooks: currentStats.completedCooks + 1,
        currentStreak: newStreak,
        lastCookDate: today,
        cuisinesCovered: Array.from(cuisines),
      };

      persistStats(newStats);
      setStats(newStats);

      const pathJustUnlocked = currentStats.completedCooks === 2; // was 2, now becomes 3
      return { pathJustUnlocked, newStreak };
    },
    []
  );

  /**
   * Update an existing session (e.g. add a note or photo after initial save).
   */
  const updateSession = useCallback(
    (sessionId: string, updates: Partial<Pick<CookSessionRecord, "note" | "photoUri" | "rating" | "favorite">>) => {
      const existing = loadSessions();
      const idx = existing.findIndex((s) => s.sessionId === sessionId);
      if (idx === -1) return;

      existing[idx] = { ...existing[idx], ...updates };
      persistSessions(existing);
      setSessions(existing);
    },
    []
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
  const completedSessions = sessions.filter((s) => s.completedAt);

  /**
   * Get favorite sessions.
   */
  const favoriteSessions = sessions.filter((s) => s.favorite);

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
