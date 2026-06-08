/**
 * W7 — one bottom-sheet motion contract, so every sheet (Info, meal queue, vaul
 * sheets) opens and closes the same way, on the shared spring, and degrades to a
 * quick fade under reduced motion. Components spread the result onto their
 * motion element instead of re-deriving y/spring each time.
 */

import type { Transition } from "framer-motion";
import { SPRING, DURATION } from "./tokens";

export interface SheetMotion {
  initial: false | { y: string } | { opacity: number };
  animate: { y: number } | { opacity: number };
  exit: { y: string } | { opacity: number };
  transition: Transition;
}

export function sheetMotion(reducedMotion: boolean | null): SheetMotion {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: DURATION.fast },
    };
  }
  return {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: SPRING.soft,
  };
}
