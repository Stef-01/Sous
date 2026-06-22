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
  /** Exact amount vs target for the drill-down (energy/protein/hydration/fiber). */
  detail?: { value: number; target: number; unit: "kcal" | "g" | "glass" };
}

export interface DogeHealthPayload {
  stats: DogeHealthStat[];
  status: string;
  /** The mood enum itself, so the game can key a native "thriving" celebration
   *  off the exact state instead of string-matching the status copy. */
  mood: PetMood;
  /** Deduped dish names eaten today (newest first) — the HUD's recent activity. */
  meals: string[];
  /** Same recent activity, each with a pre-formatted local log time ("8:30a"), so
   *  the game renders a timestamped feed without doing any date math itself. */
  recentMeals: { name: string; time: string }[];
  updatedAt: number;
}

/** Map the computed health into the game-side payload (pure, testable). */
export function buildDogeHealthPayload(
  stats: PetHealthStat[],
  mood: PetMood,
  now: number,
  meals: string[] = [],
  recentMeals: { name: string; time: string }[] = [],
): DogeHealthPayload {
  return {
    stats: stats.map((s) => ({
      label: s.label,
      pct: s.pct,
      fa: FA[s.key],
      ...(s.detail ? { detail: s.detail } : {}),
    })),
    status: STATUS[mood],
    mood,
    meals,
    recentMeals,
    updatedAt: now,
  };
}

/** First-person line the dog says about your nutrition when the game opens —
 *  ties the real nutrition to the pet's voice (uses the proven doge:say verb). */
const GREETING: Record<PetMood, string> = {
  asleep: "Log a meal in Sous and I'll perk right up!",
  hungry: "I'm hungry — let's cook something good today.",
  peckish: "I'm a bit peckish — a few nutrient gaps to fill.",
  content: "I'm content — you've been eating well!",
  thriving: "I'm thriving — your cooking's been great lately!",
};

export function moodGreeting(mood: PetMood): string {
  return GREETING[mood];
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
