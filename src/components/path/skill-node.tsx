"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
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
 *   completed  — green gradient fill, checkmark badge, star burst
 *   in_progress — green border, pulsing glow, progress fraction
 *   available  — white circle, subtle bounce on hover, tappable
 *   locked     — soft gray-blue tint, lock icon, dimmed but visible
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
      whileTap={
        isInteractive
          ? {
              scale: 0.88,
              transition: { type: "spring", stiffness: 400, damping: 15 },
            }
          : undefined
      }
      onClick={() => isInteractive && onTap(id)}
      disabled={!isInteractive}
      className={cn(
        "flex flex-col items-center gap-1.5 group",
        isInteractive ? "cursor-pointer" : "cursor-default",
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
      type="button"
    >
      {/* Circle */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-300",
          "w-16 h-16",
          status === "completed" && "shadow-lg",
          status === "in_progress" &&
            "bg-white border-[3px] border-[var(--nourish-green)] shadow-lg",
          status === "available" &&
            "bg-white border-2 border-neutral-200 hover:border-[var(--nourish-green)]/50 hover:shadow-md",
          status === "locked" &&
            "bg-neutral-100 border-2 border-neutral-200 opacity-50",
        )}
        style={
          status === "completed"
            ? {
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
              }
            : status === "in_progress"
              ? {
                  boxShadow: "0 4px 16px rgba(34, 197, 94, 0.25)",
                }
              : undefined
        }
      >
        {/* Content by state */}
        {status === "completed" ? (
          <>
            <span className="text-xl">{emoji}</span>
            {/* Checkmark badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 12,
                delay: 0.2,
              }}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md border border-[var(--nourish-green)]/20"
            >
              <Check
                size={11}
                className="text-[var(--nourish-green)]"
                strokeWidth={3}
              />
            </motion.div>
          </>
        ) : status === "in_progress" ? (
          <>
            <span className="text-xl">{emoji}</span>
            {/* Progress badge */}
            <div
              className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full text-white text-[9px] font-bold min-w-[22px] h-[18px] px-1 shadow-sm"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
              }}
            >
              {cooksCompleted}/{cooksRequired}
            </div>
            {/* Pulsing glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: "2px solid var(--nourish-green)",
                boxShadow: "0 0 0 0 rgba(34,197,94,0.5)",
              }}
              animate={{
                scale: [1, 1.18, 1],
                opacity: [0.7, 0, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        ) : status === "available" ? (
          <>
            <span className="text-xl">{emoji}</span>
            {/* Breathing glow to signal interactivity */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[var(--nourish-green)]/20"
              animate={{
                borderColor: [
                  "rgba(34,197,94,0.15)",
                  "rgba(34,197,94,0.35)",
                  "rgba(34,197,94,0.15)",
                ],
                boxShadow: [
                  "0 0 0 0 rgba(34,197,94,0)",
                  "0 0 8px 2px rgba(34,197,94,0.08)",
                  "0 0 0 0 rgba(34,197,94,0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        ) : (
          /* Locked state */
          <div className="flex flex-col items-center gap-0.5 opacity-40">
            <span className="text-base grayscale">{emoji}</span>
            <Lock size={9} className="text-slate-400" />
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-[10px] font-medium text-center leading-tight max-w-[80px]",
          status === "completed" && "text-[var(--nourish-green)] font-semibold",
          status === "in_progress" && "text-[var(--nourish-dark)]",
          status === "available" && "text-[var(--nourish-subtext)]",
          status === "locked" && "text-neutral-300",
        )}
      >
        {name}
      </span>
    </motion.button>
  );
}
