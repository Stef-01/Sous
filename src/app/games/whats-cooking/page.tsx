"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { dishClues, type DishClue } from "@/data/games/whats-cooking-clues";
import { useGameScores } from "@/lib/hooks/use-game-scores";
import { useXPSystem, XP_AWARDS } from "@/lib/hooks/use-xp-system";
import { cn } from "@/lib/utils/cn";

const POINTS_PER_CLUE = [500, 400, 300, 200, 100];
const GAME_ID = "whats-cooking";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function fuzzyMatch(input: string, targets: string[]): boolean {
  const clean = input.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "");
  return targets.some((t) => {
    const target = t.toLowerCase();
    if (clean === target) return true;
    if (target.includes(clean) && clean.length >= 3) return true;
    // Levenshtein for typos
    if (clean.length >= 4 && levenshtein(clean, target) <= 2) return true;
    return false;
  });
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) matrix[i] = [i];
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return matrix[a.length][b.length];
}

export default function WhatsCookingGame() {
  const router = useRouter();
  const { recordScore } = useGameScores();
  const { awardXP } = useXPSystem();

  const [dishes] = useState(() => shuffleArray(dishClues).slice(0, 5));
  const [currentDishIdx, setCurrentDishIdx] = useState(0);
  const [revealedClues, setRevealedClues] = useState(1);
  const [guess, setGuess] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundResult, setRoundResult] = useState<
    "correct" | "wrong" | "revealed" | null
  >(null);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentDish: DishClue | undefined = dishes[currentDishIdx];
  const visibleClues = currentDish?.clues.slice(0, revealedClues) ?? [];

  useEffect(() => {
    if (!roundResult && inputRef.current) {
      inputRef.current.focus();
    }
  }, [roundResult, currentDishIdx]);

  const handleGuess = useCallback(() => {
    if (!currentDish || !guess.trim()) return;

    if (fuzzyMatch(guess, currentDish.acceptedAnswers)) {
      const points = POINTS_PER_CLUE[revealedClues - 1] ?? 100;
      setTotalScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setRoundResult("correct");
    } else {
      if (revealedClues < 5) {
        setRevealedClues((prev) => prev + 1);
        setRoundResult("wrong");
        setTimeout(() => setRoundResult(null), 800);
        setGuess("");
      } else {
        setStreak(0);
        setRoundResult("revealed");
      }
    }
  }, [currentDish, guess, revealedClues]);

  const handleNextRound = useCallback(() => {
    if (currentDishIdx >= dishes.length - 1) {
      setGameOver(true);
      recordScore(GAME_ID, totalScore);
      if (totalScore > 0) {
        awardXP("game_win", XP_AWARDS.GAME_WIN);
      }
    } else {
      setCurrentDishIdx((prev) => prev + 1);
      setRevealedClues(1);
      setGuess("");
      setRoundResult(null);
    }
  }, [
    currentDishIdx,
    dishes.length,
    totalScore,
    recordScore,
    awardXP,
  ]);

  const handlePlayAgain = useCallback(() => {
    setCurrentDishIdx(0);
    setRevealedClues(1);
    setGuess("");
    setTotalScore(0);
    setStreak(0);
    setRoundResult(null);
    setGameOver(false);
  }, []);

  if (gameOver) {
    return (
      <GameOverScreen
        score={totalScore}
        onPlayAgain={handlePlayAgain}
        onBack={() => router.push("/games")}
      />
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
            aria-label="Back to Arcade"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="text-center">
            <p className="text-xs font-medium text-[var(--nourish-subtext)]">
              Round {currentDishIdx + 1}/{dishes.length}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-[var(--nourish-dark)] tabular-nums">
              {totalScore}
            </span>
            {streak > 1 && (
              <span className="text-[10px] text-amber-600">
                🔥 {streak} streak
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6 space-y-4">
        {/* Clue cards */}
        <div className="space-y-2">
          <AnimatePresence>
            {visibleClues.map((clue, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 25,
                  delay: idx === revealedClues - 1 ? 0.1 : 0,
                }}
                className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-[var(--nourish-subtext)]">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-[var(--nourish-dark)] leading-relaxed italic">
                    &ldquo;{clue}&rdquo;
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Unrevealed clue placeholders */}
          {Array.from({ length: 5 - revealedClues }).map((_, idx) => (
            <div
              key={`placeholder-${idx}`}
              className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-300">
                  {revealedClues + idx + 1}
                </span>
                <p className="text-sm text-neutral-300">Next clue...</p>
              </div>
            </div>
          ))}
        </div>

        {/* Points indicator */}
        <div className="text-center">
          <span className="text-xs text-[var(--nourish-subtext)]">
            Guess now for{" "}
            <span className="font-bold text-[var(--nourish-green)]">
              {POINTS_PER_CLUE[revealedClues - 1] ?? 100} pts
            </span>
          </span>
        </div>

        {/* Result feedback */}
        <AnimatePresence>
          {roundResult === "correct" && currentDish && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-[var(--nourish-green)]/10 border border-[var(--nourish-green)]/25 p-5 text-center space-y-2"
            >
              <span className="text-4xl">{currentDish.emoji}</span>
              <p className="text-lg font-bold text-[var(--nourish-green)]">
                {currentDish.dishName}!
              </p>
              <p className="text-sm text-[var(--nourish-subtext)]">
                +{POINTS_PER_CLUE[revealedClues - 1] ?? 100} points
              </p>
              <button
                onClick={handleNextRound}
                className="mt-2 rounded-xl bg-[var(--nourish-green)] px-6 py-2.5 text-sm font-semibold text-white"
                type="button"
              >
                {currentDishIdx < dishes.length - 1
                  ? "Next dish →"
                  : "See results"}
              </button>
            </motion.div>
          )}

          {roundResult === "revealed" && currentDish && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-amber-50 border border-amber-200/50 p-5 text-center space-y-2"
            >
              <span className="text-4xl">{currentDish.emoji}</span>
              <p className="text-lg font-bold text-amber-700">
                It was {currentDish.dishName}!
              </p>
              <p className="text-sm text-[var(--nourish-subtext)]">
                Better luck next round
              </p>
              <button
                onClick={handleNextRound}
                className="mt-2 rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white"
                type="button"
              >
                {currentDishIdx < dishes.length - 1
                  ? "Next dish →"
                  : "See results"}
              </button>
            </motion.div>
          )}

          {roundResult === "wrong" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-xs text-red-500 font-medium">
                Not quite — here&apos;s another clue!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area — hidden when round result is showing */}
        {!roundResult && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                placeholder="Type your guess..."
                className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-[var(--nourish-dark)] placeholder:text-neutral-300 focus:outline-none focus:border-[var(--nourish-green)] focus:ring-1 focus:ring-[var(--nourish-green)]/20"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleGuess}
                disabled={!guess.trim()}
                className={cn(
                  "rounded-xl px-5 py-3 text-sm font-semibold text-white",
                  guess.trim()
                    ? "bg-[var(--nourish-green)]"
                    : "bg-neutral-300 cursor-not-allowed",
                )}
                type="button"
              >
                Guess
              </motion.button>
            </div>
          </div>
        )}
      </main>
    </motion.div>
  );
}

function GameOverScreen({
  score,
  onPlayAgain,
  onBack,
}: {
  score: number;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  const rating =
    score >= 2000
      ? "Culinary Genius!"
      : score >= 1500
        ? "Food Expert!"
        : score >= 1000
          ? "Flavor Scholar"
          : score >= 500
            ? "Curious Cook"
            : "Keep Learning!";

  return (
    <motion.div
      className="min-h-dvh bg-[var(--nourish-cream)] flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lg space-y-5"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 10,
            delay: 0.2,
          }}
          className="block text-5xl"
        >
          🏆
        </motion.span>
        <div>
          <p className="text-2xl font-bold text-[var(--nourish-dark)] tabular-nums">
            {score} pts
          </p>
          <p className="text-sm text-[var(--nourish-subtext)] mt-1">
            {rating}
          </p>
        </div>
        <div className="space-y-2 pt-2">
          <button
            onClick={onPlayAgain}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nourish-green)] py-3.5 text-sm font-semibold text-white"
            type="button"
          >
            <RotateCcw size={16} />
            Play Again
          </button>
          <button
            onClick={onBack}
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
