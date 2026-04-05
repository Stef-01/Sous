"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CorrectionChipsProps {
  dishName: string;
  confidence: number;
  alternates: string[];
  onConfirm: (dishName: string) => void;
  onCustom: () => void;
}

/**
 * Correction Chips — shown after photo recognition.
 * User confirms the detected dish or selects an alternative.
 * Never trust vision output alone — this is the two-step pipeline.
 */
export function CorrectionChips({
  dishName,
  confidence,
  alternates,
  onConfirm,
  onCustom,
}: CorrectionChipsProps) {
  const confidencePct = Math.round(confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-center space-y-1">
        <p className="text-sm text-[var(--nourish-subtext)]">We think this is:</p>
        <div className="flex items-center justify-center gap-2">
          <h2 className="font-serif text-xl text-[var(--nourish-dark)]">
            {dishName}
          </h2>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              confidencePct >= 80
                ? "bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
                : confidencePct >= 60
                ? "bg-[var(--nourish-gold)]/15 text-[var(--nourish-gold)]"
                : "bg-red-50 text-red-600"
            )}
          >
            {confidencePct}%
          </span>
        </div>
      </div>

      {/* Only show correction options if confidence is below threshold */}
      {confidence < 0.9 && alternates.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-center text-[var(--nourish-subtext)]">
            Did we get it wrong?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[dishName, ...alternates].map((name) => (
              <button
                key={name}
                onClick={() => onConfirm(name)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-all duration-150",
                  name === dishName
                    ? "border-[var(--nourish-green)] bg-[var(--nourish-green)]/5 text-[var(--nourish-green)]"
                    : "border-neutral-200 text-[var(--nourish-subtext)] hover:border-[var(--nourish-green)]"
                )}
                type="button"
              >
                {name}
              </button>
            ))}
            <button
              onClick={onCustom}
              className="rounded-full border border-dashed border-neutral-300 px-3 py-1.5 text-sm text-[var(--nourish-subtext)] hover:border-[var(--nourish-green)] transition-colors"
              type="button"
            >
              Other...
            </button>
          </div>
        </div>
      )}

      {/* Confirm button */}
      <button
        onClick={() => onConfirm(dishName)}
        className={cn(
          "w-full rounded-xl py-3 text-sm font-semibold text-white",
          "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
          "transition-colors duration-200 flex items-center justify-center gap-2"
        )}
        type="button"
      >
        <Check size={16} />
        Looks right — Pair
      </button>
    </motion.div>
  );
}
