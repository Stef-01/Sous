"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChefHat, Lock, Check, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SkillNode, SkillNodeStatus } from "@/data/skill-tree";
import { getSkillNode } from "@/data/skill-tree";

interface SkillDetailSheetProps {
  node: SkillNode | null;
  status: SkillNodeStatus;
  cooksCompleted: number;
  open: boolean;
  onClose: () => void;
  onStartCook: (dishSlug: string) => void;
}

/**
 * Skill Detail Sheet — bottom sheet for a tapped skill node.
 * Shows description, associated dishes, and progress.
 * One CTA: "Start cooking" for available/in-progress, info for completed/locked.
 */
export function SkillDetailSheet({
  node,
  status,
  cooksCompleted,
  open,
  onClose,
  onStartCook,
}: SkillDetailSheetProps) {
  if (!node) return null;

  const progress = Math.min(cooksCompleted / node.cooksRequired, 1);

  // Pick a random dish from the node's associated dishes
  const handleStartCook = () => {
    const dishes = node.associatedDishes;
    if (dishes.length === 0) return;
    const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
    onStartCook(randomDish);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-neutral-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full",
                    status === "completed" && "bg-[var(--nourish-green)]/10",
                    status === "in_progress" && "bg-[var(--nourish-green)]/10",
                    status === "available" && "bg-neutral-100",
                    status === "locked" && "bg-neutral-100",
                  )}
                >
                  <span className="text-2xl">{node.emoji}</span>
                </div>
                <div>
                  <h2 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
                    {node.name}
                  </h2>
                  <p className="text-[11px] text-[var(--nourish-subtext)] uppercase tracking-wide">
                    {node.tier === "specialization" && node.cuisineFamily
                      ? `${node.cuisineFamily} specialization`
                      : node.tier}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
                type="button"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 pb-8 space-y-5">
              {/* Description */}
              <p className="text-sm text-[var(--nourish-subtext)] leading-relaxed">
                {node.description}
              </p>

              {/* Progress bar + XP */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--nourish-subtext)]">
                    Progress
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-semibold",
                        status === "completed"
                          ? "text-[var(--nourish-green)]"
                          : "text-[var(--nourish-dark)]",
                      )}
                    >
                      {cooksCompleted}/{node.cooksRequired} cooks
                    </span>
                    <div className="flex items-center gap-0.5 rounded-full bg-[var(--nourish-green)]/10 px-2 py-0.5">
                      <Zap
                        size={9}
                        className="text-[var(--nourish-green)] fill-[var(--nourish-green)]"
                      />
                      <span className="text-[9px] font-bold text-[var(--nourish-green)]">
                        +50 XP
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-3 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(90deg, #22c55e 0%, #4ade80 100%)",
                    }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.max(progress * 100, progress > 0 ? 4 : 0)}%`,
                    }}
                    transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                      }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 2,
                        delay: 0.8,
                        ease: "linear",
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Associated dishes */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
                  Practice dishes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {node.associatedDishes.map((slug) => (
                    <button
                      key={slug}
                      onClick={() => status !== "locked" && onStartCook(slug)}
                      disabled={status === "locked"}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                        status === "locked"
                          ? "border-neutral-100 text-neutral-300 cursor-default"
                          : "border-neutral-200 text-[var(--nourish-dark)] hover:border-[var(--nourish-green)]/30 hover:bg-[var(--nourish-green)]/5 cursor-pointer",
                      )}
                      type="button"
                    >
                      <ChefHat size={12} className="inline mr-1 -mt-0.5" />
                      {slug
                        .split("-")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prerequisites (for locked nodes) */}
              {status === "locked" && node.requiredSkills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
                    Prerequisites
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {node.requiredSkills.map((reqId) => {
                      const reqNode = getSkillNode(reqId);
                      if (!reqNode) return null;
                      return (
                        <div
                          key={reqId}
                          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-[var(--nourish-subtext)]"
                        >
                          <Lock size={10} />
                          {reqNode.emoji} {reqNode.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completed badge */}
              {status === "completed" && (
                <div className="flex items-center gap-2 rounded-xl border border-[var(--nourish-green)]/20 bg-[var(--nourish-green)]/5 px-4 py-3">
                  <Check
                    size={16}
                    className="text-[var(--nourish-green)]"
                    strokeWidth={3}
                  />
                  <span className="text-sm font-semibold text-[var(--nourish-green)]">
                    Skill mastered
                  </span>
                </div>
              )}

              {/* CTA */}
              {status !== "locked" && status !== "completed" && (
                <button
                  onClick={handleStartCook}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nourish-green)] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--nourish-dark-green)]"
                  type="button"
                >
                  Start cooking
                  <ArrowRight size={16} />
                </button>
              )}

              {status === "locked" && (
                <p className="text-center text-xs text-[var(--nourish-subtext)]">
                  Complete the prerequisites above to unlock this skill.
                </p>
              )}

              {status === "completed" && (
                <button
                  onClick={handleStartCook}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 text-sm font-medium text-[var(--nourish-subtext)] transition-colors hover:border-neutral-300"
                  type="button"
                >
                  Practice again
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
