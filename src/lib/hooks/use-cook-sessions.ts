"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { computeStreakWithRest, loadRestDays } from "./use-rest-days";
import { persistCookCompletion } from "@/lib/trpc/vanilla";

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
  /** Y2 W6 V3 trainer dependency. Persists the engine's
   *  ScoreBreakdown at the moment the user picks the side from
   *  the result stack — NOT at cook completion. The V3 trainer
   *  reads this to learn per-dimension preferences from
   *  accepted vs. rejected pairs. Optional + nullable so legacy
   *  sessions without breakdowns degrade to V2 metadata-only
   *  trainer path. */
  engineScoreBreakdown?: {
    cuisineFit: number;
    flavorContrast: number;
    nutritionBalance: number;
    prepBurden: number;
    temperature: number;
    preference: number;
    totalScore: number;
  } | null;
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Guard the app's most important dataset: a non-array or malformed entries
    // would crash the many .filter/.map consumers at render time.
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is CookSessionRecord =>
        !!s &&
        typeof s.sessionId === "string" &&
        typeof s.recipeSlug === "string" &&
        typeof s.startedAt === "string",
    );
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
  // Initialize to SSR defaults and hydrate from localStorage AFTER mount, so the
  // server render and the first client render agree (the lazy-initializer read
  // caused a hydration mismatch on the Today header streak pill — it renders
  // null at streak 0 on the server but the persisted streak on first client
  // render). This matches the effect-hydration pattern used by the other hooks.
  const [sessions, setSessions] = useState<CookSessionRecord[]>([]);
  const [stats, setStats] = useState<CookStats>(DEFAULT_STATS);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setSessions(loadSessions());

    setStats(loadStats());
  }, []);

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
        // Unknown session (e.g. storage evicted mid-cook): don't fabricate a
        // streak of 0 that the win screen would render as a real value.
        return {
          pathJustUnlocked: false,
          newStreak: loadStats().currentStreak,
        };
      }

      // Idempotency: a rapid double-tap or a voice "done" + button tap can call
      // this twice for the same session. Without this guard the second call
      // re-increments completedCooks/streak, re-adds the cuisine, and fires a
      // duplicate Supabase write — inflating the app's core progression metrics.
      if (existing[idx].completedAt) {
        return {
          pathJustUnlocked: false,
          newStreak: loadStats().currentStreak,
        };
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

      // Write-through to Supabase (best-effort; localStorage stays the
      // source of truth, so this never blocks or fails the win).
      persistCookCompletion({
        sideDishSlug: existing[idx].recipeSlug,
        mainDishInput: existing[idx].mainDishInput ?? null,
        rating: payload.rating ?? null,
        personalNote: payload.note ?? null,
        completionPhotoUrl: payload.photoUri ?? null,
      });

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
          | "note"
          | "photoUri"
          | "rating"
          | "favorite"
          | "feedback"
          | "engineScoreBreakdown"
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
