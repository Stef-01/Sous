"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AboutModal from "./AboutModal";
import { springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SparkleEffect from "@/components/ui/SparkleEffect";

const navVariants = {
  initial: { y: -20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      y: springs.gentle,
      opacity: { duration: 0.3 },
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { y: -10, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: springs.gentle,
  },
};

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
};

interface NavbarProps {
  savedCount?: number;
  onSavedClick?: () => void;
  onHeatmapClick?: () => void;
  verifiedOnly?: boolean;
  onVerifiedToggle?: () => void;
  onLogoClick?: () => void;
}

export default function Navbar({ savedCount = 0, onSavedClick, onHeatmapClick, verifiedOnly = false, onVerifiedToggle, onLogoClick }: NavbarProps) {
  const handleHeatmapFromAbout = () => {
    setShowAbout(false);
    onHeatmapClick?.();
  };
  const [showAbout, setShowAbout] = useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm"
        variants={prefersReduced ? reducedVariants : navVariants}
        initial="initial"
        animate="animate"
      >
        <div className="w-full mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <SparkleEffect count={8}>
            <motion.button
              onClick={onLogoClick}
              className="text-nourish-dark font-serif text-lg tracking-wide cursor-pointer hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold focus-visible:ring-offset-2 rounded"
              variants={prefersReduced ? {} : itemVariants}
              whileTap={prefersReduced ? {} : { scale: 0.95 }}
              aria-label="Spin the wheel — pick a random meal"
            >
              NOURISH
            </motion.button>
          </SparkleEffect>
          <div className="flex items-center gap-4">
            {onVerifiedToggle && (
              <SparkleEffect count={6}>
                <motion.button
                  onClick={onVerifiedToggle}
                  className={`text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold focus-visible:ring-offset-2 ${verifiedOnly
                    ? "border-nourish-button bg-nourish-button/10 text-nourish-button"
                    : "border-stone-200 text-nourish-subtext hover:border-nourish-button hover:text-nourish-button"
                    }`}
                  variants={prefersReduced ? {} : itemVariants}
                  whileTap={prefersReduced ? {} : { scale: 0.95 }}
                  aria-pressed={verifiedOnly}
                  aria-label="Toggle NOURISH Verified filter"
                >
                  <motion.svg
                    key={`star-${verifiedOnly}`}
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill={verifiedOnly ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ scale: 1, rotate: 0 }}
                    animate={verifiedOnly
                      ? { scale: [1, 1.4, 1], rotate: [0, 15, 0] }
                      : { scale: 1, rotate: 0 }
                    }
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z" />
                  </motion.svg>
                  Verified
                </motion.button>
              </SparkleEffect>
            )}
            {savedCount > 0 && onSavedClick && (
              <motion.button
                onClick={onSavedClick}
                className="text-nourish-dark text-sm font-medium flex items-center gap-1.5 hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold focus-visible:ring-offset-2 rounded"
                variants={prefersReduced ? {} : itemVariants}
                whileHover={prefersReduced ? {} : { x: 3 }}
                whileTap={prefersReduced ? {} : { scale: 0.97 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
                Saved
              </motion.button>
            )}
            <motion.button
              onClick={() => setShowAbout(true)}
              className="text-nourish-dark text-sm font-medium flex items-center gap-1.5 hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold focus-visible:ring-offset-2 rounded"
              variants={prefersReduced ? {} : itemVariants}
              whileHover={prefersReduced ? {} : { x: 3 }}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
            >
              About
              <span aria-hidden="true" className="text-base">
                →
              </span>
            </motion.button>
          </div>
        </div>
      </motion.nav>
      <AboutModal open={showAbout} onClose={() => setShowAbout(false)} onHeatmapClick={handleHeatmapFromAbout} />
    </>
  );
}
