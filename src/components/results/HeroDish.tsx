"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Meal } from "@/types";
import { springs, spawnScaleKeyframes, squashStretchKeyframes } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface HeroDishProps {
  meal: Meal;
  onClick?: () => void;
  hideLabel?: boolean;
}

// Video game spawn — multi-phase scale from 0 with overshoot bounces
const heroSpawnVariants = {
  initial: {
    scale: 0,
    opacity: 0,
    y: -60,
  },
  animate: {
    scale: spawnScaleKeyframes.scale,
    opacity: 1,
    y: 0,
    transition: {
      scale: {
        duration: 0.7,
        times: spawnScaleKeyframes.times,
        ease: "easeOut" as const,
      },
      opacity: { duration: 0.1 },
      y: {
        type: "spring" as const,
        stiffness: 350,
        damping: 22,
        mass: 1,
      },
    },
  },
  exit: {
    scale: 0.5,
    opacity: 0,
    y: 40,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
};

// Squash-stretch on landing (applied to inner container)
const squashStretchVariants = {
  initial: {
    scaleX: 1,
    scaleY: 1,
  },
  animate: {
    scaleX: squashStretchKeyframes.scaleX,
    scaleY: squashStretchKeyframes.scaleY,
    transition: {
      duration: 0.4,
      delay: 0.35,
      times: squashStretchKeyframes.times,
      ease: "easeOut" as const,
    },
  },
};

const labelVariants = {
  initial: { opacity: 0, y: 20, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...springs.gentle,
      delay: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.15 },
  },
};

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export default function HeroDish({ meal, onClick, hideLabel = false }: HeroDishProps) {
  const [imgError, setImgError] = useState(false);
  const [showGlowRing, setShowGlowRing] = useState(true);
  const prefersReduced = useReducedMotion();

  // Reset glow ring on meal change
  useEffect(() => {
    setShowGlowRing(true);
    const timer = setTimeout(() => setShowGlowRing(false), 600);
    return () => clearTimeout(timer);
  }, [meal.id]);

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer"
      variants={prefersReduced ? reducedVariants : heroSpawnVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      key={meal.id}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${meal.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <motion.div
        className="relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden"
        whileHover={prefersReduced ? {} : {
          scale: 1.04,
          y: -6,
        }}
        transition={springs.gentle}
      >
        {/* Squash-stretch inner wrapper */}
        <motion.div
          className="relative w-full h-full"
          variants={prefersReduced ? {} : squashStretchVariants}
          initial="initial"
          animate="animate"
        >
          {/* Spawn glow ring effect */}
          {!prefersReduced && showGlowRing && (
            <div className="spawn-glow-ring" />
          )}

          {imgError ? (
            <div className="w-full h-full bg-nourish-input flex items-center justify-center rounded-2xl">
              <span className="text-nourish-subtext text-sm text-center px-4">
                {meal.name}
              </span>
            </div>
          ) : (
            <Image
              src={meal.heroImageUrl}
              alt={`Dish: ${meal.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 224px, (max-width: 1024px) 288px, 320px"
              priority
              onError={() => setImgError(true)}
            />
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {!hideLabel && (
          <motion.p
            className="mt-4 text-lg font-serif text-nourish-dark text-center"
            variants={prefersReduced ? reducedVariants : labelVariants}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.15 } }}
          >
            {meal.name}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
