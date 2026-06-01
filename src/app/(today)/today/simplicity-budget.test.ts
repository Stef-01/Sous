import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Today Simplicity Budget guard — see docs/RCA-TODAY-CLUTTER.md.
 *
 * Today is "one screen, one action, one win" (CLAUDE.md radical simplicity).
 * The recurring failure was per-element justification: each chip was useful in
 * isolation, so the screen accreted nudges until the MEAL — the one thing the
 * user opened the app for — was buried below redundant cadence/stat widgets.
 *
 * This guard gives the Sous Test (rule 1) + simplicity-first (rule 6) teeth:
 *   1. The redundant cadence/stat widgets must NOT come back.
 *   2. The meal hero (QuestCard) must render BEFORE any contextual nudge chip.
 *
 * Static (reads source, no render) so it's part of the fast `pnpm test` gate.
 */

const TODAY_PAGE = join(__dirname, "page.tsx");
const src = readFileSync(TODAY_PAGE, "utf8");

describe("Today Simplicity Budget", () => {
  // The streak flame is the ONE cadence signal; stats live on Path. These
  // widgets each restated cadence/stats already shown elsewhere.
  const BANNED = [
    "WeeklyRhythmWidget", // "3 cooks this week" — duplicates the streak
    "CookRhythmLine", // "You usually cook Monday mornings" — cadence again
    "deriveWelcomeLine", // "Day 4 of cooking" — a second copy of the streak
    "EcoProgressChip", // a STAT on Today; belongs on Path/Eco
  ];

  it("does not re-introduce the redundant cadence/stat widgets", () => {
    const offenders = BANNED.filter((name) =>
      new RegExp(`\\b${name}\\b`).test(src),
    );
    expect(
      offenders,
      `These restate signals already shown (streak / Path stats). Keep them off Today:\n${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("renders the meal hero before any contextual nudge chip", () => {
    const heroIdx = src.indexOf("<QuestCard");
    expect(heroIdx, "QuestCard (meal hero) must be present").toBeGreaterThan(0);

    // Any chip that suggests/nudges sits BELOW the meal. If one is hoisted above
    // the hero, the meal is buried — that's the regression this catches.
    const NUDGE_CHIPS = [
      "<TonightChip",
      "<RepeatCookChip",
      "<TodayPlannedSlot",
      "<CookAgainChip",
      "<DailyNoveltyChip",
      "<WhosAtTable",
    ];
    for (const chip of NUDGE_CHIPS) {
      const idx = src.indexOf(chip);
      if (idx === -1) continue; // chip may be removed entirely — that's fine
      expect(
        heroIdx,
        `${chip} must render AFTER the meal hero, not above it`,
      ).toBeLessThan(idx);
    }
  });
});
