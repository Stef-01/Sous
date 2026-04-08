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
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChefHat, ChevronRight } from "lucide-react";
import { PhaseIndicator } from "@/components/guided-cook/phase-indicator";
import { IngredientList } from "@/components/guided-cook/ingredient-list";
import type { IngredientSection } from "@/components/guided-cook/ingredient-list";
import { StepCard } from "@/components/guided-cook/step-card";
import { WinScreen } from "@/components/guided-cook/win-screen";
import { CookTimer } from "@/components/guided-cook/cook-timer";
import { useCookStore } from "@/lib/hooks/use-cook-store";
import type { CookDishEntry } from "@/lib/hooks/use-cook-store";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { useSkillProgress } from "@/lib/hooks/use-skill-progress";
import { getSkillNodesForDish, getSkillNode } from "@/data/skill-tree";
import type { SkillProgressEntry } from "@/components/guided-cook/win-screen";
import { cn } from "@/lib/utils/cn";
import { trpc } from "@/lib/trpc/client";

/**
 * Combined Cook Page — guides the user through cooking a main dish + 1-3 sides
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

  const mainSlug = searchParams.get("main") ?? "";
  const sidesParam = searchParams.get("sides") ?? "";
  const sideSlugs = useMemo(
    () => sidesParam.split(",").filter(Boolean),
    [sidesParam],
  );

  // Session tracking
  const { startSession, completeSession, updateSession } = useCookSessions();
  const { recordSkillCook, getNodeProgress } = useSkillProgress();
  const sessionIdRef = useRef<string | null>(null);
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

  // Transition state between dishes
  const [showTransition, setShowTransition] = useState(false);
  const [completedDishName, setCompletedDishName] = useState("");

  // Fetch combined data
  const { data, isLoading, error } = trpc.cook.getCombinedSteps.useQuery(
    { mainDishSlug: mainSlug, sideSlugs },
    { enabled: !!mainSlug && sideSlugs.length > 0 },
  );

  // Build ordered dish data based on cookOrder
  const orderedDishes = useMemo(() => {
    if (!data) return [];
    const lookup = new Map<string, typeof data.main>();
    if (data.main) lookup.set(data.main.dish.slug, data.main);
    data.sides.forEach((s) => lookup.set(s.dish.slug, s));
    return data.cookOrder
      .map((slug) => lookup.get(slug))
      .filter((d): d is NonNullable<typeof d> => d !== null && d !== undefined);
  }, [data]);

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
      // Cleanup on unmount — reset for next page
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      // Start a local session for tracking
      if (!sessionIdRef.current) {
        const firstDish = orderedDishes[0];
        sessionIdRef.current = startSession(
          firstDish.dish.slug,
          `${orderedDishes.map((d) => d.dish.name).join(" + ")}`,
          firstDish.dish.cuisineFamily,
        );
      }
    }
  }, [data, orderedDishes, startCombinedSession, startSession]);

  // Build segmented ingredient sections for the Grab phase
  const ingredientSections = useMemo<IngredientSection[]>(() => {
    if (!orderedDishes.length) return [];
    return orderedDishes.map((d) => ({
      label: `For ${d.dish.name}`,
      ingredients: d.ingredients,
    }));
  }, [orderedDishes]);

  // Flat ingredients for backward-compat (used by step card)
  const allIngredients = useMemo(
    () => orderedDishes.flatMap((d) => d.ingredients),
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
    if (currentStepIndex >= currentCookSteps.length - 1) {
      // Completed the current dish's cook steps
      const justCompletedName = currentDish?.dish.name ?? "";
      const isLastDish = currentDishIndex >= dishes.length - 1;

      if (!isLastDish) {
        // Show transition card BEFORE advancing dish (defer nextDish to continue handler)
        setCompletedDishName(justCompletedName);
        setShowTransition(true);
      } else {
        // All dishes done — go to win screen
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
        }
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
    currentDish,
    completeCookPhase,
    completeSession,
    recordSkillCook,
    getNodeProgress,
  ]);

  const handleTransitionContinue = useCallback(() => {
    nextDish(); // Advance to the next dish in the store
    setShowTransition(false);
  }, [nextDish]);

  const handleToggleChip = useCallback(
    (chip: string | null) => {
      toggleChip(chip as "timer" | "mistake" | "hack" | "fact" | null);
    },
    [toggleChip],
  );

  const handleStartTimer = useCallback(
    (seconds: number) => {
      startTimer(seconds);
    },
    [startTimer],
  );

  const handleBackToday = useCallback(() => {
    reset();
    router.push("/");
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
        if (showTransition) {
          setShowTransition(false);
          return;
        }
        if (currentStepIndex > 0) {
          useCookStore.setState({
            currentStepIndex: currentStepIndex - 1,
            expandedChip: null,
          });
        } else if (currentDishIndex > 0) {
          // At first step of a subsequent dish — can't go back to previous dish easily
          // Go back to grab instead
          setPhase("grab");
        } else {
          // First step of first dish — go back to grab or mission
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
    showTransition,
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
      }
    },
    [updateSession],
  );

  const handleAddPhoto = useCallback(() => {
    if (sessionIdRef.current) {
      updateSession(sessionIdRef.current, {
        photoUri: `photo-${Date.now()}-placeholder`,
      });
    }
  }, [updateSession]);

  const handleRate = useCallback(
    (stars: number) => {
      if (sessionIdRef.current) {
        updateSession(sessionIdRef.current, { rating: stars });
      }
    },
    [updateSession],
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
      <div className="min-h-full flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-[var(--nourish-subtext)]">
          {!mainSlug || sideSlugs.length === 0
            ? "Missing main dish or sides in URL."
            : "No guided cook data found for this combination."}
        </p>
        <button
          onClick={handleBackToday}
          className="rounded-xl bg-[var(--nourish-green)] px-6 py-2.5 text-sm font-medium text-white"
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
      className="min-h-full bg-[var(--nourish-cream)]"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Header with back button + phase indicator */}
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <motion.button
            onClick={currentPhase === "win" ? undefined : handleBack}
            aria-label="Go back"
            aria-disabled={currentPhase === "win"}
            whileTap={currentPhase !== "win" ? { scale: 0.88 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
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
                <p className="text-[10px] text-[var(--nourish-subtext)] mt-0.5">
                  Dish {currentDishIndex + 1} of {dishes.length}
                </p>
              )}
          </div>
          <div className="w-8" /> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-md px-4 py-6">
        <AnimatePresence mode="popLayout">
          {/* MISSION — Combined overview */}
          {currentPhase === "mission" && mainDish && (
            <CombinedMissionScreen
              key="mission"
              mainDishName={mainDish.name}
              mainDishDescription={mainDish.description}
              mainDishHeroImage={mainDish.heroImageUrl}
              companionDishes={orderedDishes
                .filter((d) => d.dish.slug !== mainDish.slug)
                .map((d) => d.dish.name)}
              flavorProfile={allFlavorProfiles}
              prepTimeMinutes={totalPrepTime}
              cookTimeMinutes={totalCookTime}
              hasIngredients={allIngredients.length > 0}
              onStart={handleMissionStart}
            />
          )}

          {/* GRAB — Segmented ingredient list */}
          {currentPhase === "grab" && (
            <IngredientList
              key="grab"
              ingredients={allIngredients}
              sections={ingredientSections}
              recipeName={mainDish?.name ?? ""}
              cuisineFamily={mainDish?.cuisineFamily ?? ""}
              onReady={handleGrabReady}
            />
          )}

          {/* COOK — Step-by-step, one dish at a time */}
          {currentPhase === "cook" &&
            !showTransition &&
            currentCookStep &&
            currentDish && (
              <motion.div
                key={`cook-${currentDishIndex}-${currentStepIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
              >
                {/* Current dish label */}
                {dishes.length > 1 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                    className="text-xs font-medium text-[var(--nourish-green)] mb-3"
                  >
                    {currentDish.dish.name}
                  </motion.p>
                )}
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
                />
              </motion.div>
            )}

          {/* TRANSITION — Between dishes */}
          {currentPhase === "cook" && showTransition && (
            <DishTransitionCard
              key="transition"
              completedDishName={completedDishName}
              nextDishName={currentDish?.dish.name ?? ""}
              currentDishNumber={currentDishIndex + 1}
              totalDishes={dishes.length}
              onContinue={handleTransitionContinue}
            />
          )}

          {/* WIN — Celebrate the full plate */}
          {currentPhase === "win" && (
            <WinScreen
              key="win"
              dishName={
                orderedDishes.length > 1
                  ? `${orderedDishes.map((d) => d.dish.name).join(" + ")}`
                  : (orderedDishes[0]?.dish.name ?? "")
              }
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
  hasIngredients: boolean;
  onStart: () => void;
}) {
  const totalTime = prepTimeMinutes + cookTimeMinutes;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5"
    >
      {/* Hero image */}
      {mainDishHeroImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="relative aspect-[4/3] overflow-hidden rounded-2xl"
        >
          <Image
            src={mainDishHeroImage}
            alt={mainDishName}
            width={480}
            height={360}
            unoptimized
            className="w-full aspect-[4/3] object-cover"
          />
        </motion.div>
      )}

      {/* Dish name + companion info */}
      <div className="space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 25,
            delay: 0.1,
          }}
          className="font-serif text-2xl text-[var(--nourish-dark)]"
        >
          {mainDishName}
        </motion.h1>

        {/* Companion dishes */}
        {companionDishes.length > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 25,
              delay: 0.15,
            }}
            className="text-sm text-[var(--nourish-subtext)]"
          >
            Cooking with:{" "}
            <span className="font-medium text-[var(--nourish-dark)]">
              {companionDishes.join(", ")}
            </span>
          </motion.p>
        )}

        {/* Flavor badges + total time */}
        <div className="flex flex-wrap gap-2">
          {flavorProfile.map((flavor, idx) => (
            <motion.span
              key={flavor}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.2 + idx * 0.05,
              }}
              className="rounded-full bg-[var(--nourish-green)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--nourish-green)] capitalize"
            >
              {flavor}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.2 + flavorProfile.length * 0.05,
            }}
            className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-[var(--nourish-subtext)]"
          >
            {totalTime} min total
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.25 + flavorProfile.length * 0.05,
            }}
            className="rounded-full bg-[var(--nourish-gold)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--nourish-gold)]"
          >
            {companionDishes.length + 1} dishes
          </motion.span>
        </div>
      </div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 25,
          delay: 0.25,
        }}
        className="text-sm text-[var(--nourish-subtext)] leading-relaxed"
      >
        {mainDishDescription}
      </motion.p>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.3 }}
        whileTap={{ scale: 0.96 }}
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
    </motion.div>
  );
}

// ── Dish Transition Card ─────────────────────────

function DishTransitionCard({
  completedDishName,
  nextDishName,
  currentDishNumber,
  totalDishes,
  onContinue,
}: {
  completedDishName: string;
  nextDishName: string;
  currentDishNumber: number;
  totalDishes: number;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="flex flex-col items-center gap-6 py-8 text-center"
    >
      {/* Completed check */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--nourish-green)]/10"
      >
        <ChefHat size={28} className="text-[var(--nourish-green)]" />
      </motion.div>

      <div className="space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 25,
            delay: 0.15,
          }}
          className="font-serif text-xl text-[var(--nourish-dark)]"
        >
          {completedDishName} done!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 25,
            delay: 0.2,
          }}
          className="text-sm text-[var(--nourish-subtext)]"
        >
          Up next · dish {currentDishNumber} of {totalDishes}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 25,
            delay: 0.25,
          }}
          className="font-serif text-lg font-medium text-[var(--nourish-dark)]"
        >
          {nextDishName}
        </motion.p>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.3 }}
        whileTap={{ scale: 0.96 }}
        onClick={onContinue}
        className={cn(
          "flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white",
          "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
          "transition-colors duration-200",
        )}
        type="button"
      >
        Continue cooking
        <ChevronRight size={16} />
      </motion.button>
    </motion.div>
  );
}
