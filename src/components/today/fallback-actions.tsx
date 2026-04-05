"use client";

import { motion } from "framer-motion";
import { Refrigerator, Gamepad2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FallbackActionsProps {
  onRescueFridge?: () => void;
  onPlayGame?: () => void;
  onOrderOut?: () => void;
}

/**
 * Fallback actions — single-row scrollable chips for alternative actions.
 * "Rescue my fridge", "Play a game", "Order out" (with 30% off badge).
 */
export function FallbackActions({
  onRescueFridge,
  onPlayGame,
  onOrderOut,
}: FallbackActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25, duration: 0.3 }}
      className="flex items-center justify-center gap-2"
    >
      <button
        onClick={onRescueFridge}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium whitespace-nowrap",
          "text-[var(--nourish-dark)] hover:text-[var(--nourish-green)]",
          "border border-neutral-200 hover:border-[var(--nourish-green)]/30",
          "bg-white transition-all duration-150 active:scale-95"
        )}
        type="button"
      >
        <Refrigerator size={14} className="text-[var(--nourish-green)]" />
        Rescue my fridge
      </button>

      <button
        onClick={onPlayGame}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium whitespace-nowrap",
          "text-[var(--nourish-dark)] hover:text-[var(--nourish-green)]",
          "border border-neutral-200 hover:border-[var(--nourish-green)]/30",
          "bg-white transition-all duration-150 active:scale-95"
        )}
        type="button"
      >
        <Gamepad2 size={14} className="text-[var(--nourish-green)]" />
        Play a game
      </button>

      <button
        onClick={onOrderOut}
        className={cn(
          "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium whitespace-nowrap",
          "text-[var(--nourish-dark)] hover:text-[var(--nourish-green)]",
          "border border-neutral-200 hover:border-[var(--nourish-green)]/30",
          "bg-white transition-all duration-150 active:scale-95"
        )}
        type="button"
      >
        <ShoppingCart size={14} className="text-[var(--nourish-green)]" />
        Order out
        {/* Discount badge */}
        <span className="absolute -top-2 -right-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[7px] font-bold text-white leading-none shadow-sm">
          30% off
        </span>
      </button>
    </motion.div>
  );
}
