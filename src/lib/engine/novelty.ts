/**
 * Daily novelty engine MVP scaffold (Y3 W8 — substrate V1).
 *
 * Implements feature 1.2 from the pantry-novelty plan: surface
 * ONE suggested combination per day from the user's current
 * pantry that they almost certainly have not tried.
 *
 * The full engine has three scoring components:
 *   1. Aroma-compound pairing score (W17 expands this with a
 *      curated 120-class seed catalog).
 *   2. User familiarity discount (recent cooks lower novelty).
 *   3. Recent-suggestion cool-down (avoid same suggestion in
 *      a 30-day window).
 *
 * The MVP V1 ships the SHAPE of all three with deterministic
 * V1 stubs:
 *   - Aroma scoring is a tiny in-process table with ~12 entries
 *     covering common pantry pairs. Plenty for the scaffold to
 *     surface in stub-mode demos.
 *   - Dish-shape mapping is a tiny in-process pattern table.
 *     W18 expands this to the full 200-pattern catalog.
 *
 * The V1 contract (signature + return shape) is what the W19
 * surface consumes; the W17/W18 catalog expansions plug into
 * these helpers without surface changes.
 *
 * Pure / dependency-free / deterministic.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Composite-score threshold above which the daily card is
 *  surfaced. Below this the chip simply doesn't render — never
 *  filled with a stale fallback. */
export const NOVELTY_FIRE_THRESHOLD = 0.65;

/** Days within which a previously-surfaced suggestion is
 *  blocked from re-emission. Same-recipe re-suggestion within
 *  the window feels stale. */
export const NOVELTY_REPEAT_COOLDOWN_DAYS = 30;

/** Minimum number of distinct pantry items required before the
 *  engine attempts a suggestion. Below this the user is in
 *  cold-start; the chip stays silent rather than scraping the
 *  bottom of a sparse pantry. */
export const NOVELTY_MIN_PANTRY = 4;

export interface NoveltyInput {
  /** Current pantry, normalised ingredient names. */
  pantry: ReadonlyArray<string>;
  /** Recent cook slugs (last ~30 days). Suggestions whose
   *  ingredient set is a subset of any recent cook get
   *  familiarity-discounted out. */
  recentCookIngredientSets: ReadonlyArray<ReadonlyArray<string>>;
  /** Recently-surfaced suggestion ids — used for cool-down. */
  recentSuggestionIds: ReadonlyArray<{ id: string; surfacedAt: string }>;
  /** Reference "now" for cool-down arithmetic. */
  now: Date;
}

export interface NoveltyResult {
  /** Stable id for cool-down dedup. Format: "novelty-<sorted-
   *  ingredient-names-hyphenated>". */
  id: string;
  /** Three or four pantry items the suggestion is built from. */
  ingredients: ReadonlyArray<string>;
  /** Display name of the suggested dish. */
  suggestedDishName: string;
  /** Coarse dish type ("sandwich" / "salad" / "snack-board"). */
  suggestedDishType: string;
  /** Composite score, 0..1. */
  noveltyScore: number;
  /** One-sentence pairing rationale for the expanded card. */
  pairingExplanation: string;
  /** Estimated prep time in minutes. */
  prepTimeMinutes: number;
}

/** Tiny dish-shape pattern table — V1 stub. W18 expands. Each
 *  pattern: required ingredients (lowercase + must all be in
 *  pantry), dish name, dish type, prep time, pairing prose. */
interface DishShapePattern {
  requiredAny: ReadonlyArray<ReadonlyArray<string>>;
  /** Each inner array is a SET of acceptable substitutes for
   *  that slot — at least one must be in pantry. */
  dishName: string;
  dishType: string;
  prepTimeMinutes: number;
  pairingExplanation: string;
}

const DISH_PATTERNS: ReadonlyArray<DishShapePattern> = [
  {
    requiredAny: [
      ["ham", "prosciutto", "salami"],
      ["sharp cheese", "cheddar", "gruyere", "manchego"],
      ["pear", "apple", "fig"],
    ],
    dishName: "Argyle pear & sharp-cheese sandwich",
    dishType: "sandwich",
    prepTimeMinutes: 8,
    pairingExplanation:
      "Salty cured meat, sharp cheese, and ripe stone-fruit share fruity-sweet aroma compounds.",
  },
  {
    requiredAny: [
      ["tomato", "tomatoes", "cherry tomato"],
      ["mozzarella", "burrata"],
      ["basil"],
    ],
    dishName: "Caprese plate with torn herbs",
    dishType: "salad",
    prepTimeMinutes: 6,
    pairingExplanation:
      "The summer-bright tomato + milky cheese pairing leans on shared green-fresh aroma notes.",
  },
  {
    requiredAny: [
      ["chickpeas", "garbanzo"],
      ["lemon", "lemon zest"],
      ["olive oil"],
    ],
    dishName: "Smashed chickpea + lemon snack-board",
    dishType: "snack-board",
    prepTimeMinutes: 10,
    pairingExplanation:
      "Toasty legume meets bright citrus through complementary herbal-citrus volatiles.",
  },
  {
    requiredAny: [
      ["eggs", "egg"],
      ["spinach", "kale", "swiss chard"],
      ["feta", "goat cheese"],
    ],
    dishName: "Greens + feta egg scramble",
    dishType: "skillet",
    prepTimeMinutes: 12,
    pairingExplanation:
      "Earthy greens balance briny cheese; eggs carry the savoury frame.",
  },
  {
    requiredAny: [["greek yogurt", "yogurt"], ["cucumber"], ["dill", "mint"]],
    dishName: "Cool yogurt-cucumber dip",
    dishType: "dip",
    prepTimeMinutes: 7,
    pairingExplanation:
      "Fresh herbal volatiles bridge tangy yogurt and crisp cucumber.",
  },
  {
    requiredAny: [
      ["bread", "sourdough", "ciabatta"],
      ["avocado"],
      ["lemon", "lime"],
    ],
    dishName: "Avocado smash on toast",
    dishType: "toast",
    prepTimeMinutes: 5,
    pairingExplanation:
      "Buttery fat + citrus brightness against toasted bread structure.",
  },
];

