import { describe, expect, it } from "vitest";
import {
  LOW_FRESHNESS_WINDOW_DAYS,
  colorizeIngredients,
  summariseColorizedIngredients,
  type PantryItemSnapshot,
} from "./ingredient-pantry-status";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-05-15T12:00:00");

// ── colorizeIngredients — string[] (backwards-compat) ────

describe("colorizeIngredients — string[] pantry", () => {
  it("matched ingredient → have", () => {
    const out = colorizeIngredients(
      [{ line: "2 cups fresh basil leaves" }],
      ["basil"],
    );
    expect(out[0]?.status).toBe("have");
  });

  it("unmatched ingredient → missing", () => {
    const out = colorizeIngredients([{ line: "saffron threads" }], ["basil"]);
    expect(out[0]?.status).toBe("missing");
  });

  it("never returns 'low' from string[] pantry (no signal data)", () => {
    const out = colorizeIngredients(
      [{ line: "lemon" }, { line: "saffron" }],
      ["lemon"],
    );
    for (const e of out) expect(e.status).not.toBe("low");
  });

  it("preserves the original line text", () => {
    const out = colorizeIngredients(
      [{ line: "2 cups fresh basil leaves" }],
      ["basil"],
    );
    expect(out[0]?.line).toBe("2 cups fresh basil leaves");
  });

  it("normalised name extracted via the W15 helper", () => {
    const out = colorizeIngredients(
      [{ line: "2 cups fresh basil leaves" }],
      [],
    );
    // qualifier-stripping: 'fresh' + 'leaves' drop, 'basil' survives
    expect(out[0]?.normalised).toContain("basil");
    expect(out[0]?.normalised).not.toContain("fresh");
  });

  it("empty pantry → all missing", () => {
    const out = colorizeIngredients(
      [{ line: "basil" }, { line: "lemon" }, { line: "garlic" }],
      [],
    );
    expect(out.every((e) => e.status === "missing")).toBe(true);
  });

  it("empty ingredients → empty output", () => {
    expect(colorizeIngredients([], ["basil"])).toEqual([]);
  });

  it("optional flag threads through", () => {
    const out = colorizeIngredients(
      [{ line: "salt", optional: true }],
      ["salt"],
    );
    expect(out[0]?.optional).toBe(true);
  });

  it("optional defaults to false", () => {
    const out = colorizeIngredients([{ line: "salt" }], ["salt"]);
    expect(out[0]?.optional).toBe(false);
  });
});

// ── colorizeIngredients — enriched pantry (low path) ─────

describe("colorizeIngredients — enriched pantry / freshness", () => {
  function snapshot(
    over: Partial<PantryItemSnapshot> & { canonicalName: string },
  ): PantryItemSnapshot {
    return { ...over };
  }

  it("matched + fresh → have", () => {
    const out = colorizeIngredients(
      [{ line: "basil" }],
      [
        snapshot({
          canonicalName: "basil",
          expirationEstimate: new Date(
            NOW.getTime() + 30 * DAY_MS,
          ).toISOString(),
        }),
      ],
      { now: NOW },
    );
    expect(out[0]?.status).toBe("have");
  });

  it("matched + expiring within window → low", () => {
    const out = colorizeIngredients(
      [{ line: "basil" }],
      [
        snapshot({
          canonicalName: "basil",
          expirationEstimate: new Date(
            NOW.getTime() + 1 * DAY_MS,
          ).toISOString(),
        }),
      ],
      { now: NOW },
    );
    expect(out[0]?.status).toBe("low");
    expect(out[0]?.daysToExpiration).toBe(1);
  });

  it("expiration window edge → low (inclusive)", () => {
    const out = colorizeIngredients(
      [{ line: "basil" }],
      [
        snapshot({
          canonicalName: "basil",
          expirationEstimate: new Date(
            NOW.getTime() + LOW_FRESHNESS_WINDOW_DAYS * DAY_MS,
          ).toISOString(),
        }),
      ],
      { now: NOW },
    );
    expect(out[0]?.status).toBe("low");
  });

  it("expiration past window → have", () => {
    const out = colorizeIngredients(
      [{ line: "basil" }],
      [
        snapshot({
          canonicalName: "basil",
          expirationEstimate: new Date(
            NOW.getTime() + (LOW_FRESHNESS_WINDOW_DAYS + 1) * DAY_MS,
          ).toISOString(),
        }),
      ],
      { now: NOW },
    );
    expect(out[0]?.status).toBe("have");
  });

  it("quantityEstimate=low → low (overrides freshness)", () => {
    const out = colorizeIngredients(
      [{ line: "basil" }],
      [
        snapshot({
          canonicalName: "basil",
          quantityEstimate: "low",
          // even with fresh expiration, quantity wins
          expirationEstimate: new Date(
            NOW.getTime() + 30 * DAY_MS,
          ).toISOString(),
        }),
      ],
      { now: NOW },
    );
    expect(out[0]?.status).toBe("low");
  });

  it("custom lowFreshnessWindowDays threads through", () => {
    const out = colorizeIngredients(
      [{ line: "basil" }],
      [
        snapshot({
          canonicalName: "basil",
          expirationEstimate: new Date(
            NOW.getTime() + 6 * DAY_MS,
          ).toISOString(),
        }),
      ],
      { now: NOW, lowFreshnessWindowDays: 7 },
    );
    expect(out[0]?.status).toBe("low");
  });

  it("invalid expirationEstimate → defensive 'have'", () => {
    const out = colorizeIngredients(
      [{ line: "basil" }],
      [snapshot({ canonicalName: "basil", expirationEstimate: "not-a-date" })],
      { now: NOW },
    );
    expect(out[0]?.status).toBe("have");
  });

  it("LOW_FRESHNESS_WINDOW_DAYS is 3", () => {
    expect(LOW_FRESHNESS_WINDOW_DAYS).toBe(3);
  });
});

// ── summariseColorizedIngredients ────────────────────────

describe("summariseColorizedIngredients", () => {
  it("counts have / low / missing", () => {
    const out = summariseColorizedIngredients([
      { line: "a", normalised: "a", status: "have", optional: false },
      { line: "b", normalised: "b", status: "low", optional: false },
      { line: "c", normalised: "c", status: "missing", optional: false },
    ]);
    expect(out).toMatchObject({
      haveCount: 1,
      lowCount: 1,
      missingCount: 1,
      totalCount: 3,
    });
  });

  it("requiredCoverage excludes optional ingredients", () => {
    const out = summariseColorizedIngredients([
      { line: "a", normalised: "a", status: "have", optional: false },
      { line: "b", normalised: "b", status: "missing", optional: false },
      { line: "c", normalised: "c", status: "missing", optional: true },
    ]);
    // 1 of 2 required covered
    expect(out.requiredCoverage).toBeCloseTo(0.5, 5);
  });

  it("'low' counts as covered (you can still cook with it)", () => {
    const out = summariseColorizedIngredients([
      { line: "a", normalised: "a", status: "low", optional: false },
      { line: "b", normalised: "b", status: "have", optional: false },
    ]);
    expect(out.requiredCoverage).toBe(1);
  });

  it("empty input → all zero, coverage 0 (no NaN)", () => {
    expect(summariseColorizedIngredients([])).toEqual({
      haveCount: 0,
      lowCount: 0,
      missingCount: 0,
      totalCount: 0,
      requiredCoverage: 0,
    });
  });

  it("all-optional list → coverage 0 (avoids NaN division)", () => {
    const out = summariseColorizedIngredients([
      { line: "a", normalised: "a", status: "have", optional: true },
    ]);
    expect(out.requiredCoverage).toBe(0);
  });
});
