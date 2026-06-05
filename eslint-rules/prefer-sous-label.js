/**
 * Custom ESLint rule: `sous/prefer-sous-label`
 *
 * Enforces the type-scale convention from `src/app/globals.css`: a neutral
 * uppercase "section / eyebrow label" must use the `.sous-label` utility
 * rather than re-inlining its tokens ad-hoc. `.sous-label` IS
 * `text-[11px] (var --text-label) + uppercase + tracking-[0.08em] +
 * font-semibold + text-[var(--nourish-subtext)]`, and the codebase had
 * ~63 hand-rolled copies of it rendered ~10 slightly-different ways
 * (10/10.5/11/12px, medium/semibold/bold, tracking wide/0.08/0.12/0.15).
 *
 * Why a rule instead of memory: the same drift that produced the
 * reduced-motion-gate rule produced this one. A 6-round aesthetic sweep
 * converged every neutral caps label onto `.sous-label`; this rule keeps
 * the next hand-rolled copy from re-introducing the drift.
 *
 * What it flags: a string literal (className or a string inside `cn(...)`)
 * that, on its own, contains ALL of:
 *   - a `text-[10px]` / `text-[10.5px]` / `text-[11px]` / `text-[12px]` size
 *   - `uppercase`
 *   - a `tracking-*` utility
 *   - a NEUTRAL color: `text-[var(--nourish-subtext)]` or `-subtext-faint`
 * and NONE of:
 *   - an accent color (green/gold/warm/etc.) — those are intentional
 *     colored eyebrows, not the neutral label role.
 *   - `sous-label` already present.
 *
 * Deliberately conservative (same philosophy as reduced-motion-gate):
 *   - Only fires when one string carries every token, so labels whose
 *     tokens are split across `cn()` args are not flagged (avoids false
 *     positives at the cost of a few misses).
 *   - Genuine data-captions in tight numeric grids (e.g. the 4-col macro
 *     <dt>) keep their faint-under-number hierarchy and opt out via:
 *       // eslint-disable-next-line sous/prefer-sous-label -- <reason>
 */

"use strict";

const SIZE = /text-\[1[012](\.[0-9])?px\]/;
const CAPS = /(?:^|[\s"'`])uppercase(?:[\s"'`]|$)/;
const TRACK = /(?:^|[\s"'`])tracking-/;
const NEUTRAL = /text-\[var\(--nourish-subtext(?:-faint)?\)\]/;
const ACCENT =
  /(nourish-green|nourish-gold|nourish-warm|emerald|amber|red-[0-9]|pink-|blue-|text-white|nourish-cream|nourish-dark|orange|yellow|sky-|teal)/;
const ALREADY = /(?:^|[\s"'`])sous-label(?:[\s"'`]|$)/;

/** Does this raw class string re-implement the neutral .sous-label role? */
function isAdHocNeutralLabel(str) {
  if (typeof str !== "string") return false;
  if (!SIZE.test(str)) return false;
  if (!CAPS.test(str)) return false;
  if (!TRACK.test(str)) return false;
  if (!NEUTRAL.test(str)) return false;
  if (ACCENT.test(str)) return false;
  if (ALREADY.test(str)) return false;
  return true;
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Neutral uppercase labels must use the `.sous-label` utility instead of re-inlining text-[..px] + uppercase + tracking + subtext.",
      recommended: false,
    },
    messages: {
      prefer:
        'Neutral uppercase label re-implements the `.sous-label` role. Use `className="sous-label"` (plus any layout classes) instead of inlining text-[..px] + uppercase + tracking + subtext. See `.sous-label` in globals.css.',
    },
    schema: [],
  },

  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        if (isAdHocNeutralLabel(node.value)) {
          context.report({ node, messageId: "prefer" });
        }
      },
      // Class strings often live in `cn("...")` template/template-less
      // args; also catch plain template literals with no expressions.
      TemplateLiteral(node) {
        if (node.expressions.length > 0) return; // split across exprs → skip
        const raw = node.quasis.map((q) => q.value.cooked ?? "").join("");
        if (isAdHocNeutralLabel(raw)) {
          context.report({ node, messageId: "prefer" });
        }
      },
    };
  },
};
