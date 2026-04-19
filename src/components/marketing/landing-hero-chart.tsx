"use client";

import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { easeOutExpo } from "./startup-landing-variants";

/**
 * Body weight (kg) over weeks. SVG: smaller y = higher on screen = heavier.
 * Red: yo-yo relapse cycle. Green: progressive Sous path (sides → mains → full plates).
 */

const RED_PATH =
  "M 52 96 C 78 138 92 154 112 158 C 132 162 142 64 168 54 C 194 44 208 150 232 158 C 256 166 268 52 302 46 C 328 42 342 145 358 152 C 374 159 382 72 378 88";

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

const GRID_Y_UPPER = 80;
const GRID_Y_LOWER = 124;

/** Illustrative axis: 98 → 88 kg across the plot (−10 kg span). Copy cites 4–10 kg sustained loss. */
const KG_TOP = 98;
const KG_MID = 93;
const KG_BOTTOM = 88;

const TIMELINE_ZONES = [
  {
    yoyo: "Aggressive rules and a sharp early drop — then real-life meals and stress hit. Regain starts while you are still blaming willpower, not the setup.",
    sous: "You add vegetable-forward sides to what you already cook. No full-diet swap: the week stays doable while calories edge down.",
  },
  {
    yoyo: "The relapse loop: another hard restart, the same all-or-nothing rules, and weight swinging back while motivation burns out.",
    sous: "You fold in mains from the library when you are ready — same flavors you like, realistic portions, not a spreadsheet meal plan.",
  },
  {
    yoyo: "Big swings without a stable system: regain wins again, the cycle restarts, and the struggle feels like a personal failure.",
    sous: "Full plates and short cook flows stack week to week. Many people land in about a 4–10 kg sustained loss because the path is repeatable, not heroic.",
  },
] as const;

export function LandingHeroChart({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const liveId = useId();
  const greenPath = useMemo(() => buildGreenRipplePath(), []);
  const [zone, setZone] = useState<number | null>(null);

  return (
    <figure className={cn("w-full", className)} aria-labelledby={titleId}>
      <p id={titleId} className="sr-only">
        Chart of body weight in kilograms over weeks: yo-yo dieting versus
        progressive steps with Sous. Three timeline segments explain each phase.
      </p>

      <div
        className="rounded-2xl bg-[#f9f8f6] px-2 pb-3 pt-4 md:px-4 md:pb-4 md:pt-5"
        onMouseLeave={() => setZone(null)}
      >
        <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
          <span className="max-w-[48%] text-left text-[11px] font-medium leading-snug tracking-wide text-[#c25e5e]">
            Yo-yo dieting
          </span>
          <span className="max-w-[48%] text-right text-[11px] font-medium leading-snug tracking-wide text-[#2d5a3d]">
            With Sous (small steps)
          </span>
        </div>

        <div className="flex items-stretch gap-1.5 sm:gap-2">
          <div className="flex w-9 shrink-0 flex-col items-center justify-center sm:w-10">
            <p className="m-0 origin-center -rotate-90 whitespace-nowrap text-center text-[11px] leading-none text-[#8f959c]">
              Body weight (kg)
            </p>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div
              className="min-h-[5.25rem] rounded-lg border border-[#e8e6e1]/80 bg-white/75 px-2.5 py-2 shadow-[0_1px_0_rgba(15,20,28,0.04)] md:min-h-[5.5rem] md:px-3"
              aria-live="polite"
              aria-atomic="true"
              id={liveId}
            >
              {zone !== null ? (
                <div className="space-y-2 text-[11px] leading-snug md:text-[12px]">
                  <p className="text-[#a04545]">
                    <span className="font-semibold">Yo-yo: </span>
                    {TIMELINE_ZONES[zone].yoyo}
                  </p>
                  <p className="text-[#234a32]">
                    <span className="font-semibold">With Sous: </span>
                    {TIMELINE_ZONES[zone].sous}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] leading-snug text-[#9aa0a6] md:text-[12px]">
                  Illustrative kg scale (98–88 kg). Early, middle, and late
                  weeks on the chart compare relapse cycles with layering sides,
                  then mains, then full plates; sustained change is often in the
                  4–10 kg range.
                </p>
              )}
            </div>

            <div className="relative aspect-[35/14] w-full max-h-[min(46vh,280px)]">
              <svg
                viewBox="0 0 420 168"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden
              >
                <text
                  x="50"
                  y="40"
                  fill="#8f959c"
                  fontSize="9"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {KG_TOP} kg
                </text>
                <text
                  x="50"
                  y="104"
                  fill="#8f959c"
                  fontSize="9"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {KG_MID} kg
                </text>
                <text
                  x="50"
                  y="166"
                  fill="#8f959c"
                  fontSize="9"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {KG_BOTTOM} kg
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

              <div
                className="absolute inset-0 z-10 flex"
                role="presentation"
                aria-describedby={liveId}
              >
                {TIMELINE_ZONES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    tabIndex={0}
                    className={cn(
                      "h-full min-h-[120px] flex-1 cursor-default border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5a3d]/35 focus-visible:ring-offset-1",
                      zone === i && "bg-[#2d5a3d]/[0.05]",
                    )}
                    aria-label={`Weeks ${i === 0 ? "early" : i === 1 ? "middle" : "late"}: compare yo-yo dieting with Sous`}
                    onMouseEnter={() => setZone(i)}
                    onFocus={() => setZone(i)}
                    onBlur={(e) => {
                      const next = e.relatedTarget;
                      if (
                        next instanceof Node &&
                        !e.currentTarget.parentElement?.contains(next)
                      ) {
                        setZone(null);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] leading-snug text-[#8f959c]">
          Time (weeks) →
        </p>
      </div>
    </figure>
  );
}
