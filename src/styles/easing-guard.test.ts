import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Easing + depth-token guard — Track E1 ("Token completion + guards").
 *
 * Two rules, both static (node-env, part of the fast `pnpm test` gate):
 *  1. Main-UI components must NOT hand-roll a raw `cubic-bezier(` — use the
 *     house `--ease-*` CSS tokens or the `EASE` JS scale, so timing stays
 *     consistent and the "banned default ease" can be enforced in one place.
 *  2. globals.css must ship the full E1 token set (the two new easings, the
 *     hairline-ring layer, and the premium entrance) so a refactor can't
 *     silently drop the vocabulary the whole UI now leans on.
 */

const ROOT = join(__dirname, "..");

const MAIN_UI_DIRS = [
  "components/today",
  "components/path",
  "components/content",
  "components/guided-cook",
  "components/results",
  "components/nutrition",
  "components/planner",
  "components/shared",
  "app/(today)",
  "app/(path)",
  "app/(community)",
  "app/(nutrition)",
  "app/cook",
];

const RAW_CUBIC_BEZIER = /cubic-bezier\(/g;

function walk(dir: string): string[] {
  let out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(p);
  }
  return out;
}

describe("easing tokens — no raw cubic-bezier in main UI (E1)", () => {
  it("components use the --ease-* / EASE tokens, never a raw cubic-bezier()", () => {
    const offenders: { file: string; matches: string[] }[] = [];
    for (const rel of MAIN_UI_DIRS) {
      let files: string[];
      try {
        files = walk(join(ROOT, rel));
      } catch {
        continue; // directory may not exist on a partial checkout
      }
      for (const file of files) {
        const matches = readFileSync(file, "utf8").match(RAW_CUBIC_BEZIER);
        if (matches)
          offenders.push({ file: file.replace(ROOT, "src"), matches });
      }
    }
    expect(
      offenders,
      `Use the house easings (--ease-out / --ease-spring or EASE.*) instead of raw cubic-bezier():\n${JSON.stringify(offenders, null, 2)}`,
    ).toEqual([]);
  });
});

describe("globals.css ships the E1 token set", () => {
  const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");

  it("defines the two new easings", () => {
    expect(css).toContain("--ease-in-out: cubic-bezier(0.66, 0, 0.34, 1)");
    expect(css).toContain("--ease-spring: cubic-bezier(0.35, 1.55, 0.65, 1)");
  });

  it("defines a hairline-ring layer for the border→ring sweep", () => {
    expect(css).toContain("--ring-hairline:");
  });

  it("ships the premium entrance (keyframe + utility + reduced-motion gate)", () => {
    expect(css).toContain("@keyframes entrance-premium");
    expect(css).toMatch(/\.entrance-premium\s*\{/);
    // the entrance must blur in (the premium tell) …
    expect(css).toMatch(/entrance-premium[\s\S]*?blur\(2px\)/);
    // … and be disabled under reduced motion.
    expect(css).toMatch(
      /prefers-reduced-motion[\s\S]*?\.entrance-premium\s*\{\s*animation:\s*none/,
    );
  });

  it("keeps card depth layered (a hairline ring + soft layers), not one heavy drop", () => {
    // the light --shadow-card should carry the 0.5px ring layer
    expect(css).toMatch(/--shadow-card:\s*\n?\s*0 0 0 0\.5px/);
  });
});
