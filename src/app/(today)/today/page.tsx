"use client";

import {
  Suspense,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SearchX, MoreHorizontal } from "lucide-react";
import { StreakCounter } from "@/components/today/streak-counter";
import { OwlAvatar, CravingSearchBar } from "@/components/today/bird-mascot";
import { TonightChip } from "@/components/today/tonight-chip";
import { TodayPlannedSlot } from "@/components/today/today-planned-slot";
import { QuestCard } from "@/components/today/quest-card";
// W18 perf: both sheets are lazy-loaded behind next/dynamic so the
// initial Today bundle does not pay their cost (~10KB combined). Both
// only mount on user action (More-Options button / mascot tap).
import dynamic from "next/dynamic";
const MoreOptionsSheet = dynamic(
  () =>
    import("@/components/today/more-options-sheet").then(
      (m) => m.MoreOptionsSheet,
    ),
  { ssr: false },
);
const ProfileSettingsSheet = dynamic(
  () =>
    import("@/components/shared/profile-settings-sheet").then(
      (m) => m.ProfileSettingsSheet,
    ),
  { ssr: false },
);
import { FriendsStrip } from "@/components/today/friends-strip";
import { NutritionGoalCard } from "@/components/today/nutrition-goal-card";
import { TodayEatingCard } from "@/components/today/today-eating-card";
import { FirstRunCoachmark } from "@/components/today/first-run-coachmark";
import { TextPrompt } from "@/components/today/text-prompt";
import { HeadroomHeader } from "@/components/shared/headroom-header";

// W18 perf round 2: post-interaction surfaces are dynamic-imported.
// SearchPopout opens on the search-bar tap, CameraInput on the
// camera affordance, ResultStack only after a search returns, and
// CorrectionChips only during the recognition-correction flow.
// Paying their cost only when the trigger fires is correct minimalism
// (POLISH-CHECKLIST §1.5.2 + CLAUDE.md rule 6).
const SearchPopout = dynamic(
  () => import("@/components/today/search-popout").then((m) => m.SearchPopout),
  { ssr: false },
);
const ResultStack = dynamic(
  () => import("@/components/today/result-stack").then((m) => m.ResultStack),
  { ssr: false },
);
const CameraInput = dynamic(
  () => import("@/components/today/camera-input").then((m) => m.CameraInput),
  { ssr: false },
);
const CorrectionChips = dynamic(
  () =>
    import("@/components/today/correction-chips").then(
      (m) => m.CorrectionChips,
    ),
  { ssr: false },
);

