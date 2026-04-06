"use client";

import { motion } from "framer-motion";
import { Refrigerator, Gamepad2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FallbackActionsProps {
  onRescueFridge?: () => void;
  onPlayGame?: () => void;
  onOrderOut?: () => void;
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
  {
    key: "order",
    icon: ShoppingCart,
    label: "Order out",
    handler: "onOrderOut" as const,
    badge: "30% off",
  },
] as const;

/**
 * Fallback actions — single-row scrollable chips for alternative actions.
 * "Rescue my fridge", "Play a game", "Order out" (with 30% off badge).
 */
export function FallbackActions({
  onRescueFridge,
  onPlayGame,
  onOrderOut,
}: FallbackActionsProps) {
  const handlers = { onRescueFridge, onPlayGame, onOrderOut };

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
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
              "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium whitespace-nowrap",
              "text-[var(--nourish-dark)] hover:text-[var(--nourish-green)]",
              "border border-neutral-200 hover:border-[var(--nourish-green)]/30",
              "bg-white transition-colors duration-150",
            )}
            type="button"
          >
            <Icon size={14} className="text-[var(--nourish-green)]" />
            {chip.label}
            {"badge" in chip && chip.badge && (
              <span className="absolute -top-2 -right-1.5 rounded-full bg-[var(--nourish-gold)] px-1.5 py-0.5 text-[8px] font-bold text-white leading-none shadow-sm">
                {chip.badge}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
