"use client";

import { motion } from "framer-motion";
import { Lock, Zap, ChevronRight, Trophy, Flame } from "lucide-react";
import type { SkillNode, SkillNodeStatus } from "@/data/skill-tree";
import { SkillIcon } from "@/components/shared/skill-icon";

interface NextUnlockCardProps {
  /** The next skill node that is available or in-progress */
  nextNode: {
    node: SkillNode;
    status: SkillNodeStatus;
    cooksCompleted: number;
  } | null;
  /** First locked node (shown if no available nodes exist yet) */
  lockedPreview: {
    node: SkillNode;
    cooksNeeded: number;
  } | null;
  skillsCompleted: number;
}

/** XP reward per skill completion */
const XP_REWARD = 50;

/**
 * Next Unlock Card  -  Phase 3 milestone preview with gamified XP reward display.
 */
export function NextUnlockCard({
  nextNode,
  lockedPreview,
  skillsCompleted,
}: NextUnlockCardProps) {
  // All skills completed
  if (!nextNode && !lockedPreview) {
    return (
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(45,90,61,0.06) 0%, rgba(74,140,92,0.08) 100%)",
          border: "1px solid rgba(45,90,61,0.18)",
        }}
      >
        <div className="flex items-center gap-3">
          <Trophy
            size={28}
            className="text-[var(--nourish-gold)]"
            strokeWidth={1.8}
          />
          <div>
            <p className="text-sm font-bold text-[var(--nourish-green)]">
              All {skillsCompleted} skills mastered!
            </p>
            <p className="text-xs text-[var(--nourish-subtext)] mt-0.5">
              You&apos;ve completed every technique. Keep cooking!
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Active skill  -  in_progress or available
  if (nextNode) {
    const { node, status, cooksCompleted } = nextNode;
    const progress = Math.min(cooksCompleted / node.cooksRequired, 1);
    const remaining = node.cooksRequired - cooksCompleted;
    const progressPct = Math.max(progress * 100, cooksCompleted > 0 ? 6 : 0);

    return (
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-3.5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--nourish-subtext)]">
              {status === "in_progress" ? "In progress" : "Up next"}
            </span>
            {status === "in_progress" && (
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame
                  size={12}
                  className="text-[var(--nourish-warm)]"
                  strokeWidth={2.2}
                />
              </motion.span>
            )}
          </div>

          {/* XP reward badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
              delay: 0.4,
            }}
            className="flex items-center gap-1 rounded-full px-2.5 py-1"
            style={{
              background:
                "linear-gradient(135deg, rgba(45,90,61,0.12), rgba(74,140,92,0.1))",
              border: "1px solid rgba(45,90,61,0.2)",
            }}
          >
            <Zap
              size={11}
              className="text-[var(--nourish-green)] fill-[var(--nourish-green)]"
            />
            <span className="text-[11px] font-bold text-[var(--nourish-green)]">
              +{XP_REWARD} XP
            </span>
          </motion.div>
        </div>

        {/* Skill info */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(45,90,61,0.1), rgba(74,140,92,0.08))",
            }}
          >
            <SkillIcon
              skillId={node.id}
              size={24}
              className="text-[var(--nourish-green)]"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--nourish-dark)]">
              {node.name}
            </p>
            <p className="text-xs text-[var(--nourish-subtext)] leading-relaxed mt-0.5">
              {node.description}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--nourish-subtext)]">
              {remaining > 0
                ? `${remaining} cook${remaining === 1 ? "" : "s"} to unlock`
                : "Ready to complete!"}
            </span>
            <span className="text-xs font-semibold text-[var(--nourish-dark)] tabular-nums">
              {cooksCompleted}/{node.cooksRequired}
            </span>
          </div>

          {/* Gradient progress bar */}
          <div className="h-3 w-full rounded-full bg-neutral-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(90deg, var(--nourish-green) 0%, var(--nourish-light-green) 100%)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{
                duration: 0.7,
                delay: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 2,
                  delay: 1,
                  ease: "linear",
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* CTA hint */}
        {remaining > 0 && (
          <div className="flex items-center gap-1 text-xs text-[var(--nourish-green)] font-medium">
            <span>Cook today to make progress</span>
            <ChevronRight size={12} />
          </div>
        )}
      </motion.div>
    );
  }

  // Locked preview  -  nothing available yet
  const { node, cooksNeeded } = lockedPreview!;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--nourish-subtext)]">
          Coming up
        </span>
        <Lock size={13} className="text-neutral-300" />
      </div>

      <div className="flex items-center gap-3 opacity-60">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <SkillIcon skillId={node.id} size={24} className="text-neutral-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--nourish-dark)]">
            {node.name}
          </p>
          <p className="text-xs text-[var(--nourish-subtext)] mt-0.5">
            Cook {cooksNeeded} more dish{cooksNeeded === 1 ? "" : "es"} to
            unlock
          </p>
        </div>
      </div>
    </motion.div>
  );
}
