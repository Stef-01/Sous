import { describe, expect, it } from "vitest";
import { contextBoost, type DeckContext } from "./quest-pool";

function ctx(over: Partial<DeckContext> = {}): DeckContext {
  return {
    daypart: "dinner",
    weatherLean: "neutral",
    savedSlugs: new Set<string>(),
    ...over,
  };
}

const dish = (over: {
  slug?: string;
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

describe("contextBoost — quiet by default", () => {
  it("is exactly 0 with no signal (byte-identical deck)", () => {
    expect(
      contextBoost(
        dish({ dayparts: ["dinner"] }),
        ctx({ daypart: "breakfast" }),
      ),
    ).toBe(0);
  });
});
