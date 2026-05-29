/**
 * Motion easing presets.
 *
 * Codified from `docs/design-tokens.md` (Stage-3 closing
 * codification). Three named profiles cover ~95% of the app's
 * spring-based motion. New motion code should pick one of these
 * rather than inventing new spring tunings.
 *
 * The reduced-motion fallback (`RM`) is the duration to use inside a
 * `useReducedMotion` branch instead of any of the three spring
 * profiles — preserves the perceptual transition without the
 * vestibular cost.
 */

import type { Transition } from "framer-motion";

/** UI affordances: button taps, toggle indicators, tappable surfaces. */
export const SNAPPY: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

/** Overlay sheets, page transitions, route-aware slides. */
export const SHEET: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 28,
};

/** Card stack, scrapbook entries, longer slides. */
export const GLIDE: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 25,
};

/** Reduced-motion fallback for any of the three above. */
export const RM: Transition = { duration: 0.15 };

/**
 * Pick the right spring transition (or the reduced-motion fallback)
 * based on the caller's `useReducedMotion()` value.
 */
export function springOr(
  reducedMotion: boolean | null,
  spring: Transition,
): Transition {
  return reducedMotion ? RM : spring;
}
