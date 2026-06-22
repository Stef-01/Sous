/**
 * Quest dish-pool logic — the data + scoring layer extracted VERBATIM from
 * quest-card.tsx so the component owns the view, not the pool-building. Pure
 * (no JSX, no hooks): builds the swipe-card candidate pool from the catalog,
 * scores it by preferences / pantry-fit / difficulty, and rotates it daily.
 * `QuestDish` is imported type-only, so there is no runtime import cycle with
 * quest-card.
 */

import { normalizePantryName } from "@/lib/hooks/use-pantry";
import { scoreDifficultyAlignment } from "@/lib/hooks/use-difficulty-progression";
import {
  getCookSummary,
  getMealCookSummary,
  getAvailableCookSlugs,
} from "@/data/guided-cook-summary";
import { sides, meals } from "@/data";
import {
  mealDaypartFromHour,
  type MealDaypart,
} from "@/lib/engine/craving-for-now";
import type { WeatherSnapshot } from "@/lib/weather/weather-adapter";
import {
  weatherTempLean,
  dishTempProfile,
  dishMatchesWeather,
  type WeatherLean,
} from "@/lib/weather/weather-bias";
import type { QuestDish } from "./quest-card";

// ── Context reorder weights (the hunger / weather / crave-it spine) ──────────
// Tuned to break ties + reorder near-equal candidates without leapfrogging a
// quality signal (a hero image is worth 10): a daypart-eligible dish leads, the
// weather nudges the temperature axis, and a saved dish resurfaces — amplified
// when the weather matches what you craved ("save a cold dish → it comes back
// when it's hot").
//
// On-by-default split: the DAYPART (hunger) reorder is ALWAYS on — that's the
// "enable hunger-aware deck reorder" ask, so the deck always honours the time of
// day, exactly like the legacy timeOfDayBoost it strengthens. The WEATHER and
// CRAVE-IT terms are contextual and contribute 0 until the user opts into
// weather (snapshot null → neutral lean) or saves a dish — so toggling weather
// off / saving nothing leaves only the daypart nudge.
const DAYPART_BOOST = 8;
const WEATHER_BOOST = 4;
const SAVED_BASE_BOOST = 3;
const SAVED_WEATHER_BOOST = 5;
// Who's at the table tonight: lean the deck toward a cuisine the selected
// household members share (the W37 table aggregate). 0 when no table is set.
const TABLE_CUISINE_BOOST = 5;
// Spice safety: when the least-tolerant member at the table can't handle heat
// (minSpiceTolerance ≤ 2), de-prioritize dishes the description marks "spicy".
const LOW_SPICE_THRESHOLD = 2;
const SPICE_INTOLERANT_PENALTY = 6;

/** The live context the deck reorders against — the daypart, the weather lean,
 *  the user's saved ("craved") dishes, and tonight's household table (the
 *  cuisines it leans toward + the lowest spice tolerance among the diners). */
export interface DeckContext {
  daypart: MealDaypart;
  weatherLean: WeatherLean;
  savedSlugs: Set<string>;
  /** Lowercased cuisine families the table leans toward (household members
   *  eating tonight). Empty → no table tilt. */
  tableCuisines: ReadonlySet<string>;
  /** Lowest spice tolerance (1–5) among the members at the table; 5 = no
   *  restriction (the default when no table is set). */
  tableMinSpice: number;
}

/** Pure reorder boost for a dish given the live context. Tested directly
 *  (no Date / no fetch) so the three behaviours are pinned independently. The
 *  dish shape is loose on purpose — both a QuestDish (`Daypart[]`) and a test
 *  fixture (`string[]`) satisfy it. */
