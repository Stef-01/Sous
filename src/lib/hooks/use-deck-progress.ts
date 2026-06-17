"use client";

/**
 * Deck progress — remember which Today meal-deck cards the user has already
 * swiped, so leaving the tab and coming back continues where they left off
 * instead of snapping to the first (already-swiped) dish.
 *
 * RCA (the bug this fixes): the swipe overlay's `unswiped` list was ephemeral
 * `useState(() => dishes)` — closing the overlay or navigating to another tab
 * unmounts it, and reopening rebuilt the full deck from the top. The deck ORDER
 * is deterministic within a day (quest-pool seeds by day-of-year), so we only
 * need to persist WHICH slugs were swiped, then filter them out of the deck.
 *
 * Day + filter scoped: the set is keyed by the local calendar date AND a hash
 * of the deck-determining inputs (queue mode, quest filters, pantry mode). A
 * day rollover or a filter change that reshuffles the deck yields an empty
 * effective set — a fresh deck — without ever clearing storage.
 *
 * Shared-store pattern (snapshot + listeners + useSyncExternalStore) so swiping
 * in the open overlay re-filters the inline preview live, and a navigate-away /
 * navigate-back restores from localStorage. The pure `parseDeckProgress`,
 * `effectiveSeen`, and `deckDayStamp` are exported for DOM-free unit tests.
 */

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "sous-deck-progress-v1";

export interface DeckProgress {
  /** Local calendar day this set belongs to, YYYY-MM-DD. */
  date: string;
  /** Hash of the deck-determining inputs (filters / mode / pantry). */
  hash: string;
  /** Slugs of dishes already swiped today for this hash. */
  seen: string[];
}

export const EMPTY_DECK_PROGRESS: DeckProgress = {
  date: "",
  hash: "",
  seen: [],
};

/** Stable empty array so `effectiveSeen` returns a referentially-stable value
 *  on the no-match path (keeps the deck memo from recomputing every render). */
const EMPTY_SLUGS: string[] = [];

/** Local YYYY-MM-DD — the deck resets on the user's calendar day, not UTC. */
export function deckDayStamp(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

/** Pure parser — returns the empty progress for malformed/missing input. */
export function parseDeckProgress(raw: string | null): DeckProgress {
  if (!raw) return EMPTY_DECK_PROGRESS;
  try {
    const p = JSON.parse(raw) as Partial<DeckProgress>;
    return {
      date: typeof p.date === "string" ? p.date : "",
      hash: typeof p.hash === "string" ? p.hash : "",
      seen: Array.isArray(p.seen)
        ? p.seen.filter((s): s is string => typeof s === "string")
        : [],
    };
  } catch {
    return EMPTY_DECK_PROGRESS;
  }
}

/**
 * The seen slugs that still apply: only when the stored stamp matches today AND
 * the deck hash matches. A day rollover or a filter change yields the stable
 * empty array (a fresh deck) without needing to mutate storage.
 */
export function effectiveSeen(
  progress: DeckProgress,
  hash: string,
  day: string,
): string[] {
  return progress.date === day && progress.hash === hash
    ? progress.seen
    : EMPTY_SLUGS;
}

let snapshot: DeckProgress | undefined;
const listeners = new Set<() => void>();

function read(): DeckProgress {
  if (typeof window === "undefined") return EMPTY_DECK_PROGRESS;
  return parseDeckProgress(window.localStorage.getItem(STORAGE_KEY));
}
function getSnapshot(): DeckProgress {
  if (snapshot === undefined) snapshot = read();
  return snapshot;
}
function getServer(): DeckProgress {
  return EMPTY_DECK_PROGRESS;
}
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function commit(next: DeckProgress): void {
  snapshot = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // quota / unavailable — UX-acceptable in prototype
    }
  }
  listeners.forEach((l) => l());
}

/** Mark a dish swiped for the current day + deck hash (idempotent). Switching
 *  day or hash starts a fresh set, so stale slugs never leak across decks. */
export function markDeckSeen(hash: string, slug: string): void {
  const day = deckDayStamp();
  const cur = getSnapshot();
  const fresh = cur.date === day && cur.hash === hash;
  const prevSeen = fresh ? cur.seen : EMPTY_SLUGS;
  if (fresh && prevSeen.includes(slug)) return; // already recorded
  commit({ date: day, hash, seen: [...prevSeen, slug] });
}

/** Clear deck progress for the current day + hash (the overlay "start over"). */
export function resetDeckSeen(hash: string): void {
  commit({ date: deckDayStamp(), hash, seen: [] });
}

export interface DeckProgressApi {
  /** Referentially-stable until a swipe/reset changes the underlying set. */
  seen: Set<string>;
  markSeen: (slug: string) => void;
  reset: () => void;
}

/** Reactive deck-progress reader, scoped to a deck `hash`. */
export function useDeckProgress(hash: string): DeckProgressApi {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServer);
  const day = deckDayStamp();
  const seenArr = effectiveSeen(progress, hash, day);
  const seen = useMemo(() => new Set(seenArr), [seenArr]);
  const markSeen = useCallback(
    (slug: string) => markDeckSeen(hash, slug),
    [hash],
  );
  const reset = useCallback(() => resetDeckSeen(hash), [hash]);
  return { seen, markSeen, reset };
}

/** Test-only: reset the in-memory snapshot so each test reads fresh. */
export function __resetDeckProgressForTests(): void {
  snapshot = undefined;
  listeners.clear();
}
