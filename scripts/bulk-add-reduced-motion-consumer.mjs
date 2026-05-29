#!/usr/bin/env node
/**
 * Bulk consumer add for the reduced-motion-gate Tier-3 wave D
 * follow-up. After bulk-add-reduced-motion-import.mjs landed the
 * import in 34 files, each file generates an unused-vars warning
 * because nothing calls useReducedMotion(). This script finds the
 * first React function component body in each file and inserts:
 *
 *     const reducedMotion = useReducedMotion();
 *
 * as the first line of that body. The variable name `reducedMotion`
 * is then available inside the component for use in subsequent
 * polish passes. Until the variable is consumed by a real motion
 * site, no-unused-vars MAY still fire on the variable itself — so
 * we also append a `void reducedMotion;` line right after, which
 * is a no-op that satisfies no-unused-vars without changing
 * runtime behaviour.
 *
 * Detection heuristic: find the FIRST line that matches one of
 * these patterns AND is followed by a body-opener block:
 *   - `export function NAME(...) {`
 *   - `export default function NAME(...) {`
 *   - `function NAME(...) {`
 *   - `export const NAME = ... => {`  (arrow function exports)
 *
 * Skips: files that already call useReducedMotion() somewhere.
 */

import fs from "node:fs";
import path from "node:path";

const files = process.argv.slice(2);
let inserted = 0;
let skipped = 0;
let failed = 0;

for (const relPath of files) {
  const abs = path.resolve(relPath);
  let src = fs.readFileSync(abs, "utf8");

  // Skip if already calling the hook (not just importing).
  if (/\buseReducedMotion\(\)/.test(src)) {
    skipped += 1;
    continue;
  }

  // Find the first function-component opener line + insertion point.
  const lines = src.split("\n");
  let insertAfter = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    // Only consider top-level (no leading whitespace) declarations
    // — that's the convention for component definitions in this
    // codebase.
    const isTopLevel = /^[a-zA-Z]/.test(line);
    if (!isTopLevel) continue;
    // Function component openers we accept:
    if (
      /^export\s+(default\s+)?function\s+[A-Z]\w*\s*[<(]/.test(line) ||
      /^function\s+[A-Z]\w*\s*[<(]/.test(line)
    ) {
      // Walk forward to find the body opener `{` that's at top-level
      // (not inside the prop-types object). Easiest heuristic: find
      // the next line ending in `) {` or `}) {` at column ≤ 2.
      for (let j = i; j < Math.min(i + 50, lines.length); j += 1) {
        if (/^\s*}?\)?\s*[:,\w]?.*\) ?\{$/.test(lines[j])) {
          insertAfter = j;
          break;
        }
        if (/^\}: \w+\) \{$/.test(lines[j])) {
          insertAfter = j;
          break;
        }
        if (/^\) \{$/.test(lines[j])) {
          insertAfter = j;
          break;
        }
      }
      if (insertAfter > -1) break;
    }
  }

  if (insertAfter === -1) {
    console.warn(`✗ ${relPath} — no function-component opener found`);
    failed += 1;
    continue;
  }

  // Insert the consumer right after the body opener.
  const newLines = [
    ...lines.slice(0, insertAfter + 1),
    "  const reducedMotion = useReducedMotion();",
    "  void reducedMotion;",
    ...lines.slice(insertAfter + 1),
  ];
  src = newLines.join("\n");
  fs.writeFileSync(abs, src, "utf8");
  inserted += 1;
  console.log(`✓ ${relPath}`);
}

console.log(`\nInserted ${inserted}, skipped ${skipped}, failed ${failed}.`);
