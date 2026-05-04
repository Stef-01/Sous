"use client";

import { useCallback, useEffect, useState } from "react";

const HISTORY_KEY = "sous-craving-history-v2";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_UNIQUE = 10;

/** Minimum consecutive same-cuisine cravings before nudging variety. */
const STREAK_THRESHOLD = 3;

export interface CravingHistoryEntry {
  query: string;
  cuisine: string | null;
  usedAt: string;
}

export interface CuisineNudge {
  /** The cuisine the user has been repeating. */
  repeatedCuisine: string;
  /** How many consecutive cravings in this cuisine. */
  streak: number;
  /** A suggested alternative cuisine to try. */
  suggestion: string;
  /** Human-readable nudge message. */
  message: string;
}

/** Adjacent cuisines to suggest as alternatives when a streak is detected. */
const CUISINE_NEIGHBORS: Record<string, string[]> = {
  indian: ["thai", "japanese", "mediterranean"],
  thai: ["vietnamese", "japanese", "korean"],
  japanese: ["korean", "thai", "vietnamese"],
  korean: ["japanese", "thai", "mexican"],
  mexican: ["korean", "mediterranean", "american"],
  italian: ["mediterranean", "french", "american"],
  vietnamese: ["thai", "japanese", "korean"],
  american: ["mexican", "italian", "korean"],
  mediterranean: ["italian", "indian", "mexican"],
  "comfort-classic": ["italian", "mexican", "japanese"],
};

function readAll(): CravingHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    const valid = parsed.filter(
      (e): e is CravingHistoryEntry =>
        !!e &&
        typeof (e as CravingHistoryEntry).query === "string" &&
        typeof (e as CravingHistoryEntry).usedAt === "string",
    );
    return valid.filter((e) => {
      const ts = new Date(e.usedAt).getTime();
      return Number.isFinite(ts) && now - ts <= TTL_MS;
    });
  } catch {
    return [];
  }
}

function persist(entries: CravingHistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // quota / disabled
  }
}

function normalize(q: string): string {
  return q.trim().replace(/\s+/g, " ");
}

/**
 * Detect if the user has been craving the same cuisine repeatedly.
 * Returns a nudge if streak >= STREAK_THRESHOLD, null otherwise.
 */
export function detectCuisineStreak(
  entries: CravingHistoryEntry[],
): CuisineNudge | null {
  if (entries.length < STREAK_THRESHOLD) return null;

  // Check most recent entries for same cuisine
  const recentCuisines = entries
    .slice(0, STREAK_THRESHOLD)
    .map((e) => e.cuisine)
    .filter((c): c is string => c !== null && c !== "");

  if (recentCuisines.length < STREAK_THRESHOLD) return null;

  const firstCuisine = recentCuisines[0];
  const allSame = recentCuisines.every((c) => c === firstCuisine);

  if (!allSame) return null;

  // Count the full streak length
  let streak = 0;
  for (const entry of entries) {
    if (entry.cuisine === firstCuisine) streak++;
    else break;
  }

  // Pick a suggestion that isn't the repeated cuisine
  const neighbors = CUISINE_NEIGHBORS[firstCuisine] ?? [
    "japanese",
    "italian",
    "thai",
  ];
  const suggestion = neighbors[0];

  const cuisineLabel =
    firstCuisine.charAt(0).toUpperCase() + firstCuisine.slice(1);
  const suggestionLabel =
    suggestion.charAt(0).toUpperCase() + suggestion.slice(1);

  return {
    repeatedCuisine: firstCuisine,
    streak,
    suggestion,
    message: `You've been on a ${cuisineLabel} streak — try ${suggestionLabel}?`,
  };
}

/**
 * useCravingHistory  -  remembers the user's last 10 unique craving queries
 * for 30 days, MRU-ordered. Tracks cuisine per entry to detect repetition
 * streaks and generate variety nudges. One-tap rerun support. Silent dedupe
 * by case-insensitive match.
 */
export function useCravingHistory() {
  const [entries, setEntries] = useState<CravingHistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage on mount */
  useEffect(() => {
    setEntries(readAll());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const record = useCallback((rawQuery: string, cuisine?: string | null) => {
    const query = normalize(rawQuery);
    if (!query) return;
    const existing = readAll();
    const filtered = existing.filter(
      (e) => e.query.toLowerCase() !== query.toLowerCase(),
    );
    const next: CravingHistoryEntry[] = [
      { query, cuisine: cuisine ?? null, usedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, MAX_UNIQUE);
    persist(next);
    setEntries(next);
  }, []);

  const clear = useCallback(() => {
    persist([]);
    setEntries([]);
  }, []);

  /** Check if the user is in a cuisine streak and should see a nudge. */
  const cuisineNudge = detectCuisineStreak(entries);

  /** Get the cuisines from recent history as a preference signal (frequency map). */
  const cuisineFrequency = entries.reduce<Record<string, number>>((acc, e) => {
    if (e.cuisine) {
      acc[e.cuisine] = (acc[e.cuisine] ?? 0) + 1;
    }
    return acc;
  }, {});

  return { entries, mounted, record, clear, cuisineNudge, cuisineFrequency };
}
