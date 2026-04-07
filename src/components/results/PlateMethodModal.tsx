"use client";

import { useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Meal, SideDish } from "@/types";

interface PlateMethodModalProps {
  open: boolean;
  onClose: () => void;
  meal: Meal | null;
  sides: SideDish[];
}

interface FoodItem {
  name: string;
  imageUrl: string;
}

/**
 * ADA (American Diabetes Association) Plate Method:
 * - 1/2 plate: non-starchy vegetables
 * - 1/4 plate: protein
 * - 1/4 plate: carbs / grains
 */

export default function PlateMethodModal({
  open,
  onClose,
  meal,
  sides,
}: PlateMethodModalProps) {
  const prefersReduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Categorize sides with their images
  const categories = useMemo(() => {
    const vegs: FoodItem[] = [];
    const proteins: FoodItem[] = [];
    const carbs: FoodItem[] = [];

    // Main dish counts as protein
    if (meal) proteins.push({ name: meal.name, imageUrl: meal.heroImageUrl });

    for (const side of sides) {
      const item = { name: side.name, imageUrl: side.imageUrl };
      switch (side.nutritionCategory) {
        case "vegetable":
          vegs.push(item);
          break;
        case "protein":
          proteins.push(item);
          break;
        case "carb":
          carbs.push(item);
          break;
      }
    }

    return { vegs, proteins, carbs };
  }, [meal, sides]);

  const hasVegs = categories.vegs.length > 0;
  const hasProteins = categories.proteins.length > 0;
  const hasCarbs = categories.carbs.length > 0;
  const filledCount = [hasVegs, hasProteins, hasCarbs].filter(Boolean).length;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100]"
          role="dialog"
          aria-modal="true"
          aria-label="ADA Plate Method"
        >
          <motion.div
            className="fixed inset-0 bg-black/30"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ perspective: 800 }}
          >
            <motion.div
              ref={dialogRef}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 relative"
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
              transition={prefersReduced ? { duration: 0.2 } : springs.modal}
            >
              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 text-nourish-subtext hover:text-nourish-dark transition-colors text-xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold rounded p-1"
                aria-label="Close plate method"
                whileHover={prefersReduced ? {} : { scale: 1.1, rotate: 90 }}
                whileTap={prefersReduced ? {} : { scale: 0.85 }}
                transition={springs.snappy}
              >
                ✕
              </motion.button>

              <h2 className="text-lg font-serif text-nourish-dark text-center mb-1">
                Plate Method
              </h2>
              <p className="text-xs text-nourish-subtext text-center mb-5">
                ADA Recommended Plate Breakdown
              </p>

              {/* Plate visual with food images */}
              <div className="flex justify-center mb-5">
                <div className="relative w-56 h-56 sm:w-64 sm:h-64">
                  {/* Outer plate rim */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 shadow-lg" />
                  {/* Inner plate surface */}
                  <div className="absolute inset-2 rounded-full bg-white shadow-inner overflow-hidden">
                    {/* Top half — vegetables (50%) */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1/2 flex flex-col items-center justify-center transition-colors ${
                        hasVegs ? "bg-green-50/80" : "bg-gray-50/60"
                      }`}
                    >
                      {hasVegs ? (
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          {categories.vegs.slice(0, 2).map((food) => (
                            <div
                              key={food.name}
                              className="relative w-10 h-10 sm:w-12 sm:h-12"
                            >
                              <Image
                                src={food.imageUrl}
                                alt={food.name}
                                fill
                                className="object-contain"
                                sizes="48px"
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-wider ${hasVegs ? "text-green-700" : "text-gray-400"}`}
                      >
                        Vegetables
                      </span>
                      <p
                        className={`text-[9px] mt-0.5 leading-tight text-center px-4 ${hasVegs ? "text-green-600/80" : "text-gray-400"}`}
                      >
                        {hasVegs
                          ? categories.vegs.map((f) => f.name).join(", ")
                          : "None"}
                      </p>
                    </div>

                    {/* Horizontal divider */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-white/90 z-10" />

                    {/* Bottom-left — protein (25%) */}
                    <div
                      className={`absolute bottom-0 left-0 w-1/2 h-1/2 flex flex-col items-center justify-center transition-colors ${
                        hasProteins ? "bg-rose-50/80" : "bg-gray-50/60"
                      }`}
                    >
                      {hasProteins ? (
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-0.5">
                          <Image
                            src={categories.proteins[0].imageUrl}
                            alt={categories.proteins[0].name}
                            fill
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                      ) : null}
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-wider ${hasProteins ? "text-rose-700" : "text-gray-400"}`}
                      >
                        Protein
                      </span>
                      <p
                        className={`text-[8px] mt-0.5 leading-tight text-center px-2 ${hasProteins ? "text-rose-600/80" : "text-gray-400"}`}
                      >
                        {hasProteins
                          ? categories.proteins.map((f) => f.name).join(", ")
                          : "None"}
                      </p>
                    </div>

                    {/* Vertical divider (bottom half) */}
                    <div className="absolute bottom-0 left-1/2 w-[1.5px] h-1/2 bg-white/90 z-10" />

                    {/* Bottom-right — carbs (25%) */}
                    <div
                      className={`absolute bottom-0 right-0 w-1/2 h-1/2 flex flex-col items-center justify-center transition-colors ${
                        hasCarbs ? "bg-amber-50/80" : "bg-gray-50/60"
                      }`}
                    >
                      {hasCarbs ? (
                        <div className="flex items-center justify-center gap-0.5 mb-0.5">
                          {categories.carbs.slice(0, 2).map((food) => (
                            <div
                              key={food.name}
                              className="relative w-8 h-8 sm:w-10 sm:h-10"
                            >
                              <Image
                                src={food.imageUrl}
                                alt={food.name}
                                fill
                                className="object-contain"
                                sizes="40px"
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-wider ${hasCarbs ? "text-amber-700" : "text-gray-400"}`}
                      >
                        Carbs
                      </span>
                      <p
                        className={`text-[8px] mt-0.5 leading-tight text-center px-2 ${hasCarbs ? "text-amber-600/80" : "text-gray-400"}`}
                      >
                        {hasCarbs
                          ? categories.carbs.map((f) => f.name).join(", ")
                          : "None"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance status */}
              <div className="text-center mb-3">
                {filledCount === 3 ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-600"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <p className="text-sm font-medium text-green-600">
                      Balanced meal — all sections filled
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-nourish-subtext">
                    {filledCount}/3 plate sections covered
                    {!hasVegs && " — try adding a vegetable side"}
                    {!hasCarbs && hasVegs && " — consider a carb side"}
                  </p>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-5">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-400/80 ring-1 ring-green-500/20" />
                  <span className="text-[10px] text-nourish-subtext font-medium">
                    1/2 Veg
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80 ring-1 ring-rose-500/20" />
                  <span className="text-[10px] text-nourish-subtext font-medium">
                    1/4 Protein
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-amber-400/80 ring-1 ring-amber-500/20" />
                  <span className="text-[10px] text-nourish-subtext font-medium">
                    1/4 Carbs
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
