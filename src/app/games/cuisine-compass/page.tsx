"use client";

/**
 * /games/cuisine-compass — daily dish-pinning puzzle
 * (Y5 N UI, per `docs/CUISINE-COMPASS-MAP-GAME-PLAN.md`).
 *
 * Replaces the prior 4-region multiple-choice placeholder with
 * the full GeoGuessr-grade map game. The substrate that powers
 * this surface — great-circle distance, scoring, share-grid,
 * daily-rotation, 50-dish dataset, streak hook — was shipped in
 * `8963f9e` (Y5 N substrate commit) and `6521205` (helpers).
 *
 * Lifecycle:
 *   1. Mount → resolve today's puzzle from the deterministic
 *      daily-rotation against COMPASS_DISHES; check the streak
 *      hook for an existing same-day result.
 *   2. If already played, jump straight to the reveal view with
 *      the saved score + share grid.
 *   3. Otherwise: show hero photo + map; user taps map to place
 *      pin; submit locks the guess + reveals the answer.
 *   4. Reveal: score ticks up; great-circle line draws; share
 *      grid + clipboard / native-share button.
 */

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Clock,
  Share2,
  Sparkles,
} from "lucide-react";
import { COMPASS_DISHES } from "@/data/compass-dishes";
import { resolveDailyPuzzle } from "@/lib/games/daily-rotation";
import { compassScore } from "@/lib/games/compass-scoring";
import { buildShareGrid } from "@/lib/games/share-grid";
import { haversineKm, type LatLng } from "@/lib/games/great-circle";
import { useCompassStreak } from "@/lib/hooks/use-compass-streak";
import { COMPASS_SCHEMA_VERSION } from "@/types/cuisine-compass";
import { toast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils/cn";

// Lazy-import the MapLibre wrapper so the bundle cost is only paid
// once the user actually opens the game.
const CompassMap = dynamic(
  () => import("@/components/games/compass-map").then((m) => m.CompassMap),
  { ssr: false },
);

const SHARE_BASE_URL = "https://soustogether.app/c";

export default function CuisineCompassPage() {
  return (
    <Suspense fallback={<CompassSkeleton />}>
      <CuisineCompassInner />
    </Suspense>
  );
}

function CompassSkeleton() {
  return (
    <div className="min-h-dvh bg-[var(--nourish-cream)]">
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <span className="h-9 w-9 rounded-xl bg-white/60" />
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-green)]">
              Cuisine Compass
            </p>
            <h1 className="font-serif text-lg text-[var(--nourish-dark)]">
              Loading today&apos;s puzzle…
            </h1>
          </div>
        </div>
      </header>
    </div>
  );
}

