/**
 * Unit test for the `sous/reduced-motion-gate` ESLint rule.
 *
 * Uses ESLint's RuleTester (the standard pattern). Two positive +
 * two negative cases cover the happy path, the AnimatePresence
 * branch, and the no-import escape hatch.
 *
 * Run with: pnpm vitest eslint-rules/reduced-motion-gate.test.js
 */

import { describe, it } from "vitest";
import { RuleTester } from "eslint";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const rule = require("./reduced-motion-gate.js");

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

describe("sous/reduced-motion-gate", () => {
  it("passes the RuleTester suite", () => {
    ruleTester.run("reduced-motion-gate", rule, {
      valid: [
        {
          // Happy path: imports useReducedMotion alongside motion.
          code: `
            import { motion, useReducedMotion } from "framer-motion";
            export function C() {
              const r = useReducedMotion();
              return <motion.div animate={{ opacity: r ? 1 : 0 }} />;
            }
          `,
        },
        {
          // No framer-motion import at all → rule doesn't apply.
          code: `
            export function C() {
              return <div />;
            }
          `,
        },
        {
          // Imports framer-motion + useReducedMotion but uses
          // AnimatePresence too — both gated by the same import.
          code: `
            import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
            export function C({ open }) {
              useReducedMotion();
              return (
                <AnimatePresence>
                  {open && <motion.div />}
                </AnimatePresence>
              );
            }
          `,
        },
      ],
      invalid: [
        {
          // Imports motion but NOT useReducedMotion → flagged.
          code: `
            import { motion } from "framer-motion";
            export function C() {
              return <motion.div animate={{ opacity: 1 }} />;
            }
          `,
          errors: [{ messageId: "missing" }],
        },
        {
          // Imports AnimatePresence (no useReducedMotion) → flagged.
          code: `
            import { AnimatePresence, motion } from "framer-motion";
            export function C({ open }) {
              return (
                <AnimatePresence>
                  {open && <motion.span />}
                </AnimatePresence>
              );
            }
          `,
          // Two violations: AnimatePresence + motion.span.
          errors: [{ messageId: "missing" }, { messageId: "missing" }],
        },
      ],
    });
  });
});
