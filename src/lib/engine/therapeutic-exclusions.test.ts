import { describe, expect, it } from "vitest";
import {
  requiredFlagsForCare,
  filterByCareExclusions,
  celiacNeedsCertifiedWarning,
} from "./therapeutic-exclusions";
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

describe("therapeutic exclusions", () => {
  it("imposes no requirements for an empty profile", () => {
    expect(requiredFlagsForCare(care({}))).toEqual([]);
  });

  it("celiac requires gluten-free", () => {
    expect(requiredFlagsForCare(care({ conditions: ["celiac"] }))).toContain(
      "gluten-free",
    );
    expect(celiacNeedsCertifiedWarning(care({ conditions: ["celiac"] }))).toBe(
      true,
    );
  });

  it("avoid flags become hard requirements (de-duplicated, sorted)", () => {
    const req = requiredFlagsForCare(
      care({ conditions: ["celiac"], avoid: ["nut-allergy", "gluten-free"] }),
    );
    expect(req).toEqual(["gluten-free", "nut-allergy"]);
  });

  it("does not filter when there are no requirements", () => {
    const candidates = [{ dietaryFlags: [] }, { dietaryFlags: ["vegan"] }];
    expect(filterByCareExclusions(candidates, care({}))).toHaveLength(2);
  });

  it("keeps only candidates satisfying every required flag", () => {
    const candidates = [
      { id: "a", dietaryFlags: ["gluten-free", "nut-allergy"] },
      { id: "b", dietaryFlags: ["gluten-free"] },
      { id: "c", dietaryFlags: [] },
      { id: "d" }, // missing flags → excluded
    ];
    const kept = filterByCareExclusions(
      candidates,
      care({ conditions: ["celiac"], avoid: ["nut-allergy"] }),
    );
    expect(kept.map((c) => c.id)).toEqual(["a"]);
  });
});
