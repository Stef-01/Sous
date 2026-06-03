import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Path Hierarchy guard — companion to the Today Simplicity Budget test.
 *
 * The Path page once stacked FOUR dashboard cards (header stats, Up Next,
 * Journey stats, Weekly challenge) ABOVE the skill tree, burying the tree —
 * the page's signature "journey" visual and the reason to visit the tab —
 * entirely below the fold. The 2026-06 declutter re-established a hero-first
 * order and merged the two look-back cards into one grouped surface.
 *
 * This static guard (reads source, no render — so it's part of the fast
 * `pnpm test` gate) keeps that hierarchy from silently regressing:
 *   1. The single forward action (NextUnlockCard) leads.
 *   2. The skill tree is surfaced ABOVE the look-back dashboard, not beneath it.
 *   3. The lifetime-stats + weekly-goal cards stay merged into ONE grouped
 *      card (the `bare` composition), not two floating cards again.
 */

const PATH_PAGE = join(__dirname, "page.tsx");
const src = readFileSync(PATH_PAGE, "utf8");

function idx(marker: string): number {
  const i = src.indexOf(marker);
  expect(
    i,
    `expected ${marker} to be present in path/page.tsx`,
  ).toBeGreaterThan(0);
  return i;
}

describe("Path Hierarchy", () => {
  it("leads with the forward action, then the tree, then the dashboard", () => {
    const upNext = idx("<NextUnlockCard");
    const tree = idx("<SkillTree");
    const journey = idx("<JourneySummary");
    const weekly = idx("<WeeklyGoalCard");

    // Up Next (the single "what to cook next" action) leads the page.
    expect(
      upNext,
      "NextUnlockCard (the forward action) must lead, before the skill tree",
    ).toBeLessThan(tree);

    // The skill tree — the signature visual — is surfaced ABOVE the look-back
    // dashboard. This is the exact regression the declutter fixed: stats first,
    // tree buried.
    expect(
      tree,
      "SkillTree must render ABOVE the Journey/Weekly dashboard, not below it",
    ).toBeLessThan(journey);
    expect(tree).toBeLessThan(weekly);
  });

  it("keeps the look-back stats merged into one grouped card", () => {
    // Both look-back cards are composed `bare` inside a single divide-y grouped
    // card. If either reverts to its own chrome, it floats as a second card —
    // the visual noise the merge removed.
    const grouped = idx("divide-y");
    const journey = idx("<JourneySummary");
    const weekly = idx("<WeeklyGoalCard");

    expect(
      grouped,
      "the grouped (divide-y) card must wrap the look-back stats",
    ).toBeLessThan(journey);
    expect(grouped).toBeLessThan(weekly);

    // Each is rendered chrome-less so the parent owns the single border.
    expect(
      /<JourneySummary[\s\S]{0,80}\bbare\b/.test(src),
      "JourneySummary must be rendered `bare` (no own card chrome)",
    ).toBe(true);
    expect(
      /<WeeklyGoalCard[\s\S]{0,80}\bbare\b/.test(src),
      "WeeklyGoalCard must be rendered `bare` (no own card chrome)",
    ).toBe(true);
  });
});
