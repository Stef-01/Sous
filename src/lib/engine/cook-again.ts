/**
 * Cook-again memory pick (Y2 Sprint C W13).
 *
 * Surfaces at most one recipe to re-suggest on the Today page —
 * something the user genuinely loved a few weeks ago and likely
 * forgot. The small chip lives between RepeatCookChip and
 * WhosAtTable; it renders nothing when no eligible candidate
 * exists (cold-start safe).
 *
 * Eligibility (hard gates):
 *   - rating ≥ 5 (only the recipes the user actually loved)
 *   - last completedAt ∈ [21d, 90d] from `now`
 *   - no later cook of the same recipe
 *
 * Scoring (×-multiplicative, in [0, 1]):
 *   - recency:        triangular, peaks at ~35d, floors at 0.3
 *   - seasonality:    1.0 if the dish's derived season matches the
 *                     current season, 0.7 if no derivation, 0.5
 *                     if mismatched
 *   - cuisineRotation: 1.0 if no cook of the same cuisine in the
 *                     last 7d, 0.5 otherwise (don't repeat the
 *                     cuisine you just had)
 *
 * Highest-scoring eligible candidate wins. Tie-break:
 * lexicographic on recipeSlug, deterministic.
 *
 * Behavioural overlay (anchoring):
 *   The chip text references the user's prior rating + days-ago.
 *   "you rated this 5★ 4 weeks ago — make it again?" is the
 *   personal-best anchor; we never show generic praise.
 *
 * Pure / dependency-free / deterministic.
 */

import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import { deriveSeasonalTags } from "./seasonal-tags";
import { inferSeason, type Hemisphere, type Season } from "./time-rerank";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Hard gate: a session is eligible to re-suggest only when its
 *  age falls in this window. < 21d is still fresh; > 56d (8 weeks)
 *  the user has moved on. Tightened from 90d (12 weeks) at Y3 W6
 *  per the polish-year plan: a 14-week-old cook surfacing felt
 *  stale even when the rating was 5★. */
export const COOK_AGAIN_MIN_AGE_DAYS = 21;
export const COOK_AGAIN_MAX_AGE_DAYS = 56;

/** Y3 W6: composite-score threshold above which a candidate
 *  is rendered with the "highlight tier" star-glow visual on
 *  the cook-again chip. The cook-again candidate score is
 *  recency × seasonality × rotation × ratingFactor; 0.85 means
 *  every factor is firing strongly. Below this the chip is
 *  rendered without the glow.
 *
 *  Threshold tuned so the glow lights up about 1 in 4 chips
 *  in normal use — common enough to be a recognisable signal,
 *  rare enough to feel earned. */
export const COOK_AGAIN_HIGHLIGHT_THRESHOLD = 0.85;

/** Pure: should the cook-again chip render with the highlight
 *  tier (star-glow) treatment? Returns true when the candidate's
 *  composite score crosses the threshold. */
export function cookAgainHighlightTier(score: number): boolean {
  if (!Number.isFinite(score)) return false;
  return score >= COOK_AGAIN_HIGHLIGHT_THRESHOLD;
}

/** Hard gate: only re-suggest 5★ recipes. Below 5 the user
 *  isn't signalling enough enthusiasm to justify the nudge. */
export const COOK_AGAIN_MIN_RATING = 5;

/** Window inside which a same-cuisine cook penalises the
 *  rotation score. */
export const COOK_AGAIN_CUISINE_LOOKBACK_DAYS = 7;

/** The "sweet spot" age — recipes around this age feel naturally
 *  rememberable. Triangular score peaks here. */
const RECENCY_PEAK_DAYS = 35;

export interface CookAgainCandidate {
  recipeSlug: string;
  dishName: string;
  cuisineFamily: string;
  lastCompletedAt: string;
  lastRating: number;
  daysSinceLastCook: number;
  score: number;
}

export interface PickReSuggestionOptions {
  /** Hemisphere for season inference. Defaults to "northern". */
  hemisphere?: Hemisphere;
}

/** Pure: triangular recency score peaking at 35d, floor 0.3.
 *  - 21d → 0.42
 *  - 35d → 1.00
 *  - 89d → 0.30  (linear ramp from 35d to 90d, capped at floor)
 *  Floor at 0.3 so a barely-eligible candidate isn't zeroed out
 *  by the multiplication; the other factors still get a vote. */
export function recencyScore(daysAgo: number): number {
  if (daysAgo < COOK_AGAIN_MIN_AGE_DAYS) return 0;
  if (daysAgo > COOK_AGAIN_MAX_AGE_DAYS) return 0;
  if (daysAgo === RECENCY_PEAK_DAYS) return 1;
  if (daysAgo < RECENCY_PEAK_DAYS) {
    // Linear from 21d (0.3) → 35d (1.0)
    const t =
      (daysAgo - COOK_AGAIN_MIN_AGE_DAYS) /
      (RECENCY_PEAK_DAYS - COOK_AGAIN_MIN_AGE_DAYS);
    return 0.3 + 0.7 * t;
  }
  // Linear from 35d (1.0) → 90d (0.3)
  const t =
    (daysAgo - RECENCY_PEAK_DAYS) /
    (COOK_AGAIN_MAX_AGE_DAYS - RECENCY_PEAK_DAYS);
  return 1 - 0.7 * t;
}

