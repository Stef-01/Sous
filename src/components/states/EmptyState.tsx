"use client";

import { motion } from "framer-motion";
import SuggestionChips from "@/components/search/SuggestionChips";
import { springs } from "@/lib/motion";

const DEFAULT_SUGGESTIONS = [
  "Butter Chicken",
  "Sushi",
  "Tacos al Pastor",
  "Pasta Carbonara",
  "Falafel Wrap",
  "Pad Thai",
];

const VERIFIED_SUGGESTIONS = [
  "Butter Chicken",
  "Mushroom Masala",
  "Sambar",
  "Masoor Dal",
  "Mattar Paneer",
  "Chicken Biryani",
];

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const textVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: springs.gentle,
  },
};

interface EmptyStateProps {
  onSelect: (suggestion: string) => void;
  verifiedOnly?: boolean;
}

export default function EmptyState({
  onSelect,
  verifiedOnly = false,
}: EmptyStateProps) {
  const suggestions = verifiedOnly ? VERIFIED_SUGGESTIONS : DEFAULT_SUGGESTIONS;

  return (
    <motion.div
      className="flex flex-col items-center gap-6 mt-12"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.p
        className="text-sm text-nourish-subtext"
        variants={textVariants}
      >
        Try one of these:
      </motion.p>
      <motion.div variants={textVariants}>
        <SuggestionChips suggestions={suggestions} onSelect={onSelect} />
      </motion.div>
    </motion.div>
  );
}