export function contextBoost(
  dish: {
    slug: string;
    cuisineFamily?: string;
    tags?: string[];
    description?: string;
    dayparts?: readonly string[];
  },
  ctx: DeckContext,
): number {
  let boost = 0;

  // Hunger-aware: a meal authored for the current daypart leads the deck.
  if (dish.dayparts && dish.dayparts.includes(ctx.daypart)) {
    boost += DAYPART_BOOST;
  }

  // Weather-aware: hot → cold/fresh dishes; cold·rain·snow → warm/comfort.
  const temp = dishTempProfile(dish);
  const matchesWeather = dishMatchesWeather(ctx.weatherLean, temp);
  if (matchesWeather) boost += WEATHER_BOOST;

  // Crave-it resurface: a saved dish comes back, amplified when the weather
  // matches its character (the Zeigarnik open loop the save opened).
  if (ctx.savedSlugs.has(dish.slug)) {
    boost += SAVED_BASE_BOOST;
    if (matchesWeather) boost += SAVED_WEATHER_BOOST;
  }

  // Who's-at-the-table: lean toward a cuisine the household eating tonight
  // shares (the W37 table aggregate — dietary was already wired into the deck,
  // the cuisine side was computed but never fed in).
  if (
    ctx.tableCuisines.size > 0 &&
    dish.cuisineFamily &&
    ctx.tableCuisines.has(dish.cuisineFamily.toLowerCase())
  ) {
    boost += TABLE_CUISINE_BOOST;
  }

  // Spice safety: if the least-tolerant member at the table can't take heat,
  // push explicitly-spicy dishes down (the W37 minSpiceTolerance — also computed
  // but never fed to the deck). The "spicy" tag is set when the description is.
  if (
    ctx.tableMinSpice <= LOW_SPICE_THRESHOLD &&
    dish.tags?.some((t) => t.toLowerCase() === "spicy")
  ) {
    boost -= SPICE_INTOLERANT_PENALTY;
  }

  return boost;
}

/** A dish goes STRAIGHT to the guided cook only when it has cook steps AND
 *  isn't a main — mains route to /sides first to build a plate. This mirrors
 *  the routing in quest-card's `routeDish`, so the deck's action LABEL can never
 *  drift from where the button actually sends you. */
export function goesStraightToCook(
  dish: Pick<QuestDish, "hasGuidedCook" | "isMeal">,
): boolean {
  return dish.hasGuidedCook && !dish.isMeal;
}

/** The deck's primary swipe-action label. Eat-out logs; a straight-to-cook dish
 *  cooks; everything else (mains, and no-cook sides) builds a plate via /sides —
 *  so "Cook" never lies about opening the side-picker. */
export function primaryActionLabel(
  dish: Pick<QuestDish, "hasGuidedCook" | "isMeal" | "eatOut">,
): "Log it" | "Cook" | "Build plate" {
  if (dish.eatOut) return "Log it";
  return goesStraightToCook(dish) ? "Cook" : "Build plate";
}

/** Build up to 3 descriptive tags for a meal from cuisine + description.
 *  Used by buildQuestDishes when assembling the candidate pool. */
function buildMealTags(
  cuisine: string,
  description: string,
  poolSize: number,
): string[] {
  const tags = [cuisine];
  const desc = description.toLowerCase();
  const flavorWords: [string, string][] = [
    ["spicy", "Spicy"],
    ["creamy", "Creamy"],
    ["crispy", "Crispy"],
    ["smoky", "Smoky"],
    ["tangy", "Tangy"],
    ["savory", "Savory"],
    ["rich", "Rich"],
    ["fresh", "Fresh"],
    ["aromatic", "Aromatic"],
    ["tender", "Tender"],
    ["grilled", "Grilled"],
    ["braised", "Braised"],
    ["fried", "Fried"],
    ["steamed", "Steamed"],
    ["roasted", "Roasted"],
  ];
  for (const [word, label] of flavorWords) {
    if (desc.includes(word) && tags.length < 3) tags.push(label);
  }
  if (tags.length < 3 && poolSize > 6) tags.push("Popular");
  return tags.slice(0, 3);
}

const PANTRY_FIT_BOOST_THRESHOLD = 0.6;
const PANTRY_FIT_BOOST_WEIGHT = 6; // ranks a strong pantry fit above most tag matches

export function computePantryFit(
  ingredientNames: string[],
  pantrySet: Set<string>,
): number {
  if (ingredientNames.length === 0 || pantrySet.size === 0) return 0;
  let hits = 0;
  for (const n of ingredientNames) {
    if (pantrySet.has(n)) hits++;
  }
  return hits / ingredientNames.length;
}

const CUISINE_TAGS = [
  "italian",
  "indian",
  "japanese",
  "korean",
  "thai",
  "chinese",
  "mexican",
  "mediterranean",
  "vietnamese",
  "filipino",
];

/**
 * Quiz answer → cuisine family boost map.
 * "Bold and spicy" (spicy:0.8) also covers Mexican/Thai/Indian families.
 * "Fresh and bright" (fresh:0.7) also covers Mediterranean/Japanese.
 * "Rich and indulgent" (rich:0.7) also covers Italian/comfort.
 * "Light and healthy" (vegetable:0.6) deprioritizes fried/carb-heavy.
 */
