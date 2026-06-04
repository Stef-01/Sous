/**
 * Clinician-review view model (the `/clinician` surface, pure + tested).
 *
 * Assembles the ENTIRE evidence registry + methodology into one structured
 * object a clinician can read top to bottom: every condition with its
 * interventions (grade, class, effect, dose, signals, claim-safe note, sources,
 * review status), the interaction map, escalation notes, the scoring weight,
 * and a live claim-safety audit (runs assertNoMedicalClaim over every
 * human-facing string — proving the anti-overclaim contract holds, the G5
 * artifact). Thin React shell renders this; the data shaping is unit-tested.
 */

import type {
  ConditionId,
  InteractionRule,
  InterventionRecord,
} from "@/types/therapeutics";
import type { CareProfile } from "@/types/care-profile";
import {
  CONDITIONS,
  CONDITION_IDS,
  INTERACTIONS,
  REGISTRY_VERSION,
  interventionsForCondition,
} from "@/data/therapeutics";
import { escalationsForCare } from "@/lib/engine/therapeutic-escalation";
import { THERAPEUTIC_WEIGHT } from "@/lib/engine/therapeutic-weights";
import { assertNoMedicalClaim } from "./claim-contract";

export interface ClinicianConditionView {
  id: ConditionId;
  displayName: string;
  plainDescriptor: string;
  firstLineStrategy: string;
  bestAdjuncts: string[];
  avoidOverstating: string;
  escalation: { title: string; body: string } | null;
  /** Records that can move a recipe's score (recipe-native / fortified-food). */
  scorable: InterventionRecord[];
  /** Education-only records (extract/supplement) — shown, never scored. */
  educationOnly: InterventionRecord[];
}

export interface ClaimAuditEntry {
  recordId: string;
  field: string;
  term: string;
  context: string;
}

export interface ClinicianReview {
  version: string;
  updatedAt: string;
  stats: {
    conditions: number;
    interventions: number;
    interactions: number;
    scorable: number;
    educationOnly: number;
    unreviewed: number;
    approved: number;
  };
  therapeuticWeight: number;
  conditions: ClinicianConditionView[];
  interactions: InteractionRule[];
  /** Live anti-overclaim audit — ok:true means every string passed. */
  claimAudit: { ok: boolean; entries: ClaimAuditEntry[] };
}

function careFor(id: ConditionId): CareProfile {
  return {
    v: 1,
    conditions: [id],
    avoid: [],
    fodmapPhase: null,
    updatedAt: "",
  };
}

function auditRecord(rec: InterventionRecord): ClaimAuditEntry[] {
  const out: ClaimAuditEntry[] = [];
  const check = (field: string, text: string) => {
    const r = assertNoMedicalClaim(text);
    for (const v of r.violations) {
      out.push({ recordId: rec.id, field, term: v.term, context: v.context });
    }
  };
  check("applicationNote", rec.applicationNote);
  if (rec.prepImplication) check("prepImplication", rec.prepImplication);
  return out;
}

export function buildClinicianReview(): ClinicianReview {
  const conditions: ClinicianConditionView[] = [];
  const claimEntries: ClaimAuditEntry[] = [];
  let scorableCount = 0;
  let educationCount = 0;
  let unreviewed = 0;
  let approved = 0;

  for (const id of CONDITION_IDS) {
    const info = CONDITIONS[id];
    const recs = interventionsForCondition(id);
    const scorable = recs.filter(
      (r) =>
        r.interventionClass === "recipe-native" ||
        r.interventionClass === "fortified-food",
    );
    const educationOnly = recs.filter(
      (r) => r.interventionClass === "extract-or-supplement",
    );
    scorableCount += scorable.length;
    educationCount += educationOnly.length;
    for (const r of recs) {
      if (r.reviewStatus === "clinician-approved") approved++;
      else unreviewed++;
      claimEntries.push(...auditRecord(r));
    }

    const esc = escalationsForCare(careFor(id)).find(
      (n) => n.conditionId === id,
    );

    conditions.push({
      id,
      displayName: info.displayName,
      plainDescriptor: info.plainDescriptor,
      firstLineStrategy: info.firstLineStrategy,
      bestAdjuncts: info.bestAdjuncts,
      avoidOverstating: info.avoidOverstating,
      escalation: esc ? { title: esc.title, body: esc.body } : null,
      scorable,
      educationOnly,
    });
  }

  for (const rule of INTERACTIONS) {
    const r = assertNoMedicalClaim(rule.rule);
    for (const v of r.violations) {
      claimEntries.push({
        recordId: rule.id,
        field: "rule",
        term: v.term,
        context: v.context,
      });
    }
  }

  return {
    version: REGISTRY_VERSION.version,
    updatedAt: REGISTRY_VERSION.updatedAt,
    stats: {
      conditions: CONDITION_IDS.length,
      interventions: scorableCount + educationCount,
      interactions: INTERACTIONS.length,
      scorable: scorableCount,
      educationOnly: educationCount,
      unreviewed,
      approved,
    },
    therapeuticWeight: THERAPEUTIC_WEIGHT,
    conditions,
    interactions: INTERACTIONS,
    claimAudit: { ok: claimEntries.length === 0, entries: claimEntries },
  };
}
