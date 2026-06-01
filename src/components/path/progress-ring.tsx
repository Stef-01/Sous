"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * ProgressRing — a reusable bespoke circular-progress dial that frames whatever
 * you put inside it (a skill glyph, a count, an avatar). Same crafted language
 * as the header LevelRing, so progress reads consistently across Path. Custom
 * SVG: one arc animated via strokeDashoffset, reduced-motion gated.
 */
export function ProgressRing({
  progress,
  size = 56,
  stroke = 4,
  children,
  delay = 0.2,
}: {
  /** 0–1. */
  progress: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(progress, 1));
  const dash = circ * Math.max(pct, 0.025);
  const gradId = `ring-grad-${size}-${stroke}`;

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
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--nourish-light-green)" />
            <stop offset="100%" stopColor="var(--nourish-dark-green)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--nourish-border-strong)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={reducedMotion ? false : { strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, delay, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
