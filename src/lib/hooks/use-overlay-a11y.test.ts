import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as overlayA11y from "./use-overlay-a11y";

/**
 * Overlay a11y contract guard.
 *
 * The hand-rolled bottom-sheet modals (the ones NOT built on Vaul, which
 * handles this natively) must keep their full keyboard/focus contract so it
 * doesn't silently regress when someone edits them: body scroll-lock,
 * Escape-to-close, role=dialog + aria-modal dialog semantics, and a focus-trap
 * (focus moves in on open, Tab/Shift+Tab cycle inside, focus restored on
 * close). Backed by src/lib/hooks/use-overlay-a11y.ts and verified live in
 * 2026-06 on SkillDetailSheet (focus-in, Tab-wrap both ends, Escape-restore).
 *
 * Static (reads source, no DOM) so it runs in the node test environment like
 * the Today simplicity-budget and Path hierarchy guards.
 */

const SRC_ROOT = join(__dirname, "..", "..");

const HAND_ROLLED_OVERLAYS = [
  "components/path/skill-detail-sheet.tsx",
  "components/results/EvaluateSheet.tsx",
  "components/today/more-options-sheet.tsx",
  "components/path/achievements-launcher.tsx",
  "components/community/demo-challenge-picker.tsx",
];

describe("use-overlay-a11y module", () => {
  it("exports the three overlay hooks as functions", () => {
    expect(typeof overlayA11y.useBodyScrollLock).toBe("function");
    expect(typeof overlayA11y.useDismissOnEscape).toBe("function");
    expect(typeof overlayA11y.useFocusTrap).toBe("function");
  });
});

describe("hand-rolled overlay a11y contract", () => {
  for (const rel of HAND_ROLLED_OVERLAYS) {
    describe(rel, () => {
      const src = readFileSync(join(SRC_ROOT, rel), "utf8");

      it("locks background scroll while open", () => {
        expect(src).toMatch(/useBodyScrollLock\(/);
      });

      it("traps focus (focus-in / cycle / restore)", () => {
        expect(src).toMatch(/useFocusTrap\(/);
      });

      it("makes its dialog container focusable for the trap", () => {
        expect(src).toMatch(/tabIndex=\{-1\}/);
      });

      it("is dismissible by the Escape key", () => {
        // Either the shared hook or a manual Escape keydown handler.
        const hasEscape =
          /useDismissOnEscape\(/.test(src) || /["']Escape["']/.test(src);
        expect(hasEscape).toBe(true);
      });

      it("exposes dialog semantics to assistive tech", () => {
        expect(src).toMatch(/role="dialog"/);
        expect(src).toMatch(/aria-modal="true"/);
      });
    });
  }
});