const CoachQuiz = dynamic(() =>
  import("@/components/shared/coach-quiz").then((m) => m.CoachQuiz),
);
import { trpc } from "@/lib/trpc/client";
import { useCookSessions } from "@/lib/hooks/use-cook-sessions";
import { useUserWeights } from "@/lib/hooks/use-user-weights";
import { usePantry } from "@/lib/hooks/use-pantry";
import { useNutritionDiary } from "@/lib/hooks/use-nutrition-diary";
import { deficitWeightMap } from "@/lib/nutrition/deficits";
import { WhosAtTable } from "@/components/today/whos-at-table";
import { useHouseholdDietary } from "@/lib/hooks/use-household-dietary";
import { useTherapeuticDietaryFlags } from "@/lib/hooks/use-therapeutic-flags";
import { TherapeuticEvidence } from "@/components/today/therapeutic-evidence";
import { track } from "@/lib/analytics";
import { usePullToRefresh } from "@/lib/hooks/use-pull-to-refresh";
import { blendPreferences, useTasteBlend } from "@/lib/hooks/use-taste-blend";
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
  // W7 follow-up: useReducedMotion gate available for any motion sites
  // in this file. Currently consumed by the empty-state pull-to-refresh
  // hint below — preserves the bird-blink while suppressing the larger
  // pulse for users with prefers-reduced-motion set.
  const reducedMotion = useReducedMotion();
  const [view, setView] = useState<ViewState>({ type: "idle" });
  const [showSearch, setShowSearch] = useState(false);
  const [showCoachQuiz, setShowCoachQuiz] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [mainDishQuery, setMainDishQuery] = useState("");
  const [rerollSeed, setRerollSeed] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [questKey, setQuestKey] = useState(0);
  const [recognitionError, setRecognitionError] = useState(false);
  const recognitionTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(recognitionTimerRef.current), []);
  const [quizDone, setQuizDone] = useState(false);
  const [userPreferences, setUserPreferences] = useState<
    Record<string, number> | undefined
  >(undefined);
  const [effortTolerance, setEffortTolerance] = useState<
    "minimal" | "moderate" | "willing" | undefined
  >(undefined);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stats, completedSessions } = useCookSessions();
  // W30 pairing-engine V2: trained weight vector from cook
  // history. Cold-start (< 5 cooks) returns the same DEFAULT_WEIGHTS
  // the engine already uses, so this is invisible to new users
  // and starts personalising silently as history accumulates.
  const { weights: userWeights } = useUserWeights();
  // W37 household table aggregate — feeds the pairing engine the
  // dietary union across the "who's at the table" selection.
  const { dietaryFlags: householdDietaryFlags } = useHouseholdDietary();
  // Culinary Therapeutics activation wiring (dormant until founder gate G1):
  // derived care exclusions (e.g. gluten-free) merge into the dietary union.
  // Returns [] while dormant, so the request below stays byte-identical.
  const careDietaryFlags = useTherapeuticDietaryFlags();
  const effectiveDietaryFlags =
    careDietaryFlags.length > 0
      ? [...new Set([...householdDietaryFlags, ...careDietaryFlags])]
      : householdDietaryFlags;
  const tasteBlend = useTasteBlend();
  const effectivePreferences = blendPreferences(
    userPreferences,
    tasteBlend.duo,
    tasteBlend.alpha,
  );

  // W1 pantry-reuse inputs for the pairing query: what the user has on hand
  // (pantry) + the dishes most recently cooked (ingredients likely still in
  // the fridge). Both feed the engine's waste-reducing reblend; empty → no-op.
  // We take the ~10 newest completed cooks by ISO-string sort (pure + stable —
  // avoids an impure Date.now() in render) as the "recent" proxy; precision
  // isn't critical since the reuse signal rides at a low weight.
  const { items: pantryItems } = usePantry();
  const recentCookSlugs = useMemo(() => {
    const newestFirst = completedSessions
      .filter((s) => s.completedAt && s.recipeSlug)
      .sort((a, b) => (a.completedAt! < b.completedAt! ? 1 : -1))
      .slice(0, 10);
    return [...new Set(newestFirst.map((s) => s.recipeSlug))];
  }, [completedSessions]);

  // W29 deficiency-fill: today's nutrient gaps from the diary. Stable across
  // renders (dayNutrition is memoised), so it doesn't thrash the pairing query;
  // empty/undefined when nothing's logged → byte-identical ranking.
  // Cooked-only — branded foods' missing micros must not drive side suggestions.
  const { cookedDayNutrition } = useNutritionDiary();
  const dayDeficits = useMemo(() => {
    const map = deficitWeightMap(cookedDayNutrition);
    if (map.size === 0) return undefined;
    const rec: Record<string, number> = {};
    for (const [k, v] of map) rec[k] = Math.round(v * 100) / 100;
    return rec;
  }, [cookedDayNutrition]);

  const { pullState, setRef: setPullRef } = usePullToRefresh({
    onRefresh: () => setQuestKey((k) => k + 1),
    disabled: showSearch,
  });

  // Track which query we're waiting for to prevent stale data transitions
  const pendingQueryRef = useRef<string>("");

  // Load saved quiz state and preferences from localStorage (deferred to avoid synchronous setState in effect)
  useEffect(() => {
    const id = setTimeout(() => {
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
    }, 0);
    return () => clearTimeout(id);
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
      const id = setTimeout(() => {
        setShowSearch(true);
        pendingQueryRef.current = selectSidesParam;
        setMainDishQuery(selectSidesParam);
        setView({ type: "loading", mainDish: selectSidesParam });
        router.replace("/today", { scroll: false });
      }, 0);
      return () => clearTimeout(id);
    }
  }, [selectSidesParam, router]);

  // Auto-open search pre-filled with a dish name (from Path "practice dish" chips)
  const cravingParam = searchParams.get("craving");
  const handledCravingRef = useRef<string | null>(null);

  useEffect(() => {
    if (cravingParam && cravingParam !== handledCravingRef.current) {
      handledCravingRef.current = cravingParam;
      const id = setTimeout(() => {
        setShowSearch(true);
        pendingQueryRef.current = cravingParam;
        setMainDishQuery(cravingParam);
        setView({ type: "loading", mainDish: cravingParam });
        router.replace("/today", { scroll: false });
      }, 0);
      return () => clearTimeout(id);
    }
  }, [cravingParam, router]);

  // tRPC query  -  rerollSeed busts the cache without polluting the query text
  const pairingQuery = trpc.pairing.suggest.useQuery(
    {
      mainDish: mainDishQuery,
      inputMode: "text",
      _rerollSeed: rerollSeed || undefined,
      userPreferences: effectivePreferences,
      userWeights,
      householdDietaryFlags:
        effectiveDietaryFlags.length > 0 ? effectiveDietaryFlags : undefined,
      effortTolerance,
      // W1 pantry-reuse: nudge waste-reducing sides up when the user has
      // ingredients on hand. Both omitted when empty → byte-identical ranking.
      pantryOnHand: pantryItems.length > 0 ? pantryItems : undefined,
      recentCookSlugs: recentCookSlugs.length > 0 ? recentCookSlugs : undefined,
      // W29 deficiency-fill: nudge gap-closing sides up when cooks are logged.
      dayDeficits,
    },
    {
      enabled:
        !!mainDishQuery && (view.type === "loading" || view.type === "results"),
    },
  );

  const recognitionMutation = trpc.recognition.identify.useMutation();

  // Transition from loading → results when query resolves for the CURRENT query.
  // Funnel: fire search_submitted / results_viewed once per view transition
  // (the ref dedupes the effect's re-runs on data changes).
  const trackedViewRef = useRef<string>("");
  useEffect(() => {
    if (view.type === trackedViewRef.current) return;
    trackedViewRef.current = view.type;
    if (view.type === "loading") {
      track("search_submitted");
    } else if (view.type === "results") {
      track("results_viewed", {
        sides: pairingQuery.data?.success ? pairingQuery.data.sides.length : 0,
      });
    }
  }, [view.type, pairingQuery.data]);

  // If the query errors while still in loading, fall back to search so the
  // skeleton UI doesn't stack on top of the error block (AUDIT P1-5).

  useEffect(() => {
    if (
      view.type === "loading" &&
      !pairingQuery.isFetching &&
      pairingQuery.data &&
      pendingQueryRef.current === mainDishQuery
    ) {
      const id = setTimeout(() => {
        setView({ type: "results", mainDish: view.mainDish });
      }, 0);
      return () => clearTimeout(id);
    }
    if (
      view.type === "loading" &&
      pairingQuery.isError &&
      pendingQueryRef.current === mainDishQuery
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate: react to external pairingQuery error
      setView({ type: "idle" });
    }
  }, [
    pairingQuery.data,
    pairingQuery.isFetching,
    pairingQuery.isError,
    view,
    mainDishQuery,
  ]);

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

  const handleCameraCapture = useCallback(
    async (imageBase64: string) => {
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
          setRecognitionError(true);
          setView({ type: "idle" });
          clearTimeout(recognitionTimerRef.current);
          recognitionTimerRef.current = setTimeout(
            () => setRecognitionError(false),
            4000,
          );
        }
      } catch {
        setRecognitionError(true);
        setView({ type: "idle" });
        clearTimeout(recognitionTimerRef.current);
        recognitionTimerRef.current = setTimeout(
          () => setRecognitionError(false),
          4000,
        );
      }
    },
    [recognitionMutation],
  );

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
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
    >
      {/* Pull-to-refresh indicator — W22b animation #8: bird-mascot
          eyelid blink replaces the bare chevron. Eyes close as the
          pull approaches threshold; on trigger they open wide. The
          owl is the same glyph as the header mascot — visual continuity. */}
      {pullState.pulling && (
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-150"
          style={{ height: pullState.progress * 48 }}
        >
          <div
            className="flex items-center gap-2 text-xs font-medium text-[var(--nourish-subtext)]"
            style={{ opacity: pullState.progress }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 64 44"
              fill="none"
              aria-hidden
            >
              {/* Head */}
              <circle cx="32" cy="26" r="14" fill="var(--nourish-green)" />
              {/* Eye whites */}
              <circle cx="26" cy="24" r="3.5" fill="white" />
              <circle cx="38" cy="24" r="3.5" fill="white" />
              {/* Pupils — open when triggered, otherwise scale by progress */}
              <circle
                cx="27"
                cy="23.5"
                r={
                  pullState.triggered
                    ? 1.8
                    : 1.8 * (1 - pullState.progress * 0.6)
                }
                fill="#0D0D0D"
                style={{ transition: "r 0.12s ease" }}
              />
              <circle
                cx="39"
                cy="23.5"
                r={
                  pullState.triggered
                    ? 1.8
                    : 1.8 * (1 - pullState.progress * 0.6)
                }
                fill="#0D0D0D"
                style={{ transition: "r 0.12s ease" }}
              />
              {/* Eyelids that drop down with the pull progress */}
              <rect
                x="22.5"
                y={20.5 + pullState.progress * 4}
                width="7"
                height={pullState.triggered ? 0 : 4 * pullState.progress}
                rx="1"
                fill="var(--nourish-green)"
                style={{ transition: "height 0.12s ease" }}
              />
              <rect
                x="34.5"
                y={20.5 + pullState.progress * 4}
                width="7"
                height={pullState.triggered ? 0 : 4 * pullState.progress}
                rx="1"
                fill="var(--nourish-green)"
                style={{ transition: "height 0.12s ease" }}
              />
              {/* Beak */}
              <path d="M30 29 L32 33 L34 29" fill="var(--nourish-gold)" />
              {/* Chef hat */}
              <ellipse cx="32" cy="14" rx="11" ry="4.5" fill="white" />
              <rect x="25" y="9" width="14" height="7" rx="2" fill="white" />
              <circle cx="32" cy="8" r="3.5" fill="white" />
            </svg>
            {pullState.triggered ? "Release to refresh" : "Pull to refresh"}
          </div>
        </div>
      )}

      {/* Header  -  Sous + streak chip + bird.
          Wrapped in HeadroomHeader so the brand bar hides on
          scroll-down + reappears on scroll-up — matches Headspace
          / Apple Music / NYT Cooking pattern. The bottom tab bar
          stays sticky so navigation isn't lost when the top hides. */}
      <HeadroomHeader>
        <header className="page-x border-b border-[var(--nourish-border-soft)] bg-white py-2.5">
          <div className="mx-auto flex max-w-md items-center justify-between">
            {/* Brand + the ONE cadence signal: the streak flame. The old
                "Day 4 of cooking" welcome line was a second copy of the same
                number — removed. (see planning.md "Today Simplicity Budget") */}
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
                Sous
              </h1>
              <StreakCounter streak={stats.currentStreak} />
            </div>
            {/* Owl mascot  -  profile entry point. */}
            <OwlAvatar onClick={() => setShowProfileSettings(true)} />
          </div>
        </header>
      </HeadroomHeader>

      {/* Main content */}
      <main className="page-x mx-auto max-w-md pt-4 pb-24 space-y-5">
        {/* Primary craving trigger  -  search bar */}
        <CravingSearchBar onClick={handleOpenSearch} />

        {/* Phase 4 — first-run nudge pointing at the craving search (self-clearing). */}
        <FirstRunCoachmark />

        {/* Today's Quest  -  the meal IS the screen. It renders FIRST, right
            under the search, so the one thing the user opened the app for is
            never buried under engagement nudges. (Sous Test + meal-first; see
            planning.md "Today Simplicity Budget".) */}
        <QuestCard
          key={questKey}
          userPreferences={effectivePreferences}
          cookHistory={stats}
          cookSessions={completedSessions}
        />

        {/* Contextual surfaces below the hero — kept ONLY where each expresses
            a DISTINCT intent the hero can't: a commitment you made (Tonight),
            your scheduled plan (TodayPlannedSlot), and who's eating
            (WhosAtTable). Each is conditional and stays quiet by default.

            REMOVED as redundant (rule 13 — the QuestCard hero, with its own
            swipe-stack, IS the meal-suggestion surface; don't keep copies):
            RepeatCook / CookAgain / DailyNovelty were three more "here's a meal
            to cook" entry points. Earlier removed: welcome line + cook-rhythm +
            weekly-rhythm (cadence = the streak) and the eco stat chip. */}
        <TonightChip mode="banner-only" />
        <TodayPlannedSlot />
        <WhosAtTable />

        {/* Phase 4 — "your plate today" ring once anything is logged (null until
            then; the empty state is the first-run invitation on the diary). */}
        <TodayEatingCard />

        {/* Tiny, deliberately unassuming "more options" entry point.
            Everything secondary (tonight commit, cook-for-two, rescue fridge,
            games, personalize) lives one tap away in the drawer. */}
        <div className="flex justify-center pt-1">
          <motion.button
            type="button"
            onClick={() => setShowMoreOptions(true)}
            whileTap={{ scale: 0.96 }}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-[var(--nourish-subtext)] transition-colors hover:text-[var(--nourish-green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
            aria-label="Open more options"
          >
            <MoreHorizontal size={13} strokeWidth={2} />
            More options
          </motion.button>
        </div>

        {/* W47 — one-tap nutrition goal, shown once (renders null after). */}
        <NutritionGoalCard />

        {/* Friends social feed  -  below fold, horizontal-scroll social proof */}
        <FriendsStrip
          sessions={completedSessions}
          onDishSelect={(dishName) => {
            setShowSearch(true);
            handleTextSubmit(dishName);
          }}
        />
      </main>

      <MoreOptionsSheet
        open={showMoreOptions}
        onClose={() => setShowMoreOptions(false)}
        onRescueFridge={handleRescueFridge}
        onPlayGame={() => router.push("/games")}
        onPersonalize={quizDone ? () => setShowCoachQuiz(true) : undefined}
        onEatOut={() => router.push("/eat-out")}
      />

      {/* Profile & settings — opened by tapping the owl mascot. Holds the
          Parent Mode toggle + age band picker. NOT a tab. */}
      <ProfileSettingsSheet
        open={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
      />

      {/* Search popout  -  slides up from bottom */}
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

        <AnimatePresence mode="wait">
          {/* Correction chips after photo recognition */}
          {view.type === "correction" && (
            <motion.div
              key="correction-chips"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CorrectionChips
                dishName={view.dishName}
                confidence={view.confidence}
                alternates={view.alternates}
                onConfirm={handleCorrectionConfirm}
                onCustom={() => setView({ type: "idle" })}
              />
            </motion.div>
          )}

          {/* Recognition failure feedback */}
          {recognitionError && view.type === "idle" && (
            <motion.div
              key="recognition-error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-center mb-3"
            >
              <p className="text-sm text-amber-700">
                Couldn&apos;t identify the dish from the photo. Try typing it
                instead.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

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

            {/* Results  -  no sides returned */}
            {view.type === "results" &&
              pairingQuery.data?.success &&
              pairingQuery.data.sides.length === 0 && (
                <div className="rounded-xl border border-neutral-100 bg-white p-6 text-center space-y-3">
                  <SearchX
                    size={28}
                    className="text-[var(--nourish-subtext)] mx-auto"
                  />
                  <p className="text-sm font-semibold text-[var(--nourish-dark)]">
                    Hmm, we couldn&apos;t find a match
                  </p>
                  <p className="text-xs text-[var(--nourish-subtext)]">
                    Try a different craving - like &ldquo;pasta&rdquo;,
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

                    if (sides.length === 1) {
                      handleCookThis(sides[0]);
                      return;
                    }

                    const queryData = pairingQuery.data;
                    const mealSlug =
                      queryData && "resolvedMealSlug" in queryData
                        ? (queryData.resolvedMealSlug as string | null)
                        : null;

                    const guidedSides = sides.filter((s) => s.hasGuidedCook);

                    if (guidedSides.length >= 2) {
                      const sideSlugs = guidedSides
                        .map((s) => s.slug)
                        .join(",");
                      setShowSearch(false);
                      router.push(
                        mealSlug
                          ? `/cook/combined?main=${encodeURIComponent(mealSlug)}&sides=${encodeURIComponent(sideSlugs)}`
                          : `/cook/combined?sides=${encodeURIComponent(sideSlugs)}`,
                      );
                    } else if (mealSlug && guidedSides.length >= 1) {
                      const sideSlugs = guidedSides
                        .map((s) => s.slug)
                        .join(",");
                      setShowSearch(false);
                      router.push(
                        `/cook/combined?main=${encodeURIComponent(mealSlug)}&sides=${encodeURIComponent(sideSlugs)}`,
                      );
                    } else {
                      handleCookThis(guidedSides[0] ?? sides[0]);
                    }
                  }}
                  onReroll={handleReroll}
                  isRerolling={pairingQuery.isFetching}
                  pantryOnHand={
                    pantryItems.length > 0 ? pantryItems : undefined
                  }
                  recentCookSlugs={
                    recentCookSlugs.length > 0 ? recentCookSlugs : undefined
                  }
                  dayDeficits={dayDeficits}
                />
              )}

            {/* Culinary Therapeutics evidence strips — below the results,
                renders null until founder gate G1 (byte-identical today). */}
            {view.type === "results" &&
              pairingQuery.data?.success &&
              pairingQuery.data.sides.length > 0 && (
                <TherapeuticEvidence className="mt-4" />
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

      {/* Coach onboarding quiz  -  full-screen overlay */}
      <AnimatePresence>
        {showCoachQuiz && (
          <CoachQuiz
            onClose={() => {
              // Mark as done even if closed early so it doesn't re-appear.
              // Also set component state so "Personalize" hides immediately
              // (the deferred localStorage effect only runs once on mount).
              try {
                localStorage.setItem("sous-coach-quiz-done", "true");
              } catch {
                // localStorage unavailable
              }
              setQuizDone(true);
              setShowCoachQuiz(false);
            }}
            onComplete={handleCoachQuizComplete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
