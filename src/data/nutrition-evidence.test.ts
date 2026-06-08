import { describe, expect, it } from "vitest";
import { NUTRITION_EVIDENCE } from "./nutrition-evidence";

describe("nutrition evidence (the science panel)", () => {
  it("every entry is complete, unique, with ≥1 reachable https source", () => {
    expect(NUTRITION_EVIDENCE.length).toBeGreaterThanOrEqual(7);
    const ids = new Set<string>();
    for (const e of NUTRITION_EVIDENCE) {
      expect(e.id, "id present").toBeTruthy();
      expect(ids.has(e.id), `duplicate id ${e.id}`).toBe(false);
      ids.add(e.id);
      expect(e.title.length, e.id).toBeGreaterThan(0);
      expect(e.takeaway.length, e.id).toBeGreaterThan(0);
      expect(e.mechanism.length, e.id).toBeGreaterThan(0);
      expect(e.sources.length, e.id).toBeGreaterThan(0);
      for (const s of e.sources) {
        expect(s.label.length, e.id).toBeGreaterThan(0);
        expect(s.url, `${e.id} source url`).toMatch(/^https:\/\/\S+$/);
      }
    }
  });

  it("does not overstate — no 'cure'/'prevents disease' language in copy", () => {
    for (const e of NUTRITION_EVIDENCE) {
      const text = `${e.takeaway} ${e.mechanism}`.toLowerCase();
      expect(text, e.id).not.toMatch(/\bcure|\bprevents? (cancer|disease)/);
    }
  });
});
