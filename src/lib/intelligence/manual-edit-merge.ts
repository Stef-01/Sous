/**
 * Manual-edit merge (Y5 C foundation).
 *
 * Combines inferred-from-signals tag weights with the user's
 * explicit manual edits. The user is always source of truth —
 * ML output is a hint they can edit at any time.
 *
 * Merge precedence (highest first):
 *   1. manualTags.dislikes      -> hard suppress (effective -1.0)
 *   2. manualTags.suppressed    -> "don't infer" (effective 0)
 *   3. manualTags.likes         -> boost to max(0.7, inferredWeight)
 *   4. inferredTags             -> use as-is
 *
 * Pure / dependency-free.
 */

import type {
  InferredTags,
  ManualTags,
  PreferenceProfile,
  TagWeightMap,
} from "@/types/preference-profile";

/** Pure: merge a single axis (cuisines/flavors/proteins/dishClasses)
 *  applying the manual-tag overrides. */
export function mergeAxis(input: {
  inferred: TagWeightMap;
  manual: ManualTags;
}): TagWeightMap {
  const { inferred, manual } = input;
  const dislikeSet = new Set(
    manual.dislikes.map((t) => t.toLowerCase().trim()),
  );
  const suppressSet = new Set(
    manual.suppressed.map((t) => t.toLowerCase().trim()),
  );
  const likeSet = new Set(manual.likes.map((t) => t.toLowerCase().trim()));

  const out: TagWeightMap = {};

  // Walk every tag that appears in either inferred or any manual set
  // so manual-only likes show up in the merged output even when no
  // signals have produced them yet.
  const allTags = new Set<string>([
    ...Object.keys(inferred),
    ...likeSet,
    ...dislikeSet,
  ]);

  for (const tag of allTags) {
    if (dislikeSet.has(tag)) {
      out[tag] = -1; // hard suppress
      continue;
    }
    if (suppressSet.has(tag)) {
      // "don't infer" — omit entirely so downstream consumers
      // treat this as neutral (not negative).
      continue;
    }
    if (likeSet.has(tag)) {
      const inferredW = inferred[tag] ?? 0;
      out[tag] = Math.max(0.7, inferredW);
      continue;
    }
    const w = inferred[tag];
    if (typeof w === "number" && Number.isFinite(w) && w !== 0) {
      out[tag] = Math.max(-1, Math.min(1, w));
    }
  }

  return out;
}

export interface MergedProfile {
  cuisines: TagWeightMap;
  flavors: TagWeightMap;
  proteins: TagWeightMap;
  dishClasses: TagWeightMap;
}

/** Pure: merge an entire PreferenceProfile's inferred + manual tag
 *  layers into the final per-axis maps the recommendation engine
 *  consumes. */
export function mergePreferenceProfile(
  profile: PreferenceProfile,
): MergedProfile {
  return {
    cuisines: mergeAxis({
      inferred: profile.inferredTags.cuisines,
      manual: profile.manualTags,
    }),
    flavors: mergeAxis({
      inferred: profile.inferredTags.flavors,
      manual: profile.manualTags,
    }),
    proteins: mergeAxis({
      inferred: profile.inferredTags.proteins,
      manual: profile.manualTags,
    }),
    dishClasses: mergeAxis({
      inferred: profile.inferredTags.dishClasses,
      manual: profile.manualTags,
    }),
  };
}

/** Pure: convenience predicate. Is `tag` effectively suppressed
 *  (dislike OR suppressed OR not surfaced)? */
export function isTagSuppressed(input: {
  tag: string;
  manual: ManualTags;
}): boolean {
  const lc = input.tag.toLowerCase().trim();
  return (
    input.manual.dislikes.map((t) => t.toLowerCase().trim()).includes(lc) ||
    input.manual.suppressed.map((t) => t.toLowerCase().trim()).includes(lc)
  );
}

/** Pure: helpers for the Profile editor UI. Add/remove a tag from
 *  the appropriate manual list. Returns a new ManualTags object —
 *  never mutates input. */
export function applyEditAction(input: {
  manual: ManualTags;
  action:
    | { kind: "like"; tag: string }
    | { kind: "dislike"; tag: string }
    | { kind: "suppress"; tag: string }
    | { kind: "clear-like"; tag: string }
    | { kind: "clear-dislike"; tag: string }
    | { kind: "clear-suppress"; tag: string };
}): ManualTags {
  const lc = input.action.tag.toLowerCase().trim();
  if (!lc) return input.manual;

  const without = (list: ReadonlyArray<string>): string[] =>
    list.filter((t) => t.toLowerCase().trim() !== lc);
  const withTag = (list: ReadonlyArray<string>): string[] =>
    without(list).concat([lc]);

  switch (input.action.kind) {
    case "like":
      // Adding a like clears any matching dislike/suppress to keep
      // the three lists mutually exclusive.
      return {
        likes: withTag(input.manual.likes),
        dislikes: without(input.manual.dislikes),
        suppressed: without(input.manual.suppressed),
      };
    case "dislike":
      return {
        likes: without(input.manual.likes),
        dislikes: withTag(input.manual.dislikes),
        suppressed: without(input.manual.suppressed),
      };
    case "suppress":
      return {
        likes: without(input.manual.likes),
        dislikes: without(input.manual.dislikes),
        suppressed: withTag(input.manual.suppressed),
      };
    case "clear-like":
      return { ...input.manual, likes: without(input.manual.likes) };
    case "clear-dislike":
      return { ...input.manual, dislikes: without(input.manual.dislikes) };
    case "clear-suppress":
      return { ...input.manual, suppressed: without(input.manual.suppressed) };
  }
}

/** Pure: which manual list (if any) currently contains the tag.
 *  Used by the Profile editor to render the right interaction
 *  state on each chip. */
export function classifyManualState(input: {
  tag: string;
  manual: ManualTags;
}): "liked" | "disliked" | "suppressed" | "none" {
  const lc = input.tag.toLowerCase().trim();
  if (input.manual.likes.map((t) => t.toLowerCase().trim()).includes(lc))
    return "liked";
  if (input.manual.dislikes.map((t) => t.toLowerCase().trim()).includes(lc))
    return "disliked";
  if (input.manual.suppressed.map((t) => t.toLowerCase().trim()).includes(lc))
    return "suppressed";
  return "none";
}

/** Pure: compute the InferredTags layer with manual-suppressed
 *  tags removed (used when persisting after a "suppress" action
 *  so the user's preference doesn't get re-inferred from new
 *  signals immediately). The aggregator still produces the raw
 *  weights — this scrubs them at write time. */
export function applySuppressionsToInferred(input: {
  inferred: InferredTags;
  manual: ManualTags;
}): InferredTags {
  const suppressSet = new Set(
    input.manual.suppressed.map((t) => t.toLowerCase().trim()),
  );
  const dislikeSet = new Set(
    input.manual.dislikes.map((t) => t.toLowerCase().trim()),
  );

  const scrub = (m: TagWeightMap): TagWeightMap => {
    const out: TagWeightMap = {};
    for (const [tag, w] of Object.entries(m)) {
      const lc = tag.toLowerCase().trim();
      if (suppressSet.has(lc) || dislikeSet.has(lc)) continue;
      out[tag] = w;
    }
    return out;
  };

  return {
    cuisines: scrub(input.inferred.cuisines),
    flavors: scrub(input.inferred.flavors),
    proteins: scrub(input.inferred.proteins),
    dishClasses: scrub(input.inferred.dishClasses),
  };
}
