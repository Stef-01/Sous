"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { SkillNode, SkillNodeStatus } from "@/data/skill-tree";

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

/**
 * Next Unlock Card — Phase 3 milestone preview.
 *
 * Shows either:
 * - An in-progress or available skill with progress toward completing it
 * - A locked teaser showing what's coming next
 * - An "all unlocked" celebration if everything is done
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-2xl border border-[var(--nourish-green)]/20 bg-[var(--nourish-green)]/5 p-5"
      >
        <p className="text-sm font-semibold text-[var(--nourish-green)]">
          🏆 All {skillsCompleted} skills unlocked
        </p>
        <p className="text-xs text-[var(--nourish-subtext)] mt-1">
          You&apos;ve mastered every technique in the tree. Keep cooking!
        </p>
      </motion.div>
    );
  }

  // Active skill — in_progress or available
  if (nextNode) {
    const { node, status, cooksCompleted } = nextNode;
    const progress = Math.min(cooksCompleted / node.cooksRequired, 1);
    const remaining = node.cooksRequired - cooksCompleted;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--nourish-dark)]">
            {status === "in_progress" ? "In progress" : "Up next"}
          </h3>
          <span className="text-lg">{node.emoji}</span>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--nourish-dark)]">
            {node.name}
          </p>
          <p className="text-xs text-[var(--nourish-subtext)] leading-relaxed">
            {node.description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--nourish-subtext)]">
            <span>
              {remaining > 0
                ? `${remaining} cook${remaining === 1 ? "" : "s"} to unlock`
                : "Ready to complete!"}
            </span>
            <span>
              {cooksCompleted}/{node.cooksRequired}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[var(--nourish-green)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Locked preview — nothing available yet
  const { node, cooksNeeded } = lockedPreview!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--nourish-dark)]">
          Coming up
        </h3>
        <Lock size={14} className="text-neutral-300" />
      </div>

      <div className="space-y-1 opacity-60">
        <p className="text-sm font-medium text-[var(--nourish-dark)]">
          {node.emoji} {node.name}
        </p>
        <p className="text-xs text-[var(--nourish-subtext)]">
          Cook {cooksNeeded} more dish{cooksNeeded === 1 ? "" : "es"} to unlock
        </p>
      </div>
    </motion.div>
  );
}
