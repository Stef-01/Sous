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
  }
);

export function searchMeal(query: string, verifiedOnly = false): Meal | null {
  const normalized = normalizeInput(query);
  if (!normalized) return null;

  const instance = verifiedOnly ? verifiedFuse : fuse;
  const results = instance.search(normalized);
  if (results.length === 0) return null;

  return results[0].item;
}

export function searchMeals(query: string, limit: number = 4, verifiedOnly = false): Meal[] {
  const normalized = normalizeInput(query);
  if (!normalized) return [];

  const instance = verifiedOnly ? verifiedFuse : fuse;
  return instance
    .search(normalized, { limit })
    .map((r) => r.item);
}

export function getSuggestions(count: number = 6, verifiedOnly = false): string[] {
  const pool = verifiedOnly ? meals.filter((m) => m.nourishVerified) : meals;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((m) => m.name);
}
