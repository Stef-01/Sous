"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION, EASE } from "@/lib/motion/tokens";

/**
 * W32 — a subtle scroll-driven reveal: content fades + rises once as it enters
 * the viewport (Framer's whileInView → IntersectionObserver). Reduced-motion
 * users get the content immediately with no transform. Wrap Content/Path sections.
 */
export function ScrollReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: DURATION.slow, ease: EASE.out }}
    >
      {children}
    </motion.div>
  );
}
