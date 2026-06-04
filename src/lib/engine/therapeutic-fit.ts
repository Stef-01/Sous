/**
 * Therapeutic-fit scoring (Culinary Therapeutics CT-3).
 *
 * Pure function mapping an active CareProfile + a dish to a 0–1 fit score,
 * 0.5 = neutral. It reads ONLY scorable interventions (recipe-native +
 * fortified) from the evidence registry — extract/supplement records are
 * education only and never contribute (the anti-overclaiming spine). The
 * report's EvidenceWeight mapping (high 1.0 · moderate 0.75 · low 0.40 ·
 * very-low 0.20) sets each matched intervention's contribution.
 *
 * A dish matching several strong-evidence interventions saturates toward 1.0;
 * a dish matching none stays neutral at 0.5. Deterministic, dependency-free.
 */

import type { CareProfile } from "@/types/care-profile";
import type {
  ConditionId,
  Grade,
  InterventionRecord,
} from "@/types/therapeutics";
import { scorableInterventions, CONDITION_IDS } from "@/data/therapeutics";

/** Report default mapping (report §"Scope and grading"). */
export const EVIDENCE_WEIGHT: Record<Grade, number> = {
  high: 1.0,
  moderate: 0.75,
  low: 0.4,
  "very-low": 0.2,
};

/** Directions that earn a positive contribution. "no-benefit" / "exclude" do not. */
const POSITIVE_DIRECTIONS = new Set(["lowers", "raises", "improves-symptoms"]);

export interface TherapeuticDish {
  name: string;
  tags: string[];
  flavorProfile?: string[];
}

export interface MatchedIntervention {
  record: InterventionRecord;
  /** Which of the record's recipeSignals the dish realized. */
  matchedSignals: string[];
}

/** The single text a dish is matched against (name + tags + flavor). */
function dishHaystack(dish: TherapeuticDish): string {
  return `${dish.name} ${dish.tags.join(" ")} ${(dish.flavorProfile ?? []).join(" ")}`.toLowerCase();
}

/**
 * THE shared matching predicate — the scorer (below) and the per-dish health
 * panel (matchInterventionsForDish) both go through here, so they can never
 * disagree about whether a dish realizes an intervention. Returns the matching
 * signals (empty = no match, incl. non-positive directions which never count).
 */
function matchedSignalsFor(
  haystack: string,
  rec: InterventionRecord,
): string[] {
  if (!POSITIVE_DIRECTIONS.has(rec.direction)) return [];
  return rec.recipeSignals.filter((sig) =>
    haystack.includes(sig.toLowerCase()),
  );
}

/**
 * 0–1 therapeutic fit for a dish given the active care profile. 0.5 when no
 * conditions are set or nothing matches; higher as the dish realizes stronger
 * food-first evidence for the user's conditions.
 */
export function scoreTherapeuticFit(
  care: CareProfile,
  dish: TherapeuticDish,
): number {
  if (care.conditions.length === 0) return 0.5;

  const haystack = dishHaystack(dish);

  let matchedWeight = 0;
  for (const condition of care.conditions) {
    for (const rec of scorableInterventions(condition)) {
      if (matchedSignalsFor(haystack, rec).length > 0) {
        matchedWeight += EVIDENCE_WEIGHT[rec.grade];
      }
    }
  }

  if (matchedWeight === 0) return 0.5;
  // Smooth saturation: 0 → 0.5, grows toward 1.0 as evidence stacks.
  return 0.5 + 0.5 * (1 - Math.exp(-matchedWeight));
}

/**
 * The scorable interventions a dish realizes — the data behind the swipe-up
 * health panel. Scoped to `conditions` for the personalized view; across ALL
 * conditions (CONDITION_IDS) for the generic "what this dish brings". Reuses
 * `scorableInterventions` + `matchedSignalsFor`, so it is identical-by-
 * construction to what the scorer counts. Deduped by record id, strongest
 * evidence first. Pure + deterministic.
 */
export function matchInterventionsForDish(
  dish: TherapeuticDish,
  conditions?: ReadonlyArray<ConditionId>,
): MatchedIntervention[] {
  const haystack = dishHaystack(dish);
  const scope =
    conditions && conditions.length > 0 ? conditions : CONDITION_IDS;

  const seen = new Set<string>();
  const out: MatchedIntervention[] = [];
  for (const condition of scope) {
    for (const rec of scorableInterventions(condition)) {
      if (seen.has(rec.id)) continue;
      const matchedSignals = matchedSignalsFor(haystack, rec);
      if (matchedSignals.length === 0) continue;
      seen.add(rec.id);
      out.push({ record: rec, matchedSignals });
    }
  }
  out.sort(
    (a, b) => EVIDENCE_WEIGHT[b.record.grade] - EVIDENCE_WEIGHT[a.record.grade],
  );
  return out;
}
