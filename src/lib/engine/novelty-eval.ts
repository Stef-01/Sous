/**
 * Novelty engine synthetic eval harness (Y3 W20).
 *
 * Mirrors the Y2 W9 V3 eval: deterministic synthetic cohort
 * + threshold-sensitivity sweep. Lets us tune the W8 engine's
 * NOVELTY_FIRE_THRESHOLD against simulated user behaviour
 * before running A/B tests on real cohorts.
 *
 * Outputs:
 *   - Per-threshold fire rate (0..1)
 *   - Per-threshold dedup rate (within 30-day cool-down)
 *   - Composite "useful surface" rate = fired AND not duplicate
 *
 * Pure / dependency-free / deterministic. Caller seeds the RNG
 * for reproducibility.
 */

import { NOVELTY_FIRE_THRESHOLD, generateDailyNovelty } from "./novelty";

export interface SyntheticUser {
  id: string;
  /** Pantry size + churn drives how many candidate combos
   *  the engine sees. */
  pantry: ReadonlyArray<string>;
  /** Recent cook history — drives the familiarity discount. */
  recentCookSlugs: ReadonlyArray<string>;
}

export interface NoveltyEvalResult {
  threshold: number;
  /** Total user-days simulated. */
  userDays: number;
  /** Days the chip fired (passed threshold + cool-down). */
  fired: number;
  /** Days the chip was suppressed by cool-down on a re-emit. */
  suppressed: number;
  /** Days no candidate scored above threshold. */
  silent: number;
  /** Composite: 'useful surface' rate per user-day. */
  fireRate: number;
}

/** Pure: simple seeded RNG (LCG) for reproducible cohort
 *  generation. */
function lcgSeed(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const PANTRY_POOL: ReadonlyArray<string> = [
  "ham",
  "prosciutto",
  "sharp cheese",
  "cheddar",
  "manchego",
  "pear",
  "apple",
  "fig",
  "tomato",
  "mozzarella",
  "basil",
  "chickpeas",
  "lemon",
  "olive oil",
  "eggs",
  "spinach",
  "feta",
  "greek yogurt",
  "cucumber",
  "dill",
  "bread",
  "avocado",
  "spaghetti",
  "garlic",
  "rice",
  "soy sauce",
  "pita",
  "hummus",
  "oats",
  "banana",
  "honey",
  "lentils",
  "parsley",
  "chicken meat",
  "tortilla",
  "lettuce",
  "sweet potato",
  "black beans",
  "lime",
  "tuna",
  "white beans",
  "red onion",
  "pesto",
  "parmesan",
  "butter",
];

/** Pure: generate a synthetic cohort. Seeded for reproducibility. */
export function generateSyntheticCohort(opts: {
  userCount: number;
  seed: number;
}): SyntheticUser[] {
  const rng = lcgSeed(opts.seed);
  const users: SyntheticUser[] = [];
  for (let i = 0; i < opts.userCount; i++) {
    const pantrySize = 6 + Math.floor(rng() * 10); // 6-15 items
    const pantrySet = new Set<string>();
    while (pantrySet.size < pantrySize) {
      const idx = Math.floor(rng() * PANTRY_POOL.length);
      const item = PANTRY_POOL[idx];
      if (item) pantrySet.add(item);
    }
    const cookCount = Math.floor(rng() * 5); // 0-4 recent cooks
    const recent: string[] = [];
    for (let c = 0; c < cookCount; c++) {
      const idx = Math.floor(rng() * PANTRY_POOL.length);
      const item = PANTRY_POOL[idx];
      if (item) recent.push(item);
    }
    users.push({
      id: `user-${i}`,
      pantry: Array.from(pantrySet),
      recentCookSlugs: recent,
    });
  }
  return users;
}

/** Pure: simulate one user-day. Returns 'fired' / 'suppressed'
 *  / 'silent' based on whether the engine surfaced a result
 *  AND its score crossed the threshold. */
function simulateUserDay(
  user: SyntheticUser,
  threshold: number,
  recentSuggestionIds: ReadonlyArray<{ id: string; surfacedAt: string }>,
  now: Date,
): { outcome: "fired" | "suppressed" | "silent"; suggestedId: string | null } {
  const result = generateDailyNovelty({
    pantry: user.pantry,
    recentCookIngredientSets: user.recentCookSlugs.map((s) => [s]),
    recentSuggestionIds,
    now,
  });
  if (!result) return { outcome: "silent", suggestedId: null };
  if (result.noveltyScore < threshold) {
    return { outcome: "silent", suggestedId: result.id };
  }
  return { outcome: "fired", suggestedId: result.id };
}

/** Pure: run the eval at a single threshold over the given
 *  cohort + user-day count. */
export function runNoveltyEval(opts: {
  cohort: ReadonlyArray<SyntheticUser>;
  threshold: number;
  daysPerUser: number;
  startDate: Date;
}): NoveltyEvalResult {
  let fired = 0;
  let suppressed = 0;
  let silent = 0;

  for (const user of opts.cohort) {
    const recentIds: { id: string; surfacedAt: string }[] = [];
    for (let d = 0; d < opts.daysPerUser; d++) {
      const day = new Date(opts.startDate.getTime() + d * 24 * 60 * 60 * 1000);
      const { outcome, suggestedId } = simulateUserDay(
        user,
        opts.threshold,
        recentIds,
        day,
      );
      if (outcome === "fired") {
        fired += 1;
        if (suggestedId) {
          recentIds.push({ id: suggestedId, surfacedAt: day.toISOString() });
        }
      } else if (outcome === "suppressed") {
        suppressed += 1;
      } else {
        silent += 1;
      }
    }
  }

  const userDays = opts.cohort.length * opts.daysPerUser;
  return {
    threshold: opts.threshold,
    userDays,
    fired,
    suppressed,
    silent,
    fireRate: userDays === 0 ? 0 : fired / userDays,
  };
}

/** Pure: sweep a range of thresholds + return per-threshold
 *  results. Sorted ascending by threshold. */
export function thresholdSensitivitySweep(opts: {
  cohort: ReadonlyArray<SyntheticUser>;
  thresholds: ReadonlyArray<number>;
  daysPerUser: number;
  startDate: Date;
}): NoveltyEvalResult[] {
  const results: NoveltyEvalResult[] = [];
  for (const t of opts.thresholds) {
    results.push(
      runNoveltyEval({
        cohort: opts.cohort,
        threshold: t,
        daysPerUser: opts.daysPerUser,
        startDate: opts.startDate,
      }),
    );
  }
  return results.sort((a, b) => a.threshold - b.threshold);
}

/** Default thresholds the W20 sweep evaluates. */
export const DEFAULT_THRESHOLD_SWEEP: ReadonlyArray<number> = [
  0.5,
  0.55,
  0.6,
  NOVELTY_FIRE_THRESHOLD,
  0.7,
  0.75,
  0.8,
];
