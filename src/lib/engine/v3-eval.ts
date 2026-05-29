/**
 * V3 trainer evaluation harness (Y2 Sprint B W9).
 *
 * Synthetic-user generator + acceptance-rate metric for
 * comparing V3 against V2. Karpathy "define success upfront":
 * V3 must beat V2 on accepted-pick rate by ≥ 5 percentage
 * points across 100 synthetic users, otherwise we reroute.
 *
 * The harness builds a synthetic cook-history with a known
 * latent preference profile (which dimensions the user
 * "actually" weights), runs V2 and V3 against the history,
 * then scores each trainer's recommendations against held-out
 * candidates. Higher score = trainer better-recovered the
 * latent preference.
 *
 * Pure / dependency-free. The harness lives in source so
 * the IDEO retro can re-run it; production never imports it.
 */

import { DEFAULT_WEIGHTS } from "./types";
import type { ScoreBreakdown } from "./types";
import { composeUserWeights } from "./user-weight-trainer-hybrid";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

/** A single synthetic user. The latent vector is the user's
 *  "true" preference; their cook history reflects picks
 *  weighted by the latent vector + noise. */
export interface SyntheticUser {
  /** "true" weight vector — sums to 1, used to generate picks. */
  latentWeights: ScoreBreakdown;
  /** Generated cook history. */
  history: CookSessionRecord[];
}

/** Pure helper: weighted dot product of a candidate's
 *  ScoreBreakdown against a weights vector. */
function scoreCandidate(
  weights: ScoreBreakdown,
  candidate: ScoreBreakdown,
): number {
  return (
    weights.cuisineFit * candidate.cuisineFit +
    weights.flavorContrast * candidate.flavorContrast +
    weights.nutritionBalance * candidate.nutritionBalance +
    weights.prepBurden * candidate.prepBurden +
    weights.temperature * candidate.temperature +
    weights.preference * candidate.preference
  );
}

/** Deterministic linear-congruential RNG. Seedable so eval
 *  runs are reproducible. */
