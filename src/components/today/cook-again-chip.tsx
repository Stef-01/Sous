"use client";

/**
 * CookAgainChip — Y2 W13.
 *
 * A second small "calm reminder" row below RepeatCookChip on the
 * Today page. Surfaces a single 5★-rated recipe from 21-90 days
 * ago, scored on recency + seasonality + cuisine-rotation
 * (see `src/lib/engine/cook-again.ts`).
 *
 * Anchoring overlay: the chip text references the user's prior
 * rating + days-ago as a personal-best anchor — never generic
 * praise. Renders nothing when no eligible candidate exists,
 * keeping the page calm.
 */

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import { pickReSuggestion } from "@/lib/engine/cook-again";

interface CookAgainChipProps {
  sessions: CookSessionRecord[];
  /** Override the "now" reference for tests + SSR stability. */
  now?: Date;
}

export function CookAgainChip({ sessions, now }: CookAgainChipProps) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const router = useRouter();
  const reference = now ?? new Date();
  const candidate = pickReSuggestion(sessions, reference);
  if (!candidate) return null;

  const { recipeSlug, dishName, lastRating, daysSinceLastCook } = candidate;
  const weeksAgo = Math.round(daysSinceLastCook / 7);
  const ageLabel =
    weeksAgo <= 1 ? `${daysSinceLastCook} days ago` : `${weeksAgo} weeks ago`;

  const onTap = () => {
    router.push(`/cook/${recipeSlug}`);
  };

  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="group flex w-full items-center gap-2.5 rounded-xl border border-[var(--nourish-border-strong)] bg-white/70 px-3.5 py-2.5 text-left text-[13px] transition-colors hover:border-[var(--nourish-gold)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-gold)]/40"
      aria-label={`Make ${dishName} again — you rated it ${lastRating} stars ${ageLabel}`}
    >
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-gold)]/15 text-[var(--nourish-gold)]"
      >
        <Star size={15} strokeWidth={2} fill="currentColor" />
      </span>
      <span className="min-w-0 flex-1 text-[var(--nourish-subtext)]">
        You rated{" "}
        <span className="font-semibold text-[var(--nourish-dark)]">
          {dishName}
        </span>{" "}
        {lastRating}★ {ageLabel} — make it again?
      </span>
      <span
        aria-hidden
        className="shrink-0 text-[11px] font-medium text-[var(--nourish-gold)] opacity-80 transition-opacity group-hover:opacity-100"
      >
        Cook
      </span>
    </motion.button>
  );
}
