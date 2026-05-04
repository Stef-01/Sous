import type { Scorer, MainDishIntent, SideDishCandidate } from "../types";

/**
 * Anti-Monotony Scorer
 *
 * Penalizes sides that were recently served to ensure variety.
 * Reads a "recently served" log from localStorage (written by the cook
 * completion flow) and applies a time-decayed penalty.
 *
 * - Served today: score 0.1 (strong penalty)
 * - Served 1-2 days ago: score 0.3
 * - Served 3-4 days ago: score 0.5
 * - Served 5-6 days ago: score 0.7
 * - Served 7+ days ago or never: score 0.9 (slight variety bonus)
 */

const SERVED_LOG_KEY = "sous-served-sides-v1";
const MAX_LOG_ENTRIES = 50;
const WINDOW_DAYS = 7;

export interface ServedEntry {
  sideId: string;
  servedAt: string; // ISO date string
}

/** Read the served-sides log from localStorage. Safe for SSR. */
export function readServedLog(): ServedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SERVED_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is ServedEntry =>
        !!e &&
        typeof (e as ServedEntry).sideId === "string" &&
        typeof (e as ServedEntry).servedAt === "string",
    );
  } catch {
    return [];
  }
}

/** Record a side as served. Call this when the user starts cooking a side. */
export function recordServedSide(sideId: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = readServedLog();
    const entry: ServedEntry = {
      sideId,
      servedAt: new Date().toISOString(),
    };
    const next = [entry, ...existing].slice(0, MAX_LOG_ENTRIES);
    window.localStorage.setItem(SERVED_LOG_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable
  }
}

/**
 * Build a map of sideId → days since last served.
 * Only includes sides served within the WINDOW_DAYS window.
 */
export function buildRecencyMap(
  log?: ServedEntry[],
): Map<string, number> {
  const entries = log ?? readServedLog();
  const now = Date.now();
  const map = new Map<string, number>();

  for (const entry of entries) {
    const servedTime = new Date(entry.servedAt).getTime();
    if (!Number.isFinite(servedTime)) continue;
    const daysSince = (now - servedTime) / (1000 * 60 * 60 * 24);
    if (daysSince > WINDOW_DAYS) continue;

    // Keep the most recent occurrence only
    const existing = map.get(entry.sideId);
    if (existing === undefined || daysSince < existing) {
      map.set(entry.sideId, daysSince);
    }
  }

  return map;
}

/**
 * Anti-monotony scorer factory. Accepts a pre-built recency map so the
 * localStorage read happens once per scoring pass, not once per candidate.
 */
export function createAntiMonotonyScorer(
  recencyMap?: Map<string, number>,
): Scorer {
  const map = recencyMap ?? buildRecencyMap();

  return {
    name: "antiMonotony",

    score(_main: MainDishIntent, side: SideDishCandidate): number {
      const daysSince = map.get(side.id) ?? map.get(side.slug);

      // Never served recently — slight variety bonus
      if (daysSince === undefined) return 0.9;

      // Apply time-decayed penalty
      if (daysSince < 1) return 0.1;
      if (daysSince < 3) return 0.3;
      if (daysSince < 5) return 0.5;
      if (daysSince < 7) return 0.7;
      return 0.9;
    },
  };
}

/** Static instance for use in the engine (reads localStorage at import). */
export const antiMonotonyScorer: Scorer = {
  name: "antiMonotony",
  score(main: MainDishIntent, side: SideDishCandidate): number {
    // Lazy: build map on each call in static mode. In practice the engine
    // should use createAntiMonotonyScorer() for batch efficiency.
    const map = buildRecencyMap();
    const daysSince = map.get(side.id) ?? map.get(side.slug);
    if (daysSince === undefined) return 0.9;
    if (daysSince < 1) return 0.1;
    if (daysSince < 3) return 0.3;
    if (daysSince < 5) return 0.5;
    if (daysSince < 7) return 0.7;
    return 0.9;
  },
};
