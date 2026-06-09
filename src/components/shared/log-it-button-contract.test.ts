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

describe("celebration effect — fires at the tap, deduped, never on mount (Phase 3 / R4)", () => {
  const src = read(DIARY_HOOK);

  it("milestonesForLog is exported and pure (used by the effect)", () => {
    expect(src).toMatch(/export function milestonesForLog\(/);
  });

  it("the celebrate effect is gated on justLoggedRef and clears it before dispatch", () => {
    expect(src).toMatch(/if\s*\(!justLoggedRef\.current\)\s*return;/);
    expect(src).toMatch(/justLoggedRef\.current\s*=\s*false;/);
  });

  it("both logCook and logBranded arm the justLogged flag (remove/restore do NOT)", () => {
    const setTrue = (src.match(/justLoggedRef\.current\s*=\s*true;/g) ?? [])
      .length;
    expect(setTrue).toBe(2);
  });

  it("localStorage is the single once-only dedup source (sous-celebrated-<id>)", () => {
    expect(src).toContain("`sous-celebrated-${m.id}`");
    expect(src).toMatch(/localStorage\.getItem\(seenKey\)/);
    expect(src).toMatch(/localStorage\.setItem\(seenKey,\s*"1"\)/);
  });

  it("the side effect lives in a useEffect keyed on the committed store, not inside setStore", () => {
    const effectIdx = src.indexOf("for (const m of milestonesForLog(store");
    const logCookIdx = src.indexOf("const logCook = useCallback");
    expect(effectIdx).toBeGreaterThan(-1);
    expect(effectIdx).toBeLessThan(logCookIdx);
  });

  it("celebration toasts are the 'achievement' variant", () => {
    expect(src).toMatch(/variant:\s*"achievement"/);
  });
});

describe("diary page — the duplicate page-visit celebration is gone (hook owns it)", () => {
  const src = read(DIARY_PAGE);

  it("no longer imports or calls the milestone/streak celebration", () => {
    expect(src).not.toMatch(/streakMilestone|firstMilestone|milestonesForLog/);
    expect(src).not.toContain("sous-celebrated");
  });

  it("documents that the celebration moved to the tap (regression breadcrumb)", () => {
    expect(src).toMatch(/fires at the moment of the tap/i);
  });
});
