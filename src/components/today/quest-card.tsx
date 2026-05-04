"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useReducedMotion,
  AnimatePresence,
  type PanInfo,
} from "framer-motion";
import Image from "next/image";
import {
  Clock,
  ShoppingBag,
  X,
  Heart,
  UtensilsCrossed,
  Flame,
  Fish,
  Leaf,
  CookingPot,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  getAvailableCookSlugs,
  getStaticCookData,
  getStaticMealCookData,
} from "@/data/guided-cook-steps";
import { sides, meals } from "@/data";
import { useSavedDishes } from "@/lib/hooks/use-saved-dishes";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { usePantry, normalizePantryName } from "@/lib/hooks/use-pantry";
import {
  FilterDropdown,
  type FilterOption,
} from "@/components/shared/filter-dropdown";
import { useQuestFilters } from "@/lib/hooks/use-quest-filters";
import { buildPairingRationale } from "@/lib/engine/pairing-rationale";
import { KidFriendlyHint } from "@/components/today/kid-friendly-hint";
import { KidSwapChip } from "@/components/today/kid-swap-chip";
import { NutrientSpotlight } from "@/components/shared/nutrient-spotlight";
import { useParentMode } from "@/lib/hooks/use-parent-mode";
import { matchIngredientReuse } from "@/lib/engine/ingredient-reuse";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

