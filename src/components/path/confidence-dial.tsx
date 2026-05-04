"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import type {
  CookSessionRecord,
  CookStats,
} from "@/lib/hooks/use-cook-sessions";

/** The four tiers along the dial, in ascending order of confidence. Ranges
 *  are expressed as the lower bound on the normalized 0..1 confidence score
 *  (exclusive except for "Steady" which covers 0).
 *
 *  Exported so tests and other components can consume the same tier list. */
export const CONFIDENCE_TIERS = [
  { label: "Steady", min: 0, description: "Finding your feet." },
  { label: "Bold", min: 0.25, description: "Trying new things." },
  { label: "Fluent", min: 0.5, description: "Cooking with ease." },
  { label: "Master", min: 0.75, description: "Kitchen at your command." },
] as const;

export type ConfidenceTier = (typeof CONFIDENCE_TIERS)[number]["label"];

export interface ConfidenceReading {
  score: number; // 0..1
  tier: ConfidenceTier;
  description: string;
  breakdown: {
    cookScore: number;
    cuisineScore: number;
    ratingScore: number;
  };
}

/** Derive the confidence reading from existing stats + completed sessions.
 *  Pure  -  the dial is a visualisation of data the user has already produced,
 *  no new storage is introduced.
 *
 *  Weighting: cook count is the strongest signal (people cook by doing),
 *  cuisine diversity second (real fluency spans cuisines), rating third
 *  (subjective and noisy for small N). Weights sum to 1. */
export function deriveConfidence(
  stats: Pick<CookStats, "completedCooks" | "cuisinesCovered">,
  completedSessions: CookSessionRecord[],
): ConfidenceReading {
  const cookScore = Math.min(stats.completedCooks / 30, 1);
  const cuisineScore = Math.min((stats.cuisinesCovered?.length ?? 0) / 10, 1);

  const rated = completedSessions.filter(
    (s) => typeof s.rating === "number" && s.rating > 0,
  );
  const wellRated = rated.filter((s) => (s.rating ?? 0) >= 4).length;
  // Ratings are only meaningful with a few data points; avoid rewarding a
  // single five-star cook. Require at least 3 rated cooks before ratingScore
  // can climb above 0.
  const ratingScore =
    rated.length < 3 ? 0 : Math.min(wellRated / Math.max(rated.length, 1), 1);

  const score = 0.4 * cookScore + 0.35 * cuisineScore + 0.25 * ratingScore;

  // Pick the highest tier whose min threshold is ≤ score.
  let tier: (typeof CONFIDENCE_TIERS)[number] = CONFIDENCE_TIERS[0];
  for (const t of CONFIDENCE_TIERS) {
    if (score >= t.min) tier = t;
  }

  return {
    score,
    tier: tier.label,
    description: tier.description,
    breakdown: { cookScore, cuisineScore, ratingScore },
  };
}

// ─── Dial geometry ────────────────────────────────────
// 270-degree arc, sweeping from bottom-left (-225°) around the top to
// bottom-right (+45°). Using degrees through the trig makes the tick math
// readable.

const DIAL_START = -225; // degrees
const DIAL_END = 45;
const DIAL_SPAN = DIAL_END - DIAL_START; // 270

/** Convert a dial degree into an SVG (x,y) coordinate relative to center. */
function polar(degrees: number, radius: number) {
  const rad = (degrees * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

/** Build an SVG arc path between two dial-space degrees at the given radius. */
function arcPath(fromDeg: number, toDeg: number, radius: number): string {
  const start = polar(fromDeg, radius);
  const end = polar(toDeg, radius);
  const largeArc = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  // SVG arc sweeps clockwise when sweep-flag = 1 (our coordinate space has
  // +Y down, so clockwise visually).
  const sweep = toDeg > fromDeg ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

interface ConfidenceDialProps {
  stats: Pick<CookStats, "completedCooks" | "cuisinesCovered">;
  completedSessions: CookSessionRecord[];
}

/**
 * ConfidenceDial  -  a derived "kitchen confidence" gauge below the
 * constellation. No number, just a label ("Steady" → "Bold" → "Fluent" →
 * "Master") and a filled arc. The dial moves as the user cooks more, covers
 * more cuisines, and racks up well-rated cooks  -  so the compounding value of
 * the product is legible without being loud.
 */
export function ConfidenceDial({
  stats,
  completedSessions,
}: ConfidenceDialProps) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const reading = useMemo(
    () => deriveConfidence(stats, completedSessions),
    [stats, completedSessions],
  );

  // Nothing to show for a brand-new user  -  keep the path screen calm.
  if (stats.completedCooks === 0) return null;

  const radius = 58;
  const fillDeg = DIAL_START + DIAL_SPAN * reading.score;
  const viewBox = `-80 -80 160 ${radius * 2 + 20}`;

  return (
    <section
      aria-label="Kitchen confidence"
      className="mx-auto mt-4 flex max-w-md flex-col items-center gap-2 rounded-2xl border border-[var(--nourish-border-strong)] bg-white/60 px-4 py-5"
    >
      <svg
        viewBox={viewBox}
        width="180"
        height="120"
        className="overflow-visible"
        aria-hidden
      >
        {/* Track  -  the full 270° arc in a muted tone */}
        <path
          d={arcPath(DIAL_START, DIAL_END, radius)}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Tier ticks  -  thin marks at each threshold */}
        {CONFIDENCE_TIERS.slice(1).map((t) => {
          const deg = DIAL_START + DIAL_SPAN * t.min;
          const inner = polar(deg, radius - 7);
          const outer = polar(deg, radius + 7);
          return (
            <line
              key={t.label}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Fill  -  animates from start to current score. Use pathLength so
            the stroke-dasharray animation is independent of the path's
            actual SVG length and stays smooth. */}
        <motion.path
          d={arcPath(
            DIAL_START,
            fillDeg > DIAL_START ? fillDeg : DIAL_START + 0.01,
            radius,
          )}
          fill="none"
          stroke="var(--nourish-green)"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
        />

        {/* Score dot */}
        <motion.circle
          cx={polar(fillDeg, radius).x}
          cy={polar(fillDeg, radius).y}
          r={6}
          fill="var(--nourish-green)"
          stroke="white"
          strokeWidth={2.5}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 22,
            delay: 0.25,
          }}
        />
      </svg>

      <motion.p
        key={reading.tier}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="font-serif text-xl text-[var(--nourish-dark)]"
      >
        {reading.tier}
      </motion.p>
      <p className="text-center text-[11px] text-[var(--nourish-subtext)]">
        {reading.description}
      </p>
    </section>
  );
}
