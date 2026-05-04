/**
 * Viral chip eligibility gate (Y2 Sprint J W42).
 *
 * Final gate before the /today viral chip renders. Composes
 * five inputs into a single decision:
 *   1. Cool-down state (W41) — has the user been pestered too
 *      recently?
 *   2. Virality score (W40) — is this candidate actually viral?
 *   3. Dietary union — does the recipe match the household's
 *      dietary constraints?
 *   4. Cuisine concentration in last 14 days — is the user
 *      already eating mostly this cuisine?
 *   5. Dedup against drafts + seed catalog (W41) — does the
 *      user already have it?
 *
 * Plus the chip copy template + attribution rendering for the
 * Mission screen post-tap.
 *
 * Pure / dependency-free / deterministic.
 */

import type { SearchResult } from "./search-adapter";
import type { ViralCooldownState } from "./viral-cooldown";
import { evaluateCooldown } from "./viral-cooldown";
import { classifyVirality, type ClassifyOptions } from "./virality-classifier";
import { recipeDedupHash, type DedupShape } from "./recipe-dedup";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Score threshold the W42 plan calls for. Above this fires
 *  the chip; below suppresses. */
export const VIRALITY_FIRE_THRESHOLD = 0.7;

/** Max same-cuisine cook concentration in the last 14 days
 *  before we hold the chip. The plan calls for < 80% — i.e. a
 *  user who cooked 9 of 10 italian meals in the last fortnight
 *  doesn't need another italian viral suggestion. */
export const CUISINE_CONCENTRATION_HOLD_RATIO = 0.8;
export const CONCENTRATION_LOOKBACK_DAYS = 14;

export interface ViralChipInputs {
  /** The candidate viral recipe to consider. */
  candidate: ViralCandidate;
  /** Current cool-down state for this user. */
  cooldown: ViralCooldownState;
  /** Household dietary union — empty when no constraint. */
  dietaryUnion: ReadonlyArray<string>;
  /** User's recent cook history (cuisineFamily + completedAt). */
  recentCooks: ReadonlyArray<RecentCookEntry>;
  /** Existing recipes the user already has — drafts + seed
   *  catalog. Dedup will skip the chip when the candidate
   *  matches any of these. */
  existingPool: ReadonlyArray<{ slug: string } & DedupShape>;
  /** Reference "now" — tests inject. */
  now: Date;
  /** Optional override for the virality classifier (e.g.
   *  per-locale celebrity allowlist). */
  classifyOptions?: ClassifyOptions;
}

export interface ViralCandidate {
  /** Search-result fields the virality classifier reads. */
  searchResult: SearchResult;
  /** Recipe shape for dedup + dietary filter + chip copy. */
  recipe: DedupShape & {
    /** Slug for the post-tap navigation. */
    slug: string;
    /** Display name on the chip. Different from search title
     *  (which can be article-shaped — "How to make X" — vs
     *  the recipe title we want to show). */
    displayName: string;
    /** Creator / author name for the attribution + chip copy. */
    creator: string;
    /** Original source URL for the "View original" link. */
    sourceUrl: string;
    /** dietaryFlags this recipe is compatible with. */
    dietaryFlags: ReadonlyArray<string>;
  };
}

export interface RecentCookEntry {
  cuisineFamily: string;
  completedAt: string;
}

export type ViralChipDecision =
  | {
      fire: true;
      slug: string;
      copy: string;
      attribution: ViralAttribution;
      score: number;
      reasons: string[];
    }
  | { fire: false; reason: string };

export interface ViralAttribution {
  creator: string;
  sourceUrl: string;
  /** Display copy for the Mission-screen attribution line.
   *  Always includes "View original" affordance per the W42
   *  ethics rule. */
  attributionLine: string;
}

/** Pure: should the viral chip render right now?
 *  Returns a single decision object. */
