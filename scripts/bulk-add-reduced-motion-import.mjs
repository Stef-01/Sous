#!/usr/bin/env node
/**
 * Bulk import update for the reduced-motion-gate Tier-3 wave D
 * remediation. For each file given on argv:
 *   - replace the framer-motion import line with one that includes
 *     useReducedMotion (idempotent — skip if already present).
 *
 * Does NOT add a hook call — that requires per-file context. This
 * script is just the cheap mechanical part (import update). The
 * follow-up commit adds at-least-one consumer per file.
 *
 * Usage: node scripts/bulk-add-reduced-motion-import.mjs <files...>
 */

import fs from "node:fs";
import path from "node:path";

const files = process.argv.slice(2);
let updated = 0;
let skipped = 0;

for (const relPath of files) {
  const abs = path.resolve(relPath);
  let src = fs.readFileSync(abs, "utf8");

  if (src.includes("useReducedMotion")) {
    skipped += 1;
    continue;
  }

  // Match the framer-motion import line. The 3 variants we've seen
  // across the codebase:
  //   import { motion } from "framer-motion";
  //   import { motion, AnimatePresence } from "framer-motion";
  //   import { AnimatePresence, motion } from "framer-motion";
  // Plus any other ordering. Just inject `useReducedMotion` into the
  // braces if it's not already there.
  const re = /^import\s+\{([^}]+)\}\s+from\s+"framer-motion";\s*$/m;
  const match = src.match(re);
  if (!match) {
    console.warn(`SKIP (no framer-motion import found): ${relPath}`);
    skipped += 1;
    continue;
  }

  const inside = match[1].trim();
  const newInside = inside.endsWith(",")
    ? `${inside} useReducedMotion,`
    : `${inside}, useReducedMotion`;
  const newImport = `import { ${newInside} } from "framer-motion";`;

  src = src.replace(re, newImport);
  fs.writeFileSync(abs, src, "utf8");
  updated += 1;
  console.log(`✓ ${relPath}`);
}

console.log(`\nUpdated ${updated}, skipped ${skipped}.`);