const PREF_KEY_TO_CUISINES: Record<string, string[]> = {
  spicy: ["mexican", "thai", "indian", "korean", "chinese"],
  fresh: ["mediterranean", "japanese", "vietnamese"],
  rich: ["italian", "comfort-classic"],
  creamy: ["italian", "comfort-classic"],
  vegetable: ["mediterranean", "japanese", "vietnamese"],
  japanese: ["japanese"],
  korean: ["korean"],
  thai: ["thai"],
  indian: ["indian"],
  mediterranean: ["mediterranean"],
  italian: ["italian"],
  mexican: ["mexican"],
};

/**
 * Score a dish against the user's preference vector.
 * Checks dish tags, cuisine family, and explicit quiz-answer cuisine mappings.
 */
function scoreDishForPreferences(
  dish: QuestDish,
  prefs: Record<string, number>,
): number {
  let score = 0;
  const cuisine = dish.cuisineFamily.toLowerCase();
  const allTags = [...dish.tags.map((t) => t.toLowerCase()), cuisine];

  for (const [key, value] of Object.entries(prefs)) {
    if (value <= 0) continue;
    // Direct tag/cuisine match
    if (allTags.some((t) => t.includes(key.toLowerCase()))) {
      score += value;
    }
    // Indirect cuisine family boost from quiz key
    const linkedCuisines = PREF_KEY_TO_CUISINES[key.toLowerCase()];
    if (linkedCuisines && linkedCuisines.includes(cuisine)) {
      score += value * 0.5; // Half-weight indirect boost
    }
  }
  return score;
}

/**
 * Pantry-independent base records, built once at module load. Everything on a
 * QuestDish except `pantryFit` is a pure function of the static catalog +
 * guided-cook summary, so there's no reason to rebuild all ~281 of them (with
 * their summary lookups + tag construction) on every quest re-score. The cache
 * is always valid — the catalog is imported static data that never mutates.
 */
type BaseQuestDish = Omit<QuestDish, "pantryFit">;

let _baseMealDishes: BaseQuestDish[] | null = null;
let _baseSideDishes: BaseQuestDish[] | null = null;

function getBaseMealDishes(): BaseQuestDish[] {
  if (_baseMealDishes) return _baseMealDishes;
  const guidedSlugs = new Set(getAvailableCookSlugs());
  _baseMealDishes = meals.map((meal) => {
    const mealCookData = getMealCookSummary(meal.id);
    const hasCook = !!mealCookData || guidedSlugs.has(meal.id);
    const ingredientNames =
      mealCookData?.ingredientNames.map(normalizePantryName) ?? [];
    return {
      dishName: meal.name,
      slug: meal.id,
      heroImageUrl: meal.heroImageUrl ?? null,
      cookTimeMinutes: mealCookData
        ? mealCookData.prepTimeMinutes + mealCookData.cookTimeMinutes
        : 30,
      cuisineFamily: meal.cuisine,
      description: meal.description,
      tags: buildMealTags(meal.cuisine, meal.description, meal.sidePool.length),
      ingredientCount: mealCookData ? mealCookData.ingredientNames.length : 8,
      ingredientNames,
      hasGuidedCook: hasCook,
      isMeal: true,
      isVerified: !!meal.nourishVerified,
      role: "main" as const,
      dayparts: meal.dayparts ?? ["lunch", "dinner"],
    };
  });
  return _baseMealDishes;
}

function getBaseSideDishes(): BaseQuestDish[] {
  if (_baseSideDishes) return _baseSideDishes;
  const guidedSlugs = new Set(getAvailableCookSlugs());
  _baseSideDishes = sides.map((side) => {
    const staticData = guidedSlugs.has(side.id)
      ? getCookSummary(side.id)
      : null;
    const tags = side.tags
      .slice(0, 3)
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1));
    const ingredientNames =
      staticData?.ingredientNames.map(normalizePantryName) ?? [];
    return {
      dishName: side.name,
      slug: side.id,
      heroImageUrl: side.imageUrl ?? null,
      cookTimeMinutes: staticData
        ? staticData.prepTimeMinutes + staticData.cookTimeMinutes
        : 15,
      cuisineFamily: (
        side.tags.find((t) => CUISINE_TAGS.includes(t.toLowerCase())) ??
        "Classic"
      ).replace(/^\w/, (c) => c.toUpperCase()),
      description: side.description,
      tags,
      ingredientCount: staticData ? staticData.ingredientNames.length : 5,
      ingredientNames,
      hasGuidedCook: guidedSlugs.has(side.id),
      isMeal: false,
      isVerified: false,
      role: side.role ?? "side",
    };
  });
  return _baseSideDishes;
}

