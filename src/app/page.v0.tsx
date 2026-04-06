"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import SavedPairingsModal from "@/components/layout/SavedPairingsModal";
import SearchInput from "@/components/search/SearchInput";
import EmptyState from "@/components/states/EmptyState";
import ShimmerPlaceholder from "@/components/states/ShimmerPlaceholder";
import ErrorMessage from "@/components/states/ErrorMessage";
import ResultsStage from "@/components/results/ResultsStage";
import SharePlateModal from "@/components/results/SharePlateModal";
import HeatmapModal from "@/components/heatmap/HeatmapModal";
import SpinWheel from "@/components/layout/SpinWheel";
import { useMealSearch } from "@/hooks/useMealSearch";
import { usePairing } from "@/hooks/usePairing";
import { useSavedPairings } from "@/hooks/useSavedPairings";
import { getPlateAppraisal } from "@/lib/plateAppraisal";

function useVerifiedToggle() {
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sous-verified");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage on mount
    if (stored === "1") setVerifiedOnly(true);
  }, []);

  const toggle = useCallback(() => {
    setVerifiedOnly((prev) => {
      const next = !prev;
      localStorage.setItem("sous-verified", next ? "1" : "0");
      return next;
    });
  }, []);

  return { verifiedOnly, toggle };
}

export default function Home() {
  const {
    query,
    setQuery,
    submit,
    status,
    meal,
    sides,
    setSides,
    errorMessage,
    suggestions,
    nextOffset,
  } = useMealSearch();

  const { swap, resetUsed, setRankOffset } = usePairing();
  const { verifiedOnly, toggle: toggleVerified } = useVerifiedToggle();

  // Sync initial rank offset from API response to pairing hook
  const lastOffsetRef = useRef(0);
  useEffect(() => {
    if (nextOffset !== lastOffsetRef.current) {
      setRankOffset(nextOffset);
      lastOffsetRef.current = nextOffset;
    }
  }, [nextOffset, setRankOffset]);
  const { pairings, removePairing, isSaved } = useSavedPairings();
  const [showSaved, setShowSaved] = useState(false);
  const [showPlateMethod, setShowPlateMethod] = useState(false);
  const [showSharePlate, setShowSharePlate] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    resetUsed();
    submit(suggestion, verifiedOnly);
  };

  const handleSubmit = (searchQuery?: string) => {
    resetUsed();
    setShowPlateMethod(false);
    submit(searchQuery, verifiedOnly);
  };

  const handleSwap = (index: number) => {
    if (meal) {
      const newSides = swap(meal, sides, index);
      setSides(newSides);
    }
  };

  const handleShare = () => {
    if (meal && sides.length > 0) {
      setShowSharePlate(true);
    }
  };

  const handleEvaluate = () => {
    setShowPlateMethod((prev) => !prev);
  };

  const handleLoadPairing = (pairing: typeof pairings[number]) => {
    setShowSaved(false);
    setQuery(pairing.mealName);
    resetUsed();
    submit(pairing.mealName, verifiedOnly);
  };

  const hasResults = status === "success" && meal && sides.length > 0;
  const currentIsSaved = hasResults
    ? isSaved(meal.name, sides.map((s) => ({ name: s.name })))
    : false;

  const appraisal = useMemo(() => {
    if (!hasResults) return null;
    return getPlateAppraisal({ sides, meal });
  }, [hasResults, sides, meal]);

  return (
    <div className="h-dvh bg-nourish-cream flex flex-col overflow-hidden">
      <Navbar
        savedCount={pairings.length}
        onSavedClick={() => setShowSaved(true)}
        onHeatmapClick={() => setShowHeatmap(true)}
        verifiedOnly={verifiedOnly}
        onVerifiedToggle={toggleVerified}
        onLogoClick={() => setShowSpinWheel(true)}
      />
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-16 pb-4 w-full min-h-0">
        <AnimatePresence>
          {!showPlateMethod && (
            <motion.h1
              className={`text-nourish-dark font-serif text-center max-w-2xl ${hasResults
                ? "text-base md:text-lg lg:text-xl mb-2"
                : "text-xl md:text-2xl lg:text-3xl mb-3"
                }`}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.06, delayChildren: 0.1 },
                },
              }}
            >
              {"Find the perfect sides for your favourite meal.".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.3em]"
                  variants={{
                    hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        mass: 0.8,
                      },
                    },
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>
          )}
        </AnimatePresence>

        <SearchInput
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          disabled={status === "loading"}
          onSave={hasResults ? handleShare : undefined}
          isSaved={currentIsSaved}
          verifiedOnly={verifiedOnly}
          onEvaluate={hasResults ? handleEvaluate : undefined}
          currentMealName={hasResults ? meal.name : undefined}
          isEvaluating={showPlateMethod}
          appraisalSentence={appraisal?.sentence}
          appraisalTone={appraisal?.tone}
        />

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key={`idle-${verifiedOnly}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <EmptyState onSelect={handleSuggestionSelect} verifiedOnly={verifiedOnly} />
            </motion.div>
          )}

          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ShimmerPlaceholder />
            </motion.div>
          )}

          {hasResults && (
            <motion.div
              key={`success-${meal.id}`}
              className="flex-1 min-h-0 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <ResultsStage
                meal={meal}
                sides={sides}
                onSwap={handleSwap}
                showPlateMethod={showPlateMethod}
                onClosePlate={() => setShowPlateMethod(false)}
                appraisal={appraisal}
              />
            </motion.div>
          )}

          {status === "error" && errorMessage && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <ErrorMessage
                message={errorMessage}
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SharePlateModal
        open={showSharePlate}
        onClose={() => setShowSharePlate(false)}
        meal={hasResults ? meal : null}
        sides={hasResults ? sides : []}
      />

      <SavedPairingsModal
        open={showSaved}
        onClose={() => setShowSaved(false)}
        pairings={pairings}
        onSelect={handleLoadPairing}
        onRemove={removePairing}
      />

      <HeatmapModal
        open={showHeatmap}
        onClose={() => setShowHeatmap(false)}
      />

      <SpinWheel
        open={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
        onSelect={handleSuggestionSelect}
        verifiedOnly={verifiedOnly}
      />
    </div>
  );
}
