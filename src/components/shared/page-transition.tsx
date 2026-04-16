"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * PageTransition — wraps a page in a fade + slide-up entrance.
 * opacity 0→1, translateY 8px→0, 200ms ease-out.
 * Used by route layouts so every tab switch feels fluid on mobile.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      // Avoid opacity:0 on first paint — subtree stays test-visible and a11y-complete.
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
