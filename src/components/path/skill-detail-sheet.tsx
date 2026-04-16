"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChefHat, Lock, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SkillNode, SkillNodeStatus } from "@/data/skill-tree";
import { getSkillNode } from "@/data/skill-tree";
import { getSkillTrainingHover } from "@/data/skill-node-training-hovers";

interface SkillDetailSheetProps {
  node: SkillNode | null;
  status: SkillNodeStatus;
  cooksCompleted: number;
  open: boolean;
  onClose: () => void;
  onStartCook: (dishSlug: string) => void;
  /** Called when user taps a practice dish chip — passes display name for search pre-fill */
  onPracticeDish?: (displayName: string) => void;
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
  onPracticeDish,
}: SkillDetailSheetProps) {
  // Note: do NOT return null when node is null — AnimatePresence needs to render
  // to fire the exit animation. The `open` prop and `node` will both be falsy
  // at the same time (both derived from selectedNodeId), so gating on `open`
  // inside AnimatePresence is sufficient. Guard node access throughout.
  const progress = node ? Math.min(cooksCompleted / node.cooksRequired, 1) : 0;
  const training = node ? getSkillTrainingHover(node.id) : null;

  // Pick a random dish from the node's associated dishes
  const handleStartCook = () => {
    if (!node) return;
    const dishes = node.associatedDishes;
    if (dishes.length === 0) return;
    const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
    onStartCook(randomDish);
  };

  return (
    <>
      {/* Backdrop — separate AnimatePresence */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="skill-detail-backdrop"
            className="fixed inset-0 z-[55] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sheet — separate AnimatePresence; flex-col avoids sticky+transform bug */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="skill-detail-sheet"
            className="fixed inset-x-0 bottom-0 z-[60] flex flex-col max-h-[80vh] rounded-t-3xl bg-white shadow-2xl safe-area-bottom"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 380,
              mass: 0.72,
            }}
          >
            {/* Fixed header (never scrolls) */}
            <div className="flex-shrink-0 rounded-t-3xl bg-white">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-neutral-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-2 pb-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    layoutId={node ? `skill-orb-${node.id}` : undefined}
                    transition={{
                      type: "spring",
                      stiffness: 360,
                      damping: 32,
                      mass: 0.65,
                    }}
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-full",
                      status === "completed" && "bg-[var(--nourish-green)]/10",
                      status === "in_progress" &&
                        "bg-[var(--nourish-green)]/10",
                      status === "available" && "bg-neutral-100",
                      status === "locked" && "bg-neutral-100",
                    )}
                  >
                    <span className="text-2xl">{node?.emoji}</span>
                  </motion.div>
                  <div>
                    <h2 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
                      {node?.name}
                    </h2>
                    <p className="text-[11px] text-[var(--nourish-subtext)] uppercase tracking-wide">
                      {node?.cuisineFamily
                        ? `${node.cuisineFamily} specialization`
                        : node?.tier.replace("-", " ")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors active:scale-90"
                  type="button"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            {/* end fixed header */}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <motion.div
                key={node?.id ?? "empty"}
                className="px-5 pb-24 space-y-5"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.07, delayChildren: 0.06 },
                  },
                }}
              >
                {training && (
                  <motion.div
                    className="overflow-hidden rounded-2xl border border-[var(--nourish-green)]/18 bg-gradient-to-br from-white via-white to-[var(--nourish-cream)] px-4 py-3.5 shadow-[0_8px_30px_-12px_rgba(45,90,61,0.18)]"
                    variants={{
                      hidden: { opacity: 0, y: 14, scale: 0.97 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 340,
                          damping: 26,
                        },
                      },
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-[var(--nourish-green)]/12 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--nourish-green)]">
                        {training.badge}
                      </span>
                      <span className="text-[10px] font-medium text-[var(--nourish-subtext)]">
                        What this unlocks at home
                      </span>
                    </div>
                    <p className="mt-2 font-serif text-base font-semibold leading-snug text-[var(--nourish-dark)]">
                      {training.sheetHeadline}
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {training.atHomeYoull.map((line, i) => (
                        <motion.li
                          key={line}
                          className="flex gap-2.5 text-[13px] leading-snug text-[var(--nourish-subtext)]"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.12 + i * 0.09,
                            type: "spring",
                            stiffness: 320,
                            damping: 28,
                          }}
                        >
                          <span
                            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--nourish-green)]"
                            aria-hidden
                          />
                          <span>{line}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Description */}
                <motion.p
                  className="text-sm text-[var(--nourish-subtext)] leading-relaxed"
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {node?.description}
                </motion.p>

                {/* Progress bar + XP */}
                <motion.div
                  className="space-y-2"
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--nourish-subtext)]">
                      Progress
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        status === "completed"
                          ? "text-[var(--nourish-green)]"
                          : "text-[var(--nourish-dark)]",
                      )}
                    >
                      {cooksCompleted}/{node?.cooksRequired ?? 0} cooks
                    </span>
                  </div>
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-neutral-100">
                    <motion.div
                      className={cn(
                        "relative h-full overflow-hidden rounded-full",
                        status === "completed"
                          ? "bg-[var(--nourish-green)]"
                          : "bg-[var(--nourish-green)]/70",
                      )}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.max(progress * 100, progress > 0 ? 4 : 0)}%`,
                      }}
                      transition={{
                        duration: 0.7,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                    >
                      <motion.div
                        className="pointer-events-none absolute inset-0"
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
                </motion.div>

                {/* Associated dishes */}
                <motion.div
                  className="space-y-2"
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <h3 className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
                    Practice dishes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(node?.associatedDishes ?? []).map((slug) => {
                      const displayName = slug
                        .split("-")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ");
                      return (
                        <button
                          key={slug}
                          onClick={() => {
                            if (status === "locked") return;
                            if (onPracticeDish) {
                              onPracticeDish(displayName);
                            } else {
                              onStartCook(slug);
                            }
                          }}
                          disabled={status === "locked"}
                          className={cn(
                            "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                            status === "locked"
                              ? "border-neutral-100 text-neutral-300 cursor-default"
                              : "border-neutral-200 text-[var(--nourish-dark)] hover:border-[var(--nourish-green)]/30 hover:bg-[var(--nourish-green)]/5 cursor-pointer active:scale-95",
                          )}
                          type="button"
                        >
                          <ChefHat size={12} className="inline mr-1 -mt-0.5" />
                          {displayName}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Prerequisites (for locked nodes) */}
                {status === "locked" &&
                  (node?.requiredSkills.length ?? 0) > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
                        Prerequisites
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(node?.requiredSkills ?? []).map((reqId) => {
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nourish-green)] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[var(--nourish-dark-green)] active:scale-[0.97]"
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 text-sm font-medium text-[var(--nourish-subtext)] transition-all hover:border-neutral-300 active:scale-[0.97]"
                    type="button"
                  >
                    Practice again
                  </button>
                )}
              </motion.div>
            </div>
            {/* end scrollable content */}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
