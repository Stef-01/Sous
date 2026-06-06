"use client";

/**
 * useNutritionDiary — a localStorage-backed day log of cooked servings, and the
 * aggregated nutrition for a day (the sum of each entry's composed per-serving
 * vector × its servings). Powers the Path "Today's nutrition" card + the
 * deficit insight. Same hydration-guard pattern as useShoppingList / pantry.
 */

import { useCallback, useEffect, useState } from "react";
import type { PerServingNutrition } from "@/types/nutrition";
import { getDishNutrition } from "@/lib/engine/dish-nutrition";
import { NUTRIENT_DISPLAY } from "@/data/nutrition/nutrient-display";

export interface DiaryEntry {
  slug: string;
  name: string;
  servings: number;
  at: string;
}

const KEY = "sous-nutrition-diary-v1";
const MAX_DAYS = 90;

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
    const { perServing, massedCoverage } = getDishNutrition(e.slug);
    if (!perServing || massedCoverage < 0.7) continue;
    any = true;
    for (const k of keys) {
      const v = (perServing[k] as number | undefined) ?? 0;
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

export function useNutritionDiary(date = new Date()) {
  const [todayKey] = useState(() => dayKey(date));
  const [store, setStore] = useState<Store>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStore(read());
    setMounted(true);
  }, []);

  const logCook = useCallback(
    (slug: string, name: string, servings: number) => {
      setStore((prev) => {
        const day = prev[todayKey] ?? [];
        const next: Store = {
          ...prev,
          [todayKey]: [
            ...day,
            { slug, name, servings, at: new Date().toISOString() },
          ],
        };
        write(next);
        return next;
      });
    },
    [todayKey],
  );

  const removeEntry = useCallback(
    (at: string) => {
      setStore((prev) => {
        const day = (prev[todayKey] ?? []).filter((e) => e.at !== at);
        const next = { ...prev, [todayKey]: day };
        write(next);
        return next;
      });
    },
    [todayKey],
  );

  const entries = store[todayKey] ?? [];
  return {
    mounted,
    todayKey,
    entries,
    logCook,
    removeEntry,
    dayNutrition: aggregateDay(entries),
  };
}
