"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TimerChipProps {
  seconds: number;
  isExpanded: boolean;
  onToggle: () => void;
  onStart: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0 && s > 0) return `${m}:${String(s).padStart(2, "0")}`;
  if (m > 0) return `${m} min`;
  return `${s} sec`;
}

export function TimerChip({ seconds, isExpanded, onToggle, onStart }: TimerChipProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
          "border transition-all duration-150",
          isExpanded
            ? "border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5 text-[var(--nourish-green)]"
            : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-neutral-300"
        )}
        type="button"
      >
        <Timer size={16} />
        Start {formatTime(seconds)}
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
            <div className="px-3 py-3">
              <button
                onClick={onStart}
                className="w-full rounded-lg bg-[var(--nourish-green)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--nourish-dark-green)] transition-colors"
                type="button"
              >
                Start {formatTime(seconds)} timer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
