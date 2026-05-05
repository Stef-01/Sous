/**
 * Cuisine Compass scoring (pure helpers).
 *
 * 5,000-point max per puzzle, exponential decay with great-circle
 * distance, linear decay with elapsed time. Matches GeoGuessr's
 * scale exactly so users from that audience already understand
 * what "4500/5000" feels like.
 *
 *   distancePoints = 5000 * exp(-distanceKm / 2000)
 *   timeMultiplier = clamp(1 - max(0, elapsedSec - 5) / 60, 0.5, 1)
 *   score          = round(distancePoints * timeMultiplier)
 *
 * Pure / dependency-free / deterministic.
 */

import { haversineKm, type LatLng } from "./great-circle";

export const COMPASS_MAX_SCORE = 5000;
export const COMPASS_DISTANCE_DECAY_KM = 2000;
export const COMPASS_TIME_FREE_SEC = 5;
export const COMPASS_TIME_FLOOR_MULT = 0.5;
export const COMPASS_TIME_DECAY_WINDOW_SEC = 60;
export const COMPASS_TIME_LIMIT_SEC = 30;

export interface CompassScoreInput {
  guess: LatLng;
  answer: LatLng;
  /** Seconds elapsed between puzzle start and submission. */
  elapsedSec: number;
}

export interface CompassScoreBreakdown {
  /** Total points awarded, rounded. Range [0, COMPASS_MAX_SCORE]. */
  score: number;
  /** Distance in km between guess and answer. */
  distanceKm: number;
  /** Pre-time-multiplier distance points. */
  distancePoints: number;
  /** Time multiplier in [0.5, 1.0]. */
  timeMultiplier: number;
  /** Star-rating display: 0–5 stars. */
  stars: 0 | 1 | 2 | 3 | 4 | 5;
}

/** Pure: distance points (no time multiplier yet). */
export function compassDistancePoints(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return 0;
  return COMPASS_MAX_SCORE * Math.exp(-distanceKm / COMPASS_DISTANCE_DECAY_KM);
}

/** Pure: time multiplier in [0.5, 1.0]. First 5 seconds are
 *  "free" (full multiplier); decays linearly until reaching the
 *  0.5 floor at ~65s elapsed (well past the 30s timer). */
export function compassTimeMultiplier(elapsedSec: number): number {
  if (!Number.isFinite(elapsedSec) || elapsedSec < 0) return 1;
  const overrun = Math.max(0, elapsedSec - COMPASS_TIME_FREE_SEC);
  const raw = 1 - overrun / COMPASS_TIME_DECAY_WINDOW_SEC;
  return Math.min(1, Math.max(COMPASS_TIME_FLOOR_MULT, raw));
}

/** Pure: full score breakdown for a guess.
 *  Returns 0-points + NaN distance when either point is invalid. */
export function compassScore(input: CompassScoreInput): CompassScoreBreakdown {
  const distanceKm = haversineKm(input.guess, input.answer);
  if (!Number.isFinite(distanceKm)) {
    return {
      score: 0,
      distanceKm: Number.NaN,
      distancePoints: 0,
      timeMultiplier: 1,
      stars: 0,
    };
  }
  const distancePoints = compassDistancePoints(distanceKm);
  const timeMultiplier = compassTimeMultiplier(input.elapsedSec);
  const score = Math.round(distancePoints * timeMultiplier);
  return {
    score,
    distanceKm,
    distancePoints,
    timeMultiplier,
    stars: starsForScore(score),
  };
}

/** Pure: 0-5 star rating from the final score. Thresholds chosen
 *  to feel rewarding at the precision expected for each star count. */
export function starsForScore(score: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (!Number.isFinite(score) || score <= 0) return 0;
  if (score >= 4500) return 5;
  if (score >= 3500) return 4;
  if (score >= 2500) return 3;
  if (score >= 1500) return 2;
  if (score >= 500) return 1;
  return 0;
}
