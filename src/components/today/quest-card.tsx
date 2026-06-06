"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  Clock,
  X,
  Heart,
  UtensilsCrossed,
  Maximize2,
  ChefHat,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSavedDishes } from "@/lib/hooks/use-saved-dishes";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { usePantry } from "@/lib/hooks/use-pantry";
import {
  FilterDropdown,
  type FilterOption,
} from "@/components/shared/filter-dropdown";
import { DishImage } from "./dish-image";
import { MealHealthSheet } from "./meal-health-sheet";
import {
  FullscreenSwipeCard,
  QueueComplete,
  QUEUE_EXIT_MS,
} from "./meal-swipe-queue-cards";
import { buildQuestDishes } from "./quest-pool";
import { useCareProfile } from "@/lib/hooks/use-care-profile";
import {
  therapeuticsActive,
  clinicianReviewMode,
} from "@/lib/therapeutics/feature-flag";
import { registryIsClinicianApproved } from "@/data/therapeutics";
import { useQuestFilters } from "@/lib/hooks/use-quest-filters";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import { useDifficultyProgression } from "@/lib/hooks/use-difficulty-progression";

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

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 600;
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
        <h2 className="shrink-0 sous-label">Meal queue</h2>
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
        <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-lg)] border border-neutral-200 bg-white">
          <DishImage dish={dish} priority fit="cover" />
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
  const { profile: careProfile } = useCareProfile();
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
          <QueueComplete onReset={resetDeck} onClose={onClose} />
        )}

        {activeDish && therapeuticsActive() && (
          <MealHealthSheet
            key={activeDish.slug}
            dishName={activeDish.dishName}
            tags={activeDish.tags}
            slug={activeDish.slug}
            description={activeDish.description}
            conditions={careProfile.conditions}
            reviewed={registryIsClinicianApproved()}
            clinicianReview={clinicianReviewMode()}
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
