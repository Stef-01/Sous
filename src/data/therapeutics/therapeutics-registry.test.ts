import { describe, expect, it } from "vitest";
import { assertNoMedicalClaim } from "@/lib/therapeutics/claim-contract";
import type { Grade, InterventionClass } from "@/types/therapeutics";
import {
  CONDITIONS,
  CONDITION_IDS,
  INTERVENTIONS,
  INTERACTIONS,
  REGISTRY_STATS,
  interventionsForCondition,
  scorableInterventions,
  educationOnlyInterventions,
  registryIsClinicianApproved,
} from "./index";

const VALID_CLASSES: InterventionClass[] = [
  "recipe-native",
  "fortified-food",
  "extract-or-supplement",
];
const VALID_GRADES: Grade[] = ["high", "moderate", "low", "very-low"];

/** Collect every human-facing string in the registry. */
function* allCopy(): Generator<{ where: string; text: string }> {
  for (const c of Object.values(CONDITIONS)) {
    yield {
      where: `condition ${c.id}.plainDescriptor`,
      text: c.plainDescriptor,
    };
    yield {
      where: `condition ${c.id}.firstLineStrategy`,
      text: c.firstLineStrategy,
    };
    yield {
      where: `condition ${c.id}.avoidOverstating`,
      text: c.avoidOverstating,
    };
  }
  for (const r of INTERVENTIONS) {
    yield { where: `intervention ${r.id}.label`, text: r.label };
    yield {
      where: `intervention ${r.id}.applicationNote`,
      text: r.applicationNote,
    };
    if (r.prepImplication)
      yield {
        where: `intervention ${r.id}.prepImplication`,
        text: r.prepImplication,
      };
  }
  for (const rule of INTERACTIONS) {
    yield { where: `interaction ${rule.id}.rule`, text: rule.rule };
  }
}

describe("culinary therapeutics registry", () => {
  it("contains no medical-claim language anywhere (gate G5)", () => {
    const failures: string[] = [];
    for (const { where, text } of allCopy()) {
      const res = assertNoMedicalClaim(text);
      if (!res.ok) {
        failures.push(
          `${where}: ${res.violations.map((v) => v.term).join(", ")}`,
        );
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("ships unreviewed + educational (gate G1 — nothing flips autonomously)", () => {
    for (const r of INTERVENTIONS) {
      expect(r.reviewStatus, r.id).toBe("unreviewed");
      expect(r.isEducational, r.id).toBe(true);
    }
    expect(registryIsClinicianApproved()).toBe(false);
  });

  it("every intervention is well-formed", () => {
    for (const r of INTERVENTIONS) {
      expect(VALID_CLASSES, r.id).toContain(r.interventionClass);
      expect(VALID_GRADES, r.id).toContain(r.grade);
      expect(CONDITION_IDS, r.id).toContain(r.conditionId);
      expect(r.applicationNote.length, r.id).toBeGreaterThan(0);
      expect(r.sources.length, `${r.id} needs provenance`).toBeGreaterThan(0);
      expect(Array.isArray(r.recipeSignals), r.id).toBe(true);
    }
  });

  it("only recipe-native + fortified records are scorable; extracts are education-only", () => {
    for (const id of CONDITION_IDS) {
      for (const r of scorableInterventions(id)) {
        expect(r.interventionClass, `${r.id} must not be scorable`).not.toBe(
          "extract-or-supplement",
        );
      }
      for (const r of educationOnlyInterventions(id)) {
        expect(r.interventionClass, r.id).toBe("extract-or-supplement");
      }
    }
  });

  it("every modeled condition has at least one intervention", () => {
    for (const id of CONDITION_IDS) {
      expect(
        interventionsForCondition(id).length,
        `${id} has no evidence`,
      ).toBeGreaterThan(0);
    }
  });

  it("does NOT model 'leaky gut' as a condition", () => {
    expect(CONDITION_IDS).not.toContain("leaky-gut" as never);
  });

  it("stats are consistent", () => {
    expect(REGISTRY_STATS.conditions).toBe(CONDITION_IDS.length);
    expect(REGISTRY_STATS.interventions).toBe(INTERVENTIONS.length);
    expect(REGISTRY_STATS.interactions).toBe(INTERACTIONS.length);
  });
});
