"use client";

/**
 * KidFriendlyHint — a single ambient line on the QuestCard top card,
 * surfaced only when:
 *   - Parent Mode is on
 *   - The dish has a hand-curated kid-friendliness label
 *   - Score >= 0.65 (PARENT-MODE-PLAN §8 acceptance threshold)
 *   - The dish is not parentModeEligible:false (override)
 *
 * Copy is generated deterministically from the label fields — no AI,
 * no free-form. Rotates among a handful of short rationales so it
 * doesn't feel templated.
 */

import { useParentMode } from "@/lib/hooks/use-parent-mode";
import { getKidFriendlinessLabel } from "@/data/parent-mode/kid-friendliness-labels";
import { kidFriendlinessScore } from "@/lib/engine/scorers/kid-friendliness";

const HINT_THRESHOLD = 0.65;

interface Props {
  dishSlug: string;
}

export function KidFriendlyHint({ dishSlug }: Props) {
  const { profile } = useParentMode();
  if (!profile.enabled) return null;

  const label = getKidFriendlinessLabel(dishSlug);
  if (!label || !label.parentModeEligible) return null;

  const score = kidFriendlinessScore(label);
  if (score < HINT_THRESHOLD) return null;

  const reason = pickReason(label);
  if (!reason) return null;

  return (
    <p className="text-[11px] leading-snug text-[var(--nourish-green)]/90">
      Kid-friendly · {reason}.
    </p>
  );
}

/**
 * Picks the most-applicable reason from the label fields. Pure
 * function; deterministic per slug so the same hint shows across
 * re-renders.
 */
function pickReason(
  label: ReturnType<typeof getKidFriendlinessLabel>,
): string | null {
  if (!label) return null;
  // Order matters — the first matching reason wins.
  if (label.familiarityAnchor && label.deconstructable) {
    return "familiar carrier and components on the side";
  }
  if (label.familiarityAnchor) {
    return "built around a familiar carrier";
  }
  if (label.deconstructable) {
    return "easy to plate kid-friendly with sauce on the side";
  }
  if (label.colorBrightness >= 2 && label.bitterLoad === 0) {
    return "bright plate and no bitter notes";
  }
  if (label.heatLevel <= 1 && label.smellIntensity <= 1) {
    return "mild heat and gentle aromatics";
  }
  return "kid-tested signals look good";
}
