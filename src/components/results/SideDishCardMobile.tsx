"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { SideDish, PairingScore } from "@/types";
import { springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import MagicalLoader from "@/components/ui/MagicalLoader";
import SparkleEffect from "@/components/ui/SparkleEffect";

interface SideDishCardMobileProps {
  side: SideDish;
  index: number;
  onSwap: (index: number) => void;
  onClick?: () => void;
  pairingScore?: PairingScore;
  enableRegenerationDelay?: boolean;
}

// Mobile cards slide in from the left with staggered delays
const getSlideVariants = (index: number) => ({
  initial: {
    opacity: 0,
    x: -40,
    y: 0,
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      opacity: { duration: 0.15 },
      x: {
        type: "spring" as const,
        stiffness: 300,
        damping: 22,
        mass: 0.8,
      },
      delay: index * 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
});

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export default function SideDishCardMobile({
  side,
  index,
  onSwap,
  onClick,
  enableRegenerationDelay = false,
}: SideDishCardMobileProps) {
  const [imgError, setImgError] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [swapKey, setSwapKey] = useState(0);
  const prefersReduced = useReducedMotion();

  const variants = prefersReduced ? reducedVariants : getSlideVariants(index);

  // Handle regeneration delay.
  // Note: We do NOT reset state here because unique keys generally cause remounts.
  // Resetting here caused race conditions where imageReady was cleared after onLoad fired.
  /* eslint-disable react-hooks/set-state-in-effect -- synchronize initial loading state from prop */
  useEffect(() => {
    let minTimer: NodeJS.Timeout;
    if (enableRegenerationDelay) {
      minTimer = setTimeout(() => setMinTimeElapsed(true), 1500);
    } else {
      setMinTimeElapsed(true);
    }

    return () => {
      if (minTimer) clearTimeout(minTimer);
    };
  }, [side.id, enableRegenerationDelay]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSwap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSwapKey((k) => k + 1);
    onSwap(index);
  };

  const isReady = (imageReady && minTimeElapsed) || imgError;

  return (
    <motion.div
      className="group flex items-center gap-4 w-full bg-white rounded-xl shadow-sm border border-stone-100 px-4 py-3 cursor-pointer active:bg-stone-50 transition-colors"
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
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      viewport={{ once: true, amount: 0.3 }}
      whileInView={prefersReduced ? undefined : "animate"}
    >
      {/* Food image — no circle crop */}
      <div className="relative w-14 h-14 flex-shrink-0">
        {!isReady ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <MagicalLoader size="small" />
          </div>
        ) : imgError ? (
          <div className="w-full h-full bg-nourish-input flex items-center justify-center rounded-xl">
            <span className="text-nourish-subtext text-[10px] text-center px-1 leading-tight">
              {side.name}
            </span>
          </div>
        ) : (
          <Image
            src={side.imageUrl}
            alt={`Side dish: ${side.name}`}
            fill
            className="object-contain"
            sizes="56px"
            onError={() => setImgError(true)}
            onLoad={() => setImageReady(true)}
          />
        )}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {isReady && (
            <motion.p
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-serif text-nourish-dark truncate"
            >
              {side.name}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Swap button */}
      <AnimatePresence>
        <motion.div
          key={`swap-wrapper-mobile-${swapKey}`}
          initial={swapKey > 0 ? { scale: 0, rotate: -180 } : false}
          animate={
            swapKey > 0
              ? {
                  scale: [0, 1.3, 0.9, 1.1, 1],
                  rotate: 0,
                }
              : {}
          }
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
            <button
              onClick={handleSwap}
              className="flex-shrink-0 w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-nourish-subtext hover:text-nourish-button hover:border-nourish-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold"
              aria-label={`Swap ${side.name} for another side dish`}
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
            </button>
          </SparkleEffect>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
