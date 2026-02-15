"use client";

import { motion } from "framer-motion";
import { springs } from "@/lib/motion";

const containerVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, scale: 0.7 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springs.gentle,
  },
};

export default function ShimmerPlaceholder() {
  return (
    <motion.div
      className="relative w-full max-w-4xl mx-auto mt-12 px-4"
      aria-label="Loading results"
      role="status"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Left side placeholder */}
        <motion.div className="hidden md:block" variants={itemVariants}>
          <div className="w-44 h-44 rounded-2xl shimmer" />
          <div className="w-20 h-3 shimmer rounded mt-3 mx-auto" />
        </motion.div>

        {/* Hero placeholder with pulse */}
        <motion.div
          className="flex flex-col items-center"
          variants={itemVariants}
        >
          <div className="w-64 h-64 md:w-72 md:h-72 rounded-2xl shimmer" />
          <div className="w-32 h-4 shimmer rounded mt-4" />
        </motion.div>

        {/* Right side placeholders */}
        <div className="hidden md:flex md:flex-col md:gap-6">
          <motion.div variants={itemVariants}>
            <div className="w-44 h-44 rounded-2xl shimmer" />
            <div className="w-20 h-3 shimmer rounded mt-3 mx-auto" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="w-44 h-44 rounded-2xl shimmer" />
            <div className="w-20 h-3 shimmer rounded mt-3 mx-auto" />
          </motion.div>
        </div>

        {/* Mobile side placeholders */}
        <div className="flex md:hidden gap-6">
          <motion.div variants={itemVariants}>
            <div className="w-24 h-24 rounded-2xl shimmer" />
            <div className="w-16 h-3 shimmer rounded mt-3 mx-auto" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="w-24 h-24 rounded-2xl shimmer" />
            <div className="w-16 h-3 shimmer rounded mt-3 mx-auto" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="w-24 h-24 rounded-2xl shimmer" />
            <div className="w-16 h-3 shimmer rounded mt-3 mx-auto" />
          </motion.div>
        </div>
      </div>
      <span className="sr-only">Loading meal pairing results...</span>
    </motion.div>
  );
}
