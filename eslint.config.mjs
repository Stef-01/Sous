import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactCompiler from "eslint-plugin-react-compiler";
import { createRequire } from "node:module";

// CommonJS interop for our custom rules (the rule files are CommonJS so
// they can use `module.exports` — ESLint expects that shape).
const require = createRequire(import.meta.url);
const reducedMotionGate = require("./eslint-rules/reduced-motion-gate.js");

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "react-compiler": reactCompiler,
      sous: {
        rules: {
          "reduced-motion-gate": reducedMotionGate,
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
  ]),
]);

export default eslintConfig;
