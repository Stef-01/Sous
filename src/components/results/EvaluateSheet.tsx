"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PlateEvaluation } from "@/lib/engine/plate-evaluation";
import { trpc } from "@/lib/trpc/client";

interface EvaluateSheetProps {
  evaluation: PlateEvaluation;
  mainDish?: string;
  sideDishes?: string[];
  open: boolean;
  onClose: () => void;
  onFinishPlate?: () => void;
}

/**
 * Evaluate A Sheet — bottom sheet overlay that shows the full plate evaluation.
 * Opens over pairer context, never a new page.
 * Confidence-first: strengths shown before suggestions.
 * One CTA: "Finish my plate" or "Looks great" depending on status.
 * AI-powered appraisal rewrite with deterministic fallback.
 */
export function EvaluateSheet({
  evaluation,
  mainDish = "",
  sideDishes = [],
  open,
  onClose,
  onFinishPlate,
}: EvaluateSheetProps) {
  // AI-enhanced appraisal — only fires when sheet is open
  const aiAppraisal = trpc.ai.rewriteAppraisal.useQuery(
    {
      deterministic: evaluation.appraisal,
      status: evaluation.status,
      strengths: evaluation.alreadyWorking,
      suggestion: evaluation.oneBestMove?.message,
      mainDish,
      sideDishes,
    },
    { enabled: open && !!mainDish, staleTime: Infinity },
  );

  const displayAppraisal = aiAppraisal.data?.appraisal ?? evaluation.appraisal;
  const statusConfig = {
    balanced: {
      label: "Balanced",
      color: "text-[var(--nourish-green)]",
      bg: "bg-[var(--nourish-green)]/10",
      border: "border-[var(--nourish-green)]/20",
      icon: <Check size={16} className="text-[var(--nourish-green)]" />,
    },
    good_start: {
      label: "Good start",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: <Sparkles size={16} className="text-amber-500" />,
    },
    needs_improvement: {
      label: "Room to improve",
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: <AlertTriangle size={16} className="text-orange-500" />,
    },
  };

  const config = statusConfig[evaluation.status];

  return (
    <>
      {/* Backdrop — separate AnimatePresence */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="evaluate-backdrop"
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
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
            key="evaluate-sheet"
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[85vh] rounded-t-2xl bg-white shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Fixed header (never scrolls) */}
            <div className="flex-shrink-0 rounded-t-2xl bg-white">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-neutral-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-2 pb-3">
                <h2 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
                  Plate check
                </h2>
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

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="px-5 pb-24 space-y-5">
                {/* Appraisal headline */}
                <div
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border px-4 py-3",
                    config.bg,
                    config.border,
                  )}
                >
                  {config.icon}
                  <div>
                    <p className={cn("text-sm font-semibold", config.color)}>
                      {displayAppraisal}
                    </p>
                    <p className="text-[11px] text-[var(--nourish-subtext)] mt-0.5">
                      {config.label}
                    </p>
                  </div>
                </div>

                {/* Category coverage */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
                    Food groups
                  </h3>
                  <div className="flex gap-2">
                    <CategoryPill
                      label="Vegetables"
                      filled={evaluation.categoryCoverage.vegetables}
                      color="emerald"
                    />
                    <CategoryPill
                      label="Protein"
                      filled={evaluation.categoryCoverage.protein}
                      color="blue"
                    />
                    <CategoryPill
                      label="Grains"
                      filled={evaluation.categoryCoverage.carbs}
                      color="amber"
                    />
                  </div>
                </div>

                {/* Already working — strengths first */}
                {evaluation.alreadyWorking.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
                      What&apos;s working
                    </h3>
                    <ul className="space-y-1.5">
                      {evaluation.alreadyWorking.map((strength, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-[var(--nourish-dark)]"
                        >
                          <Check
                            size={14}
                            className="mt-0.5 shrink-0 text-[var(--nourish-green)]"
                          />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* One best move — only if not keep_as_is */}
                {evaluation.oneBestMove &&
                  evaluation.oneBestMove.type !== "keep_as_is" && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
                        One idea
                      </h3>
                      <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3.5">
                        <p className="text-sm text-[var(--nourish-dark)] leading-relaxed">
                          {evaluation.oneBestMove.message}
                        </p>
                      </div>
                    </div>
                  )}

                {/* CTA */}
                <div className="pt-1">
                  {evaluation.oneBestMove?.type === "swap_side" &&
                  onFinishPlate ? (
                    <button
                      onClick={onFinishPlate}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--nourish-dark-green)]"
                      type="button"
                    >
                      Finish my plate
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--nourish-dark-green)]"
                      type="button"
                    >
                      {evaluation.status === "balanced"
                        ? "Looks great — let's cook"
                        : "Got it — let's cook"}
                    </button>
                  )}

                  {/* Skip link — always available */}
                  <button
                    onClick={onClose}
                    className="mt-2 w-full text-center text-xs text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors"
                    type="button"
                  >
                    Skip evaluation
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Category pill ────────────────────────────────────────────

function CategoryPill({
  label,
  filled,
  color,
}: {
  label: string;
  filled: boolean;
  color: "emerald" | "blue" | "amber";
}) {
  const colorMap = {
    emerald: {
      filled: "bg-emerald-50 border-emerald-200 text-emerald-700",
      empty: "bg-neutral-50 border-neutral-200 text-neutral-400",
    },
    blue: {
      filled: "bg-blue-50 border-blue-200 text-blue-700",
      empty: "bg-neutral-50 border-neutral-200 text-neutral-400",
    },
    amber: {
      filled: "bg-amber-50 border-amber-200 text-amber-700",
      empty: "bg-neutral-50 border-neutral-200 text-neutral-400",
    },
  };

  const style = filled ? colorMap[color].filled : colorMap[color].empty;

  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors",
        style,
      )}
    >
      {filled ? (
        <Check size={12} className="shrink-0" />
      ) : (
        <div className="h-3 w-3 rounded-full border border-current opacity-40" />
      )}
      {label}
    </div>
  );
}
