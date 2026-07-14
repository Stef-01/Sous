import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (...segments: string[]) =>
  readFileSync(join(__dirname, ...segments), "utf8");

describe("frontend modernization contracts", () => {
  it("keeps optional Today personalization behind the meal hero", () => {
    const source = read("(today)", "today", "page.tsx");
    const search = source.indexOf("<CravingSearchBar");
    const meal = source.indexOf("<QuestCard");
    const personalization = source.indexOf("<FirstRunCoachmark");

    expect(search).toBeGreaterThan(0);
    expect(search).toBeLessThan(meal);
    expect(meal).toBeLessThan(personalization);
  });

  it("keeps persistent surface elevation flat and restrained", () => {
    const css = read("globals.css");

    expect(css).toContain("--shadow-card: none;");
    expect(css).toContain("--shadow-cta: none;");
    expect(css).toContain("--radius-md: 8px;");
    expect(css).toContain("--radius-lg: 8px;");
  });

  it("keeps Path's primary workflow compact and its empty state unframed", () => {
    const source = read("(path)", "path", "page.tsx");
    const emptyState = source.slice(
      source.indexOf('aria-labelledby="path-empty-title"'),
      source.indexOf("{/* The rest of the kitchen"),
    );

    expect(source).toContain('aria-label="Kitchen workflow"');
    expect(source).toContain("min-h-[56px]");
    expect(emptyState).not.toContain("shadow-");
    expect(emptyState).not.toContain("bg-gradient");
  });

  it("curates Community before revealing the full archive", () => {
    const source = read("(community)", "community", "page.tsx");

    expect(source).toContain("articlesToShow.slice(0, 4)");
    expect(source).toContain("sortedResearch.slice(0, 2)");
    expect(source).toContain("visibleArticles.map");
    expect(source).toContain("visibleResearch.map");
  });

  it("keeps meal-queue copy and actions outside the food viewport", () => {
    const source = read("..", "components", "today", "quest-card.tsx");

    expect(source).toContain(
      'className="relative z-40 shrink-0 bg-[#080907] px-4 pt-2"',
    );
    expect(source).not.toContain('className="absolute -top-[50px]');
    expect(source).not.toContain(">Browse meals<");
  });

  it("keeps optional cook controls flat", () => {
    const planner = read(
      "..",
      "components",
      "guided-cook",
      "plan-cook-chip.tsx",
    );
    const mission = read(
      "..",
      "components",
      "guided-cook",
      "mission-screen.tsx",
    );

    expect(planner).not.toContain("border-dashed");
    expect(mission).not.toContain("linear-gradient");
  });

  it("keeps the Today community strip visible once lazily mounted", () => {
    const source = read("..", "components", "today", "friends-strip.tsx");

    expect(source).toContain("Community this week");
    expect(source).not.toContain('initial="hidden"');
    expect(source).not.toContain("useInView");
  });
});
