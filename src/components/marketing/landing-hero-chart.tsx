"use client";

import { useId, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { easeOutExpo } from "./startup-landing-variants";

/**
 * Hero dual-curve chart (reference: static illustration, no hover UI).
 *
 * RCA summary (why live diverged from design):
 * 1. Problem: Axis copy looked wrong vs mock — SVG <text> + rotate + default
 *    baselines clipped/mis-centered labels; X sat inside a cramped viewBox.
 * 2. Evidence: Image 2 shows labels beside axes; our SVG-only labels fought
 *    font metrics and padding (especially Y).
 * 3. Contributing: Heavy ring/card vs flat #f9f8f6 reference; curve endpoints
 *    not matching “red ends mid + uptick / green high start + rippled fall.”
 * 4. Root cause: Typography and layout should use the same stack as the page
 *    (HTML/CSS), not raw SVG text, for rotated English labels.
 * 5. Fix: HTML for both axis titles; SVG holds only geometry; drop duplicate
 *    figcaption (copy lives in DietJourneyComparison).
 */

/** Typical overhaul: smooth yo-yo; ends mid with a slight final uptick. */
const RED_PATH =
  "M 52 96 C 80 158 96 172 118 154 C 140 136 148 54 170 48 C 192 42 204 148 226 156 C 248 164 258 44 288 38 C 312 32 328 150 348 156 C 362 160 368 98 372 102 C 374 104 376 100 378 94";

/** Sous-shaped: starts slightly above red; rippled monotonic drift toward bottom. */
function buildGreenRipplePath(): string {
  const x0 = 52;
  const x1 = 378;
  const yStart = 90;
  const yEnd = 166;
  const steps = 64;
  const parts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + t * (x1 - x0));
    const base = yStart + t * (yEnd - yStart);
    const ripple =
      3.8 * Math.sin(i * 0.92) +
      1.0 * Math.sin(i * 2.15) +
      0.55 * Math.sin(i * 3.4);
    const y = Math.round(base + ripple);
    parts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  return parts.join(" ");
}

export function LandingHeroChart({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const greenPath = useMemo(() => buildGreenRipplePath(), []);

  return (
    <figure className={cn("w-full", className)} aria-labelledby={titleId}>
      <p id={titleId} className="sr-only">
        Illustrative chart comparing a volatile overhaul with Sous-shaped change
        over several weeks.
      </p>

      <div className="rounded-2xl bg-[#f9f8f6] px-2 pb-3 pt-4 md:px-4 md:pb-4 md:pt-5">
        <div className="mb-3 flex items-baseline justify-between gap-4 px-1">
          <span className="text-[11px] font-medium tracking-wide text-[#c25e5e]">
            Typical overhaul
          </span>
          <span className="text-[11px] font-medium tracking-wide text-[#2d5a3d]">
            Sous-shaped change
          </span>
        </div>

        {/* Plot: HTML Y-label (avoids SVG text metric bugs) + geometry-only SVG */}
        <div className="flex items-stretch gap-1 sm:gap-2">
          <div className="flex w-[1.125rem] shrink-0 items-center justify-center sm:w-6">
            <p className="m-0 origin-center -rotate-90 whitespace-nowrap text-[11px] leading-none text-[#8f959c]">
              Sticking with it
            </p>
          </div>

          <div className="min-w-0 flex-1">
            <svg
              viewBox="0 0 420 168"
              className="aspect-[35/14] h-auto w-full max-h-[min(46vh,280px)]"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <line
                x1="48"
                y1="72"
                x2="376"
                y2="72"
                stroke="#d8d4cc"
                strokeWidth="1"
                strokeDasharray="2 6"
              />
              <line
                x1="48"
                y1="128"
                x2="376"
                y2="128"
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
