"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  UtensilsCrossed,
  Layers,
  ChefHat,
  Info,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useMealPlanWeek } from "@/lib/hooks/use-meal-plan-week";
import {
  STANFORD_VENUES,
  demoDishToBrandedFood,
} from "@/data/eat-out/stanford-demo";
import { diaryLogBranded } from "@/lib/hooks/use-nutrition-diary";
import { toast } from "@/lib/hooks/use-toast";
import {
  buildSlotKey,
  dayKeyFromDate,
  pickCurrentMeal,
} from "@/types/meal-plan";
import { useSavedDishes } from "@/lib/hooks/use-saved-dishes";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { usePantry } from "@/lib/hooks/use-pantry";
import type { FilterOption } from "@/components/shared/filter-dropdown";
import { DishImage } from "./dish-image";
import { MealHealthSheet } from "./meal-health-sheet";
import { useMealHealthPanel } from "@/lib/hooks/use-meal-health-panel";
import {
  FullscreenSwipeCard,
  QueueComplete,
  QUEUE_EXIT_MS,
} from "./meal-swipe-queue-cards";
import { buildQuestDishes, buildRoleQuestDishes } from "./quest-pool";
import { QuestFilterMenu } from "./quest-filter-menu";
import { useCareProfile } from "@/lib/hooks/use-care-profile";
import {
  therapeuticsActive,
  clinicianReviewMode,
} from "@/lib/therapeutics/feature-flag";
import { registryIsClinicianApproved } from "@/data/therapeutics";
import {
  useQuestFilters,
  type DishRoleFilter,
} from "@/lib/hooks/use-quest-filters";
import type { Daypart } from "@/types";
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
  /** Present when the card is an eat-out menu item (deck mode toggle) —
   *  swaps the meta line + primary action (Log instead of Cook). */
  eatOut?: {
    venueName: string;
    distanceKm: number;
    price: string;
    kcal: number;
  };
  isVerified: boolean;
  /** Dish role — drives the Today Filter. Mains are "main"; sides carry their
   *  classified role. */
  role: DishRoleFilter;
  /** Dayparts a main suits (Today "Meal type" filter). Undefined for sides. */
  dayparts?: Daypart[];
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
  // Quest filters: role / meal-type / cuisine / cook-time. Session-scoped so
  // they never become permanent settings — they reset at app close.
  const filters = useQuestFilters();
  // The role facet rewires the feed: Main → the full quest pool; Side/Drink/Snack
  // → the role-specific catalogue feed (same quest shell, rule 4).
  const baseDishes = useMemo(() => {
    const pantry = pantryMounted ? pantryItems : undefined;
    // Main → the full quest pool, but kept to actual mains (the pool mixes in a
    // few sides; the role filter makes "Main" mean mains). Side/Drink/Snack →
    // the role-specific feed.
    return filters.role === "main"
      ? buildQuestDishes(
          userPreferences,
          cookHistory,
          pantry,
          progression,
        ).filter((d) => d.role === "main")
      : buildRoleQuestDishes(filters.role, pantry);
  }, [
    userPreferences,
    cookHistory,
    pantryItems,
    pantryMounted,
    progression,
    filters.role,
  ]);

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

  // Today's planned meal (time-of-day slot) is folded INTO the deck: it pins
  // to the front and the hero label flips to "Planned for today" — one card,
  // not a separate banner. Swiping past it is the natural "not tonight".
  const { slotMap, mounted: planMounted } = useMealPlanWeek();

  // Founder feature (2026-06-11): the SAME condensed deck format can show
  // eat-out menu content — tap the header chips to switch sources.
  const [queueMode, setQueueMode] = useState<"cook" | "eat-out">("cook");
  const eatOutDeck = useMemo<QuestDish[]>(
    () =>
      STANFORD_VENUES.flatMap((venue) =>
        venue.dishes.map((dish) => ({
          dishName: dish.name,
          slug: dish.slug,
          heroImageUrl: dish.image,
          cookTimeMinutes: 0,
          cuisineFamily: venue.cuisine,
          description: dish.blurb,
          tags: [...dish.tags],
          ingredientCount: 0,
          ingredientNames: [],
          hasGuidedCook: false,
          isMeal: true,
          isVerified: false,
          role: "main" as const,
          pantryFit: 0,
          eatOut: {
            venueName: venue.name,
            distanceKm: venue.distanceKm,
            price: venue.price,
            kcal: dish.kcal,
          },
        })),
      ).sort((a, b) => a.eatOut!.distanceKm - b.eatOut!.distanceKm),
    [],
  );
  const plannedSlug = useMemo(() => {
    if (!planMounted) return null;
    const now = new Date();
    return (
      slotMap[buildSlotKey(dayKeyFromDate(now), pickCurrentMeal(now))] ?? null
    );
  }, [planMounted, slotMap]);

  const questDishes = useMemo(() => {
    if (queueMode === "eat-out") return eatOutDeck;
    const cap =
      filters.cookTime === "any"
        ? Number.POSITIVE_INFINITY
        : Number.parseInt(filters.cookTime, 10);
    const cuisineKey = filters.cuisine.toLowerCase();
    // Meal type only applies to mains (sides aren't daypart-bound).
    const dayType =
      filters.role === "main" && filters.mealType !== "any"
        ? filters.mealType
        : null;
    const filtered = baseDishes.filter((d) => {
      if (d.cookTimeMinutes > cap) return false;
      if (filters.cuisine !== "any") {
        if (d.cuisineFamily.toLowerCase() !== cuisineKey) return false;
      }
      if (dayType && !(d.dayparts ?? []).includes(dayType)) return false;
      return true;
    });
    // Graceful fallback: if the filter combination yields nothing, return
    // the base feed so the user never hits an empty state because of filters.
    const result = filtered.length > 0 ? filtered : baseDishes;
    if (!plannedSlug) return result;
    const pinned =
      result.find((d) => d.slug === plannedSlug) ??
      baseDishes.find((d) => d.slug === plannedSlug);
    if (!pinned) return result;
    return [pinned, ...result.filter((d) => d.slug !== pinned.slug)];
  }, [
    queueMode,
    eatOutDeck,
    plannedSlug,
    baseDishes,
    filters.cookTime,
    filters.cuisine,
    filters.role,
    filters.mealType,
  ]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [queueOpen, setQueueOpen] = useState(false);

  // When a filter changes the feed, snap the preview back to the first dish.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset preview position on filter change
    setPreviewIndex(0);
  }, [filters.role, filters.cuisine, filters.cookTime, filters.mealType]);
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

  const eatOutLookup = useMemo(() => {
    const map = new Map<string, (typeof STANFORD_VENUES)[number]>();
    for (const venue of STANFORD_VENUES)
      for (const dish of venue.dishes) map.set(dish.slug, venue);
    return map;
  }, []);

  const routeDish = useCallback(
    (dish: QuestDish) => {
      setQueueOpen(false);

      if (dish.eatOut) {
        const venue = eatOutLookup.get(dish.slug);
        const source = venue?.dishes.find((dd) => dd.slug === dish.slug);
        if (venue && source) {
          diaryLogBranded(demoDishToBrandedFood(source, venue), 1);
          toast.push({
            variant: "success",
            title: `Logged ${dish.dishName}`,
            body: `${venue.name} · ~${source.kcal} kcal`,
            dedupKey: "queue-eat-out-log",
          });
        }
        return;
      }

      if (dish.hasGuidedCook && !dish.isMeal) {
        router.push(`/cook/${dish.slug}`);
        return;
      }

      const params = new URLSearchParams({ main: dish.dishName });
      if (dish.heroImageUrl) params.set("img", dish.heroImageUrl);
      router.push(`/sides?${params.toString()}`);
    },
    [router, eatOutLookup],
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
      {/* Section header + the single faceted Filter entry — a compact text
          dropdown (role / meal type / cuisine / cook time). Session-scoped. */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div
          role="tablist"
          aria-label="Queue source"
          className="flex items-center gap-1"
        >
          {(
            [
              ["cook", "Meal queue"],
              ["eat-out", "Eat out"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={queueMode === mode}
              onClick={() => setQueueMode(mode)}
              className={cn(
                "sous-label rounded-full px-2 py-1 transition-colors",
                queueMode === mode
                  ? "bg-[var(--nourish-green)]/10 !text-[var(--nourish-green)]"
                  : "opacity-60 hover:opacity-100",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {queueMode === "cook" && (
          <QuestFilterMenu filters={filters} cuisineOptions={cuisineOptions} />
        )}
      </div>

      {/* Card stack container  -  minHeight 460 pushes action chips below fold at 375×667 */}
      {previewDish && (
        <MealQueuePreview
          label={
            queueMode === "eat-out"
              ? "Near Stanford"
              : plannedSlug && previewDish?.slug === plannedSlug
                ? "Planned for today"
                : undefined
          }
          dish={previewDish}
          count={queueDishes.length}
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
  count,
  onOpen,
  label,
}: {
  dish: QuestDish;
  count: number;
  onOpen: () => void;
  label?: string;
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
        aria-label={`Browse ${count} meals, starting with ${dish.dishName}`}
      >
        {/* Phase 5 — the whole card is the door to the deck: a "Browse N meals"
            pill + a 2px card-peek telegraph a swipeable deck (no orphan circle). */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-x-1 -bottom-1.5 top-2 -z-10 rounded-[var(--radius-lg)] border border-neutral-200 bg-neutral-100 [transform:rotate(-1.5deg)]"
          />
          <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-lg)] border border-neutral-200 bg-white">
            <DishImage dish={dish} priority fit="cover" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/92 px-3.5 py-1.5 text-[12px] font-semibold text-neutral-900 shadow-sm transition-colors group-hover:bg-white">
                <Layers size={14} strokeWidth={2} aria-hidden />
                Browse {count} meals
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-2 px-1">
          <div className="space-y-1">
            <p className="sous-label">
              {label ?? (dish.isMeal ? "Dinner idea" : "Side idea")}
            </p>
            <h3 className="font-serif text-[clamp(1.4rem,5.6vw,1.75rem)] leading-[1.12] font-normal [text-wrap:balance] text-[var(--nourish-dark)]">
              {dish.dishName}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--nourish-subtext)]">
            {dish.eatOut ? (
              <>
                <span>{dish.eatOut.venueName}</span>
                <span aria-hidden="true">/</span>
                <span>{dish.eatOut.distanceKm} km</span>
                <span aria-hidden="true">/</span>
                <span>~{dish.eatOut.kcal} kcal</span>
              </>
            ) : (
              <>
                <span>{dish.cuisineFamily}</span>
                <span aria-hidden="true">/</span>
                <span>{dish.cookTimeMinutes} min</span>
                <span aria-hidden="true">/</span>
                <span>{dish.ingredientCount} ingredients</span>
              </>
            )}
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

  const healthPanel = useMealHealthPanel();
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
            isOpen={healthPanel.isOpen}
            onClose={healthPanel.close}
            onDragEnd={healthPanel.onDragEnd}
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
          {/* Floating Info button — anchored just above the recipe name, over the
              photo, so it can never be occluded by this bar. Reveals the health
              sheet. Hidden while the sheet is open. */}
          {therapeuticsActive() && !healthPanel.isOpen && (
            <button
              type="button"
              onClick={healthPanel.open}
              aria-label={`Show info for ${activeDish.dishName}`}
              className="absolute -top-[52px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-[12px] font-semibold text-white shadow-lg backdrop-blur-md transition-transform active:scale-95"
            >
              <Info size={14} strokeWidth={2.2} />
              Info
              <ChevronUp
                size={13}
                strokeWidth={2.4}
                className="opacity-75"
                aria-hidden="true"
              />
            </button>
          )}

          <div className="mx-auto mb-2 max-w-[430px] space-y-1">
            <h3 className="line-clamp-1 font-serif text-[25px] leading-none text-white">
              {activeDish.dishName}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-white/56">
              {activeDish.eatOut ? (
                <>
                  <span>{activeDish.eatOut.venueName}</span>
                  <span aria-hidden="true">/</span>
                  <span>{activeDish.eatOut.distanceKm} km</span>
                  <span aria-hidden="true">/</span>
                  <span>
                    ~{activeDish.eatOut.kcal} kcal · {activeDish.eatOut.price}
                  </span>
                </>
              ) : (
                <>
                  <span>{activeDish.cuisineFamily}</span>
                  <span aria-hidden="true">/</span>
                  <span>{activeDish.cookTimeMinutes} min</span>
                  <span aria-hidden="true">/</span>
                  <span>{activeDish.ingredientCount} ingredients</span>
                </>
              )}
            </div>
          </div>

          {/* Phase 5 — one dominant action: Pass + Save are equal ghost circles,
              Cook is the single wide solid primary (Rule 2). */}
          <div className="mx-auto grid max-w-[430px] grid-cols-[52px_52px_1fr] items-center gap-3">
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
                "flex h-[52px] w-[52px] items-center justify-center rounded-full border transition-colors",
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
                size={20}
                className={isDishSaved(activeDish.slug) ? "fill-current" : ""}
              />
            </button>
            <button
              type="button"
              onClick={() => swipeTop("right")}
              className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-neutral-950 transition-colors hover:bg-white/88"
              aria-label={
                activeDish.eatOut
                  ? `Log ${activeDish.dishName}`
                  : `Cook ${activeDish.dishName}`
              }
            >
              <ChefHat size={18} strokeWidth={2.2} />
              <span>{activeDish.eatOut ? "Log it" : "Cook"}</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
