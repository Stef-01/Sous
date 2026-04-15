"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useGameScores } from "@/lib/hooks/use-game-scores";

interface GameCard {
  id: string;
  name: string;
  description: string;
  emoji: string;
  route: string;
  color: string;
}

const games: GameCard[] = [
  {
    id: "whats-cooking",
    name: "What's Cooking?",
    description: "Guess the dish from cryptic clues",
    emoji: "🔮",
    route: "/games/whats-cooking",
    color: "from-purple-100 to-indigo-100",
  },
  {
    id: "flavor-pairs",
    name: "Flavor Pairs",
    description: "Match ingredients that pair well",
    emoji: "🧩",
    route: "/games/flavor-pairs",
    color: "from-amber-100 to-orange-100",
  },
  {
    id: "speed-chop",
    name: "Speed Chop",
    description: "Sort ingredients into categories",
    emoji: "🔪",
    route: "/games/speed-chop",
    color: "from-red-100 to-pink-100",
  },
  {
    id: "cuisine-compass",
    name: "Cuisine Compass",
    description: "Pin dishes to their homeland",
    emoji: "🗺️",
    route: "/games/cuisine-compass",
    color: "from-emerald-100 to-teal-100",
  },
];

export default function GamesArcadePage() {
  const router = useRouter();
  const { getScore, mounted } = useGameScores();

  return (
    <motion.div
      className="min-h-dvh bg-[var(--nourish-cream)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <motion.button
            onClick={() => router.push("/")}
            whileTap={{ scale: 0.88 }}
            className="flex items-center justify-center rounded-lg min-h-11 min-w-11 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
            type="button"
            aria-label="Back to Today"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="font-serif text-lg text-[var(--nourish-dark)]">
              Kitchen Arcade
            </h1>
            <p className="text-xs text-[var(--nourish-subtext)]">
              Learn food, have fun
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          {games.map((game, idx) => {
            const score = mounted ? getScore(game.id) : null;
            return (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 25,
                  delay: idx * 0.08,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(game.route)}
                className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-5 text-center shadow-sm hover:shadow-md transition-shadow"
                type="button"
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${game.color}`}
                >
                  <span className="text-3xl">{game.emoji}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--nourish-dark)]">
                    {game.name}
                  </p>
                  <p className="text-[10px] text-[var(--nourish-subtext)] mt-0.5">
                    {game.description}
                  </p>
                </div>
                {score && (
                  <div className="flex items-center gap-2 text-[10px] text-[var(--nourish-subtext)]">
                    <span>Best: {score.bestScore}</span>
                    <span>·</span>
                    <span>{score.totalPlays} plays</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </main>
    </motion.div>
  );
}
