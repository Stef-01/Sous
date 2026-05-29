/**
 * Recipe-source taxonomy (Y5 C foundation).
 *
 * Pure helpers for the Verified-vs-Unverified separation in
 * search results, recipe cards, and Eat Out feeds.
 *
 * Two-tier taxonomy:
 *
 *   "Verified" tier (rendered first; default-visible):
 *     - nourish-verified: catalog seed + clinician-approved
 *     - nourish-curated: catalog seed without clinician review
 *
 *   "Unverified" tier (rendered behind a "See more" expander):
 *     - user-authored: saved from /path/recipes/new
 *     - agent-found: Anthropic+Tavily agent fetched
 *
 * The user is never confused about which tier a recipe belongs
 * to — every Unverified card carries an explicit pill in the
 * top-right with the source kind ("Unverified · agent-found").
 *
 * Pure / dependency-free.
 */

import type {
  RecipeProvenance,
  RecipeSource,
} from "@/types/preference-profile";

/** Pure: classify a source into the two-tier taxonomy. */
export function isVerifiedSource(source: RecipeSource): boolean {
  return source === "nourish-verified" || source === "nourish-curated";
}

/** Pure: short user-facing label for a source kind. */
export function sourceLabel(source: RecipeSource): string {
  switch (source) {
    case "nourish-verified":
      return "Nourish Verified";
    case "nourish-curated":
      return "Curated";
    case "user-authored":
      return "Unverified · user";
    case "agent-found":
      return "Unverified · agent-found";
  }
}

/** Pure: badge tone for the source-kind pill. Drives the
 *  bg/text colour on the card. */
export type SourceBadgeTone =
  | "verified"
  | "curated"
  | "unverified-user"
  | "unverified-agent";

export function sourceBadgeTone(source: RecipeSource): SourceBadgeTone {
  switch (source) {
    case "nourish-verified":
      return "verified";
    case "nourish-curated":
      return "curated";
    case "user-authored":
      return "unverified-user";
    case "agent-found":
      return "unverified-agent";
  }
}

/** Generic recipe-shaped item the partition helper accepts.
 *  Anything with a `provenance` field works. */
export interface SourceTagged {
  provenance?: RecipeProvenance | null;
}

export interface PartitionedResults<T extends SourceTagged> {
  /** Verified tier — rendered first in the UI. */
  verified: ReadonlyArray<T>;
  /** Unverified tier — rendered behind a "See more" expander. */
  unverified: ReadonlyArray<T>;
}

/** Pure: split a list of search/recipe results into the two
 *  tiers. Items missing provenance default to verified
 *  (catalog-seeded recipes typically don't carry an explicit
 *  provenance object — only agent-found + user-authored ones do). */
export function partitionBySourceTier<T extends SourceTagged>(
  items: ReadonlyArray<T>,
): PartitionedResults<T> {
  const verified: T[] = [];
  const unverified: T[] = [];
  for (const item of items) {
    const source = item.provenance?.source;
    if (!source || isVerifiedSource(source)) {
      verified.push(item);
    } else {
      unverified.push(item);
    }
  }
  return { verified, unverified };
}

/** Pure: signal-discount factor when feeding signals from a
 *  cooked Unverified recipe back into the preference profile.
 *  Agent-found recipes carry coarser tagging than the catalog
 *  so we discount their contribution. */
export function signalDiscountForSource(source: RecipeSource): number {
  switch (source) {
    case "nourish-verified":
      return 1.0; // full weight
    case "nourish-curated":
      return 1.0;
    case "user-authored":
      return 0.7; // user's own tagging — moderate trust
    case "agent-found":
      return 0.5; // agent tagging — half weight
  }
}

/** Pure: build an info-sheet message for the "Why this is marked
 *  unverified" tap. Used by the per-card pill detail. */
export function buildSourceInfoCopy(provenance: RecipeProvenance): string {
  switch (provenance.source) {
    case "nourish-verified":
      return "This recipe was reviewed by a Nourish-affiliated clinician and meets our nutrition + safety standards.";
    case "nourish-curated":
      return "This recipe is part of the Nourish catalog. It hasn't been clinician-reviewed but follows our internal nutrition guidelines.";
    case "user-authored":
      return "This recipe was authored by a Nourish user. It hasn't been verified by our team.";
    case "agent-found": {
      const src = provenance.sourceTitle
        ? ` from ${provenance.sourceTitle}`
        : provenance.sourceUrl
          ? ` from ${new URL(provenance.sourceUrl).hostname}`
          : "";
      const note = provenance.agentNote ? ` ${provenance.agentNote}` : "";
      return `This recipe was found by our agent on the web${src}. It hasn't been verified by our team.${note}`;
    }
  }
}
