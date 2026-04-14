"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  type PanInfo,
} from "framer-motion";
import Image from "next/image";
import { Clock, ShoppingBag, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  getAvailableCookSlugs,
  getStaticCookData,
  getStaticMealCookData,
} from "@/data/guided-cook-steps";
import { sides, meals } from "@/data";
import { useSavedDishes } from "@/lib/hooks/use-saved-dishes";
import { useHaptic } from "@/lib/hooks/use-haptic";

interface QuestDish {
  dishName: string;
  slug: string;
  heroImageUrl: string | null;
  cookTimeMinutes: number;
  cuisineFamily: string;
  description: string;
  tags: string[];
  ingredientCount: number;
  hasGuidedCook: boolean;
  isMeal: boolean;
  isVerified: boolean;
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
 */
function buildQuestDishes(
  userPreferences?: Record<string, number>,
): QuestDish[] {
  const guidedSlugs = new Set(getAvailableCookSlugs());

  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );

  // Build meal quest dishes
  const mealDishes: QuestDish[] = meals.map((meal) => {
    const mealCookData = getStaticMealCookData(meal.id);
    const hasCook = !!mealCookData || guidedSlugs.has(meal.id);
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
      hasGuidedCook: hasCook,
      isMeal: true,
      isVerified: !!meal.nourishVerified,
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
      hasGuidedCook: guidedSlugs.has(side.id),
      isMeal: false,
      isVerified: false,
    };
  });

  const hasPrefs = userPreferences && Object.keys(userPreferences).length > 0;

  // Score and sort meals: prefer meals with images, then verified, then preference match
  const scoredMeals = mealDishes
    .map((m) => ({
      dish: m,
      score:
        (m.heroImageUrl ? 10 : 0) +
        (m.isVerified ? 3 : 0) +
        (m.hasGuidedCook ? 5 : 0) +
        (hasPrefs ? scoreDishForPreferences(m, userPreferences!) : 0),
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
        (hasPrefs ? scoreDishForPreferences(s, userPreferences!) : 0),
    }))
    .sort(
      (a, b) => b.score - a.score || a.dish.slug.localeCompare(b.dish.slug),
    );

  // Daily rotation offset
  const mealOffset = dayOfYear % Math.max(1, scoredMeals.length);
  const sideOffset = dayOfYear % Math.max(1, scoredSides.length);

  const rotatedMeals = [
    ...scoredMeals.slice(mealOffset),
    ...scoredMeals.slice(0, mealOffset),
  ].map((s) => s.dish);

  const rotatedSides = [
    ...scoredSides.slice(sideOffset),
    ...scoredSides.slice(0, sideOffset),
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

const SWIPE_THRESHOLD = 80;

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

/** Extract descriptive tags for a meal from its description. */
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

/** Map dish tags/cuisine to a relevant emoji for the image placeholder. */
function getDishEmoji(tags: string[], cuisine: string): string {
  const all = [...tags.map((t) => t.toLowerCase()), cuisine.toLowerCase()];
  // Cuisine-specific emoji for main meals
  if (all.includes("japanese")) return "🍱";
  if (all.includes("korean")) return "🍲";
  if (all.includes("thai")) return "🍜";
  if (all.includes("chinese")) return "🥡";
  if (all.includes("vietnamese")) return "🍜";
  if (all.includes("filipino")) return "🍛";
  if (all.includes("indian")) return "🍛";
  if (all.includes("italian")) return "🍝";
  if (all.includes("mexican")) return "🌮";
  if (all.includes("mediterranean")) return "🥘";
  // Type-specific
  if (all.some((t) => ["salad", "fresh", "raw", "green"].includes(t)))
    return "🥗";
  if (all.some((t) => ["soup", "broth", "stew"].includes(t))) return "🍲";
  if (all.some((t) => ["rice", "fried rice"].includes(t))) return "🍚";
  if (all.some((t) => ["bread", "toast", "baked"].includes(t))) return "🍞";
  if (all.some((t) => ["sweet", "dessert"].includes(t))) return "🍮";
  if (all.some((t) => ["roasted", "grilled", "bbq"].includes(t))) return "🥘";
  if (all.some((t) => ["fish", "seafood", "shrimp"].includes(t))) return "🐟";
  if (all.some((t) => ["chicken", "poultry"].includes(t))) return "🍗";
  if (all.some((t) => ["beef", "pork", "meat", "lamb"].includes(t)))
    return "🥩";
  return "🍽️";
}

/**
 * QuestCard — swipeable Tinder-style card stack.
 * Dishes are sourced from guided-cook-steps data (real recipes with cook flows).
 * Swipe right to cook, left to skip. Heart saves to localStorage.
 * Pass userPreferences to surface preference-matched dishes first.
 */
export function QuestCard({
  onFindSides,
  userPreferences,
}: {
  onFindSides?: (dishName: string) => void;
  userPreferences?: Record<string, number>;
}) {
  const questDishes = useMemo(
    () => buildQuestDishes(userPreferences),
    [userPreferences],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null,
  );
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

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (questDishes.length === 0) return;
      haptic();

      if (direction === "right") {
        const dish = questDishes[currentIndex % questDishes.length];
        if (dish.isMeal && onFindSides) {
          // Meal card: trigger the pairing flow to find sides
          onFindSides(dish.dishName);
          setExitDirection("right");
          scheduleTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % questDishes.length);
            setExitDirection(null);
          }, 250);
        } else if (dish.hasGuidedCook && !dish.isMeal) {
          // Side dish with guided cook: go straight to cook flow
          setExitDirection("right");
          scheduleTimeout(() => {
            router.push(`/cook/${dish.slug}`);
          }, 300);
        } else if (onFindSides) {
          onFindSides(dish.dishName);
          setExitDirection("right");
          scheduleTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % questDishes.length);
            setExitDirection(null);
          }, 250);
        } else {
          setExitDirection("right");
          scheduleTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % questDishes.length);
            setExitDirection(null);
          }, 250);
        }
      } else {
        setExitDirection("left");
        scheduleTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % questDishes.length);
          setExitDirection(null);
        }, 250);
      }
    },
    [currentIndex, questDishes, router, scheduleTimeout, onFindSides, haptic],
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

  if (questDishes.length === 0) {
    return null;
  }

  // Show up to 3 stacked cards
  const visibleCards = [];
  for (let i = 0; i < Math.min(3, questDishes.length); i++) {
    const idx = (currentIndex + i) % questDishes.length;
    visibleCards.push({ ...questDishes[idx], stackIndex: i });
  }

  return (
    <div className="space-y-1.5">
      {/* Section header */}
      <div className="px-1">
        <h2 className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
          Today&apos;s Quest
        </h2>
      </div>

      {/* Card stack container — minHeight 460 pushes action chips below fold at 375×667 */}
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
              />
            ))}
        </AnimatePresence>

        {/* Saved for later toast */}
        <AnimatePresence>
          {savedToastSlug && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
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
}) {
  const [imgError, setImgError] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);

  // Swipe indicator overlays
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);
  // Scale labels as drag approaches threshold
  const likeScale = useTransform(x, [0, 80], [0.8, 1.1]);
  const nopeScale = useTransform(x, [-80, 0], [1.1, 0.8]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  // Stack positioning: scale down, shift back, and rotate for peek effect
  const scale = 1 - stackIndex * 0.04;
  const translateY = stackIndex * 14;
  const peekRotation = stackIndex === 1 ? 2 : stackIndex === 2 ? -1.5 : 0;

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
        x:
          exitDirection === "right" ? 300 : exitDirection === "left" ? -300 : 0,
        rotate:
          exitDirection === "right" ? 20 : exitDirection === "left" ? -20 : 0,
        opacity: 0,
        transition: { duration: 0.25, ease: "easeIn" },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm",
          isTop && "cursor-grab active:cursor-grabbing shadow-md",
        )}
      >
        {/* Swipe feedback overlays — only on top card */}
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
              <span className="text-6xl drop-shadow-sm">
                {getDishEmoji(dish.tags, dish.cuisineFamily)}
              </span>
              <span className="text-sm font-semibold text-white/90 text-center px-6 leading-tight drop-shadow-sm">
                {dish.dishName}
              </span>
            </div>
          )}
          {/* Bottom gradient for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/15 to-transparent" />
          {/* Cuisine family badge — bottom left of hero image */}
          <div className="absolute bottom-2 left-3 rounded-full bg-black/30 backdrop-blur-sm px-2.5 py-0.5">
            <span className="text-[10px] font-semibold text-white tracking-wide">
              {dish.cuisineFamily}
            </span>
          </div>
          {/* Skip (X) button — top right, min 44px touch target */}
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
          {/* Flavor tags */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {dish.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--nourish-green)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--nourish-green)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action row — heart save + Start cooking */}
        <div className="flex items-center gap-3 px-4 pb-4 pt-1.5">
          {/* Save for later — heart button */}
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

          {/* Primary CTA — cook if guided, find sides otherwise */}
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
              "shadow-sm shadow-[var(--nourish-green)]/20",
              "transition-colors duration-200 cta-glow",
            )}
            type="button"
          >
            {dish.isMeal
              ? "Find sides →"
              : dish.hasGuidedCook
                ? "Start cooking"
                : "Find sides"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
