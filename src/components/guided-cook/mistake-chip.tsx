"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useMistakeSuppression } from "@/lib/hooks/use-mistake-suppression";

interface MistakeChipProps {
  warning: string;
  isExpanded: boolean;
  onToggle: () => void;
  /** Slug of the current recipe. When present alongside `stepNumber`,
   *  enables per-dish suppression via the little `×` button. */
  dishSlug?: string;
  /** Step number  -  stable enough to serve as a per-dish mistake id for
   *  suppression, without needing a separate `mistakeId` field. */
  stepNumber?: number;
}

/**
 * MistakeChip  -  the "common mistake" warning surfaced mid-step.
 *
 * Excellent on cook #1, patronising on cook #5. When the user has already
 * learned the lesson on a specific dish they can dismiss this chip via the
 * small `×` button. The suppression is scoped to that dish only and resets
 * after 180 days. See `useMistakeSuppression`.
 */
export function MistakeChip({
  warning,
  isExpanded,
  onToggle,
  dishSlug,
  stepNumber,
}: MistakeChipProps) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const { isSuppressed, suppress, mounted } = useMistakeSuppression();
  const mistakeId =
    typeof stepNumber === "number" ? `step-${stepNumber}` : null;
  const canSuppress = !!dishSlug && !!mistakeId;
  const suppressed =
    canSuppress && mounted && isSuppressed(dishSlug!, mistakeId!);

  if (suppressed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canSuppress) suppress(dishSlug!, mistakeId!);
  };

  return (
    <div>
      <div
        className={cn(
          "flex w-full items-stretch rounded-lg border transition-all duration-150",
          isExpanded
            ? "border-amber-300/50 bg-amber-50"
            : "border-neutral-200 hover:border-neutral-300",
        )}
      >
        <button
          onClick={onToggle}
          className={cn(
            "flex flex-1 items-center gap-2 px-3 py-2.5 text-sm font-medium text-left",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40",
            isExpanded ? "text-amber-700" : "text-[var(--nourish-subtext)]",
          )}
          type="button"
          aria-label={
            isExpanded
              ? "Hide common mistake warning"
              : "Show common mistake warning"
          }
          aria-expanded={isExpanded}
        >
          <AlertTriangle size={16} />
          Common mistake
        </button>
        {canSuppress && (
          <button
            onClick={handleDismiss}
            className={cn(
              "shrink-0 px-2.5 border-l border-current/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40",
              isExpanded
                ? "text-amber-700/70 hover:text-amber-800"
                : "text-[var(--nourish-subtext)]/60 hover:text-[var(--nourish-subtext)]",
              "transition-colors",
            )}
            type="button"
            aria-label="I've got this  -  don't show this reminder again"
            title="I've got this"
          >
            <X size={14} strokeWidth={2.4} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-3 py-3 text-sm text-amber-800 leading-relaxed bg-amber-50/50 rounded-b-lg">
              {warning}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
