"use client";

/**
 * Streak freeze (#10) — the Duolingo retention staple, earned not given:
 * each rolling week (7-day block, last 4 weeks) with ≥5 logged days earns one
 * freeze, capped at 2 banked. Using one marks a missed day as FROZEN: the
 * streak walk BRIDGES it (the chain survives) but the frozen day does not
 * count as a logged day — streaks stay honest.
 */

import { useSyncExternalStore } from "react";
import { dayKey, type DiaryEntry } from "@/lib/hooks/use-nutrition-diary";

type DiaryStore = Record<string, DiaryEntry[]>;

const KEY = "sous-streak-freezes-v1";

interface FreezeState {
  /** dayKeys the user has spent a freeze on. */
  used: string[];
}

let snapshot: FreezeState | undefined;
const listeners = new Set<() => void>();
const EMPTY: FreezeState = { used: [] };

function getSnapshot(): FreezeState {
  if (snapshot === undefined) {
    try {
      const raw = window.localStorage.getItem(KEY);
      snapshot = raw ? (JSON.parse(raw) as FreezeState) : EMPTY;
    } catch {
      snapshot = EMPTY;
    }
  }
  return snapshot;
}
const getServerSnapshot = () => EMPTY;
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function spendFreezeOn(day: string): void {
  const prev = getSnapshot();
  if (prev.used.includes(day)) return;
  snapshot = { used: [...prev.used, day] };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    // privacy mode — session-only
  }
  listeners.forEach((l) => l());
}

// ── Pure helpers (unit-tested) ───────────────────────────────────────────────

/** Rolling 7-day blocks back from today: how many of the last `weeksBack`
 *  blocks had ≥5 logged days. */
export function weeksWithFiveLogs(
  store: DiaryStore,
  now: Date,
  weeksBack = 4,
): number {
  let earned = 0;
  for (let w = 0; w < weeksBack; w++) {
    let logged = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - (w * 7 + i));
      if ((store[dayKey(d)]?.length ?? 0) > 0) logged++;
    }
    if (logged >= 5) earned++;
  }
  return earned;
}

/** Freezes in the bank: earned (cap 2) minus those spent in the last 28 days. */
export function availableFreezes(
  store: DiaryStore,
  used: ReadonlyArray<string>,
  now: Date,
): number {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 28);
  const cutoffKey = dayKey(cutoff);
  const spentRecently = used.filter((d) => d >= cutoffKey).length;
  return Math.max(
    0,
    Math.min(2, weeksWithFiveLogs(store, now)) - spentRecently,
  );
}

/** The logging streak with frozen days BRIDGED (chain survives) but not
 *  counted. Mirrors loggingStreak's "an unlogged today doesn't break it". */
export function loggingStreakWithFreezes(
  store: DiaryStore,
  used: ReadonlyArray<string>,
  today: Date,
): number {
  const frozen = new Set(used);
  const d = new Date(today);
  const hasToday = (store[dayKey(d)]?.length ?? 0) > 0;
  if (!hasToday) d.setDate(d.getDate() - 1);
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const k = dayKey(d);
    if ((store[k]?.length ?? 0) > 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (frozen.has(k)) {
      // bridged, not counted
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

export function useStreakFreezes(): {
  used: string[];
  spendFreezeOn: (day: string) => void;
} {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { used: state.used, spendFreezeOn };
}
