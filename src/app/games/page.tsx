"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Joystick,
  Lightbulb,
  Puzzle,
  Timer,
  Compass,
  type LucideIcon,
} from "lucide-react";
import { useGameScores } from "@/lib/hooks/use-game-scores";
import { MetaPill } from "@/components/shared/meta-pill";

interface GameCard {
  id: string;
  name: string;
  description: string;
  Icon: LucideIcon;
  route: string;
  /** Tint drawn from the app's own palette (no off-system pastels). */
  tint: string;
}

const games: GameCard[] = [
  {
    id: "whats-cooking",
    name: "What's Cooking?",
    description: "Guess the dish from cryptic clues",
    Icon: Lightbulb,
    route: "/games/whats-cooking",
    tint: "--nourish-gold",
  },
  {
    id: "flavor-pairs",
    name: "Flavor Pairs",
    description: "Match ingredients that pair well",
    Icon: Puzzle,
    route: "/games/flavor-pairs",
    tint: "--nourish-green",
  },
  {
    id: "speed-chop",
    name: "Speed Chop",
    description: "Sort ingredients into categories",
    Icon: Timer,
    route: "/games/speed-chop",
    tint: "--nourish-warm",
  },
  {
    id: "cuisine-compass",
    name: "Cuisine Compass",
    description: "Pin dishes to their homeland",
    Icon: Compass,
    route: "/games/cuisine-compass",
    tint: "--nourish-light-green",
  },
];

export default function GamesArcadePage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { getScore, mounted } = useGameScores();

  return (
    <motion.div
      className="min-h-dvh bg-[var(--nourish-cream)]"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 page-x py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2">
          <motion.button
            onClick={() => router.push("/today")}
            whileTap={{ scale: 0.88 }}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--nourish-subtext)] transition-colors hover:text-[var(--nourish-dark)]"
            type="button"
            aria-label="Back to Today"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex flex-col items-center">
            <p className="flex items-center gap-1.5 font-serif text-[15px] font-semibold text-[var(--nourish-dark)]">
              <Joystick size={14} aria-hidden /> Kitchen Arcade
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--nourish-subtext)]">
              Learn food, have fun
            </p>
          </div>
          {/* Spacer keeps title visually centred without forcing the
              back button into a different cell. */}
          <span className="min-w-11" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-md page-x py-6">
        <div className="grid grid-cols-2 gap-3">
          {games.map((game, idx) => {
            const score = mounted ? getScore(game.id) : null;
            const hasPlayed = score && score.totalPlays > 0;
            return (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 25,
                  delay: idx * 0.05,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(game.route)}
                className="relative flex flex-col items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md"
                type="button"
              >
                {hasPlayed ? null : (
                  <MetaPill
                    variant="green"
                    size="xs"
                    className="absolute right-2 top-2 font-bold uppercase tracking-[0.12em]"
                    aria-label="New game, never played"
                  >
                    New
                  </MetaPill>
                )}
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(${game.tint}) 14%, transparent)`,
                    color: `var(${game.tint})`,
                  }}
                >
                  <game.Icon size={28} strokeWidth={1.8} aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--nourish-dark)]">
                    {game.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--nourish-subtext)]">
                    {game.description}
                  </p>
                </div>
                {hasPlayed ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-neutral-50 px-2.5 py-1 text-[10px] tabular-nums text-[var(--nourish-subtext)]">
                    <span>
                      Best{" "}
                      <span className="font-semibold text-[var(--nourish-dark)]">
                        {score.bestScore}
                      </span>
                    </span>
                    <span aria-hidden>·</span>
                    <span>
                      {score.totalPlays} play
                      {score.totalPlays === 1 ? "" : "s"}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] italic text-[var(--nourish-subtext-faint)]">
                    Tap to try
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </main>
    </motion.div>
  );
}
