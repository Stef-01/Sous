"use client";

import { use, useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChefHat, Mic } from "lucide-react";
import { useVoiceCook } from "@/lib/voice/use-voice-cook";
import { useVisualModePref } from "@/lib/cook/use-visual-mode-pref";
import {
  findMostRecentActiveTimer,
  speakableTimerAdd,
  speakableTimerCancel,
  speakableTimerSet,
  speakableTimerStatus,
} from "@/lib/voice/timer-voice";
import { useRecipeDrafts } from "@/lib/recipe-authoring/use-recipe-drafts";
import {
  adaptUserRecipeForCook,
  findUserRecipeBySlug,
} from "@/lib/cook/user-recipe-adapter";
import {
  PENDING_BREAKDOWN_KEY,
  parsePendingBreakdown,
} from "@/lib/engine/attach-score-breakdown";
import { MetaPill } from "@/components/shared/meta-pill";
import { PhaseIndicator } from "@/components/guided-cook/phase-indicator";
import { MissionScreen } from "@/components/guided-cook/mission-screen";
import { IngredientList } from "@/components/guided-cook/ingredient-list";
import { CookWatchlist } from "@/components/guided-cook/cook-watchlist";
import type { StaticCookStep } from "@/data/guided-cook-steps";
import { StepCard } from "@/components/guided-cook/step-card";
import { WinScreen } from "@/components/guided-cook/win-screen";
import { CookTimer } from "@/components/guided-cook/cook-timer";
import { useCookStore } from "@/lib/hooks/use-cook-store";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { useSkillProgress } from "@/lib/hooks/use-skill-progress";
import { useXPSystem, XP_AWARDS } from "@/lib/hooks/use-xp-system";
import { useBigHands } from "@/lib/hooks/use-big-hands";
import { toast } from "@/lib/hooks/use-toast";
import {
  getStaticCookData,
  getStaticMealCookData,
} from "@/data/guided-cook-steps";
import { getSkillNodesForDish, getSkillNode } from "@/data/skill-tree";
import type { SkillProgressEntry } from "@/components/guided-cook/win-screen";
import { cn } from "@/lib/utils/cn";
import { trpc } from "@/lib/trpc/client";
import { useCurrentPod } from "@/lib/pod/use-current-pod";
import {
  computeCookScore,
  dayKey,
  normaliseStarRating,
} from "@/lib/pod/pod-score";
import { POD_SCHEMA_VERSION } from "@/types/challenge-pod";
import { usePreferenceProfile } from "@/lib/hooks/use-preference-profile";
import { dishToFacets } from "@/lib/intelligence/dish-to-facets";
import { DeadEndShell } from "@/components/shared/dead-end-shell";

