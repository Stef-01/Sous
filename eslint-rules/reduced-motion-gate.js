/**
 * Custom ESLint rule: `sous/reduced-motion-gate`
 *
 * Enforces the codebase-wide convention from STAGE-3-RETROSPECTIVE.md
 * and `docs/design-tokens.md`: any file that uses framer-motion's
 * `motion.*` JSX components OR `<AnimatePresence>` MUST also import
 * `useReducedMotion` from "framer-motion" (the convention is that
 * every motion site should respect prefers-reduced-motion).
 *
 * Why a rule instead of memory: Stage-3 + Stage-4 already saw
 * 4 separate "I forgot the reducedMotion gate" moments fixed
 * by hand. The rule prevents the next one.
 *
 * Exemptions: files explicitly opt out via:
 *   // eslint-disable-next-line sous/reduced-motion-gate -- <reason>
 * on the offending line.
 *
 * Detection logic:
 *   1. Track whether the file imports framer-motion at all.
 *   2. Track whether `useReducedMotion` is in that import.
 *   3. On any JSX element whose name starts with `motion.` or is
 *      `AnimatePresence`, fire if useReducedMotion isn't imported.
 *
 * Limitations:
 *   - Doesn't enforce that the imported useReducedMotion is actually
 *     CALLED inside the file. That's a separate, weaker check.
 *   - Only inspects JSX usage of motion components, not `motion(Tag)`
 *     functional usage. Covers ~95% of the codebase's motion sites.
 */

"use strict";

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Files using framer-motion `motion.*` or `<AnimatePresence>` JSX must also import `useReducedMotion` so animations respect prefers-reduced-motion.",
      recommended: false,
    },
    messages: {
      missing:
        "This file uses `<{{name}}>` from framer-motion but does not import `useReducedMotion`. Add it to the framer-motion import and gate the animation. See docs/design-tokens.md.",
    },
    schema: [],
  },

  create(context) {
    let importsFramerMotion = false;
    let importsUseReducedMotion = false;
    /** Element nodes deferred until the import scan finishes. */
    const offenders = [];

    return {
      ImportDeclaration(node) {
        if (node.source.value !== "framer-motion") return;
        importsFramerMotion = true;
        for (const spec of node.specifiers) {
          if (
            spec.type === "ImportSpecifier" &&
            spec.imported &&
            spec.imported.name === "useReducedMotion"
          ) {
            importsUseReducedMotion = true;
          }
        }
      },

      JSXOpeningElement(node) {
        const name = node.name;
        if (!name) return;
        let elementName = null;

        // <motion.div>, <motion.span>, etc.
        if (
          name.type === "JSXMemberExpression" &&
          name.object &&
          name.object.type === "JSXIdentifier" &&
          name.object.name === "motion"
        ) {
          elementName = `motion.${name.property?.name ?? "?"}`;
        }
        // <AnimatePresence>
        if (name.type === "JSXIdentifier" && name.name === "AnimatePresence") {
          elementName = "AnimatePresence";
        }

        if (elementName) {
          offenders.push({ node, elementName });
        }
      },

      "Program:exit"() {
        if (!importsFramerMotion) return;
        if (importsUseReducedMotion) return;
        for (const { node, elementName } of offenders) {
          context.report({
            node,
            messageId: "missing",
            data: { name: elementName },
          });
        }
      },
    };
  },
};
