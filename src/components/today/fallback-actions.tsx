"use client";

import { motion } from "framer-motion";
import { Refrigerator, Gamepad2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FallbackActionsProps {
  onRescueFridge?: () => void;
  onPlayGame?: () => void;
  /** Show a "Personalize" chip when the user has already completed the quiz. */
  onPersonalize?: () => void;
}

const chips = [
  {
    key: "fridge",
    icon: Refrigerator,
    label: "Rescue my fridge",
    handler: "onRescueFridge" as const,
  },
  {
    key: "game",
    icon: Gamepad2,
    label: "Play a game",
    handler: "onPlayGame" as const,
  },
] as const;

/**
 * Fallback actions — single-row scrollable chips for alternative actions.
 * "Rescue my fridge", "Play a game", "Order out" (with 30% off badge).
 */
export function FallbackActions({
  onRescueFridge,
  onPlayGame,
  onPersonalize,
}: FallbackActionsProps) {
  const handlers = { onRescueFridge, onPlayGame };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
      {onPersonalize && (
        <motion.button
          onClick={onPersonalize}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.22,
          }}
          whileTap={{ scale: 0.92 }}
          className={cn(
            "relative flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-medium whitespace-nowrap min-h-[36px]",
            "text-[var(--nourish-green)] hover:text-[var(--nourish-dark-green)]",
            "border border-[var(--nourish-green)]/30 hover:border-[var(--nourish-green)]/60",
            "bg-[var(--nourish-green)]/5 transition-colors duration-150",
          )}
          type="button"
        >
          <Sparkles size={14} className="text-[var(--nourish-green)]" />
          Personalize
        </motion.button>
      )}
      {chips.map((chip, idx) => {
        const Icon = chip.icon;
        return (
          <motion.button
            key={chip.key}
            onClick={handlers[chip.handler]}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.28 + idx * 0.06,
            }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-medium whitespace-nowrap min-h-[36px]",
              "text-[var(--nourish-dark)] hover:text-[var(--nourish-green)]",
              "border border-neutral-200 hover:border-[var(--nourish-green)]/30",
              "bg-white transition-colors duration-150",
            )}
            type="button"
          >
            <Icon size={14} className="text-[var(--nourish-green)]" />
            {chip.label}
          </motion.button>
        );
      })}
    </div>
  );
}
