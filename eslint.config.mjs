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
      // gate. Initially "warn" — pre-rule violations surface in lint
      // output without failing CI; new code that adds motion without
      // a gate is visible immediately. Plan: convert to "error" once
      // the existing violations are remediated (tracked in
      // docs/REDUCED-MOTION-GATE-TODO.md).
      "sous/reduced-motion-gate": "warn",
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
