"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { SideDish, PairingScore } from "@/types";
import { springs, spawnScaleKeyframes, wobbleRotationKeyframes } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import HoverCard from "./HoverCard";
import SparkleEffect from "@/components/ui/SparkleEffect";
import MagicalLoader from "@/components/ui/MagicalLoader";

interface SideDishCardProps {
  side: SideDish;
  index: number;
  onSwap: (index: number) => void;
  onClick?: () => void;
  pairingScore?: PairingScore;
  hideControls?: boolean;
}

// Each side dish spawns from a unique direction — exaggerated for drama
const getSpawnOrigin = (index: number) => {
  const origins = [
    { x: -100, y: 60, rotate: -25 },   // Left: arcs in from lower-left
    { x: 80, y: -80, rotate: 15 },     // Upper-right: drops in from sky
    { x: 100, y: 80, rotate: 20 },     // Lower-right: bounces in
  ];
  return origins[index % 3];
};

// Video game collectible spawn variants
const getSpawnVariants = (index: number) => {
  const origin = getSpawnOrigin(index);

  return {
    initial: {
      scale: 0,
      opacity: 0,
      x: origin.x,
      y: origin.y,
      rotate: origin.rotate,
    },
    animate: {
      scale: spawnScaleKeyframes.scale,
      opacity: 1,
      x: 0,
      y: 0,
      rotate: wobbleRotationKeyframes.rotate,
      transition: {
        scale: {
          duration: 0.65,
          times: spawnScaleKeyframes.times,
          ease: "easeOut" as const,
        },
        opacity: { duration: 0.08 },
        x: {
          type: "spring" as const,
          stiffness: 280,
          damping: 18,
          mass: 0.9,
        },
        y: {
          type: "spring" as const,
          stiffness: 320,
          damping: 16,
          mass: 0.9,
        },
        rotate: {
          duration: 0.55,
          times: wobbleRotationKeyframes.times,
          ease: "easeOut" as const,
        },
      },
    },
    exit: {
      scale: 0.3,
      opacity: 0,
      x: origin.x * 0.8,
      y: origin.y * 0.8,
      rotate: origin.rotate * 0.8,
      transition: {
        duration: 0.22,
        ease: [0.4, 0, 1, 1] as const,
      },
    },
  };
};

