/**
 * W1 — Motion tokens: ONE source of truth for JS/Framer animations, mirroring
 * the CSS `--dur-*` / `--ease-*` set in globals.css. Components import these
 * instead of hand-rolling durations and springs, and every transition collapses
 * to instant under `prefers-reduced-motion` via `motionTransition`.
 */

import type { TargetAndTransition, Transition } from "framer-motion";

/** Seconds (Framer uses seconds; CSS uses ms — kept in lockstep). */
export const DURATION = {
  fast: 0.15,
  base: 0.22,
  slow: 0.3,
} as const;

/** Cubic-bezier control points, mirroring the --ease-* CSS tokens (E1). */
export const EASE = {
  out: [0.22, 1, 0.36, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  inOut: [0.66, 0, 0.34, 1] as const,
  /** Overshoot — badges / pops / counters ONLY. As a default it reads juvenile,
   *  not premium; keep it off lists, sheets, and primary transitions. */
  spring: [0.35, 1.55, 0.65, 1] as const,
};

/** Named spring configs — pick by feel, never re-tune inline. */
export const SPRING: Record<"soft" | "snappy" | "gentle", Transition> = {
  soft: { type: "spring", stiffness: 260, damping: 30 },
  snappy: { type: "spring", stiffness: 400, damping: 28 },
  gentle: { type: "spring", stiffness: 180, damping: 26 },
};

/** Tactile press-scale (E4). `TAP_SCALE` is the standard for buttons + cards;
 *  `TAP_SCALE_SM` is the tighter delta small chips/icon buttons use (a bigger
 *  delta reads as responsive on a small target). Press, never pop. */
export const TAP_SCALE = 0.98;
export const TAP_SCALE_SM = 0.94;

/** A tasteful default entrance transition. */
export const ENTRANCE: Transition = { duration: DURATION.base, ease: EASE.out };

/**
 * Wrap any transition so it becomes instant when the user prefers reduced
 * motion — the single guard every animated surface should route through.
 */
export function motionTransition(
  transition: Transition,
  reducedMotion: boolean | null,
): Transition {
  return reducedMotion ? { duration: 0 } : transition;
}

/** Stagger helper for lists (W10) — children fade/slide in sequence. */
export function staggerChildren(reducedMotion: boolean | null, step = 0.04) {
  return reducedMotion
    ? { staggerChildren: 0 }
    : { staggerChildren: step, delayChildren: 0.02 };
}

/**
 * Premium focal entrance (E3) — fade + 6px rise + a 2px blur clearing on the
 * house ease. The framer mirror of the `--entrance-premium` CSS keyframe, for
 * surfaces already driven by framer `initial/animate`. Spread onto a motion
 * element: `<motion.div {...premiumEntrance(reducedMotion)} />`.
 *
 * FOCAL surfaces ONLY — hero, sheet/modal content, single card reveals. NEVER a
 * long list or large surface (animating `filter: blur` is GPU-expensive; this
 * tensions rule 9, so the scope guard is the rule). Collapses to a plain fade
 * under reduced motion (no blur, no movement, instant).
 */
export function premiumEntrance(reducedMotion: boolean | null): {
  initial: TargetAndTransition | false;
  animate: TargetAndTransition;
  transition: Transition;
} {
  if (reducedMotion) {
    return {
      initial: false,
      animate: { opacity: 1 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: 6, filter: "blur(2px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: DURATION.slow, ease: EASE.out },
  };
}
