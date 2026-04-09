"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MistakeChipProps {
  warning: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function MistakeChip({
  warning,
  isExpanded,
  onToggle,
}: MistakeChipProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
          "border transition-all duration-150",
          isExpanded
            ? "border-amber-300/50 bg-amber-50 text-amber-700"
            : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-neutral-300",
        )}
        type="button"
        aria-label={isExpanded ? "Hide common mistake warning" : "Show common mistake warning"}
        aria-expanded={isExpanded}
      >
        <AlertTriangle size={16} />
        Common mistake
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
            <p className="px-3 py-3 text-sm text-amber-800 leading-relaxed bg-amber-50/50 rounded-b-lg">
              {warning}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
