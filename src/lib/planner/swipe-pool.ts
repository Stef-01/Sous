/**
 * Swipe planner card pool generator (Y3 W25).
 *
 * Pure helper for the W26 swipe surface. Given the user's seed
 * catalog + drafts + big-batch successors, returns 8-12
 * candidate cards filtered by pantry coverage + dietary union
 * and ranked by (recency-fatigue + cuisine-rotation + ease-of-
 * prep) so the swipe presents fresh, feasible options.
 *
 * The 90-second swipe budget (W26 plan) requires a pre-
 * generated pool; per-card LLM calls are out of scope. The
 * pool stays cached per (pantry, weekKey) so re-entering the
 * planner doesn't regenerate.
 *
 * Pure / dependency-free / deterministic.
 */

import { computePantryCoverage } from "@/lib/engine/pantry-coverage";

export interface PoolCandidate {
  /** Recipe slug — referenced by the W23 MealPlanWeek scheduling. */
  recipeSlug: string;
  /** Display title for the card. */
  title: string;
  /** Cuisine family — drives the rotation score. */
  cuisineFamily: string;
  /** All ingredient names (required). */
  ingredients: ReadonlyArray<string>;
  /** Optional ingredient names (excluded from coverage math). */
  optionalIngredients?: ReadonlyArray<string>;
  /** Minutes from start to plate. */
  prepTimeMinutes: number;
  /** Dietary flags this recipe is compatible with. */
  dietaryFlags: ReadonlyArray<string>;
  /** Optional hero image URL — propagated through to the
   *  RecipeHeroCard render. */
  heroImageUrl?: string | null;
  /** Optional source tag for telemetry: 'seed' / 'draft' /
   *  'leftovers-successor'. */
  source?: "seed" | "draft" | "leftovers-successor";
}

export interface SwipeCard {
  recipeSlug: string;
  title: string;
  cuisineFamily: string;
  prepTimeMinutes: number;
  heroImageUrl: string | null;
  /** Pantry coverage at pool-generation time. Snapshot so the
   *  card render doesn't recompute on every paint. */
  pantryCoverage: number;
  /** Engine score that drove ranking — 0..1. */
  rankScore: number;
  /** Source tag. */
  source: "seed" | "draft" | "leftovers-successor";
}

/** Default pantry-coverage floor. Cards below this don't make
 *  the pool — the user shouldn't swipe through 12 options that
 *  all require a shopping trip. */
export const SWIPE_MIN_COVERAGE = 0.7;

/** Default pool size returned to the swipe surface. Enough
 *  for 7 right-swipes plus headroom for 5 skips. */
export const SWIPE_POOL_SIZE = 12;

/** Cuisine-rotation lookback in days. Recently-cooked cuisines
 *  get a per-cuisine penalty so the pool doesn't surface 7
 *  italian dishes in a row. */
export const CUISINE_ROTATION_LOOKBACK_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface SwipePoolInput {
  candidates: ReadonlyArray<PoolCandidate>;
  /** User's current pantry — ingredient names. */
  pantry: ReadonlyArray<string>;
  /** Household dietary union. Empty = no constraint. */
  dietaryUnion: ReadonlyArray<string>;
  /** Recent cook history with completion timestamps. */
  recentCooks: ReadonlyArray<{
    recipeSlug: string;
    cuisineFamily: string;
    completedAt: string;
  }>;
  /** Reference "now" for the recency math. */
  now: Date;
  /** Override pool size (default SWIPE_POOL_SIZE). */
  poolSize?: number;
  /** Override coverage floor (default SWIPE_MIN_COVERAGE). */
  minCoverage?: number;
}

/** Pure: 0..1 fatigue score for re-suggesting a recipe. 1.0
 *  when not cooked recently; drops sharply for recently-cooked
 *  slugs. Same-slug 7d ago → 0.2; 14d ago → 0.6. */
