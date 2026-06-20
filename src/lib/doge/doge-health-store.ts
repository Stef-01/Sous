/**
 * doge-health-store — the bridge for the nutrition system to live NATIVELY inside
 * the Tamaweb game. The iframe is same-origin, so Sous writes the computed health
 * to a shared localStorage key and the game reads it directly in App.handlers
 * .open_stats (rendering a real Nutrition tab with the game's own createProgressbar
 * — see public/tamaweb/src/App.js). No postMessage timing; the game always reads
 * the latest when the stats screen opens.
 *
 * Pure payload builder (tested) + a thin writer. See DOGE-PET-DASHBOARD-PLAN.md.
 */
import type { PetHealthStat } from "@/lib/nutrition/pet-screen-data";
import type { PetMood } from "@/lib/nutrition/pet-state";

export const DOGE_HEALTH_KEY = "sous-doge-health-v1";

/** FontAwesome icon name per stat — rendered by the game's getIcon(fa, true). */
const FA: Record<PetHealthStat["key"], string> = {
  energy: "bolt",
  mood: "heart",
  hydration: "droplet",
  protein: "drumstick-bite",
  fiber: "leaf",
  vitamins: "shield-halved",
};

const STATUS: Record<PetMood, string> = {
  asleep: "Dobe's napping — log a meal to wake him.",
  hungry: "Dobe's hungry — feed him well today.",
  peckish: "Dobe's peckish — a few gaps to fill.",
  content: "Dobe's content — nicely fed.",
  thriving: "Great job! Dobe is thriving!",
};

export interface DogeHealthStat {
  label: string;
  pct: number;
  /** FontAwesome icon name for the game's getIcon. */
  fa: string;
}

export interface DogeHealthPayload {
  stats: DogeHealthStat[];
  status: string;
  updatedAt: number;
}

/** Map the computed health into the game-side payload (pure, testable). */
export function buildDogeHealthPayload(
  stats: PetHealthStat[],
  mood: PetMood,
  now: number,
): DogeHealthPayload {
  return {
    stats: stats.map((s) => ({ label: s.label, pct: s.pct, fa: FA[s.key] })),
    status: STATUS[mood],
    updatedAt: now,
  };
}

/** Persist the payload to the shared key the game reads. */
export function writeDogeHealth(payload: DogeHealthPayload): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DOGE_HEALTH_KEY, JSON.stringify(payload));
  } catch {
    /* quota / disabled — best effort */
  }
}
