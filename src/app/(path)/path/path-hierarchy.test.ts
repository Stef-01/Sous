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
 * A later pass (2026-06) went further: the separate "Up Next" card duplicated
 * the skill tree's active node (same name + icon, stacked directly above it),
 * so it was removed — the tree is now the single hero and its active node IS
 * "what's next".
 *
 * This static guard (reads source, no render — so it's part of the fast
 * `pnpm test` gate) keeps that hierarchy from silently regressing:
 *   1. The skill tree (single hero) leads, ABOVE the look-back dashboard.
 *   2. No separate Up-Next card re-introduces the active-skill duplication.
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
  it("leads with the skill tree (single hero), above the dashboard", () => {
    const tree = idx("<SkillTree");
    const journey = idx("<JourneySummary");
    const weekly = idx("<WeeklyGoalCard");

    // The skill tree — the signature journey visual — leads, surfaced ABOVE the
    // look-back dashboard (the exact regression the declutter fixed: stats
    // first, tree buried).
    expect(
      tree,
      "SkillTree must render ABOVE the Journey/Weekly dashboard, not below it",
    ).toBeLessThan(journey);
    expect(tree).toBeLessThan(weekly);
  });

  it("does not duplicate the active skill in a separate Up-Next card", () => {
    // The tree's active node IS 'what's next'. A separate NextUnlockCard
    // restated the same skill (name + icon) directly above the tree — the
    // redundancy the declutter removed. Keep it off.
    expect(src.includes("<NextUnlockCard")).toBe(false);
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
