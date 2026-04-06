// Shared spring presets for consistent, characterful motion across the app
export const springs = {
  /** Satisfying plop — bouncy arrival with slight overshoot */
  plop: { type: "spring" as const, stiffness: 300, damping: 20, mass: 1.2 },
  /** Gentle float — subtle ambient motion, slow and dreamy */
  gentle: { type: "spring" as const, stiffness: 50, damping: 12, mass: 0.8 },
  /** Snappy — button taps, quick micro-interactions */
  snappy: { type: "spring" as const, stiffness: 400, damping: 25, mass: 0.6 },
  /** Wobbly — playful overshoot for side dishes and chips */
  wobbly: { type: "spring" as const, stiffness: 200, damping: 22, mass: 1.0 },
  /** Modal — smooth and deliberate for overlays */
  modal: { type: "spring" as const, stiffness: 250, damping: 22, mass: 1.0 },

  // === Video Game Spawn Springs ===

  /** Spawn plop — extreme bounce for the initial overshoot (0 → 1.25) */
  spawnPlop: {
    type: "spring" as const,
    stiffness: 500,
    damping: 12,
    mass: 0.8,
  },
  /** Squish — quick spring for the squash-stretch effect */
  squish: { type: "spring" as const, stiffness: 600, damping: 15, mass: 0.5 },

  // === UI Transition Springs ===

  /** Button morph — smooth crossfade for button text/color transitions */
  buttonMorph: {
    type: "spring" as const,
    stiffness: 350,
    damping: 28,
    mass: 0.7,
  },
} as const;

// === Keyframe Animation Definitions ===

/**
 * Video game fruit spawn scale sequence.
 * Creates the satisfying: tiny → overshoot → undershoot → settle pattern
 * 0 → 0.4 → 1.25 → 0.92 → 1.08 → 0.97 → 1.02 → 1
 */
export const spawnScaleKeyframes = {
  scale: [0, 0.4, 1.12, 0.95, 1.04, 0.98, 1.01, 1],
  times: [0, 0.15, 0.4, 0.55, 0.7, 0.82, 0.92, 1],
};

/**
 * Squash and stretch keyframes for landing.
 * Item briefly squishes wider when it "lands"
 */
export const squashStretchKeyframes = {
  scaleX: [1, 1.15, 0.95, 1.03, 1],
  scaleY: [1, 0.85, 1.08, 0.98, 1],
  times: [0, 0.3, 0.5, 0.75, 1],
};

/**
 * Rotation wobble that accompanies the plop
 */
export const wobbleRotationKeyframes = {
  rotate: [0, -4, 3, -1.5, 0.5, 0],
  times: [0, 0.25, 0.45, 0.65, 0.85, 1],
};

/** Stagger timing constants for spawn sequences */
export const spawnStagger = {
  /** Time between each item spawn (s) */
  delayBetweenItems: 0.18,
  /** Initial delay before first item spawns */
  initialDelay: 0.1,
  /** Extra delay for reroll button after all dishes */
  buttonDelay: 0.35,
};
