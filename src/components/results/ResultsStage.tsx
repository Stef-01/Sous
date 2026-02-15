"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Meal, SideDish, PairingScore } from "@/types";
import HeroDish from "./HeroDish";
import SideDishCard from "./SideDishCard";
import SideDishCardMobile from "./SideDishCardMobile";
import DishDetailModal from "./DishDetailModal";
import InlinePlate from "./InlinePlate";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { springs, spawnStagger } from "@/lib/motion";

// Extract pairing score from a SideWithScore object (if present)
function getPairingScore(side: SideDish): PairingScore | undefined {
  return (side as SideDish & { pairingScore?: PairingScore }).pairingScore;
}

/* ── Scrapbook mode constants ─────────────────────────────────────── */
const SCRAPBOOK_ROTATIONS = [-5, 3, 6, -3]; // side0, hero, side1, side2
const SCRAPBOOK_SCALE = 0.48;

interface ResultsStageProps {
  meal: Meal;
  sides: SideDish[];
  onSwap: (index: number) => void;
  showPlateMethod?: boolean;
  onClosePlate?: () => void;
  appraisal?: {
    sentence: string;
    tone: "balanced" | "strong" | "needs-work";
  } | null;
}

interface SelectedDish {
  name: string;
  imageUrl: string;
  description: string;
  cuisine?: string;
  tags?: string[];
  sideIndex?: number;
  pairingRationale?: string;
}

// Enhanced stagger with dramatic spawn-like timing
const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: spawnStagger.delayBetweenItems,
      delayChildren: spawnStagger.initialDelay,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.06,
      staggerDirection: -1,
    },
  },
};

const reducedContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {},
};

// Hero spawns first — near-instant wrapper opacity
const heroContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.05 },
  },
};

// Side dishes get staggered delay so they spawn after hero settles
const getSideContainerVariants = (index: number) => ({
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.05,
      delay: 0.35 + index * spawnStagger.delayBetweenItems,
    },
  },
});

const childVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function ResultsStage({
  meal,
  sides,
  onSwap,
  showPlateMethod = false,
  onClosePlate,
  appraisal,
}: ResultsStageProps) {
  const prefersReduced = useReducedMotion();
  const [selectedDish, setSelectedDish] = useState<SelectedDish | null>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const handleHeroClick = () => {
    setSelectedDish({
      name: meal.name,
      imageUrl: meal.heroImageUrl,
      description: meal.description,
      cuisine: meal.cuisine,
    });
  };

  const handleSideClick = (side: SideDish, index: number) => {
    const score = getPairingScore(side);
    setSelectedDish({
      name: side.name,
      imageUrl: side.imageUrl,
      description: side.description,
      tags: side.tags,
      sideIndex: index,
      pairingRationale: score?.reasons[0] ?? side.pairingReason,
    });
  };

  // Appraisal tone color mapping
  const appraisalColor =
    appraisal?.tone === "balanced"
      ? "text-nourish-green"
      : appraisal?.tone === "needs-work"
        ? "text-amber-600"
        : "text-stone-500";

  return (
    <>
      <motion.div
        className="w-full max-w-6xl mx-auto mt-4 px-4 sm:px-6 h-full flex flex-col justify-center relative"
        role="region"
        aria-label="Meal pairing results"
        aria-live="polite"
        variants={prefersReduced ? reducedContainerVariants : containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Appraisal Text — Only visible in plate mode */}
        <AnimatePresence>
          {showPlateMethod && appraisal && (
            <motion.div
              className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center -mt-16 z-20 pointer-events-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className={`text-lg md:text-xl font-serif text-center ${appraisalColor}`}>
                {appraisal.sentence}
              </p>

              {/* Back button (replaces "Hide Plate") */}
              {onClosePlate && (
                <button
                  onClick={onClosePlate}
                  className="mt-3 pointer-events-auto text-sm text-nourish-subtext hover:text-nourish-dark underline underline-offset-4 decoration-stone-300 transition-colors"
                >
                  Back to meal
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop layout */}
        <div
          className={`hidden md:flex items-center ${showPlateMethod
            ? "justify-center gap-16 lg:gap-24" // Much wider gap for separation
            : "justify-center gap-10 lg:gap-14"
            }`}
        >
          {/* Inline plate — centered in its column */}
          <AnimatePresence>
            {showPlateMethod && onClosePlate && (
              <motion.div
                key="plate-wrapper"
                layout
                className="flex items-center justify-center"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={springs.modal}
              >
                <InlinePlate
                  key="inline-plate"
                  meal={meal}
                  sides={sides}
                  onClose={onClosePlate}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Food cluster — removed negative margins for clean grid layout */}
          <motion.div
            layout
            transition={{ ...springs.modal, duration: 0.6 }} // Slower, smoother transition
            className={`relative flex items-center transition-all duration-500 ease-in-out ${showPlateMethod ? "gap-0" : "gap-10 lg:gap-14"
              }`}
          >
            {/* Subtle shadow pool options — kept but sized correctly */}
            {showPlateMethod && (
              <div
                className="absolute inset-0 -inset-x-8 -inset-y-4 pointer-events-none rounded-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(168, 162, 158, 0.08) 0%, transparent 70%)",
                }}
              />
            )}

            {/* Left side dish */}
            <motion.div
              layout
              transition={springs.modal}
              className={`flex-shrink-0 self-center ${showPlateMethod ? "-mr-16 lg:-mr-24" : ""
                }`}
              animate={
                prefersReduced
                  ? {}
                  : {
                    rotate: showPlateMethod ? SCRAPBOOK_ROTATIONS[0] : 0,
                    scale: showPlateMethod ? SCRAPBOOK_SCALE : 1,
                  }
              }
              variants={
                prefersReduced ? childVariants : getSideContainerVariants(0)
              }
            >
              <AnimatePresence mode="wait">
                {sides[0] && (
                  <SideDishCard
                    key={sides[0].id}
                    side={sides[0]}
                    index={0}
                    onSwap={onSwap}
                    onClick={() => handleSideClick(sides[0], 0)}
                    pairingScore={getPairingScore(sides[0])}
                    hideControls={showPlateMethod}
                    enableRegenerationDelay={hasMounted.current}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Hero center */}
            <motion.div
              layout
              transition={springs.modal}
              className={`flex-shrink-0 ${showPlateMethod ? "-mx-12 lg:-mx-20" : ""
                }`}
              animate={
                prefersReduced
                  ? {}
                  : {
                    rotate: showPlateMethod ? SCRAPBOOK_ROTATIONS[1] : 0,
                    scale: showPlateMethod ? SCRAPBOOK_SCALE : 1,
                  }
              }
              variants={
                prefersReduced ? childVariants : heroContainerVariants
              }
            >
              <AnimatePresence mode="wait">
                <HeroDish
                  key={meal.id}
                  meal={meal}
                  onClick={handleHeroClick}
                  hideLabel={showPlateMethod}
                />
              </AnimatePresence>
            </motion.div>

            {/* Right side dishes */}
            <motion.div
              layout
              transition={springs.modal}
              className={`flex-shrink-0 flex flex-col ${showPlateMethod ? "gap-1 -ml-16 lg:-ml-24" : "gap-4"
                }`}
            >
              <motion.div
                animate={
                  prefersReduced
                    ? {}
                    : {
                      rotate: showPlateMethod ? SCRAPBOOK_ROTATIONS[2] : 0,
                      scale: showPlateMethod ? SCRAPBOOK_SCALE : 1,
                    }
                }
                transition={springs.modal}
                variants={
                  prefersReduced ? childVariants : getSideContainerVariants(1)
                }
              >
                <AnimatePresence mode="wait">
                  {sides[1] && (
                    <SideDishCard
                      key={sides[1].id}
                      side={sides[1]}
                      index={1}
                      onSwap={onSwap}
                      onClick={() => handleSideClick(sides[1], 1)}
                      pairingScore={getPairingScore(sides[1])}
                      hideControls={showPlateMethod}
                      enableRegenerationDelay={hasMounted.current}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
              <motion.div
                animate={
                  prefersReduced
                    ? {}
                    : {
                      rotate: showPlateMethod ? SCRAPBOOK_ROTATIONS[3] : 0,
                      scale: showPlateMethod ? SCRAPBOOK_SCALE : 1,
                    }
                }
                transition={springs.modal}
                variants={
                  prefersReduced ? childVariants : getSideContainerVariants(2)
                }
              >
                <AnimatePresence mode="wait">
                  {sides[2] && (
                    <SideDishCard
                      key={sides[2].id}
                      side={sides[2]}
                      index={2}
                      onSwap={onSwap}
                      onClick={() => handleSideClick(sides[2], 2)}
                      pairingScore={getPairingScore(sides[2])}
                      hideControls={showPlateMethod}
                      enableRegenerationDelay={hasMounted.current}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile layout — vertical stack */}
        <div className="flex md:hidden flex-col items-center gap-4">
          <AnimatePresence>
            {showPlateMethod && appraisal && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full text-center px-4 mb-2"
              >
                <p className={`text-sm font-medium ${appraisalColor}`}>{appraisal.sentence}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={
              prefersReduced ? childVariants : heroContainerVariants
            }
          >
            <AnimatePresence mode="wait">
              <HeroDish
                key={meal.id}
                meal={meal}
                onClick={handleHeroClick}
              />
            </AnimatePresence>
          </motion.div>

          {/* Inline plate — below hero on mobile */}
          <AnimatePresence>
            {showPlateMethod && onClosePlate && (
              <div className="flex flex-col items-center gap-4">
                <InlinePlate
                  key="inline-plate-mobile"
                  meal={meal}
                  sides={sides}
                  onClose={onClosePlate}
                />
                {/* Mobile Back button */}
                <button
                  onClick={onClosePlate}
                  className="text-sm text-nourish-subtext underline underline-offset-4"
                >
                  Back to meal
                </button>
              </div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2 w-full max-w-md">
            <AnimatePresence mode="wait">
              {sides.map((side, i) => (
                <motion.div
                  key={side.id}
                  variants={
                    prefersReduced
                      ? childVariants
                      : getSideContainerVariants(i)
                  }
                  {...(!prefersReduced && {
                    initial: "initial",
                    whileInView: "animate",
                    viewport: { once: true, amount: 0.3 },
                  })}
                >
                  <SideDishCardMobile
                    side={side}
                    index={i}
                    onSwap={onSwap}
                    onClick={() => handleSideClick(side, i)}
                    pairingScore={getPairingScore(side)}
                    enableRegenerationDelay={hasMounted.current}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Dish detail modal */}
      <DishDetailModal
        open={!!selectedDish}
        onClose={() => setSelectedDish(null)}
        dish={selectedDish}
        onSwapSide={(index) => {
          onSwap(index);
          setSelectedDish(null);
        }}
      />
    </>
  );
}
