import Fuse from "fuse.js";
import { meals } from "@/data";
import type { Meal } from "@/types";
import { normalizeInput } from "./normalize";

const fuse = new Fuse(meals, {
  keys: [
    { name: "name", weight: 2 },
    { name: "aliases", weight: 1.5 },
    { name: "cuisine", weight: 0.5 },
  ],
  threshold: 0.4,
  distance: 100,
  includeScore: true,
});

const verifiedFuse = new Fuse(
  meals.filter((m) => m.nourishVerified),
  {
    keys: [
      { name: "name", weight: 2 },
      { name: "aliases", weight: 1.5 },
      { name: "cuisine", weight: 0.5 },
    ],
    threshold: 0.4,
    distance: 100,
    includeScore: true,
  },
);

export function searchMeal(query: string, verifiedOnly = false): Meal | null {
  const normalized = normalizeInput(query);
  if (!normalized) return null;

  const instance = verifiedOnly ? verifiedFuse : fuse;
  const results = instance.search(normalized);
  if (results.length === 0) return null;

  return results[0].item;
}

export function searchMeals(
  query: string,
  limit: number = 4,
  verifiedOnly = false,
): Meal[] {
  const normalized = normalizeInput(query);
  if (!normalized) return [];

  const instance = verifiedOnly ? verifiedFuse : fuse;
  return instance.search(normalized, { limit }).map((r) => r.item);
}

/**
 * Deterministic suggestion list. Previously this used a biased Fisher-Yates
 * substitute (`sort(() => Math.random() - 0.5)`), which was non-deterministic
 * AND statistically biased. We now rotate a day-of-year window over the pool,
 * so suggestions vary day-over-day but stay stable within a session (and in
 * tests). See AUDIT-2026-04-17 P1-9.
 */
export function getSuggestions(
  count: number = 6,
  verifiedOnly = false,
): string[] {
  const pool = verifiedOnly ? meals.filter((m) => m.nourishVerified) : meals;
  if (pool.length === 0) return [];
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  const offset = dayOfYear % pool.length;
  const out: string[] = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    out.push(pool[(offset + i) % pool.length].name);
  }
  return out;
}
