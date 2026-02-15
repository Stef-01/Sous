"use client";

import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/**
 * Returns true if the user prefers reduced motion.
 * Components should check this and fall back to simple opacity fades.
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}
