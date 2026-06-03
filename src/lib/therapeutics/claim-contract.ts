/**
 * Claim-language contract for culinary therapeutics.
 *
 * The single most important rule from the evidence report, enforced as code:
 * a recipe app must never imply that food *treats*, *cures*, or *reverses* a
 * disease. We use structure-function-safe language only ("supports", "helps
 * with", "good source of", "is associated with", "contributes to").
 *
 * `assertNoMedicalClaim` is run by the registry guard test over EVERY
 * human-facing string in the evidence registry, and is the reviewable artifact
 * for founder gate G5 (legal/regulatory review). Pure + dependency-free.
 */

/**
 * Banned claim stems (word-boundary, case-insensitive). These are verbs that
 * assert a food acts as a drug. Note: "treatment" / "care" are NOT banned —
 * "not a replacement for your clinician's care" is exactly the food-first
 * hedge we want — so the stems are matched at word boundaries and do not catch
 * longer words. "deficiency" is also NOT banned: it is a legitimate condition
 * name ("iron deficiency"), not a claim.
 */
const BANNED_PATTERN =
  /\b(cure[sd]?|curing|treats?|treating|reverse[sd]?|reversing|heals?|healing|miracle|guaranteed|prevents?|diagnos\w*)\b/gi;

export interface ClaimViolation {
  term: string;
  /** A short window of surrounding text to make the violation legible. */
  context: string;
}

export interface ClaimCheckResult {
  ok: boolean;
  violations: ClaimViolation[];
}

/**
 * Returns `{ ok: false, violations }` when `text` contains disease-claim
 * language. Safe verbs and clinical-referral phrasing pass.
 */
export function assertNoMedicalClaim(text: string): ClaimCheckResult {
  const violations: ClaimViolation[] = [];
  for (const match of text.matchAll(BANNED_PATTERN)) {
    const idx = match.index ?? 0;
    const start = Math.max(0, idx - 24);
    const end = Math.min(text.length, idx + match[0].length + 24);
    violations.push({
      term: match[0],
      context: `…${text.slice(start, end).trim()}…`,
    });
  }
  return { ok: violations.length === 0, violations };
}

/** Convenience boolean for call sites that don't need the detail. */
export function isClaimSafe(text: string): boolean {
  return assertNoMedicalClaim(text).ok;
}

/**
 * The mandatory food-first hedge rendered alongside any condition-targeted
 * claim (the report's "food-first, not food-only" caution). Exposed here so
 * both the UI (CT-4) and copy tests reference one canonical string.
 */
export const FOOD_FIRST_HEDGE =
  "Food-first ideas — not a replacement for your clinician's plan.";
