"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { SideDish } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BalanceIndicatorProps {
  sides: SideDish[];
}

const categories = [
  {
    key: "vegetable" as const,
    label: "Veg",
    color: "bg-green-500",
    ring: "ring-green-500/30",
  },
  {
    key: "carb" as const,
    label: "Carb",
    color: "bg-amber-500",
    ring: "ring-amber-500/30",
  },
  {
    key: "protein" as const,
    label: "Protein",
    color: "bg-rose-500",
    ring: "ring-rose-500/30",
  },
];

export default function BalanceIndicator({ sides }: BalanceIndicatorProps) {
  const prefersReduced = useReducedMotion();

  const present = useMemo(() => {
    const cats = new Set(sides.map((s) => s.nutritionCategory));
    return {
      vegetable: cats.has("vegetable"),
      carb: cats.has("carb"),
      protein: cats.has("protein"),
    };
  }, [sides]);

  const isBalanced = present.vegetable && present.carb && present.protein;

  const presentLabels = categories
    .filter((c) => present[c.key])
    .map((c) => c.label.toLowerCase());

  const tooltipText =
    presentLabels.length > 0
      ? `Your sides include ${presentLabels.join(", ")}`
      : "No categories detected";

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5 mt-4"
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
      animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={
        prefersReduced
          ? { duration: 0.2, delay: 0.4 }
          : { duration: 0.3, delay: 0.8 }
      }
      title={tooltipText}
    >
      <div className="flex items-center gap-2">
        {categories.map((cat) => (
          <div key={cat.key} className="flex items-center gap-1">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                present[cat.key]
                  ? `${cat.color} ring-2 ${cat.ring}`
                  : "bg-gray-200"
              }`}
            />
            <span
              className={`text-[10px] ${
                present[cat.key]
                  ? "text-nourish-subtext"
                  : "text-nourish-subtext/40"
              }`}
            >
              {cat.label}
            </span>
          </div>
        ))}
      </div>
      {isBalanced && (
        <motion.span
          className="text-[10px] font-medium text-green-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.3 }}
        >
          Balanced
        </motion.span>
      )}
    </motion.div>
  );
}