/** Pure: does the pantry cover this required-any pattern?
 *  Each `requiredAny` slot is a SET of acceptable substitutes;
 *  at least one of them must be in pantry. Returns the
 *  matched ingredients (one per slot) when feasible, null
 *  otherwise. */
function matchPattern(
  pattern: DishShapePattern,
  pantrySet: ReadonlySet<string>,
): string[] | null {
  const matched: string[] = [];
  for (const slot of pattern.requiredAny) {
    let hit: string | null = null;
    for (const candidate of slot) {
      if (pantrySet.has(candidate)) {
        hit = candidate;
        break;
      }
    }
    if (!hit) return null;
    matched.push(hit);
  }
  return matched;
}

/** Pure: stable id for cool-down dedup. Sorted ingredient
 *  names hyphenated, with a "novelty-" prefix. */
function buildSuggestionId(ingredients: ReadonlyArray<string>): string {
  return (
    "novelty-" +
    [...ingredients]
      .map((s) => s.toLowerCase().replace(/\s+/g, "-"))
      .sort()
      .join("-")
  );
}

/** Pure: is a candidate id within the cool-down window? */
function isWithinCooldown(
  id: string,
  recentSuggestions: ReadonlyArray<{ id: string; surfacedAt: string }>,
  now: Date,
): boolean {
  const cutoff = now.getTime() - NOVELTY_REPEAT_COOLDOWN_DAYS * DAY_MS;
  for (const r of recentSuggestions) {
    if (r.id !== id) continue;
    const ts = new Date(r.surfacedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    if (ts >= cutoff) return true;
  }
  return false;
}

/** Pure: how familiar is this combination from the user's
 *  recent cooks? 1.0 = totally novel, 0.5 = the user's recent
 *  cooks include 2+ of the same ingredients, 0.0 = the user
 *  has cooked exactly this combination recently. */
function familiarityDiscount(
  ingredients: ReadonlyArray<string>,
  recentSets: ReadonlyArray<ReadonlyArray<string>>,
): number {
  if (recentSets.length === 0) return 1;
  const cand = new Set(ingredients.map((s) => s.toLowerCase()));
  let maxOverlap = 0;
  for (const recent of recentSets) {
    let overlap = 0;
    for (const r of recent) {
      if (cand.has(r.toLowerCase())) overlap += 1;
    }
    if (overlap > maxOverlap) maxOverlap = overlap;
  }
  // 0 overlap → 1.0; 1 overlap → 0.85; 2 → 0.6; 3+ → 0.3
  if (maxOverlap === 0) return 1;
  if (maxOverlap === 1) return 0.85;
  if (maxOverlap === 2) return 0.6;
  return 0.3;
}

/** Pure: pattern-quality score. V1 stub: every pattern in the
 *  table is curated, so quality is 0.9 by default. W17 swaps
 *  this for the aroma-compound cosine-similarity score. */
function patternPairingScore(_pattern: DishShapePattern): number {
  return 0.9;
}

/** Pure: surface the daily novelty suggestion, or null when
 *  there's nothing surprising to say today. */
export function generateDailyNovelty(
  input: NoveltyInput,
): NoveltyResult | null {
  if (input.pantry.length < NOVELTY_MIN_PANTRY) return null;

  const pantrySet = new Set(input.pantry.map((p) => p.toLowerCase()));
  const candidates: NoveltyResult[] = [];

  for (const pattern of DISH_PATTERNS) {
    const matched = matchPattern(pattern, pantrySet);
    if (!matched) continue;

    const id = buildSuggestionId(matched);
    if (isWithinCooldown(id, input.recentSuggestionIds, input.now)) continue;

    const familiarity = familiarityDiscount(
      matched,
      input.recentCookIngredientSets,
    );
    const pairing = patternPairingScore(pattern);
    // Novelty composite — pairing × familiarity × (1.0 base).
    // Bounded to [0, 1]; threshold compared in the consumer.
    const score = Math.min(1, Math.max(0, pairing * familiarity));

    if (score < NOVELTY_FIRE_THRESHOLD) continue;

    candidates.push({
      id,
      ingredients: matched,
      suggestedDishName: pattern.dishName,
      suggestedDishType: pattern.dishType,
      noveltyScore: score,
      pairingExplanation: pattern.pairingExplanation,
      prepTimeMinutes: pattern.prepTimeMinutes,
    });
  }

  if (candidates.length === 0) return null;

  // Pick the top by score; alphabetical tie-break on id for
  // determinism.
  candidates.sort((a, b) => {
    if (b.noveltyScore !== a.noveltyScore) {
      return b.noveltyScore - a.noveltyScore;
    }
    return a.id.localeCompare(b.id);
  });
  return candidates[0] ?? null;
}
