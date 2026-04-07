"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Meal, SideDish } from "@/types";

interface InlinePlateProps {
  meal: Meal;
  sides: SideDish[];
  onClose: () => void;
}

interface FoodItem {
  name: string;
  imageUrl: string;
}

/* ── SVG Colored Segment Outlines ─────────────────────────────────── */

function PlateSvgOutline({
  size,
  hasVegs,
  hasProteins,
  hasCarbs,
}: {
  size: number;
  hasVegs: boolean;
  hasProteins: boolean;
  hasCarbs: boolean;
}) {
  const inset = size * (8 / 200);
  const cx = size / 2;
  const cy = size / 2;
  const r = cx - inset;

  const left = cx - r;
  const right = cx + r;
  const bottom = cy + r;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top semicircle — Vegetables (draws itself) */}
      <motion.path
        d={`M ${left},${cy} A ${r},${r} 0 0,1 ${right},${cy}`}
        stroke={hasVegs ? "#22c55e" : "#d6d3d1"}
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.3 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      />
      {/* Bottom-left quarter — Protein (draws itself) */}
      <motion.path
        d={`M ${left},${cy} A ${r},${r} 0 0,0 ${cx},${bottom}`}
        stroke={hasProteins ? "#f43f5e" : "#d6d3d1"}
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.3 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
      />
      {/* Bottom-right quarter — Carbs (draws itself) */}
      <motion.path
        d={`M ${cx},${bottom} A ${r},${r} 0 0,0 ${right},${cy}`}
        stroke={hasCarbs ? "#f97316" : "#d6d3d1"}
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.3 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.0, ease: "easeOut" }}
      />
      {/* Horizontal divider — subtle dashed guide */}
      <motion.line
        x1={left}
        y1={cy}
        x2={right}
        y2={cy}
        stroke="#d6d3d1"
        strokeWidth="0.75"
        strokeOpacity="0.5"
        strokeDasharray="4 3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      />
      {/* Vertical divider (bottom half) — subtle dashed guide */}
      <motion.line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={bottom}
        stroke="#d6d3d1"
        strokeWidth="0.75"
        strokeOpacity="0.5"
        strokeDasharray="4 3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ── Animation Variants ───────────────────────────────────────────── */

const plateSpawnVariants = {
  initial: {
    scale: 0,
    opacity: 0,
    x: -80,
  },
  animate: {
    scale: 1,
    opacity: 1,
    x: 0,
    transition: {
      scale: springs.plop,
      opacity: { duration: 0.1 },
      x: springs.plop,
    },
  },
  exit: {
    scale: 0.6,
    opacity: 0,
    x: -60,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
};

const reducedSpawnVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const sectionsContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const sectionVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springs.wobbly,
  },
};

const reducedSectionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
};

const foodImageVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      scale: springs.spawnPlop,
      opacity: { duration: 0.08 },
    },
  },
};

const labelVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...springs.gentle,
      delay: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: 4,
    transition: { duration: 0.15 },
  },
};

const reducedLabelVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, delay: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/* ── Unified Plate Scaling System ─────────────────────────────────── */
// All food image sizes are proportional to their section area.
// Half-section (vegetables) gets ~60% of plate radius.
// Quarter-sections (protein, carbs) get ~45% of plate radius.
// When 2 items are stacked, each image shrinks by ~25% to fit with overlap.

const PLATE_FOOD = {
  // Single item sizes per section type
  half: {
    single: "w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36",
    stacked: "w-16 h-16 md:w-22 md:h-22 lg:w-24 lg:h-24",
    stackedSizes: "(max-width: 768px) 64px, (max-width: 1024px) 88px, 96px",
    singleSizes: "(max-width: 768px) 96px, (max-width: 1024px) 128px, 144px",
    // Wider section allows more spread
    stackRotate: ["-rotate-6", "rotate-6"],
    stackOffset: [
      "-translate-x-1 md:-translate-x-2",
      "translate-x-1 md:translate-x-2 -ml-6 md:-ml-10",
    ],
  },
  quarter: {
    single: "w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24",
    stacked: "w-11 h-11 md:w-14 md:h-14 lg:w-16 lg:h-16",
    stackedSizes: "(max-width: 768px) 44px, (max-width: 1024px) 56px, 64px",
    singleSizes: "(max-width: 768px) 64px, (max-width: 1024px) 80px, 96px",
    // Tighter section = less spread, gentler rotation
    stackRotate: ["-rotate-3", "rotate-3"],
    stackOffset: ["-translate-x-0.5", "translate-x-0.5 -ml-4 md:-ml-6"],
  },
} as const;

