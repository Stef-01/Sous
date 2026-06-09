"use client";

/**
 * The nutrition diary — ONE shared reactive store (module state +
 * useSyncExternalStore, the same pattern as useHealthLens) backed by
 * localStorage.
 *
 * STABILITY REFACTOR: previously every useNutritionDiary() call held its own
 * useState copy of localStorage, so logging in one component left every other
 * mounted surface stale until remount. Now all surfaces (Nutrition tab, Today's
 * plate card, LogItButton's "already logged", the win screen's auto-log line)
 * subscribe to one store and update together. Module-level actions
 * (diaryLogCook & co) are callable from plain handlers — e.g. the guided-cook
 * completion block — without mounting a hook.
 *
 * Celebrations (first-log + streak milestones) fire INSIDE the log actions at
 * the moment of the tap (R4): actions run once per user event, so no
 * StrictMode double-fire risk; localStorage remains the once-only dedup.
 */

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { PerServingNutrition } from "@/types/nutrition";
import {
  getDishNutrition,
  NUTRITION_COVERAGE_FLOOR,
} from "@/lib/engine/dish-nutrition";
import { NUTRIENT_DISPLAY } from "@/data/nutrition/nutrient-display";
import {
  computeWeeklyTrend,
  type WeeklyTrend,
} from "@/lib/nutrition/weekly-trend";
import type { BrandedFood } from "@/lib/nutrition/branded-food";
import {
  firstMilestone,
  streakMilestone,
  type Milestone,
} from "@/lib/engagement/milestones";
import { toast } from "@/lib/hooks/use-toast";

export interface DiaryEntry {
  slug: string;
  name: string;
  servings: number;
  at: string;
  /** Branded foods (W20): a brand label + embedded nutrition, since they're not
   *  in the ingredient registry. When present, aggregateDay uses it directly. */
  brand?: string;
  nutrition?: PerServingNutrition;
  /** True when the entry was written automatically on cook completion (so the
   *  win screen can offer a quiet undo and the diary can label it). */
  auto?: boolean;
}

const KEY = "sous-nutrition-diary-v1";
const MAX_DAYS = 90;
/** Stable empty reference so derived memos don't thrash each render. */
const EMPTY_ENTRIES: DiaryEntry[] = [];
const EMPTY_STORE: Store = {};

/** YYYY-MM-DD for a Date (local). */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

type Store = Record<string, DiaryEntry[]>;

// ── The shared module store ──────────────────────────────────────────────────

let snapshot: Store | null = null; // null = not yet hydrated from storage
const listeners = new Set<() => void>();

function readStorage(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_STORE;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Store)
      : EMPTY_STORE;
  } catch {
    return EMPTY_STORE;
  }
}

function getSnapshot(): Store {
  if (snapshot === null) snapshot = readStorage();
  return snapshot;
}

function getServerSnapshot(): Store {
  return EMPTY_STORE;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Persist (trimmed to MAX_DAYS), swap the snapshot, notify every subscriber. */
function commit(next: Store): void {
  const keys = Object.keys(next).sort().slice(-MAX_DAYS);
  const trimmed: Store = {};
  for (const k of keys) trimmed[k] = next[k];
  snapshot = trimmed;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // ignore quota / privacy mode — the in-memory store still updates
  }
  listeners.forEach((l) => l());
}

// ── Pure helpers (unchanged APIs — unit-tested) ──────────────────────────────

/** Aggregate a day's entries into one summed nutrition vector (totals, scaled
 *  by each entry's servings). Returns null when nothing resolves. */
