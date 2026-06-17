import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  premiumEntrance,
  motionTransition,
  staggerChildren,
  SPRING,
} from "@/lib/motion/tokens";

/**
 * Track E7 — 60fps + reduced-motion regression guard.
 *
 * The E-track added blur entrances, shadow stacks, and a physics slider — all of
 * which TENSION reduced-motion + 60fps. This locks the contract in the fast
 * `pnpm test` gate (there's no Playwright harness yet; this is the unit-level
 * floor a future e2e layers on). Two rules:
 *  1. Every E-track motion helper collapses to instant/flat under reduced motion.
 *  2. Animating `filter: blur` (GPU-expensive) is FOCAL-ONLY — never a list or
 *     large surface (rule 9). The allowlist below is the sanctioned set.
 */

describe("E-track motion collapses under reduced motion", () => {
  it("premiumEntrance is instant + flat (no blur, no movement)", () => {
    const r = premiumEntrance(true);
    expect(r.initial).toBe(false);
    expect(r.animate).toEqual({ opacity: 1 });
    expect(r.transition).toEqual({ duration: 0 });
  });

  it("the full entrance still blurs in when motion is allowed", () => {
    const r = premiumEntrance(false);
    expect(r.initial).toMatchObject({ filter: "blur(2px)" });
  });

  it("motionTransition collapses any spring to instant", () => {
    expect(motionTransition(SPRING.snappy, true)).toEqual({ duration: 0 });
    expect(motionTransition(SPRING.snappy, false)).toBe(SPRING.snappy);
  });

  it("staggerChildren disables sequencing under reduced motion", () => {
    expect(staggerChildren(true).staggerChildren).toBe(0);
    expect(staggerChildren(false).staggerChildren).toBeGreaterThan(0);
  });
});

describe("animated blur is focal-only (60fps guard)", () => {
  const ROOT = join(__dirname, "..");
  // Sanctioned animated-blur surfaces — all small + focal, none a list/large
  // surface. A NEW file animating blur fails this until added here with reason.
  const ALLOW = new Set<string>([
    "src/lib/motion/tokens.ts", // premiumEntrance helper — focal entrances
    "src/components/guided-cook/glossify.tsx", // term definition tooltip
    "src/components/path/skill-node.tsx", // a single skill-node reveal
  ]);

  // Matches a real CSS/framer blur filter `blur(2px)`, not Tailwind's
  // `backdrop-blur-md` (no paren) or `backdrop-blur-[2px]` (brackets).
  const ANIMATED_BLUR = /[^-]blur\(/;

  function walk(dir: string): string[] {
    let out: string[] = [];
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return out;
    }
    for (const entry of entries) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) out = out.concat(walk(p));
      else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry))
        out.push(p);
    }
    return out;
  }

  it("only the sanctioned focal surfaces animate blur", () => {
    const offenders: string[] = [];
    for (const dir of ["components", "lib/motion"]) {
      for (const file of walk(join(ROOT, dir))) {
        if (ANIMATED_BLUR.test(readFileSync(file, "utf8"))) {
          const rel = file.replace(ROOT, "src");
          if (!ALLOW.has(rel)) offenders.push(rel);
        }
      }
    }
    expect(
      offenders,
      `Animating filter:blur is focal-only (rule 9). Either drop it or, if this IS a small focal surface, add it to the ALLOW set with a reason:\n${JSON.stringify(offenders, null, 2)}`,
    ).toEqual([]);
  });
});
