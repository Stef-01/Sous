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
import {
  scorePantryReuse,
  PANTRY_REUSE_WEIGHT,
  type PantryReuseContext,
} from "./scorers/pantry-reuse";
import {
  scoreDeficiencyFill,
  DEFICIENCY_FILL_WEIGHT,
  type DeficiencyContext,
} from "./scorers/deficiency-fill";
import {
  scoreContextFit,
  CONTEXT_FIT_WEIGHT,
  type ContextFitContext,
} from "./scorers/context-fit";
import { getDishNutrition, NUTRITION_COVERAGE_FLOOR } from "./dish-nutrition";
import {
  therapeuticsActive,
  registryIsClinicianApproved,
} from "@/lib/therapeutics/feature-flag";
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
 * Whether to PERSONALIZE — re-rank the plate by therapeutic fit. Strictly
 * gated: educational mode (resolveActive true) shows evidence + runs dietary
 * exclusions, but re-ranking a real user's suggestions on the registry's effect
 * sizes is clinician-only (G1). When a caller passes `active` explicitly (tests
 * simulating the approved state) that wins; otherwise it defaults to the
 * clinician-approval gate, NOT the educational flag.
 */
function resolvePersonalize(ctx?: TherapeuticContext): boolean {
  if (!resolveActive(ctx)) return false;
  return ctx!.active ?? registryIsClinicianApproved();
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
 * Re-blend a base ranking with pantry reuse (W1). Same shape as the
 * therapeutic reblend — scale the base score by (1 − wP) and add the reuse
 * fraction at wP, applied as a post-rank pass so a strong pantry match ranked
 * outside the top K can surface into it (the waste-reduction the thesis wants).
 * Caller guarantees `ctx.onHand` is non-empty before invoking, so this never
 * runs on the default no-pantry path → rankings stay byte-identical there.
 */
function reblendPantryReuse(
  ranked: ScoredCandidate[],
  ctx: PantryReuseContext,
): ScoredCandidate[] {
  // W5: budget-sensitive users supply a boosted weight via the context; default
  // to the standard tie-breaker weight otherwise.
  const wP = ctx.weight ?? PANTRY_REUSE_WEIGHT;
  const blended = ranked.map((c) => {
    const ingredients = ctx.ingredientsBySlug.get(c.sideDish.slug) ?? [];
    const p = scorePantryReuse(ctx.onHand, ingredients);
    return {
      ...c,
      scores: { ...c.scores, pantryReuse: p },
      totalScore: (1 - wP) * c.totalScore + wP * p,
    };
  });
  blended.sort((a, b) => {
    const diff = b.totalScore - a.totalScore;
    if (Math.abs(diff) > 0.001) return diff;
    // Deterministic, stable tie-break by slug (matches the therapeutic reblend).
    return a.sideDish.slug < b.sideDish.slug
      ? -1
      : a.sideDish.slug > b.sideDish.slug
        ? 1
        : 0;
  });
  return blended;
}

/**
 * Re-blend a base ranking with deficiency-fill (W29). Same shape as the pantry
 * reblend: scale the base by (1 − wD), add the day's gap-fill fraction at wD, as
 * a post-rank pass so a strongly gap-filling side ranked outside the top K can
 * surface into it. Caller guarantees `ctx.deficits` is non-empty before
 * invoking, so this never runs on the default no-diary path → byte-identical.
 */
function reblendDeficiency(
  ranked: ScoredCandidate[],
  ctx: DeficiencyContext,
): ScoredCandidate[] {
  const wD = DEFICIENCY_FILL_WEIGHT;
  const blended = ranked.map((c) => {
    const { perServing, massedCoverage } = getDishNutrition(c.sideDish.slug);
    const nutrition =
      massedCoverage >= NUTRITION_COVERAGE_FLOOR ? perServing : null;
    const d = scoreDeficiencyFill(ctx.deficits, nutrition);
    return {
      ...c,
      scores: { ...c.scores, deficiencyFill: d },
      totalScore: (1 - wD) * c.totalScore + wD * d,
    };
  });
  blended.sort((a, b) => {
    const diff = b.totalScore - a.totalScore;
    if (Math.abs(diff) > 0.001) return diff;
    return a.sideDish.slug < b.sideDish.slug
      ? -1
      : a.sideDish.slug > b.sideDish.slug
        ? 1
        : 0;
  });
  return blended;
}

/**
 * Re-blend a base ranking with context-fit (W2 — time-of-day + season). Same
 * shape as the pantry/deficiency reblends: scale the base by (1 − wC), add the
 * gentle context signal at wC, as a post-rank pass. Caller supplies the context
 * only when it has the client's local clock, so this never runs on the default
 * path → byte-identical rankings. Applied after pantry/deficiency but before
 * therapeutic, so clinician fit still dominates when active.
 */
function reblendContextFit(
  ranked: ScoredCandidate[],
  ctx: ContextFitContext,
): ScoredCandidate[] {
  const wC = CONTEXT_FIT_WEIGHT;
  const blended = ranked.map((c) => {
    const cf = scoreContextFit(c.sideDish, ctx);
    return {
      ...c,
      scores: { ...c.scores, contextFit: cf },
      totalScore: (1 - wC) * c.totalScore + wC * cf,
    };
  });
  blended.sort((a, b) => {
    const diff = b.totalScore - a.totalScore;
    if (Math.abs(diff) > 0.001) return diff;
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
 * @param therapeutic - Optional clinician-gated therapeutic re-ranking (dormant)
 * @param pantry - Optional pantry/recent-cook reuse context (W1). When its
 *   `onHand` set is non-empty, sides reusing on-hand ingredients are nudged up.
 */
/** A preference at or below this weight is a hard suppression (a disliked
 *  cuisine/tag from a survey), not just a soft down-rank. */
export const SUPPRESSION_THRESHOLD = -0.9;

/** True when any of the candidate's features carries a suppressed preference. */
function isSuppressed(
  c: SideDishCandidate,
  prefs: Record<string, number>,
): boolean {
  const features = [
    c.cuisineFamily,
    ...(c.flavorProfile ?? []),
    ...(c.tags ?? []),
    c.nutritionCategory ?? "",
    c.temperature,
  ].filter(Boolean);
  return features.some(
    (f) => (prefs[String(f).toLowerCase()] ?? 0) <= SUPPRESSION_THRESHOLD,
  );
}

export function suggestSides(
  main: MainDishIntent,
  candidates: SideDishCandidate[],
  userPreferences?: Record<string, number>,
  weights?: Partial<Record<keyof ScoreBreakdown, number>>,
  count: number = 3,
  therapeutic?: TherapeuticContext,
  pantry?: PantryReuseContext,
  deficiency?: DeficiencyContext,
  context?: ContextFitContext,
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

  // Suppression screen (W5): strongly-negative preferences (≤ −0.9, e.g. a
  // cuisine disliked in onboarding/a pulse) hard-exclude a candidate so it
  // never reaches the top-N. Falls back to `feasible` if suppression would
  // empty the pool, so the user never hits a dead feed.
  const screened =
    userPreferences && Object.keys(userPreferences).length > 0
      ? feasible.filter((c) => !isSuppressed(c, userPreferences))
      : feasible;
  const pool = screened.length > 0 ? screened : feasible;

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
    pool,
    scorers,
    mergedWeights,
    userPreferences,
  );

  // Pantry-reuse reblend (W1): only when the caller supplied on-hand
  // ingredients. No-op on the default path → byte-identical rankings.
  let finalRanked = ranked;
  if (pantry && pantry.onHand.size > 0) {
    finalRanked = reblendPantryReuse(finalRanked, pantry);
  }

  // Deficiency-fill reblend (W29): only when the caller supplied the day's
  // nutrient gaps. No-op on the default path → byte-identical rankings.
  if (deficiency && deficiency.deficits.size > 0) {
    finalRanked = reblendDeficiency(finalRanked, deficiency);
  }

  // Context-fit reblend (W2 — time-of-day + season): only when the caller
  // supplied the client's local clock. No-op on the default path →
  // byte-identical rankings. NB: the live `seasonal` base scorer carries the
  // bulk of season; this adds the missing time-of-day signal + a light season
  // nudge (kept gentle so the two don't double-count). See scorers/context-fit.
  if (context) {
    finalRanked = reblendContextFit(finalRanked, context);
  }

  // Therapeutic re-blend = PERSONALIZATION → clinician-only (G1), stricter than
  // the educational `active` gate above. Educational mode runs the exclusions
  // but leaves the ranking untouched. Applied after pantry so clinician fit
  // dominates when an approved care profile is active.
  if (resolvePersonalize(therapeutic)) {
    finalRanked = reblendTherapeutic(finalRanked, therapeutic!.care);
  }

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
