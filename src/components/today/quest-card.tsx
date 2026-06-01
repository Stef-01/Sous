"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  AnimatePresence,
  type PanInfo,
} from "framer-motion";
import Image from "next/image";
import {
  Clock,
  X,
  Heart,
  UtensilsCrossed,
  Flame,
  Fish,
  Leaf,
  CookingPot,
  Maximize2,
  RotateCcw,
  Check,
  ChefHat,
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
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import {
  useDifficultyProgression,
  scoreDifficultyAlignment,
} from "@/lib/hooks/use-difficulty-progression";

export interface QuestDish {
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
  difficultyProgression?: {
    easy: number;
    medium: number;
    hard: number;
    recommendedLevel: "easy" | "medium" | "hard";
    difficultyBoost: number;
  },
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
        difficultyBoost(m.slug),
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
        difficultyBoost(s.slug),
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

const FULLSCREEN_SWIPE_THRESHOLD = 110;
const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 600;
const QUEUE_EXIT_MS = 240;
const QUEUE_SIZE = 18;

export function decideSwipe(
  offsetX: number,
  velocityX: number,
): "left" | "right" | null {
  const offsetCommit = Math.abs(offsetX) > SWIPE_THRESHOLD;
  const velocityCommit = Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD;
  if (!offsetCommit && !velocityCommit) return null;

  if (velocityCommit && !offsetCommit) {
    if (offsetX === 0) return velocityX > 0 ? "right" : "left";
    if (Math.sign(velocityX) !== Math.sign(offsetX)) return null;
    return velocityX > 0 ? "right" : "left";
  }

  return offsetX > 0 ? "right" : "left";
}

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
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
      <Icon size={32} className="text-white" strokeWidth={1.5} />
    </div>
  );
}

