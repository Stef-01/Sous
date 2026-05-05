"use client";

/**
 * WeeklyThemeBanner — surfaces the active pod-challenge theme
 * above the pod tile on the Community page (Y5 G).
 *
 * The theme rotates deterministically per ISO week, so every
 * pod sees the same theme on the same week. The banner pulls
 * in the `WeeklyTheme` shape (title + blurb + emoji) from the
 * pure resolver and renders a quiet, taps-through-to-pod card.
 *
 * Renders nothing while the pod state is hydrating to avoid a
 * flash before the user's pod context resolves.
 */

import Link from "next/link";
import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { resolveWeeklyTheme } from "@/lib/pod/weekly-themes";
import { weekKey as computeWeekKey } from "@/lib/pod/pod-score";
import { useCurrentPod } from "@/lib/pod/use-current-pod";
import { cn } from "@/lib/utils/cn";

export function WeeklyThemeBanner() {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const { mounted } = useCurrentPod();

  // Compute the theme on every render — it's a pure resolver
  // over the current ISO week, so cost is negligible.
  const theme = useMemo(() => {
    const wk = computeWeekKey(new Date());
    return resolveWeeklyTheme({ weekKey: wk });
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className={cn(
        "rounded-2xl border border-[var(--nourish-green)]/20",
        "bg-[var(--nourish-green)]/5 p-3",
      )}
    >
      <Link
        href="/community/leaderboard"
        className="flex items-start gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40 rounded-xl"
        aria-label={`This week's pod theme: ${theme.title}. View leaderboard.`}
      >
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm"
        >
          {theme.emoji}
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--nourish-green)]">
            This week · pod theme
          </p>
          <p className="font-serif text-sm font-semibold text-[var(--nourish-dark)]">
            {theme.title}
          </p>
          <p className="text-[11px] leading-snug text-[var(--nourish-subtext)]">
            {theme.blurb}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
