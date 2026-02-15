"use client";

import { motion } from "framer-motion";
import SuggestionChips from "@/components/search/SuggestionChips";
import { springs } from "@/lib/motion";

interface ErrorMessageProps {
  message: string;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

const containerVariants = {
  initial: { opacity: 0, y: 15, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.wobbly,
  },
};

export default function ErrorMessage({
  message,
  suggestions,
  onSelect,
}: ErrorMessageProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-6 mt-12"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.p
        className="text-nourish-subtext text-center max-w-md"
        animate={{ x: [0, -3, 3, -2, 2, 0] }}
        transition={{ duration: 0.4, delay: 0.3, ease: "easeInOut" }}
      >
        {message}
      </motion.p>
      {suggestions.length > 0 && (
        <div className="flex flex-col items-center gap-3">
          <motion.p
            className="text-sm text-nourish-subtext"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ...springs.gentle }}
          >
            Try one of these instead:
          </motion.p>
          <SuggestionChips suggestions={suggestions} onSelect={onSelect} />
        </div>
      )}
    </motion.div>
  );
}
