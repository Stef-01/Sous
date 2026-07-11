"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
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
  image: string;
  meta: string;
}

type GameScoreSummary = {
  bestScore: number;
  totalPlays: number;
} | null;

const games: GameCard[] = [
  {
    id: "cuisine-compass",
    name: "Cuisine Compass",
    description: "Pin dishes to their homeland",
    Icon: Compass,
    route: "/games/cuisine-compass",
    image: "/food_images/sushi_platter.png",
    meta: "Daily",
  },
  {
    id: "whats-cooking",
    name: "What's Cooking?",
    description: "Guess the dish from cryptic clues",
    Icon: Lightbulb,
    route: "/games/whats-cooking",
    image: "/food_images/pasta_carbonara.png",
    meta: "Clues",
  },
  {
    id: "flavor-pairs",
    name: "Flavor Pairs",
    description: "Match ingredients that pair well",
    Icon: Puzzle,
    route: "/games/flavor-pairs",
    image: "/food_images/caprese_salad.png",
    meta: "Pairing",
  },
  {
    id: "speed-chop",
    name: "Speed Chop",
    description: "Sort ingredients into categories",
    Icon: Timer,
    route: "/games/speed-chop",
    image: "/food_images/abc_salad.png",
    meta: "Speed",
  },
];

export default function GamesArcadePage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { getScore, mounted } = useGameScores();
  const [featured, ...secondaryGames] = games;

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
            whileTap={reducedMotion ? undefined : { scale: 0.88 }}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--nourish-subtext)] transition-colors hover:text-[var(--nourish-dark)]"
            type="button"
            aria-label="Back to Today"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex flex-col items-center">
            <h1 className="flex items-center gap-1.5 font-serif text-[15px] font-semibold text-[var(--nourish-dark)]">
              <Joystick size={14} aria-hidden /> Kitchen Arcade
            </h1>
            <p className="sous-label">Learn food, have fun</p>
          </div>
          <span className="min-w-11" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-md page-x py-5">
        <div className="space-y-3">
          {featured && (
            <GameFeatureCard
              game={featured}
              score={mounted ? getScore(featured.id) : null}
              onSelect={() => router.push(featured.route)}
              reducedMotion={reducedMotion}
            />
          )}

          <div className="space-y-2">
            {secondaryGames.map((game, idx) => (
              <GameListRow
                key={game.id}
                game={game}
                score={mounted ? getScore(game.id) : null}
                onSelect={() => router.push(game.route)}
                index={idx}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        </div>
      </main>
    </motion.div>
  );
}

function GameFeatureCard({
  game,
  score,
  onSelect,
  reducedMotion,
}: {
  game: GameCard;
  score: GameScoreSummary;
  onSelect: () => void;
  reducedMotion: boolean | null;
}) {
  return (
    <motion.button
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      onClick={onSelect}
      className="group relative min-h-[218px] w-full overflow-hidden rounded-2xl bg-[var(--nourish-dark)] text-left text-white shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
      type="button"
      aria-label={`Open ${game.name}`}
    >
      <Image
        src={game.image}
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 100vw, 448px"
        className="object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-black/10" />
      <div className="relative flex min-h-[218px] flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-3">
          <MetaPill
            variant="default"
            size="xs"
            className="border border-white/20 bg-white/90 text-[var(--nourish-dark)]"
          >
            {game.meta}
          </MetaPill>
          <MetaPill
            variant="default"
            size="xs"
            className="border border-white/20 bg-white/90 text-[var(--nourish-dark)]"
          >
            {score && score.totalPlays > 0 ? `Best ${score.bestScore}` : "New"}
          </MetaPill>
        </div>
        <div>
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--nourish-green)]">
            <game.Icon size={17} strokeWidth={2} aria-hidden />
          </div>
          <h2 className="text-[26px] font-bold leading-[1.02]">{game.name}</h2>
          <p className="mt-1 max-w-[260px] text-[13px] font-medium leading-snug text-white/82">
            {game.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function GameListRow({
  game,
  score,
  onSelect,
  index,
  reducedMotion,
}: {
  game: GameCard;
  score: GameScoreSummary;
  onSelect: () => void;
  index: number;
  reducedMotion: boolean | null;
}) {
  const hasPlayed = !!score && score.totalPlays > 0;

  return (
    <motion.button
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 25,
        delay: reducedMotion ? 0 : (index + 1) * 0.04,
      }}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      onClick={onSelect}
      className="group flex min-h-[92px] w-full items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-2.5 text-left shadow-sm transition-colors hover:border-[var(--nourish-green)]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
      type="button"
      aria-label={`Open ${game.name}`}
    >
      <Image
        src={game.image}
        alt=""
        width={164}
        height={136}
        sizes="82px"
        className="h-[68px] w-[82px] shrink-0 rounded-xl object-cover"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <game.Icon
            size={14}
            strokeWidth={2}
            className="shrink-0 text-[var(--nourish-green)]"
            aria-hidden
          />
          <span className="truncate text-[15px] font-bold leading-tight text-[var(--nourish-dark)]">
            {game.name}
          </span>
        </span>
        <span className="mt-1 line-clamp-2 block text-[12px] leading-snug text-[var(--nourish-subtext)]">
          {game.description}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-1.5">
          <MetaPill variant="subtle" size="xs">
            {game.meta}
          </MetaPill>
          <MetaPill variant={hasPlayed ? "subtle" : "green"} size="xs">
            {hasPlayed ? `Best ${score.bestScore}` : "New"}
          </MetaPill>
        </span>
      </span>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--nourish-subtext)] transition group-hover:bg-[var(--nourish-green)]/[0.08] group-hover:text-[var(--nourish-green)]">
        <ArrowRight size={17} strokeWidth={2} aria-hidden />
      </span>
    </motion.button>
  );
}