function recipeRecencyFatigue(
  slug: string,
  recentCooks: ReadonlyArray<{ recipeSlug: string; completedAt: string }>,
  now: Date,
): number {
  let mostRecentDays = Number.POSITIVE_INFINITY;
  for (const c of recentCooks) {
    if (c.recipeSlug !== slug) continue;
    const ts = new Date(c.completedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    const days = (now.getTime() - ts) / DAY_MS;
    if (days < mostRecentDays) mostRecentDays = days;
  }
  if (!Number.isFinite(mostRecentDays)) return 1;
  if (mostRecentDays < 0) return 1;
  if (mostRecentDays >= 30) return 1;
  if (mostRecentDays < 7) return 0.2;
  if (mostRecentDays < 14) return 0.6;
  return 0.85;
}

/** Pure: 0..1 cuisine-rotation score. Higher when this
 *  cuisine is under-represented in the lookback window. */
function cuisineRotationScore(
  cuisine: string,
  recentCooks: ReadonlyArray<{ cuisineFamily: string; completedAt: string }>,
  now: Date,
): number {
  const cutoff = now.getTime() - CUISINE_ROTATION_LOOKBACK_DAYS * DAY_MS;
  const target = cuisine.toLowerCase();
  let total = 0;
  let same = 0;
  for (const c of recentCooks) {
    const ts = new Date(c.completedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    if (ts < cutoff) continue;
    total += 1;
    if (c.cuisineFamily.toLowerCase() === target) same += 1;
  }
  if (total === 0) return 1;
  // 0% same → 1.0; 50% same → 0.5; 100% same → 0.0.
  return 1 - same / total;
}

/** Pure: ease-of-prep score from cook time. Quick recipes
 *  score higher in the 90-second swipe context where users
 *  are picking weeknight options. 5min → 1.0, 30min → 0.7,
 *  60min → 0.4, 120min → 0.2. */
function easeOfPrepScore(prepTimeMinutes: number): number {
  if (!Number.isFinite(prepTimeMinutes) || prepTimeMinutes <= 0) return 0.5;
  if (prepTimeMinutes <= 5) return 1;
  if (prepTimeMinutes <= 15) return 0.9;
  if (prepTimeMinutes <= 30) return 0.7;
  if (prepTimeMinutes <= 45) return 0.55;
  if (prepTimeMinutes <= 60) return 0.4;
  return 0.2;
}

/** Pure: dietary-union compatibility check. Recipe must be a
 *  superset of the household's required flags. */
function passesDietaryUnion(
  recipeFlags: ReadonlyArray<string>,
  union: ReadonlyArray<string>,
): boolean {
  if (union.length === 0) return true;
  const flagSet = new Set(recipeFlags.map((f) => f.toLowerCase()));
  for (const required of union) {
    if (!flagSet.has(required.toLowerCase())) return false;
  }
  return true;
}

/** Pure: build the swipe-card pool. Filters → scores → sorts
 *  → slices to pool size. Returns SwipeCard[] sorted by
 *  rankScore descending. */
export function buildSwipeCardPool(input: SwipePoolInput): SwipeCard[] {
  const minCoverage = input.minCoverage ?? SWIPE_MIN_COVERAGE;
  const poolSize = input.poolSize ?? SWIPE_POOL_SIZE;
  const pantrySet = new Set(input.pantry.map((p) => p.toLowerCase()));

  const eligible: SwipeCard[] = [];

  for (const candidate of input.candidates) {
    // Dietary gate
    if (!passesDietaryUnion(candidate.dietaryFlags, input.dietaryUnion)) {
      continue;
    }

    // Pantry coverage gate
    const coverage = computePantryCoverage(
      {
        ingredients: candidate.ingredients.map((name) => ({
          name,
          isOptional: false,
        })),
      },
      pantrySet,
    );
    if (coverage.coverage < minCoverage) continue;

    // Score components
    const recencyFatigue = recipeRecencyFatigue(
      candidate.recipeSlug,
      input.recentCooks,
      input.now,
    );
    const rotation = cuisineRotationScore(
      candidate.cuisineFamily,
      input.recentCooks,
      input.now,
    );
    const ease = easeOfPrepScore(candidate.prepTimeMinutes);

    // Composite — equal blend across the three factors. The
    // 0..1 range is preserved (each input is 0..1 and the
    // average stays bounded).
    const rankScore = (recencyFatigue + rotation + ease) / 3;

    eligible.push({
      recipeSlug: candidate.recipeSlug,
      title: candidate.title,
      cuisineFamily: candidate.cuisineFamily,
      prepTimeMinutes: candidate.prepTimeMinutes,
      heroImageUrl: candidate.heroImageUrl ?? null,
      pantryCoverage: coverage.coverage,
      rankScore,
      source: candidate.source ?? "seed",
    });
  }

  // Sort descending by rankScore; alphabetical tie-break for
  // determinism.
  eligible.sort((a, b) => {
    if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
    return a.recipeSlug.localeCompare(b.recipeSlug);
  });

  return eligible.slice(0, poolSize);
}
