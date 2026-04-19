"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { easeOutExpo } from "./startup-landing-variants";

/**
 * Illustrative dual-curve chart: volatile "typical overhaul" vs steady Sous-shaped progress.
 * Y = how sustainable it feels (higher on the chart = easier to stay with it).
 * Hover targets explain each phase of the curve.
 */

const RED_PATH =
  "M 52 108 C 78 150 92 162 108 156 C 124 150 132 52 152 48 C 172 44 182 148 202 158 C 222 168 232 46 258 42 C 284 38 298 152 318 158 C 338 164 352 72 368 68";

const GREEN_PATH =
  "M 52 118 C 88 112 118 98 148 92 C 178 86 198 78 228 68 C 258 58 288 52 318 46 C 338 42 352 38 368 34";

type HoverPoint = {
  id: string;
  curve: "red" | "green";
  cx: number;
  cy: number;
  title: string;
  detail: string;
};

const HOVER_POINTS: HoverPoint[] = [
  {
    id: "r1",
    curve: "red",
    cx: 56,
    cy: 108,
    title: "The launch",
    detail:
      "A full swap: new foods, strict rules, and willpower that has to carry everything at once.",
  },
  {
    id: "r2",
    curve: "red",
    cx: 108,
    cy: 156,
    title: "First crash",
    detail:
      "The week gets noisy. Hunger, schedule, and taste preferences do not match the script.",
  },
  {
    id: "r3",
    curve: "red",
    cx: 152,
    cy: 48,
    title: "Guilt spike",
    detail:
      "Another restart, often driven by shame rather than a plan that fits the life you have.",
  },
  {
    id: "r4",
    curve: "red",
    cx: 258,
    cy: 42,
    title: "Another surge",
    detail:
      "Short burst of compliance. The same rigid rules, so the rebound is built in.",
  },
  {
    id: "r5",
    curve: "red",
    cx: 368,
    cy: 68,
    title: "The familiar landing",
    detail:
      "Below where you hoped to be, tired of the on-off cycle, not because you failed, but because the model did.",
  },
  {
    id: "g1",
    curve: "green",
    cx: 56,
    cy: 118,
    title: "Same mains, new sides",
    detail:
      "You keep cooking what you already like. Vegetable-forward sides slip in without a fight.",
  },
  {
    id: "g2",
    curve: "green",
    cx: 148,
    cy: 92,
    title: "Library mains",
    detail:
      "Full plates from the catalog layer in when you are ready, not on day one.",
  },
  {
    id: "g3",
    curve: "green",
    cx: 258,
    cy: 58,
    title: "Less strain",
    detail:
      "Habits compound. The week asks less of you because the food still tastes like yours.",
  },
  {
    id: "g4",
    curve: "green",
    cx: 368,
    cy: 34,
    title: "A rhythm that holds",
    detail:
      "Not perfection. A line you can repeat: small wins, real food, room for Wednesday.",
  },
];

export function LandingHeroChart({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);
  const titleId = useId();

  return (
    <figure
      className={cn("w-full", className)}
      aria-labelledby={titleId}
      onPointerLeave={() => setOpenId(null)}
    >
      <p id={titleId} className="sr-only">
        Illustrative chart comparing a volatile overhaul diet with gradual
        Sous-shaped change over several weeks. Hover points on the lines for
        explanations.
      </p>

      <div className="relative rounded-2xl border border-[#eceef2]/80 bg-[#fafaf9] px-3 py-4 shadow-[0_1px_0_rgba(15,20,28,0.04)] md:px-5 md:py-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <span className="text-[11px] font-medium text-[#c25e5e]">
            Typical overhaul
          </span>
          <span className="text-[11px] font-medium text-[#2d5a3d]">
            Sous-shaped change
          </span>
        </div>

        <svg
          viewBox="0 0 420 200"
          className="h-auto w-full max-h-[min(52vh,320px)] overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id="heroChartGrid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3f4f6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f9faf8" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Axes */}
          <line
            x1="44"
            y1="172"
            x2="384"
            y2="172"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          <line
            x1="44"
            y1="28"
            x2="44"
            y2="172"
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          {[52, 88, 124, 160].map((y) => (
            <line
              key={y}
              x1="44"
              y1={y}
              x2="384"
              y2={y}
              stroke="url(#heroChartGrid)"
              strokeWidth="1"
              strokeDasharray="3 6"
            />
          ))}

          <text
            x="214"
            y="196"
            textAnchor="middle"
            fill="#9aa0a6"
            fontSize="10"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Time (weeks)
          </text>
          <text
            x="14"
            y="104"
            textAnchor="middle"
            fill="#9aa0a6"
            fontSize="10"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            transform="rotate(-90 14 104)"
          >
            Easier to stick with
          </text>

          <motion.path
            d={RED_PATH}
            fill="none"
            stroke="#c25e5e"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5 6"
            initial={{ pathLength: reduceMotion ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: reduceMotion ? 0 : 1.45,
              ease: easeOutExpo,
            }}
          />
          <motion.path
            d={GREEN_PATH}
            fill="none"
            stroke="#2d5a3d"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduceMotion ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: reduceMotion ? 0 : 1.55,
              ease: easeOutExpo,
              delay: reduceMotion ? 0 : 0.08,
            }}
          />

          {HOVER_POINTS.map((p) => {
            const active = openId === p.id;
            return (
              <g key={p.id}>
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r="18"
                  fill="transparent"
                  className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#2d5a3d]/50 focus-visible:ring-offset-2"
                  onPointerEnter={() => setOpenId(p.id)}
                  onFocus={() => setOpenId(p.id)}
                  onBlur={() => setOpenId(null)}
                  tabIndex={0}
                />
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={active ? 6 : 4}
                  fill={p.curve === "red" ? "#c25e5e" : "#2d5a3d"}
                  stroke="#fff"
                  strokeWidth="2"
                  className="pointer-events-none transition-all duration-200"
                  style={{
                    filter: active
                      ? "drop-shadow(0 2px 6px rgba(0,0,0,0.12))"
                      : undefined,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip panel: below chart on mobile, floating on md+ */}
        <div className="relative mt-4 min-h-[5.5rem] px-1 md:min-h-[4.75rem]">
          {openId ? (
            (() => {
              const p = HOVER_POINTS.find((h) => h.id === openId);
              if (!p) return null;
              return (
                <motion.div
                  key={p.id}
                  role="tooltip"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: easeOutExpo }}
                  className="rounded-xl border border-[#e8eaef] bg-white px-4 py-3 text-left shadow-[0_10px_28px_rgba(15,20,28,0.08)]"
                >
                  <p
                    className={cn(
                      "text-[12px] font-semibold",
                      p.curve === "red" ? "text-[#a84848]" : "text-[#2d5a3d]",
                    )}
                  >
                    {p.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#4b5563]">
                    {p.detail}
                  </p>
                </motion.div>
              );
            })()
          ) : (
            <p className="text-center text-[12px] text-[#9aa0a6] md:text-left">
              Hover or focus a dot on either line.
            </p>
          )}
        </div>
      </div>

      <figcaption className="mt-4 text-center text-[12px] leading-relaxed text-[#6b7280] md:text-left">
        Illustrative model, not a clinical trial. The point is small, repeated
        wins over intensity your week cannot sustain.
      </figcaption>
    </figure>
  );
}