export function aggregateDay(
  entries: ReadonlyArray<DiaryEntry>,
): PerServingNutrition | null {
  const keys = Array.from(
    new Set<keyof PerServingNutrition>([
      "calories",
      ...NUTRIENT_DISPLAY.map((m) => m.key),
    ]),
  );
  const total: Record<string, number> = {};
  let any = false;
  for (const e of entries) {
    // Branded foods carry their own (partial) nutrition; cooked dishes resolve
    // from the registry, coverage-gated.
    let per: PerServingNutrition | null = e.nutrition ?? null;
    if (!per) {
      const { perServing, massedCoverage } = getDishNutrition(e.slug);
      if (perServing && massedCoverage >= NUTRITION_COVERAGE_FLOOR) {
        per = perServing;
      }
    }
    if (!per) continue;
    any = true;
    for (const k of keys) {
      const v = (per[k] as number | undefined) ?? 0;
      total[k] = (total[k] ?? 0) + v * e.servings;
    }
  }
  if (!any) return null;
  return {
    recipeSlug: "diary-day",
    servingsPerRecipe: 1,
    provenance: "usda-fdc",
    confidence: "approximated",
    ingestedAt: "",
    ...total,
  } as PerServingNutrition;
}

type DiaryStore = Record<string, DiaryEntry[]>;

/** W15 — consecutive days (ending today or yesterday) that have ≥1 entry. An
 *  un-logged today does NOT reset a live streak — you can still log later. */
