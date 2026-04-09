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
} from "@/data/guided-cook-steps";
import { sides } from "@/data";
import { useSavedDishes } from "@/lib/hooks/use-saved-dishes";

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
 * Build quest dish list from ALL side dishes in the catalog.
 * Guided-cook dishes appear first, sorted by preference match when preferences
 * are available, or shuffled daily for variety when no preferences are set.
 * Uses deterministic daily shuffle so the feed feels fresh each day.
 */
function buildQuestDishes(
  userPreferences?: Record<string, number>,
): QuestDish[] {
  const guidedSlugs = new Set(getAvailableCookSlugs());
  const guidedDishes: QuestDish[] = [];
  const catalogDishes: QuestDish[] = [];

  // Day-based seed for deterministic daily shuffle
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );

  // Add all sides from the catalog
  for (const side of sides) {
    const staticData = guidedSlugs.has(side.id)
      ? getStaticCookData(side.id)
      : null;

    const tags = side.tags
      .slice(0, 3)
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1));

    const dish: QuestDish = {
      dishName: side.name,
      slug: side.id,
      heroImageUrl: side.imageUrl ?? null,
      cookTimeMinutes: staticData
        ? staticData.prepTimeMinutes + staticData.cookTimeMinutes
        : 15,
      cuisineFamily: (
        side.tags.find((t) => CUISINE_TAGS.includes(t.toLowerCase())) ?? "Classic"
      ).replace(/^\w/, (c) => c.toUpperCase()),
      description: side.description,
      tags,
      ingredientCount: staticData ? staticData.ingredients.length : 5,
      hasGuidedCook: guidedSlugs.has(side.id),
    };

    if (guidedSlugs.has(side.id)) {
      guidedDishes.push(dish);
    } else {
      catalogDishes.push(dish);
    }
  }

  // Stable sort by slug so order is deterministic regardless of insertion order
  guidedDishes.sort((a, b) => a.slug.localeCompare(b.slug));

  const hasPrefs =
    userPreferences && Object.keys(userPreferences).length > 0;

  let orderedGuided: QuestDish[];
  if (hasPrefs) {
    // Preference mode: stable sort by score descending, guided dishes with best match first
    orderedGuided = [...guidedDishes].sort(
      (a, b) =>
        scoreDishForPreferences(b, userPreferences!) -
        scoreDishForPreferences(a, userPreferences!),
    );
  } else {
    // Daily rotation: dayOfYear % count picks today's starting index.
    // Same dish all day, different dish tomorrow, cycles through all guided dishes.
    const startIdx = dayOfYear % guidedDishes.length;
    orderedGuided = [
      ...guidedDishes.slice(startIdx),
      ...guidedDishes.slice(0, startIdx),
    ];
  }

  // Deterministic daily shuffle of catalog dishes (shown after all guided dishes)
  const shuffled = catalogDishes.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (dayOfYear * 31 + i * 17) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Guided dishes first (always have cook flows), then shuffled catalog
  return [...orderedGuided, ...shuffled];
}

const SWIPE_THRESHOLD = 80;

/** Map dish tags/cuisine to a relevant emoji for the image placeholder. */
function getDishEmoji(tags: string[], cuisine: string): string {
  const all = [...tags.map((t) => t.toLowerCase()), cuisine.toLowerCase()];
  if (all.some((t) => ["salad", "fresh", "raw", "green"].includes(t)))
    return "🥗";
  if (all.some((t) => ["soup", "broth", "stew"].includes(t))) return "🍲";
  if (all.some((t) => ["rice", "fried rice"].includes(t))) return "🍚";
  if (all.some((t) => ["bread", "toast", "baked"].includes(t))) return "🍞";
  if (all.some((t) => ["pasta", "noodle", "italian"].includes(t))) return "🍝";
  if (all.some((t) => ["mexican", "taco", "wrap"].includes(t))) return "🌮";
  if (all.some((t) => ["indian", "curry", "spicy"].includes(t))) return "🍛";
  if (all.some((t) => ["japanese", "korean", "asian", "sushi"].includes(t)))
    return "🍱";
  if (all.some((t) => ["sweet", "dessert"].includes(t))) return "🍮";
  if (all.some((t) => ["roasted", "grilled"].includes(t))) return "🥘";
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

      if (direction === "right") {
        const dish = questDishes[currentIndex % questDishes.length];
        if (dish.hasGuidedCook) {
          setExitDirection("right");
          scheduleTimeout(() => {
            router.push(`/cook/${dish.slug}`);
          }, 300);
        } else if (onFindSides) {
          // Non-guided dish: open search with this dish as the main course
          onFindSides(dish.dishName);
          setExitDirection("right");
          scheduleTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % questDishes.length);
            setExitDirection(null);
          }, 250);
        } else {
          // Fallback: just advance to next card
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
    [currentIndex, questDishes, router, saveDish, scheduleTimeout, onFindSides],
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

      {/* Card stack container */}
      <div className="relative" style={{ minHeight: 380 }}>
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
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, rgba(45,90,61,0.15) 0%, #fafaf8 55%, rgba(45,90,61,0.08) 100%)",
              }}
            >
              <span className="text-5xl">
                {getDishEmoji(dish.tags, dish.cuisineFamily)}
              </span>
              <span className="text-xs font-medium text-[var(--nourish-subtext)] text-center px-4 leading-tight">
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
          <h3 className="font-serif text-base font-bold text-[var(--nourish-dark)]">
            {dish.dishName}
          </h3>
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
              "transition-colors duration-200",
            )}
            type="button"
          >
            {dish.hasGuidedCook ? "Start cooking" : "Find sides"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
