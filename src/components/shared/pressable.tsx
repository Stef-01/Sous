"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { haptic, type HapticPattern } from "@/lib/motion/haptics";
import { SPRING } from "@/lib/motion/tokens";

/**
 * Pressable (W4) — the standard tap target: a consistent press-scale + a haptic
 * intent on tap, reduced-motion safe. Use for CTAs/cards instead of re-rolling
 * whileTap + vibrate per component.
 */
export function Pressable({
  children,
  onClick,
  feedback = "select",
  className,
  disabled,
  ariaLabel,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  feedback?: HapticPattern;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  type?: "button" | "submit";
}) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={reduced || disabled ? undefined : { scale: 0.96 }}
      transition={SPRING.snappy}
      onClick={() => {
        if (disabled) return;
        haptic(feedback);
        onClick?.();
      }}
      className={className}
    >
      {children}
    </motion.button>
  );
}
