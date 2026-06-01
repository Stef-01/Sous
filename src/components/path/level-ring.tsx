"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";

/**
 * LevelRing — a bespoke circular XP dial. The level number sits inside a ring
 * that fills with the current level's XP (a Cal-AI-style progress ring), so the
 * old flat XP bar + separate badge collapse into one crafted element. The arc
 * uses the brand green gradient; a gold star marks the level as "earned".
 *
 * Custom SVG (no stock asset): the stroke is a single `strokeDasharray` arc
 * animated via `strokeDashoffset`, gated on reduced-motion.
 */
export function LevelRing({
  level,
  progress,
}: {
  level: number;
  /** 0–1 fraction of the current level's XP. */
  progress: number;
}) {
  const reducedMotion = useReducedMotion();
  const size = 48;
  const stroke = 4.5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(progress, 1));
  // Keep a faint sliver at 0 so a fresh level still reads as a ring, not a dot.
  const dash = circ * Math.max(pct, 0.025);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <defs>
          <linearGradient
            id="level-ring-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="var(--nourish-light-green)" />
            <stop offset="100%" stopColor="var(--nourish-dark-green)" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--nourish-border-strong)"
          strokeWidth={stroke}
        />
        {/* XP progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#level-ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={reducedMotion ? false : { strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </svg>
      {/* Level number — serif for the editorial Sous voice. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-serif text-[16px] font-semibold leading-none text-[var(--nourish-dark)] tabular-nums">
          {level}
        </span>
      </div>
      {/* Earned-level flourish. */}
      <Star
        size={11}
        className="absolute -right-0.5 -top-0.5 text-[var(--nourish-gold)] fill-[var(--nourish-gold)]"
        strokeWidth={1.5}
      />
    </div>
  );
}
