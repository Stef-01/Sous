"use client";

import { use, useCallback, useMemo } from "react";
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
import { trpc } from "@/lib/trpc/client";

type Phase = "mission" | "grab" | "cook" | "win";

export default function GuidedCookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  // Store
  const {
    currentPhase,
    currentStepIndex,
    expandedChip,
    setPhase,
    setTotalSteps,
    toggleChip,
    startTimer,
    completeSession,
    reset,
  } = useCookStore();

  // Fetch steps from DB
  const { data, isLoading, error } = trpc.cook.getSteps.useQuery(
    { sideDishSlug: slug },
    { enabled: !!slug }
  );

  // Filter steps by phase
  const cookSteps = useMemo(
    () => data?.steps?.filter((s) => s.phase === "cook") ?? [],
    [data?.steps]
  );

  const currentCookStep = cookSteps[currentStepIndex];

  // ── Handlers ──────────────────────────────────────

  const handleMissionStart = useCallback(() => {
    if (data?.ingredients && data.ingredients.length > 0) {
      setPhase("grab");
    } else {
      // Skip grab — go straight to cook
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
      // Last cook step — go to win
      completeSession();
    } else {
      // Directly set next step index (avoids store totalSteps dependency)
      useCookStore.setState({
        currentStepIndex: currentStepIndex + 1,
        expandedChip: null,
      });
    }
  }, [currentStepIndex, cookSteps.length, completeSession]);

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

  const handleCookAgain = useCallback(() => {
    reset();
    router.refresh();
  }, [reset, router]);

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
            onClick={currentPhase === "mission" ? handleBackToday : undefined}
            className="rounded-lg p-1.5 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
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
        <AnimatePresence mode="wait">
          {currentPhase === "mission" && (
            <MissionScreen
              key="mission"
              dishName={dish.name}
              description={dish.description}
              flavorProfile={dish.flavorProfile as string[]}
              prepTimeMinutes={dish.prepTimeMinutes}
              cookTimeMinutes={dish.cookTimeMinutes}
              heroImageUrl={dish.heroImageUrl}
              onStart={handleMissionStart}
            />
          )}

          {currentPhase === "grab" && (
            <IngredientList
              key="grab"
              ingredients={ingredients}
              onReady={handleGrabReady}
            />
          )}

          {currentPhase === "cook" && currentCookStep && (
            <StepCard
              key={`cook-${currentStepIndex}`}
              stepNumber={currentStepIndex + 1}
              totalSteps={cookSteps.length}
              instruction={currentCookStep.instruction}
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
              onPrev={() => {
                if (currentStepIndex > 0) {
                  useCookStore.setState({
                    currentStepIndex: currentStepIndex - 1,
                    expandedChip: null,
                  });
                }
              }}
              isFirst={currentStepIndex === 0}
              isLast={currentStepIndex === cookSteps.length - 1}
            />
          )}

          {currentPhase === "win" && (
            <WinScreen
              key="win"
              dishName={dish.name}
              onRate={() => {}}
              onAddPhoto={() => {}}
              onAddNote={() => {}}
              onSave={() => {}}
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