/** Extract descriptive tags for a meal from its description. */
export function partitionMetaTags(tags: ReadonlyArray<string>): {
  popularInline: boolean;
  flavorTags: ReadonlyArray<string>;
} {
  if (!Array.isArray(tags)) return { popularInline: false, flavorTags: [] };
  const popularInline = tags.includes("Popular");
  const flavorTags = tags.filter((t) => t !== "Popular");
  return { popularInline, flavorTags };
}

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
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const { items: pantryItems, mounted: pantryMounted } = usePantry();
  const progression = useDifficultyProgression(cookSessions ?? []);
  const baseDishes = useMemo(
    () =>
      buildQuestDishes(
        userPreferences,
        cookHistory,
        pantryMounted ? pantryItems : undefined,
        progression,
      ),
    [userPreferences, cookHistory, pantryItems, pantryMounted, progression],
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
  const [previewIndex, setPreviewIndex] = useState(0);
  const [queueOpen, setQueueOpen] = useState(false);
  const { saveDish, isDishSaved } = useSavedDishes();
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

  const previewDish = questDishes.length
    ? questDishes[previewIndex % questDishes.length]
    : null;

  const queueDishes = useMemo(() => {
    if (questDishes.length === 0) return [];
    const start = previewIndex % questDishes.length;
    return [...questDishes.slice(start), ...questDishes.slice(0, start)].slice(
      0,
      QUEUE_SIZE,
    );
  }, [previewIndex, questDishes]);

  const routeDish = useCallback(
    (dish: QuestDish) => {
      setQueueOpen(false);

      if (dish.hasGuidedCook && !dish.isMeal) {
        router.push(`/cook/${dish.slug}`);
        return;
      }

      const params = new URLSearchParams({ main: dish.dishName });
      if (dish.heroImageUrl) params.set("img", dish.heroImageUrl);
      router.push(`/sides?${params.toString()}`);
    },
    [router],
  );

  const handleSaveDish = useCallback(
    (dish: QuestDish) => {
      haptic();
      const wasNew = saveDish(dish.slug, dish.dishName);
      if (wasNew) {
        setSavedToastSlug(dish.slug);
        scheduleTimeout(() => setSavedToastSlug(null), 1500);
      }
    },
    [haptic, saveDish, scheduleTimeout],
  );

  if (questDishes.length === 0) {
    return (
      <div className="space-y-1.5">
        <div className="px-1">
          <h2 className="sous-label">Today&apos;s Quest</h2>
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
    <div className="space-y-3">
      {/* Section header + filter pills  -  two clickable dropdowns replace the
          old binary "Under 20 min" toggle. Both reset at tab close. */}
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="shrink-0 text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
          Meal queue
        </h2>
        <div className="flex items-center gap-1.5">
          <FilterDropdown
            label="Cook time"
            value={filters.cookTime}
            defaultValue="any"
            onChange={(v) => {
              filters.setCookTime(v);
              setPreviewIndex(0);
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
              setPreviewIndex(0);
            }}
            align="end"
            options={cuisineOptions}
          />
        </div>
      </div>

      {/* Card stack container  -  minHeight 460 pushes action chips below fold at 375×667 */}
      {previewDish && (
        <MealQueuePreview
          dish={previewDish}
          onOpen={() => setQueueOpen(true)}
        />
      )}

      <AnimatePresence>
        {savedToastSlug && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto w-fit rounded-full bg-[var(--nourish-dark)] px-4 py-2"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-white">
              <Heart size={12} className="fill-current" />
              Saved for later
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {queueOpen && (
          <MealSwipeQueueOverlay
            dishes={queueDishes}
            isDishSaved={isDishSaved}
            onClose={() => setQueueOpen(false)}
            onSaveDish={handleSaveDish}
            onCookDish={routeDish}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MealQueuePreview({
  dish,
  onOpen,
}: {
  dish: QuestDish;
  onOpen: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="space-y-3"
    >
      <motion.button
        type="button"
        onClick={onOpen}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="group w-full text-left"
        aria-label={`Open meal queue starting with ${dish.dishName}`}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[26px] border border-neutral-200 bg-white">
          <DishImage dish={dish} priority fit="contain" />
          <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/92 text-neutral-900 transition-colors group-hover:bg-white">
            <Maximize2 size={17} strokeWidth={1.9} />
          </div>
        </div>

        <div className="mt-3 space-y-2 px-1">
          <div className="space-y-1">
            <p className="sous-label">
              {dish.isMeal ? "Dinner idea" : "Side idea"}
            </p>
            <h3 className="sous-display text-[var(--nourish-dark)]">
              {dish.dishName}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--nourish-subtext)]">
            <span>{dish.cuisineFamily}</span>
            <span aria-hidden="true">/</span>
            <span>{dish.cookTimeMinutes} min</span>
            <span aria-hidden="true">/</span>
            <span>{dish.ingredientCount} ingredients</span>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

function MealSwipeQueueOverlay({
  dishes,
  isDishSaved,
  onClose,
  onSaveDish,
  onCookDish,
}: {
  dishes: QuestDish[];
  isDishSaved: (slug: string) => boolean;
  onClose: () => void;
  onSaveDish: (dish: QuestDish) => void;
  onCookDish: (dish: QuestDish) => void;
}) {
  const [unswiped, setUnswiped] = useState<QuestDish[]>(() => dishes);
  const [dismissed, setDismissed] = useState<QuestDish[]>([]);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [initialTotal, setInitialTotal] = useState(() => dishes.length);
  const haptic = useHaptic();
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const resetDeck = useCallback(() => {
    setUnswiped(dishes);
    setDismissed([]);
    setExitDirection(null);
    setInitialTotal(dishes.length);
  }, [dishes]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const timers = timersRef.current;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      timers.forEach(clearTimeout);
    };
  }, []);

  const activeDish = unswiped[0] ?? null;
  const seenCount = dismissed.length;
  const progress = initialTotal
    ? Math.min(1, (seenCount + (activeDish ? 1 : 0)) / initialTotal)
    : 1;

  const swipeTop = useCallback(
    (direction: "left" | "right") => {
      if (!activeDish || exitDirection) return;
      haptic();
      setExitDirection(direction);

      const dishToMove = activeDish;
      const id = setTimeout(() => {
        setUnswiped((prev) =>
          prev[0]?.slug === dishToMove.slug ? prev.slice(1) : prev,
        );
        if (direction === "right") {
          onCookDish(dishToMove);
        } else {
          setDismissed((prev) => [dishToMove, ...prev]);
          setExitDirection(null);
        }
      }, QUEUE_EXIT_MS);
      timersRef.current.push(id);
    },
    [activeDish, exitDirection, haptic, onCookDish],
  );

  const saveActive = useCallback(() => {
    if (!activeDish) return;
    onSaveDish(activeDish);
  }, [activeDish, onSaveDish]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        swipeTop("left");
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        swipeTop("right");
      }
      if ((event.key === "Enter" || event.key === " ") && activeDish) {
        event.preventDefault();
        swipeTop("right");
      }
      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveActive();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeDish, onClose, saveActive, swipeTop]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Meal swipe queue"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[180] flex h-full flex-col overflow-hidden bg-[#080907] text-white"
    >
      <div
        className="absolute inset-x-0 top-0 z-40 px-4"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 2.75rem)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-transparent text-white transition-colors hover:bg-white/10"
            aria-label="Close meal queue"
          >
            <X size={20} strokeWidth={2} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="h-1 overflow-hidden rounded-full bg-white/18">
              <motion.div
                className="h-full rounded-full bg-white"
                initial={false}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <p className="mt-2 text-center text-[11px] font-medium text-white/62">
              {activeDish ? seenCount + 1 : initialTotal} / {initialTotal}
            </p>
          </div>
          <div className="h-11 w-11" aria-hidden="true" />
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        {activeDish ? (
          <AnimatePresence mode="popLayout">
            {unswiped.slice(0, 3).map((dish, index) => (
              <FullscreenSwipeCard
                key={`${dish.slug}-${index}`}
                dish={dish}
                stackIndex={index}
                isTop={index === 0}
                exitDirection={index === 0 ? exitDirection : null}
                onSwipe={swipeTop}
              />
            ))}
          </AnimatePresence>
        ) : (
          <QueueComplete
            dismissed={dismissed}
            onReset={resetDeck}
            onClose={onClose}
          />
        )}
      </div>

      {activeDish && (
        <div
          className="absolute inset-x-0 bottom-0 z-40 bg-[#080907] px-5 pt-2"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.875rem)",
          }}
        >
          <div className="mx-auto mb-2 max-w-[430px] space-y-1">
            <h3 className="line-clamp-1 font-serif text-[25px] leading-none text-white">
              {activeDish.dishName}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-white/56">
              <span>{activeDish.cuisineFamily}</span>
              <span aria-hidden="true">/</span>
              <span>{activeDish.cookTimeMinutes} min</span>
              <span aria-hidden="true">/</span>
              <span>{activeDish.ingredientCount} ingredients</span>
            </div>
          </div>

          <div className="mx-auto grid max-w-[430px] grid-cols-[52px_0.9fr_1.2fr] items-center gap-3">
            <button
              type="button"
              onClick={() => swipeTop("left")}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/16 bg-transparent text-white transition-colors hover:bg-white/10"
              aria-label={`Pass on ${activeDish.dishName}`}
            >
              <X size={21} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={saveActive}
              className={cn(
                "flex h-[52px] items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                isDishSaved(activeDish.slug)
                  ? "border-pink-200 bg-pink-50 text-pink-500"
                  : "border-white/16 bg-transparent text-white hover:bg-white/10",
              )}
              aria-label={
                isDishSaved(activeDish.slug)
                  ? "Already saved"
                  : `Save ${activeDish.dishName}`
              }
            >
              <Heart
                size={18}
                className={isDishSaved(activeDish.slug) ? "fill-current" : ""}
              />
              <span>{isDishSaved(activeDish.slug) ? "Saved" : "Save"}</span>
            </button>
            <button
              type="button"
              onClick={() => swipeTop("right")}
              className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-neutral-950 transition-colors hover:bg-white/88"
              aria-label={`Cook ${activeDish.dishName}`}
            >
              <ChefHat size={18} strokeWidth={2.2} />
              <span>Cook</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function FullscreenSwipeCard({
  dish,
  stackIndex,
  isTop,
  exitDirection,
  onSwipe,
}: {
  dish: QuestDish;
  stackIndex: number;
  isTop: boolean;
  exitDirection: "left" | "right" | null;
  onSwipe: (direction: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-13, 13]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const strongVelocity = Math.abs(info.velocity.x) > 650;
    const farEnough = Math.abs(info.offset.x) > FULLSCREEN_SWIPE_THRESHOLD;
    if (farEnough || (strongVelocity && Math.abs(info.offset.x) > 42)) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  const scale = 1 - stackIndex * 0.045;
  const y = stackIndex * 14;
  const peekRotate = stackIndex === 1 ? 2.2 : stackIndex === 2 ? -1.6 : 0;

  return (
    <motion.div
      className="absolute inset-0 px-3 pb-[126px] pt-[104px]"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : peekRotate,
        zIndex: 20 - stackIndex,
      }}
      initial={{
        opacity: stackIndex === 0 ? 0 : 1,
        scale: scale - 0.02,
        y: y + 10,
      }}
      animate={{ opacity: 1, scale, y }}
      exit={{
        x:
          exitDirection === "right" ? 420 : exitDirection === "left" ? -420 : 0,
        rotate:
          exitDirection === "right" ? 18 : exitDirection === "left" ? -18 : 0,
        opacity: 0,
        transition: { duration: QUEUE_EXIT_MS / 1000, ease: "easeIn" },
      }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.62}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <article
        className={cn(
          "relative h-full overflow-hidden rounded-[30px] border border-white/10 bg-white",
          isTop && "cursor-grab active:cursor-grabbing",
        )}
        aria-label={`${dish.dishName}, ${dish.cuisineFamily}`}
      >
        <DishImage dish={dish} priority={isTop} fit="contain" />
      </article>
    </motion.div>
  );
}

function QueueComplete({
  dismissed,
  onReset,
  onClose,
}: {
  dismissed: QuestDish[];
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-7 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/12 text-white">
        <Check size={28} strokeWidth={2.2} />
      </div>
      <h3 className="mt-6 font-serif text-[40px] leading-none tracking-tight">
        Queue complete
      </h3>
      <p className="mt-4 max-w-[28ch] text-sm leading-relaxed text-white/64">
        You passed {dismissed.length} ideas. Reset the queue for another pass or
        head back to Today.
      </p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/12 bg-white/10 px-5 text-sm font-semibold text-white"
        >
          <RotateCcw size={16} />
          Reset queue
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-12 text-sm font-medium text-white/62"
        >
          Back to Today
        </button>
      </div>
    </div>
  );
}

function DishImage({
  dish,
  priority = false,
  fit = "cover",
}: {
  dish: QuestDish;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!dish.heroImageUrl || imgError) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        style={{ background: getCuisineGradient(dish.cuisineFamily) }}
      >
        <CuisineFallbackIcon cuisine={dish.cuisineFamily} />
        <span className="max-w-[18rem] px-8 text-center text-lg font-semibold text-white/90">
          {dish.dishName}
        </span>
      </div>
    );
  }

  return (
    <>
      {!imgLoaded && <div className="absolute inset-0 shimmer" />}
      <Image
        src={dish.heroImageUrl}
        alt={dish.dishName}
        fill
        sizes="(max-width: 768px) 100vw, 430px"
        className={cn(
          "transition-opacity duration-300",
          fit === "contain" ? "object-contain" : "object-cover",
          imgLoaded ? "opacity-100" : "opacity-0",
        )}
        draggable={false}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgError(true)}
      />
    </>
  );
}
