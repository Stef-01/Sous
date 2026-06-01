import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Radius-family guard — planning.md "Design Polish Overhaul", acceptance G3.
 *
 * Cards must read as ONE radius family: the four `--radius-*` tokens, applied
 * as `rounded-[var(--radius-lg)]` etc. — not ad-hoc `rounded-[26px]` literals
 * that drift card to card. Tailwind's `rounded-xl`/`2xl`/`full` are fine (they
 * already equal `--radius-sm`/`md`/`pill`); only arbitrary *pixel* literals are
 * banned. This test fails if a main-UI surface reintroduces one.
 *
 * Static + node-env (no browser), so it's part of the fast `pnpm test` gate.
 */

const ROOT = join(__dirname, "..");

const MAIN_UI_DIRS = [
  "components/today",
  "components/path",
  "components/content",
  "components/guided-cook",
  "components/results",
  "app/(today)",
  "app/(path)",
  "app/(community)",
  "app/sides",
  "app/cook",
];

// Matches rounded-[22px] and side variants like rounded-tl-[12px]; does NOT
// match rounded-[var(--radius-lg)] (no px) or rounded-[3rem] (rem unit).
const ARBITRARY_PX_RADIUS = /rounded-(?:\w+-)?\[[0-9.]+px\]/g;

function walk(dir: string): string[] {
  let out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(p);
  }
  return out;
}

describe("radius family — no arbitrary px radii in main UI", () => {
  it("every main-UI component uses the --radius-* family, not rounded-[Npx]", () => {
    const offenders: { file: string; matches: string[] }[] = [];
    for (const rel of MAIN_UI_DIRS) {
      let files: string[];
      try {
        files = walk(join(ROOT, rel));
      } catch {
        continue; // directory may not exist on a partial checkout
      }
      for (const file of files) {
        const matches = readFileSync(file, "utf8").match(ARBITRARY_PX_RADIUS);
        if (matches) {
          offenders.push({ file: file.replace(ROOT, "src"), matches });
        }
      }
    }
    expect(
      offenders,
      `Use the --radius-* family (e.g. rounded-[var(--radius-lg)]) instead of px literals:\n${JSON.stringify(offenders, null, 2)}`,
    ).toEqual([]);
  });
});
