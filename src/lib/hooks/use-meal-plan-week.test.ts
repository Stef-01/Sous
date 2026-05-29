import { describe, expect, it } from "vitest";
import { parseStoredMealPlanWeek } from "./use-meal-plan-week";

const VALID = JSON.stringify({
  schemaVersion: 1,
  weekKey: "2026-W19",
  scheduled: [
    {
      slot: "tue-lunch",
      recipeSlug: "chicken-rice-bowl",
      source: "leftovers-auto",
      scheduledAt: "2026-05-12T18:00:00.000Z",
    },
  ],
  updatedAt: "2026-05-12T18:00:00.000Z",
});

describe("parseStoredMealPlanWeek", () => {
  it("null / undefined / empty → fresh-default for the requested week", () => {
    expect(parseStoredMealPlanWeek(null, "2026-W19").weekKey).toBe("2026-W19");
    expect(parseStoredMealPlanWeek(undefined, "2026-W19").scheduled).toEqual(
      [],
    );
    expect(parseStoredMealPlanWeek("", "2026-W19").schemaVersion).toBe(1);
  });

  it("malformed JSON → fresh-default", () => {
    expect(parseStoredMealPlanWeek("{broken", "2026-W19").scheduled).toEqual(
      [],
    );
  });

  it("non-object root → fresh-default", () => {
    expect(parseStoredMealPlanWeek("[]", "2026-W19").scheduled).toEqual([]);
    expect(parseStoredMealPlanWeek("42", "2026-W19").scheduled).toEqual([]);
  });

  it("schemaVersion mismatch → fresh-default", () => {
    const bad = JSON.stringify({
      schemaVersion: 99,
      weekKey: "2026-W19",
      scheduled: [],
      updatedAt: "2026-05-12T18:00:00.000Z",
    });
    expect(parseStoredMealPlanWeek(bad, "2026-W19").scheduled).toEqual([]);
  });

  it("week-key mismatch → fresh-default for the requested week", () => {
    // Stored payload is for W18 but we asked for W19 → defensive
    // reset (cross-week stale-payload guard).
    const out = parseStoredMealPlanWeek(VALID, "2026-W18");
    expect(out.weekKey).toBe("2026-W18");
    expect(out.scheduled).toEqual([]);
  });

  it("happy path round-trips a scheduled slot", () => {
    const out = parseStoredMealPlanWeek(VALID, "2026-W19");
    expect(out.scheduled.length).toBe(1);
    expect(out.scheduled[0]?.slot).toBe("tue-lunch");
    expect(out.scheduled[0]?.recipeSlug).toBe("chicken-rice-bowl");
  });

  it("malformed slot inside payload → full payload rejected", () => {
    const bad = JSON.stringify({
      schemaVersion: 1,
      weekKey: "2026-W19",
      scheduled: [
        {
          slot: "tue-snack", // invalid meal
          recipeSlug: "x",
          source: "leftovers-auto",
          scheduledAt: "2026-05-12T18:00:00.000Z",
        },
      ],
      updatedAt: "2026-05-12T18:00:00.000Z",
    });
    expect(parseStoredMealPlanWeek(bad, "2026-W19").scheduled).toEqual([]);
  });
});