export default function GuidedCookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  // W7 follow-up: useReducedMotion gate available across this file's
  // motion sites. Currently consumed by the page-shell entrance below.
  const reducedMotion = useReducedMotion();

  // Main dish context passed from the Today page (e.g. "Chicken Tikka Masala")
  const mainDishInput = searchParams.get("main") ?? undefined;
  // W46 pod-challenge context. The pod home's "Cook this week's
  // challenge" deeplink stamps `?pod=<id>&week=<key>` so the
  // win-screen integration can attribute the cook back to the
  // pod without needing extra cross-page state.
  const podIdParam = searchParams.get("pod");
  const weekKeyParam = searchParams.get("week");

  // Session tracking
  const { startSession, completeSession, updateSession } = useCookSessions();
  // Y5 D, audit P0 #6 — completing a cook is the strongest
  // implicit preference signal we collect. Fired in handleNext
  // when the last cook step transitions into the win phase.
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
  const { enabled: bigHands } = useBigHands();
  // W46 pod-challenge state. The pod-home "Cook this week's
  // challenge" deeplink stamps `?pod=<id>&week=<key>`; we use
  // those to attribute the win-screen submission back to the
  // correct pod week. Local rating state mirrors the cook
  // session so the pod-challenge slot can preview the score
  // before the user submits.
  const {
    pod: currentPod,
    submissions: podSubmissions,
    upsertSubmission,
  } = useCurrentPod();
  const [podRating, setPodRating] = useState(0);
  // W22 visual-mode preference + W27 page-side adoption — when on,
  // StepCard promotes the step image and shrinks the instruction.
  const { enabled: visualMode } = useVisualModePref();
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
    stopTimer,
    extendTimer,
    completeSession: completeCookPhase,
    reset,
  } = useCookStore();

  // Reset store on mount to ensure clean state (handles direct navigation from combined cook)
  useEffect(() => {
    reset();
  }, [reset]);

  // Fetch steps from tRPC
  const {
    data: tRPCData,
    isLoading,
    error,
  } = trpc.cook.getSteps.useQuery({ sideDishSlug: slug }, { enabled: !!slug });

  // W31 user-recipe → cook flow integration. When the seed catalog
  // doesn't have this slug, fall back to user-authored recipes from
  // localStorage. The adapter shapes the result identically to the
  // tRPC payload so the rest of the page is unconditional.
  // CLAUDE.md rule 4: every recipe goes through the same Quest shell.
  const { drafts: userDrafts, mounted: userDraftsMounted } = useRecipeDrafts();
  const data = useMemo(() => {
    if (tRPCData?.dish) return tRPCData;
    const fromDrafts = findUserRecipeBySlug(userDrafts, slug);
    if (fromDrafts) return adaptUserRecipeForCook(fromDrafts);
    return tRPCData;
  }, [tRPCData, userDrafts, slug]);

  // Cuisine family for this dish (side, meal, or user recipe).
  const cuisine = useMemo(() => {
    const staticData = getStaticCookData(slug) ?? getStaticMealCookData(slug);
    if (staticData?.cuisineFamily) return staticData.cuisineFamily;
    const userRecipe = findUserRecipeBySlug(userDrafts, slug);
    return userRecipe?.cuisineFamily ?? "unknown";
  }, [slug, userDrafts]);

  // Start session on mount (once data is available). Y2 W6:
  // also attach the engine score breakdown stashed by the
  // result-stack pick (V3 trainer dependency). Stash is single-
  // use — read-then-clear.
  useEffect(() => {
    if (data?.dish && !sessionIdRef.current) {
      sessionIdRef.current = startSession(
        slug,
        data.dish.name,
        cuisine,
        mainDishInput,
      );
      if (typeof window !== "undefined") {
        try {
          const raw = sessionStorage.getItem(PENDING_BREAKDOWN_KEY);
          const pending = parsePendingBreakdown(raw);
          if (pending && pending.recipeSlug === slug) {
            updateSession(sessionIdRef.current, {
              engineScoreBreakdown: {
                cuisineFit: pending.breakdown.cuisineFit,
                flavorContrast: pending.breakdown.flavorContrast,
                nutritionBalance: pending.breakdown.nutritionBalance,
                prepBurden: pending.breakdown.prepBurden,
                temperature: pending.breakdown.temperature,
                preference: pending.breakdown.preference,
                totalScore: pending.totalScore,
              },
            });
            sessionStorage.removeItem(PENDING_BREAKDOWN_KEY);
          }
        } catch {
          // ignore — privacy mode / storage unavailable
        }
      }
    }
  }, [data?.dish, slug, cuisine, mainDishInput, startSession, updateSession]);

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
      // Last cook step  -  complete session, record skill progress, and go to win
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
      // Strongest implicit preference signal — fired on cook
      // completion only, not on session start. Pulls cuisine
      // + flavor profile + ingredient names from the static
      // recipe data.
      const staticData = getStaticCookData(slug) ?? getStaticMealCookData(slug);
      recordPreferenceSignal({
        kind: "cooked",
        facets: dishToFacets({
          cuisineFamily: cuisine,
          tags: staticData?.flavorProfile,
          ingredients: staticData?.ingredients?.map((i) => i.name),
        }),
      });
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
    cuisine,
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
        } else {
          // First cook step  -  go back to grab (or mission if no ingredients)
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

  // W21 — live cook-step-page integration of the voice-cook
  // coordinator (Sprint-D top carry-forward). Voice cook is gated
  // by the user's preference (toggled in profile settings); when
  // off, the hook is a no-op. The onAction callback maps voice
  // intents to the page's existing step navigation.
  const voice = useVoiceCook({
    onAction: (action) => {
      if (currentPhase !== "cook") return;
      switch (action.kind) {
        case "next":
        case "done":
          handleNext();
          break;
        case "back":
          handleBack();
          break;
        case "repeat":
          if (currentCookStep) voice.speakStep(currentCookStep.instruction);
          break;
        case "timer-set": {
          // W39 timer-voice wiring. Voice "set 5 minutes" creates
          // a labelled "Voice timer" so the user can distinguish
          // it from chip-spawned timers. Speak a short
          // confirmation so the user knows it took.
          startTimer(action.seconds, "Voice timer");
          voice.speakStep(speakableTimerSet(action.seconds));
          break;
        }
        case "timer-cancel": {
          const hadActive =
            findMostRecentActiveTimer(useCookStore.getState().timers) !== null;
          stopTimer();
          voice.speakStep(speakableTimerCancel(hadActive));
          break;
        }
        case "timer-status": {
          voice.speakStep(speakableTimerStatus(useCookStore.getState().timers));
          break;
        }
        case "timer-add": {
          const beforeActive = findMostRecentActiveTimer(
            useCookStore.getState().timers,
          );
          extendTimer(action.seconds);
          // `extendTimer` is a no-op when no active timer exists,
          // so we can derive the applied flag from the snapshot
          // we took before the call.
          voice.speakStep(
            speakableTimerAdd(action.seconds, beforeActive !== null),
          );
          break;
        }
        case "ignore":
          break;
      }
    },
  });

  // Coach-voice trigger: speak the current step's instruction
  // when the user lands on a new step (only while voice cook is on).
  useEffect(() => {
    if (!voice.enabled) return;
    if (currentPhase !== "cook") return;
    if (!currentCookStep) return;
    voice.speakStep(currentCookStep.instruction);
  }, [voice, currentPhase, currentStepIndex, currentCookStep]);

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
      setPodRating(stars);
      if (sessionIdRef.current) {
        updateSession(sessionIdRef.current, { rating: stars });
        awardXP("rate_dish", XP_AWARDS.RATE_DISH);
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

  const handleSave = useCallback(() => {
    if (sessionIdRef.current) {
      updateSession(sessionIdRef.current, { favorite: true });
    }
    setWinMeta((prev) => ({ ...prev, saved: true }));
  }, [updateSession]);

  // W46 pod-challenge slot composition. Active iff:
  //   - the URL stamps a pod id + week that matches the local pod
  //   - the pod's owner = "the user on this device" (V1
  //     single-device assumption; auth-tied id when Y2 lands)
  //   - the cook's recipe slug matches the dish slug (so a user
  //     who navigated to a different recipe doesn't accidentally
  //     submit to the wrong week)
  const podSlotActive =
    currentPod !== null &&
    podIdParam === currentPod.id &&
    weekKeyParam !== null &&
    weekKeyParam.length > 0;
  const existingPodSubmission = useMemo(() => {
    if (!podSlotActive || !currentPod) return null;
    for (const sub of Object.values(podSubmissions)) {
      if (
        sub.podId === currentPod.id &&
        sub.weekKey === weekKeyParam &&
        sub.memberId === currentPod.ownerId
      ) {
        return sub;
      }
    }
    return null;
  }, [podSlotActive, currentPod, podSubmissions, weekKeyParam]);
  const podStepCompletion =
    cookSteps.length > 0 ? Math.min(currentStepIndex / cookSteps.length, 1) : 0;
  const podComputedScore = useMemo(
    () =>
      computeCookScore({
        stepCompletion: podStepCompletion,
        selfRating:
          podRating > 0
            ? normaliseStarRating(podRating)
            : existingPodSubmission
              ? normaliseStarRating(existingPodSubmission.selfRating)
              : 0.6, // neutral preview before user rates
        aesthetic: 0.5, // V1 placeholder per pod-score doc
        captionLength: 0,
        hasStepImage: false,
      }),
    [podStepCompletion, podRating, existingPodSubmission],
  );

  const handlePodSubmit = useCallback(() => {
    if (!podSlotActive || !currentPod || !weekKeyParam) return;
    const now = new Date();
    const id =
      existingPodSubmission?.id ??
      `sub-${currentPod.id}-${weekKeyParam}-${currentPod.ownerId}-${now.getTime()}`;
    upsertSubmission({
      schemaVersion: POD_SCHEMA_VERSION,
      id,
      podId: currentPod.id,
      weekKey: weekKeyParam,
      memberId: currentPod.ownerId,
      dayKey: dayKey(now),
      submittedAt: now.toISOString(),
      photoUri: `pod-photo-${now.getTime()}-placeholder`,
      selfRating: podRating > 0 ? podRating : 4,
      caption: null,
      donateTags: [],
      stepCompletion: podStepCompletion,
      aestheticScore: 0.5,
      hasStepImage: false,
      computedScore: podComputedScore,
    });
    toast.push({
      variant: "success",
      title: existingPodSubmission
        ? "Pod submission updated"
        : "Submitted to pod",
      body: `${Math.round(podComputedScore)}/100 toward this week.`,
      dedupKey: "pod-submitted",
    });
  }, [
    podSlotActive,
    currentPod,
    weekKeyParam,
    existingPodSubmission,
    upsertSubmission,
    podRating,
    podStepCompletion,
    podComputedScore,
  ]);

  // ── Loading / error states ────────────────────────

  // W31: hold the loading state until the user-drafts hook has
  // hydrated. Otherwise a user-authored recipe briefly shows the
  // "Cook steps coming soon" screen while localStorage resolves.
  if (isLoading || (!tRPCData?.dish && !userDraftsMounted)) {
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
      <DeadEndShell
        title={
          data?.dish === null
            ? "Cook steps coming soon"
            : "Couldn\u2019t load the recipe"
        }
        body={
          data?.dish === null
            ? "This dish doesn\u2019t have a guided cook flow yet. Try another from the Today page."
            : "Something went wrong. Check your connection and try again."
        }
        Icon={ChefHat}
        primary={{ label: "Back to Today", onClick: handleBackToday }}
      />
    );
  }

  const { dish, ingredients } = data;

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
          {/* W21 voice-cook listening indicator. Only renders when
              the user has voice on AND the recogniser is actually
              listening — keeps header clutter at zero for
              non-voice users. */}
          {voice.enabled && voice.listening ? (
            <MetaPill variant="green" size="xs" aria-label="Voice listening">
              <Mic size={10} aria-hidden /> Voice
            </MetaPill>
          ) : (
            <div className="w-8" />
          )}
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
              dishSlug={dish.slug}
              onStart={handleMissionStart}
            />
          )}

          {currentPhase === "grab" && (
            <div key="grab" className="space-y-3">
              <CookWatchlist
                dishSlug={dish.slug}
                steps={cookSteps.map((s: unknown) => s as StaticCookStep)}
              />
              <IngredientList
                ingredients={ingredients}
                recipeName={dish.name}
                cuisineFamily={cuisine}
                dishSlug={dish.slug}
                onReady={handleGrabReady}
                onSelectSides={handleSelectSides}
              />
            </div>
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
              heroImageUrl={dish.heroImageUrl}
              visualMode={visualMode}
              attentionPointers={currentCookStep.attentionPointers ?? null}
              expandedChip={expandedChip}
              onToggleChip={handleToggleChip}
              onStartTimer={handleStartTimer}
              onNext={handleNext}
              onPrev={handleBack}
              isFirst={currentStepIndex === 0}
              isLast={currentStepIndex === cookSteps.length - 1}
              dishSlug={dish.slug}
            />
          )}

          {currentPhase === "win" && (
            <WinScreen
              key="win"
              dishName={dish.name}
              dishSlug={slug}
              sideDishes={mainDishInput ? [mainDishInput] : []}
              cuisineFamily={cuisine}
              isFirstCook={winMeta.streak === 1}
              streak={winMeta.streak}
              totalSteps={cookSteps.length}
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
              podChallenge={
                podSlotActive && currentPod
                  ? {
                      podName: currentPod.name,
                      computedScore: podComputedScore,
                      alreadySubmitted: existingPodSubmission !== null,
                      onSubmit: handlePodSubmit,
                    }
                  : null
              }
            />
          )}
        </AnimatePresence>
      </main>

      {/* Floating timer */}
      <CookTimer />
    </motion.div>
  );
}
