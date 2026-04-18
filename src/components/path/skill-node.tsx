"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SkillNodeStatus } from "@/data/skill-tree";
import type { SkillTrainingHover } from "@/data/skill-node-training-hovers";
import { SkillIcon } from "@/components/shared/skill-icon";

interface SkillNodeProps {
  id: string;
  name: string;
  status: SkillNodeStatus;
  cooksCompleted: number;
  cooksRequired: number;
  onTap: (id: string) => void;
  trainingHover: SkillTrainingHover;
  /** 0–1 preference freshness. 1 means "cooked today", lower values fade the
   *  warm halo around completed / in-progress nodes. Undefined == no halo. */
  freshness?: number;
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
  status,
  cooksCompleted,
  cooksRequired,
  onTap,
  trainingHover,
  freshness,
}: SkillNodeProps) {
  const isInteractive = status !== "locked";
  const showHalo =
    (status === "completed" || status === "in_progress") &&
    typeof freshness === "number" &&
    freshness > 0;

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
      title={trainingHover.oneLiner}
      className={cn(
        "group relative flex flex-col items-center gap-1.5 outline-none",
        "hover:z-[90] focus-within:z-[90]",
        isInteractive ? "cursor-pointer" : "cursor-default",
      )}
      style={{ WebkitTapHighlightColor: "transparent", isolation: "auto" }}
      type="button"
    >
      {/* Circle — layoutId shared with SkillDetailSheet for morph transition */}
      <motion.div
        layoutId={`skill-orb-${id}`}
        transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.65 }}
        className={cn(
          "relative flex items-center justify-center rounded-full transition-[border-color,box-shadow] duration-300",
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
        {/* Warm preference-decay halo. Fades with time-since-last-cook. Sits
            *behind* the node; no number, no scold — just ambient warmth that
            cools off as the skill gets rusty. */}
        {showHalo && (
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-3 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(251,191,36,${0.38 * freshness!}) 0%, rgba(251,191,36,0) 72%)`,
              filter: "blur(2px)",
              transition: "opacity 400ms ease-out",
            }}
          />
        )}
        {/* Quiet gold rim on completed — celebration without clutter */}
        {status === "completed" && (
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-[3px] rounded-full"
            style={{
              boxShadow:
                "0 0 0 1.5px rgba(212, 168, 75, 0.55), 0 0 10px rgba(212, 168, 75, 0.18)",
            }}
          />
        )}
        {/* Content by state */}
        {status === "completed" ? (
          <>
            <SkillIcon skillId={id} size={26} className="text-white" />
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
            <SkillIcon
              skillId={id}
              size={26}
              className="text-[var(--nourish-green)]"
            />
            {/* Progress badge */}
            <div
              className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center rounded-full text-white text-[9px] font-bold min-w-[22px] h-[20px] px-1.5 shadow-sm"
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
            <SkillIcon
              skillId={id}
              size={26}
              className="text-[var(--nourish-dark)]"
            />
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
          <div className="flex flex-col items-center justify-center gap-1 opacity-35">
            <SkillIcon skillId={id} size={22} className="text-slate-400" />
            <Lock size={12} className="text-slate-400" />
          </div>
        )}
      </motion.div>

      {/* Label */}
      <span
        className={cn(
          "text-[11px] font-medium text-center leading-tight max-w-[64px]",
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
