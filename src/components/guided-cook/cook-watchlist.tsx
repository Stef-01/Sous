"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useMistakeSuppression } from "@/lib/hooks/use-mistake-suppression";
import type { StaticCookStep } from "@/data/guided-cook-steps";

interface CookWatchlistProps {
  /** Slug of the dish — used to respect per-dish mistake suppressions. */
  dishSlug?: string;
  /** All cook steps for this dish. Only those with `mistakeWarning` contribute. */
  steps: StaticCookStep[];
}

/**
 * Cook Watchlist — collapsed chip at the top of the Grab phase that lists every
 * step's mistake warning in one glance. Pulls from `guidedCookSteps` only and
 * respects per-dish `useMistakeSuppression`. Silent when nothing to watch for.
 */
export function CookWatchlist({ dishSlug, steps }: CookWatchlistProps) {
  const [expanded, setExpanded] = useState(false);
  const { isSuppressed, mounted } = useMistakeSuppression();

  const warnings = useMemo(() => {
    const all = steps
      .filter((s) => !!s.mistakeWarning && s.mistakeWarning.trim().length > 0)
      .map((s) => ({
        stepNumber: s.stepNumber,
        mistakeId: `step-${s.stepNumber}`,
        warning: s.mistakeWarning as string,
      }));
    if (!mounted || !dishSlug) return all;
    return all.filter((w) => !isSuppressed(dishSlug, w.mistakeId));
  }, [steps, dishSlug, isSuppressed, mounted]);

  if (warnings.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--nourish-warm)]/30 bg-[var(--nourish-warm)]/5 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        type="button"
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-3 py-2.5",
          "text-left transition-colors hover:bg-[var(--nourish-warm)]/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-warm)]/50",
        )}
      >
        <span className="flex items-center gap-2">
          <AlertTriangle
            size={14}
            className="text-[var(--nourish-warm)]"
            strokeWidth={2}
            aria-hidden
          />
          <span className="text-xs font-medium text-[var(--nourish-dark)]">
            {warnings.length === 1
              ? "1 thing to watch for in this cook"
              : `${warnings.length} things to watch for in this cook`}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-[var(--nourish-warm)] transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden px-3 pb-2.5 space-y-1.5"
          >
            {warnings.map((w) => (
              <li
                key={w.mistakeId}
                className="flex items-start gap-2 text-[11px] leading-snug text-[var(--nourish-subtext)]"
              >
                <span
                  className="mt-[3px] inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--nourish-warm)]"
                  aria-hidden
                />
                <span>
                  <span className="font-medium text-[var(--nourish-dark)]">
                    Step {w.stepNumber}:
                  </span>{" "}
                  {w.warning}
                </span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
