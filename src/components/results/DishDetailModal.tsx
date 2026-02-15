"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface DishDetailModalProps {
  open: boolean;
  onClose: () => void;
  dish: {
    name: string;
    imageUrl: string;
    description: string;
    cuisine?: string;
    tags?: string[];
    sideIndex?: number;
    pairingRationale?: string;
  } | null;
  onSwapSide?: (index: number) => void;
}

const contentVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: springs.gentle,
  },
};

const reducedItemVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
};

const imageVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.15, 0.95, 1],
    opacity: 1,
    transition: {
      scale: {
        duration: 0.4,
        times: [0, 0.4, 0.7, 1],
        ease: "easeOut" as const,
      },
      opacity: { duration: 0.1 },
    },
  },
};

const reducedImageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
};

export default function DishDetailModal({
  open,
  onClose,
  dish,
  onSwapSide,
}: DishDetailModalProps) {
  const isSideDish = dish?.sideIndex !== undefined;
  const dialogRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [showRationale, setShowRationale] = useState(false);

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
      {open && dish && (
        <div
          className="fixed inset-0 z-[100]"
          role="dialog"
          aria-modal="true"
          aria-label={`Details for ${dish.name}`}
        >
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
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 relative"
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
                prefersReduced ? { duration: 0.2 } : springs.modal
              }
            >
              {/* Close button with spin on hover */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 text-nourish-subtext hover:text-nourish-dark transition-colors text-xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold rounded p-1"
                aria-label="Close dish details"
                whileHover={
                  prefersReduced ? {} : { scale: 1.1, rotate: 90 }
                }
                whileTap={prefersReduced ? {} : { scale: 0.85 }}
                transition={springs.snappy}
              >
                ✕
              </motion.button>

              {/* Content with staggered items */}
              <motion.div
                className="flex flex-col items-center"
                variants={contentVariants}
                initial="initial"
                animate="animate"
              >
                {/* Dish image with plop + hover zoom */}
                <motion.div
                  className="relative w-28 h-28 mb-4 overflow-hidden"
                  variants={
                    prefersReduced ? reducedImageVariants : imageVariants
                  }
                  whileHover={prefersReduced ? {} : { scale: 1.08 }}
                  transition={springs.gentle}
                >
                  <Image
                    src={dish.imageUrl}
                    alt={dish.name}
                    fill
                    className="object-contain"
                    sizes="112px"
                  />
                </motion.div>

                {/* Dish name */}
                <motion.h2
                  className="text-xl font-serif text-nourish-dark mb-2 text-center"
                  variants={
                    prefersReduced ? reducedItemVariants : itemVariants
                  }
                >
                  {dish.name}
                </motion.h2>

                {/* Cuisine badge or tags */}
                <motion.div
                  className="flex flex-wrap gap-1.5 justify-center mb-4"
                  variants={
                    prefersReduced ? reducedItemVariants : itemVariants
                  }
                >
                  {dish.cuisine && (
                    <span className="px-3 py-1 text-xs font-medium bg-nourish-gold/15 text-nourish-dark rounded-full">
                      {dish.cuisine}
                    </span>
                  )}
                  {dish.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium bg-gray-100 text-nourish-subtext rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </motion.div>

                {/* Description — hover to reveal pairing rationale */}
                <motion.div
                  className="relative mb-6 cursor-default"
                  variants={
                    prefersReduced ? reducedItemVariants : itemVariants
                  }
                  onMouseEnter={() => dish.pairingRationale && setShowRationale(true)}
                  onMouseLeave={() => setShowRationale(false)}
                >
                  <AnimatePresence mode="wait">
                    {showRationale && dish.pairingRationale ? (
                      <motion.p
                        key="rationale"
                        className="text-sm text-nourish-button font-medium leading-relaxed text-center italic"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        &ldquo;{dish.pairingRationale}&rdquo;
                      </motion.p>
                    ) : (
                      <motion.p
                        key="description"
                        className="text-sm text-nourish-subtext leading-relaxed text-center"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        {dish.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  className="flex flex-col items-center gap-3 w-full"
                  variants={
                    prefersReduced ? reducedItemVariants : itemVariants
                  }
                >
                  {/* View Recipe button (placeholder) */}
                  <motion.button
                    className="px-6 py-2.5 text-sm font-medium text-white bg-nourish-button rounded-full hover:bg-nourish-button/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold focus-visible:ring-offset-2 flex items-center gap-2"
                    whileHover={
                      prefersReduced ? {} : { scale: 1.05, y: -2 }
                    }
                    whileTap={prefersReduced ? {} : { scale: 0.95 }}
                    transition={springs.snappy}
                    onClick={(e) => e.preventDefault()}
                  >
                    View Recipe
                    <span aria-hidden="true">→</span>
                  </motion.button>

                  {/* Swap button — only for side dishes */}
                  {isSideDish && onSwapSide && (
                    <motion.button
                      className="px-5 py-2 text-sm text-nourish-subtext bg-transparent border border-gray-200 rounded-full hover:border-nourish-button hover:text-nourish-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold focus-visible:ring-offset-2 flex items-center gap-2"
                      whileHover={
                        prefersReduced ? {} : { scale: 1.03, y: -1 }
                      }
                      whileTap={prefersReduced ? {} : { scale: 0.95 }}
                      transition={springs.snappy}
                      onClick={() => {
                        onSwapSide(dish!.sideIndex!);
                        onClose();
                      }}
                      aria-label={`Swap ${dish?.name} for another side dish`}
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
                      Swap this side
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
