"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION, EASE } from "@/lib/motion/tokens";

/**
 * PhaseShell (R2) — the shared enter/exit wrapper for the Quest-shell phases
 * (Mission → Grab → Cook → Win). Each phase is a keyed direct child of the cook
 * page's `<AnimatePresence mode="popLayout">`; wrapping the non-step phases here
 * gives every phase boundary ONE calm, consistent crossfade-and-rise instead of
 * the hard cut they had before.
 *
 * The vertical fade/rise is intentionally distinct from StepCard's horizontal
 * slide: lateral motion = same-level navigation (step ↔ step), vertical motion =
 * a level change (phase ↔ phase). Exit is quicker than enter (EASE.in vs the
 * house decelerate) so the outgoing phase clears out of the way promptly.
 *
 * Reduced-motion collapses to an instant opacity swap — no movement, no delay.
 */
export function PhaseShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={
        reduced
          ? { opacity: 0 }
          : {
              opacity: 0,
              y: -8,
              transition: { duration: DURATION.base, ease: EASE.in },
            }
      }
      transition={
        reduced ? { duration: 0 } : { duration: DURATION.slow, ease: EASE.out }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
