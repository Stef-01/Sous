import { describe, expect, it } from "vitest";
import {
  CUISINE_FLUENCY_TARGET,
  buildCuisineCardRows,
  countCooksByCuisine,
  glyphForCuisine,
} from "./cuisine-stats";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

function fixtureSession(
  over: Partial<CookSessionRecord> = {},
): CookSessionRecord {
  return {
    sessionId: "x",
    recipeSlug: "x",
    dishName: "x",
    cuisineFamily: "italian",
    startedAt: "2026-01-01T00:00:00Z",
    completedAt: "2026-01-01T01:00:00Z",
    favorite: false,
    ...over,
  };
}

describe("countCooksByCuisine", () => {
  it("empty history → empty map", () => {
    expect(countCooksByCuisine([]).size).toBe(0);
  });

  it("counts completed cooks per cuisine", () => {
    const out = countCooksByCuisine([
      fixtureSession({ cuisineFamily: "italian" }),
      fixtureSession({ cuisineFamily: "italian" }),
      fixtureSession({ cuisineFamily: "indian" }),
    ]);
    expect(out.get("italian")).toBe(2);
    expect(out.get("indian")).toBe(1);
  });

  it("ignores sessions without completedAt", () => {
    expect(
      countCooksByCuisine([fixtureSession({ completedAt: undefined })]).size,
    ).toBe(0);
  });

  it("case-insensitive cuisine grouping", () => {
    const out = countCooksByCuisine([
      fixtureSession({ cuisineFamily: "Italian" }),
      fixtureSession({ cuisineFamily: "italian" }),
    ]);
    expect(out.get("italian")).toBe(2);
  });

  it("CUISINE_FLUENCY_TARGET is 5", () => {
    expect(CUISINE_FLUENCY_TARGET).toBe(5);
  });
});

describe("glyphForCuisine", () => {
  it("returns a known glyph for italian", () => {
    expect(glyphForCuisine("italian").length).toBeGreaterThan(0);
    expect(glyphForCuisine("italian")).not.toBe("🍴");
  });

  it("falls back to utensil emoji for unknown cuisine", () => {
    expect(glyphForCuisine("klingon-cuisine")).toBe("🍴");
  });

  it("case-insensitive lookup", () => {
    expect(glyphForCuisine("ITALIAN")).toBe(glyphForCuisine("italian"));
  });
});

describe("buildCuisineCardRows", () => {
  it("merges catalog cuisines + cook-history cuisines (union)", () => {
    const rows = buildCuisineCardRows({
      catalogCuisines: ["italian", "japanese"],
      cookCounts: new Map([
        ["italian", 3],
        ["thai", 1],
      ]),
    });
    const cuisines = rows.map((r) => r.cuisine);
    expect(cuisines).toContain("italian");
    expect(cuisines).toContain("japanese");
    expect(cuisines).toContain("thai");
  });

  it("sorts by count descending then alphabetically", () => {
    const rows = buildCuisineCardRows({
      catalogCuisines: ["italian", "indian", "thai"],
      cookCounts: new Map([
        ["italian", 4],
        ["indian", 4],
        ["thai", 1],
      ]),
    });
    expect(rows[0]?.cuisine).toBe("indian"); // tie at 4 → alpha
    expect(rows[1]?.cuisine).toBe("italian");
    expect(rows[2]?.cuisine).toBe("thai");
  });

  it("zero-count cuisines included with target=5", () => {
    const rows = buildCuisineCardRows({
      catalogCuisines: ["greek"],
      cookCounts: new Map(),
    });
    expect(rows[0]?.count).toBe(0);
    expect(rows[0]?.target).toBe(CUISINE_FLUENCY_TARGET);
  });

  it("custom target threads through", () => {
    const rows = buildCuisineCardRows({
      catalogCuisines: ["italian"],
      cookCounts: new Map([["italian", 2]]),
      target: 3,
    });
    expect(rows[0]?.target).toBe(3);
  });

  it("each row has a glyph", () => {
    const rows = buildCuisineCardRows({
      catalogCuisines: ["italian"],
      cookCounts: new Map(),
    });
    expect(rows[0]?.glyph.length).toBeGreaterThan(0);
  });
});
