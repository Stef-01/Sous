"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface FallbackActionsProps {
  onRescueFridge?: () => void;
  onPlayGame?: () => void;
  onPersonalize?: () => void;
}

const chips = [
  {
    key: "fridge",
    emoji: "🧊",
    label: "Rescue my fridge",
    handler: "onRescueFridge" as const,
  },
  {
    key: "game",
    emoji: "🎮",
    label: "Play a game",
    handler: "onPlayGame" as const,
  },
] as const;

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
          <span className="text-sm">✨</span>
          Personalize
        </motion.button>
      )}
      {chips.map((chip, idx) => (
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
          <span className="text-sm">{chip.emoji}</span>
          {chip.label}
        </motion.button>
      ))}
    </div>
  );
}
