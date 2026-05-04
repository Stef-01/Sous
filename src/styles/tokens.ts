/**
 * Design tokens (Y3 W3 — foundation polish).
 *
 * Single source of truth for every CSS custom property the app
 * binds. Components import from here rather than hardcoding
 * `var(--nourish-green)` strings, so:
 *   1. Renames go through one file.
 *   2. Dark-mode swaps the value behind the same token name.
 *   3. Type system catches typo'd token references at build.
 *
 * Tokens are grouped by purpose. The CSS values themselves live
 * in `globals.css`; this file is the typed reference.
 *
 * Pure / dependency-free.
 */

/** ── Color tokens ────────────────────────────────────────── */

export const COLOR_TOKENS = {
  /** Page background. */
  background: "--background",
  /** Default text colour. */
  foreground: "--foreground",
  /** Primary brand green — primary CTA, success, fluency. */
  brandPrimary: "--nourish-green",
  /** Pressed / hover state of brand primary. */
  brandPrimaryPressed: "--nourish-dark-green",
  /** Lighter brand variant — used sparingly for accents. */
  brandPrimarySoft: "--nourish-light-green",
  /** Gold — partial-progress, in-flight. */
  brandWarning: "--nourish-gold",
  /** Warm orange — flame / streak / heat indicators. */
  brandWarm: "--nourish-warm",
  /** Cream surface — page-level muted background. */
  surfaceCream: "--nourish-cream",
  /** Dark text on light backgrounds. */
  textDark: "--nourish-dark",
  /** Input background — set apart from page background. */
  surfaceInput: "--nourish-input-bg",
  /** Muted text — captions, metadata. */
  textSubtle: "--nourish-subtext",
  /** Primary button background. */
  buttonPrimary: "--nourish-button",
  /** Primary button hover. */
  buttonPrimaryHover: "--nourish-button-hover",
  /** Destructive / evaluate-this red. */
  destructive: "--nourish-evaluate",
  /** Destructive hover. */
  destructiveHover: "--nourish-evaluate-hover",
} as const;

export type ColorToken = keyof typeof COLOR_TOKENS;

/** ── Border tokens — three tiers ─────────────────────────── */

export const BORDER_TOKENS = {
  soft: "--nourish-border-soft",
  regular: "--nourish-border",
  strong: "--nourish-border-strong",
} as const;

export type BorderToken = keyof typeof BORDER_TOKENS;

/** ── Shadow tokens ───────────────────────────────────────── */

export const SHADOW_TOKENS = {
  /** Default card lift. */
  card: "--shadow-card",
  /** Raised surface (sheet / modal). */
  raised: "--shadow-raised",
  /** Primary CTA glow. */
  cta: "--shadow-cta",
  /** Primary CTA hover glow. */
  ctaHover: "--shadow-cta-hover",
  /** Subtle 1-px header divider. */
  header: "--shadow-header",
} as const;

export type ShadowToken = keyof typeof SHADOW_TOKENS;

/** ── Typography tokens ───────────────────────────────────── */

export const TYPOGRAPHY_TOKENS = {
  /** Body floor — UI text. */
  body: "--sous-text-body",
  /** Caption / metadata. */
  caption: "--sous-text-caption",
  /** Cook-mode prose floor — read while hands occupied. */
  cook: "--sous-text-cook",
  /** Cook-mode line-height. */
  cookLineHeight: "--sous-leading-cook",
} as const;

export type TypographyToken = keyof typeof TYPOGRAPHY_TOKENS;

/** ── Semantic surface tokens (Y3 W3 additions) ──────────────
 *  These are the new tokens introduced during the W3 audit so
 *  callers can express INTENT ("this is an elevated surface")
 *  rather than the underlying color. Same value as their
 *  primitive counterpart in light mode; different in dark.   */

export const SURFACE_TOKENS = {
  /** Default page-level surface (cream). */
  page: "--nourish-cream",
  /** Elevated surface — cards, sheets. White today, dark-grey
   *  in dark mode. */
  elevated: "--surface-elevated",
  /** Pressed surface — chip / button background when active. */
  pressed: "--surface-pressed",
  /** Inverted — dark on light, light on dark. */
  inverted: "--surface-inverted",
} as const;

export type SurfaceToken = keyof typeof SURFACE_TOKENS;

/** ── Helpers ─────────────────────────────────────────────── */

/** Pure: return the CSS `var(--name)` expression for a token.
 *  Use in `style` props or template strings. */
export function cssVar(name: string): string {
  return `var(${name})`;
}

/** Pure: return a CSS `var(--name)` expression for a typed
 *  token — refuses unknown token names at the type level. */
export function color(token: ColorToken): string {
  return cssVar(COLOR_TOKENS[token]);
}

export function border(token: BorderToken): string {
  return cssVar(BORDER_TOKENS[token]);
}

export function shadow(token: ShadowToken): string {
  return cssVar(SHADOW_TOKENS[token]);
}

export function typography(token: TypographyToken): string {
  return cssVar(TYPOGRAPHY_TOKENS[token]);
}

export function surface(token: SurfaceToken): string {
  return cssVar(SURFACE_TOKENS[token]);
}

/** Pure: union of every token name across all groups. Used by
 *  the W3 audit + by future "find unused tokens" tooling. */
export const ALL_TOKEN_NAMES: ReadonlyArray<string> = [
  ...Object.values(COLOR_TOKENS),
  ...Object.values(BORDER_TOKENS),
  ...Object.values(SHADOW_TOKENS),
  ...Object.values(TYPOGRAPHY_TOKENS),
  ...Object.values(SURFACE_TOKENS),
];