function lcg(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Generate a synthetic latent weight vector — random but sums
 *  to 1, with one dominant dimension. Pure deterministic given
 *  the seed. */
export function generateLatentWeights(rng: () => number): ScoreBreakdown {
  const dims: Array<keyof ScoreBreakdown> = [
    "cuisineFit",
    "flavorContrast",
    "nutritionBalance",
    "prepBurden",
    "temperature",
    "preference",
  ];
  const dominantIdx = Math.floor(rng() * dims.length);
  const w = {} as ScoreBreakdown;
  let sum = 0;
  for (let i = 0; i < dims.length; i += 1) {
    const v = i === dominantIdx ? 0.4 + rng() * 0.3 : 0.05 + rng() * 0.15;
    w[dims[i]] = v;
    sum += v;
  }
  // Renormalise.
  for (const d of dims) w[d] /= sum;
  return w;
}

/** Generate a synthetic candidate ScoreBreakdown — uniform
 *  random in [0, 1] per dimension. */
export function generateCandidate(rng: () => number): ScoreBreakdown {
  return {
    cuisineFit: rng(),
    flavorContrast: rng(),
    nutritionBalance: rng(),
    prepBurden: rng(),
    temperature: rng(),
    preference: rng(),
  };
}

/** Build a synthetic cook history for one user. Each cook is
 *  an "accepted" or "rejected" pair: the user was offered 3
 *  candidates, picked the highest-scoring one against their
 *  latent weights (with noise). Acceptance signal is encoded
 *  via rating — accepted → 5 stars, rejected → 1 star. */
export function generateSyntheticHistory(opts: {
  cookCount: number;
  latentWeights: ScoreBreakdown;
  rng: () => number;
  /** Probability that a cook is rejected (low rating) instead
   *  of accepted (high rating). Default 0.30 — most cooks the
   *  user picks they end up liking. */
  rejectionRate?: number;
}): CookSessionRecord[] {
  const out: CookSessionRecord[] = [];
  const rejectionRate = opts.rejectionRate ?? 0.3;

  for (let i = 0; i < opts.cookCount; i += 1) {
    const candidate = generateCandidate(opts.rng);
    const isAccepted = opts.rng() >= rejectionRate;
    out.push({
      sessionId: `synth-${i}`,
      recipeSlug: `synth-recipe-${i}`,
      dishName: `Synth ${i}`,
      cuisineFamily: ["indian", "italian", "mexican"][i % 3],
      startedAt: new Date(2026, 0, 1, 18, 0, 0, i).toISOString(),
      completedAt: new Date(2026, 0, 1, 19, 0, 0, i).toISOString(),
      rating: isAccepted ? 5 : 1,
      favorite: isAccepted && opts.rng() < 0.3,
      engineScoreBreakdown: {
        ...candidate,
        totalScore: scoreCandidate(opts.latentWeights, candidate),
      },
    });
  }
  return out;
}

/** Generate N synthetic users with known latent preferences +
 *  cook histories. */
export function generateSyntheticCohort(opts: {
  userCount: number;
  cooksPerUser: number;
  seed?: number;
}): SyntheticUser[] {
  const rng = lcg(opts.seed ?? 42);
  const users: SyntheticUser[] = [];
  for (let i = 0; i < opts.userCount; i += 1) {
    const latent = generateLatentWeights(rng);
    const history = generateSyntheticHistory({
      cookCount: opts.cooksPerUser,
      latentWeights: latent,
      rng,
    });
    users.push({ latentWeights: latent, history });
  }
  return users;
}

/** Score a trainer's recovered weights against held-out
 *  candidates: how often does the trainer's top-1 pick agree
 *  with the latent-weighted top-1 pick? Higher = better. */
export function scoreTrainerAgainstHeldOut(
  recovered: ScoreBreakdown,
  latent: ScoreBreakdown,
  heldOutCandidates: ReadonlyArray<ScoreBreakdown>,
): number {
  if (heldOutCandidates.length === 0) return 0;
  let agreements = 0;
  // For each held-out group of 3, both pick top-1 — if they
  // match, agreement++.
  const groupSize = 3;
  for (let i = 0; i + groupSize <= heldOutCandidates.length; i += groupSize) {
    const group = heldOutCandidates.slice(i, i + groupSize);
    let recoveredBest = 0;
    let latentBest = 0;
    for (let j = 1; j < group.length; j += 1) {
      if (
        scoreCandidate(recovered, group[j]) >
        scoreCandidate(recovered, group[recoveredBest])
      ) {
        recoveredBest = j;
      }
      if (
        scoreCandidate(latent, group[j]) >
        scoreCandidate(latent, group[latentBest])
      ) {
        latentBest = j;
      }
    }
    if (recoveredBest === latentBest) agreements += 1;
  }
  const groupCount = Math.floor(heldOutCandidates.length / groupSize);
  return groupCount === 0 ? 0 : agreements / groupCount;
}

export interface EvalResult {
  v2AvgAgreement: number;
  v3AvgAgreement: number;
  /** v3 - v2. Positive = V3 wins. */
  delta: number;
  /** Whether V3 cleared the success threshold (≥ +0.05). */
  v3Wins: boolean;
}

/** End-to-end eval. Generates a cohort, runs both trainers,
 *  measures agreement on a held-out candidate set, returns the
 *  comparison. */
export function runV3Eval(opts: {
  userCount?: number;
  cooksPerUser?: number;
  heldOutCount?: number;
  seed?: number;
  /** Threshold V3 must clear to win. Default +5 percentage
   *  points per the W9 plan-line. */
  winThreshold?: number;
}): EvalResult {
  const userCount = opts.userCount ?? 100;
  const cooksPerUser = opts.cooksPerUser ?? 12;
  const heldOutCount = opts.heldOutCount ?? 60;
  const winThreshold = opts.winThreshold ?? 0.05;
  const cohort = generateSyntheticCohort({
    userCount,
    cooksPerUser,
    seed: opts.seed,
  });
  const heldOutRng = lcg((opts.seed ?? 42) + 9999);
  const heldOut = Array.from({ length: heldOutCount }, () =>
    generateCandidate(heldOutRng),
  );

  let v2Sum = 0;
  let v3Sum = 0;
  for (const user of cohort) {
    // Force-run V2 by stripping breakdowns.
    const v2OnlyHistory = user.history.map((s) => ({
      ...s,
      engineScoreBreakdown: undefined,
    }));
    const v2Out = composeUserWeights(v2OnlyHistory);
    const v3Out = composeUserWeights(user.history);
    v2Sum += scoreTrainerAgainstHeldOut(
      v2Out.weights,
      user.latentWeights,
      heldOut,
    );
    v3Sum += scoreTrainerAgainstHeldOut(
      v3Out.weights,
      user.latentWeights,
      heldOut,
    );
  }
  const v2AvgAgreement = v2Sum / cohort.length;
  const v3AvgAgreement = v3Sum / cohort.length;
  const delta = v3AvgAgreement - v2AvgAgreement;
  return {
    v2AvgAgreement,
    v3AvgAgreement,
    delta,
    v3Wins: delta >= winThreshold,
  };
}

/** Default DEFAULT_WEIGHTS-vs-trainer baseline — useful for
 *  asserting any trainer beats no-trainer. */
export const DEFAULT_BASELINE = DEFAULT_WEIGHTS;