/**
 * Build the quest feed for a non-main role (side / drink / snack) — every
 * catalogue dish of that role, scored lightly (has-image → guided → name) +
 * per-call pantry fit. Mains keep `buildQuestDishes`; this powers the Today
 * Filter's role switch (TODAY-FILTER-PLAN.md Phase D).
 */
export function buildRoleQuestDishes(
  role: "side" | "drink" | "snack",
  pantryNames?: string[],
): QuestDish[] {
  const pantrySet = new Set((pantryNames ?? []).map(normalizePantryName));
  return getBaseSideDishes()
    .filter((d) => d.role === role)
    .map((base) => ({
      ...base,
      pantryFit: computePantryFit(base.ingredientNames, pantrySet),
    }))
    .sort((a, b) => {
      const img = (b.heroImageUrl ? 1 : 0) - (a.heroImageUrl ? 1 : 0);
      if (img) return img;
      const guided = (b.hasGuidedCook ? 1 : 0) - (a.hasGuidedCook ? 1 : 0);
      if (guided) return guided;
      return a.dishName.localeCompare(b.dishName);
    });
}

/**
 * Build quest dish list: 80% main meals, 20% sides.
 * Users want to cook main dishes first, then find sides.
 * Meals with images float to the top. Guided-cook items prioritized.
 * Uses deterministic daily shuffle so the feed feels fresh each day.
 * After 10+ cooks, silently biases toward cuisines the user hasn't explored.
 */
