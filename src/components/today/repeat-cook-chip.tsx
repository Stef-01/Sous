"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Window for the "last time you loved X" variant. */
export const REPEAT_RECENT_WINDOW_MS = 14 * DAY_MS;
/** Sprint C Phase 3: after the recent window, a second warm nudge covers
 *  21-90 days ("It's been N days since your last carbonara"). After 90d
 *  we drop it entirely — a kind reminder, never a guilt screen. */
export const REPEAT_REVIVE_MIN_MS = 21 * DAY_MS;
export const REPEAT_REVIVE_MAX_MS = 90 * DAY_MS;
/** Minimum star rating required before we surface "make it again". */
const MIN_RATING = 4;

export type RepeatCandidateVariant = "recent" | "revive";

export interface RepeatCandidate {
  record: CookSessionRecord;
  variant: RepeatCandidateVariant;
  daysAgo: number;
}

/** Pick the best session to surface as a repeat-cook nudge. Prefers the
 *  recent (<14d) variant, falling back to the revive (21-90d) variant when
 *  nothing new has been loved. Exported for unit tests. */
export function pickRepeatCandidate(
  sessions: CookSessionRecord[],
  now: number = Date.now(),
): RepeatCandidate | null {
  let recent: { record: CookSessionRecord; ts: number } | null = null;
  let revive: { record: CookSessionRecord; ts: number } | null = null;

  for (const s of sessions) {
    if (!s.completedAt) continue;
    if ((s.rating ?? 0) < MIN_RATING) continue;
    const ts = new Date(s.completedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    const age = now - ts;

    if (age >= 0 && age <= REPEAT_RECENT_WINDOW_MS) {
      if (!recent || ts > recent.ts) recent = { record: s, ts };
    } else if (age >= REPEAT_REVIVE_MIN_MS && age <= REPEAT_REVIVE_MAX_MS) {
      // Prefer the most-recently-cooked revive candidate — the closer to
      // "today", the more naturally "it's been N days" reads.
      if (!revive || ts > revive.ts) revive = { record: s, ts };
    }
  }

  if (recent) {
    return {
      record: recent.record,
      variant: "recent",
      daysAgo: Math.max(0, Math.floor((now - recent.ts) / DAY_MS)),
    };
  }
  if (revive) {
    return {
      record: revive.record,
      variant: "revive",
      daysAgo: Math.max(0, Math.floor((now - revive.ts) / DAY_MS)),
    };
  }
  return null;
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

  const { record, variant, daysAgo } = candidate;

  const onTap = () => {
    router.push(`/cook/${record.recipeSlug}`);
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
      aria-label={`Cook ${record.dishName} again`}
    >
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
      >
        <RotateCcw size={15} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 text-[var(--nourish-subtext)]">
        {variant === "recent" ? (
          <>
            Last time you loved{" "}
            <span className="font-semibold text-[var(--nourish-dark)]">
              {record.dishName}
            </span>
            . Make it again?
          </>
        ) : (
          <>
            {`It's been ${daysAgo} days since your last `}
            <span className="font-semibold text-[var(--nourish-dark)]">
              {record.dishName}
            </span>
            .
          </>
        )}
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
