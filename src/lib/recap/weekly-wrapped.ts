/**
 * Weekly Wrapped (#8) — this week's cooking + nutrition story, built from the
 * SAME sources every other surface reads (cook sessions + the diary store), so
 * the recap can never disagree with the rings. Pure + deterministic.
 */

import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import {
  aggregateDay,
  dayKey,
  type DiaryEntry,
} from "@/lib/hooks/use-nutrition-diary";

type DiaryStore = Record<string, DiaryEntry[]>;

export interface WeeklyWrapped {
  cooks: number;
  distinctDishes: number;
  topCuisine: string | null;
  loggedDays: number;
  avgKcal: number | null;
  bestProteinDay: { day: string; protein_g: number } | null;
}

export function buildWeeklyWrapped(input: {
  sessions: ReadonlyArray<CookSessionRecord>;
  diary: DiaryStore;
  now?: Date;
}): WeeklyWrapped | null {
  const now = input.now ?? new Date();
  const weekKeys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    weekKeys.push(dayKey(d));
  }
  const weekSet = new Set(weekKeys);

  // Cooking side — completed sessions inside the window.
  const weekSessions = input.sessions.filter(
    (s) => s.completedAt && weekSet.has(dayKey(new Date(s.completedAt))),
  );
  const cuisineCount = new Map<string, { n: number; label: string }>();
  const dishes = new Set<string>();
  for (const s of weekSessions) {
    dishes.add(s.dishName.toLowerCase());
    const key = (s.cuisineFamily ?? "").trim().toLowerCase();
    if (!key) continue;
    const cur = cuisineCount.get(key);
    if (cur) cur.n += 1;
    else cuisineCount.set(key, { n: 1, label: s.cuisineFamily! });
  }
  const topCuisine =
    [...cuisineCount.values()].sort((a, b) => b.n - a.n)[0]?.label ?? null;

  // Nutrition side — per-day aggregates from the diary.
  let loggedDays = 0;
  let kcalSum = 0;
  let kcalDays = 0;
  let bestProteinDay: WeeklyWrapped["bestProteinDay"] = null;
  for (const key of weekKeys) {
    const entries = input.diary[key] ?? [];
    if (entries.length === 0) continue;
    loggedDays++;
    const n = aggregateDay(entries);
    if (!n) continue;
    if (typeof n.calories === "number") {
      kcalSum += n.calories;
      kcalDays++;
    }
    const protein = n.protein_g ?? 0;
    if (
      protein > 0 &&
      (!bestProteinDay || protein > bestProteinDay.protein_g)
    ) {
      bestProteinDay = { day: key, protein_g: Math.round(protein) };
    }
  }

  if (weekSessions.length === 0 && loggedDays === 0) return null;
  return {
    cooks: weekSessions.length,
    distinctDishes: dishes.size,
    topCuisine,
    loggedDays,
    avgKcal: kcalDays > 0 ? Math.round(kcalSum / kcalDays) : null,
    bestProteinDay,
  };
}
