"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

interface CuisineConstellationProps {
  completedSessions: CookSessionRecord[];
}

interface Cuisine {
  id: string;
  name: string;
  emoji: string;
  /** Cooks needed to be considered "mastered"; keeps parity with mastery nodes. */
  mastery: number;
}

/**
 * The eight mastery cuisines mirrored from `skill-tree.ts`.
 * Arranged in circular order so the constellation reads left-to-right top
 * and clockwise around  -  a quietly pleasing topology.
 */
const CUISINES: Cuisine[] = [
  { id: "italian", name: "Italian", emoji: "🇮🇹", mastery: 5 },
  { id: "mediterranean", name: "Mediterranean", emoji: "🫒", mastery: 5 },
  { id: "french", name: "French", emoji: "🇫🇷", mastery: 5 },
  { id: "japanese", name: "Japanese", emoji: "🗾", mastery: 5 },
  { id: "chinese", name: "Chinese", emoji: "🇨🇳", mastery: 5 },
  { id: "thai", name: "Thai", emoji: "🌶️", mastery: 5 },
  { id: "indian", name: "Indian", emoji: "🇮🇳", mastery: 5 },
  { id: "mexican", name: "Mexican", emoji: "🌮", mastery: 5 },
];

const VIEW_W = 320;
const VIEW_H = 180;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2 - 6;
const R = 64;

/** Compute circular position for the i-th cuisine on the constellation ring. */
function positionFor(index: number): { x: number; y: number; angle: number } {
  // -90° puts the first star at the top of the ring, then clockwise.
  const angle = (-90 + index * (360 / CUISINES.length)) * (Math.PI / 180);
  return {
    x: CX + R * Math.cos(angle),
    y: CY + R * Math.sin(angle),
    angle,
  };
}

/** Pick a star fill intensity based on completion ratio. */
function starAppearance(ratio: number): {
  fill: string;
  glow: string;
  radius: number;
} {
  if (ratio >= 1) {
    return {
      fill: "#d4a84b", // gold  -  mastered
      glow: "rgba(212, 168, 75, 0.55)",
      radius: 7,
    };
  }
  if (ratio >= 0.5) {
    return {
      fill: "#2d5a3d", // deep green  -  well underway
      glow: "rgba(45, 90, 61, 0.45)",
      radius: 6,
    };
  }
  if (ratio > 0) {
    return {
      fill: "#4a8c5c", // light green  -  some progress
      glow: "rgba(74, 140, 92, 0.35)",
      radius: 5.5,
    };
  }
  return {
    fill: "#cbd5e1", // slate-300  -  untouched
    glow: "rgba(203, 213, 225, 0)",
    radius: 4.5,
  };
}

/**
 * CuisineConstellation  -  quiet celebratory view of how much of the world's
 * cuisines the user has touched. Stars brighten with each cook. Tap any star
 * to see its name and the exact fraction of cooks completed toward mastery.
 *
 * Hidden entirely when the user has zero completed cooks  -  we don't want an
 * empty sky to feel like a chore list.
 */
export function CuisineConstellation({
  completedSessions,
}: CuisineConstellationProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const progress = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of completedSessions) {
      const fam = s.cuisineFamily?.toLowerCase();
      if (!fam) continue;
      counts.set(fam, (counts.get(fam) ?? 0) + 1);
    }
    return CUISINES.map((c) => {
      const cooks = counts.get(c.id) ?? 0;
      return { ...c, cooks, ratio: Math.min(cooks / c.mastery, 1) };
    });
  }, [completedSessions]);

  const totalCooked = progress.reduce((sum, p) => sum + p.cooks, 0);
  if (totalCooked === 0) return null;

  const exploredCount = progress.filter((p) => p.cooks > 0).length;
  const masteredCount = progress.filter((p) => p.ratio >= 1).length;

  const selectedCuisine = selected
    ? progress.find((p) => p.id === selected)
    : null;

  return (
    <section
      aria-label="Your cuisine constellation"
      className="relative mx-auto w-full max-w-md"
    >
      <div className="mb-2 flex items-end justify-between px-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--nourish-green)]/80">
            Cuisine constellation
          </p>
          <p className="text-[13px] text-[var(--nourish-subtext)]">
            {exploredCount} of {CUISINES.length} touched
            {masteredCount > 0 && (
              <span className="ml-1 text-[var(--nourish-gold)]">
                · {masteredCount} mastered
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[var(--nourish-border-soft)] bg-white">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block h-[180px] w-full"
          role="img"
          aria-label={`Cuisine constellation showing ${exploredCount} of ${CUISINES.length} cuisines explored`}
        >
          {/* Faint orbital ring  -  the implicit topology of world cuisines. */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="#eef0f3"
            strokeWidth={1}
            strokeDasharray="2 4"
          />

          {/* Connector arcs between adjacent stars  -  only drawn between
              cuisines that have any progress. */}
          {progress.map((cuisine, i) => {
            const next = progress[(i + 1) % progress.length];
            if (cuisine.cooks === 0 || next.cooks === 0) return null;
            const a = positionFor(i);
            const b = positionFor(i + 1);
            return (
              <motion.line
                key={`line-${cuisine.id}-${next.id}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#2d5a3d"
                strokeWidth={1}
                strokeOpacity={0.35}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.04 }}
              />
            );
          })}

          {/* Stars */}
          {progress.map((cuisine, i) => {
            const { x, y } = positionFor(i);
            const app = starAppearance(cuisine.ratio);
            const isSelected = selected === cuisine.id;
            return (
              <g
                key={cuisine.id}
                onClick={() =>
                  setSelected((s) => (s === cuisine.id ? null : cuisine.id))
                }
                onMouseEnter={() => setSelected(cuisine.id)}
                onMouseLeave={() => setSelected(null)}
                tabIndex={0}
                role="button"
                aria-label={`${cuisine.name}: ${cuisine.cooks} of ${cuisine.mastery} cooks`}
                className="cursor-pointer outline-none"
              >
                {/* Halo  -  only drawn when there is any progress */}
                {cuisine.cooks > 0 && (
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={app.radius + 6}
                    fill={app.glow}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isSelected ? 0.8 : 0.4 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
                <motion.circle
                  cx={x}
                  cy={y}
                  r={app.radius}
                  fill={app.fill}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: isSelected ? 1.2 : 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                    delay: 0.15 + i * 0.05,
                  }}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
              </g>
            );
          })}
        </svg>

        {/* Info overlay  -  fixed to the bottom-center of the card. */}
        <AnimatePresence mode="wait">
          {selectedCuisine ? (
            <motion.div
              key={`info-${selectedCuisine.id}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5 px-3"
            >
              <span className="text-base leading-none" aria-hidden>
                {selectedCuisine.emoji}
              </span>
              <span className="text-[13px] font-medium text-[var(--nourish-dark)]">
                {selectedCuisine.name}
              </span>
              <span className="text-[12px] text-[var(--nourish-subtext)] tabular-nums">
                {selectedCuisine.cooks}/{selectedCuisine.mastery}
              </span>
            </motion.div>
          ) : (
            <motion.p
              key="info-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[11px] italic text-[var(--nourish-subtext)]/70"
            >
              Tap a star
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
