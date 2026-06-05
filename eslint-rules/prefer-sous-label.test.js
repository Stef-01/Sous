/**
 * Unit test for the `sous/prefer-sous-label` ESLint rule.
 *
 * Uses ESLint's RuleTester. Covers: the canonical violation, the
 * accent-color escape (intentional colored eyebrow), the already-migrated
 * case, a partial pattern (missing a token) that must NOT fire, and the
 * `cn()`-arg variant that SHOULD fire when one string carries every token.
 *
 * Run with: pnpm vitest eslint-rules/prefer-sous-label.test.js
 */

import { describe, it } from "vitest";
import { RuleTester } from "eslint";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const rule = require("./prefer-sous-label.js");

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

describe("sous/prefer-sous-label", () => {
  it("passes the RuleTester suite", () => {
    ruleTester.run("prefer-sous-label", rule, {
      valid: [
        {
          // Already migrated — uses the utility.
          code: `export const C = () => <p className="sous-label">Built on</p>;`,
        },
        {
          // Accent-colored eyebrow → intentional, not the neutral role.
          code: `export const C = () => <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-green)]">Food-first evidence</p>;`,
        },
        {
          // Missing `tracking` → not the full pattern, don't fire.
          code: `export const C = () => <p className="text-[10px] uppercase text-[var(--nourish-subtext)]">x</p>;`,
        },
        {
          // Neutral body caption, not uppercase → don't fire.
          code: `export const C = () => <p className="text-[11px] text-[var(--nourish-subtext)]">Fiber 3 g</p>;`,
        },
        {
          // Tokens split across cn() args (no single string has all) → skip.
          code: `import { cn } from "x"; export const C = () => <p className={cn("text-[10px] uppercase", "tracking-wide text-[var(--nourish-subtext)]")} />;`,
        },
      ],
      invalid: [
        {
          // Canonical hand-rolled neutral caps label.
          code: `export const C = () => <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--nourish-subtext-faint)]">Estimated nutrition</p>;`,
          errors: [{ messageId: "prefer" }],
        },
        {
          // Same pattern living inside a cn() arg string.
          code: `import { cn } from "x"; export const C = () => <p className={cn("mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--nourish-subtext)]")}>Sources</p>;`,
          errors: [{ messageId: "prefer" }],
        },
      ],
    });
  });
});
