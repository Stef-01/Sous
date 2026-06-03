import { describe, expect, it } from "vitest";
import {
  escalationsForCare,
  GENERAL_ESCALATION,
  LEAKY_GUT_EDUCATION,
} from "./therapeutic-escalation";
import { assertNoMedicalClaim } from "@/lib/therapeutics/claim-contract";
import type { CareProfile } from "@/types/care-profile";

function care(partial: Partial<CareProfile>): CareProfile {
  return {
    v: 1,
    conditions: [],
    avoid: [],
    fodmapPhase: null,
    updatedAt: "",
    ...partial,
  };
}

describe("therapeutic escalation", () => {
  it("returns nothing for an empty profile", () => {
    expect(escalationsForCare(care({}))).toEqual([]);
  });

  it("adds the general food-first note whenever a focus is active", () => {
    const notes = escalationsForCare(care({ avoid: ["nut-allergy"] }));
    expect(notes).toContainEqual(GENERAL_ESCALATION);
  });

  it("surfaces a per-condition note for celiac + the general note", () => {
    const notes = escalationsForCare(care({ conditions: ["celiac"] }));
    const ids = notes.map((n) => n.conditionId);
    expect(ids).toContain("celiac");
    expect(ids).toContain("general");
  });

  it("all escalation copy is claim-safe", () => {
    const all = [
      GENERAL_ESCALATION,
      LEAKY_GUT_EDUCATION,
      ...escalationsForCare(
        care({
          conditions: [
            "celiac",
            "masld",
            "iron-deficiency",
            "vitamin-d-insufficiency",
            "calcium-insufficiency",
            "magnesium-insufficiency",
            "ulcerative-colitis",
            "crohns",
          ],
        }),
      ),
    ];
    for (const note of all) {
      for (const text of [note.title, note.body]) {
        expect(assertNoMedicalClaim(text).ok, text).toBe(true);
      }
    }
  });

  it("models leaky gut as education, not a condition", () => {
    expect(LEAKY_GUT_EDUCATION.body.toLowerCase()).toContain("not a formal");
  });
});
