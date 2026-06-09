"use client";

/**
 * useNutritionDiary — a localStorage-backed day log of cooked servings, and the
 * aggregated nutrition for a day (the sum of each entry's composed per-serving
 * vector × its servings). Powers the Path "Today's nutrition" card + the
 * deficit insight. Same hydration-guard pattern as useShoppingList / pantry.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
}

const KEY = "sous-nutrition-diary-v1";
const MAX_DAYS = 90;
/** Stable empty reference so `dayNutrition`'s memo doesn't thrash each render. */
const EMPTY_ENTRIES: DiaryEntry[] = [];

/** YYYY-MM-DD for a Date (local). */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

type Store = Record<string, DiaryEntry[]>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    // Keep only the most recent MAX_DAYS keys.
    const keys = Object.keys(store).sort().slice(-MAX_DAYS);
    const trimmed: Store = {};
    for (const k of keys) trimmed[k] = store[k];
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // ignore quota / privacy mode
  }
}

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
 *  and any streak threshold just crossed. The effect owns the localStorage dedup +
 *  toast; keeping the decision pure makes "did I just earn this?" testable. */
export function milestonesForLog(store: DiaryStore, today: Date): Milestone[] {
  const lifetime = Object.values(store).reduce((n, day) => n + day.length, 0);
  const streak = loggingStreak(store, today);
  return [firstMilestone("log", lifetime), streakMilestone(streak)].filter(
    (m): m is Milestone => m != null,
  );
}

export function useNutritionDiary(date = new Date()) {
  const [store, setStore] = useState<Store>({});
  const [mounted, setMounted] = useState(false);
  // R4 — a celebration fires only for a user log/branded action, never a
  // mount/hydrate or a remove/restore. logCook/logBranded set this; the effect
  // reads + clears it, with localStorage as the single once-only dedup source.
  const justLoggedRef = useRef(false);

  useEffect(() => {
    setStore(read());
    setMounted(true);
  }, []);

  // The single celebration authority (Phase 3): when the user logs, fire the
  // first-log + streak milestones at the MOMENT of the tap. Pure-compute here,
  // deduped in localStorage, idempotent under StrictMode (justLogged gate clears
  // on the first invoke so the second invoke is a no-op).
  useEffect(() => {
    if (!justLoggedRef.current) return;
    justLoggedRef.current = false;
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
  }, [store]);

  // "Today" is recomputed each render (not frozen at mount), so the diary stays
  // in sync with the real calendar day if the app is left open across midnight.
  const todayKey = dayKey(date);

  // Writes stamp the LIVE day at call time, so a cook logged just after local
  // midnight lands in the new day regardless of the last render's key.
  const logCook = useCallback(
    (slug: string, name: string, servings: number) => {
      justLoggedRef.current = true;
      const key = dayKey(new Date());
      setStore((prev) => {
        const day = prev[key] ?? [];
        const next: Store = {
          ...prev,
          [key]: [
            ...day,
            { slug, name, servings, at: new Date().toISOString() },
          ],
        };
        write(next);
        return next;
      });
    },
    [],
  );

  // Branded foods (W20) carry their own nutrition (not in the registry).
  const logBranded = useCallback((food: BrandedFood, servings: number) => {
    justLoggedRef.current = true;
    const key = dayKey(new Date());
    setStore((prev) => {
      const day = prev[key] ?? [];
      const next: Store = {
        ...prev,
        [key]: [
          ...day,
          {
            slug: `off:${food.barcode}`,
            name: food.name,
            brand: food.brand ?? undefined,
            servings,
            at: new Date().toISOString(),
            nutrition: food.nutrition,
          },
        ],
      };
      write(next);
      return next;
    });
  }, []);

  const removeEntry = useCallback((at: string) => {
    const key = dayKey(new Date());
    setStore((prev) => {
      const day = (prev[key] ?? []).filter((e) => e.at !== at);
      const next = { ...prev, [key]: day };
      write(next);
      return next;
    });
  }, []);

  // W25 — undo: re-insert a removed entry exactly (preserves branded nutrition).
  const restoreEntry = useCallback((entry: DiaryEntry) => {
    const key = dayKey(new Date());
    setStore((prev) => {
      const day = prev[key] ?? [];
      if (day.some((e) => e.at === entry.at)) return prev;
      const next = { ...prev, [key]: [...day, entry] };
      write(next);
      return next;
    });
  }, []);

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
    mounted,
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
 * trend (which nutrients are persistently short). Read-only; same hydration
 * guard as the diary hook.
 */
export function useNutritionWeek(): { mounted: boolean } & WeeklyTrend {
  const [store, setStore] = useState<Store>({});
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage on mount */
  useEffect(() => {
    setStore(read());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

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

  return { mounted, ...result };
}

/**
 * useDiaryHistory (W8/W15) — read-only access to the whole diary store for the
 * logging streak + the quick-add recents. Same hydration guard as the others.
 */
export function useDiaryHistory() {
  const [store, setStore] = useState<Store>({});
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage on mount */
  useEffect(() => {
    setStore(read());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const streak = useMemo(() => loggingStreak(store, new Date()), [store]);
  const recents = useMemo(() => recentDistinctDishes(store, 6), [store]);
  return { mounted, streak, recents };
}