export function loggingStreak(store: DiaryStore, today: Date): number {
  const d = new Date(today);
  const hasToday = (store[dayKey(d)]?.length ?? 0) > 0;
  if (!hasToday) d.setDate(d.getDate() - 1);
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    if ((store[dayKey(d)]?.length ?? 0) > 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

/** W8 — most-recent DISTINCT cooked dishes across history, newest first, for the
 *  quick-add tray (branded entries excluded — you re-cook dishes, not sodas). */
export function recentDistinctDishes(
  store: DiaryStore,
  limit = 6,
): { slug: string; name: string }[] {
  const byDayDesc = Object.keys(store).sort((a, b) => (a < b ? 1 : -1));
  const seen = new Set<string>();
  const out: { slug: string; name: string }[] = [];
  for (const day of byDayDesc) {
    const entries = [...(store[day] ?? [])].sort((a, b) =>
      a.at < b.at ? 1 : -1,
    );
    for (const e of entries) {
      if (e.brand || seen.has(e.slug)) continue;
      seen.add(e.slug);
      out.push({ slug: e.slug, name: e.name });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/** Pure (R4): the milestones a fresh log into `store` earns — the first-ever log
 *  and any streak threshold just crossed. The action owns the localStorage dedup +
 *  toast; keeping the decision pure makes "did I just earn this?" testable. */
export function milestonesForLog(store: DiaryStore, today: Date): Milestone[] {
  const lifetime = Object.values(store).reduce((n, day) => n + day.length, 0);
  const streak = loggingStreak(store, today);
  return [firstMilestone("log", lifetime), streakMilestone(streak)].filter(
    (m): m is Milestone => m != null,
  );
}

// ── Module-level actions (callable from any handler, hook not required) ──────

function celebrate(store: Store): void {
  for (const m of milestonesForLog(store, new Date())) {
    const seenKey = `sous-celebrated-${m.id}`;
    try {
      if (window.localStorage.getItem(seenKey)) continue;
      window.localStorage.setItem(seenKey, "1");
    } catch {
      continue;
    }
    toast.push({
      variant: "achievement",
      emoji: m.emoji,
      title: m.title,
      body: m.body,
    });
  }
}

/** Log a cooked dish (today, live clock). `auto` marks cook-completion logs. */
export function diaryLogCook(
  slug: string,
  name: string,
  servings: number,
  opts?: { auto?: boolean },
): void {
  const key = dayKey(new Date());
  const prev = getSnapshot();
  const entry: DiaryEntry = {
    slug,
    name,
    servings,
    at: new Date().toISOString(),
    ...(opts?.auto ? { auto: true } : {}),
  };
  const next: Store = { ...prev, [key]: [...(prev[key] ?? []), entry] };
  commit(next);
  celebrate(next);
}

/** Branded foods (W20) carry their own nutrition (not in the registry). */
export function diaryLogBranded(food: BrandedFood, servings: number): void {
  const key = dayKey(new Date());
  const prev = getSnapshot();
  const entry: DiaryEntry = {
    slug: `off:${food.barcode}`,
    name: food.name,
    brand: food.brand ?? undefined,
    servings,
    at: new Date().toISOString(),
    nutrition: food.nutrition,
  };
  const next: Store = { ...prev, [key]: [...(prev[key] ?? []), entry] };
  commit(next);
  celebrate(next);
}

export function diaryRemoveEntry(at: string): void {
  const key = dayKey(new Date());
  const prev = getSnapshot();
  const next: Store = {
    ...prev,
    [key]: (prev[key] ?? []).filter((e) => e.at !== at),
  };
  commit(next);
}

/** W25 — undo: re-insert a removed entry exactly (preserves branded nutrition). */
export function diaryRestoreEntry(entry: DiaryEntry): void {
  const key = dayKey(new Date());
  const prev = getSnapshot();
  const day = prev[key] ?? [];
  if (day.some((e) => e.at === entry.at)) return;
  commit({ ...prev, [key]: [...day, entry] });
}

/** Subscribe-free read for non-React callers (e.g. the win screen's undo). */
export function diaryTodayEntries(): DiaryEntry[] {
  return getSnapshot()[dayKey(new Date())] ?? EMPTY_ENTRIES;
}

// ── Hooks (unchanged return shapes) ──────────────────────────────────────────

export function useNutritionDiary(date = new Date()) {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // "Today" is recomputed each render (not frozen at mount), so the diary stays
  // in sync with the real calendar day if the app is left open across midnight.
  const todayKey = dayKey(date);

  const logCook = useCallback(
    (slug: string, name: string, servings: number) =>
      diaryLogCook(slug, name, servings),
    [],
  );
  const logBranded = useCallback(
    (food: BrandedFood, servings: number) => diaryLogBranded(food, servings),
    [],
  );
  const removeEntry = useCallback((at: string) => diaryRemoveEntry(at), []);
  const restoreEntry = useCallback(
    (entry: DiaryEntry) => diaryRestoreEntry(entry),
    [],
  );

  const entries = store[todayKey] ?? EMPTY_ENTRIES;
  const dayNutrition = useMemo(() => aggregateDay(entries), [entries]);
  // Gap signals (deficit insight + weekly trend + the deficiency reranker) use
  // COOKED dishes only. Branded foods report macros but rarely micros, so their
  // honest zeros would otherwise fabricate micronutrient deficits (a logged soda
  // would make the engine think you're short on iron). They still count in the
  // day-total ring (dayNutrition) — just not in "what your cooking is missing".
  const cookedDayNutrition = useMemo(
    () => aggregateDay(entries.filter((e) => !e.nutrition)),
    [entries],
  );
  return {
    // useSyncExternalStore hydrates safely (server snapshot first, then the
    // real store immediately after mount) — kept for caller API compatibility.
    mounted: true,
    todayKey,
    entries,
    logCook,
    logBranded,
    removeEntry,
    restoreEntry,
    dayNutrition,
    cookedDayNutrition,
  };
}

/**
 * useNutritionWeek — the last 7 days of the diary rolled into a per-nutrient
 * trend (which nutrients are persistently short). Read-only.
 */
export function useNutritionWeek(): { mounted: boolean } & WeeklyTrend {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const result = useMemo(() => {
    const now = new Date();
    const perDay: (PerServingNutrition | null)[] = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      // Cooked dishes only — branded foods' missing micros must not fabricate
      // a "short" day in the trend (see cookedDayNutrition above).
      const cooked = (store[dayKey(d)] ?? EMPTY_ENTRIES).filter(
        (e) => !e.nutrition,
      );
      perDay.push(aggregateDay(cooked));
    }
    return computeWeeklyTrend(perDay);
  }, [store]);

  return { mounted: true, ...result };
}

/**
 * useDiaryHistory (W8/W15) — read-only access to the whole diary store for the
 * logging streak + the quick-add recents.
 */
export function useDiaryHistory() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const streak = useMemo(() => loggingStreak(store, new Date()), [store]);
  const recents = useMemo(() => recentDistinctDishes(store, 6), [store]);
  return { mounted: true, streak, recents };
}