/* ── Component ────────────────────────────────────────────────────── */

const SVG_SIZE = 200;

export default function InlinePlate({
  meal,
  sides,
  onClose,
}: InlinePlateProps) {
  const prefersReduced = useReducedMotion();

  // Categorize foods into plate sections
  const categories = useMemo(() => {
    const vegs: FoodItem[] = [];
    const proteins: FoodItem[] = [];
    const carbs: FoodItem[] = [];

    // Main dish counts as protein
    if (meal) proteins.push({ name: meal.name, imageUrl: meal.heroImageUrl });

    for (const side of sides) {
      const item = { name: side.name, imageUrl: side.imageUrl };
      switch (side.nutritionCategory) {
        case "vegetable":
          vegs.push(item);
          break;
        case "protein":
          proteins.push(item);
          break;
        case "carb":
          carbs.push(item);
          break;
      }
    }

    return { vegs, proteins, carbs };
  }, [meal, sides]);

  const hasVegs = categories.vegs.length > 0;
  const hasProteins = categories.proteins.length > 0;
  const hasCarbs = categories.carbs.length > 0;

  return (
    <motion.div
      className="flex-shrink-0 flex flex-col items-center self-center"
      variants={prefersReduced ? reducedSpawnVariants : plateSpawnVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Plate container — tight padding for labels */}
      <div className="relative pt-5 pb-5 px-5">
        {/* External label: VEGETABLES — top center with badge */}
        <motion.span
          className={`absolute top-0 left-1/2 -translate-x-1/2 text-[10px] md:text-xs lg:text-sm font-sans font-medium uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 ${
            hasVegs
              ? "text-green-700 bg-green-50 px-2 py-0.5 rounded-full"
              : "text-stone-400"
          }`}
          variants={prefersReduced ? reducedLabelVariants : labelVariants}
        >
          <span className="text-xs md:text-sm leading-none">
            {hasVegs ? "\u2713" : "\u2717"}
          </span>
          Vegetables
        </motion.span>

        {/* External label: PROTEIN — bottom-left with badge */}
        <motion.span
          className={`absolute bottom-0 left-1/4 -translate-x-1/2 text-[10px] md:text-xs lg:text-sm font-sans font-medium uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 ${
            hasProteins
              ? "text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full"
              : "text-stone-400"
          }`}
          variants={prefersReduced ? reducedLabelVariants : labelVariants}
        >
          <span className="text-xs md:text-sm leading-none">
            {hasProteins ? "\u2713" : "\u2717"}
          </span>
          Protein
        </motion.span>

        {/* External label: CARBS — bottom-right with badge */}
        <motion.span
          className={`absolute bottom-0 right-1/4 translate-x-1/2 text-[10px] md:text-xs lg:text-sm font-sans font-medium uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 ${
            hasCarbs
              ? "text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full"
              : "text-stone-400"
          }`}
          variants={prefersReduced ? reducedLabelVariants : labelVariants}
        >
          <span className="text-xs md:text-sm leading-none">
            {hasCarbs ? "\u2713" : "\u2717"}
          </span>
          Carbs
        </motion.span>

        {/* Plate circle — w-64 mobile, w-[22rem] md, w-[24rem] lg */}
        <div className="relative w-64 h-64 md:w-[22rem] md:h-[22rem] lg:w-[24rem] lg:h-[24rem]">
          {/* Single SVG — viewBox scales naturally */}
          <PlateSvgOutline
            size={SVG_SIZE}
            hasVegs={hasVegs}
            hasProteins={hasProteins}
            hasCarbs={hasCarbs}
          />

          {/* Outer plate rim — warm porcelain with deep shadow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-stone-50 via-white to-stone-200 shadow-xl ring-2 ring-white" />

          {/* Dismiss ✕ — hugs top-right of plate */}
          <motion.button
            onClick={onClose}
            className="absolute -top-1 -right-1 z-30 w-7 h-7 md:w-8 md:h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center text-nourish-subtext hover:text-nourish-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold"
            aria-label="Close plate method"
            whileHover={prefersReduced ? {} : { scale: 1.15 }}
            whileTap={prefersReduced ? {} : { scale: 0.85 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </motion.button>

          {/* Inner plate surface — warm white with soft inner shadow */}
          <motion.div
            className="absolute inset-2 rounded-full bg-white overflow-hidden"
            style={{ boxShadow: "inset 0 2px 8px 0 rgba(120, 100, 80, 0.08)" }}
            variants={sectionsContainerVariants}
            initial="initial"
            animate="animate"
          >
            {/* Top half — Vegetables (50%) */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-1/2 flex items-center justify-center p-2"
              variants={
                prefersReduced ? reducedSectionVariants : sectionVariants
              }
            >
              {hasVegs ? (
                <div className="relative flex items-center justify-center">
                  {categories.vegs.slice(0, 2).map((food, i) => {
                    const isStacked = categories.vegs.length > 1;
                    const scale = PLATE_FOOD.half;
                    return (
                      <motion.div
                        key={food.name}
                        className={`relative ${isStacked ? scale.stacked : scale.single} rounded-2xl overflow-hidden ${
                          isStacked
                            ? i === 0
                              ? `${scale.stackRotate[0]} ${scale.stackOffset[0]} z-10`
                              : `${scale.stackRotate[1]} ${scale.stackOffset[1]} z-0`
                            : ""
                        }`}
                        variants={prefersReduced ? {} : foodImageVariants}
                      >
                        <Image
                          src={food.imageUrl}
                          alt={food.name}
                          fill
                          className="object-contain"
                          sizes={
                            isStacked ? scale.stackedSizes : scale.singleSizes
                          }
                        />
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.span
                  className="text-[9px] md:text-[10px] text-stone-300/60 font-sans uppercase tracking-wider select-none"
                  variants={prefersReduced ? {} : foodImageVariants}
                >
                  Vegetables
                </motion.span>
              )}
            </motion.div>

            {/* Bottom-left — Protein (25%) — stacked cards when multiple */}
            <motion.div
              className="absolute bottom-0 left-0 w-1/2 h-1/2 flex items-center justify-center p-3"
              variants={
                prefersReduced ? reducedSectionVariants : sectionVariants
              }
            >
              {hasProteins ? (
                <div className="relative flex items-center justify-center">
                  {categories.proteins.slice(0, 2).map((food, i) => {
                    const isStacked = categories.proteins.length > 1;
                    const scale = PLATE_FOOD.quarter;
                    return (
                      <motion.div
                        key={food.name}
                        className={`relative ${isStacked ? scale.stacked : scale.single} rounded-xl overflow-hidden ${
                          isStacked
                            ? i === 0
                              ? `${scale.stackRotate[0]} ${scale.stackOffset[0]} z-10`
                              : `${scale.stackRotate[1]} ${scale.stackOffset[1]} z-0`
                            : ""
                        }`}
                        variants={prefersReduced ? {} : foodImageVariants}
                      >
                        <Image
                          src={food.imageUrl}
                          alt={food.name}
                          fill
                          className="object-contain"
                          sizes={
                            isStacked ? scale.stackedSizes : scale.singleSizes
                          }
                        />
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.span
                  className="text-[9px] md:text-[10px] text-stone-300/60 font-sans uppercase tracking-wider select-none"
                  variants={prefersReduced ? {} : foodImageVariants}
                >
                  Protein
                </motion.span>
              )}
            </motion.div>

            {/* Bottom-right — Carbs (25%) — stacked cards when multiple */}
            <motion.div
              className="absolute bottom-0 right-0 w-1/2 h-1/2 flex items-center justify-center p-3"
              variants={
                prefersReduced ? reducedSectionVariants : sectionVariants
              }
            >
              {hasCarbs ? (
                <div className="relative flex items-center justify-center">
                  {categories.carbs.slice(0, 2).map((food, i) => {
                    const isStacked = categories.carbs.length > 1;
                    const scale = PLATE_FOOD.quarter;
                    return (
                      <motion.div
                        key={food.name}
                        className={`relative ${isStacked ? scale.stacked : scale.single} rounded-xl overflow-hidden ${
                          isStacked
                            ? i === 0
                              ? `${scale.stackRotate[0]} ${scale.stackOffset[0]} z-10`
                              : `${scale.stackRotate[1]} ${scale.stackOffset[1]} z-0`
                            : ""
                        }`}
                        variants={prefersReduced ? {} : foodImageVariants}
                      >
                        <Image
                          src={food.imageUrl}
                          alt={food.name}
                          fill
                          className="object-contain"
                          sizes={
                            isStacked ? scale.stackedSizes : scale.singleSizes
                          }
                        />
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.span
                  className="text-[9px] md:text-[10px] text-stone-300/60 font-sans uppercase tracking-wider select-none"
                  variants={prefersReduced ? {} : foodImageVariants}
                >
                  Carbs
                </motion.span>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
