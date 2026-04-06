"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SparkleEffect from "@/components/ui/SparkleEffect";

interface RerollButtonProps {
  onReroll: () => void;
  disabled?: boolean;
  onReset?: () => void;
}

// Plop entrance — starts invisible, bounces into place
const buttonVariants = {
  initial: {
    opacity: 0,
    scale: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: [0, 1.08, 0.97, 1.02, 1],
    y: 0,
    transition: {
      scale: {
        duration: 0.5,
        times: [0, 0.35, 0.55, 0.75, 1],
        ease: "easeOut" as const,
      },
      opacity: { duration: 0.1 },
      y: springs.snappy,
    },
  },
};

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, delay: 0.3 } },
};

export default function RerollButton({
  onReroll,
  disabled = false,
  onReset,
}: RerollButtonProps) {
  const [spinKey, setSpinKey] = useState(0);
  const prefersReduced = useReducedMotion();

  const handleClick = () => {
    if (disabled) return;
    setSpinKey((k) => k + 1);
    onReroll();
  };

  const handleReset = () => {
    onReset?.();
  };

  if (disabled) {
    return (
      <motion.div
        className="mt-8 flex flex-col items-center gap-2"
        variants={prefersReduced ? reducedVariants : buttonVariants}
        initial="initial"
        animate="animate"
      >
        <p className="text-sm text-nourish-subtext">
          You&apos;ve seen all sides for this dish.
        </p>
        <motion.button
          onClick={handleReset}
          className="px-5 py-2.5 text-sm text-nourish-button bg-white border border-nourish-button rounded-full hover:bg-nourish-button hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold focus-visible:ring-offset-2"
          whileHover={prefersReduced ? {} : { y: -2, scale: 1.03 }}
          whileTap={prefersReduced ? {} : { scale: 0.95 }}
          transition={springs.snappy}
        >
          Start fresh
        </motion.button>
      </motion.div>
    );
  }

  return (
    <SparkleEffect count={10}>
      <motion.button
        onClick={handleClick}
        className="mt-8 px-5 py-2.5 text-sm text-nourish-subtext bg-white border border-gray-200 rounded-full hover:border-nourish-button hover:text-nourish-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold focus-visible:ring-offset-2 flex items-center gap-2"
        variants={prefersReduced ? reducedVariants : buttonVariants}
        initial="initial"
        animate="animate"
        whileHover={prefersReduced ? {} : { y: -3, scale: 1.05 }}
        whileTap={prefersReduced ? {} : { scale: 0.92 }}
        transition={springs.snappy}
        aria-label="Shuffle side dish suggestions"
      >
        <motion.svg
          key={spinKey}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={spinKey > 0 ? { rotate: 0, scale: 1 } : false}
          animate={
            spinKey > 0
              ? {
                  rotate: 360,
                  scale: [1, 1.15, 1],
                }
              : {}
          }
          transition={{
            rotate: { duration: 0.5, ease: "easeInOut" },
            scale: { duration: 0.3, times: [0, 0.5, 1] },
          }}
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </motion.svg>
        Shuffle sides
      </motion.button>
    </SparkleEffect>
  );
}
