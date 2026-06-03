/**
 * Culinary Therapeutics — clinician-review export (founder gate G1).
 *
 * Emits the full evidence registry as a reviewer-facing package: every record
 * with its condition, intervention class, GRADE, effect size, dose, honest
 * application note, and provenance, plus an automated claim-safety check. A
 * registered dietitian / clinician reviews this; sign-off then flips each
 * record's `reviewStatus` -> "clinician-approved" and `isEducational` -> false,
 * which activates personalization. Nothing here flips it autonomously.
 *
 * Run: `pnpm therapeutics:review`
 */

import {
  CONDITIONS,
  CONDITION_IDS,
  interventionsForCondition,
  INTERACTIONS,
  REGISTRY_VERSION,
  REGISTRY_STATS,
} from "../src/data/therapeutics/index";
import { assertNoMedicalClaim } from "../src/lib/therapeutics/claim-contract";

function effectLine(e?: {
  metric: string;
  value: number;
  unit: string;
  ciLow?: number;
  ciHigh?: number;
  note?: string;
}): string {
  if (!e) return "—";
  const ci =
    e.ciLow !== undefined && e.ciHigh !== undefined
      ? ` (95% CI ${e.ciLow} to ${e.ciHigh})`
      : "";
  const note = e.note ? ` [${e.note}]` : "";
  return `${e.metric} ${e.value} ${e.unit}`.trim() + ci + note;
}

function main() {
  console.log(`# Culinary Therapeutics — clinician review package`);
  console.log(
    `Registry ${REGISTRY_VERSION.version} · updated ${REGISTRY_VERSION.updatedAt}`,
  );
  console.log(
    `${REGISTRY_STATS.conditions} conditions · ${REGISTRY_STATS.interventions} interventions · ${REGISTRY_STATS.interactions} interaction rules\n`,
  );
  console.log(
    `INSTRUCTIONS: review each record. Sign-off flips reviewStatus -> "clinician-approved" and isEducational -> false. Until then the feature is education-only.\n`,
  );

  let claimSafe = 0;
  let total = 0;

  for (const id of CONDITION_IDS) {
    const info = CONDITIONS[id];
    console.log(`\n## ${info.displayName} (${id})`);
    console.log(`First-line: ${info.firstLineStrategy}`);
    console.log(`Avoid overstating: ${info.avoidOverstating}\n`);

    for (const r of interventionsForCondition(id)) {
      total++;
      const claim = assertNoMedicalClaim(`${r.label} ${r.applicationNote}`);
      if (claim.ok) claimSafe++;
      const sources = r.sources
        .map((s) => `${s.title} (${s.studyType})`)
        .join("; ");
      console.log(`- [ ] ${r.label}`);
      console.log(
        `      class: ${r.interventionClass} · GRADE: ${r.grade} · direction: ${r.direction}`,
      );
      console.log(`      effect: ${effectLine(r.effect)}`);
      if (r.doseSignal) console.log(`      dose: ${r.doseSignal}`);
      console.log(`      note: ${r.applicationNote}`);
      console.log(`      sources: ${sources}`);
      console.log(
        `      claim-safe: ${claim.ok ? "PASS" : "FAIL → " + claim.violations.map((v) => v.term).join(", ")}`,
      );
      console.log(`      status: ${r.reviewStatus}\n`);
    }
  }

  console.log(`\n## Interaction rules (${INTERACTIONS.length})`);
  for (const rule of INTERACTIONS) {
    console.log(
      `- [ ] ${rule.id} (target ${rule.target}, GRADE ${rule.grade})`,
    );
    console.log(`      ${rule.rule}`);
  }

  console.log(
    `\n## Summary\nClaim-safe: ${claimSafe}/${total} records. All records currently unreviewed/educational.\n`,
  );
}

main();