interface QuestDish {
  dishName: string;
  slug: string;
  heroImageUrl: string | null;
  cookTimeMinutes: number;
  cuisineFamily: string;
  description: string;
  tags: string[];
  ingredientCount: number;
  /** Normalized ingredient names used for pantry-fit scoring. May be empty
   *  when a dish lacks static cook data  -  in that case pantryFit is 0 and
   *  the chip is never shown. */
  ingredientNames: string[];
  hasGuidedCook: boolean;
  isMeal: boolean;
  isVerified: boolean;
  /** Fraction of ingredients already in the user's pantry, 0..1. */
  pantryFit: number;
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
): QuestDish[] {
  const guidedSlugs = new Set(getAvailableCookSlugs());
  const pantrySet = new Set((pantryNames ?? []).map(normalizePantryName));

  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );

  // Build meal quest dishes
  const mealDishes: QuestDish[] = meals.map((meal) => {
    const mealCookData = getStaticMealCookData(meal.id);
    const hasCook = !!mealCookData || guidedSlugs.has(meal.id);
    const ingredientNames =
      mealCookData?.ingredients.map((i) => normalizePantryName(i.name)) ?? [];
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
      ingredientCount: mealCookData ? mealCookData.ingredients.length : 8,
      ingredientNames,
      hasGuidedCook: hasCook,
      isMeal: true,
      isVerified: !!meal.nourishVerified,
      pantryFit: computePantryFit(ingredientNames, pantrySet),
    };
  });

  // Build side quest dishes
  const sideDishes: QuestDish[] = sides.map((side) => {
    const staticData = guidedSlugs.has(side.id)
      ? getStaticCookData(side.id)
      : null;
    const tags = side.tags
      .slice(0, 3)
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1));
    const ingredientNames =
      staticData?.ingredients.map((i) => normalizePantryName(i.name)) ?? [];
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
      ingredientCount: staticData ? staticData.ingredients.length : 5,
      ingredientNames,
      hasGuidedCook: guidedSlugs.has(side.id),
      isMeal: false,
      isVerified: false,
      pantryFit: computePantryFit(ingredientNames, pantrySet),
    };
  });

  const hasPrefs = userPreferences && Object.keys(userPreferences).length > 0;

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
        pantryBoost(m),
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
        pantryBoost(s),
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

  const rotateArr = <T,>(arr: T[], offset: number): T[] => {
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

// Tinder-grade swipe physics. Researched against the canonical
// `react-tinder-card` library and Framer Motion's PanInfo conventions.
//
// Position threshold (100px) and velocity threshold (600 px/s) were
// tightened from the Tinder upgrade's first iteration after a real
// user reported (a) accidental commits while peeking and (b) the
// occasional "swiped left but committed right" misregister.
//
// RCA on the directional misregister: at the moment a finger lifts,
// the captured velocity can briefly kick in the OPPOSITE direction
// of the drag — a natural finger-lift artifact. The previous
// algorithm trusted velocity when |velocity| > threshold, which
// would mis-commit a left-drag as a right-swipe whenever the lift
// happened to kick right. Fix below: offset is the single source of
// truth for DIRECTION (it's where the card visibly is); velocity is
// only a commit-permission gate. If the two disagree in sign, the
// user reversed mid-gesture — snap back, don't commit.
const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 600;

/**
 * Tinder-grade swipe-commit decision. Pure function so it can be
 * unit-tested without a DOM or pointer events.
 *
 * Direction is always taken from `offsetX` (where the card visibly
 * is at release). `velocityX` only acts as a "permission to commit"
 * gate — a fast flick across a small distance still commits, but
 * only if the flick direction agrees with the offset direction.
 *
 * Returns `null` when:
 * - Neither offset nor velocity passes its threshold (the user
 *   barely moved — snap back).
 * - Velocity passes but its sign disagrees with the offset's sign
 *   (release-finger kick — the user didn't actually mean that
 *   direction; snap back).
 */
export function decideSwipe(
  offsetX: number,
  velocityX: number,
): "left" | "right" | null {
  const offsetCommit = Math.abs(offsetX) > SWIPE_THRESHOLD;
  const velocityCommit = Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD;
  if (!offsetCommit && !velocityCommit) return null;

  // Velocity-only path: the user flicked across a small distance.
  // We only honour it if the flick direction agrees with where the
  // card is (or if the card is exactly at center). Otherwise it's
  // release-noise from the finger lift.
  if (velocityCommit && !offsetCommit) {
    if (offsetX === 0) return velocityX > 0 ? "right" : "left";
    if (Math.sign(velocityX) !== Math.sign(offsetX)) return null;
    return velocityX > 0 ? "right" : "left";
  }

  // Offset path (with or without velocity agreeing): the card is
  // far enough out that the user clearly intended this direction.
  // If velocity disagrees in sign, that's the finger-lift artifact —
  // ignore it; trust the offset.
  return offsetX > 0 ? "right" : "left";
}

/**
 * Compute the velocity-preserving exit distance for a committed
 * swipe. Pure function for unit testing.
 *
 * Base distance is ±320px (just past the visible card). A flick
 * adds up to 200px of momentum boost based on velocity * 0.18,
 * capped so a wild over-flick can't fling the card halfway across
 * the screen (perceptual upper bound: 520px from center).
 */
export function exitDistanceFor(
  direction: "left" | "right" | null,
  velocityX: number,
): number {
  if (!direction) return 0;
  const baseDistance = direction === "right" ? 320 : -320;
  const velocityBoost = Math.min(Math.abs(velocityX) * 0.18, 200);
  const signed = direction === "right" ? velocityBoost : -velocityBoost;
  return baseDistance + signed;
}

/** Cuisine-specific gradient backgrounds for cards without images. */
function getCuisineGradient(cuisine: string): string {
  const c = cuisine.toLowerCase();
  const gradients: Record<string, string> = {
    japanese: "linear-gradient(135deg, #c0392b 0%, #e74c3c 30%, #f39c12 100%)",
    korean: "linear-gradient(135deg, #d63031 0%, #e17055 40%, #fdcb6e 100%)",
    thai: "linear-gradient(135deg, #00b894 0%, #55efc4 40%, #ffeaa7 100%)",
    chinese: "linear-gradient(135deg, #d63031 0%, #e74c3c 35%, #f9ca24 100%)",
    vietnamese:
      "linear-gradient(135deg, #27ae60 0%, #2ecc71 40%, #f1c40f 100%)",
    filipino: "linear-gradient(135deg, #e17055 0%, #fab1a0 40%, #ffeaa7 100%)",
    indian: "linear-gradient(135deg, #e67e22 0%, #f39c12 35%, #f1c40f 100%)",
    italian: "linear-gradient(135deg, #27ae60 0%, #f1f1f1 50%, #e74c3c 100%)",
    mexican: "linear-gradient(135deg, #00b894 0%, #f1f1f1 50%, #d63031 100%)",
    mediterranean:
      "linear-gradient(135deg, #0984e3 0%, #74b9ff 40%, #ffeaa7 100%)",
  };
  return (
    gradients[c] ??
    "linear-gradient(135deg, #2d5a3d 0%, #4a8c5c 40%, #a8d8b9 100%)"
  );
}

const CUISINE_ICON_MAP: Record<string, LucideIcon> = {
  japanese: Fish,
  korean: Flame,
  thai: Leaf,
  chinese: CookingPot,
  vietnamese: Leaf,
  filipino: CookingPot,
  indian: Flame,
  italian: UtensilsCrossed,
  mexican: Flame,
  mediterranean: Leaf,
};

function CuisineFallbackIcon({ cuisine }: { cuisine: string }) {
  const Icon = CUISINE_ICON_MAP[cuisine.toLowerCase()] ?? UtensilsCrossed;
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
      <Icon size={32} className="text-white drop-shadow-sm" strokeWidth={1.5} />
    </div>
  );
}

