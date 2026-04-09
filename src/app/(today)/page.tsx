"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { StreakCounter } from "@/components/today/streak-counter";
import { OwlAvatar, CravingSearchBar } from "@/components/today/bird-mascot";
import { QuestCard } from "@/components/today/quest-card";
import { FallbackActions } from "@/components/today/fallback-actions";
import { FriendsStrip } from "@/components/today/friends-strip";
import { SearchPopout } from "@/components/today/search-popout";
import { TextPrompt } from "@/components/today/text-prompt";
import { ResultStack } from "@/components/today/result-stack";
import { CameraInput } from "@/components/today/camera-input";
import { CorrectionChips } from "@/components/today/correction-chips";

import { BreadQuiz } from "@/components/shared/bread-quiz";
import { CoachQuiz } from "@/components/shared/coach-quiz";
import { trpc } from "@/lib/trpc/client";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { usePullToRefresh } from "@/lib/hooks/use-pull-to-refresh";
import type { CoachQuizResult } from "@/data/coach-quiz";

type ViewState =
  | { type: "idle" }
  | { type: "loading"; mainDish: string }
  | { type: "results"; mainDish: string }
  | { type: "camera" }
  | { type: "recognition"; imageBase64: string }
  | {
      type: "correction";
      dishName: string;
      confidence: number;
      alternates: string[];
      cuisine: string;
    };

export default function TodayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full bg-[var(--nourish-cream)] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-[var(--nourish-green)]" />
        </div>
      }
    >
      <TodayPageContent />
    </Suspense>
  );
}

