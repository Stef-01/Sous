"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION, EASE, staggerChildren } from "@/lib/motion/tokens";

/**
 * W10 — list entrance motion: children fade + rise in sequence, instant under
 * reduced motion. Wrap a list in <StaggerList> and each row in <StaggerItem>.
 */
function containerVariants(reduced: boolean | null): Variants {
  return { hidden: {}, show: { transition: staggerChildren(reduced) } };
}

function itemVariants(reduced: boolean | null): Variants {
  return reduced
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 8 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION.base, ease: EASE.out },
        },
      };
}

export function StaggerList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.ul
      variants={containerVariants(reduced)}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.ul>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.li variants={itemVariants(reduced)} className={className}>
      {children}
    </motion.li>
  );
}
