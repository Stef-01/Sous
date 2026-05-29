"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Timer } from "lucide-react";

/**
 * ParallelHintBanner — small amber callout shown above the active
 * StepCard on `/cook/combined`. Surfaces a "while X simmers, start
 * Y" tip from the sequencer, scoped to the current step.
 *
 * Extracted from `src/app/cook/combined/page.tsx` (W28 density
 * wave 2). The banner was 21 lines of inline JSX inside the page;
 * pulling it out shaves the page surface and lets the banner own
 * its motion + reduced-motion gate independently.
 *
 * Renders nothing when `hint` is null/empty so callers can keep
 * the conditional inline (`<ParallelHintBanner hint={x} />`) and
 * stop branching themselves.
 */

export interface ParallelHintBannerProps {
  hint: string | null | undefined;
  className?: string;
}

export function ParallelHintBanner({
  hint,
  className,
}: ParallelHintBannerProps) {
  const reducedMotion = useReducedMotion();
  if (!hint) return null;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reducedMotion
          ? { duration: 0.12 }
          : { type: "spring", stiffness: 300, damping: 25 }
      }
      className={
        className ??
        "mb-3 flex items-start gap-2 rounded-xl border border-amber-200/60 bg-amber-50 px-3.5 py-2.5"
      }
      role="status"
    >
      <Timer size={16} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
      <p className="text-xs leading-relaxed text-amber-800">{hint}</p>
    </motion.div>
  );
}
