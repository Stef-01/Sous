"use client";

import { useId, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { easeOutExpo } from "./startup-landing-variants";

/**
 * Illustrative weight-over-time chart (static; no interactive points).
 * SVG coords: smaller y = higher on screen = heavier body weight in this sketch.
 * Red: yo-yo pattern (regain/large swings). Green: net loss with small real-life noise.
 */

/** Yo-yo dieting: smooth swings up (regain) and down (lose) — not monotonic. */
const RED_PATH =
  "M 52 96 C 78 138 92 154 112 158 C 132 162 142 64 168 54 C 194 44 208 150 232 158 C 256 166 268 52 302 46 C 328 42 342 145 358 152 C 374 159 382 72 378 88";

/** With Sous: same starting weight as red; gradual net loss (y increases) + ripples. */
function buildGreenRipplePath(): string {
  const x0 = 52;
  const x1 = 378;
  const yStart = 96;
  const yEnd = 160;
  const steps = 64;
  const parts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + t * (x1 - x0));
    const base = yStart + t * (yEnd - yStart);
    const ripple =
      3.2 * Math.sin(i * 0.92) +
      0.9 * Math.sin(i * 2.15) +
      0.5 * Math.sin(i * 3.4);
    const y = Math.round(base + ripple);
    parts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  return parts.join(" ");
}

/** Plot band y=36..168: two guides at equal thirds. */
const GRID_Y_UPPER = 80;
const GRID_Y_LOWER = 124;

export function LandingHeroChart({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const greenPath = useMemo(() => buildGreenRipplePath(), []);

  return (
    <figure className={cn("w-full", className)} aria-labelledby={titleId}>
      <p id={titleId} className="sr-only">
        Illustrative chart of body weight over weeks: yo-yo dieting swings up
        and down; with Sous, weight trends gradually lower with small
        fluctuations.
      </p>

      <div className="rounded-2xl bg-[#f9f8f6] px-2 pb-3 pt-4 md:px-4 md:pb-4 md:pt-5">
        <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
          <span className="max-w-[48%] text-left text-[11px] font-medium leading-snug tracking-wide text-[#c25e5e]">
            Yo-yo dieting
          </span>
          <span className="max-w-[48%] text-right text-[11px] font-medium leading-snug tracking-wide text-[#2d5a3d]">
            With Sous (small steps)
          </span>
        </div>

        <div className="flex items-stretch gap-1.5 sm:gap-2">
          <div className="flex w-8 shrink-0 flex-col items-center justify-center sm:w-9">
            <p className="m-0 origin-center -rotate-90 whitespace-nowrap text-center text-[11px] leading-none text-[#8f959c]">
              Body weight
            </p>
          </div>

          <div className="min-w-0 flex-1">
            <svg
              viewBox="0 0 420 168"
              className="aspect-[35/14] h-auto w-full max-h-[min(46vh,280px)]"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <text
                x="54"
                y="44"
                fill="#b0b6bd"
                fontSize="9"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                Heavier
              </text>
              <text
                x="54"
                y="166"
                fill="#b0b6bd"
                fontSize="9"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                Lighter
              </text>

              <line
                x1="48"
                y1={GRID_Y_UPPER}
                x2="376"
                y2={GRID_Y_UPPER}
                stroke="#d8d4cc"
                strokeWidth="1"
                strokeDasharray="2 6"
              />
              <line
                x1="48"
                y1={GRID_Y_LOWER}
                x2="376"
                y2={GRID_Y_LOWER}
                stroke="#d8d4cc"
                strokeWidth="1"
                strokeDasharray="2 6"
              />

              <line
                x1="48"
                y1="168"
                x2="376"
                y2="168"
                stroke="#e0dcd4"
                strokeWidth="1"
              />
              <line
                x1="48"
                y1="36"
                x2="48"
                y2="168"
                stroke="#e0dcd4"
                strokeWidth="1"
              />

              <motion.path
                d={RED_PATH}
                fill="none"
                stroke="#c25e5e"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: reduceMotion ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: reduceMotion ? 0 : 1.35,
                  ease: easeOutExpo,
                }}
              />
              <motion.path
                d={greenPath}
                fill="none"
                stroke="#2d5a3d"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: reduceMotion ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: reduceMotion ? 0 : 1.45,
                  ease: easeOutExpo,
                  delay: reduceMotion ? 0 : 0.04,
                }}
              />
            </svg>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] leading-snug text-[#8f959c]">
          Time (weeks) →
        </p>
      </div>
    </figure>
  );
}
