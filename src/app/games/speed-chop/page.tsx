"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, RotateCcw, Heart } from "lucide-react";
import { speedChopRounds } from "@/data/games/speed-chop-data";
import { useGameScores } from "@/lib/hooks/use-game-scores";
import { useXPSystem, XP_AWARDS } from "@/lib/hooks/use-xp-system";
import { cn } from "@/lib/utils/cn";

const GAME_ID = "speed-chop";
const INITIAL_LIVES = 3;
const ITEM_INTERVAL_START = 2500;
const ITEM_INTERVAL_MIN = 1200;

export default function SpeedChopGame() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { recordScore } = useGameScores();
  const { awardXP } = useXPSystem();

  const [roundIdx, setRoundIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [funFact, setFunFact] = useState<string | null>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">(
    "menu",
  );
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scoreRef = useRef(score);
  const recordScoreRef = useRef(recordScore);
  const awardXPRef = useRef(awardXP);
  const advanceItemRef = useRef<() => void>(() => {});
  const intervalRef = useRef(
    Math.max(ITEM_INTERVAL_MIN, ITEM_INTERVAL_START - score * 20),
  );

  const round = speedChopRounds[roundIdx % speedChopRounds.length];
  const currentItem = round.items[itemIdx];
  const interval = Math.max(
    ITEM_INTERVAL_MIN,
    ITEM_INTERVAL_START - score * 20,
  );

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const advanceItem = useCallback(() => {
    if (itemIdx >= round.items.length - 1) {
      setRoundIdx((prev) => prev + 1);
      setItemIdx(0);
    } else {
      setItemIdx((prev) => prev + 1);
    }
  }, [itemIdx, round.items.length]);

  useEffect(() => {
    scoreRef.current = score;
    recordScoreRef.current = recordScore;
    awardXPRef.current = awardXP;
    intervalRef.current = interval;
    advanceItemRef.current = advanceItem;
  }, [score, recordScore, awardXP, interval, advanceItem]);

  useEffect(() => {
    if (gameState !== "playing" || !currentItem) return;
    const delay = intervalRef.current;
    timerRef.current = setTimeout(() => {
      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setGameState("gameover");
          const s = scoreRef.current;
          recordScoreRef.current(GAME_ID, s);
          if (s > 0) awardXPRef.current("game_win", XP_AWARDS.GAME_WIN);
        }
        return next;
      });
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        advanceItemRef.current();
      }, 500);
    }, delay);
    return () => clearTimeout(timerRef.current);
  }, [gameState, itemIdx, roundIdx, currentItem]);

  const handleSwipe = useCallback(
    (side: "left" | "right") => {
      if (gameState !== "playing" || !currentItem) return;
      clearTimeout(timerRef.current);

      if (currentItem.correctSide === side) {
        const points = 10 + streak * 5;
        setScore((prev) => prev + points);
        setStreak((prev) => prev + 1);
        setFeedback("correct");
        if (currentItem.funFact) {
          setFunFact(currentItem.funFact);
          setTimeout(() => setFunFact(null), 1500);
        }
      } else {
        setStreak(0);
        setFeedback("wrong");
        setLives((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            setGameState("gameover");
            recordScore(GAME_ID, score);
            if (score > 0) awardXP("game_win", XP_AWARDS.GAME_WIN);
          }
          return next;
        });
      }

      setTimeout(() => {
        setFeedback(null);
        if (lives > 1 || currentItem.correctSide === side) {
          advanceItem();
        }
      }, 400);
    },
    [
      gameState,
      currentItem,
      streak,
      lives,
      score,
      advanceItem,
      recordScore,
      awardXP,
    ],
  );

  if (gameState === "menu") {
    return (
      <motion.div
        className="min-h-dvh bg-[var(--nourish-cream)] flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <header className="border-b border-neutral-100 bg-white/95 px-4 py-3">
          <div className="mx-auto flex max-w-md items-center gap-3">
            <motion.button
              onClick={() => router.push("/games")}
              whileTap={{ scale: 0.88 }}
              className="flex items-center justify-center rounded-lg min-h-11 min-w-11 text-[var(--nourish-subtext)]"
              type="button"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <h1 className="font-serif text-lg text-[var(--nourish-dark)]">
              Speed Chop
            </h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <span className="text-5xl">🔪</span>
          <p className="text-sm text-[var(--nourish-subtext)] text-center max-w-xs">
            Swipe ingredients left or right into the correct category before
            time runs out!
          </p>
          <button
            onClick={() => setGameState("playing")}
            className="rounded-xl bg-[var(--nourish-green)] px-8 py-3.5 text-sm font-semibold text-white"
            type="button"
          >
            Start Chopping!
          </button>
        </main>
      </motion.div>
    );
  }

  if (gameState === "gameover") {
    return (
      <motion.div
        className="min-h-dvh bg-[var(--nourish-cream)] flex flex-col items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lg space-y-5"
        >
          <span className="block text-5xl">🔪</span>
          <div>
            <p className="text-2xl font-bold text-[var(--nourish-dark)] tabular-nums">
              {score} pts
            </p>
            <p className="text-sm text-[var(--nourish-subtext)] mt-1">
              {score >= 200
                ? "Master Chopper!"
                : score >= 100
                  ? "Quick Hands!"
                  : "Keep practicing!"}
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                setRoundIdx(0);
                setItemIdx(0);
                setLives(INITIAL_LIVES);
                setScore(0);
                setStreak(0);
                setGameState("playing");
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
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2">
          <motion.button
            onClick={() => router.push("/games")}
            whileTap={{ scale: 0.88 }}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--nourish-subtext)]"
            type="button"
            aria-label="Back to Arcade"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex flex-col items-center">
            <p className="font-serif text-[14px] font-semibold text-[var(--nourish-dark)]">
              Speed Chop
            </p>
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--nourish-subtext)]">
              {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
                <Heart
                  key={i}
                  size={11}
                  className={cn(
                    i < lives
                      ? "fill-red-500 text-red-500"
                      : "text-neutral-200",
                  )}
                  aria-hidden
                />
              ))}
              <span className="sr-only">{lives} lives remaining</span>
            </p>
          </div>
          <span className="tabular-nums text-sm font-bold text-[var(--nourish-dark)]">
            {score}
          </span>
        </div>
        <p className="mx-auto mt-2 max-w-md text-center text-[12px] font-medium text-[var(--nourish-subtext)]">
          {round.question}
        </p>
      </header>

      <main className="mx-auto max-w-md px-4 py-8 flex flex-col items-center gap-6">
        {/* Category labels */}
        <div className="flex w-full justify-between px-4">
          <span className="text-sm font-bold text-[var(--nourish-green)]">
            ← {round.leftLabel}
          </span>
          <span className="text-sm font-bold text-blue-600">
            {round.rightLabel} →
          </span>
        </div>

        {/* Current item */}
        <AnimatePresence mode="wait">
          {currentItem && (
            <motion.div
              key={`${roundIdx}-${itemIdx}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "flex flex-col items-center gap-3 rounded-3xl border-2 bg-white p-8 shadow-lg w-48",
                feedback === "correct" && "border-green-400 bg-green-50",
                feedback === "wrong" && "border-red-400 bg-red-50",
                !feedback && "border-neutral-200",
              )}
            >
              <span className="text-5xl">{currentItem.emoji}</span>
              <span className="text-lg font-semibold text-[var(--nourish-dark)]">
                {currentItem.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fun fact */}
        <AnimatePresence>
          {funFact && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2"
            >
              💡 {funFact}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Streak indicator */}
        {streak > 2 && (
          <p className="text-xs text-amber-600 font-bold">
            🔥 {streak} streak! (+{streak * 5} bonus)
          </p>
        )}

        {/* Swipe buttons */}
        <div className="flex gap-4 w-full max-w-xs">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe("left")}
            className="flex-1 rounded-xl bg-[var(--nourish-green)] py-4 text-sm font-bold text-white"
            type="button"
          >
            ← {round.leftLabel}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe("right")}
            className="flex-1 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white"
            type="button"
          >
            {round.rightLabel} →
          </motion.button>
        </div>
      </main>
    </motion.div>
  );
}
