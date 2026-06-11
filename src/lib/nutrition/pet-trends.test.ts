import { describe, expect, it } from "vitest";
import { statTrends, trendOf, type TrendDirection } from "./pet-trends";
import { dayKey, type DiaryEntry } from "@/lib/hooks/use-nutrition-diary";
import { NUTRIENT_DISPLAY } from "@/data/nutrition/nutrient-display";
import { getDishNutrition } from "@/lib/engine/dish-nutrition";
import type { PerServingNutrition } from "@/types/nutrition";

// ── helpers (same fixture grammar as diary-today-home.test.ts) ──────────────
const now = new Date("2026-06-10T12:00:00");
const TARGETS = { kcal: 2000, protein_g: 100 };

const dayBack = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return dayKey(d);
};

/** Registry-resolved entry — guacamole is the fully-massed fixture dish the
 *  other diary tests lean on, so values trace to the live engine. */
const cooked = (slug: string, servings = 1): DiaryEntry => ({
  slug,
  name: slug,
  servings,
  at: "2026-06-10T12:00:00.000Z",
});

/** Entry with embedded nutrition so a test controls exact coverage numbers
 *  (the branded() pattern from diary-today-home.test.ts, widened to micros). */
const eaten = (nutrition: Partial<PerServingNutrition>): DiaryEntry => ({
  slug: "off:1",
  name: "Fixture",
  servings: 1,
  at: "2026-06-10T12:00:00.000Z",
  nutrition: nutrition as PerServingNutrition,
});

// Vitamin rows straight from the shared DV table (same derivation the module
// under test uses via vitaminCoverage) — an aggregate with every vitamin at
// `frac` × its DV averages to exactly `frac` coverage.
const VITAMINS = NUTRIENT_DISPLAY.filter(
  (m) => m.group === "Vitamins" && m.dv !== null,
);
const vitaminsAt = (frac: number): Partial<PerServingNutrition> => {
  const out: Record<string, number> = {};
  for (const m of VITAMINS) out[m.key] = m.dv! * frac;
  return out as Partial<PerServingNutrition>;
};

const FIBER_DV = NUTRIENT_DISPLAY.find((m) => m.key === "fiber_g")!.dv!;

/** A full day at uniform coverage `frac` across all four stats. */
const dayAt = (frac: number): DiaryEntry[] => [
  eaten({
    calories: TARGETS.kcal * frac,
    protein_g: TARGETS.protein_g * frac,
    fiber_g: FIBER_DV * frac,
    ...vitaminsAt(frac),
  }),
];

// ── trendOf ──────────────────────────────────────────────────────────────────

describe("trendOf", () => {
  it("up / down / flat with the default epsilon", () => {
    expect(trendOf(0.6, 0.5)).toBe("up");
    expect(trendOf(0.5, 0.6)).toBe("down");
    expect(trendOf(0.5, 0.5)).toBe("flat");
  });

  it("changes inside the default 0.02 dead-band are flat, both directions", () => {
    expect(trendOf(0.51, 0.5)).toBe("flat");
    expect(trendOf(0.5, 0.51)).toBe("flat");
    expect(trendOf(0.515, 0.5)).toBe("flat");
  });

  it("a diff of exactly epsilon is flat (strict inequality)", () => {
    // Binary-exact values so the boundary is tested without float jitter.
    expect(trendOf(0.5, 0.25, 0.25)).toBe("flat");
    expect(trendOf(0.25, 0.5, 0.25)).toBe("flat");
  });

  it("just beyond a custom epsilon earns the arrow", () => {
    expect(trendOf(0.75, 0.25, 0.25)).toBe("up");
    expect(trendOf(0.25, 0.75, 0.25)).toBe("down");
  });
});

// ── statTrends ───────────────────────────────────────────────────────────────

describe("statTrends", () => {
  it("yesterday absent from the store → every trend null (no data, no arrow)", () => {
    const store = { [dayBack(0)]: dayAt(0.5) };
    expect(statTrends(store, now, TARGETS)).toEqual({
      energy: null,
      protein: null,
      fiber: null,
      vitamins: null,
    });
  });

  it("yesterday present but empty → still null on every stat", () => {
    const store = { [dayBack(1)]: [], [dayBack(0)]: dayAt(0.5) };
    expect(statTrends(store, now, TARGETS)).toEqual({
      energy: null,
      protein: null,
      fiber: null,
      vitamins: null,
    });
  });

  it("all four stats up when today out-covers yesterday beyond epsilon", () => {
    const store = { [dayBack(1)]: dayAt(0.3), [dayBack(0)]: dayAt(0.8) };
    expect(statTrends(store, now, TARGETS)).toEqual({
      energy: "up",
      protein: "up",
      fiber: "up",
      vitamins: "up",
    });
  });

  it("all four stats down when the days swap", () => {
    const store = { [dayBack(1)]: dayAt(0.8), [dayBack(0)]: dayAt(0.3) };
    expect(statTrends(store, now, TARGETS)).toEqual({
      energy: "down",
      protein: "down",
      fiber: "down",
      vitamins: "down",
    });
  });

  it("identical days → flat; sub-epsilon drift also flat", () => {
    expect(
      statTrends(
        { [dayBack(1)]: dayAt(0.5), [dayBack(0)]: dayAt(0.5) },
        now,
        TARGETS,
      ),
    ).toEqual({
      energy: "flat",
      protein: "flat",
      fiber: "flat",
      vitamins: "flat",
    });
    // +10 kcal on a 2000 target = 0.005 coverage drift — inside the dead-band.
    expect(
      statTrends(
        {
          [dayBack(1)]: [eaten({ calories: 1000 })],
          [dayBack(0)]: [eaten({ calories: 1010 })],
        },
        now,
        TARGETS,
      ).energy,
    ).toBe("flat");
  });

  it("coverage clamps at 1 — over-eating past target on both days reads flat", () => {
    const store = {
      [dayBack(1)]: [eaten({ calories: 2500, protein_g: 150 })],
      [dayBack(0)]: [eaten({ calories: 3000, protein_g: 200 })],
    };
    const t = statTrends(store, now, TARGETS);
    expect(t.energy).toBe("flat");
    expect(t.protein).toBe("flat");
  });

  it("yesterday logged, today (so far) empty → honest down arrows, not null", () => {
    const t = statTrends({ [dayBack(1)]: dayAt(0.5) }, now, TARGETS);
    expect(t).toEqual({
      energy: "down",
      protein: "down",
      fiber: "down",
      vitamins: "down",
    });
  });

  it("realistic two-day cooked store: guacamole ×1 yesterday, ×3 today → all up", () => {
    // Sanity-pin the fixture against the live engine: one extra serving must
    // move every stat's coverage by more than epsilon for "up" to be earned.
    const per = getDishNutrition("guacamole").perServing!;
    expect((2 * per.calories) / TARGETS.kcal).toBeGreaterThan(0.02);
    expect((2 * per.protein_g!) / TARGETS.protein_g).toBeGreaterThan(0.02);
    expect((2 * per.fiber_g) / FIBER_DV).toBeGreaterThan(0.02);

    const store = {
      [dayBack(1)]: [cooked("guacamole", 1)],
      [dayBack(0)]: [cooked("guacamole", 3)],
    };
    const t = statTrends(store, now, TARGETS);
    const valid: Array<TrendDirection | null> = ["up", "down", "flat"];
    expect(Object.values(t).every((v) => valid.includes(v))).toBe(true);
    expect(t).toEqual({
      energy: "up",
      protein: "up",
      fiber: "up",
      vitamins: "up",
    });
  });
});