export function buildQuestDishes(
  userPreferences?: Record<string, number>,
  cookHistory?: { cuisinesCovered: string[]; completedCooks: number },
  pantryNames?: string[],
  difficultyProgression?: {
    easy: number;
    medium: number;
    hard: number;
    recommendedLevel: "easy" | "medium" | "hard";
    difficultyBoost: number;
  },
  /** Live context: weather, the user's saved ("craved") dish slugs, and the
   *  cuisines of the household eating tonight. Absent → no daypart/weather/
   *  resurface/table tilt beyond the legacy time nudge. */
  context?: {
    weather?: WeatherSnapshot | null;
    savedSlugs?: string[];
    tableCuisines?: string[];
    tableMinSpice?: number;
  },
): QuestDish[] {
  const pantrySet = new Set((pantryNames ?? []).map(normalizePantryName));

  const now = new Date();

  // The live reorder context (hunger / weather / crave-it / who's-at-table).
  const deckCtx: DeckContext = {
    daypart: mealDaypartFromHour(now.getHours()),
    weatherLean: weatherTempLean(context?.weather ?? null),
    savedSlugs: new Set(context?.savedSlugs ?? []),
    tableCuisines: new Set(
      (context?.tableCuisines ?? []).map((c) => c.toLowerCase()),
    ),
    tableMinSpice: context?.tableMinSpice ?? 5,
  };
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );

  // Attach per-call pantry fit to the cached, pantry-independent base records.
  // The ~281 catalog summary lookups + tag construction are built once at
  // module load and never change at runtime; only computePantryFit depends on
  // the current pantry, so the per-render cost drops from ~281 lookups to a set
  // of cheap membership checks. Output is byte-identical to the inline build.
  const mealDishes: QuestDish[] = getBaseMealDishes().map((base) => ({
    ...base,
    pantryFit: computePantryFit(base.ingredientNames, pantrySet),
  }));
  const sideDishes: QuestDish[] = getBaseSideDishes().map((base) => ({
    ...base,
    pantryFit: computePantryFit(base.ingredientNames, pantrySet),
  }));

  const hasPrefs = userPreferences && Object.keys(userPreferences).length > 0;

  // ── Time-of-day scoring ─────────────────────────────────────────────────
  // Morning (5-11): boost quick/light. Lunch (11-14): balanced. Evening (17+):
  // boost hearty/comfort. Quiet during off-hours so it never hurts, only helps.
  const timeOfDayBoost = (dish: QuestDish): number => {
    const hour = now.getHours();
    const cookTime = dish.cookTimeMinutes;
    const tags = dish.tags.map((t) => t.toLowerCase());
    const desc = dish.description.toLowerCase();

    if (hour >= 5 && hour < 11) {
      // Morning: boost quick dishes (≤ 20 min) and light tags
      let bonus = 0;
      if (cookTime <= 20) bonus += 3;
      if (tags.some((t) => ["fresh", "light", "steamed"].includes(t)))
        bonus += 2;
      return bonus;
    }
    if (hour >= 17 || hour < 2) {
      // Evening/dinner: boost hearty, comfort, rich, longer cooks
      let bonus = 0;
      if (cookTime >= 30) bonus += 2;
      if (
        tags.some((t) =>
          [
            "rich",
            "savory",
            "braised",
            "roasted",
            "grilled",
            "creamy",
          ].includes(t),
        ) ||
        desc.includes("comfort") ||
        desc.includes("hearty")
      )
        bonus += 3;
      return bonus;
    }
    return 0; // Midday — neutral
  };

  // Progressive difficulty: after 10+ cooks, boost cuisines the user hasn't tried
  const noveltyBonus =
    cookHistory && cookHistory.completedCooks >= 10
      ? (cuisine: string) => {
          const covered = cookHistory.cuisinesCovered.map((c) =>
            c.toLowerCase(),
          );
          return covered.includes(cuisine.toLowerCase()) ? 0 : 4;
        }
      : () => 0;

  // Pantry-aware boost: strong fit (≥60%) is worth more than a single tag
  // match but less than a hero image, so it tilts the order without
  // wholesale reshuffling the feed.
  const pantryBoost = (dish: QuestDish) =>
    dish.pantryFit >= PANTRY_FIT_BOOST_THRESHOLD ? PANTRY_FIT_BOOST_WEIGHT : 0;

  // Difficulty alignment: nudges feed toward dishes that match the user's
  // current skill level. Returns 0-4 bonus. Silent when no progression data.
  const difficultyBoost = difficultyProgression
    ? (slug: string) => scoreDifficultyAlignment(slug, difficultyProgression)
    : () => 0;

  // Score and sort meals: prefer meals with images, then verified, then preference match
  const scoredMeals = mealDishes
    .map((m) => ({
      dish: m,
      score:
        (m.heroImageUrl ? 10 : 0) +
        (m.isVerified ? 3 : 0) +
        (m.hasGuidedCook ? 5 : 0) +
        (hasPrefs ? scoreDishForPreferences(m, userPreferences!) : 0) +
        noveltyBonus(m.cuisineFamily) +
        pantryBoost(m) +
        timeOfDayBoost(m) +
        difficultyBoost(m.slug) +
        contextBoost(m, deckCtx),
    }))
    .sort(
      (a, b) => b.score - a.score || a.dish.slug.localeCompare(b.dish.slug),
    );

  // Score and sort sides similarly
  const scoredSides = sideDishes
    .filter((s) => s.hasGuidedCook)
    .map((s) => ({
      dish: s,
      score:
        (s.heroImageUrl ? 10 : 0) +
        (hasPrefs ? scoreDishForPreferences(s, userPreferences!) : 0) +
        noveltyBonus(s.cuisineFamily) +
        pantryBoost(s) +
        timeOfDayBoost(s) +
        difficultyBoost(s.slug) +
        contextBoost(s, deckCtx),
    }))
    .sort(
      (a, b) => b.score - a.score || a.dish.slug.localeCompare(b.dish.slug),
    );

  // Partition into "ready" (has image + guided cook) and "rest", rotate within each partition
  const readyMeals = scoredMeals.filter(
    (s) => s.dish.heroImageUrl && s.dish.hasGuidedCook,
  );
  const restMeals = scoredMeals.filter(
    (s) => !(s.dish.heroImageUrl && s.dish.hasGuidedCook),
  );
  const readySides = scoredSides.filter((s) => s.dish.heroImageUrl);
  const restSides = scoredSides.filter((s) => !s.dish.heroImageUrl);

  const rotateArr = <T>(arr: T[], offset: number): T[] => {
    if (arr.length === 0) return arr;
    const o = offset % arr.length;
    return [...arr.slice(o), ...arr.slice(0, o)];
  };

  const rotatedMeals = [
    ...rotateArr(readyMeals, dayOfYear),
    ...rotateArr(restMeals, dayOfYear),
  ].map((s) => s.dish);

  const rotatedSides = [
    ...rotateArr(readySides, dayOfYear),
    ...rotateArr(restSides, dayOfYear),
  ].map((s) => s.dish);

  // Interleave: 4 meals then 1 side, repeating (80/20 ratio)
  const result: QuestDish[] = [];
  let mi = 0;
  let si = 0;
  while (mi < rotatedMeals.length || si < rotatedSides.length) {
    for (let k = 0; k < 4 && mi < rotatedMeals.length; k++) {
      result.push(rotatedMeals[mi++]);
    }
    if (si < rotatedSides.length) {
      result.push(rotatedSides[si++]);
    }
  }

  return result;
}
