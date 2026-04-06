"use client";

import { use, useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PhaseIndicator } from "@/components/guided-cook/phase-indicator";
import { MissionScreen } from "@/components/guided-cook/mission-screen";
import { IngredientList } from "@/components/guided-cook/ingredient-list";
import { StepCard } from "@/components/guided-cook/step-card";
import { WinScreen } from "@/components/guided-cook/win-screen";
import { CookTimer } from "@/components/guided-cook/cook-timer";
import { useCookStore } from "@/lib/hooks/use-cook-store";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { useSkillProgress } from "@/lib/hooks/use-skill-progress";
import { getStaticCookData } from "@/data/guided-cook-steps";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch steps from tRPC
  const { data, isLoading, error } = trpc.cook.getSteps.useQuery(
    { sideDishSlug: slug },
    { enabled: !!slug }
  );

  // Cuisine family for this side dish
  const cuisine = useMemo(() => {
    const staticData = getStaticCookData(slug);
    return staticData?.cuisineFamily ?? "unknown";
  }, [slug]);

  // Start session on mount (once data is available)
  useEffect(() => {
    if (data?.dish && !sessionIdRef.current) {
      sessionIdRef.current = startSession(
        slug,
        data.dish.name,
        cuisine
      );
    }
  }, [data?.dish, slug, cuisine, startSession]);

  // Filter steps by phase
  const cookSteps = useMemo(
    () => data?.steps?.filter((s: { phase: string }) => s.phase === "cook") ?? [],
    [data?.steps]
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
  }, [data?.ingredients, setPhase, setTotalSteps, cookSteps.length]);

  const handleGrabReady = useCallback(() => {
    setTotalSteps(cookSteps.length);
    setPhase("cook");
  }, [setPhase, setTotalSteps, cookSteps.length]);

  const handleNext = useCallback(() => {
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
      }
      completeCookPhase();
    } else {
      useCookStore.setState({
        currentStepIndex: currentStepIndex + 1,
        expandedChip: null,
      });
    }
  }, [currentStepIndex, cookSteps.length, completeCookPhase, completeSession, slug, recordSkillCook, getNodeProgress]);

  const handleToggleChip = useCallback(
    (chip: string | null) => {
      toggleChip(chip as "timer" | "mistake" | "hack" | "fact" | null);
    },
    [toggleChip]
  );

  const handleStartTimer = useCallback(
    (seconds: number) => {
      startTimer(seconds);
    },
    [startTimer]
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
        if (currentStepIndex > 0) {
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
  }, [currentPhase, currentStepIndex, handleBackToday, setPhase, data?.ingredients]);

  const handleSelectSides = useCallback(() => {
    if (!data?.dish) return;
    reset();
    router.push(`/?selectSides=${encodeURIComponent(data.dish.name)}`);
  }, [data?.dish, reset, router]);

  const handleCookAgain = useCallback(() => {
    sessionIdRef.current = null;
    reset();
    router.refresh();
  }, [reset, router]);

  // ── Win screen handlers ─────────────────────────

  const handleRate = useCallback(
    (rating: number) => {
      if (sessionIdRef.current) {
        updateSession(sessionIdRef.current, { rating });
      }
    },
    [updateSession]
  );

  const handleAddNote = useCallback(
    (note: string) => {
      if (sessionIdRef.current) {
        updateSession(sessionIdRef.current, { note });
      }
    },
    [updateSession]
  );

  const handleAddPhoto = useCallback(() => {
    // Photo capture — in V1, placeholder until camera component is integrated
    if (sessionIdRef.current) {
      updateSession(sessionIdRef.current, {
        photoUri: `photo-${Date.now()}-placeholder`,
      });
    }
  }, [updateSession]);

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

  if (error || !data?.dish) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-[var(--nourish-subtext)]">
          {data?.dish === null
            ? "This recipe doesn't have guided cook steps yet."
            : "Something went wrong loading the recipe."}
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

  const { dish, ingredients } = data;

  // ── Render ────────────────────────────────────────

  return (
    <div className="min-h-full bg-[var(--nourish-cream)]">
      {/* Header with back button + phase indicator */}
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button
            onClick={currentPhase === "win" ? undefined : handleBack}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              currentPhase === "win"
                ? "text-neutral-200 cursor-default"
                : "text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]"
            )}
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
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

          {currentPhase === "cook" && currentCookStep && (
            <StepCard
              key={`cook-${currentStepIndex}`}
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
              sideDishes={[dish.name]}
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
    </div>
  );
}
