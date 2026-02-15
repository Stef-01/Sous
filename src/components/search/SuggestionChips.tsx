"use client";

import { motion } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import { springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Mini plop for chips — starts from scale 0, bounces into place
const chipVariants = {
  initial: {
    opacity: 0,
    y: -20,
    scale: 0,
    rotate: -5,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: [0, 1.06, 0.97, 1.02, 1],
    rotate: 0,
    transition: {
      scale: {
        duration: 0.35,
        times: [0, 0.35, 0.55, 0.8, 1],
        ease: "easeOut" as const,
      },
      opacity: { duration: 0.08 },
      y: springs.snappy,
      rotate: springs.snappy,
    },
  },
};

const reducedChipVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
};

export default function SuggestionChips({
  suggestions,
  onSelect,
}: SuggestionChipsProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className="flex flex-wrap gap-2 justify-center"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {suggestions.map((suggestion) => (
        <motion.button
          key={suggestion}
          variants={prefersReduced ? reducedChipVariants : chipVariants}
          whileHover={
            prefersReduced
              ? {}
              : { scale: 1.05, y: -2 }
          }
          whileTap={prefersReduced ? {} : { scale: 0.92 }}
          transition={springs.snappy}
          onClick={() => {
            trackEvent("suggestionChipClicked", { suggestion });
            onSelect(suggestion);
          }}
          className="px-4 py-2 text-sm text-nourish-subtext bg-white border border-gray-200 rounded-full hover:border-nourish-button hover:text-nourish-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold focus-visible:ring-offset-2"
        >
          {suggestion}
        </motion.button>
      ))}
    </motion.div>
  );
}
