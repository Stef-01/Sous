"use client";

/**
 * EcoProgressChip — quiet "X kg saved this month" surface on
 * Today (Y5 D, audit P0 · Eco Mode polish).
 *
 * Renders only when:
 *   - Eco Mode is enabled, AND
 *   - the user has at least one completed cook in the trailing
 *     30-day window, AND
 *   - the chosen-vs-baseline savings is positive.
 *
 * Tap → /path/eco for the full dashboard breakdown.
 *
 * Pure presentation; the math lives in `lib/eco/summarize-savings`
 * and `lib/eco/carbon-math`.
 */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Leaf } from "lucide-react";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import { useEcoMode } from "@/lib/hooks/use-eco-mode";
import { summarizeMonthlySavings } from "@/lib/eco/summarize-savings";

interface EcoProgressChipProps {
  sessions: ReadonlyArray<CookSessionRecord>;
}

export function EcoProgressChip({ sessions }: EcoProgressChipProps) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const router = useRouter();
  const { mounted, profile } = useEcoMode();

  const summary = useMemo(
    () =>
      summarizeMonthlySavings({
        sessions,
        baseline: profile.comparisonBaseline,
      }),
    [sessions, profile.comparisonBaseline],
  );

  if (!mounted || !profile.enabled) return null;
  if (summary.cookCount === 0 || summary.savedKg <= 0) return null;

  const display =
    summary.savedKg < 1
      ? `${Math.round(summary.savedKg * 1000)}g`
      : `${Math.round(summary.savedKg * 10) / 10} kg`;

  return (
    <motion.button
      type="button"
      onClick={() => router.push("/path/eco")}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="group flex w-full items-center gap-2.5 rounded-xl border border-[var(--nourish-green)]/20 bg-[var(--nourish-green)]/5 px-3.5 py-2.5 text-left text-[13px] transition-colors hover:border-[var(--nourish-green)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
      aria-label={`${display} CO2 equivalent saved this month — open Eco dashboard`}
    >
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
      >
        <Leaf size={15} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 text-[var(--nourish-subtext)]">
        <span className="font-semibold text-[var(--nourish-green)]">
          {display}
        </span>
        <span className="text-[var(--nourish-dark)]"> CO₂e saved</span>{" "}
        {summary.windowLabel}
        <span className="text-[var(--nourish-subtext)]">
          {" · "}
          {summary.cookCount} cook{summary.cookCount === 1 ? "" : "s"}
        </span>
      </span>
    </motion.button>
  );
}
