"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import {
  getRandomOrigins,
  regions,
  type CuisineOrigin,
} from "@/data/games/cuisine-compass-data";
import { useGameScores } from "@/lib/hooks/use-game-scores";
import { useXPSystem, XP_AWARDS } from "@/lib/hooks/use-xp-system";
import { cn } from "@/lib/utils/cn";

const GAME_ID = "cuisine-compass";
const ROUNDS = 8;

export default function CuisineCompassGame() {
  const router = useRouter();
  const { recordScore } = useGameScores();
  const { awardXP } = useXPSystem();

  const [dishes] = useState(() => getRandomOrigins(ROUNDS));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    answer: string;
    fact: string;
  } | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const currentDish: CuisineOrigin | undefined = dishes[currentIdx];

  const handleRegionSelect = useCallback(
    (regionName: string) => {
      if (!currentDish || feedback) return;

      const correct = currentDish.region === regionName;
      const points = correct ? 100 : 0;
      setScore((prev) => prev + points);
      setFeedback({
        correct,
        answer: `${currentDish.country} (${currentDish.region})`,
        fact: currentDish.funFact,
      });
    },
    [currentDish, feedback],
  );

  const handleNext = useCallback(() => {
    if (currentIdx >= dishes.length - 1) {
      setGameOver(true);
      recordScore(GAME_ID, score);
      if (score > 0) awardXP("game_win", XP_AWARDS.GAME_WIN);
    } else {
      setCurrentIdx((prev) => prev + 1);
      setFeedback(null);
    }
  }, [currentIdx, dishes.length, score, recordScore, awardXP]);

  if (gameOver) {
    return (
      <motion.div
        className="min-h-dvh bg-[var(--nourish-cream)] flex flex-col items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lg space-y-5"
        >
          <span className="block text-5xl">🗺️</span>
          <div>
            <p className="text-2xl font-bold text-[var(--nourish-dark)] tabular-nums">
              {score}/{ROUNDS * 100} pts
            </p>
            <p className="text-sm text-[var(--nourish-subtext)] mt-1">
              {score >= 600
                ? "Geography Genius!"
                : score >= 400
                  ? "World Traveler!"
                  : "Keep Exploring!"}
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                setCurrentIdx(0);
                setScore(0);
                setFeedback(null);
                setGameOver(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nourish-green)] py-3.5 text-sm font-semibold text-white"
              type="button"
            >
              <RotateCcw size={16} />
              Play Again
            </button>
            <button
              onClick={() => router.push("/games")}
              className="w-full rounded-xl border border-neutral-200 py-3 text-sm font-medium text-[var(--nourish-subtext)]"
              type="button"
            >
              Back to Arcade
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-dvh bg-[var(--nourish-cream)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <motion.button
            onClick={() => router.push("/games")}
            whileTap={{ scale: 0.88 }}
            className="flex items-center justify-center rounded-lg min-h-11 min-w-11 text-[var(--nourish-subtext)]"
            type="button"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <p className="text-xs font-medium text-[var(--nourish-subtext)]">
            {currentIdx + 1}/{ROUNDS}
          </p>
          <span className="text-sm font-bold text-[var(--nourish-dark)] tabular-nums">
            {score} pts
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6 space-y-5">
        {/* Dish to guess */}
        {currentDish && (
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white border border-neutral-100 p-6 text-center shadow-sm"
          >
            <span className="text-4xl block mb-2">{currentDish.emoji}</span>
            <h2 className="font-serif text-xl text-[var(--nourish-dark)]">
              {currentDish.dishName}
            </h2>
            <p className="text-xs text-[var(--nourish-subtext)] mt-1">
              Where does this dish come from?
            </p>
          </motion.div>
        )}

        {/* Region buttons */}
        <div className="grid grid-cols-2 gap-2">
          {regions.map((region) => (
            <motion.button
              key={region.name}
              whileTap={!feedback ? { scale: 0.95 } : undefined}
              onClick={() => handleRegionSelect(region.name)}
              disabled={!!feedback}
              className={cn(
                "rounded-xl border p-4 text-center transition-colors",
                feedback && currentDish?.region === region.name
                  ? "border-green-400 bg-green-50"
                  : feedback &&
                      feedback.answer.includes(region.name) &&
                      !feedback.correct
                    ? "border-green-400 bg-green-50"
                    : feedback
                      ? "border-neutral-200 bg-neutral-50 opacity-50"
                      : "border-neutral-200 bg-white hover:border-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/5",
              )}
              type="button"
            >
              <span className="text-2xl block mb-1">{region.emoji}</span>
              <span className="text-xs font-medium text-[var(--nourish-dark)]">
                {region.name}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "rounded-2xl p-5 text-center space-y-2",
                feedback.correct
                  ? "bg-[var(--nourish-green)]/10 border border-[var(--nourish-green)]/20"
                  : "bg-amber-50 border border-amber-200/50",
              )}
            >
              <p
                className={cn(
                  "text-sm font-bold",
                  feedback.correct
                    ? "text-[var(--nourish-green)]"
                    : "text-amber-700",
                )}
              >
                {feedback.correct
                  ? "Correct! 🎉"
                  : `It's from ${feedback.answer}`}
              </p>
              <p className="text-xs text-[var(--nourish-subtext)]">
                {feedback.fact}
              </p>
              <button
                onClick={handleNext}
                className="mt-2 rounded-xl bg-[var(--nourish-green)] px-6 py-2.5 text-sm font-semibold text-white"
                type="button"
              >
                {currentIdx < dishes.length - 1 ? "Next dish →" : "See results"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
