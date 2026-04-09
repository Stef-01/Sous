"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface HackChipProps {
  hack: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function HackChip({ hack, isExpanded, onToggle }: HackChipProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
          "border transition-all duration-150",
          isExpanded
            ? "border-blue-300/50 bg-blue-50 text-blue-700"
            : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-neutral-300",
        )}
        type="button"
        aria-label={isExpanded ? "Hide quick hack" : "Show quick hack"}
        aria-expanded={isExpanded}
      >
        <Lightbulb size={16} />
        Quick hack
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
            <p className="px-3 py-3 text-sm text-blue-800 leading-relaxed bg-blue-50/50 rounded-b-lg">
              {hack}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
