"use client";

import { useId, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { easeOutExpo } from "./startup-landing-variants";

/**
 * Illustrative dual-curve chart aligned to marketing reference art (420×200 viewBox).
 * Axes: Y "Sticking with it", X "Time (weeks) →". Two horizontal dotted guides only.
 * Red: smooth volatile "typical overhaul". Green: rippled downward drift (reference art).
 */

/** Smooth yo-yo (SVG coords): start mid → valley → rebound → valley → highest peak → settle mid. */
const RED_PATH =
  "M 52 96 C 78 152 92 168 112 156 C 132 144 142 58 162 52 C 182 46 198 150 218 158 C 238 166 252 48 282 42 C 308 36 322 152 342 158 C 358 162 368 72 372 92";

/** Green: linear base 88→162 plus small high-frequency ripples (polyline, integer coords). */
function buildGreenRipplePath(): string {
  const x0 = 52;
  const x1 = 372;
  const yStart = 88;
  const yEnd = 162;
  const steps = 56;
  const parts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + t * (x1 - x0));
    const base = yStart + t * (yEnd - yStart);
    const ripple =
      4 * Math.sin(i * 0.88) + 1.1 * Math.sin(i * 2.05) + 0.6 * Math.sin(i * 3.2);
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
        Illustrative chart: volatile overhaul compared with steadier Sous-shaped
        change over time.
      </p>

      <div className="relative rounded-2xl bg-[#f6f5f2] px-3 pb-1 pt-4 ring-1 ring-[#e8e6e1] md:px-5 md:pt-5">
        <div className="mb-3 flex items-baseline justify-between gap-4 px-0.5">
          <span className="text-[11px] font-medium tracking-wide text-[#b85555]">
            Typical overhaul
          </span>
          <span className="text-[11px] font-medium tracking-wide text-[#2d5a3d]">
            Sous-shaped change
          </span>
        </div>

        <svg
          viewBox="0 0 420 200"
          className="h-auto w-full max-h-[min(46vh,280px)] overflow-visible"
          aria-hidden
        >
          <line
            x1="48"
            y1="72"
            x2="376"
            y2="72"
            stroke="#d4d0c8"
            strokeWidth="1"
            strokeDasharray="2 6"
          />
          <line
            x1="48"
            y1="128"
            x2="376"
            y2="128"
            stroke="#d4d0c8"
            strokeWidth="1"
            strokeDasharray="2 6"
          />

          <line
            x1="48"
            y1="168"
            x2="376"
            y2="168"
            stroke="#dcd8d2"
            strokeWidth="1"
          />
          <line
            x1="48"
            y1="36"
            x2="48"
            y2="168"
            stroke="#dcd8d2"
            strokeWidth="1"
          />

          <text
            x="212"
            y="190"
            textAnchor="middle"
            fill="#8f959c"
            fontSize="11"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Time (weeks) →
          </text>
          <text
            x="17"
            y="104"
            textAnchor="middle"
            fill="#8f959c"
            fontSize="11"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            transform="rotate(-90 17 104)"
          >
            Sticking with it
          </text>

          <motion.path
            d={RED_PATH}
            fill="none"
            stroke="#c25e5e"
            strokeWidth="2.25"
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
            strokeWidth="2.2"
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

      <figcaption className="mt-4 text-[12px] leading-relaxed text-[#6b7280]">
        Illustrative model only, not a clinical trial. Real life is messier; the
        point is small, repeated wins vs. intensity that your week can&apos;t
        sustain.
      </figcaption>
    </figure>
  );
}
