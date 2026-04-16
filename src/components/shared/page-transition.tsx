"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * PageTransition — wraps a page in a fade + slide-up entrance.
 * Uses a spring for natural deceleration when switching tabs.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
    >
      {children}
    </motion.div>
  );
}