/** Extract descriptive tags for a meal from its description. */
function buildMealTags(
  cuisine: string,
  description: string,
  poolSize: number,
): string[] {
  // Cuisine is already shown as the image-overlay pill — do NOT duplicate
  // it here as a tag chip (W12 minimalism audit fix; CLAUDE.md rule 6).
  // `cuisine` is intentionally referenced via the eslint-disable below
  // to keep the function signature stable for buildSideTags + callers.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature stable; cuisine surfaced via image-overlay pill instead
  const _cuisineSurface = cuisine;
  const tags: string[] = [];
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

/**
 * QuestCard  -  swipeable Tinder-style card stack.
 * Dishes are sourced from guided-cook-steps data (real recipes with cook flows).
 * Swipe right to cook, left to skip. Heart saves to localStorage.
 * Pass userPreferences to surface preference-matched dishes first.
 */
export function QuestCard({
  userPreferences,
  cookHistory,
  cookSessions,
}: {
  userPreferences?: Record<string, number>;
  cookHistory?: { cuisinesCovered: string[]; completedCooks: number };
  /** Completed cook sessions, used to compute the "Because you cooked X"
   *  rationale. Silent when empty or below the 5-cook threshold. */
  cookSessions?: CookSessionRecord[];
}) {
  const { items: pantryItems, mounted: pantryMounted } = usePantry();
  const baseDishes = useMemo(
    () =>
      buildQuestDishes(
        userPreferences,
        cookHistory,
        pantryMounted ? pantryItems : undefined,
      ),
    [userPreferences, cookHistory, pantryItems, pantryMounted],
  );
  // Quest filters: cook-time cap + cuisine. Both session-scoped so they
  // never become permanent settings  -  they reset at app close.
  const filters = useQuestFilters();

  // Build the cuisine option list from the actual dish index so we never
  // show an option that has zero results. Keeps the dropdown honest.
  const cuisineOptions = useMemo<FilterOption<string>[]>(() => {
    const seen = new Map<string, string>();
    for (const d of baseDishes) {
      const key = d.cuisineFamily.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, d.cuisineFamily);
      }
    }
    const alpha = Array.from(seen.entries()).sort((a, b) =>
      a[1].localeCompare(b[1]),
    );
    return [
      { value: "any", label: "Any cuisine", pillLabel: "Cuisine" },
      ...alpha.map(([key, label]) => ({
        value: key,
        label,
        pillLabel: label,
      })),
    ];
  }, [baseDishes]);

  const questDishes = useMemo(() => {
    const cap =
      filters.cookTime === "any"
        ? Number.POSITIVE_INFINITY
        : Number.parseInt(filters.cookTime, 10);
    const cuisineKey = filters.cuisine.toLowerCase();
    const filtered = baseDishes.filter((d) => {
      if (d.cookTimeMinutes > cap) return false;
      if (filters.cuisine !== "any") {
        if (d.cuisineFamily.toLowerCase() !== cuisineKey) return false;
      }
      return true;
    });
    // Graceful fallback: if the filter combination yields nothing, return
    // the base feed so the user never hits an empty state because of filters.
    return filtered.length > 0 ? filtered : baseDishes;
  }, [baseDishes, filters.cookTime, filters.cuisine]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null,
  );
  const { saveDish, isDishSaved } = useSavedDishes();
  // Parent Mode profile is consulted at the QuestCard level so we can
  // pass `parentModeOn` down to SwipeCard. When PM is on, we suppress
  // the rationale + ingredient-reuse lines on the top card so PM hints
  // (kid hint / kid swap / nutrient spotlight) don't stack into a wall
  // of supplementary lines (W12 minimalism audit fix, POLISH §1.5.2).
  const { profile: parentProfile } = useParentMode();
  const [savedToastSlug, setSavedToastSlug] = useState<string | null>(null);
  const router = useRouter();
  const haptic = useHaptic();
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clean up all pending timeouts on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (questDishes.length === 0) return;
      haptic();

      if (direction === "right") {
        const dish = questDishes[currentIndex % questDishes.length];
        if (dish.isMeal) {
          setExitDirection("right");
          scheduleTimeout(() => {
            const params = new URLSearchParams({ main: dish.dishName });
            if (dish.heroImageUrl) params.set("img", dish.heroImageUrl);
            router.push(`/sides?${params.toString()}`);
          }, 300);
        } else if (dish.hasGuidedCook && !dish.isMeal) {
          // Side dish with guided cook: go straight to cook flow
          setExitDirection("right");
          scheduleTimeout(() => {
            router.push(`/cook/${dish.slug}`);
          }, 300);
        } else {
          setExitDirection("right");
          scheduleTimeout(() => {
            const params = new URLSearchParams({ main: dish.dishName });
            if (dish.heroImageUrl) params.set("img", dish.heroImageUrl);
            router.push(`/sides?${params.toString()}`);
          }, 300);
        }
      } else {
        setExitDirection("left");
        scheduleTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % questDishes.length);
          setExitDirection(null);
        }, 250);
      }
    },
    [currentIndex, questDishes, router, scheduleTimeout, haptic],
  );

  const handleStart = useCallback(() => {
    handleSwipe("right");
  }, [handleSwipe]);

  const handleSkip = useCallback(() => {
    handleSwipe("left");
  }, [handleSwipe]);

  const handleSave = useCallback(() => {
    if (questDishes.length === 0) return;
    const dish = questDishes[currentIndex % questDishes.length];
    const wasNew = saveDish(dish.slug, dish.dishName);
    if (wasNew) {
      setSavedToastSlug(dish.slug);
      scheduleTimeout(() => setSavedToastSlug(null), 1500);
    }
  }, [currentIndex, questDishes, saveDish, scheduleTimeout]);

  // Show up to 3 stacked cards. Memoised so downstream memos don't flap.
  const visibleCards = useMemo(() => {
    const out: Array<(typeof questDishes)[number] & { stackIndex: number }> =
      [];
    for (let i = 0; i < Math.min(3, questDishes.length); i++) {
      const idx = (currentIndex + i) % questDishes.length;
      out.push({ ...questDishes[idx], stackIndex: i });
    }
    return out;
  }, [currentIndex, questDishes]);

  // One-line "Because you cooked X" rationale for the top card  -  silent
  // until the user has ≥5 completed cooks and the pick shares ≥2 taxonomy
  // axes with something they cooked in the last 21 days.
  const topSlug = visibleCards[0]?.slug;
  const topDishName = visibleCards[0]?.dishName;
  const topRationale = useMemo(() => {
    if (!topSlug || !cookSessions || cookSessions.length === 0) return null;
    return buildPairingRationale({
      currentDishSlug: topSlug,
      currentDishName: topDishName,
      cookHistory: cookSessions,
    });
  }, [topSlug, topDishName, cookSessions]);

  // One-line "reuses cilantro from Friday's tacos" ingredient-reuse hint.
  // We look up each recent session's ingredients from the static cook data
  // so no new fields need to be persisted in localStorage.
  const topIngredientReuse = useMemo(() => {
    const topIngredients = visibleCards[0]?.ingredientNames ?? [];
    if (!topSlug || topIngredients.length === 0) return null;
    if (!cookSessions || cookSessions.length === 0) return null;
    const pastEntries = cookSessions
      .filter((s) => !!s.completedAt && s.recipeSlug !== topSlug)
      .map((s) => {
        const cook =
          getStaticCookData(s.recipeSlug) ??
          getStaticMealCookData(s.recipeSlug);
        if (!cook) return null;
        const names = cook.ingredients.map((i) => i.name.toLowerCase());
        return {
          slug: s.recipeSlug,
          dishName: s.dishName,
          completedAt: new Date(s.completedAt!).getTime(),
          ingredients: new Set(names),
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);
    return matchIngredientReuse({
      currentIngredientNames: topIngredients,
      pastSessions: pastEntries,
    });
  }, [topSlug, visibleCards, cookSessions]);

  if (questDishes.length === 0) {
    return (
      <div className="space-y-1.5">
        <div className="px-1">
          <h2 className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
            Today&apos;s Quest
          </h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-200/60 bg-white p-8 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--nourish-green)]/10">
            <UtensilsCrossed
              size={24}
              className="text-[var(--nourish-green)]"
              strokeWidth={1.8}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--nourish-dark)]">
              No quests available
            </p>
            <p className="text-xs text-[var(--nourish-subtext)] max-w-[240px]">
              Use the search bar above to find something to cook today.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Section header + filter pills  -  two clickable dropdowns replace the
          old binary "Under 20 min" toggle. Both reset at tab close. */}
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="shrink-0 text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
          Today&apos;s Quest
        </h2>
        <div className="flex items-center gap-1.5">
          <FilterDropdown
            label="Cook time"
            value={filters.cookTime}
            defaultValue="any"
            onChange={(v) => {
              filters.setCookTime(v);
              setCurrentIndex(0);
            }}
            leadingIcon={<Clock size={11} strokeWidth={2.2} />}
            align="end"
            options={[
              { value: "any", label: "Any time", pillLabel: "Any time" },
              { value: "15", label: "≤ 15 min", pillLabel: "≤ 15 min" },
              { value: "20", label: "≤ 20 min", pillLabel: "≤ 20 min" },
              { value: "30", label: "≤ 30 min", pillLabel: "≤ 30 min" },
              { value: "45", label: "≤ 45 min", pillLabel: "≤ 45 min" },
              { value: "60", label: "≤ 60 min", pillLabel: "≤ 60 min" },
            ]}
          />
          <FilterDropdown
            label="Cuisine"
            value={filters.cuisine}
            defaultValue="any"
            onChange={(v) => {
              filters.setCuisine(v);
              setCurrentIndex(0);
            }}
            align="end"
            options={cuisineOptions}
          />
        </div>
      </div>

      {/* Card stack container  -  minHeight 460 pushes action chips below fold at 375×667 */}
      <div className="relative" style={{ minHeight: 460 }}>
        <AnimatePresence mode="popLayout">
          {visibleCards
            .slice()
            .reverse()
            .map((dish) => (
              <SwipeCard
                key={`${dish.slug}-${currentIndex}-${dish.stackIndex}`}
                dish={dish}
                stackIndex={dish.stackIndex}
                isTop={dish.stackIndex === 0}
                isSaved={isDishSaved(dish.slug)}
                onSwipe={handleSwipe}
                onStart={handleStart}
                onSkip={handleSkip}
                onSave={handleSave}
                exitDirection={dish.stackIndex === 0 ? exitDirection : null}
                rationale={
                  dish.stackIndex === 0 ? (topRationale?.text ?? null) : null
                }
                ingredientReuse={
                  dish.stackIndex === 0
                    ? (topIngredientReuse?.text ?? null)
                    : null
                }
                parentModeOn={parentProfile.enabled}
              />
            ))}
        </AnimatePresence>

        {/* Saved for later toast */}
        <AnimatePresence>
          {savedToastSlug && (
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[var(--nourish-dark)] px-4 py-2 shadow-lg"
            >
              <span className="text-xs font-medium text-white flex items-center gap-1.5">
                <Heart size={12} className="fill-current" />
                Saved for later
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Individual swipe card with drag interaction and stack positioning.
 */
function SwipeCard({
  dish,
  stackIndex,
  isTop,
  isSaved,
  onSwipe,
  onStart,
  onSkip,
  onSave,
  exitDirection,
  rationale,
  ingredientReuse,
  parentModeOn,
}: {
  dish: QuestDish & { stackIndex: number };
  stackIndex: number;
  isTop: boolean;
  isSaved: boolean;
  onSwipe: (direction: "left" | "right") => void;
  onStart: () => void;
  onSkip: () => void;
  onSave: () => void;
  exitDirection: "left" | "right" | null;
  /** Optional ambient rationale rendered below the flavor tags. Only the
   *  top card receives one  -  silent on deeper cards and for new users. */
  rationale: string | null;
  /** Optional "reuses cilantro from yesterday's tacos" hint. Only the top
   *  card receives one. Silent when no recent ingredient overlap exists. */
  ingredientReuse: string | null;
  /** When true, suppresses rationale + ingredient-reuse on the top card
   *  so PM hints don't stack into a wall of supplementary lines. */
  parentModeOn: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const reducedMotion = useReducedMotion();
  const haptic = useHaptic();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);

  // Swipe indicator overlays
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);
  // Scale labels as drag approaches threshold
  const likeScale = useTransform(x, [0, 80], [0.8, 1.1]);
  const nopeScale = useTransform(x, [-80, 0], [1.1, 0.8]);

  // Tinder-grade detail #1: a single quiet haptic the moment the
  // user crosses the swipe-commit threshold in either direction.
  // Mirrors the iOS pattern where the device taps once when the
  // drag has gone "far enough" — the user knows they can release.
  // Tracked via ref so the threshold-cross only fires once per drag,
  // not on every motion frame.
  const hapticArmedRef = useRef<"left" | "right" | null>(null);
  useMotionValueEvent(x, "change", (latest) => {
    if (!isTop) return;
    if (Math.abs(latest) > SWIPE_THRESHOLD) {
      const dir = latest > 0 ? "right" : "left";
      if (hapticArmedRef.current !== dir) {
        haptic();
        hapticArmedRef.current = dir;
      }
    } else {
      hapticArmedRef.current = null;
    }
  });

  // W22b animation: snap-feedback as the card crosses the like/discard
  // threshold. Card scales ~2% and a green/rose glow shadow blooms in
  // so the swipe "commits" feel earned rather than mute. Pure motion
  // transforms — no state, no re-render.
  // Reduced motion: collapse the scale envelope to a no-op (constant 1)
  // and keep the shadow flat. Drag still works; the celebratory bloom
  // is what we suppress.
  const cardScale = useTransform(
    x,
    [-160, -80, 0, 80, 160],
    reducedMotion ? [1, 1, 1, 1, 1] : [1.02, 1.005, 1, 1.005, 1.02],
  );
  const cardShadow = useTransform(
    x,
    [-160, -80, 0, 80, 160],
    reducedMotion
      ? [
          "0 4px 12px -4px rgba(13,13,13,0.10)",
          "0 4px 12px -4px rgba(13,13,13,0.10)",
          "0 4px 12px -4px rgba(13,13,13,0.10)",
          "0 4px 12px -4px rgba(13,13,13,0.10)",
          "0 4px 12px -4px rgba(13,13,13,0.10)",
        ]
      : [
          "0 16px 32px -10px rgba(244,63,94,0.45)",
          "0 8px 16px -8px rgba(244,63,94,0.20)",
          "0 4px 12px -4px rgba(13,13,13,0.10)",
          "0 8px 16px -8px rgba(45,90,61,0.20)",
          "0 16px 32px -10px rgba(45,90,61,0.45)",
        ],
  );

  // Tinder-grade detail #2: capture the flick velocity at the
  // moment the user lets go, so the exit animation can feel
  // continuous with the gesture rather than ramping into a fresh
  // animation on its own clock. State (not ref) because Framer reads
  // the exit prop during render — react-hooks/refs strict rule.
  const [exitVelocity, setExitVelocity] = useState(0);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const direction = decideSwipe(info.offset.x, info.velocity.x);
    if (direction) {
      setExitVelocity(info.velocity.x);
      onSwipe(direction);
    }
    // No commit → Framer auto-snaps back via dragConstraints + the
    // spring transition on the wrapper, no manual reset needed.
  };

  const exitX = exitDistanceFor(exitDirection, exitVelocity);

  // Stack positioning: scale down, shift back, and rotate for peek effect
  const scale = 1 - stackIndex * 0.04;
  const translateY = stackIndex * 14;
  // Sprint 1 W2.3: trim peek-card rotation 2°/-1.5° → 1.5°/-1° so the
  // hidden cards register as "stacked" without yelling for attention.
  const peekRotation = stackIndex === 1 ? 1.5 : stackIndex === 2 ? -1 : 0;

  return (
    <motion.div
      className="absolute inset-x-0 top-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : peekRotation,
        zIndex: 10 - stackIndex,
      }}
      initial={{
        scale: scale - 0.02,
        y: translateY + 8,
        opacity: stackIndex === 0 ? 0 : 1,
      }}
      animate={{
        scale,
        y: translateY,
        opacity: 1,
      }}
      exit={{
        // Tinder-grade detail #4: exit honours the captured flick
        // velocity, so the exit feels like a continuation of the
        // user's gesture rather than a fresh animation. Reduced-
        // motion users get an opacity-only fade that doesn't fly
        // anywhere — preserves the same "card is gone" signal
        // without any vestibular cost.
        x: reducedMotion ? 0 : exitX,
        rotate: reducedMotion
          ? 0
          : exitDirection === "right"
            ? 20
            : exitDirection === "left"
              ? -20
              : 0,
        opacity: 0,
        transition: reducedMotion
          ? { duration: 0.18 }
          : {
              // Spring with `velocity` injected from the captured flick
              // so the spring already knows how fast the card is
              // moving when it takes over from the drag. This is the
              // single most "Tinder-feeling" detail in the upgrade.
              type: "spring",
              velocity: exitVelocity,
              stiffness: 220,
              damping: 28,
              restDelta: 0.5,
            },
      }}
      // Snap-back spring: the wrapper's transition is what runs when
      // the user releases below the swipe threshold. SHEET-like
      // tuning (stiffness 320 / damping 28) gives the card a
      // physical "grab" feeling when it returns to center, vs the
      // earlier squishier 300/30.
      transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.7 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      // Lower elastic = tighter, more controlled drag. The previous
      // 0.7 felt rubbery and let the card travel ~70% past the
      // visible threshold while held — which is what the user
      // experienced as "accidentally goes in screen". 0.55 keeps
      // the card meaningfully responsive while making the commit
      // threshold feel intentional.
      dragElastic={0.55}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <motion.div
        className={cn(
          "overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm",
          isTop && "cursor-grab active:cursor-grabbing shadow-md",
        )}
        // W22b: drag-driven scale + shadow snap-feedback. Top card only;
        // inactive cards keep static rendering.
        style={isTop ? { scale: cardScale, boxShadow: cardShadow } : undefined}
        role="article"
        aria-label={`${dish.dishName}  -  ${dish.cuisineFamily}${dish.isVerified ? ", Nourish Verified" : ""}`}
      >
        {/* Swipe feedback overlays  -  only on top card */}
        {isTop && (
          <>
            <motion.div
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[var(--nourish-green)]/8"
              style={{ opacity: likeOpacity }}
            >
              <motion.span
                className="rounded-xl border-2 border-[var(--nourish-green)] bg-white/80 backdrop-blur-sm px-5 py-2 text-lg font-bold text-[var(--nourish-green)] -rotate-12 tracking-wide shadow-sm"
                style={{ scale: likeScale }}
              >
                COOK!
              </motion.span>
            </motion.div>
            <motion.div
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-red-500/8"
              style={{ opacity: nopeOpacity }}
            >
              <motion.span
                className="rounded-xl border-2 border-red-400 bg-white/80 backdrop-blur-sm px-5 py-2 text-lg font-bold text-red-500 rotate-12 tracking-wide shadow-sm"
                style={{ scale: nopeScale }}
              >
                SKIP
              </motion.span>
            </motion.div>
          </>
        )}

        {/* Hero food image */}
        <div className="relative aspect-[3/2] bg-[var(--nourish-cream)]">
          {dish.heroImageUrl && !imgError ? (
            <Image
              src={dish.heroImageUrl}
              alt={dish.dishName}
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
              draggable={false}
              loading={stackIndex === 0 ? "eager" : "lazy"}
              priority={stackIndex === 0}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{
                background: getCuisineGradient(dish.cuisineFamily),
              }}
            >
              <CuisineFallbackIcon cuisine={dish.cuisineFamily} />
              <span className="text-sm font-semibold text-white/90 text-center px-6 leading-tight drop-shadow-sm">
                {dish.dishName}
              </span>
            </div>
          )}
          {/* Bottom gradient for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/15 to-transparent" />
          {/* Cuisine family badge  -  bottom left of hero image */}
          <div className="absolute bottom-2 left-3 rounded-full bg-black/30 backdrop-blur-sm px-2.5 py-0.5">
            <span className="text-[11px] font-semibold text-white tracking-wide">
              {dish.cuisineFamily}
            </span>
          </div>
          {/* Skip (X) button  -  top right, min 44px touch target */}
          {isTop && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSkip();
              }}
              className="absolute top-1 right-1 flex h-11 w-11 items-center justify-center active:scale-90"
              type="button"
              aria-label="Skip dish"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm text-white/90 transition-all hover:bg-black/40">
                <X size={14} />
              </span>
            </button>
          )}
        </div>

        {/* Dish info */}
        <div className="px-4 pt-2.5 pb-1.5 space-y-1">
          <h3 className="font-serif text-base font-bold text-[var(--nourish-dark)] flex items-center gap-1.5">
            {dish.dishName}
            {dish.isVerified && (
              <span
                className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--nourish-green)] shrink-0"
                title="Nourish Verified"
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 8.5L7 11.5L12 5"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
          </h3>
          {dish.isMeal && dish.description && (
            <p className="text-[11px] text-[var(--nourish-subtext)] line-clamp-1 leading-relaxed">
              {dish.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-[11px] text-[var(--nourish-subtext)]">
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-[var(--nourish-green)]" />
              {dish.cookTimeMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag size={13} className="text-[var(--nourish-green)]" />
              {dish.ingredientCount} ingredients
            </span>
          </div>
          {/* Pantry-fit signal  -  only surfaces when most ingredients are
              already on hand. Turns the ranking win into a visible reason. */}
          {dish.pantryFit >= PANTRY_FIT_BOOST_THRESHOLD && (
            <div className="flex items-center gap-1 pt-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--nourish-green)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--nourish-green)]">
                <Sparkles size={11} strokeWidth={2.2} />
                You already have most of this
              </span>
            </div>
          )}
          {/* Flavor tags — row hides entirely when empty (CLAUDE.md rule 6:
              counts/elements that are zero hide the whole element). */}
          {dish.tags.length > 0 && (
            <div className="flex items-center gap-1.5 pt-0.5">
              {dish.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--nourish-green)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--nourish-green)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/* Supplementary lines below the description are capped at 2
              total under Parent Mode (W12 audit fix): when PM is on,
              the kid hint / kid swap / nutrient spotlight take priority,
              so we suppress rationale + ingredient-reuse on the top
              card. Non-PM cards render rationale + ingredient-reuse as
              before (also <= 2 lines). */}
          {!parentModeOn && rationale && (
            <p className="pt-1 text-[11px] italic leading-snug text-[var(--nourish-subtext)]">
              {rationale}.
            </p>
          )}
          {!parentModeOn && ingredientReuse && (
            <p className="text-[11px] leading-snug text-[var(--nourish-green)]/80">
              {ingredientReuse}.
            </p>
          )}
          {/* Parent-mode kid-friendly hint  -  silent unless PM is on AND
              the dish has a hand-curated label that scores >= 0.65. Top
              card only (Stage-2 W9). */}
          {isTop && <KidFriendlyHint dishSlug={dish.slug} />}
          {/* Parent-mode kid-swap chip  -  surfaces only on borderline
              middle-of-the-road dishes (0.30 <= score < 0.65). Sheet
              writes the chosen swap to the recipe-overlay system so it
              re-appears at next cook. (Stage-2 W11) */}
          {isTop && (
            <div className="pt-1">
              <KidSwapChip
                dishSlug={dish.slug}
                cuisineFamily={dish.cuisineFamily}
                recipeName={dish.dishName}
              />
            </div>
          )}
          {/* Parent-mode nutrient spotlight  -  one ambient line, only
              when (a) PM is on (b) per-recipe nutrition data exists
              and (c) at least one nutrient passes the FDA threshold.
              Otherwise renders null. (Stage-2 W12) */}
          {isTop && <NutrientSpotlight recipeSlug={dish.slug} />}
        </div>

        {/* Action row  -  heart save + Start cooking */}
        <div className="flex items-center gap-3 px-4 pb-4 pt-1.5">
          {/* Save for later  -  heart button */}
          <div className="group relative">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              whileTap={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={cn(
                "flex h-[42px] w-[42px] items-center justify-center rounded-xl",
                "transition-colors duration-200",
                isSaved
                  ? "border border-pink-200 bg-pink-50 text-pink-500"
                  : "border border-neutral-200 bg-neutral-50/80 text-neutral-400 hover:border-pink-200 hover:text-pink-500 hover:bg-pink-50",
              )}
              type="button"
              aria-label={isSaved ? "Already saved" : "Save for later"}
            >
              <Heart size={18} className={isSaved ? "fill-current" : ""} />
            </motion.button>
            {/* Hover tooltip */}
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <div className="whitespace-nowrap rounded-md bg-[var(--nourish-dark)] px-2 py-0.5 text-[9px] font-medium text-white shadow-lg">
                {isSaved ? "Saved" : "Save for later"}
              </div>
              <div className="mx-auto h-1.5 w-1.5 -mt-0.5 rotate-45 bg-[var(--nourish-dark)]" />
            </div>
          </div>

          {/* Primary CTA  -  cook if guided, find sides otherwise */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={cn(
              "flex-1 rounded-xl h-[42px] text-[13px] font-semibold text-white tracking-wide",
              "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
              "cta-glow transition-colors duration-200",
            )}
            type="button"
            aria-label={`${dish.isMeal ? "Find sides for" : dish.hasGuidedCook ? "Start cooking" : "Find sides for"} ${dish.dishName}`}
          >
            {dish.isMeal
              ? "Find sides →"
              : dish.hasGuidedCook
                ? "Start cooking"
                : "Find sides"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