function CuisineCompassInner() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const { mounted, streak, recordResult, resultFor } = useCompassStreak();

  // Resolve "today" once on mount; freeze for this session so a
  // tab open across midnight UTC doesn't swap the puzzle out.
  const [now] = useState(() => new Date());
  const slot = useMemo(
    () => resolveDailyPuzzle({ now, datasetSize: COMPASS_DISHES.length }),
    [now],
  );
  const dish = COMPASS_DISHES[slot.dishIndex] ?? COMPASS_DISHES[0];
  const answer = useMemo<LatLng>(
    () => ({ lat: dish.origin.lat, lng: dish.origin.lng }),
    [dish.origin.lat, dish.origin.lng],
  );

  // Existing result for this date, if the user already played.
  const existing = mounted ? resultFor(slot.isoDate) : null;

  // Game state.
  const [guess, setGuess] = useState<LatLng | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  // If we already have a result for today, slot the reveal in.
  /* eslint-disable react-hooks/set-state-in-effect -- legitimate hydration handoff: jump to reveal once streak loads */
  useEffect(() => {
    if (!mounted) return;
    if (existing && !submitted) {
      setGuess(existing.guess);
      setSubmitted(true);
      setElapsedSec(existing.elapsedSec);
    }
  }, [mounted, existing, submitted]);

  // Timer: starts on first tap, freezes on submit / reveal.
  useEffect(() => {
    if (!startedAt || submitted) return;
    const id = window.setInterval(() => {
      setElapsedSec(Math.max(0, Math.round((Date.now() - startedAt) / 1000)));
    }, 250);
    return () => window.clearInterval(id);
  }, [startedAt, submitted]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleTap = (point: LatLng) => {
    if (submitted) return;
    setGuess(point);
    if (!startedAt) setStartedAt(Date.now());
  };

  const score = useMemo(() => {
    if (!guess) return null;
    return compassScore({ guess, answer, elapsedSec });
  }, [guess, answer, elapsedSec]);

  const handleSubmit = () => {
    if (!guess || submitted) return;
    setSubmitted(true);
    const breakdown = compassScore({ guess, answer, elapsedSec });
    const next = recordResult({
      puzzleDate: slot.isoDate,
      dishSlug: dish.slug,
      guess,
      distanceKm: breakdown.distanceKm,
      elapsedSec,
      hintsUsed: 0,
      score: breakdown.score,
    });
    void next; // recordResult persists; surface refreshes via streak.
  };

  const handleShare = async () => {
    if (!score) return;
    const text = buildShareGrid({
      dayNumber: slot.dayNumber,
      score: score.score,
      stars: score.stars,
      distanceKm: score.distanceKm,
      shareUrl: `${SHARE_BASE_URL}/${slot.dayNumber}`,
    });
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          text,
          title: `Sous Compass · Day ${slot.dayNumber}`,
        });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast.push({
          variant: "success",
          title: "Copied to clipboard",
          body: "Paste anywhere — emojis travel.",
          dedupKey: "compass-share",
        });
      } else if (typeof window !== "undefined") {
        window.prompt("Copy your grid:", text);
      }
    } catch {
      // share dismissed — silent
    }
  };

  void COMPASS_SCHEMA_VERSION; // keep import (used only via streak)

  return (
    <div className="min-h-dvh bg-[var(--nourish-cream)] pb-28">
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2">
          <Link
            href="/games"
            aria-label="Back to Arcade"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] hover:bg-neutral-50"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-col items-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-green)]">
              Day {slot.dayNumber} · {slot.isoDate}
            </p>
            <h1 className="font-serif text-[15px] font-semibold text-[var(--nourish-dark)]">
              Cuisine Compass
            </h1>
          </div>
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[var(--nourish-dark)]"
            aria-live="polite"
          >
            {streak.current > 0 ? `🔥 ${streak.current}` : "—"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        {/* Hero card with the dish prompt. */}
        <motion.section
          key={dish.slug}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
        >
          <DishHero name={dish.name} imageUrl={dish.imageUrl} />
          <p className="mt-3 font-serif text-base font-semibold text-[var(--nourish-dark)]">
            Where was {dish.name} first cooked?
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--nourish-subtext)]">
            <Clock size={11} aria-hidden />
            {submitted
              ? `Locked at ${formatElapsed(elapsedSec)}`
              : startedAt
                ? formatElapsed(elapsedSec)
                : "Tap the map to start"}
          </p>
        </motion.section>

        {/* Map. */}
        <CompassMap
          guess={guess}
          answer={submitted ? answer : null}
          onTap={handleTap}
          interactive={!submitted}
        />

        {/* Submit / reveal panel. */}
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!guess}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold transition-colors",
              guess
                ? "bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)]"
                : "bg-neutral-100 text-neutral-400",
            )}
          >
            <CheckCircle2 size={14} aria-hidden />
            {guess ? "Submit guess" : "Tap the map to place a pin"}
          </button>
        ) : (
          <RevealCard
            dish={dish}
            distanceKm={haversineKm(guess ?? answer, answer)}
            score={score?.score ?? 0}
            stars={score?.stars ?? 0}
            onShare={handleShare}
            onCookThis={() => router.push(`/cook/${dish.slug}`)}
          />
        )}
      </main>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function DishHero({ name, imageUrl }: { name: string; imageUrl: string }) {
  if (imageUrl.startsWith("placeholder:")) {
    const emoji = imageUrl.slice("placeholder:".length) || "🍽️";
    return (
      <div
        className="flex h-32 w-full items-center justify-center rounded-xl bg-gradient-to-br from-[var(--nourish-cream)] to-white text-6xl shadow-inner"
        role="img"
        aria-label={`${name} hero placeholder`}
      >
        <span aria-hidden>{emoji}</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- catalog images are local public/ paths; avoiding next/image ceremony for this game surface
    <img
      src={imageUrl}
      alt={name}
      className="h-32 w-full rounded-xl object-cover shadow-inner"
    />
  );
}

interface RevealCardProps {
  dish: (typeof COMPASS_DISHES)[number];
  distanceKm: number;
  score: number;
  stars: 0 | 1 | 2 | 3 | 4 | 5;
  onShare: () => void;
  onCookThis: () => void;
}

function RevealCard({
  dish,
  distanceKm,
  score,
  stars,
  onShare,
  onCookThis,
}: RevealCardProps) {
  const reducedMotion = useReducedMotion();
  // Tween the score readout up for a satisfying reveal.
  const [shown, setShown] = useState(reducedMotion ? score : 0);
  /* eslint-disable react-hooks/set-state-in-effect -- legitimate animation tween over 1.2s */
  useEffect(() => {
    if (reducedMotion) {
      setShown(score);
      return;
    }
    const start = performance.now();
    const DURATION_MS = 1200;
    let raf = 0;
    const step = (t: number) => {
      const elapsed = Math.min(1, (t - start) / DURATION_MS);
      const eased = 1 - Math.pow(1 - elapsed, 3); // ease-out cubic
      setShown(Math.round(score * eased));
      if (elapsed < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score, reducedMotion]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const distanceLabel = !Number.isFinite(distanceKm)
    ? "—"
    : distanceKm < 1
      ? "Bullseye"
      : `${Math.round(distanceKm).toLocaleString()} km off`;

  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-[var(--nourish-green)]/20 bg-white p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-green)]">
          Reveal
        </p>
        <p className="mt-1 font-serif text-3xl font-bold tabular-nums text-[var(--nourish-dark)]">
          {shown.toLocaleString()} / 5,000
        </p>
        <p className="mt-0.5 text-[12px] text-[var(--nourish-subtext)]">
          {distanceLabel} ·{" "}
          <span aria-label={`${stars} of 5 stars`}>
            {"★".repeat(stars)}
            {"☆".repeat(5 - stars)}
          </span>
        </p>
        <p className="mt-3 text-[12px] leading-snug text-[var(--nourish-dark)]">
          <span className="font-semibold">
            {dish.origin.city}, {dish.origin.country}
          </span>{" "}
          — {dish.history}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onShare}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-[var(--nourish-green)] py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--nourish-dark-green)]"
        >
          <Share2 size={14} aria-hidden />
          Share grid
        </button>
        <button
          type="button"
          onClick={onCookThis}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white py-3 text-[13px] font-semibold text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/40"
        >
          <ChefHat size={14} aria-hidden />
          Cook this dish
        </button>
      </div>

      <p className="flex items-start gap-1 rounded-xl bg-[var(--nourish-warm)]/5 px-3 py-2 text-[11px] text-[var(--nourish-subtext)]">
        <Sparkles size={12} className="mt-px shrink-0" aria-hidden />
        New puzzle every day at midnight UTC. Same dish for everyone — share
        your grid to see how you stack up.
      </p>
    </section>
  );
}

function formatElapsed(sec: number): string {
  const mm = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
}
