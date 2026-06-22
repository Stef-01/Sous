import { describe, expect, it } from "vitest";
import { contextBoost, type DeckContext } from "./quest-pool";

function ctx(over: Partial<DeckContext> = {}): DeckContext {
  return {
    daypart: "dinner",
    weatherLean: "neutral",
    savedSlugs: new Set<string>(),
    tableCuisines: new Set<string>(),
    tableMinSpice: 5,
    ...over,
  };
}

const dish = (over: {
  slug?: string;
  cuisineFamily?: string;
  tags?: string[];
  description?: string;
  dayparts?: string[];
}) => ({
  slug: "x",
  tags: [],
  description: "",
  dayparts: undefined,
  ...over,
});

describe("contextBoost — hunger-aware (daypart)", () => {
  it("boosts a dish authored for the current daypart", () => {
    const d = dish({ dayparts: ["breakfast", "lunch"] });
    expect(contextBoost(d, ctx({ daypart: "lunch" }))).toBeGreaterThan(0);
    expect(contextBoost(d, ctx({ daypart: "dinner" }))).toBe(0);
  });

  it("does nothing for dishes with no authored dayparts (e.g. sides)", () => {
    expect(contextBoost(dish({}), ctx({ daypart: "lunch" }))).toBe(0);
  });
});

describe("contextBoost — weather-aware", () => {
  it("boosts a cold dish when it's hot, a warm dish when it's cold", () => {
    const cold = dish({ tags: ["Salad", "Fresh"] });
    const warm = dish({ description: "a warming beef stew" });
    expect(
      contextBoost(cold, ctx({ weatherLean: "cold-food" })),
    ).toBeGreaterThan(0);
    expect(contextBoost(cold, ctx({ weatherLean: "warm-food" }))).toBe(0);
    expect(
      contextBoost(warm, ctx({ weatherLean: "warm-food" })),
    ).toBeGreaterThan(0);
  });

  it("adds nothing when the weather is neutral", () => {
    const cold = dish({ tags: ["Salad"] });
    expect(contextBoost(cold, ctx({ weatherLean: "neutral" }))).toBe(0);
  });
});

describe("contextBoost — crave-it resurface", () => {
  it("resurfaces a saved dish, and AMPLIFIES it when the weather matches", () => {
    const coldSaved = dish({ slug: "gazpacho", tags: ["Cold", "Fresh"] });
    const base = contextBoost(
      coldSaved,
      ctx({ savedSlugs: new Set(["gazpacho"]), weatherLean: "neutral" }),
    );
    const amplified = contextBoost(
      coldSaved,
      ctx({ savedSlugs: new Set(["gazpacho"]), weatherLean: "cold-food" }),
    );
    expect(base).toBeGreaterThan(0); // saved → resurfaces
    // hot day + a saved cold dish → strictly stronger than a neutral day
    // (the "save it, it comes back when it's hot" amplification). The delta
    // also includes the plain weather match, which is the intended behaviour.
    expect(amplified).toBeGreaterThan(base);
  });

  it("adds nothing for an unsaved dish", () => {
    expect(
      contextBoost(dish({ slug: "y" }), ctx({ savedSlugs: new Set(["z"]) })),
    ).toBe(0);
  });
});

describe("contextBoost — the on-by-default split", () => {
  it("the daypart (hunger) reorder is ALWAYS on — a matching meal gets only the daypart boost when weather is off + nothing saved", () => {
    const onlyDaypart = contextBoost(
      dish({ dayparts: ["dinner"], tags: ["Savory"] }),
      ctx({ daypart: "dinner", weatherLean: "neutral", savedSlugs: new Set() }),
    );
    expect(onlyDaypart).toBe(8); // DAYPART_BOOST — no weather, no resurface
  });

  it("weather + crave-it contribute exactly 0 when weather is off and nothing is saved", () => {
    // A generic, daypart-non-matching dish → fully quiet; the contextual terms
    // never fire on their own.
    expect(
      contextBoost(
        dish({ dayparts: ["dinner"], tags: ["Savory"], description: "tacos" }),
        ctx({
          daypart: "breakfast",
          weatherLean: "neutral",
          savedSlugs: new Set(),
        }),
      ),
    ).toBe(0);
  });
});

describe("contextBoost — who's-at-the-table cuisine (W37 table aggregate)", () => {
  it("boosts a dish whose cuisine the household table leans toward", () => {
    const d = dish({ slug: "pasta", cuisineFamily: "Italian" });
    expect(
      contextBoost(d, ctx({ tableCuisines: new Set(["italian"]) })),
    ).toBeGreaterThan(0);
  });

  it("stays quiet with no table set, or when the cuisine doesn't match", () => {
    const d = dish({ slug: "pasta", cuisineFamily: "Italian" });
    expect(contextBoost(d, ctx())).toBe(0);
    expect(contextBoost(d, ctx({ tableCuisines: new Set(["thai"]) }))).toBe(0);
  });
});

describe("contextBoost — table spice tolerance (W37 minSpiceTolerance)", () => {
  it("penalizes an explicitly-spicy dish when the table can't take heat", () => {
    const d = dish({ slug: "vindaloo", tags: ["Indian", "Spicy"] });
    expect(contextBoost(d, ctx({ tableMinSpice: 1 }))).toBeLessThan(0);
    expect(contextBoost(d, ctx({ tableMinSpice: 2 }))).toBeLessThan(0);
  });

  it("no penalty when tolerance is fine, no table, or the dish isn't spicy", () => {
    const spicy = dish({ slug: "vindaloo", tags: ["Indian", "Spicy"] });
    const mild = dish({ slug: "rice", tags: ["Plain"] });
    expect(contextBoost(spicy, ctx({ tableMinSpice: 3 }))).toBe(0); // tolerant
    expect(contextBoost(spicy, ctx())).toBe(0); // no table (default 5)
    expect(contextBoost(mild, ctx({ tableMinSpice: 1 }))).toBe(0); // not spicy
  });
});
