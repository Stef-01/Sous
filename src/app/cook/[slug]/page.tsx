"use client";

import { use, useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChefHat } from "lucide-react";
import { PhaseIndicator } from "@/components/guided-cook/phase-indicator";
import { MissionScreen } from "@/components/guided-cook/mission-screen";
import { IngredientList } from "@/components/guided-cook/ingredient-list";
import { StepCard } from "@/components/guided-cook/step-card";
import { WinScreen } from "@/components/guided-cook/win-screen";
import { CookTimer } from "@/components/guided-cook/cook-timer";
import { useCookStore } from "@/lib/hooks/use-cook-store";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { useSkillProgress } from "@/lib/hooks/use-skill-progress";
import { useXPSystem, XP_AWARDS } from "@/lib/hooks/use-xp-system";
import { LevelUpToast } from "@/components/shared/level-up-toast";
import {
  getStaticCookData,
  getStaticMealCookData,
} from "@/data/guided-cook-steps";
import { getSkillNodesForDish, getSkillNode } from "@/data/skill-tree";
import type { SkillProgressEntry } from "@/components/guided-cook/win-screen";
import { cn } from "@/lib/utils/cn";
import { trpc } from "@/lib/trpc/client";

export default function GuidedCookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Main dish context passed from the Today page (e.g. "Chicken Tikka Masala")
  const mainDishInput = searchParams.get("main") ?? undefined;

  // Session tracking
  const { startSession, completeSession, updateSession } = useCookSessions();
  const { recordSkillCook, getNodeProgress } = useSkillProgress();
  const {
    awardXP,
    levelUpPending,
    dismissLevelUp,
    title: levelTitle,
  } = useXPSystem();
  const sessionIdRef = useRef<string | null>(null);
  // Guard against rapid double-tap on the "Next step" button
  const isAdvancingRef = useRef(false);
  const [winMeta, setWinMeta] = useState<{
    pathJustUnlocked: boolean;
    streak: number;
    saved: boolean;
    skillProgress: SkillProgressEntry[];
  }>({ pathJustUnlocked: false, streak: 0, saved: false, skillProgress: [] });
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);

  // Cook store
  const {
    currentPhase,
    currentStepIndex,
    expandedChip,
    setPhase,
    setTotalSteps,
    toggleChip,
    startTimer,
    completeSession: completeCookPhase,
    reset,
  } = useCookStore();

  // Reset store on mount to ensure clean state (handles direct navigation from combined cook)
  useEffect(() => {
    reset();
  }, [reset]);

  // Fetch steps from tRPC
  const { data, isLoading, error } = trpc.cook.getSteps.useQuery(
    { sideDishSlug: slug },
    { enabled: !!slug },
  );

  // Cuisine family for this dish (side or meal)
  const cuisine = useMemo(() => {
    const staticData = getStaticCookData(slug) ?? getStaticMealCookData(slug);
    return staticData?.cuisineFamily ?? "unknown";
  }, [slug]);

  // Start session on mount (once data is available)
  useEffect(() => {
    if (data?.dish && !sessionIdRef.current) {
      sessionIdRef.current = startSession(
        slug,
        data.dish.name,
        cuisine,
        mainDishInput,
      );
    }
  }, [data?.dish, slug, cuisine, mainDishInput, startSession]);

  // Filter steps by phase
  const cookSteps = useMemo(
    () =>
      data?.steps?.filter((s: { phase: string }) => s.phase === "cook") ?? [],
    [data?.steps],
  );

  const currentCookStep = cookSteps[currentStepIndex];

  // ── Handlers ──────────────────────────────────────

  const handleMissionStart = useCallback(() => {
    if (data?.ingredients && data.ingredients.length > 0) {
      setPhase("grab");
    } else {
      setTotalSteps(cookSteps.length);
      setPhase("cook");
    }
  }, [data, setPhase, setTotalSteps, cookSteps.length]);

  const handleGrabReady = useCallback(() => {
    setTotalSteps(cookSteps.length);
    setPhase("cook");
  }, [setPhase, setTotalSteps, cookSteps.length]);

  const handleNext = useCallback(() => {
    // Guard against rapid double-tap
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;
    setTimeout(() => {
      isAdvancingRef.current = false;
    }, 400);

    setStepDirection(1);
    if (currentStepIndex >= cookSteps.length - 1) {
      // Last cook step — complete session, record skill progress, and go to win
      if (sessionIdRef.current) {
        const result = completeSession(sessionIdRef.current, {});

        // Record skill tree progress and capture results for win screen
        const skillNodes = getSkillNodesForDish(slug);
        const skillEntries: SkillProgressEntry[] = [];
        for (const nodeId of skillNodes) {
          const node = getSkillNode(nodeId);
          if (!node) continue;
          recordSkillCook(nodeId);
          const np = getNodeProgress(nodeId);
          skillEntries.push({
            nodeId,
            name: node.name,
            emoji: node.emoji,
            newCount: np.cooksCompleted + 1, // +1 because recordSkillCook just incremented
            required: node.cooksRequired,
            justCompleted: np.cooksCompleted + 1 >= node.cooksRequired,
          });
        }

        setWinMeta({
          pathJustUnlocked: result.pathJustUnlocked,
          streak: result.newStreak,
          saved: false,
          skillProgress: skillEntries,
        });
        awardXP("cook_complete", XP_AWARDS.COOK_COMPLETE, result.newStreak);
      }
      completeCookPhase();
    } else {
      useCookStore.setState({
        currentStepIndex: currentStepIndex + 1,
        expandedChip: null,
      });
    }
  }, [
    currentStepIndex,
    cookSteps.length,
    completeCookPhase,
    completeSession,
    slug,
    recordSkillCook,
    getNodeProgress,
    awardXP,
  ]);

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
        } else {
          // First cook step — go back to grab (or mission if no ingredients)
          if (data?.ingredients && data.ingredients.length > 0) {
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
  }, [currentPhase, currentStepIndex, handleBackToday, setPhase, data]);

  const handleSelectSides = useCallback(() => {
    if (!data?.dish) return;
    reset();
    router.push(`/today?selectSides=${encodeURIComponent(data.dish.name)}`);
  }, [data, reset, router]);

  const handleCookAgain = useCallback(() => {
    sessionIdRef.current = null;
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

  const handleAddPhoto = useCallback(() => {
    if (sessionIdRef.current) {
      updateSession(sessionIdRef.current, {
        photoUri: `photo-${Date.now()}-placeholder`,
      });
      awardXP("add_photo", XP_AWARDS.ADD_PHOTO);
    }
  }, [updateSession, awardXP]);

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
      <div className="min-h-full bg-[var(--nourish-cream)]">
        {/* Header skeleton */}
        <div className="app-header px-4 py-3">
          <div className="mx-auto flex max-w-md items-center justify-between animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-neutral-200" />
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-2 w-10 rounded-full bg-neutral-200" />
              ))}
            </div>
            <div className="w-8" />
          </div>
        </div>
        {/* Content skeleton */}
        <div className="mx-auto max-w-md px-4 py-6 space-y-4 animate-pulse">
          <div className="h-48 w-full rounded-2xl bg-neutral-200" />
          <div className="space-y-2">
            <div className="h-7 w-48 rounded bg-neutral-200" />
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-3/4 rounded bg-neutral-200" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-6 w-20 rounded-full bg-neutral-200" />
            ))}
          </div>
          <div className="h-12 w-full rounded-xl bg-neutral-200" />
        </div>
      </div>
    );
  }

  if (error || !data?.dish) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-5 px-6 text-center bg-[var(--nourish-cream)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--nourish-green)]/10">
          <ChefHat
            size={24}
            className="text-[var(--nourish-green)]"
            strokeWidth={1.8}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-[var(--nourish-dark)]">
            {data?.dish === null
              ? "Cook steps coming soon"
              : "Couldn\u2019t load the recipe"}
          </p>
          <p className="text-xs text-[var(--nourish-subtext)] max-w-[240px]">
            {data?.dish === null
              ? "This dish doesn\u2019t have a guided cook flow yet. Try another from the Today page."
              : "Something went wrong. Check your connection and try again."}
          </p>
        </div>
        <button
          onClick={handleBackToday}
          className="rounded-xl bg-[var(--nourish-green)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--nourish-dark-green)] active:scale-95"
          type="button"
        >
          Back to Today
        </button>
      </div>
    );
  }

  const { dish, ingredients } = data;

  // ── Render ────────────────────────────────────────

  return (
    <motion.div
      className="min-h-full bg-[var(--nourish-cream)]"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Header with back button + phase indicator */}
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <motion.button
            onClick={currentPhase === "win" ? undefined : handleBack}
            whileTap={currentPhase !== "win" ? { scale: 0.88 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={cn(
              "flex items-center justify-center rounded-lg min-h-11 min-w-11 transition-colors",
              currentPhase === "win"
                ? "text-neutral-200 cursor-default"
                : "text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]",
            )}
            type="button"
            aria-label="Go back"
            aria-disabled={currentPhase === "win"}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <PhaseIndicator currentPhase={currentPhase} />
          <div className="w-8" /> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-md px-4 py-6">
        <AnimatePresence mode="popLayout">
          {currentPhase === "mission" && (
            <MissionScreen
              key="mission"
              dishName={dish.name}
              description={dish.description}
              flavorProfile={dish.flavorProfile as string[]}
              prepTimeMinutes={dish.prepTimeMinutes}
              cookTimeMinutes={dish.cookTimeMinutes}
              heroImageUrl={dish.heroImageUrl}
              hasIngredients={ingredients.length > 0}
              onStart={handleMissionStart}
            />
          )}

          {currentPhase === "grab" && (
            <IngredientList
              key="grab"
              ingredients={ingredients}
              recipeName={dish.name}
              cuisineFamily={cuisine}
              onReady={handleGrabReady}
              onSelectSides={handleSelectSides}
            />
          )}

          {currentPhase === "cook" && !currentCookStep && (
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
                  Guided cook steps for this dish aren&apos;t available yet. Try
                  another dish from the Today page.
                </p>
              </div>
              <button
                onClick={handleBackToday}
                className="rounded-xl bg-[var(--nourish-green)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--nourish-dark-green)] active:scale-95"
                type="button"
              >
                Back to Today
              </button>
            </motion.div>
          )}

          {currentPhase === "cook" && currentCookStep && (
            <StepCard
              key={`cook-${currentStepIndex}`}
              direction={stepDirection}
              stepNumber={currentStepIndex + 1}
              totalSteps={cookSteps.length}
              instruction={currentCookStep.instruction}
              recipeName={dish.name}
              previousStep={cookSteps[currentStepIndex - 1]?.instruction}
              nextStep={cookSteps[currentStepIndex + 1]?.instruction}
              ingredients={ingredients.map((i: { name: string }) => i.name)}
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
              isFirst={currentStepIndex === 0}
              isLast={currentStepIndex === cookSteps.length - 1}
            />
          )}

          {currentPhase === "win" && (
            <WinScreen
              key="win"
              dishName={dish.name}
              sideDishes={mainDishInput ? [mainDishInput] : []}
              cuisineFamily={cuisine}
              isFirstCook={winMeta.streak === 1}
              streak={winMeta.streak}
              totalSteps={cookSteps.length}
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
      <LevelUpToast
        level={levelUpPending}
        title={levelTitle}
        onDismiss={dismissLevelUp}
      />
    </motion.div>
  );
}
