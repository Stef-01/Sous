"use client";

/**
 * TapFeedback + ChipFeedback — Y3 W40 micro-interaction primitives.
 *
 * Two thin wrappers over framer-motion that standardise the
 * tap / press visual feedback Sous uses across surfaces. Existing
 * components have ad-hoc whileTap configs; new components import
 * these primitives so the cadence stays consistent.
 *
 * Each primitive:
 *   - Reads useReducedMotion() and short-circuits the animation
 *     when the user's OS preference is set.
 *   - Uses the W37 SPRING tokens for the physics curve.
 *   - Forwards onClick / type / aria via standard prop spread.
 *
 * Usage:
 *   <TapFeedback as="button" onClick={...}>Save</TapFeedback>
 *   <ChipFeedback aria-pressed={active}>Filter</ChipFeedback>
 */

import type { ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { SPRING } from "@/styles/motion";
import { cn } from "@/lib/utils/cn";

export type TapFeedbackVariant = "primary" | "secondary" | "tap-only";

interface TapFeedbackProps extends Omit<
  HTMLMotionProps<"button">,
  "type" | "children"
> {
  /** Element variant. Drives both the tap-feedback intensity
   *  and the default classes. 'tap-only' applies the spring
   *  effect without any visual styling — for callers that
   *  bring their own classes. */
  variant?: TapFeedbackVariant;
  children: ReactNode;
}

/** TapFeedback — a button with the standard Sous tap-feedback
 *  spring + reduced-motion gate. */
export function TapFeedback({
  variant = "tap-only",
  className,
  children,
  ...rest
}: TapFeedbackProps) {
  const reducedMotion = useReducedMotion();
  const tapScale = reducedMotion ? 1 : variant === "primary" ? 0.97 : 0.96;

  return (
    <motion.button
      whileTap={{ scale: tapScale }}
      transition={SPRING.snappy}
      type="button"
      className={cn(
        variant === "primary" &&
          "rounded-xl bg-[var(--nourish-green)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-[var(--nourish-dark-green)]",
        variant === "secondary" &&
          "rounded-xl border border-[var(--nourish-border-strong)] bg-white px-5 py-3 text-sm font-medium text-[var(--nourish-dark)] transition-colors hover:bg-neutral-50",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

interface ChipFeedbackProps extends Omit<
  HTMLMotionProps<"button">,
  "type" | "children"
> {
  /** Chip pressed-state for aria + visual treatment. */
  active?: boolean;
  /** Tone — `primary` is the green-fill active treatment;
   *  `subtle` is the white-bg outlined chip. */
  tone?: "primary" | "subtle";
  children: ReactNode;
}

/** ChipFeedback — chip-style button with snappy tap feedback. */
export function ChipFeedback({
  active = false,
  tone = "subtle",
  className,
  children,
  ...rest
}: ChipFeedbackProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      whileTap={reducedMotion ? undefined : { scale: 0.94 }}
      transition={SPRING.snappy}
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
        tone === "primary" &&
          (active
            ? "bg-[var(--nourish-green)] text-white"
            : "border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-subtext)] hover:bg-neutral-50"),
        tone === "subtle" &&
          (active
            ? "bg-[var(--nourish-green)]/10 text-[var(--nourish-green)] border border-[var(--nourish-green)]/30"
            : "border border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-subtext)] hover:bg-neutral-50"),
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
