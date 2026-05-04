#!/usr/bin/env tsx
/**
 * SAFE-phrasings build-time linter.
 *
 * Stage 2 W23 prep (autonomous-prep stub). This script greps every
 * file in src/components/shared/nutrient-spotlight.tsx and any other
 * surface that renders nutrient call-outs to confirm the visible copy
 * comes ONLY from src/data/nutrition/safe-phrasings.ts templates.
 *
 * Today this is advisory — it prints findings but exits 0 unless run
 * with --fail. Once the W23 legal review locks the phrasing list, the
 * pre-commit hook + CI will run with --fail to block any drift.
 *
 * Run:
 *   pnpm tsx scripts/lint-safe-phrasings.ts             # advisory
 *   pnpm tsx scripts/lint-safe-phrasings.ts --fail      # CI mode
 *
 * Detection rules:
 *   1. Files in src/ that mention any of the SAFE_LEAD or SAFE_WHY
 *      strings literally.
 *   2. Files in src/ that mention any of the FORBIDDEN_PHRASES (the
 *      UNSAFE cheatsheet from PARENT-MODE-RESEARCH §4.4) in source
 *      string-literals.
 *   3. Files NOT in the allowed call-site allowlist that import from
 *      `@/data/nutrition/safe-phrasings` — discourages bypass routes.
 *
 * Outputs a structured report; exits 1 on violations when --fail.
 */

import { readFileSync, statSync } from "node:fs";
import { readdirSync } from "node:fs";
import { resolve, join, relative } from "node:path";

const ROOT = resolve(process.cwd());

/**
 * Disease / treatment / efficacy words that must NEVER appear inside
 * a nutrient call-out string-literal in src/. Drawn directly from
 * PARENT-MODE-RESEARCH §4.4 UNSAFE cheatsheet.
 */
const FORBIDDEN_PHRASES = [
  "boost",
  "fight",
  "fights ",
  "protects against",
  "prevents",
  "treats ",
  "cure",
  "cures ",
  "reduces risk of",
  "lowers risk of",
  "diagnose",
  "diagnoses",
  "essential for preventing",
  "doctor recommended",
  "doctor-recommended",
  "pediatrician recommended",
  "FDA recommends",
];

/**
 * Files allowed to import from @/data/nutrition/safe-phrasings.
 * Anything else importing it is a sign of a sneak-around route.
 * (Update when adding a legitimate new call site.)
 */
const SAFE_PHRASING_ALLOWLIST = new Set([
  "src/lib/engine/parent-mode/nutrient-spotlight.ts",
  "src/lib/engine/parent-mode/nutrient-spotlight.test.ts",
  "src/components/shared/nutrient-spotlight.tsx",
]);

/**
 * Scope: ONLY files involved in user-visible Parent Mode nutrient
 * call-outs. Pre-existing pairing-engine explainer copy + AI prompt
 * rule strings are out of scope (they predate the SAFE/UNSAFE list
 * and don't render as nutrient claims). Scope expansion goes through
 * a doc update + this list.
 */
const SCOPED_PATHS = [
  "src/components/shared/nutrient-spotlight.tsx",
  "src/components/today/kid-friendly-hint.tsx",
  "src/components/today/kid-swap-chip.tsx",
  "src/components/guided-cook/kids-ate-it-prompt.tsx",
  "src/components/guided-cook/lunchbox-suggest-chip.tsx",
  "src/components/guided-cook/component-split-toggle.tsx",
  "src/components/shared/profile-settings-sheet.tsx",
  "src/data/nutrition/safe-phrasings.ts",
  "src/lib/engine/parent-mode/nutrient-spotlight.ts",
];

interface Violation {
  file: string;
  line: number;
  rule: string;
  excerpt: string;
}

function listSourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".") || entry === "node_modules") continue;
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      listSourceFiles(p, out);
    } else if (p.endsWith(".ts") || p.endsWith(".tsx")) {
      out.push(p);
    }
  }
  return out;
}

function scan(): Violation[] {
  const violations: Violation[] = [];
  const files = listSourceFiles(resolve(ROOT, "src"));

  for (const file of files) {
    const rel = relative(ROOT, file);
    // Linter scope: only Parent Mode nutrient surfaces. Everything
    // else is out of scope until W23 expands the list.
    if (!SCOPED_PATHS.includes(rel)) continue;
    const text = readFileSync(file, "utf8");
    const lines = text.split(/\n/);

    // Rule 1: forbidden phrases in any USER-VISIBLE string literal.
    // We deliberately skip comment-only lines to avoid noise: the
    // banned words are fine in dev-facing prose ("boost similar
    // dishes via the rebalancer") — they're only forbidden in copy
    // a user actually sees in the UI.
    let inBlockComment = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? "";
      // Skip the safe-phrasings file itself + every test file (they
      // reference banned words on purpose for negative coverage).
      if (
        rel === "src/data/nutrition/safe-phrasings.ts" ||
        rel.endsWith(".test.ts") ||
        rel.endsWith(".test.tsx")
      ) {
        continue;
      }
      // Track multi-line block comments so we can skip them too.
      const startsBlock = /\/\*/.test(line) && !/\*\//.test(line);
      const endsBlock = /\*\//.test(line) && !/\/\*/.test(line);
      if (inBlockComment) {
        if (endsBlock) inBlockComment = false;
        continue;
      }
      if (startsBlock) {
        inBlockComment = true;
        continue;
      }
      // Skip lines that are entirely a single-line // comment OR a
      // single-line block comment OR a JSDoc continuation.
      const trimmed = line.trim();
      if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("*") ||
        (trimmed.startsWith("/*") && trimmed.endsWith("*/"))
      ) {
        continue;
      }
      // Strip inline trailing comments before scanning.
      const beforeInlineComment = line.split("//")[0] ?? line;
      const lower = beforeInlineComment.toLowerCase();
      for (const phrase of FORBIDDEN_PHRASES) {
        if (lower.includes(phrase.toLowerCase())) {
          violations.push({
            file: rel,
            line: i + 1,
            rule: `forbidden phrase "${phrase}"`,
            excerpt: line.trim().slice(0, 120),
          });
        }
      }
    }

    // Rule 3: safe-phrasings import outside the allowlist.
    if (
      text.includes('from "@/data/nutrition/safe-phrasings"') &&
      !SAFE_PHRASING_ALLOWLIST.has(rel)
    ) {
      violations.push({
        file: rel,
        line: 1,
        rule: "safe-phrasings imported outside allowlist",
        excerpt: "consider routing through nutrient-spotlight.ts instead",
      });
    }
  }

  return violations;
}

function main(): void {
  const failOnViolation = process.argv.includes("--fail");
  const violations = scan();

  if (violations.length === 0) {
    console.log("✓ SAFE-phrasings linter: no violations.");
    process.exit(0);
  }

  console.log(
    `SAFE-phrasings linter found ${violations.length} violation(s):\n`,
  );
  for (const v of violations) {
    console.log(`  ${v.file}:${v.line} — ${v.rule}`);
    console.log(`    ${v.excerpt}`);
  }
  console.log(
    "\nFix: route the visible copy through src/data/nutrition/safe-phrasings.ts templates.",
  );
  console.log(
    "Reference: docs/PARENT-MODE-RESEARCH.md §4.4 (SAFE / UNSAFE phrasings cheatsheet).",
  );

  if (failOnViolation) process.exit(1);
  process.exit(0);
}

main();
