"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { haptic, type HapticPattern } from "@/lib/motion/haptics";
import { SPRING, TAP_SCALE } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils/cn";

/**
 * Pressable (W4) — the standard tap target: a consistent press-scale + a haptic
 * intent on tap, reduced-motion safe. Use for CTAs/cards instead of re-rolling
 * whileTap + vibrate per component.
 *
 * State-complete (E4): `disabled` dims + blocks; `loading` shows a spinner,
 * auto-disables, and sets aria-busy (a real pending state, not a dimmed one).
 */
export function Pressable({
  children,
  onClick,
  feedback = "select",
  className,
  disabled,
  loading,
  ariaLabel,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  feedback?: HapticPattern;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  type?: "button" | "submit";
}) {
  const reduced = useReducedMotion();
  const inert = disabled || loading;
  return (
    <motion.button
      type={type}
      disabled={inert}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      whileTap={reduced || inert ? undefined : { scale: TAP_SCALE }}
      transition={SPRING.snappy}
      onClick={() => {
        if (inert) return;
        haptic(feedback);
        onClick?.();
      }}
      className={cn(
        inert && "cursor-not-allowed",
        disabled && "opacity-50",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="mx-auto h-4 w-4 animate-spin" aria-hidden />
      ) : (
        children
      )}
    </motion.button>
  );
}