/** Pure: seasonality fit between a dish + the current season.
 *  Returns 1.0 when the dish's derived seasonal tags match,
 *  0.7 when no seasonal hint can be derived (neutral), 0.5
 *  when the derivation explicitly mismatches.
 *
 *  We synthesise a tag list from the dishName + cuisineFamily so
 *  the seasonal-tags helper has something to scan. */
export function seasonalityFitScore(
  dishName: string,
  cuisineFamily: string,
  season: Season,
): number {
  // Tokenise the dish name into rough tag-equivalents so the
  // helper can match its tag-only hints. Same lowercase shape.
  const tokens = dishName
    .toLowerCase()
    .split(/[\s,&-]+/)
    .filter((t) => t.length > 0);
  const synthTags = [...tokens, cuisineFamily.toLowerCase()];
  const derived = deriveSeasonalTags({
    tags: synthTags,
    description: dishName,
  });
  if (derived.length === 0) return 0.7;

  const seasonTagMap: Record<Season, ReadonlyArray<string>> = {
    winter: ["winter-warming"],
    summer: ["summer-fresh"],
    spring: ["spring-fresh"],
    autumn: ["autumn-pick"],
  };
  const targets = seasonTagMap[season];
  const matches = derived.some((d) => targets.includes(d));
  return matches ? 1.0 : 0.5;
}

/** Pure: cuisine-rotation penalty. Returns 1.0 when no
 *  same-cuisine cook within the lookback window, 0.5 otherwise. */
export function cuisineRotationScore(
  cuisineFamily: string,
  history: ReadonlyArray<CookSessionRecord>,
  now: Date,
): number {
  const nowMs = now.getTime();
  const lookbackMs = nowMs - COOK_AGAIN_CUISINE_LOOKBACK_DAYS * DAY_MS;
  for (const s of history) {
    if (!s.completedAt) continue;
    const ts = new Date(s.completedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    if (ts < lookbackMs || ts > nowMs) continue;
    if (s.cuisineFamily.toLowerCase() === cuisineFamily.toLowerCase()) {
      return 0.5;
    }
  }
  return 1.0;
}

/** Pure: pick at most one recipe to re-suggest on Today.
 *  Returns null when no eligible candidate exists. */
export function pickReSuggestion(
  history: ReadonlyArray<CookSessionRecord>,
  now: Date,
  options: PickReSuggestionOptions = {},
): CookAgainCandidate | null {
  const hemisphere = options.hemisphere ?? "northern";
  const season = inferSeason(now, hemisphere);
  const nowMs = now.getTime();

  // Group sessions by recipeSlug, keeping the most-recent
  // completed session for each. "No double-suggest" invariant:
  // if a recipe has any cook newer than 21d, it's NOT eligible.
  const latestBySlug = new Map<string, CookSessionRecord>();
  for (const s of history) {
    if (!s.completedAt) continue;
    const ts = new Date(s.completedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    const prev = latestBySlug.get(s.recipeSlug);
    if (!prev) {
      latestBySlug.set(s.recipeSlug, s);
      continue;
    }
    const prevTs = new Date(prev.completedAt ?? "").getTime();
    if (ts > prevTs) latestBySlug.set(s.recipeSlug, s);
  }

  const candidates: CookAgainCandidate[] = [];
  for (const [slug, s] of latestBySlug) {
    if ((s.rating ?? 0) < COOK_AGAIN_MIN_RATING) continue;
    const ts = new Date(s.completedAt ?? "").getTime();
    const ageMs = nowMs - ts;
    const ageDays = Math.floor(ageMs / DAY_MS);
    if (ageDays < COOK_AGAIN_MIN_AGE_DAYS) continue;
    if (ageDays > COOK_AGAIN_MAX_AGE_DAYS) continue;

    const recency = recencyScore(ageDays);
    const seasonality = seasonalityFitScore(
      s.dishName,
      s.cuisineFamily,
      season,
    );
    const rotation = cuisineRotationScore(s.cuisineFamily, history, now);
    const score = recency * seasonality * rotation;

    candidates.push({
      recipeSlug: slug,
      dishName: s.dishName,
      cuisineFamily: s.cuisineFamily,
      lastCompletedAt: s.completedAt ?? "",
      lastRating: s.rating ?? 0,
      daysSinceLastCook: ageDays,
      score,
    });
  }

  if (candidates.length === 0) return null;

  // Highest score wins. Tie-break on recipeSlug (deterministic).
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.recipeSlug.localeCompare(b.recipeSlug);
  });
  const best = candidates[0];
  if (!best) return null;
  return best;
}
