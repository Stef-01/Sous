"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { getRandomPairs, type FlavorPair } from "@/data/games/flavor-pairs-data";
import { useGameScores } from "@/lib/hooks/use-game-scores";
import { useXPSystem, XP_AWARDS } from "@/lib/hooks/use-xp-system";
import { cn } from "@/lib/utils/cn";

const GAME_ID = "flavor-pairs";
const PAIR_COUNT = 6;

interface CardState {
  id: string;
  pairId: number;
  name: string;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function buildCards(pairs: FlavorPair[]): CardState[] {
  const cards: CardState[] = [];
  pairs.forEach((pair, idx) => {
    cards.push({
      id: `${idx}-a`,
      pairId: idx,
      name: pair.a.name,
      emoji: pair.a.emoji,
      flipped: false,
      matched: false,
    });
    cards.push({
      id: `${idx}-b`,
      pairId: idx,
      name: pair.b.name,
      emoji: pair.b.emoji,
      flipped: false,
      matched: false,
    });
  });
  return cards.sort(() => Math.random() - 0.5);
}

export default function FlavorPairsGame() {
  const router = useRouter();
  const { recordScore } = useGameScores();
  const { awardXP } = useXPSystem();

  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard" | null
  >(null);
  const [pairs, setPairs] = useState<FlavorPair[]>([]);
  const [cards, setCards] = useState<CardState[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lastMatchWhy, setLastMatchWhy] = useState<string | null>(null);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    if (!startTime || gameOver) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, gameOver]);

  const startGame = useCallback(
    (diff: "easy" | "medium" | "hard") => {
      const gamePairs = getRandomPairs(PAIR_COUNT, diff);
      setPairs(gamePairs);
      setCards(buildCards(gamePairs));
      setDifficulty(diff);
      setFlippedIds([]);
      setMatchedPairs(0);
      setMoves(0);
      setStartTime(Date.now());
      setElapsed(0);
      setGameOver(false);
      setLastMatchWhy(null);
    },
    [],
  );

  const handleFlip = useCallback(
    (cardId: string) => {
      if (isCheckingRef.current) return;
      if (flippedIds.length >= 2) return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.flipped || card.matched) return;

      const newFlipped = [...flippedIds, cardId];
      setFlippedIds(newFlipped);
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, flipped: true } : c)),
      );

      if (newFlipped.length === 2) {
        isCheckingRef.current = true;
        setMoves((prev) => prev + 1);

        const [firstId, secondId] = newFlipped;
        const first = cards.find((c) => c.id === firstId)!;
        const second = cards.find((c) => c.id === secondId)!;

        if (first.pairId === second.pairId) {
          const pair = pairs[first.pairId];
          setLastMatchWhy(pair?.why ?? null);
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.pairId === first.pairId ? { ...c, matched: true } : c,
              ),
            );
            setFlippedIds([]);
            setMatchedPairs((prev) => {
              const newCount = prev + 1;
              if (newCount >= PAIR_COUNT) {
                setGameOver(true);
                const score = Math.max(
                  0,
                  1000 - (moves + 1) * 50 - elapsed * 5,
                );
                recordScore(GAME_ID, score);
                awardXP("game_win", XP_AWARDS.GAME_WIN);
              }
              return newCount;
            });
            isCheckingRef.current = false;
            setTimeout(() => setLastMatchWhy(null), 2000);
          }, 600);
        } else {
          setLastMatchWhy(null);
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                newFlipped.includes(c.id) ? { ...c, flipped: false } : c,
              ),
            );
            setFlippedIds([]);
            isCheckingRef.current = false;
          }, 800);
        }
      }
    },
    [flippedIds, cards, pairs, moves, elapsed, recordScore, awardXP],
  );

  if (!difficulty) {
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
              Flavor Pairs
            </h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <span className="text-5xl">🧩</span>
          <p className="text-sm text-[var(--nourish-subtext)] text-center max-w-xs">
            Match ingredients that pair well together. Flip two cards — if
            they&apos;re a great flavor pair, they stay!
          </p>
          <div className="space-y-2 w-full max-w-xs">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => startGame(d)}
                className={cn(
                  "w-full rounded-xl py-3.5 text-sm font-semibold capitalize",
                  d === "easy" &&
                    "bg-[var(--nourish-green)] text-white",
                  d === "medium" &&
                    "bg-amber-500 text-white",
                  d === "hard" &&
                    "bg-red-500 text-white",
                )}
                type="button"
              >
                {d}
              </button>
            ))}
          </div>
        </main>
      </motion.div>
    );
  }

  if (gameOver) {
    const score = Math.max(0, 1000 - moves * 50 - elapsed * 5);
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
          <span className="block text-5xl">🎉</span>
          <div>
            <p className="text-2xl font-bold text-[var(--nourish-dark)] tabular-nums">
              {score} pts
            </p>
            <p className="text-sm text-[var(--nourish-subtext)] mt-1">
              {moves} moves · {elapsed}s
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <button
              onClick={() => startGame(difficulty)}
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
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[var(--nourish-subtext)] tabular-nums">
              {matchedPairs}/{PAIR_COUNT}
            </span>
            <span className="text-[var(--nourish-subtext)] tabular-nums">
              {elapsed}s
            </span>
          </div>
          <span className="text-xs font-medium text-[var(--nourish-subtext)] tabular-nums">
            {moves} moves
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        {/* Match hint */}
        <AnimatePresence>
          {lastMatchWhy && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-3 rounded-xl bg-[var(--nourish-green)]/10 border border-[var(--nourish-green)]/20 px-3 py-2 text-center"
            >
              <p className="text-xs text-[var(--nourish-green)] font-medium">
                ✨ {lastMatchWhy}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {cards.map((card) => (
            <motion.button
              key={card.id}
              whileTap={
                !card.flipped && !card.matched ? { scale: 0.92 } : undefined
              }
              onClick={() => handleFlip(card.id)}
              disabled={card.flipped || card.matched}
              className={cn(
                "aspect-square rounded-2xl relative overflow-hidden transition-colors",
                card.matched
                  ? "bg-[var(--nourish-green)]/10 border-2 border-[var(--nourish-green)]/30"
                  : card.flipped
                    ? "bg-white border-2 border-[var(--nourish-green)]"
                    : "bg-white border border-neutral-200 shadow-sm hover:shadow-md",
              )}
              type="button"
              aria-label={
                card.flipped || card.matched
                  ? card.name
                  : "Hidden card"
              }
            >
              <AnimatePresence mode="wait">
                {card.flipped || card.matched ? (
                  <motion.div
                    key="front"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2"
                  >
                    <span className="text-2xl">{card.emoji}</span>
                    <span className="text-[10px] font-medium text-[var(--nourish-dark)] text-center leading-tight">
                      {card.name}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="text-2xl text-neutral-300">?</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </main>
    </motion.div>
  );
}
