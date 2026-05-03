/**
 * Pure helpers for the Y2 W6 V3 trainer score-breakdown
 * persistence flow.
 *
 * Persists the engine's `ScoreBreakdown` at the moment the user
 * picks a side from the result stack. The cook session is
 * created LATER (when the user lands on /cook/[slug]), so the
 * breakdown is stashed in sessionStorage between the pick + the
 * session start, then merged into the session record at start
 * time.
 *
 * This helper layer is pure / dependency-free. The
 * sessionStorage read/write happens in the caller (browser-only
 * surface).
 *
 * Storage shape:
 *   {
 *     recipeSlug: string;
 *     breakdown: ScoreBreakdown;
 *     totalScore: number;
 *     stashedAt: number; // unix ms
 *   }
 *
 * Stash is single-recipe — overwriting any prior pending
 * breakdown is correct since the user is about to navigate to
 * a single cook session.
 */

import type { ScoreBreakdown } from "./types";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

/** sessionStorage key. V1 (single pending breakdown). */
export const PENDING_BREAKDOWN_KEY = "sous-pending-score-breakdown-v1";

export interface PendingBreakdown {
  recipeSlug: string;
  breakdown: ScoreBreakdown;
  totalScore: number;
  stashedAt: number;
}

/** Pure parser. Defends against missing key, corrupt JSON,
 *  schema mismatch, stale stashes (> 10 minutes old). */
export function parsePendingBreakdown(
  raw: string | null | undefined,
  now: number = Date.now(),
): PendingBreakdown | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }
  const obj = parsed as Partial<PendingBreakdown>;
  if (
    typeof obj.recipeSlug !== "string" ||
    typeof obj.totalScore !== "number" ||
    typeof obj.stashedAt !== "number" ||
    !obj.breakdown ||
    typeof obj.breakdown !== "object" ||
    Array.isArray(obj.breakdown)
  ) {
    return null;
  }
  // Stale check — 10-minute window covers slow-network nav from
  // result stack to cook page; anything older is suspect.
  if (now - obj.stashedAt > 10 * 60 * 1000) return null;
  // Validate every dimension is a finite number.
  const dims = [
    "cuisineFit",
    "flavorContrast",
    "nutritionBalance",
    "prepBurden",
    "temperature",
    "preference",
  ] as const;
  const breakdown = obj.breakdown as unknown as Record<string, unknown>;
  for (const dim of dims) {
    if (
      typeof breakdown[dim] !== "number" ||
      !Number.isFinite(breakdown[dim] as number)
    ) {
      return null;
    }
  }
  return {
    recipeSlug: obj.recipeSlug,
    totalScore: obj.totalScore,
    stashedAt: obj.stashedAt,
    breakdown: {
      cuisineFit: breakdown.cuisineFit as number,
      flavorContrast: breakdown.flavorContrast as number,
      nutritionBalance: breakdown.nutritionBalance as number,
      prepBurden: breakdown.prepBurden as number,
      temperature: breakdown.temperature as number,
      preference: breakdown.preference as number,
    },
  };
}

/** Compose a pending payload from a side's score breakdown.
 *  Caller stringifies + writes to sessionStorage. */
export function buildPendingBreakdown(
  recipeSlug: string,
  breakdown: ScoreBreakdown,
  totalScore: number,
  now: number = Date.now(),
): PendingBreakdown {
  return {
    recipeSlug,
    breakdown: { ...breakdown },
    totalScore,
    stashedAt: now,
  };
}

/** Attach a pending breakdown to a cook session. Returns a new
 *  session object — does not mutate the input. The breakdown is
 *  attached only when the recipeSlugs match, otherwise the
 *  session is returned unchanged (defensive against stale
 *  stashes). */
export function attachScoreBreakdown(
  session: CookSessionRecord,
  pending: PendingBreakdown,
): CookSessionRecord {
  if (session.recipeSlug !== pending.recipeSlug) return session;
  const breakdown: NonNullable<CookSessionRecord["engineScoreBreakdown"]> = {
    cuisineFit: pending.breakdown.cuisineFit,
    flavorContrast: pending.breakdown.flavorContrast,
    nutritionBalance: pending.breakdown.nutritionBalance,
    prepBurden: pending.breakdown.prepBurden,
    temperature: pending.breakdown.temperature,
    preference: pending.breakdown.preference,
    totalScore: pending.totalScore,
  };
  return { ...session, engineScoreBreakdown: breakdown };
}

/** Pure derivation: given a list of cook sessions, return only
 *  those with a non-null engineScoreBreakdown. The V3 trainer
 *  consumes this subset. */
export function sessionsWithBreakdown(
  sessions: ReadonlyArray<CookSessionRecord>,
): CookSessionRecord[] {
  return sessions.filter(
    (
      s,
    ): s is CookSessionRecord & {
      engineScoreBreakdown: NonNullable<
        CookSessionRecord["engineScoreBreakdown"]
      >;
    } =>
      s.engineScoreBreakdown !== null && s.engineScoreBreakdown !== undefined,
  );
}
