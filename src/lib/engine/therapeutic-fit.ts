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
  /**
   * Canonical food classes the dish's resolved ingredients realize (the
   * ingredient-registry bridge). When present, matching reasons over food
   * identity — "Masoor Dal" → red-lentils → legume — not spelling.
   */
  resolvedClasses?: ReadonlyArray<string>;
  /** Canonical food groups the dish's resolved ingredients belong to. */
  resolvedGroups?: ReadonlyArray<string>;
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
 * Maps an intervention's free-text recipeSignal → the structured food
 * classes/groups that realize it. This is the bridge that lets the engine match
 * on what a dish IS (its resolved ingredients' identity) rather than how a
 * string is spelled. Claim-neutral — it only translates food identity.
 */
const SIGNAL_STRUCTURE: Record<
  string,
  { classes?: string[]; groups?: string[] }
> = {
  // Oat/barley beta-glucan is INGREDIENT-specific evidence — map to the
  // specific class, NOT generic soluble fiber, so a lentil dish (soluble fiber,
  // but not beta-glucan) doesn't falsely match the beta-glucan intervention.
  oats: { classes: ["beta-glucan"] },
  oatmeal: { classes: ["beta-glucan"] },
  barley: { classes: ["beta-glucan"] },
  "whole grains": { classes: ["whole-grain"] },
  "whole grain": { classes: ["whole-grain"] },
  "soluble fiber": { classes: ["soluble-fiber"] },
  legumes: { groups: ["legume"] },
  legume: { groups: ["legume"] },
  beans: { groups: ["legume"] },
  lentils: { groups: ["legume"] },
  salmon: { classes: ["oily-fish"] },
  mackerel: { classes: ["oily-fish"] },
  sardine: { classes: ["oily-fish"] },
  trout: { classes: ["oily-fish"] },
  "fatty fish": { classes: ["oily-fish"] },
  "oily fish": { classes: ["oily-fish"] },
  fish: { groups: ["seafood"] },
  "olive oil": { classes: ["olive-oil"] },
  nuts: { classes: ["nuts"] },
  coffee: { classes: ["coffee"] },
  // NB: "vegetables" is deliberately NOT bridged structurally — a single
  // aromatic (garlic/onion) would otherwise trigger broad "pattern" evidence
  // on nearly every dish. It still matches by substring on dish text/tags.
};

function structuralMatch(sig: string, dish: TherapeuticDish): boolean {
  const map = SIGNAL_STRUCTURE[sig.toLowerCase()];
  if (!map) return false;
  const { resolvedClasses, resolvedGroups } = dish;
  if (
    map.classes &&
    resolvedClasses &&
    map.classes.some((c) => resolvedClasses.includes(c))
  ) {
    return true;
  }
  if (
    map.groups &&
    resolvedGroups &&
    map.groups.some((g) => resolvedGroups.includes(g))
  ) {
    return true;
  }
  return false;
}

/**
 * THE shared matching predicate — the scorer (below) and the per-dish health
 * panel (matchInterventionsForDish) both go through here, so they can never
 * disagree about whether a dish realizes an intervention. A signal matches by
 * food identity (resolved ingredient classes/groups) OR by substring on the
 * dish text. Returns the matching signals (empty = no match, incl. non-positive
 * directions which never count — the claim-safety spine is unchanged).
 */
function matchedSignalsFor(
  dish: TherapeuticDish,
  rec: InterventionRecord,
): string[] {
  if (!POSITIVE_DIRECTIONS.has(rec.direction)) return [];
  const haystack = dishHaystack(dish);
  return rec.recipeSignals.filter(
    (sig) => haystack.includes(sig.toLowerCase()) || structuralMatch(sig, dish),
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

  let matchedWeight = 0;
  for (const condition of care.conditions) {
    for (const rec of scorableInterventions(condition)) {
      if (matchedSignalsFor(dish, rec).length > 0) {
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
  const scope =
    conditions && conditions.length > 0 ? conditions : CONDITION_IDS;

  const seen = new Set<string>();
  const out: MatchedIntervention[] = [];
  for (const condition of scope) {
    for (const rec of scorableInterventions(condition)) {
      if (seen.has(rec.id)) continue;
      const matchedSignals = matchedSignalsFor(dish, rec);
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
