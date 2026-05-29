"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FactChipProps {
  fact: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function FactChip({ fact, isExpanded, onToggle }: FactChipProps) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
          "border transition-all duration-150",
          isExpanded
            ? "border-purple-300/50 bg-purple-50 text-purple-700"
            : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-neutral-300",
        )}
        type="button"
        aria-label={isExpanded ? "Hide cuisine fact" : "Show cuisine fact"}
        aria-expanded={isExpanded}
      >
        <BookOpen size={16} />
        Cuisine fact
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-3 py-3 text-sm text-purple-800 leading-relaxed bg-purple-50/50 rounded-b-lg">
              {fact}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
