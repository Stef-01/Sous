import { describe, expect, it } from "vitest";
import {
  buildCombinedDisplayName,
  buildCombinedSlug,
  buildIngredientSections,
  buildOrderedDishes,
  buildParallelHintMap,
} from "./combined-shapers";

const dish = (slug: string, name: string) => ({
  dish: {
    slug,
    name,
    cuisineFamily: "indian",
    description: "",
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    heroImageUrl: null,
    flavorProfile: [],
    temperature: "hot",
  },
  ingredients: [{ id: `${slug}-i1`, name: "salt" }],
  steps: [{ phase: "cook", stepNumber: 1, instruction: "do thing" }],
});

describe("buildOrderedDishes", () => {
  it("orders main + sides by the cookOrder plan", () => {
    const main = dish("rice", "Rice");
    const sideA = dish("dal", "Dal");
    const sideB = dish("salad", "Salad");
    const result = buildOrderedDishes(
      main,
      [sideA, sideB],
      ["salad", "dal", "rice"],
    );
    expect(result.map((d) => d.dish.slug)).toEqual(["salad", "dal", "rice"]);
  });

  it("filters out cookOrder slugs that aren't in the lookup", () => {
    const main = dish("rice", "Rice");
    const result = buildOrderedDishes(main, [], ["unknown", "rice"]);
    expect(result.map((d) => d.dish.slug)).toEqual(["rice"]);
  });

  it("handles a null main (sides-only cook)", () => {
    const sideA = dish("dal", "Dal");
    const result = buildOrderedDishes(null, [sideA], ["dal"]);
    expect(result.map((d) => d.dish.slug)).toEqual(["dal"]);
  });

  it("handles an undefined main without crashing", () => {
    const sideA = dish("dal", "Dal");
    const result = buildOrderedDishes(undefined, [sideA], ["dal"]);
    expect(result).toHaveLength(1);
  });

  it("returns empty when cookOrder is empty", () => {
    const main = dish("rice", "Rice");
    expect(buildOrderedDishes(main, [], [])).toEqual([]);
  });
});

describe("buildIngredientSections", () => {
  it("creates one section per dish with 'For <name>' label", () => {
    const dishes = [dish("rice", "Rice"), dish("dal", "Dal")];
    const result = buildIngredientSections(dishes);
    expect(result.map((s) => s.label)).toEqual(["For Rice", "For Dal"]);
    expect(result[0].ingredients).toEqual(dishes[0].ingredients);
    expect(result[1].ingredients).toEqual(dishes[1].ingredients);
  });

  it("returns an empty array for no dishes", () => {
    expect(buildIngredientSections([])).toEqual([]);
  });

  it("preserves ingredient ordering within each dish", () => {
    const d = {
      ...dish("a", "A"),
      ingredients: [
        { id: "1", name: "first" },
        { id: "2", name: "second" },
      ],
    };
    const result = buildIngredientSections([d]);
    expect(result[0].ingredients.map((i) => i.id)).toEqual(["1", "2"]);
  });
});

describe("buildParallelHintMap", () => {
  it("returns an empty map for null/undefined input", () => {
    expect(buildParallelHintMap(null).size).toBe(0);
    expect(buildParallelHintMap(undefined).size).toBe(0);
    expect(buildParallelHintMap([]).size).toBe(0);
  });

  it("keys hints by '<dishSlug>-<stepIndex>'", () => {
    const result = buildParallelHintMap([
      { dishSlug: "rice", stepIndex: 0, hint: "let it rest" },
      { dishSlug: "dal", stepIndex: 2, hint: "stir now" },
    ]);
    expect(result.get("rice-0")).toBe("let it rest");
    expect(result.get("dal-2")).toBe("stir now");
    expect(result.size).toBe(2);
  });

  it("later hints overwrite earlier hints for the same key", () => {
    const result = buildParallelHintMap([
      { dishSlug: "rice", stepIndex: 0, hint: "first" },
      { dishSlug: "rice", stepIndex: 0, hint: "second" },
    ]);
    expect(result.get("rice-0")).toBe("second");
  });
});

describe("buildCombinedSlug", () => {
  it("returns empty string for no dishes", () => {
    expect(buildCombinedSlug([])).toBe("");
  });

  it("returns the single dish's slug for a 1-dish cook", () => {
    expect(buildCombinedSlug([{ dish: { slug: "rice" } }])).toBe("rice");
  });

  it("joins multiple dish slugs with '+' preserving order", () => {
    expect(
      buildCombinedSlug([
        { dish: { slug: "rice" } },
        { dish: { slug: "dal" } },
        { dish: { slug: "salad" } },
      ]),
    ).toBe("rice+dal+salad");
  });
});