function TodayPageContent() {
  const [view, setView] = useState<ViewState>({ type: "idle" });
  const [showSearch, setShowSearch] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCoachQuiz, setShowCoachQuiz] = useState(false);
  const [mainDishQuery, setMainDishQuery] = useState("");
  const [rerollSeed, setRerollSeed] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [questKey, setQuestKey] = useState(0);
  const [recognitionError, setRecognitionError] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [userPreferences, setUserPreferences] = useState<
    Record<string, number> | undefined
  >(undefined);
  const [effortTolerance, setEffortTolerance] = useState<
    "minimal" | "moderate" | "willing" | undefined
  >(undefined);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stats } = useCookSessions();

  const { pullState, setRef: setPullRef } = usePullToRefresh({
    onRefresh: () => setQuestKey((k) => k + 1),
    disabled: showSearch,
  });

  // Track which query we're waiting for to prevent stale data transitions
  const pendingQueryRef = useRef<string>("");

  // Load saved quiz state and preferences from localStorage
  useEffect(() => {
    try {
      if (localStorage.getItem("sous-coach-quiz-done")) setQuizDone(true);
      const prefs = localStorage.getItem("sous-preferences");
      if (prefs) setUserPreferences(JSON.parse(prefs));
      const effort = localStorage.getItem("sous-effort-tolerance");
      if (
        effort === "minimal" ||
        effort === "moderate" ||
        effort === "willing"
      ) {
        setEffortTolerance(effort);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Auto-show coach quiz for first-time users (after a brief delay so the page settles)
  useEffect(() => {
    try {
      if (!localStorage.getItem("sous-coach-quiz-done")) {
        const timer = setTimeout(() => setShowCoachQuiz(true), 900);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Auto-open search with sides for a dish (from mission screen "Select sides to pair")
  const selectSidesParam = searchParams.get("selectSides");
  const handledSelectSidesRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      selectSidesParam &&
      selectSidesParam !== handledSelectSidesRef.current
    ) {
      handledSelectSidesRef.current = selectSidesParam;
      setShowSearch(true);
      pendingQueryRef.current = selectSidesParam;
      setMainDishQuery(selectSidesParam);
      setView({ type: "loading", mainDish: selectSidesParam });
      // Clean up the URL param
      router.replace("/", { scroll: false });
    }
  }, [selectSidesParam, router]);

  // Auto-open search pre-filled with a dish name (from Path "practice dish" chips)
  const cravingParam = searchParams.get("craving");
  const handledCravingRef = useRef<string | null>(null);

  useEffect(() => {
    if (cravingParam && cravingParam !== handledCravingRef.current) {
      handledCravingRef.current = cravingParam;
      setShowSearch(true);
      pendingQueryRef.current = cravingParam;
      setMainDishQuery(cravingParam);
      setView({ type: "loading", mainDish: cravingParam });
      router.replace("/", { scroll: false });
    }
  }, [cravingParam, router]);

  // tRPC query — rerollSeed busts the cache without polluting the query text
  const pairingQuery = trpc.pairing.suggest.useQuery(
    {
      mainDish: mainDishQuery,
      inputMode: "text",
      _rerollSeed: rerollSeed || undefined,
      userPreferences,
      effortTolerance,
    },
    {
      enabled:
        !!mainDishQuery && (view.type === "loading" || view.type === "results"),
    },
  );

  const recognitionMutation = trpc.recognition.identify.useMutation();

  // Transition from loading → results when query resolves for the CURRENT query

  useEffect(() => {
    if (
      view.type === "loading" &&
      !pairingQuery.isFetching &&
      pairingQuery.data &&
      pendingQueryRef.current === mainDishQuery
    ) {
      // Transition to results regardless of success/failure — the results view handles both
      setView({ type: "results", mainDish: view.mainDish });
    }
  }, [pairingQuery.data, pairingQuery.isFetching, view, mainDishQuery]);

  // ── Handlers ──────────────────────────────────────────

  const handleOpenSearch = useCallback(() => {
    setShowSearch(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    // Reset search state when closing
    pendingQueryRef.current = "";
    setView({ type: "idle" });
    setMainDishQuery("");
    setResetKey((k) => k + 1);
  }, []);

  const handleTextSubmit = useCallback((text: string) => {
    pendingQueryRef.current = text;
    setMainDishQuery(text);
    setView({ type: "loading", mainDish: text });
  }, []);

  const handleCameraOpen = useCallback(() => {
    setView({ type: "camera" });
  }, []);

  const handleCameraCapture = useCallback(async (imageBase64: string) => {
    setView({ type: "recognition", imageBase64 });

    try {
      const result = await recognitionMutation.mutateAsync({ imageBase64 });

      if (result.success) {
        setView({
          type: "correction",
          dishName: result.dishName,
          confidence: result.confidence,
          alternates: result.alternates,
          cuisine: result.cuisine,
        });
      } else {
        // Recognition failed — show brief feedback then fall back to text input
        setRecognitionError(true);
        setView({ type: "idle" });
        setTimeout(() => setRecognitionError(false), 4000);
      }
    } catch {
      // Network or server error — show feedback and fall back to text input
      setRecognitionError(true);
      setView({ type: "idle" });
      setTimeout(() => setRecognitionError(false), 4000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recognitionMutation is stable (tRPC hook)
  }, []);

  const handleCorrectionConfirm = useCallback((confirmedDish: string) => {
    pendingQueryRef.current = confirmedDish;
    setMainDishQuery(confirmedDish);
    setView({ type: "loading", mainDish: confirmedDish });
  }, []);

  const handleCookThis = useCallback(
    (side: { slug: string }) => {
      setShowSearch(false);
      const mainParam = mainDishQuery
        ? `?main=${encodeURIComponent(mainDishQuery)}`
        : "";
      router.push(`/cook/${side.slug}${mainParam}`);
    },
    [router, mainDishQuery],
  );

  const handleReroll = useCallback(() => {
    if (mainDishQuery) {
      setRerollSeed(Date.now());
      pendingQueryRef.current = mainDishQuery;
      setView({ type: "loading", mainDish: mainDishQuery.trim() });
    }
  }, [mainDishQuery]);

  const handleRescueFridge = useCallback(() => {
    setShowSearch(true);
    handleTextSubmit("simple side with basic pantry ingredients");
  }, [handleTextSubmit]);

  const handleCoachQuizComplete = useCallback((result: CoachQuizResult) => {
    try {
      localStorage.setItem(
        "sous-preferences",
        JSON.stringify(result.preferences),
      );
      localStorage.setItem("sous-effort-tolerance", result.effortTolerance);
      localStorage.setItem("sous-coach-quiz-done", "true");
    } catch {
      // localStorage unavailable
    }
    setUserPreferences(result.preferences);
    setEffortTolerance(result.effortTolerance);
    setQuizDone(true);
    setShowCoachQuiz(false);
  }, []);

  // ── Render ────────────────────────────────────────────

  return (
    <motion.div
      ref={(el) => setPullRef(el as HTMLElement | null)}
      className="min-h-full bg-[var(--nourish-cream)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      {/* Pull-to-refresh indicator */}
      {pullState.pulling && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all duration-150"
          style={{ height: pullState.progress * 48 }}
        >
          <div
            className="flex items-center gap-2 text-xs font-medium text-[var(--nourish-subtext)]"
            style={{ opacity: pullState.progress }}
          >
            <svg
              className="text-[var(--nourish-green)]"
              style={{
                transform: `rotate(${pullState.triggered ? 180 : pullState.progress * 180}deg)`,
                transition: "transform 0.15s ease",
              }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            {pullState.triggered ? "Release to refresh" : "Pull to refresh"}
          </div>
        </div>
      )}

      {/* Header — Sous + streak chip + bird */}
      <header className="border-b border-neutral-100/80 bg-white px-4 py-1.5">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
              Sous
            </h1>
            <StreakCounter streak={stats.currentStreak} />
          </div>
          {/* Owl mascot — profile position */}
          <OwlAvatar onClick={handleOpenSearch} />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-md px-4 pt-3 pb-24">
        {/* Primary craving trigger — search bar */}
        <div className="mb-3">
          <CravingSearchBar onClick={handleOpenSearch} />
        </div>

        {/* Today's Quest — swipeable card stack */}
        <div className="mb-2">
          <QuestCard
            key={questKey}
            onFindSides={(dishName) => {
              setShowSearch(true);
              handleTextSubmit(dishName);
            }}
            userPreferences={userPreferences}
          />
        </div>

        {/* "Too tired?" + action chips — tightly grouped as secondary options */}
        <div className="space-y-2.5 mb-4 overflow-visible">
          <p className="text-center">
            <motion.button
              onClick={() => {
                setShowSearch(true);
                handleTextSubmit("something quick and easy, I'm tired");
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="text-xs text-[var(--nourish-subtext)] hover:text-[var(--nourish-green)] transition-colors"
              type="button"
            >
              Too tired?{" "}
              <span className="underline underline-offset-2 decoration-[var(--nourish-green)]/50">
                Make something in 15 minutes
              </span>
            </motion.button>
          </p>
          <FallbackActions
            onRescueFridge={handleRescueFridge}
            onPlayGame={() => setShowQuiz(true)}
            onPersonalize={quizDone ? () => setShowCoachQuiz(true) : undefined}
          />
        </div>

        {/* Friends social meals — below fold, social proof */}
        <FriendsStrip
          onDishSelect={(dishName) => {
            setShowSearch(true);
            handleTextSubmit(dishName);
          }}
        />
      </main>

      {/* Search popout — slides up from bottom */}
      <SearchPopout isOpen={showSearch} onClose={handleCloseSearch}>
        <AnimatePresence mode="wait">
          {/* Camera overlay */}
          {(view.type === "camera" || view.type === "recognition") && (
            <CameraInput
              key="camera-input"
              onCapture={handleCameraCapture}
              onClose={() => setView({ type: "idle" })}
              isProcessing={view.type === "recognition"}
            />
          )}
        </AnimatePresence>

        {/* Correction chips after photo recognition */}
        {view.type === "correction" && (
          <CorrectionChips
            dishName={view.dishName}
            confidence={view.confidence}
            alternates={view.alternates}
            onConfirm={handleCorrectionConfirm}
            onCustom={() => setView({ type: "idle" })}
          />
        )}

        {/* Recognition failure feedback */}
        {recognitionError && view.type === "idle" && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-center mb-3">
            <p className="text-sm text-amber-700">
              Couldn&apos;t identify the dish from the photo. Try typing it
              instead.
            </p>
          </div>
        )}

        {/* Search input + results */}
        {(view.type === "idle" ||
          view.type === "loading" ||
          view.type === "results") && (
          <>
            <TextPrompt
              key={resetKey}
              onSubmit={handleTextSubmit}
              onCameraClick={handleCameraOpen}
              isLoading={view.type === "loading" || pairingQuery.isFetching}
            />

            {/* Loading state */}
            {view.type === "loading" && (
              <div className="space-y-4">
                <p className="text-sm text-center text-[var(--nourish-subtext)]">
                  Finding your sides...
                </p>
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <div className="h-14 w-14 shrink-0 rounded-lg shimmer" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-24 rounded shimmer" />
                        <div className="h-2.5 w-36 rounded shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results — no sides returned */}
            {view.type === "results" &&
              pairingQuery.data?.success &&
              pairingQuery.data.sides.length === 0 && (
                <div className="rounded-xl border border-neutral-100 bg-white p-6 text-center space-y-3">
                  <span className="text-3xl block">🤔</span>
                  <p className="text-sm font-semibold text-[var(--nourish-dark)]">
                    Hmm, we couldn&apos;t find a match
                  </p>
                  <p className="text-xs text-[var(--nourish-subtext)]">
                    Try a different craving — like &ldquo;pasta&rdquo;,
                    &ldquo;tacos&rdquo;, or &ldquo;chicken stir-fry&rdquo;.
                  </p>
                </div>
              )}

            {/* Results */}
            {view.type === "results" &&
              pairingQuery.data?.success &&
              pairingQuery.data.sides.length > 0 && (
              <ResultStack
                mainDish={view.mainDish}
                sides={pairingQuery.data.sides}
                onCookThis={handleCookThis}
                onCookSelected={(sides) => {
                  if (sides.length === 0) return;

                  // Check if the main dish has guided cook data for combined flow
                  const queryData = pairingQuery.data;
                  const mealSlug =
                    queryData && "resolvedMealSlug" in queryData
                      ? (queryData.resolvedMealSlug as string | null)
                      : null;

                  if (mealSlug && sides.length >= 1) {
                    // Navigate to combined cook flow
                    const sideSlugs = sides.map((s) => s.slug).join(",");
                    setShowSearch(false);
                    router.push(
                      `/cook/combined?main=${encodeURIComponent(mealSlug)}&sides=${encodeURIComponent(sideSlugs)}`,
                    );
                  } else {
                    // Fallback: cook the first selected side
                    handleCookThis(sides[0]);
                  }
                }}
                onReroll={handleReroll}
              />
            )}

            {/* Engine returned success: false (e.g. unparseable craving) */}
            {view.type === "results" &&
              pairingQuery.data &&
              !pairingQuery.data.success && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-center space-y-2">
                  <p className="text-sm text-amber-700">
                    {pairingQuery.data.error ||
                      "Couldn\u2019t parse that craving. Try describing a specific dish."}
                  </p>
                  <button
                    onClick={() => {
                      setView({ type: "idle" });
                      setMainDishQuery("");
                      setResetKey((k) => k + 1);
                    }}
                    className="text-xs font-medium text-[var(--nourish-green)] hover:underline"
                    type="button"
                  >
                    Try something else
                  </button>
                </div>
              )}

            {/* Error state */}
            {pairingQuery.error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center space-y-2">
                <p className="text-sm text-red-600">
                  {pairingQuery.error.message?.includes("timed out") ||
                  pairingQuery.error.message?.includes("timeout")
                    ? "The request took too long. Check your connection and try again."
                    : pairingQuery.error.message?.includes("fetch")
                      ? "Couldn\u2019t reach the server. Check your internet connection."
                      : "Couldn\u2019t find sides for that dish. Try a different craving."}
                </p>
                <button
                  onClick={handleReroll}
                  className="text-xs font-medium text-[var(--nourish-green)] hover:underline"
                  type="button"
                >
                  Try again
                </button>
              </div>
            )}
          </>
        )}
      </SearchPopout>

      {/* Bread personality quiz — full-screen overlay */}
      <AnimatePresence>
        {showQuiz && (
          <BreadQuiz
            onClose={() => setShowQuiz(false)}
            onComplete={() => {
              // Quiz result saved to localStorage by the component itself.
            }}
          />
        )}
      </AnimatePresence>

      {/* Coach onboarding quiz — full-screen overlay */}
      <AnimatePresence>
        {showCoachQuiz && (
          <CoachQuiz
            onClose={() => {
              // Mark as done even if closed early so it doesn't re-appear
              try {
                localStorage.setItem("sous-coach-quiz-done", "true");
              } catch {
                // localStorage unavailable
              }
              setShowCoachQuiz(false);
            }}
            onComplete={handleCoachQuizComplete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
