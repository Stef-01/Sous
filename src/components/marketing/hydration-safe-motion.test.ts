import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Hydration-safe motion guard — marketing landing.
 *
 * Root cause (see commit history around LandingHeroChart): Framer Motion's
 * `useReducedMotion()` returns `null` on the server but the device's real
 * preference on the client's FIRST render (it reads matchMedia synchronously
 * during render). So in a `prefers-reduced-motion` environment it resolves
 * falsy on the server and `true` on the hydration render.
 *
 * A Framer `initial` prop is rendered into the SSR markup (e.g. a motion
 * `pathLength` becomes stroke-dasharray; an opacity/`y` becomes inline style).
 * If `initial` branches on `reduceMotion`, a reduced-motion client hydrates the
 * animated end-state against the server's start-state and React reports a
 * hydration mismatch that "won't be patched up".
 *
 * The invariant: `reduceMotion` may drive `transition` (timing — applied
 * post-hydration, never in SSR markup) but must NEVER appear inside an
 * `initial` prop. To respect reduced motion, zero out the transition
 * (`duration: reduceMotion ? 0 : N`) instead of swapping the initial state.
 *
 * Static (reads source, no render) so it stays in the fast `pnpm test` gate.
 */

const MARKETING_DIR = join(__dirname);

function marketingComponentFiles(): string[] {
  return readdirSync(MARKETING_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => join(MARKETING_DIR, f));
}

/** Extract every brace-balanced `initial={...}` expression body from source. */
function initialExpressions(src: string): string[] {
  const out: string[] = [];
  const re = /initial=\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const start = m.index + m[0].length - 1; // index of the opening `{`
    let depth = 0;
    for (let i = start; i < src.length; i++) {
      const ch = src[i];
      if (ch === "{") depth++;
      else if (ch === "}" && --depth === 0) {
        out.push(src.slice(start, i + 1));
        break;
      }
    }
  }
  return out;
}

describe("marketing landing — hydration-safe motion", () => {
  it("never branches a Framer `initial` prop on reduceMotion", () => {
    const offenders: string[] = [];
    for (const file of marketingComponentFiles()) {
      const src = readFileSync(file, "utf8");
      for (const expr of initialExpressions(src)) {
        if (/\breduceMotion\b/.test(expr)) {
          offenders.push(`${file.split("/").pop()}: initial=${expr}`);
        }
      }
    }
    expect(
      offenders,
      "`initial` is SSR-rendered; branching it on useReducedMotion() (null on " +
        "the server, real on the client's first render) mismatches on hydration " +
        "for reduced-motion users. Drive `transition` instead:\n" +
        offenders.join("\n"),
    ).toEqual([]);
  });

  it("keeps LandingHeroChart's aria ids deterministic (not useId)", () => {
    // The chart is a single instance, so fixed ids can't collide — and unlike
    // useId they're identical on server and client regardless of tree position.
    const src = readFileSync(
      join(MARKETING_DIR, "landing-hero-chart.tsx"),
      "utf8",
    );
    expect(src, "do not reintroduce useId() in the hero chart").not.toMatch(
      /\buseId\s*\(/,
    );
    expect(src).toContain('"landing-hero-chart-title"');
    expect(src).toContain('"landing-hero-chart-live"');
  });
});