describe("buildCombinedDisplayName", () => {
  it("joins dish names with ' + ' for multi-dish cooks", () => {
    expect(
      buildCombinedDisplayName([
        { dish: { name: "Rice" } },
        { dish: { name: "Dal" } },
      ]),
    ).toBe("Rice + Dal");
  });

  it("returns just the name for a 1-dish cook", () => {
    expect(buildCombinedDisplayName([{ dish: { name: "Rice" } }])).toBe("Rice");
  });

  it("returns empty string for no dishes", () => {
    expect(buildCombinedDisplayName([])).toBe("");
  });
});

// W11 stress-test loop 1 — per docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md
// the per-week 5-day skeleton requires at least one stress test from
// the 12-test catalog. For combined-shapers (pure functions, no DOM),
// the relevant catalogue entries are: long-content, race-condition,
// poisoned-data.
describe("combined-shapers — stress: long-content", () => {
  it("orders 200 sides without losing items or skewing performance", () => {
    const main = dish("rice", "Rice");
    const sides = Array.from({ length: 200 }, (_, i) =>
      dish(`side-${i}`, `Side ${i}`),
    );
    const cookOrder = ["rice", ...sides.map((s) => s.dish.slug)];
    const start = performance.now();
    const result = buildOrderedDishes(main, sides, cookOrder);
    const elapsed = performance.now() - start;
    expect(result).toHaveLength(201);
    expect(result[0].dish.slug).toBe("rice");
    expect(result[200].dish.slug).toBe("side-199");
    // Pure-function ordering should be sub-millisecond on 200 items.
    expect(elapsed).toBeLessThan(50);
  });

  it("handles a 5000-character dish name without truncation", () => {
    const longName = "Spaghetti ".repeat(500); // 5000 chars
    const result = buildCombinedDisplayName([{ dish: { name: longName } }]);
    expect(result).toBe(longName);
    expect(result.length).toBe(5000);
  });

  it("handles a 100-ingredient dish without flattening", () => {
    const d = {
      ...dish("a", "A"),
      ingredients: Array.from({ length: 100 }, (_, i) => ({
        id: `ing-${i}`,
        name: `Ingredient ${i}`,
      })),
    };
    const result = buildIngredientSections([d]);
    expect(result[0].ingredients).toHaveLength(100);
    expect(result[0].ingredients[0].id).toBe("ing-0");
    expect(result[0].ingredients[99].id).toBe("ing-99");
  });
});

describe("combined-shapers — stress: race-condition / call-order", () => {
  it("buildOrderedDishes is order-deterministic across repeated calls", () => {
    const main = dish("rice", "Rice");
    const sides = [dish("dal", "Dal"), dish("salad", "Salad")];
    const cookOrder = ["salad", "rice", "dal"];
    const r1 = buildOrderedDishes(main, sides, cookOrder).map(
      (d) => d.dish.slug,
    );
    const r2 = buildOrderedDishes(main, sides, cookOrder).map(
      (d) => d.dish.slug,
    );
    const r3 = buildOrderedDishes(main, sides, cookOrder).map(
      (d) => d.dish.slug,
    );
    expect(r1).toEqual(r2);
    expect(r2).toEqual(r3);
  });

  it("buildParallelHintMap is the-same-Map shape across repeated calls", () => {
    const hints = [
      { dishSlug: "rice", stepIndex: 0, hint: "rest" },
      { dishSlug: "dal", stepIndex: 1, hint: "stir" },
    ];
    const m1 = buildParallelHintMap(hints);
    const m2 = buildParallelHintMap(hints);
    expect([...m1.entries()]).toEqual([...m2.entries()]);
  });
});

describe("combined-shapers — stress: poisoned-data", () => {
  it("buildOrderedDishes preserves duplicate slugs in cookOrder (pinned contract)", () => {
    const main = dish("rice", "Rice");
    // A malformed cookOrder that repeats a slug — the lookup map
    // holds one entry per slug, but cookOrder.map iterates each.
    // Pin the contract: duplicates are preserved (caller is
    // responsible for de-duping if needed).
    const result = buildOrderedDishes(main, [], ["rice", "rice", "rice"]);
    expect(result).toHaveLength(3);
    expect(result.every((d) => d.dish.slug === "rice")).toBe(true);
  });

  it("buildOrderedDishes survives an empty cookOrder + populated sides", () => {
    const main = dish("rice", "Rice");
    const sides = [dish("dal", "Dal")];
    expect(buildOrderedDishes(main, sides, [])).toEqual([]);
  });

  it("buildParallelHintMap handles empty-string keys gracefully", () => {
    const result = buildParallelHintMap([
      { dishSlug: "", stepIndex: 0, hint: "edge" },
    ]);
    expect(result.get("-0")).toBe("edge");
  });
});
