"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import { springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
  onHeatmapClick?: () => void;
}

const contentVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const paragraphVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: springs.gentle,
  },
};

const reducedParagraphVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
};

export default function AboutModal({ open, onClose, onHeatmapClick }: AboutModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (open) {
      trackEvent("aboutOpened");
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="About NOURISH">
          {/* Backdrop with blur */}
          <motion.div
            className="fixed inset-0 bg-black/30"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          {/* Modal container with perspective */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ perspective: 800 }}
          >
            <motion.div
              ref={dialogRef}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative"
              initial={
                prefersReduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: 60, scale: 0.9, rotateX: 8 }
              }
              animate={
                prefersReduced
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, scale: 1, rotateX: 0 }
              }
              exit={
                prefersReduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: 40, scale: 0.95 }
              }
              transition={
                prefersReduced
                  ? { duration: 0.2 }
                  : springs.modal
              }
            >
              {/* Close button with spin on hover */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 text-nourish-subtext hover:text-nourish-dark transition-colors text-xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold rounded p-1"
                aria-label="Close about dialog"
                whileHover={prefersReduced ? {} : { scale: 1.1, rotate: 90 }}
                whileTap={prefersReduced ? {} : { scale: 0.85 }}
                transition={springs.snappy}
              >
                ✕
              </motion.button>

              {/* Content with staggered paragraphs */}
              <motion.div
                variants={contentVariants}
                initial="initial"
                animate="animate"
              >
                <motion.h2
                  className="text-xl font-semibold text-nourish-dark mb-4"
                  variants={prefersReduced ? reducedParagraphVariants : paragraphVariants}
                >
                  About NOURISH Meal Pairer
                </motion.h2>
                <motion.p
                  className="text-nourish-subtext text-sm leading-relaxed mb-4"
                  variants={prefersReduced ? reducedParagraphVariants : paragraphVariants}
                >
                  NOURISH helps you discover culturally appropriate side dishes to
                  complement your favourite meals. Simply type a dish you love and
                  we will suggest perfect pairings.
                </motion.p>
                <motion.p
                  className="text-nourish-subtext text-sm leading-relaxed mb-4"
                  variants={prefersReduced ? reducedParagraphVariants : paragraphVariants}
                >
                  Our suggestions are curated to respect culinary traditions while
                  encouraging exploration of new flavours and healthy combinations.
                </motion.p>
                <motion.p
                  className="text-xs text-nourish-subtext/60 mb-4"
                  variants={prefersReduced ? reducedParagraphVariants : paragraphVariants}
                >
                  This tool is for inspiration only and is not a substitute for
                  professional dietary advice.
                </motion.p>
                {onHeatmapClick && (
                  <motion.div
                    className="pt-3 border-t border-gray-100"
                    variants={prefersReduced ? reducedParagraphVariants : paragraphVariants}
                  >
                    <button
                      onClick={onHeatmapClick}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-nourish-cream rounded-xl text-sm font-medium text-nourish-dark hover:bg-nourish-input transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                      </svg>
                      View Pairing Heatmap
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
