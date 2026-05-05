import { describe, expect, it } from "vitest";
import {
  POD_WEEKLY_THEMES,
  recipeMatchesTheme,
  resolveWeeklyTheme,
  weekKeyToOrdinal,
  type WeeklyTheme,
} from "./weekly-themes";

describe("POD_WEEKLY_THEMES catalog", () => {
  it("ships at least 6 themes", () => {
    expect(POD_WEEKLY_THEMES.length).toBeGreaterThanOrEqual(6);
  });

  it("slugs are unique", () => {
    const slugs = new Set<string>();
    for (const t of POD_WEEKLY_THEMES) {
      expect(slugs.has(t.slug)).toBe(false);
      slugs.add(t.slug);
    }
  });

  it("titles + blurbs are non-empty", () => {
    for (const t of POD_WEEKLY_THEMES) {
      expect(t.title.length).toBeGreaterThan(2);
      expect(t.blurb.length).toBeGreaterThan(10);
    }
  });
});

describe("weekKeyToOrdinal", () => {
  it("produces monotonic values across weeks within a year", () => {
    const a = weekKeyToOrdinal("2026-W01");
    const b = weekKeyToOrdinal("2026-W02");
    expect(b).toBeGreaterThan(a);
  });

  it("preserves order across year boundaries", () => {
    const dec = weekKeyToOrdinal("2026-W52");
    const jan = weekKeyToOrdinal("2027-W01");
    expect(jan).toBeGreaterThan(dec);
  });

  it("returns 0 on malformed input", () => {
    expect(weekKeyToOrdinal("")).toBe(0);
    expect(weekKeyToOrdinal("not-a-week")).toBe(0);
    expect(weekKeyToOrdinal("2026-19")).toBe(0); // missing W prefix
  });
});

describe("resolveWeeklyTheme", () => {
  it("returns the same theme for the same week", () => {
    const a = resolveWeeklyTheme({ weekKey: "2026-W18" });
    const b = resolveWeeklyTheme({ weekKey: "2026-W18" });
    expect(a.slug).toBe(b.slug);
  });

  it("rotates across consecutive weeks", () => {
    const seen = new Set<string>();
    for (let i = 1; i <= POD_WEEKLY_THEMES.length; i++) {
      const wk = `2026-W${String(i).padStart(2, "0")}`;
      seen.add(resolveWeeklyTheme({ weekKey: wk }).slug);
    }
    // Six consecutive weeks across a 6-theme catalog should
    // hit every theme exactly once.
    expect(seen.size).toBe(POD_WEEKLY_THEMES.length);
  });

  it("falls back to first theme on malformed week key", () => {
    const t = resolveWeeklyTheme({ weekKey: "garbage" });
    expect(t.slug).toBe(POD_WEEKLY_THEMES[0].slug);
  });

  it("respects a custom catalog override", () => {
    const custom: WeeklyTheme[] = [
      {
        slug: "only",
        title: "Only theme",
        blurb: "There can be only one.",
        suggestedRecipeSlugs: [],
        suggestedTwist: null,
        emoji: "🔁",
      },
    ];
    const t = resolveWeeklyTheme({ weekKey: "2026-W42", catalog: custom });
    expect(t.slug).toBe("only");
  });

  it("throws when given an empty catalog", () => {
    expect(() =>
      resolveWeeklyTheme({ weekKey: "2026-W01", catalog: [] }),
    ).toThrow();
  });
});

describe("recipeMatchesTheme", () => {
  const themed: WeeklyTheme = {
    slug: "test",
    title: "Test",
    blurb: "Test theme.",
    suggestedRecipeSlugs: ["a", "b"],
    suggestedTwist: null,
    emoji: "🧪",
  };
  const open: WeeklyTheme = { ...themed, suggestedRecipeSlugs: [] };

  it("returns true for a slug on the allow-list", () => {
    expect(recipeMatchesTheme({ theme: themed, recipeSlug: "a" })).toBe(true);
  });

  it("returns false for a slug not on the allow-list", () => {
    expect(recipeMatchesTheme({ theme: themed, recipeSlug: "z" })).toBe(false);
  });

  it("treats empty allow-list as wildcard (true for any slug)", () => {
    expect(recipeMatchesTheme({ theme: open, recipeSlug: "anything" })).toBe(
      true,
    );
  });
});
