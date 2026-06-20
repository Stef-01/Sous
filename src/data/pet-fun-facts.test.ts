import { describe, it, expect } from "vitest";
import mealsData from "@/data/meals.json";
import sidesData from "@/data/sides.json";
import { ALL_FUN_FACTS, NUTRITION_FACTS, HISTORY_FACTS } from "./pet-fun-facts";

const CATALOG = new Set([
  ...(mealsData as { id: string }[]).map((m) => m.id),
  ...(sidesData as { id: string }[]).map((s) => s.id),
]);

describe("pet fun facts", () => {
  it("has a healthy two-pool dataset", () => {
    expect(NUTRITION_FACTS.length).toBeGreaterThanOrEqual(7);
    expect(HISTORY_FACTS.length).toBeGreaterThanOrEqual(7);
  });

  it("every fact id is unique", () => {
    const ids = ALL_FUN_FACTS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every fact is short plain text (<=160 chars, no HTML)", () => {
    for (const f of ALL_FUN_FACTS) {
      expect(
        f.text.length,
        `${f.id} too long (${f.text.length})`,
      ).toBeLessThanOrEqual(160);
      expect(/[<>]/.test(f.text), `${f.id} has angle brackets`).toBe(false);
    }
  });

  it("every fact is sourced with a real https url", () => {
    for (const f of ALL_FUN_FACTS) {
      expect(f.sources.length, `${f.id} has no source`).toBeGreaterThanOrEqual(
        1,
      );
      for (const s of f.sources) {
        expect(s.label.length).toBeGreaterThan(0);
        expect(() => new URL(s.url)).not.toThrow();
        expect(s.url.startsWith("https://"), `${f.id} url not https`).toBe(
          true,
        );
      }
    }
  });

  it("every dishSlugs id exists in the catalog (rule 7)", () => {
    for (const f of ALL_FUN_FACTS) {
      for (const slug of f.dishSlugs ?? []) {
        expect(
          CATALOG.has(slug),
          `${f.id} references unknown dish "${slug}"`,
        ).toBe(true);
      }
    }
  });

  it("kinds are tagged correctly per pool", () => {
    expect(NUTRITION_FACTS.every((f) => f.kind === "nutrition")).toBe(true);
    expect(HISTORY_FACTS.every((f) => f.kind === "history")).toBe(true);
  });
});
