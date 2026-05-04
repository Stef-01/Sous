/**
 * Seasonal tag derivation (Y2 Sprint C W12).
 *
 * The W11 time-of-day rerank looks for explicit season tags on
 * candidate sides ("winter-warming", "summer-fresh", etc.) and
 * gives a small +0.02 nudge when the candidate's tag matches the
 * current season. Most sides in the seed catalog don't carry
 * those tags directly — they have generic tags like "soup",
 * "stew", "salad", "roasted", and a description that hints at
 * temperature.
 *
 * This module is the bridge: a pure helper that scans existing
 * tags + description keywords and DERIVES seasonal tags. The
 * pairing pipeline calls this once per candidate, merges the
 * derived tags with the side's original tags, and the rerank
 * sees a richer signal without requiring catalog re-tagging.
 *
 * Pure / dependency-free / deterministic.
 */

export type DerivedSeasonalTag =
  | "winter-warming"
  | "summer-fresh"
  | "spring-fresh"
  | "autumn-pick";

/** Tags that strongly imply the dish is winter-warming. */
const WINTER_TAG_HINTS: ReadonlyArray<string> = [
  "soup",
  "stew",
  "braise",
  "braised",
  "roast",
  "roasted",
  "baked",
  "warming",
  "comfort",
  "rich",
  "hearty",
  "winter",
];

/** Description keyword fragments that imply winter-warming. */
const WINTER_DESC_HINTS: ReadonlyArray<string> = [
  "warm",
  "warming",
  "hearty",
  "comforting",
  "rich",
  "slow-cooked",
  "slow cooked",
  "braised",
  "roasted",
  "baked",
  "simmered",
];

/** Tags that strongly imply summer-fresh. */
const SUMMER_TAG_HINTS: ReadonlyArray<string> = [
  "salad",
  "fresh",
  "raw",
  "no-cook",
  "no cook",
  "chilled",
  "cold",
  "summer",
  "refreshing",
  "light",
  "ceviche",
  "gazpacho",
];

/** Description keyword fragments that imply summer-fresh. */
const SUMMER_DESC_HINTS: ReadonlyArray<string> = [
  "fresh",
  "crisp",
  "raw",
  "chilled",
  "cold",
  "refreshing",
  "light",
  "no-cook",
  "no cook",
];

/** Tags that imply spring-fresh — narrower than summer because
 *  spring still includes some warming dishes (asparagus risotto,
 *  pea soup). Strong hints only. */
const SPRING_TAG_HINTS: ReadonlyArray<string> = [
  "spring",
  "asparagus",
  "pea",
  "peas",
  "fava",
  "ramp",
  "ramps",
];

/** Tags that imply autumn-pick. */
const AUTUMN_TAG_HINTS: ReadonlyArray<string> = [
  "autumn",
  "fall",
  "harvest",
  "squash",
  "pumpkin",
  "apple",
  "pear",
  "root",
  "root-veg",
];

/** Pure helper: lowercase + dedupe a list of tags. */
function normaliseTags(tags: ReadonlyArray<string>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t of tags) {
    const lower = t.toLowerCase().trim();
    if (lower.length === 0 || seen.has(lower)) continue;
    seen.add(lower);
    out.push(lower);
  }
  return out;
}

/** Pure helper: does any of the candidate's tags / description
 *  match any of the hint patterns? Case-insensitive substring on
 *  the description, exact-match on tags. Tags are checked first
 *  (cheaper) so the description pass can short-circuit. */
function matchesAnyHint(
  tags: ReadonlyArray<string>,
  description: string,
  tagHints: ReadonlyArray<string>,
  descHints: ReadonlyArray<string>,
): boolean {
  const normalisedTags = new Set(normaliseTags(tags));
  for (const hint of tagHints) {
    if (normalisedTags.has(hint.toLowerCase())) return true;
  }
  const lowerDesc = description.toLowerCase();
  for (const hint of descHints) {
    if (lowerDesc.includes(hint.toLowerCase())) return true;
  }
  return false;
}

/** Derive seasonal tags for a candidate side from its existing
 *  tags + description. Returns an array of derived tags
 *  (possibly empty). A side can match multiple seasons — e.g.
 *  a "spring pea soup" hits both spring (peas) AND winter
 *  (soup-warming). Both tags are returned so the rerank can
 *  apply the right one for the current season.
 *
 *  Exported for use in the pairing-engine pipeline + tests. */
export function deriveSeasonalTags(side: {
  tags: ReadonlyArray<string>;
  description?: string | null;
}): DerivedSeasonalTag[] {
  const description = (side.description ?? "").trim();
  const out: DerivedSeasonalTag[] = [];

  if (
    matchesAnyHint(side.tags, description, WINTER_TAG_HINTS, WINTER_DESC_HINTS)
  ) {
    out.push("winter-warming");
  }
  if (
    matchesAnyHint(side.tags, description, SUMMER_TAG_HINTS, SUMMER_DESC_HINTS)
  ) {
    out.push("summer-fresh");
  }
  // Spring + autumn use tag-only hints (description signal is too
  // weak to be reliable for transitional seasons).
  if (matchesAnyHint(side.tags, description, SPRING_TAG_HINTS, [])) {
    out.push("spring-fresh");
  }
  if (matchesAnyHint(side.tags, description, AUTUMN_TAG_HINTS, [])) {
    out.push("autumn-pick");
  }

  return out;
}

/** Pure helper: enrich a side's tags array with derived seasonal
 *  tags. Returns a NEW array (no mutation) preserving original
 *  tag order and de-duping the new entries. Pass this into the
 *  W11 time-rerank's `side.tags` slot to give it the richer
 *  seasonal signal. */
export function enrichTagsWithSeasonal(side: {
  tags: ReadonlyArray<string>;
  description?: string | null;
}): string[] {
  const derived = deriveSeasonalTags(side);
  if (derived.length === 0) return [...side.tags];
  const merged = [...side.tags, ...derived];
  return normaliseTags(merged);
}
