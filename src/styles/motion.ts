/**
 * Motion design tokens (Y3 W37 — Sprint J foundation).
 *
 * Single source of truth for animation durations + easings
 * across the app. Consumers import from here rather than
 * hardcoding `duration: 0.18` strings, so:
 *   1. Renames go through one file.
 *   2. Reduced-motion behaviour is centralised.
 *   3. Animation cadence stays consistent across surfaces.
 *
 * Used together with the `useReducedMotion` framer-motion
 * hook: when reduced-motion is set, callers pass duration: 0
 * (or call `withReducedMotion(token, prefersReducedMotion)`).
 *
 * Duration + easing scale is pure; `SPRING` is re-exported from the
 * canonical `@/lib/motion/tokens` so there is one definition app-wide.
 */

import { SPRING as MOTION_SPRING } from "@/lib/motion/tokens";

/** ── Duration tokens (seconds) ─────────────────────────────
 *  Five-tier scale tuned for the Sous cadence:
 *    - instant: tap feedback, hover transitions
 *    - fast:    chip toggles, accordion expand
 *    - normal:  card-appear, sheet-slide
 *    - slow:    success celebrations, hero reveals
 *    - slower:  page transitions, full-screen takeovers
 *
 *  Anything faster than `instant` (60ms) or slower than
 *  `slower` (600ms) should be flagged in code review. */
export const DURATION = {
  instant: 0.06,
  fast: 0.12,
  normal: 0.18,
  slow: 0.32,
  slower: 0.6,
} as const;

export type DurationToken = keyof typeof DURATION;

/** ── Easing tokens ─────────────────────────────────────────
 *  Five named easings + the spring-physics default. Each is
 *  a CSS cubic-bezier or framer-motion spring config. */
export const EASING = {
  /** Material default — slight ease-in, faster ease-out. */
  standard: [0.2, 0, 0, 1] as const,
  /** Decelerate — fast then slow. For appearing elements. */
  decelerate: [0, 0, 0, 1] as const,
  /** Accelerate — slow then fast. For exiting elements. */
  accelerate: [0.4, 0, 1, 1] as const,
  /** Linear — for progress bars + steady ticks. */
  linear: [0, 0, 1, 1] as const,
  /** Sharp — quick start + finish, for micro-interactions. */
  sharp: [0.4, 0, 0.6, 1] as const,
} as const;

export type EasingToken = keyof typeof EASING;

/** ── Spring tokens — framer-motion spring configs ─────────
 *  Re-exported from the canonical `@/lib/motion/tokens` so there is
 *  exactly ONE definition of the app's spring physics — no drift, no
 *  three-different-`snappy` problem. This module remains the home of
 *  the EXTENDED duration/easing scale above (5 tiers / 5 easings);
 *  the springs themselves live in the motion-tokens source of truth.
 *  Keys are kept (`standard`/`snappy`/`gentle`) for API stability. */
export const SPRING = {
  /** Default page-element spring (canonical `soft`, 260/30). */
  standard: MOTION_SPRING.soft,
  /** Tighter spring for chip-tap + button-press (canonical `snappy`, 400/28). */
  snappy: MOTION_SPRING.snappy,
  /** Softer spring for sheet-slide + drawer-open (canonical `gentle`, 180/26). */
  gentle: MOTION_SPRING.gentle,
} as const;

export type SpringToken = keyof typeof SPRING;

/** ── Helpers ─────────────────────────────────────────────── */

/** Pure: gate a duration token by the reduced-motion
 *  preference. Returns 0 when reduced-motion is set. */
export function withReducedMotion(
  duration: number,
  prefersReducedMotion: boolean,
): number {
  return prefersReducedMotion ? 0 : duration;
}

/** Pure: typed accessor — `duration("normal")` returns
 *  `DURATION.normal` with TS type-checking on the token. */
export function duration(token: DurationToken): number {
  return DURATION[token];
}

/** Pure: typed accessor for easing tokens. */
export function easing(
  token: EasingToken,
): readonly [number, number, number, number] {
  return EASING[token];
}

/** Pure: typed accessor for spring tokens. */
export function spring(token: SpringToken) {
  return SPRING[token];
}

/** Pure: list every token name across all groups. Used by the
 *  Sprint K accessibility audit + future "find unused tokens"
 *  tooling. */
export const ALL_MOTION_TOKEN_NAMES: ReadonlyArray<string> = [
  ...Object.keys(DURATION).map((k) => `duration:${k}`),
  ...Object.keys(EASING).map((k) => `easing:${k}`),
  ...Object.keys(SPRING).map((k) => `spring:${k}`),
];
