"use client";

import {
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChefHat, UtensilsCrossed } from "lucide-react";
import { PhaseIndicator } from "@/components/guided-cook/phase-indicator";
import { IngredientList } from "@/components/guided-cook/ingredient-list";
import type { IngredientSection } from "@/components/guided-cook/ingredient-list";
import { ServingSlider } from "@/components/guided-cook/serving-slider";
import { scaleQuantity } from "@/lib/cook/scale-quantity";
import { getRecipeLink } from "@/data/ingredients/recipe-links";
import { CombinedCookWatchlist } from "@/components/guided-cook/cook-watchlist";
import { StepCard } from "@/components/guided-cook/step-card";
import { ParallelHintBanner } from "@/components/guided-cook/parallel-hint-banner";
import { DishProgressStrip } from "@/components/guided-cook/dish-progress-strip";
import { PlanCookChip } from "@/components/guided-cook/plan-cook-chip";
import { BigHandsToggle } from "@/components/guided-cook/big-hands-toggle";
import { useBigHands } from "@/lib/hooks/use-big-hands";
import { WinScreen } from "@/components/guided-cook/win-screen";
import { CookTimer } from "@/components/guided-cook/cook-timer";
import { TimerStack } from "@/components/guided-cook/timer-stack";
import { useCookStore } from "@/lib/hooks/use-cook-store";
import type { CookDishEntry } from "@/lib/hooks/use-cook-store";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { diaryLogCook } from "@/lib/hooks/use-nutrition-diary";
import {
  grantDishToDoge,
  creditCookGold,
  noteCookForFact,
} from "@/lib/doge/sous-bridge";
import { useSkillProgress } from "@/lib/hooks/use-skill-progress";
import { useXPSystem, XP_AWARDS } from "@/lib/hooks/use-xp-system";
import { toast } from "@/lib/hooks/use-toast";
import { getSkillNodesForDish, getSkillNode } from "@/data/skill-tree";
import type { SkillProgressEntry } from "@/components/guided-cook/win-screen";
import { cn } from "@/lib/utils/cn";
import { trpc } from "@/lib/trpc/client";
import {
  buildCombinedDisplayName,
  buildCombinedSlug,
  buildIngredientSections,
  buildOrderedDishes,
  buildParallelHintMap,
} from "@/lib/cook/combined-shapers";
import { usePreferenceProfile } from "@/lib/hooks/use-preference-profile";
import { dishToFacets } from "@/lib/intelligence/dish-to-facets";

/**
 * Combined Cook Page  -  guides the user through cooking a main dish + 1-3 sides
 * in a single session. Follows the same Mission → Grab → Cook → Win shell.
 *
 * URL: /cook/combined?main=SLUG&sides=SLUG1,SLUG2
 *
 * During the Cook phase, dishes are cooked sequentially (longest first).
 * Between dishes, a brief transition card appears.
 */
export default function CombinedCookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-[var(--nourish-green)]" />
        </div>
      }
    >
      <CombinedCookContent />
    </Suspense>
  );
}

function CombinedCookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Reduced-motion gate, consumed by the page-shell entrance below. Site-wide
  // gating is complete (the sous/reduced-motion-gate ESLint rule is enforced at
  // error; see docs/REDUCED-MOTION-GATE-TODO.md, marked done 2026-06-04).
  const reducedMotion = useReducedMotion();

  const mainSlug = searchParams.get("main") ?? "";
  const sidesParam = searchParams.get("sides") ?? "";
  const sideSlugs = useMemo(
    () => sidesParam.split(",").filter(Boolean),
    [sidesParam],
  );

  const { enabled: bigHands } = useBigHands();
  // Session tracking
  const { startSession, completeSession, updateSession } = useCookSessions();
  // Y5 D, audit P0 #6 — fired once at the win transition with one
  // signal per cooked dish so multi-dish cooks contribute
  // proportionally to the editable preference profile.
  const { recordSignal: recordPreferenceSignal } = usePreferenceProfile();
  const { recordSkillCook, getNodeProgress } = useSkillProgress();
  const {
    awardXP,
    levelUpPending,
    dismissLevelUp,
    title: levelTitle,
  } = useXPSystem();

  useEffect(() => {
    if (levelUpPending === null) return;
    toast.push({
      variant: "level-up",
      title: `Level ${levelUpPending}`,
      body: levelTitle,
      emoji: "⭐",
      dedupKey: `level-up:${levelUpPending}`,
    });
    dismissLevelUp();
  }, [levelUpPending, levelTitle, dismissLevelUp]);
  const sessionIdRef = useRef<string | null>(null);
  // Render-safe mirror of the session id, used as the auto-log batchId so the
  // win-screen Undo removes the whole combined batch. Set in the completion
  // handler (reading the ref directly during render is disallowed).
  const [autoLogBatchId, setAutoLogBatchId] = useState<string | undefined>(
    undefined,
  );
  /** Matches single-cook StepCard: back navigation reverses slide direction. */
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);
  // Guard against rapid double-tap on the "Next step" button
  const isAdvancingRef = useRef(false);
  const [winMeta, setWinMeta] = useState<{
    pathJustUnlocked: boolean;
    streak: number;
    saved: boolean;
    skillProgress: SkillProgressEntry[];
  }>({ pathJustUnlocked: false, streak: 0, saved: false, skillProgress: [] });

  // Cook store
  const {
    currentPhase,
    currentStepIndex,
    expandedChip,
    cookMode,
    dishes,
    currentDishIndex,
    setPhase,
    setTotalSteps,
    toggleChip,
    startTimer,
    startCombinedSession,
    nextDish,
    completeSession: completeCookPhase,
    reset,
  } = useCookStore();

  // Fetch combined data
  const { data, isLoading, error } = trpc.cook.getCombinedSteps.useQuery(
    { mainDishSlug: mainSlug, sideSlugs },
    { enabled: sideSlugs.length > 0 },
  );

  // Build ordered dish data based on cookOrder
  const orderedDishes = useMemo(
    () =>
      data ? buildOrderedDishes(data.main, data.sides, data.cookOrder) : [],
    [data],
  );

  // Current dish being cooked
  const currentDish = orderedDishes[currentDishIndex] ?? null;

  // Cook steps for the current dish
  const currentCookSteps = useMemo(
    () =>
      currentDish?.steps.filter((s: { phase: string }) => s.phase === "cook") ??
      [],
    [currentDish],
  );

  const currentCookStep = currentCookSteps[currentStepIndex];

  // Reset store on mount to ensure clean state (handles direct URL navigation)
  const initializedRef = useRef(false);
  useEffect(() => {
    reset();
    return () => {
      reset();
    };
  }, [reset]);

  // Initialize the combined session once data loads
  useEffect(() => {
    if (data && orderedDishes.length > 0 && !initializedRef.current) {
      initializedRef.current = true;

      const dishEntries: CookDishEntry[] = orderedDishes.map((d) => ({
        slug: d.dish.slug,
        name: d.dish.name,
        totalSteps: d.steps.filter((s) => s.phase === "cook").length,
      }));
      startCombinedSession(dishEntries);

      // Start a local session for tracking. We encode the combined slug
      // as `<main>+<side>+<side>` so history queries can distinguish a
      // multi-dish cook from a single-dish one. See AUDIT-2026-04-17 P1-10.
      if (!sessionIdRef.current) {
        const firstDish = orderedDishes[0];
        sessionIdRef.current = startSession(
          buildCombinedSlug(orderedDishes),
          buildCombinedDisplayName(orderedDishes),
          firstDish.dish.cuisineFamily,
        );
      }
    }
  }, [data, orderedDishes, startCombinedSession, startSession]);

  // Servings — scale EVERY dish's ingredient quantities by one shared serving
  // count (the missing-from-combined-cook control). Base is the main dish's
  // servingsPerRecipe; each dish scales by servings / its-own-base so mains +
  // sides with different bases stay proportional.
  const [servingsOverride, setServingsOverride] = useState<number | null>(null);
  const mainSlugForBase =
    data?.main?.dish?.slug ?? orderedDishes[0]?.dish?.slug ?? "";
  const baseServings = getRecipeLink(mainSlugForBase)?.servingsPerRecipe ?? 4;
  const servings = servingsOverride ?? baseServings;

  // Build segmented ingredient sections for the Grab phase, scaled to servings.
  const ingredientSections = useMemo<IngredientSection[]>(() => {
    const sections = buildIngredientSections(orderedDishes);
    return sections.map((sec, i) => {
      const dishSlug = orderedDishes[i]?.dish.slug ?? "";
      const dishBase =
        getRecipeLink(dishSlug)?.servingsPerRecipe ?? baseServings;
      const mult = dishBase > 0 ? servings / dishBase : 1;
      if (Math.abs(mult - 1) < 0.001) return sec;
      return {
        ...sec,
        ingredients: sec.ingredients.map((ing) => ({
          ...ing,
          quantity: scaleQuantity(ing.quantity, mult),
        })),
      };
    });
  }, [orderedDishes, servings, baseServings]);

  // Flat ingredients (used by step card) — derived from the scaled sections so
  // the cook steps reference the same scaled amounts.
  const allIngredients = useMemo(
    () => ingredientSections.flatMap((s) => s.ingredients),
    [ingredientSections],
  );

  // Shape each orderedDish back into a StaticDishData-compatible object so
  // the IngredientList can offer a "By station" coalesced view. Only
  // meaningful when there are 2+ dishes.
  const prepDishes = useMemo(() => {
    return orderedDishes.map((d) => ({
      name: d.dish.name,
      slug: d.dish.slug,
      description: d.dish.description ?? "",
      cuisineFamily: d.dish.cuisineFamily,
      prepTimeMinutes: d.dish.prepTimeMinutes,
      cookTimeMinutes: d.dish.cookTimeMinutes,
      skillLevel: d.dish.skillLevel ?? "beginner",
      heroImageUrl: d.dish.heroImageUrl ?? null,
      flavorProfile: (d.dish.flavorProfile ?? []) as string[],
      temperature: d.dish.temperature ?? "hot",
      ingredients: d.ingredients.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        isOptional: !!i.isOptional,
        substitution: i.substitution ?? null,
      })),
      steps: d.steps.map((s) => ({
        phase: "cook" as const,
        stepNumber: s.stepNumber ?? 0,
        instruction: s.instruction,
        timerSeconds: s.timerSeconds ?? null,
        mistakeWarning: s.mistakeWarning ?? null,
        quickHack: s.quickHack ?? null,
        cuisineFact: s.cuisineFact ?? null,
        donenessCue: s.donenessCue ?? null,
        imageUrl: s.imageUrl ?? null,
      })),
    }));
  }, [orderedDishes]);

  // Sequencer parallel hints: map of "dishSlug-stepIndex" -> hint text
  const parallelHintMap = useMemo(
    () => buildParallelHintMap(data?.sequencerHints),
    [data?.sequencerHints],
  );

  // Current step parallel hint
  const currentParallelHint =
    currentDish && currentCookStep
      ? (parallelHintMap.get(`${currentDish.dish.slug}-${currentStepIndex}`) ??
        null)
      : null;

  // W29 dish-progress strip input — name + total cook steps per
  // dish, fed into the dual-track strip alongside the cook-store
  // active indices.
  const dishProgressInputs = useMemo(
    () =>
      orderedDishes.map((d) => ({
        name: d.dish.name,
        totalSteps: d.steps.filter((s) => s.phase === "cook").length,
      })),
    [orderedDishes],
  );

  // Combined totals for mission screen
  const totalPrepTime = useMemo(
    () => orderedDishes.reduce((sum, d) => sum + d.dish.prepTimeMinutes, 0),
    [orderedDishes],
  );
  const totalCookTime = useMemo(
    () => orderedDishes.reduce((sum, d) => sum + d.dish.cookTimeMinutes, 0),
    [orderedDishes],
  );
  const allFlavorProfiles = useMemo(() => {
    const set = new Set<string>();
    orderedDishes.forEach((d) => {
      (d.dish.flavorProfile as string[]).forEach((f) => set.add(f));
    });
    return Array.from(set).slice(0, 5);
  }, [orderedDishes]);

  // The "main" dish for display purposes (first in the list, or the actual main)
  const mainDish = data?.main?.dish ?? orderedDishes[0]?.dish ?? null;

  // ── Handlers ──────────────────────────────────────

  const handleMissionStart = useCallback(() => {
    if (allIngredients.length > 0) {
      setPhase("grab");
    } else {
      setTotalSteps(currentCookSteps.length);
      setPhase("cook");
    }
  }, [allIngredients, setPhase, setTotalSteps, currentCookSteps.length]);

  const handleGrabReady = useCallback(() => {
    // Set total steps for the first dish
    if (currentDish) {
      const steps = currentDish.steps.filter((s) => s.phase === "cook").length;
      setTotalSteps(steps);
    }
    setPhase("cook");
  }, [currentDish, setPhase, setTotalSteps]);

  const handleNext = useCallback(() => {
    // Guard against rapid double-tap
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;
    setTimeout(() => {
      isAdvancingRef.current = false;
    }, 400);

    setStepDirection(1);

    if (currentStepIndex >= currentCookSteps.length - 1) {
      // Completed the current dish's cook steps
      const isLastDish = currentDishIndex >= dishes.length - 1;

      if (!isLastDish) {
        // Advance straight to the next dish — no per-dish "done" interstitial
        // (founder-directed 2026-06-18: the celebration screen between dishes
        // was distracting; the single end-of-plate Win is the only payoff).
        nextDish();
      } else {
        // All dishes done  -  go to win screen
        if (sessionIdRef.current) {
          const result = completeSession(sessionIdRef.current, {});

          // Record skill tree progress for all dishes and capture results
          const allSkillEntries: SkillProgressEntry[] = [];
          const seenNodes = new Set<string>();
          for (const dish of dishes) {
            const skillNodes = getSkillNodesForDish(dish.slug);
            for (const nodeId of skillNodes) {
              if (seenNodes.has(nodeId)) continue;
              seenNodes.add(nodeId);
              const node = getSkillNode(nodeId);
              if (!node) continue;
              recordSkillCook(nodeId);
              const np = getNodeProgress(nodeId);
              allSkillEntries.push({
                nodeId,
                name: node.name,
                emoji: node.emoji,
                newCount: np.cooksCompleted + 1,
                required: node.cooksRequired,
                justCompleted: np.cooksCompleted + 1 >= node.cooksRequired,
              });
            }
          }

          setWinMeta({
            pathJustUnlocked: result.pathJustUnlocked,
            streak: result.newStreak,
            saved: false,
            skillProgress: allSkillEntries,
          });
          awardXP("cook_complete", XP_AWARDS.COOK_COMPLETE, result.newStreak);
          // Doge: a combined plate is ONE cook → one gold credit (a plate bonus
          // scales with dish count); each dish still grants its own food below.
          creditCookGold({
            sessionId: sessionIdRef.current,
            dishCount: orderedDishes.length,
            streak: result.newStreak,
          });
        }
        // One signal per cooked dish in this combined session.
        // Pull cuisine + flavor + ingredients from `orderedDishes`
        // — the cook-store `dishes` array carries only thin entries.
        const batchId = sessionIdRef.current ?? undefined;
        setAutoLogBatchId(batchId);
        for (const od of orderedDishes) {
          recordPreferenceSignal({
            kind: "cooked",
            facets: dishToFacets({
              cuisineFamily: od.dish.cuisineFamily,
              tags: od.dish.flavorProfile ?? [],
              ingredients: od.ingredients.map((i) => i.name),
            }),
          });
          // Auto-log each finished dish into the nutrition diary
          // (founder-directed, 2026-06-09). One serving per dish — the
          // combined cook has no per-dish serving slider. All dishes share the
          // session id as a batchId so the win-screen Undo removes them together
          // (else the sides orphan in the diary).
          diaryLogCook(od.dish.slug, od.dish.name, 1, {
            auto: true,
            batchId,
          });
          // Doge: each finished dish grants one feedable serving to the pet.
          grantDishToDoge(od.dish.slug);
        }
        // Note the plate's primary dish so the dog can share a fact about it.
        const lead = orderedDishes[0]?.dish;
        if (lead) noteCookForFact(lead.slug, lead.cuisineFamily ?? "");
        completeCookPhase();
      }
    } else {
      useCookStore.setState({
        currentStepIndex: currentStepIndex + 1,
        expandedChip: null,
      });
    }
  }, [
    currentStepIndex,
    currentCookSteps.length,
    currentDishIndex,
    dishes,
    nextDish,
    completeCookPhase,
    completeSession,
    recordSkillCook,
    getNodeProgress,
    awardXP,
    orderedDishes,
    recordPreferenceSignal,
  ]);

  const handleToggleChip = useCallback(
    (chip: string | null) => {
      toggleChip(chip as "timer" | "mistake" | "hack" | "fact" | null);
    },
    [toggleChip],
  );

  const handleStartTimer = useCallback(
    (seconds: number, label?: string) => {
      startTimer(seconds, label);
    },
    [startTimer],
  );

  const handleBackToday = useCallback(() => {
    reset();
    router.push("/today");
  }, [reset, router]);

  const handleBack = useCallback(() => {
    switch (currentPhase) {
      case "mission":
        handleBackToday();
        break;
      case "grab":
        setPhase("mission");
        break;
      case "cook":
        if (currentStepIndex > 0) {
          setStepDirection(-1);
          useCookStore.setState({
            currentStepIndex: currentStepIndex - 1,
            expandedChip: null,
          });
        } else if (currentDishIndex > 0) {
          // At the first step of a later dish  -  step back into the PREVIOUS
          // dish's last step (continuous Back), not all the way out to Grab.
          setStepDirection(-1);
          useCookStore.getState().prevDish();
        } else {
          // First step of first dish  -  go back to grab or mission
          if (allIngredients.length > 0) {
            setPhase("grab");
          } else {
            setPhase("mission");
          }
        }
        break;
      case "win":
        handleBackToday();
        break;
    }
  }, [
    currentPhase,
    currentStepIndex,
    currentDishIndex,
    handleBackToday,
    setPhase,
    allIngredients,
  ]);

  const handleCookAgain = useCallback(() => {
    sessionIdRef.current = null;
    initializedRef.current = false;
    reset();
    router.refresh();
  }, [reset, router]);

  // ── Win screen handlers ─────────────────────────

  const handleAddNote = useCallback(
    (note: string) => {
      if (sessionIdRef.current) {
        updateSession(sessionIdRef.current, { note });
        awardXP("add_note", XP_AWARDS.ADD_NOTE);
      }
    },
    [updateSession, awardXP],
  );

  const handleAddPhoto = useCallback(
    (photoUrl?: string) => {
      if (sessionIdRef.current) {
        updateSession(sessionIdRef.current, {
          photoUri: photoUrl ?? `photo-${Date.now()}-placeholder`,
        });
        awardXP("add_photo", XP_AWARDS.ADD_PHOTO);
      }
    },
    [updateSession, awardXP],
  );

  const handleFeedback = useCallback(
    (feedback: string) => {
      if (sessionIdRef.current) {
        updateSession(sessionIdRef.current, { feedback });
      }
    },
    [updateSession],
  );

  const handleRate = useCallback(
    (stars: number) => {
      if (sessionIdRef.current) {
        updateSession(sessionIdRef.current, { rating: stars });
        awardXP("rate_dish", XP_AWARDS.RATE_DISH);
      }
    },
    [updateSession, awardXP],
  );

  const handleSave = useCallback(() => {
    if (sessionIdRef.current) {
      updateSession(sessionIdRef.current, { favorite: true });
    }
    setWinMeta((prev) => ({ ...prev, saved: true }));
  }, [updateSession]);

  // ── Loading / error states ────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-[var(--nourish-green)]" />
      </div>
    );
  }

  if (error || !data || orderedDishes.length === 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 page-x text-center">
        <p className="text-[var(--nourish-subtext)]">
          {sideSlugs.length === 0
            ? "Missing side dishes in URL."
            : "No guided cook data found for this combination."}
        </p>
        <button
          onClick={handleBackToday}
          className="rounded-xl bg-[var(--nourish-green)] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--nourish-dark-green)] active:scale-95"
          type="button"
        >
          Back to Today
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────

  return (
    <motion.div
      data-big-hands={bigHands ? "true" : undefined}
      className="min-h-full bg-[var(--nourish-cream)]"
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
    >
      {/* Header with back button + phase indicator */}
      <header className="app-header page-x py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <motion.button
            onClick={currentPhase === "win" ? undefined : handleBack}
            aria-label="Go back"
            aria-disabled={currentPhase === "win"}
            whileTap={currentPhase !== "win" ? { scale: 0.88 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={cn(
              "flex items-center justify-center rounded-lg min-h-11 min-w-11 transition-colors",
              currentPhase === "win"
                ? "text-neutral-200 cursor-default"
                : "text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]",
            )}
            type="button"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex flex-col items-center">
            <PhaseIndicator currentPhase={currentPhase} />
            {currentPhase === "cook" &&
              cookMode === "combined" &&
              dishes.length > 1 && (
                <p className="text-[11px] text-[var(--nourish-subtext)] mt-0.5">
                  Dish {currentDishIndex + 1} of {dishes.length}
                </p>
              )}
          </div>
          <div className="w-8" /> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-md page-x py-6">
        <AnimatePresence mode="popLayout">
          {/* MISSION  -  Combined overview */}
          {currentPhase === "mission" && mainDish && (
            <CombinedMissionScreen
              key="mission"
              mainDishName={mainDish.name}
              mainDishDescription={mainDish.description ?? ""}
              mainDishHeroImage={mainDish.heroImageUrl ?? null}
              companionDishes={orderedDishes
                .filter((d) => d.dish.slug !== mainDish.slug)
                .map((d) => d.dish.name)}
              flavorProfile={allFlavorProfiles}
              prepTimeMinutes={totalPrepTime}
              cookTimeMinutes={totalCookTime}
              sequencerEstimate={data.totalEstimatedMinutes}
              hasIngredients={allIngredients.length > 0}
              onStart={handleMissionStart}
            />
          )}

          {/* GRAB  -  One combined watchlist + segmented ingredient list. */}
          {currentPhase === "grab" && (
            <div className="space-y-2">
              <CombinedCookWatchlist
                groups={orderedDishes.map((d) => ({
                  dishName: d.dish.name,
                  dishSlug: d.dish.slug,
                  steps: d.steps,
                }))}
              />
              {/* Scale the whole plate — one servings control drives every
                  dish's amounts below (the missing combined-cook ability). */}
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <ServingSlider
                  servings={servings}
                  baseServings={baseServings}
                  onChange={setServingsOverride}
                />
              </div>
              <IngredientList
                key="grab"
                ingredients={allIngredients}
                sections={ingredientSections}
                prepDishes={prepDishes}
                recipeName={mainDish?.name ?? ""}
                cuisineFamily={mainDish?.cuisineFamily ?? ""}
                dishSlug={mainDish?.slug}
                onReady={handleGrabReady}
              />
            </div>
          )}

          {/* COOK  -  Empty steps guard */}
          {currentPhase === "cook" && !currentCookStep && currentDish && (
            <motion.div
              key="cook-empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-5 py-12 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--nourish-green)]/10">
                <ChefHat
                  size={24}
                  className="text-[var(--nourish-green)]"
                  strokeWidth={1.8}
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-[var(--nourish-dark)]">
                  Steps coming soon
                </p>
                <p className="text-xs text-[var(--nourish-subtext)] max-w-[240px]">
                  Guided cook steps for {currentDish.dish.name} aren&apos;t
                  available yet.
                </p>
              </div>
              <button
                onClick={handleBackToday}
                className="rounded-xl bg-[var(--nourish-green)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--nourish-dark-green)] active:scale-95"
                type="button"
              >
                Back to Today
              </button>
            </motion.div>
          )}

          {/* COOK  -  Step-by-step, one dish at a time */}
          {currentPhase === "cook" && currentCookStep && currentDish && (
            <motion.div
              key={`cook-${currentDishIndex}-${currentStepIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
            >
              {/* Timer stack  -  parallel-lane pills for every running
                    timer. Hidden when nothing is running. */}
              <TimerStack />

              {/* W29 dual-track step-progress strip — only renders
                    when there are 2+ dishes. Replaces the standalone
                    "current dish label" row by including the active
                    name (highlighted) plus every other dish's
                    progress. */}
              <DishProgressStrip
                dishes={dishProgressInputs}
                activeDishIndex={currentDishIndex}
                activeStepIndex={currentStepIndex}
                className="mb-3"
              />

              {/* Parallel cooking hint from sequencer */}
              <ParallelHintBanner hint={currentParallelHint} />
              <StepCard
                stepNumber={currentStepIndex + 1}
                totalSteps={currentCookSteps.length}
                instruction={currentCookStep.instruction}
                recipeName={currentDish.dish.name}
                previousStep={
                  currentCookSteps[currentStepIndex - 1]?.instruction
                }
                nextStep={currentCookSteps[currentStepIndex + 1]?.instruction}
                ingredients={currentDish.ingredients.map(
                  (i: { name: string }) => i.name,
                )}
                timerSeconds={currentCookStep.timerSeconds}
                mistakeWarning={currentCookStep.mistakeWarning}
                quickHack={currentCookStep.quickHack}
                cuisineFact={currentCookStep.cuisineFact}
                donenessCue={currentCookStep.donenessCue}
                imageUrl={currentCookStep.imageUrl}
                expandedChip={expandedChip}
                onToggleChip={handleToggleChip}
                onStartTimer={handleStartTimer}
                onNext={handleNext}
                onPrev={handleBack}
                isFirst={currentStepIndex === 0 && currentDishIndex === 0}
                isLast={
                  currentStepIndex === currentCookSteps.length - 1 &&
                  currentDishIndex === dishes.length - 1
                }
                dishSlug={currentDish.dish.slug}
                direction={stepDirection}
              />
            </motion.div>
          )}

          {/* WIN  -  Celebrate the full plate */}
          {currentPhase === "win" && (
            <WinScreen
              key="win"
              dishName={
                orderedDishes.length > 1
                  ? `${orderedDishes.map((d) => d.dish.name).join(" + ")}`
                  : (orderedDishes[0]?.dish.name ?? "")
              }
              dishSlug={mainDish?.slug ?? orderedDishes[0]?.dish.slug}
              autoLogBatchId={autoLogBatchId}
              sideDishes={orderedDishes.map((d) => d.dish.name)}
              cuisineFamily={mainDish?.cuisineFamily ?? ""}
              isFirstCook={winMeta.streak === 1}
              streak={winMeta.streak}
              totalSteps={orderedDishes.reduce(
                (sum, d) =>
                  sum + d.steps.filter((s) => s.phase === "cook").length,
                0,
              )}
              pathJustUnlocked={winMeta.pathJustUnlocked}
              saved={winMeta.saved}
              skillProgress={winMeta.skillProgress}
              onRate={handleRate}
              onFeedback={handleFeedback}
              onAddPhoto={handleAddPhoto}
              onAddNote={handleAddNote}
              onSave={handleSave}
              onCookAgain={handleCookAgain}
              onBackToday={handleBackToday}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Floating timer */}
      <CookTimer />
    </motion.div>
  );
}

// ── Combined Mission Screen ─────────────────────────

function CombinedMissionScreen({
  mainDishName,
  mainDishDescription,
  mainDishHeroImage,
  companionDishes,
  flavorProfile,
  prepTimeMinutes,
  cookTimeMinutes,
  sequencerEstimate,
  hasIngredients,
  onStart,
}: {
  mainDishName: string;
  mainDishDescription: string;
  mainDishHeroImage: string | null;
  companionDishes: string[];
  flavorProfile: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  sequencerEstimate?: number;
  hasIngredients: boolean;
  onStart: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const totalTime = prepTimeMinutes + cookTimeMinutes;
  const displayTime =
    sequencerEstimate && sequencerEstimate < totalTime
      ? sequencerEstimate
      : totalTime;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5 min-h-[calc(100dvh-160px)]"
    >
      {/* Hero image  -  gradient+emoji fallback when no image */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 25 }
        }
        className="relative aspect-[4/3] overflow-hidden rounded-xl"
      >
        {mainDishHeroImage ? (
          <Image
            src={mainDishHeroImage}
            alt={mainDishName}
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{
              background:
                "linear-gradient(135deg, #2d5a3d 0%, #4a8c5c 40%, #a8d8b9 100%)",
            }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20">
              <UtensilsCrossed
                size={32}
                className="text-white"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-sm font-semibold text-white/90 text-center px-6 leading-tight">
              {mainDishName}
            </span>
          </div>
        )}
      </motion.div>

      {/* Dish name + companion info */}
      <div className="space-y-3">
        <motion.h1
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 260, damping: 25, delay: 0.1 }
          }
          className="font-serif text-2xl text-[var(--nourish-dark)]"
        >
          {mainDishName}
        </motion.h1>

        {/* Companion dishes */}
        {companionDishes.length > 0 && (
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 260, damping: 25, delay: 0.15 }
            }
            className="text-sm text-[var(--nourish-subtext)]"
          >
            Cooking with:{" "}
            <span className="font-medium text-[var(--nourish-dark)]">
              {companionDishes.join(", ")}
            </span>
          </motion.p>
        )}

        {/* Flavor badges (capped at 3 + overflow — a combined cook unions
            every dish's flavors, so this row would otherwise crowd the CTA)
            + total time. Quieter outline-on-tint pills. */}
        <div className="flex flex-wrap items-center gap-1.5">
          {flavorProfile.slice(0, 3).map((flavor, idx) => (
            <motion.span
              key={flavor}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.2 + idx * 0.05,
                    }
              }
              className="rounded-full border border-[var(--nourish-green)]/20 bg-[var(--nourish-green)]/[0.06] px-2 py-0.5 text-[11px] font-medium text-[var(--nourish-subtext)] capitalize"
            >
              {flavor}
            </motion.span>
          ))}
          {flavorProfile.length > 3 && (
            <span className="px-0.5 text-[11px] font-medium tabular-nums text-[var(--nourish-subtext)]/70">
              +{flavorProfile.length - 3}
            </span>
          )}
          <motion.span
            initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.2 + Math.min(flavorProfile.length, 3) * 0.05,
                  }
            }
            className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-[var(--nourish-subtext)]"
          >
            {displayTime} min
            {sequencerEstimate && sequencerEstimate < totalTime
              ? " (parallel)"
              : " total"}
          </motion.span>
          <motion.span
            initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.25 + Math.min(flavorProfile.length, 3) * 0.05,
                  }
            }
            className="rounded-full bg-[var(--nourish-gold)]/15 px-2 py-0.5 text-[11px] font-medium text-[var(--nourish-gold)]"
          >
            {companionDishes.length + 1} dishes
          </motion.span>
        </div>
      </div>

      {/* Description */}
      <motion.p
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 25, delay: 0.25 }
        }
        className="text-sm text-[var(--nourish-subtext)] leading-relaxed"
      >
        {mainDishDescription}
      </motion.p>

      {/* Primary action stays ahead of optional controls on short phones. */}
      <motion.button
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 25, delay: 0.3 }
        }
        whileTap={reducedMotion ? undefined : { scale: 0.96 }}
        onClick={onStart}
        className={cn(
          "w-full rounded-xl py-3.5 text-sm font-semibold text-white",
          "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
          "transition-colors duration-200",
        )}
        type="button"
      >
        {hasIngredients ? "Let\u2019s gather" : "Let\u2019s cook"}
      </motion.button>

      {/* Plan-my-cook  -  uses sequencer-adjusted time when available so the
          computed start reflects parallelization savings. */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 25, delay: 0.28 }
        }
      >
        <PlanCookChip totalMinutes={displayTime} />
      </motion.div>

      {/* Big-hands  -  session-scoped opt-in for the rest of this cook */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 25, delay: 0.3 }
        }
      >
        <BigHandsToggle />
      </motion.div>
    </motion.div>
  );
}
