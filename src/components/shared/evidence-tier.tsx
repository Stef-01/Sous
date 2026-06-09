/**
 * Phase 8 — the single quality-grammar source. Every evidence grade, ayurvedic
 * herb-strength chip, and review badge speaks ONE three-tier language from the
 * `--tier-*` token ramp in globals.css — replacing 4 hand-redeclared colour sets.
 *
 * Glycemic load is deliberately NOT on this scale: it is directional (low good →
 * high bad), not a strength, so it must stay visually distinct (see glycemic-pill).
 */

import type { Grade } from "@/types/therapeutics";
import type { EvidenceStrength } from "@/data/ayurvedic-evidence";
import { cn } from "@/lib/utils/cn";

export type EvidenceTier = "strong" | "moderate" | "limited";

export const TIER: Record<EvidenceTier, { fg: string; bg: string }> = {
  strong: { fg: "var(--tier-strong)", bg: "var(--tier-strong-bg)" },
  moderate: { fg: "var(--tier-moderate)", bg: "var(--tier-moderate-bg)" },
  limited: { fg: "var(--tier-limited)", bg: "var(--tier-limited-bg)" },
};

/** Evidence GRADE → tier. Honesty correction (binding R6): moderate maps to its
 *  OWN amber tier, not folded into "strong"/green — moderate evidence should not
 *  read as strong. */
export function gradeToTier(grade: Grade): EvidenceTier {
  switch (grade) {
    case "high":
      return "strong";
    case "moderate":
      return "moderate";
    default:
      return "limited"; // low / very-low
  }
}

/** Ayurvedic evidence STRENGTH → tier (1:1; typed so the two can't drift). */
export function strengthToTier(s: EvidenceStrength): EvidenceTier {
  return s; // "strong" | "moderate" | "limited" align by construction
}

/** The one badge for evidence/strength. MetaPill geometry; tier colours only. */
export function EvidenceTierBadge({
  tier,
  label,
  className,
}: {
  tier: EvidenceTier;
  label: string;
  className?: string;
}) {
  return (
    <span
      style={{ color: TIER[tier].fg, backgroundColor: TIER[tier].bg }}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
        className,
      )}
    >
      {label}
    </span>
  );
}
