/**
 * Pet state — the Tamagotchi Easter egg's brain. Pure mapping from the SAME
 * stores every other nutrition surface reads (today's aggregate, personal
 * targets, deficits, streak) to a mood + hearts + needs. Nothing here is a
 * separate game economy: the pet IS your day, so eating a food that closes a
 * real deficit is what makes it feel better.
 */

import type { DeficitItem } from "@/lib/nutrition/deficits";

export type PetMood = "asleep" | "hungry" | "peckish" | "content" | "thriving";

export interface PetInputs {
  /** Anything logged today (entry count, not coverage-gated). */
  loggedCount: number;
  /** Today's kcal vs target (null when nothing massed). */
  kcal: number | null;
  targetKcal: number;
  /** Today's protein grams vs target. */
  protein: number | null;
  targetProtein: number;
  /** Flaggable nutrients still under target (most-deficient first). */
  deficits: ReadonlyArray<DeficitItem>;
  /** Logging streak (freeze-bridged). */
  streak: number;
}

export interface PetState {
  mood: PetMood;
  /** 0..5 — the classic hearts row. */
  hearts: number;
  /** 0..1 fill levels for the two stat bars. */
  fullness: number;
  strength: number;
  /** The pet's current craving — the user's top real deficit (null = none). */
  need: DeficitItem | null;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function computePetState(i: PetInputs): PetState {
  const fullness = i.kcal === null ? 0 : clamp01(i.kcal / i.targetKcal);
  const strength =
    i.protein === null ? 0 : clamp01(i.protein / i.targetProtein);
  const inBand =
    i.kcal !== null &&
    i.kcal >= 0.85 * i.targetKcal &&
    i.kcal <= 1.15 * i.targetKcal;

  // Hearts: each is a real, distinct achievement for the day.
  const hearts = [
    i.loggedCount > 0, // showed up
    fullness >= 0.5, // half fuelled
    inBand, // landed the kcal band
    strength >= 0.8, // protein near target
    i.streak >= 3, // momentum
  ].filter(Boolean).length;

  const mood: PetMood =
    i.loggedCount === 0
      ? "asleep"
      : hearts <= 1
        ? "hungry"
        : hearts <= 3
          ? "peckish"
          : hearts === 4
            ? "content"
            : "thriving";

  return { mood, hearts, fullness, strength, need: i.deficits[0] ?? null };
}
