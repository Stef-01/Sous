"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { StreakCounter } from "@/components/today/streak-counter";
import { BirdMascot } from "@/components/today/bird-mascot";
import { QuestCard } from "@/components/today/quest-card";
import { FallbackActions } from "@/components/today/fallback-actions";
import { FriendsStrip } from "@/components/today/friends-strip";
import { SearchPopout } from "@/components/today/search-popout";
import { TextPrompt } from "@/components/today/text-prompt";
import { ResultStack } from "@/components/today/result-stack";
import { CameraInput } from "@/components/today/camera-input";
import { CorrectionChips } from "@/components/today/correction-chips";
import ShimmerPlaceholder from "@/components/states/ShimmerPlaceholder";
import { trpc } from "@/lib/trpc/client";

type ViewState =
  | { type: "idle" }
  | { type: "loading"; mainDish: string }
  | { type: "results"; mainDish: string }
  | { type: "camera" }
  | { type: "recognition"; imageBase64: string }
  | { type: "correction"; dishName: string; confidence: number; alternates: string[]; cuisine: string };

export default function TodayPage() {
  const [view, setView] = useState<ViewState>({ type: "idle" });
  const [showSearch, setShowSearch] = useState(false);
  const [mainDishQuery, setMainDishQuery] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const router = useRouter();

  // Track which query we're waiting for to prevent stale data transitions
  const pendingQueryRef = useRef<string>("");

  // tRPC query
  const pairingQuery = trpc.pairing.suggest.useQuery(
    { mainDish: mainDishQuery, inputMode: "text" },
    {
      enabled: !!mainDishQuery && (view.type === "loading" || view.type === "results"),
    }
  );

  const recognitionMutation = trpc.recognition.identify.useMutation();

  // Transition from loading → results when query resolves for the CURRENT query
  useEffect(() => {
    if (
      view.type === "loading" &&
      pairingQuery.data?.success &&
      !pairingQuery.isFetching &&
      pendingQueryRef.current === mainDishQuery
    ) {
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
      // Recognition failed — fall back to text input
      setView({ type: "idle" });
    }
  }, [recognitionMutation]);

  const handleCorrectionConfirm = useCallback(
    (confirmedDish: string) => {
      pendingQueryRef.current = confirmedDish;
      setMainDishQuery(confirmedDish);
      setView({ type: "loading", mainDish: confirmedDish });
    },
    []
  );

  const handleCookThis = useCallback((side: { slug: string }) => {
    setShowSearch(false);
    router.push(`/cook/${side.slug}`);
  }, [router]);

  const handleReroll = useCallback(() => {
    if (mainDishQuery) {
      const busted = mainDishQuery.trim() + ` (${Date.now()})`;
      pendingQueryRef.current = busted;
      setMainDishQuery(busted);
      setView({ type: "loading", mainDish: mainDishQuery.trim() });
    }
  }, [mainDishQuery]);

  const handleRescueFridge = useCallback(() => {
    setShowSearch(true);
    handleTextSubmit("simple side with basic pantry ingredients");
  }, [handleTextSubmit]);

  // ── Render ────────────────────────────────────────────

  return (
    <div className="min-h-full bg-[var(--nourish-cream)]">
      {/* Header — Sous + streak chip + bird */}
      <header className="border-b border-neutral-100/80 bg-white px-4 py-2">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">Sous</h1>
            <StreakCounter streak={12} />
          </div>
          {/* Bird icon — header mascot */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--nourish-green)]/10 border border-[var(--nourish-green)]/10">
            <svg
              width="18"
              height="18"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Sous"
            >
              <ellipse cx="32" cy="36" rx="18" ry="16" fill="var(--nourish-green)" />
              <circle cx="32" cy="22" r="12" fill="var(--nourish-green)" />
              <circle cx="27" cy="20" r="2.5" fill="white" />
              <circle cx="37" cy="20" r="2.5" fill="white" />
              <circle cx="28" cy="19.5" r="1.2" fill="#1a1a1a" />
              <circle cx="38" cy="19.5" r="1.2" fill="#1a1a1a" />
              <path d="M30 24 L32 27 L34 24" fill="#D4A84B" />
              <ellipse cx="32" cy="12" rx="9" ry="3.5" fill="white" />
              <rect x="27" y="9" width="10" height="5" rx="2" fill="white" />
              <circle cx="32" cy="8" r="2.5" fill="white" />
            </svg>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-md px-4 pt-3 pb-24">
        {/* Primary craving trigger — bird mascot with speech bubble */}
        <div className="flex items-center justify-center mb-3">
          <BirdMascot onCravingClick={handleOpenSearch} />
        </div>

        {/* Today's Quest — swipeable card stack */}
        <div className="mb-2">
          <QuestCard />
        </div>

        {/* "Too tired?" + action chips — tightly grouped as secondary options */}
        <div className="space-y-2 mb-3">
          <p className="text-center">
            <button
              onClick={() => {
                setShowSearch(true);
                handleTextSubmit("something quick and easy, I'm tired");
              }}
              className="text-[11px] text-[var(--nourish-subtext)] hover:text-[var(--nourish-green)] transition-colors"
              type="button"
            >
              Too tired?{" "}
              <span className="underline underline-offset-2 decoration-[var(--nourish-green)]/30">
                Make something in 15 min
              </span>
            </button>
          </p>
          <FallbackActions onRescueFridge={handleRescueFridge} />
        </div>

        {/* Subtle divider */}
        <div className="border-t border-neutral-100 mb-3" />

        {/* Friends cooked recently */}
        <FriendsStrip />
      </main>

      {/* Search popout — slides up from bottom */}
      <SearchPopout isOpen={showSearch} onClose={handleCloseSearch}>
        <AnimatePresence mode="wait">
          {/* Camera overlay */}
          {(view.type === "camera" || view.type === "recognition") && (
            <CameraInput
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

        {/* Search input + results */}
        {(view.type === "idle" || view.type === "loading" || view.type === "results") && (
          <>
            <TextPrompt
              key={resetKey}
              onSubmit={handleTextSubmit}
              onCameraClick={handleCameraOpen}
              isLoading={view.type === "loading" || pairingQuery.isFetching}
            />

            {/* Loading state */}
            {view.type === "loading" && (
              <div className="space-y-3">
                <p className="text-sm text-center text-[var(--nourish-subtext)]">
                  Finding your sides...
                </p>
                <ShimmerPlaceholder />
              </div>
            )}

            {/* Results */}
            {view.type === "results" && pairingQuery.data?.success && (
              <ResultStack
                mainDish={view.mainDish}
                sides={pairingQuery.data.sides}
                onCookThis={handleCookThis}
                onReroll={handleReroll}
              />
            )}

            {/* Error state */}
            {pairingQuery.error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
                <p className="text-sm text-red-600">
                  {pairingQuery.error.message || "Something went wrong. Try again?"}
                </p>
              </div>
            )}
          </>
        )}
      </SearchPopout>
    </div>
  );
}
