/**
 * Weekly pod-challenge themes — Sprint G (Y5 W25–W28).
 *
 * Pod challenges 2.0: instead of "this week's recipe is X",
 * each ISO week rotates through a curated theme that gives the
 * pod a shared frame. Themes are deterministic per ISO-week
 * key, so every pod sees the same theme on the same week and
 * leaderboards stack apples-to-apples.
 *
 * The rotation cycles through the catalog modulo size so a
 * 6-theme catalog repeats every six weeks. Adding more themes
 * extends the unique-rotation window without breaking
 * deterministic resolution for past weeks.
 *
 * Pure / dependency-free / deterministic.
 */

export interface WeeklyTheme {
  /** Stable URL-safe slug — leaderboards key off this. */
  slug: string;
  /** User-facing title shown on the pod home + theme banner. */
  title: string;
  /** 1-line hook copy. */
  blurb: string;
  /** Recipe-slug allow-list — pods are nudged toward these
   *  picks for the week. Empty array = "any catalog dish". */
  suggestedRecipeSlugs: ReadonlyArray<string>;
  /** Optional twist that pairs naturally with the theme
   *  (matches the pod-store's `twist` enum). null = none. */
  suggestedTwist: string | null;
  /** Emoji for compact surfaces (banner pill, share grid). */
  emoji: string;
}

/**
 * Curated 6-theme starter rotation. Real seasonal layering +
 * sponsored slots land in Sprint G follow-up. Each theme has
 * a recipe-slug allow-list; the slugs are drawn from the
 * existing catalog so the pod-tile recipe pin works without
 * extra data.
 */
export const POD_WEEKLY_THEMES: ReadonlyArray<WeeklyTheme> = [
  {
    slug: "plant-forward-week",
    title: "Plant-forward week",
    blurb: "Cook once with vegetables as the headline — beans, greens, grains.",
    suggestedRecipeSlugs: [
      "asparagus-stir-fry-subzi",
      "bell-pepper-curry",
      "masoor-dal",
    ],
    suggestedTwist: "vegetarian",
    emoji: "🌱",
  },
  {
    slug: "one-pot-week",
    title: "One-pot week",
    blurb: "Less washing-up. Pick a recipe that lives in a single pan or pot.",
    suggestedRecipeSlugs: ["masoor-dal", "bell-pepper-curry"],
    suggestedTwist: "leftover-mode",
    emoji: "🥘",
  },
  {
    slug: "thirty-min-weeknights",
    title: "30-minute weeknights",
    blurb: "Ship dinner in half an hour. Fast-cook proteins, quick sides.",
    suggestedRecipeSlugs: ["asparagus-stir-fry-subzi", "tacos-al-pastor"],
    suggestedTwist: "budget",
    emoji: "⏱️",
  },
  {
    slug: "global-comfort",
    title: "Global comfort week",
    blurb: "A bowl of something cosy from somewhere new.",
    suggestedRecipeSlugs: ["masoor-dal", "bell-pepper-curry"],
    suggestedTwist: null,
    emoji: "🍲",
  },
  {
    slug: "kids-cook",
    title: "Kids cook week",
    blurb: "Pick a recipe a kid can lead — hands-on, low-stakes prep.",
    suggestedRecipeSlugs: ["tacos-al-pastor"],
    suggestedTwist: "kids-cook",
    emoji: "👧",
  },
  {
    slug: "spicy-week",
    title: "Bring the heat",
    blurb: "Lean into chillies, curry leaves, peppercorn — turn the heat up.",
    suggestedRecipeSlugs: ["bell-pepper-curry", "tacos-al-pastor"],
    suggestedTwist: "spicy",
    emoji: "🌶️",
  },
];

/** Pure: parse an ISO-8601 week key ("2026-W18") into a
 *  monotonic integer suitable for modulo rotation. Returns 0
 *  on malformed input so the rotator falls back to the first
 *  theme rather than crashing. */
export function weekKeyToOrdinal(weekKey: string): number {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekKey);
  if (!m) return 0;
  const year = Number(m[1]);
  const week = Number(m[2]);
  if (!Number.isFinite(year) || !Number.isFinite(week)) return 0;
  // 53 weeks/year max (ISO 8601). Multiplying by 53 keeps
  // year boundaries monotonic; the modulo applied later
  // collapses everything to [0, catalog.length).
  return year * 53 + week;
}

/** Pure: resolve which theme is active for a given ISO week. */
export function resolveWeeklyTheme(input: {
  weekKey: string;
  catalog?: ReadonlyArray<WeeklyTheme>;
}): WeeklyTheme {
  const catalog = input.catalog ?? POD_WEEKLY_THEMES;
  if (catalog.length === 0) {
    throw new Error("resolveWeeklyTheme: catalog must be non-empty");
  }
  const ord = weekKeyToOrdinal(input.weekKey);
  const idx = ((ord % catalog.length) + catalog.length) % catalog.length;
  return catalog[idx];
}

/** Pure: does the supplied recipe slug match the active
 *  theme's allow-list? An empty allow-list means "any" — so
 *  this returns true for every slug. */
export function recipeMatchesTheme(input: {
  theme: WeeklyTheme;
  recipeSlug: string;
}): boolean {
  if (input.theme.suggestedRecipeSlugs.length === 0) return true;
  return input.theme.suggestedRecipeSlugs.includes(input.recipeSlug);
}
