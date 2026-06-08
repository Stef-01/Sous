import { describe, expect, it } from "vitest";
import {
  AYURVEDIC_HERBS,
  herbInteractions,
  herbConditionTieIn,
} from "./ayurvedic-evidence";

const byId = (id: string) => AYURVEDIC_HERBS.find((h) => h.id === id)!;

describe("herb interaction matrix (W20)", () => {
  it("derives caution tags straight from each herb's safety prose", () => {
    expect(herbInteractions(byId("garlic"))).toContain("blood-thinners");
    const fen = herbInteractions(byId("fenugreek"));
    expect(fen).toContain("glucose-meds");
    expect(fen).toContain("pregnancy");
    expect(herbInteractions(byId("ashwagandha"))).toContain("liver");
    expect(herbInteractions(byId("cinnamon"))).toContain("liver");
  });

  it("returns no tags for a herb whose safety note flags nothing medical", () => {
    expect(herbInteractions(byId("cumin"))).toEqual([]);
  });
});

describe("condition tie-ins (W24)", () => {
  it("ties a herb to a condition ONLY where the trial evidence supports it", () => {
    expect(herbConditionTieIn("garlic")?.condition).toMatch(/blood pressure/i);
    expect(herbConditionTieIn("saffron")?.condition).toMatch(/mood/i);
    expect(herbConditionTieIn("fenugreek")?.condition).toMatch(/blood sugar/i);
  });

  it("has no tie-in for bioavailability-only herbs", () => {
    // black pepper helps absorption — it isn't a condition claim
    expect(herbConditionTieIn("black-pepper")).toBeNull();
    expect(herbConditionTieIn("cumin")).toBeNull();
  });
});
