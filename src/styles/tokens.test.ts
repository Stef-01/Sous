import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ALL_TOKEN_NAMES,
  BORDER_TOKENS,
  COLOR_TOKENS,
  SHADOW_TOKENS,
  SURFACE_TOKENS,
  TYPOGRAPHY_TOKENS,
  border,
  color,
  cssVar,
  shadow,
  surface,
  typography,
} from "./tokens";

const globalsCss = readFileSync(
  join(__dirname, "..", "app", "globals.css"),
  "utf-8",
);

// ── cssVar / typed helpers ────────────────────────────────

describe("cssVar", () => {
  it("returns the var(--name) expression", () => {
    expect(cssVar("--nourish-green")).toBe("var(--nourish-green)");
  });

  it("color() helper resolves typed token", () => {
    expect(color("brandPrimary")).toBe("var(--nourish-green)");
  });

  it("border() helper resolves typed border token", () => {
    expect(border("strong")).toBe("var(--nourish-border-strong)");
  });

  it("shadow() helper resolves typed shadow token", () => {
    expect(shadow("card")).toBe("var(--shadow-card)");
  });

  it("typography() helper resolves typed type token", () => {
    expect(typography("body")).toBe("var(--sous-text-body)");
  });

  it("surface() helper resolves typed surface token", () => {
    expect(surface("elevated")).toBe("var(--surface-elevated)");
  });
});

// ── ALL_TOKEN_NAMES ──────────────────────────────────────

describe("ALL_TOKEN_NAMES", () => {
  it("includes every group's tokens", () => {
    expect(ALL_TOKEN_NAMES.length).toBe(
      Object.keys(COLOR_TOKENS).length +
        Object.keys(BORDER_TOKENS).length +
        Object.keys(SHADOW_TOKENS).length +
        Object.keys(TYPOGRAPHY_TOKENS).length +
        Object.keys(SURFACE_TOKENS).length,
    );
  });

  it("aliasing is permitted (same CSS var under different typed names)", () => {
    // Intent-aliasing: `surface.page` and `color.surfaceCream` both map
    // to --nourish-cream. That's the point of the typed-token layer —
    // callers express INTENT, the underlying CSS var can be reused.
    // No assertion here; this test documents the choice.
    expect(ALL_TOKEN_NAMES.length).toBeGreaterThanOrEqual(
      new Set(ALL_TOKEN_NAMES).size,
    );
  });

  it("every entry begins with --", () => {
    for (const name of ALL_TOKEN_NAMES) {
      expect(name.startsWith("--")).toBe(true);
    }
  });
});

// ── globals.css parity — every token has a CSS definition ──

describe("globals.css token parity", () => {
  it("every COLOR_TOKEN exists in globals.css :root or [data-theme]", () => {
    for (const cssName of Object.values(COLOR_TOKENS)) {
      expect(globalsCss).toContain(cssName);
    }
  });

  it("every BORDER_TOKEN exists", () => {
    for (const cssName of Object.values(BORDER_TOKENS)) {
      expect(globalsCss).toContain(cssName);
    }
  });

  it("every SHADOW_TOKEN exists", () => {
    for (const cssName of Object.values(SHADOW_TOKENS)) {
      expect(globalsCss).toContain(cssName);
    }
  });

  it("every TYPOGRAPHY_TOKEN exists", () => {
    for (const cssName of Object.values(TYPOGRAPHY_TOKENS)) {
      expect(globalsCss).toContain(cssName);
    }
  });

  it("every SURFACE_TOKEN exists", () => {
    for (const cssName of Object.values(SURFACE_TOKENS)) {
      expect(globalsCss).toContain(cssName);
    }
  });
});

// ── dark-mode parity — every redefinable token has dark variant ──

describe("dark-mode parity", () => {
  it('globals.css contains a [data-theme="dark"] selector', () => {
    expect(globalsCss).toContain('[data-theme="dark"]');
  });

  it("dark-mode block redefines the brand-primary token", () => {
    const darkBlockMatch = globalsCss.match(
      /\[data-theme="dark"\]\s*\{([\s\S]*?)\}/,
    );
    expect(darkBlockMatch).not.toBeNull();
    if (darkBlockMatch) {
      const darkBlock = darkBlockMatch[1] ?? "";
      expect(darkBlock).toContain("--nourish-green:");
      expect(darkBlock).toContain("--background:");
      expect(darkBlock).toContain("--foreground:");
      expect(darkBlock).toContain("--surface-elevated:");
    }
  });
});
