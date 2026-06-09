import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactCompiler from "eslint-plugin-react-compiler";
import { createRequire } from "node:module";

// CommonJS interop for our custom rules (the rule files are CommonJS so
// they can use `module.exports` — ESLint expects that shape).
const require = createRequire(import.meta.url);
const reducedMotionGate = require("./eslint-rules/reduced-motion-gate.js");
const preferSousLabel = require("./eslint-rules/prefer-sous-label.js");

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "react-compiler": reactCompiler,
      sous: {
        rules: {
          "reduced-motion-gate": reducedMotionGate,
          "prefer-sous-label": preferSousLabel,
        },
      },
    },
    rules: {
      "react-compiler/react-compiler": "warn",
      // Custom: catch any motion site missing the useReducedMotion
      // gate. Started as "warn" with 284 pre-existing violations.
      // After Tier-1 → Tier-3 wave D remediation cleared them all,
      // flipped to "error" so any new motion code that lacks the
      // gate fails CI. Acceptance gate from
      // docs/REDUCED-MOTION-GATE-TODO.md hit on 2026-05-02.
      "sous/reduced-motion-gate": "error",
      // Custom: keep neutral uppercase labels on the .sous-label role
      // instead of hand-rolling text-[..px]+uppercase+tracking+subtext.
      // Added 2026-06 after a 6-round aesthetic sweep converged 62
      // ad-hoc copies onto the utility; this stops the next one.
      "sous/prefer-sous-label": "error",
    },
  },
  {
    // The prefer-sous-label rule's own test fixtures intentionally contain
    // the ad-hoc neutral-label pattern as input strings; don't lint them
    // against the rule they exist to exercise.
    files: ["eslint-rules/**"],
    rules: {
      "sous/prefer-sous-label": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Claude Code worktrees — duplicate source trees that pollute lint
    ".claude/**",
    // Third-party agent skills — not our code to lint
    ".agents/**",
    "skills/**",
    // Standalone utility scripts (CommonJS, not part of the app)
    "grants/**",
    "scripts/**",
    // Auto-generated data (carries its own blanket eslint-disable, which lint
    // then flags as "unused" when the generated output is clean — flaky gate).
    "src/data/guided-cook-summary.ts",
  ]),
]);

export default eslintConfig;
