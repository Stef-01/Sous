import type {
  MainDishIntent,
  SideDishCandidate,
  ScoredCandidate,
  ScoreBreakdown,
  Scorer,
} from "./types";
import { DEFAULT_WEIGHTS } from "./types";
import { cuisineFitScorer } from "./scorers/cuisine-fit";
import { flavorContrastScorer } from "./scorers/flavor-contrast";
import { nutritionBalanceScorer } from "./scorers/nutrition-balance";
import { prepBurdenScorer } from "./scorers/prep-burden";
import { temperatureScorer } from "./scorers/temperature";
import { preferenceScorer } from "./scorers/preference";
import { seasonalScorer } from "./scorers/seasonal";
import {
  createAntiMonotonyScorer,
  buildRecencyMap,
} from "./scorers/anti-monotony";
import { rankCandidates, topK } from "./ranker";
import { addExplanations } from "./explainer";
import { scoreTherapeuticFit } from "./therapeutic-fit";
import { THERAPEUTIC_WEIGHT } from "./therapeutic-weights";
import { filterByCareExclusions } from "./therapeutic-exclusions";
import { therapeuticsActive } from "@/lib/therapeutics/feature-flag";
import type { CareProfile } from "@/types/care-profile";

/**
 * Static scorers (no per-request state). The anti-monotony scorer is added
 * per-call via `createAntiMonotonyScorer(buildRecencyMap())` so the served-log
 * localStorage read happens ONCE per request instead of once per candidate.
 */
const BASE_SCORERS: Scorer[] = [
  cuisineFitScorer,
  flavorContrastScorer,
  nutritionBalanceScorer,
  prepBurdenScorer,
  temperatureScorer,
  preferenceScorer,
  seasonalScorer,
];

export type SuggestSidesResult =
  | {
      success: true;
      data: {
        sides: ScoredCandidate[];
        totalCandidates: number;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * Optional therapeutic context (Culinary Therapeutics CT-3). When omitted —
 * or when `active` resolves false — `suggestSides` behaves exactly as before.
 * `active` defaults to `therapeuticsActive()`, which is false until founder
 * gate G1, so therapeutic re-ranking is DORMANT in the live app today.
 */
export interface TherapeuticContext {
  care: CareProfile;
  active?: boolean;
}

function resolveActive(ctx?: TherapeuticContext): boolean {
  if (!ctx) return false;
  const hasFocus = ctx.care.conditions.length > 0 || ctx.care.avoid.length > 0;
  if (!hasFocus) return false;
  return ctx.active ?? therapeuticsActive();
}

/**
 * Re-blend a base ranking with therapeutic fit. Equivalent to scaling the 8
 * base weights by (1 − wT) and adding therapeuticFit at wT, but applied as a
 * post-rank pass so the default ranker stays untouched.
 */
function reblendTherapeutic(
  ranked: ScoredCandidate[],
  care: CareProfile,
): ScoredCandidate[] {
  const wT = THERAPEUTIC_WEIGHT;
  const blended = ranked.map((c) => {
    const t = scoreTherapeuticFit(care, {
      name: c.sideDish.name,
      tags: c.sideDish.tags,
      flavorProfile: c.sideDish.flavorProfile,
    });
    return {
      ...c,
      scores: { ...c.scores, therapeuticFit: t },
      totalScore: (1 - wT) * c.totalScore + wT * t,
    };
  });
  blended.sort((a, b) => {
    const diff = b.totalScore - a.totalScore;
    if (Math.abs(diff) > 0.001) return diff;
    // Deterministic, stable tie-break by slug.
    return a.sideDish.slug < b.sideDish.slug
      ? -1
      : a.sideDish.slug > b.sideDish.slug
        ? 1
        : 0;
  });
  return blended;
}

/**
 * Main entry point: suggest the top 3 side dishes for a main dish.
 *
 * @param main - Parsed main dish intent (from craving parser or photo recognition)
 * @param candidates - All available side dish candidates (from DB or static data)
 * @param userPreferences - User's implicit preference vector (optional)
 * @param weights - Custom scoring weights (optional, uses defaults)
 * @param count - Number of sides to return (default 3)
 */
export function suggestSides(
  main: MainDishIntent,
  candidates: SideDishCandidate[],
  userPreferences?: Record<string, number>,
  weights?: Partial<Record<keyof ScoreBreakdown, number>>,
  count: number = 3,
  therapeutic?: TherapeuticContext,
): SuggestSidesResult {
  if (candidates.length === 0) {
    return { success: false, error: "No side dish candidates available" };
  }

  const active = resolveActive(therapeutic);

  // Hard-exclusion screen runs FIRST (report flowchart). No-op when inactive.
  const feasible = active
    ? filterByCareExclusions(candidates, therapeutic!.care)
    : candidates;
  if (feasible.length === 0) {
    return {
      success: false,
      error: "No side dishes meet the required exclusions",
    };
  }

  const mergedWeights = { ...DEFAULT_WEIGHTS, ...weights };

  // Build the recency map once per request (single localStorage read) rather
  // than once per candidate, then assemble the full scorer list.
  const scorers: Scorer[] = [
    ...BASE_SCORERS,
    createAntiMonotonyScorer(buildRecencyMap()),
  ];

  // Score and rank all candidates
  const ranked = rankCandidates(
    main,
    feasible,
    scorers,
    mergedWeights,
    userPreferences,
  );

  // Therapeutic re-blend (dormant until founder gate G1). Default path untouched.
  const finalRanked = active
    ? reblendTherapeutic(ranked, therapeutic!.care)
    : ranked;

  // Select top K
  const top = topK(finalRanked, count);

  // Generate explanations
  const explained = addExplanations(top);

  return {
    success: true,
    data: {
      sides: explained,
      totalCandidates: feasible.length,
    },
  };
}
