import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Phase 3 source-contract guards (node env — no DOM render available).
 *
 * These lock the *structural* decisions of the logging unification + the
 * streak-at-the-tap celebration so they can't silently regress. We assert
 * against the real source text, the same way use-overlay-a11y.test.ts does.
 */

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const LOG_IT_BUTTON = "src/components/shared/log-it-button.tsx";
const COOK_READOUT = "src/components/guided-cook/cook-nutrition-readout.tsx";
const DIARY_HOOK = "src/lib/hooks/use-nutrition-diary.ts";
const DIARY_PAGE = "src/app/(path)/path/diary/page.tsx";

describe("LogItButton — canonical logging control (Phase 3 / log-unify-primitive)", () => {
  const src = read(LOG_IT_BUTTON);

  it("exposes the pill|block variant union with pill as the default", () => {
    expect(src).toMatch(/variant\?:\s*"pill"\s*\|\s*"block"/);
    expect(src).toMatch(/variant\s*=\s*"pill"/);
  });

  it("owns already-logged detection off the diary entries (not re-derived per surface)", () => {
    expect(src).toMatch(/entries\.some\(\(e\)\s*=>\s*e\.slug\s*===\s*slug\)/);
  });

  it("emits exactly one success toast with the dedupKey contract", () => {
    expect((src.match(/toast\.push\(/g) ?? []).length).toBe(1);
    expect(src).toContain("dedupKey: `log-${slug}`");
    expect(src).toMatch(/variant:\s*"success"/);
  });

  it("the toast copy is the today's-diary line, never the old 'Path tab' string", () => {
    expect(src).toContain("Logged ${name}");
    expect(src).toMatch(/today's diary/i);
    expect(src).not.toMatch(/Path tab/);
    expect(src).not.toMatch(/Add to today's nutrition/);
  });

  it("fires the commit haptic on log", () => {
    expect(src).toContain('haptic("commit")');
  });
});

describe("LogItButton block variant — Rule 2 subordinate styling", () => {
  const src = read(LOG_IT_BUTTON);

  it("renders a full-width tinted (not solid) block, distinct from the pill", () => {
    expect(src).toMatch(/if\s*\(variant\s*===\s*"block"\)/);
    expect(src).toContain("w-full");
    expect(src).toContain("bg-[var(--nourish-green)]/5");
  });
});

describe("CookNutritionReadout — routes through the canonical button carrying servings", () => {
  const src = read(COOK_READOUT);

  it("renders LogItButton in block variant and threads the slider's servings", () => {
    expect(src).toContain("import { LogItButton }");
    expect(src).toMatch(/variant=\{?["']block["']\}?|variant="block"/);
    expect(src).toMatch(/servings=\{servings\}/);
  });

  it("no longer hand-rolls its own write path (no direct logCook / bespoke toast here)", () => {
    expect(src).not.toMatch(/logCook\(/);
    expect(src).not.toMatch(/See it on the Path tab/);
  });
});

describe("celebration — fires at the tap inside the log ACTIONS, deduped, never on mount (Phase 3 / R4, store refactor)", () => {
  const src = read(DIARY_HOOK);

  it("milestonesForLog is exported and pure (used by the celebrate step)", () => {
    expect(src).toMatch(/export function milestonesForLog\(/);
  });

  it("celebrate() runs inside BOTH log actions (event-scoped — no mount path)", () => {
    // The store refactor moved celebration from a justLoggedRef-gated effect
    // into the module actions themselves: actions run once per user event, so
    // there is no StrictMode double-fire and no mount/hydrate path at all.
    expect((src.match(/celebrate\(next\);/g) ?? []).length).toBe(2);
    expect(src).toMatch(
      /export function diaryLogCook\([\s\S]*?celebrate\(next\);[\s\S]*?\n\}/,
    );
    expect(src).toMatch(
      /export function diaryLogBranded\([\s\S]*?celebrate\(next\);[\s\S]*?\n\}/,
    );
  });

  it("remove/restore do NOT celebrate", () => {
    const removeBody = src.slice(
      src.indexOf("export function diaryRemoveEntry"),
      src.indexOf("export function diaryRestoreEntry"),
    );
    const restoreBody = src.slice(
      src.indexOf("export function diaryRestoreEntry"),
      src.indexOf("export function diaryTodayEntries"),
    );
    expect(removeBody).not.toContain("celebrate(");
    expect(restoreBody).not.toContain("celebrate(");
  });

  it("localStorage is the single once-only dedup source (sous-celebrated-<id>)", () => {
    expect(src).toContain("`sous-celebrated-${m.id}`");
    expect(src).toMatch(/localStorage\.getItem\(seenKey\)/);
    expect(src).toMatch(/localStorage\.setItem\(seenKey,\s*"1"\)/);
  });

  it("the diary is ONE shared reactive store (useSyncExternalStore, shared snapshot)", () => {
    expect(src).toMatch(/useSyncExternalStore\(subscribe, getSnapshot/);
    expect(src).toMatch(/listeners\.forEach\(\(l\)\s*=>\s*l\(\)\)/);
  });

  it("celebration toasts are the 'achievement' variant", () => {
    expect(src).toMatch(/variant:\s*"achievement"/);
  });
});

describe("diary page — superseded by the Nutrition tab (founder-directed)", () => {
  const src = read(DIARY_PAGE);

  it("is a redirect to /nutrition (old deep links keep working)", () => {
    expect(src).toMatch(/redirect\("\/nutrition"\)/);
  });

  it("carries no celebration logic of its own", () => {
    expect(src).not.toMatch(/streakMilestone|firstMilestone|milestonesForLog/);
    expect(src).not.toContain("sous-celebrated");
  });
});
