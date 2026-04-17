"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

/** Maximum age for a repeat-cook suggestion in milliseconds (14 days). */
const REPEAT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
/** Minimum star rating required before we surface "make it again". */
const MIN_RATING = 4;

/** Pick the most recent session that qualifies as a "last time you loved X".
 *  Pure helper, exported so the logic is unit-testable. */
export function pickRepeatCandidate(
  sessions: CookSessionRecord[],
  now: number = Date.now(),
): CookSessionRecord | null {
  let best: { record: CookSessionRecord; completedAt: number } | null = null;
  for (const s of sessions) {
    if (!s.completedAt) continue;
    if ((s.rating ?? 0) < MIN_RATING) continue;
    const ts = new Date(s.completedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    if (now - ts > REPEAT_WINDOW_MS) continue;
    if (!best || ts > best.completedAt) {
      best = { record: s, completedAt: ts };
    }
  }
  return best?.record ?? null;
}

interface RepeatCookChipProps {
  sessions: CookSessionRecord[];
}

/**
 * RepeatCookChip — a soft one-line row just under the primary search bar that
 * proposes re-cooking the user's most recent loved dish (≥4 stars, <14 days).
 * One tap drops them straight into the Mission screen for that dish.
 *
 * Renders nothing when there's no qualifying session, keeping the page calm
 * for new users and anyone who hasn't rated recently.
 */
export function RepeatCookChip({ sessions }: RepeatCookChipProps) {
  const router = useRouter();
  const candidate = pickRepeatCandidate(sessions);
  if (!candidate) return null;

  const onTap = () => {
    router.push(`/cook/${candidate.recipeSlug}`);
  };

  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="group flex w-full items-center gap-2.5 rounded-xl border border-[var(--nourish-border-strong)] bg-white/70 px-3.5 py-2.5 text-left text-[13px] transition-colors hover:border-[var(--nourish-green)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
      aria-label={`Cook ${candidate.dishName} again`}
    >
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
      >
        <RotateCcw size={15} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 text-[var(--nourish-subtext)]">
        Last time you loved{" "}
        <span className="font-semibold text-[var(--nourish-dark)]">
          {candidate.dishName}
        </span>
        . Make it again?
      </span>
      <span
        aria-hidden
        className="shrink-0 text-[11px] font-medium text-[var(--nourish-green)] opacity-80 transition-opacity group-hover:opacity-100"
      >
        Cook
      </span>
    </motion.button>
  );
}
