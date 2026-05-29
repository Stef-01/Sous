/**
 * Deterministic kid-swap lookup.
 *
 * Given a kid-friendliness label, returns 1-3 short swap suggestions
 * derived from the label's risk fields. No AI, no string manipulation
 * of recipe text. Pure function.
 *
 * The W11 contract: deterministic-first; AI fallback only when this
 * lookup returns fewer than 2 candidates AND a real AI provider is
 * configured. Mock provider mirrors this lookup so dev parity holds.
 */

import type { KidFriendlinessLabel } from "@/types/parent-mode";

export interface KidSwap {
  label: string;
  rationale: string;
}

/**
 * Walks the 8 label fields and emits up to 3 swap candidates in
 * priority order (highest-pain risks first). Stops at 3 to keep the
 * sheet scannable.
 */
export function suggestKidSwapsFromLabel(
  label: KidFriendlinessLabel,
): KidSwap[] {
  const out: KidSwap[] = [];

  if (label.heatLevel >= 3) {
    out.push({
      label: "Halve the chili",
      rationale:
        "Most kids tolerate paprika long before they tolerate chili — half the amount keeps the warmth without the burn.",
    });
  }

  if (label.smellIntensity >= 2) {
    out.push({
      label: "Sauce on the side",
      rationale:
        "Strong-smelling sauces are the rejection trigger more often than the dish itself. Plate the sauce in a small bowl beside the kid plate.",
    });
  }

  if (label.bitterLoad >= 2) {
    out.push({
      label: "Skip the bitter green",
      rationale:
        "Bitter cruciferous and dark leafy greens read as a 'no' for most kids until 8+. Hold them on the kid plate; keep them on the adult plate.",
    });
  }

  if (label.visibleGreenFlecks && out.length < 3) {
    out.push({
      label: "Garnish only the adult plate",
      rationale:
        "Visible green flecks on otherwise-familiar food are a top-three rejection trigger. Adult plate gets the basil/cilantro/scallion; kid plate stays clean.",
    });
  }

  if (label.textureRisk >= 2 && out.length < 3) {
    out.push({
      label: "Crisp instead of stew",
      rationale:
        "Mixed textures and sliminess are blockers for younger kids. Roast a portion separately or finish a kid-bowl with crisp ingredients on top.",
    });
  }

  if (!label.familiarityAnchor && out.length < 3) {
    out.push({
      label: "Serve with rice or bread",
      rationale:
        "A familiar carrier (rice, bread, tortilla, pasta) on the kid plate raises acceptance even when the rest of the dish is novel.",
    });
  }

  return out.slice(0, 3);
}

/**
 * Returns true when the deterministic lookup is confident enough to
 * skip the AI fallback. Threshold is 2+ swaps; below that we let AI
 * try to add a third specific suggestion if available.
 */
export function isDeterministicLookupSufficient(swaps: KidSwap[]): boolean {
  return swaps.length >= 2;
}
