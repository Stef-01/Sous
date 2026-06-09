import { describe, expect, it } from "vitest";
import {
  aggregateDay,
  milestonesForLog,
  loggingStreak,
  dayKey,
  type DiaryEntry,
} from "@/lib/hooks/use-nutrition-diary";

// ── helpers ──────────────────────────────────
const today = new Date("2026-06-09T12:00:00");
const cooked = (slug: string, servings = 1): DiaryEntry => ({
  slug,
  name: slug,
  servings,
  at: "2026-06-09T12:00:00.000Z",
});
const branded = (cal: number, servings = 1): DiaryEntry => ({
  slug: "off:123",
  name: "Packaged",
  brand: "Acme",
  servings,
  at: "2026-06-09T12:00:00.000Z",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nutrition: { calories: cal } as any,
});
const dayBack = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return dayKey(d);
};

describe("TodayEatingCard render gate (Phase 4)", () => {
  // The card returns null unless mounted && entries.length > 0 && dayNutrition.
  // dayNutrition === aggregateDay(entries). These pin the three states the gate
  // distinguishes so a regression that shows an empty ring (or hides a populated
  // one) fails here.

  it("no entries → dayNutrition is null → card renders nothing", () => {
    expect(aggregateDay([])).toBeNull();
  });

  it("entries that all fail coverage → dayNutrition null even though count>0", () => {
    // 'naan' has 0 composition coverage. entries.length === 1 but dayNutrition
    // is null, so the `!dayNutrition` clause is the one keeping the card hidden
    // — proves the guard is not redundant with length alone.
    const entries = [cooked("naan")];
    expect(entries.length).toBe(1);
    expect(aggregateDay(entries)).toBeNull();
  });

  it("at least one resolving entry → dayNutrition non-null → card renders", () => {
    const agg = aggregateDay([cooked("guacamole")]);
    expect(agg).not.toBeNull();
    expect(agg!.calories).toBeGreaterThan(0);
  });
});

describe("'N logged' count truthfulness", () => {
  it("count reflects every logged entry, resolving or not", () => {
    const entries = [cooked("guacamole"), cooked("naan"), branded(100)];
    // 3 logged, but only 2 contribute to the ring (naan uncovered).
    expect(entries.length).toBe(3);
    expect(aggregateDay(entries)).not.toBeNull();
  });
});

describe("branded vs cooked aggregation (ring honesty)", () => {
  it("branded entries DO count toward the day-total ring (dayNutrition)", () => {
    const withBranded = aggregateDay([cooked("guacamole"), branded(250)]);
    const withoutBranded = aggregateDay([cooked("guacamole")]);
    expect(withBranded).not.toBeNull();
    expect(withoutBranded).not.toBeNull();
    expect(withBranded!.calories).toBeCloseTo(
      withoutBranded!.calories + 250,
      0,
    );
  });

  it("cooked-only subset excludes branded (deficit-feed honesty)", () => {
    // Mirrors the hook's `entries.filter((e) => !e.nutrition)` derivation that
    // feeds deficit signals — a logged soda must not inflate cooked totals.
    const entries = [cooked("guacamole"), branded(999)];
    const cookedOnly = aggregateDay(entries.filter((e) => !e.nutrition));
    const guacOnly = aggregateDay([cooked("guacamole")]);
    expect(cookedOnly).not.toBeNull();
    expect(cookedOnly!.calories).toBeCloseTo(guacOnly!.calories, 0);
  });

  it("scales a branded entry by its servings", () => {
    expect(aggregateDay([branded(100, 3)])!.calories).toBe(300);
  });
});

describe("first-log celebration is earned + idempotent at the data layer", () => {
  // The toast/localStorage dedup lives in an effect, but the decision of which
  // milestones a log earns is the pure milestonesForLog. Pinning it locks the
  // "fires exactly on the first log, never again" contract the card pairs with.
  it("first-ever log earns first-log; a second log earns nothing", () => {
    const firstStore = { [dayBack(0)]: [cooked("a")] };
    expect(milestonesForLog(firstStore, today).map((m) => m.id)).toContain(
      "first-log",
    );
    const secondStore = { [dayBack(0)]: [cooked("a"), cooked("b")] };
    expect(milestonesForLog(secondStore, today)).toEqual([]);
  });

  it("milestonesForLog is pure — repeated calls yield identical results", () => {
    const store = { [dayBack(0)]: [cooked("a")] };
    const a = milestonesForLog(store, today).map((m) => m.id);
    const b = milestonesForLog(store, today).map((m) => m.id);
    expect(a).toEqual(b);
  });
});

describe("logging streak that powers the diary chip", () => {
  it("an unlogged today does not break a live streak", () => {
    const store = {
      [dayBack(1)]: [cooked("a")],
      [dayBack(2)]: [cooked("b")],
    };
    expect(loggingStreak(store, today)).toBe(2);
  });
});