// Squash-stretch for the landing (subtle)
const squashVariants = {
  initial: { scaleX: 1, scaleY: 1 },
  animate: {
    scaleX: [1, 1.06, 0.97, 1.02, 1],
    scaleY: [1, 0.94, 1.04, 0.98, 1],
    transition: {
      duration: 0.3,
      delay: 0.3,
      times: [0, 0.3, 0.5, 0.75, 1],
      ease: "easeOut" as const,
    },
  },
};

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export default function SideDishCard({ side, index, onSwap, onClick, pairingScore, hideControls = false }: SideDishCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [swapKey, setSwapKey] = useState(0);
  const [showGlow, setShowGlow] = useState(true);
  const [showHoverCard, setShowHoverCard] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReduced = useReducedMotion();

  const variants = prefersReduced ? reducedVariants : getSpawnVariants(index);

  // Subtle ambient float after spawn settles
  const [hasSpawned, setHasSpawned] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHasSpawned(true), 1000);
    return () => clearTimeout(timer);
  }, [side.id]);

  // Reset glow + image readiness on side dish change
  useEffect(() => {
    setShowGlow(true);
    setImageReady(false);
    setMinTimeElapsed(false);
    setImgError(false);

    // Ensure at least 2.5s of "magical" loading time
    const minTimer = setTimeout(() => setMinTimeElapsed(true), 2500);
    const glowTimer = setTimeout(() => setShowGlow(false), 500);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(glowTimer);
    };
  }, [side.id]);

  // Clean up hover timers
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    hoverTimerRef.current = setTimeout(() => {
      setShowHoverCard(true);
    }, 300);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    leaveTimerRef.current = setTimeout(() => {
      setShowHoverCard(false);
    }, 200);
  }, []);

  const handleSwap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSwapKey((k) => k + 1);
    onSwap(index);
  };

  const handleHoverCardSwap = () => {
    setShowHoverCard(false);
    setSwapKey((k) => k + 1);
    onSwap(index);
  };

  return (
    <motion.div
      className={`group relative flex flex-col items-center cursor-pointer ${hasSpawned && !prefersReduced ? "ambient-float" : ""
        }`}
      style={hasSpawned && !prefersReduced ? { animationDelay: `${index * 0.7}s` } : undefined}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${side.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={
        prefersReduced
          ? {}
          : {
            y: -8,
            scale: 1.02,
            transition: { type: "spring", stiffness: 300, damping: 35 } // Less bouncy, more floaty
          }
      }
      whileTap={prefersReduced ? {} : { scale: 0.95 }}
    >
      {/* Hover card — desktop only, hidden on touch devices */}
      <div className="hidden hover-hover:block">
        <AnimatePresence>
          {showHoverCard && (
            <HoverCard side={side} onSwap={handleHoverCardSwap} />
          )}
        </AnimatePresence>
      </div>
      {/* Inner squash-stretch container */}
      <motion.div
        className="relative w-32 h-32 md:w-44 md:h-44 lg:w-48 lg:h-48"
        variants={prefersReduced ? {} : squashVariants}
        initial="initial"
        animate="animate"
      >
        <div className="relative w-full h-full">
          {/* Spawn glow ring for side dishes */}
          {!prefersReduced && showGlow && (
            <motion.div
              className="absolute inset-[-6px] pointer-events-none"
              initial={{ scale: 0.6, opacity: 0.4 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" as const }}
              style={{
                background:
                  "radial-gradient(circle, rgba(212, 168, 75, 0.25) 0%, transparent 70%)",
              }}
            />
          )}

          {imgError ? (
            <div className="w-full h-full bg-nourish-input flex items-center justify-center rounded-2xl">
              <span className="text-nourish-subtext text-xs text-center px-2">
                {side.name}
              </span>
            </div>
          ) : (
            <Image
              src={side.imageUrl}
              alt={`Side dish: ${side.name}`}
              fill
              className={`object-contain transition-opacity duration-300 ${imageReady && minTimeElapsed ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 768px) 128px, (max-width: 1024px) 176px, 192px"
              onError={() => setImgError(true)}
              onLoad={() => setImageReady(true)}
            />
          )}

          {/* Magical Loader while waiting for image OR min time */}
          {(!imageReady || !minTimeElapsed) && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <MagicalLoader />
            </div>
          )}

          {/* Swap button with mini-plop on swap — hidden in evaluate mode */}
          {/* Swap button with mini-plop on swap — hidden in evaluate mode */}
          <AnimatePresence>
            {!hideControls && (
              <motion.div
                key={`swap-wrapper-${swapKey}`}
                className="absolute -top-1 -right-1 z-10"
                initial={swapKey > 0 ? { scale: 0, rotate: -180 } : { opacity: 1 }}
                animate={
                  swapKey > 0
                    ? {
                      scale: [0, 1.15, 0.95, 1.05, 1],
                      rotate: 0,
                    }
                    : { opacity: 1 }
                }
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
                transition={
                  swapKey > 0
                    ? {
                      scale: {
                        duration: 0.4,
                        times: [0, 0.4, 0.6, 0.8, 1],
                      },
                      rotate: springs.snappy,
                    }
                    : springs.snappy
                }
              >
                <SparkleEffect count={6}>
                  <motion.button
                    onClick={handleSwap}
                    className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-nourish-subtext hover:text-nourish-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold"
                    aria-label={`Swap ${side.name} for another side dish`}
                    whileHover={prefersReduced ? {} : { scale: 1.15 }}
                    whileTap={prefersReduced ? {} : { scale: 0.85, rotate: -180 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 16h5v5" />
                    </svg>
                  </motion.button>
                </SparkleEffect>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Name label fades in after delay — hidden in evaluate mode */}
      <AnimatePresence>
        {!hideControls && imageReady && minTimeElapsed && (
          <motion.div
            className="mt-2 flex flex-col items-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.15 } }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <p className="text-sm text-nourish-dark text-center font-serif">
              {side.name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>



    </motion.div >
  );
}
