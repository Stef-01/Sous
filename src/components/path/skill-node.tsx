"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SkillNodeStatus } from "@/data/skill-tree";

interface SkillNodeProps {
  id: string;
  name: string;
  emoji: string;
  status: SkillNodeStatus;
  cooksCompleted: number;
  cooksRequired: number;
  onTap: (id: string) => void;
}

/**
 * Skill Node — circular node in the skill tree.
 *
 * Visual states:
 *   completed  — green fill, checkmark overlay
 *   in_progress — green border, pulsing glow, progress fraction
 *   available  — white circle, visible emoji, tappable
 *   locked     — gray circle, lock icon, not tappable
 */
export function SkillNodeComponent({
  id,
  name,
  emoji,
  status,
  cooksCompleted,
  cooksRequired,
  onTap,
}: SkillNodeProps) {
  const isInteractive = status !== "locked";

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onClick={() => isInteractive && onTap(id)}
      disabled={!isInteractive}
      className={cn(
        "flex flex-col items-center gap-1.5 group",
        isInteractive ? "cursor-pointer" : "cursor-default"
      )}
      type="button"
    >
      {/* Circle */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-300",
          // Size
          "w-16 h-16",
          // Status-based styling
          status === "completed" &&
            "bg-[var(--nourish-green)] border-2 border-[var(--nourish-green)] shadow-lg shadow-[var(--nourish-green)]/20",
          status === "in_progress" &&
            "bg-white border-[3px] border-[var(--nourish-green)] shadow-lg shadow-[var(--nourish-green)]/30",
          status === "available" &&
            "bg-white border-2 border-neutral-200 hover:border-[var(--nourish-green)]/50 hover:shadow-md",
          status === "locked" &&
            "bg-neutral-100 border-2 border-neutral-200 opacity-50"
        )}
      >
        {/* Content by state */}
        {status === "completed" ? (
          <>
            <span className="text-lg">{emoji}</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Check
                size={12}
                className="text-[var(--nourish-green)]"
                strokeWidth={3}
              />
            </div>
          </>
        ) : status === "in_progress" ? (
          <>
            <span className="text-xl">{emoji}</span>
            {/* Progress badge */}
            <div className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-[var(--nourish-green)] text-white text-[9px] font-bold min-w-[22px] h-[18px] px-1 shadow-sm">
              {cooksCompleted}/{cooksRequired}
            </div>
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[var(--nourish-green)]"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        ) : status === "available" ? (
          <span className="text-xl">{emoji}</span>
        ) : (
          <span className="text-lg grayscale opacity-40">{emoji}</span>
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-[10px] font-medium text-center leading-tight max-w-[80px]",
          status === "completed" && "text-[var(--nourish-green)]",
          status === "in_progress" && "text-[var(--nourish-dark)]",
          status === "available" && "text-[var(--nourish-subtext)]",
          status === "locked" && "text-neutral-300"
        )}
      >
        {name}
      </span>
    </motion.button>
  );
}
