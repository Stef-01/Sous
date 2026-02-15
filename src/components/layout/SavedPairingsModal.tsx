"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { SavedPairing } from "@/hooks/useSavedPairings";

interface SavedPairingsModalProps {
  open: boolean;
  onClose: () => void;
  pairings: SavedPairing[];
  onSelect: (pairing: SavedPairing) => void;
  onRemove: (id: string) => void;
}

function relativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

const listVariants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.15 },
  },
};

const itemVariants = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: springs.gentle },
};

const reducedItemVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
};

export default function SavedPairingsModal({
  open,
  onClose,
  pairings,
  onSelect,
  onRemove,
}: SavedPairingsModalProps) {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100]"
          role="dialog"
          aria-modal="true"
          aria-label="Saved pairings"
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col relative"
              initial={
                prefersReduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: 60, scale: 0.9 }
              }
              animate={
                prefersReduced
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, scale: 1 }
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
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-serif text-nourish-dark">
                  Saved Pairings
                </h2>
                <motion.button
                  onClick={onClose}
                  className="text-nourish-subtext hover:text-nourish-dark transition-colors text-xl leading-none p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold"
                  aria-label="Close saved pairings"
                  whileHover={prefersReduced ? {} : { scale: 1.1, rotate: 90 }}
                  whileTap={prefersReduced ? {} : { scale: 0.85 }}
                  transition={springs.snappy}
                >
                  ✕
                </motion.button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {pairings.length === 0 ? (
                  <p className="text-sm text-nourish-subtext text-center py-8">
                    No saved pairings yet. Find a meal and tap the bookmark to save it.
                  </p>
                ) : (
                  <motion.div
                    className="flex flex-col gap-3"
                    variants={listVariants}
                    initial="initial"
                    animate="animate"
                  >
                    {pairings.map((pairing) => (
                      <motion.div
                        key={pairing.id}
                        variants={
                          prefersReduced
                            ? reducedItemVariants
                            : itemVariants
                        }
                        className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 cursor-pointer transition-colors"
                        onClick={() => onSelect(pairing)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Load pairing: ${pairing.mealName}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect(pairing);
                          }
                        }}
                      >
                        {/* Meal name + time */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-serif text-nourish-dark truncate">
                            {pairing.mealName}
                          </p>
                          <p className="text-[11px] text-nourish-subtext/60 mt-0.5">
                            {relativeTime(pairing.timestamp)}
                          </p>
                        </div>

                        {/* Side thumbnails */}
                        <div className="flex -space-x-2">
                          {pairing.sides.map((side, i) => (
                            <div
                              key={i}
                              className="relative w-8 h-8 overflow-hidden"
                            >
                              <Image
                                src={side.imageUrl}
                                alt={side.name}
                                fill
                                className="object-contain"
                                sizes="32px"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(pairing.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1 text-nourish-subtext/50 hover:text-red-500 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold"
                          aria-label={`Remove ${pairing.mealName} pairing`}
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
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