export function evaluateViralChipEligibility(
  inputs: ViralChipInputs,
): ViralChipDecision {
  // 1. Cool-down gate
  const cd = evaluateCooldown(inputs.cooldown, inputs.now);
  if (!cd.fire) {
    return { fire: false, reason: `cool-down: ${cd.reason}` };
  }

  // 2. Virality threshold
  const virality = classifyVirality(
    inputs.candidate.searchResult,
    inputs.classifyOptions ?? { now: inputs.now },
  );
  if (virality.score < VIRALITY_FIRE_THRESHOLD) {
    return {
      fire: false,
      reason: `virality ${virality.score.toFixed(2)} < ${VIRALITY_FIRE_THRESHOLD}`,
    };
  }

  // 3. Dietary union compliance
  const recipeDietFlags = new Set(
    inputs.candidate.recipe.dietaryFlags.map((f) => f.toLowerCase()),
  );
  for (const required of inputs.dietaryUnion) {
    if (!recipeDietFlags.has(required.toLowerCase())) {
      return {
        fire: false,
        reason: `recipe missing required diet flag "${required}"`,
      };
    }
  }

  // 4. Cuisine-concentration check
  const concentration = sameCuisineConcentration(
    inputs.recentCooks,
    inputs.candidate.recipe.cuisineFamily,
    inputs.now,
  );
  if (concentration >= CUISINE_CONCENTRATION_HOLD_RATIO) {
    return {
      fire: false,
      reason: `${(concentration * 100).toFixed(0)}% same-cuisine in last ${CONCENTRATION_LOOKBACK_DAYS}d`,
    };
  }

  // 5. Dedup against existing pool
  const candHash = recipeDedupHash(inputs.candidate.recipe);
  for (const entry of inputs.existingPool) {
    if (recipeDedupHash(entry) === candHash) {
      return {
        fire: false,
        reason: `already in pool as "${entry.slug}"`,
      };
    }
  }

  // All gates passed. Build the chip + attribution payload.
  const copy = formatViralChipCopy({
    creator: inputs.candidate.recipe.creator,
    dish: inputs.candidate.recipe.displayName,
  });
  const attribution = formatAttribution({
    creator: inputs.candidate.recipe.creator,
    sourceUrl: inputs.candidate.recipe.sourceUrl,
  });
  return {
    fire: true,
    slug: inputs.candidate.recipe.slug,
    copy,
    attribution,
    score: virality.score,
    reasons: virality.reasons,
  };
}

/** Pure: same-cuisine concentration over the lookback window.
 *  Returns 0..1 — fraction of recent cooks that share the
 *  given cuisine. 0 when no recent cooks. */
export function sameCuisineConcentration(
  recentCooks: ReadonlyArray<RecentCookEntry>,
  cuisineFamily: string,
  now: Date,
): number {
  const cutoff = now.getTime() - CONCENTRATION_LOOKBACK_DAYS * DAY_MS;
  const target = cuisineFamily.toLowerCase();
  let total = 0;
  let same = 0;
  for (const c of recentCooks) {
    if (typeof c.completedAt !== "string") continue;
    const ts = new Date(c.completedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    if (ts < cutoff || ts > now.getTime()) continue;
    total += 1;
    if (c.cuisineFamily.toLowerCase() === target) same += 1;
  }
  return total === 0 ? 0 : same / total;
}

/** Pure: chip copy template per the W42 plan.
 *
 *  "Did you hear about ${creator}'s viral ${dish}? Make it tonight →"
 *
 *  Curiosity-styled per the plan's ethics rule — never
 *  FOMO-styled ("everyone's making this except you"). */
export function formatViralChipCopy(opts: {
  creator: string;
  dish: string;
}): string {
  const creator = opts.creator.trim();
  const dish = opts.dish.trim();
  if (creator.length === 0) {
    return `Did you hear about the viral ${dish}? Make it tonight →`;
  }
  return `Did you hear about ${creator}'s viral ${dish}? Make it tonight →`;
}

/** Pure: attribution payload for the Mission screen post-tap.
 *  Always includes the source URL + creator credit + a "View
 *  original" affordance per the W42 ethics rule. */
export function formatAttribution(opts: {
  creator: string;
  sourceUrl: string;
}): ViralAttribution {
  const creator = opts.creator.trim();
  const sourceUrl = opts.sourceUrl.trim();
  const attributionLine =
    creator.length === 0
      ? `Source: ${sourceUrl} — View original`
      : `Recipe by ${creator}. Source: ${sourceUrl} — View original`;
  return { creator, sourceUrl, attributionLine };
}
