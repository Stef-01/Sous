"use client";

/**
 * InstacartHint — minimal nudge below the "Add to shopping list" button
 * on the Grab phase. Renders only when `missingCount > 0`. No screen,
 * no modal, no expand — just a one-line "Instacart · ~20 min" so the
 * cook decides to keep going instead of bailing on a missing ingredient.
 *
 * V1 placeholder per ROADMAP Phase 10 — no real Instacart integration
 * yet. The label carries "(soon)" so we never imply a working
 * fulfillment connection.
 *
 * Minimalism (POLISH-CHECKLIST §1.5.2):
 *   - One line. Wordmark glyph + clock + ETA + suffix.
 *   - No CTA button, no card, no expand.
 *   - Disappears when there's nothing missing.
 */

import { Clock } from "lucide-react";

interface Props {
  missingCount: number;
}

export function InstacartHint({ missingCount }: Props) {
  if (missingCount <= 0) return null;
  return (
    <p
      className="flex items-center justify-center gap-1.5 pt-1 text-[11px] leading-snug text-[var(--nourish-subtext)]"
      aria-label={`Instacart can deliver missing ingredients in about 20 minutes (coming soon)`}
    >
      {/* Tiny carrot glyph stands in for the Instacart logo until real
          brand assets land. Single SVG, inline, no network. */}
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        className="text-[#FF7009]"
      >
        <path
          d="M12 3 L13.5 8 L18 9.5 L13.5 11 L12 16 L10.5 11 L6 9.5 L10.5 8 Z"
          fill="currentColor"
        />
      </svg>
      <span className="font-semibold">Instacart</span>
      <Clock size={11} className="opacity-70" />
      <span>~20 min</span>
      <span className="opacity-60">· soon</span>
    </p>
  );
}
