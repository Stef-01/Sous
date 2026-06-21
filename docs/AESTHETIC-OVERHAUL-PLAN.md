# Aesthetic Overhaul — match the reference mockups, exactly

> Founder directive (2026-06-21): "make aesthetics of the entire app as good as
> these mockups, with the exact same typeface and font." Reference set:
> `~/Downloads/mockups for optimisation` (10 screens of a polished recipe app —
> the "Clove" design language). This doc is the measured spec + the sequenced,
> verifiable execution plan. Optimise for DEPTH; loop continuously.

## 0. Method

Each execution step is **measurable** (a named token/component + a screen) and
**verified live** in the preview against the specific mockup it targets. Foundation
(fonts + tokens) ships first because every screen depends on it; then a shared
component layer; then screen-by-screen. Never a shallow stub — every state.

---

## 1. The reference design system (measured from the 10 mockups)

### 1.1 Typography — THE headline change

The mockups' **headlines are a heavy / black geometric-grotesque SANS**, NOT a
serif. (Sous currently ships **DM Serif Display** for headings — a serif — so this
is the single biggest visible gap.) Evidence: IMG_4833 "Where would you like your
recipes to come from?", IMG_4834 "Do you have any dietary requirements?", IMG_4837
"Featured Meal Plans / Interactive Cookbooks" — all heavy, geometric, no serifs,
~800–900 weight, tight tracking. Body copy is a clean neutral sans (regular/medium).

**Decision:**

- **Display / headings** → `Hanken Grotesk` (Google Fonts, weights 700/800/900) —
  the closest free, self-hostable match to the reference's heavy geometric headline.
  Replaces DM Serif Display. Exposed as a single token `--font-display` so the exact
  licensed brand font (if the founder later supplies one — e.g. a paid grotesque) is
  a one-line swap (rule 11: fonts can be licensed assets).
- **Body** → keep `Inter` (already integrated; a clean neutral sans that matches the
  reference body well).
- Type scale (match the mockups' generous hierarchy): display-xl ~30/1.05/800,
  display-lg ~24/1.1/800, title ~18/1.2/700, body ~15/1.45/400, caption ~13/1.4/500.
  Headlines are tight leading + heavy; body is airy.

### 1.2 Colour

| Role                                              | Mockup                                                   | Current Sous                                                        | Action                                                                      |
| ------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Primary (Save / FAB / selected chip / active nav) | deep forest green ≈ `#1A3D2A`                            | `--nourish-green #2d5a3d` (medium) + `--nourish-dark-green #1a3d25` | Deepen primary to the dark-green; the medium green becomes a secondary/tint |
| Background                                        | white sheets + warm off-white + light-green-tint headers | `--nourish-cream #fafaf8`                                           | Keep cream; add a light-green section tint token for plan headers           |
| Neutral pill (unselected chip / option row)       | light grey ≈ `#F1F1EF`                                   | input-bg `#f0ede8`                                                  | Reuse; add a `--surface-muted` token                                        |
| Subtext                                           | grey ≈ `#6B6B6B`                                         | `--nourish-subtext #595959`                                         | Keep                                                                        |
| Accent — warm/import                              | orange ≈ `#E8833A`                                       | `--nourish-warm #e8833a`                                            | Already matches                                                             |
| Accent — lavender hint card                       | ≈ `#ECEAF7`                                              | —                                                                   | Add `--accent-lavender`                                                     |

### 1.3 Component grammar (recurring across mockups)

- **Recipe card**: rounded-2xl photo; **time pill** bottom-left (white/translucent,
  "35mins"); **bookmark circle** top-right; **title** (heavy sans, 1–2 lines);
  **author row** (small icon/avatar + name). Video → centered play button.
- **Bottom nav**: 5 slots — Home · Library · **center green circular FAB (+)** ·
  Plan · Groceries. Active = filled icon + dark. (Sous today: Today · Path · Content,
  no FAB — a structural difference; adapt the _grammar_, not necessarily the IA.)
- **Stepper**: `−  N  +` in a pill (the "How many serves?" control — now shipped in
  both cook flows).
- **Chips**: rounded-full; unselected = light grey; **selected = deep green + white**.
- **Bottom sheet**: white, rounded-top, drag handle, centered title + X, big heavy
  headline, body, option rows / chip-wrap, full-width green **Save** pill.
- **Ingredient circle**: photo on a grey circle + green check when selected.
- **Section header**: heavy sans + optional `›` affordance ("Featured Meal Plans ›").
- **Ask bar**: bottom, rounded, "Ask…" + voice button (Sous already has this grammar).

### 1.4 Layout / feel

Generous whitespace, rounded-2xl cards, photo-forward, calm. Headlines do the
"premium" work; everything else is quiet and neutral.

---

## 2. Current-state foundation (audit)

- Fonts: `src/app/layout.tsx` — Inter (`--font-inter`/`--font-sans`) + DM Serif
  Display (`--font-serif`). `globals.css:323-324` maps `--font-sans`/`--font-serif`;
  `:241,:249` apply `--font-serif` to headings; `@theme inline :307`.
- Colour tokens: `globals.css:9-47` (`--nourish-*`). Dark-mode overrides `:170+`.
- `font-serif` (the serif) is used across headings app-wide — the swap touches every
  `font-serif` usage but is centralised through the token.

---

## 3. Execution sequence (each step = commit + live-verify)

**Phase F — Foundation (do first; everything depends on it)**

- F1. Add `Hanken Grotesk` via next/font; introduce `--font-display`; repoint the
  heading rules + the `font-serif` Tailwind token → `--font-display`. Keep Inter body.
- F2. Deepen the primary green token; add `--surface-muted`, `--accent-lavender`,
  `--section-tint-green`. Verify contrast (WCAG AA) on cream/white.
- F3. Type-scale utilities (display-xl/lg, title, body, caption) as Tailwind/CSS so
  screens adopt them uniformly.

**Phase C — Shared components (match the grammar once, reuse everywhere)**

- C1. Recipe card (time pill + bookmark circle + heavy title + author row).
- C2. Chip (light/selected-green), Stepper (done), Section header (heavy + ›).
- C3. Bottom-sheet shell (handle + centered title + heavy headline + green Save).

**Phase S — Screen-by-screen (loop; one surface per iteration, verified vs its mockup)**

- S1. Today / home cards · S2. Recipe / cook mission + grab · S3. eat-out ·
  S4. Path · S5. Content · S6. Profile sheet · S7. Doge surfaces · S8. nav/header.
  Each: screenshot current → diff vs mockup grammar → refactor to tokens/components →
  re-screenshot → commit.

**Phase R — Review sweeps**

- Contrast/a11y, reduced-motion, 375×667 no-scroll (rule 10), dark-mode parity.

---

## 4. Guardrails (CLAUDE.md)

- Rule 6/13 minimalism preserved — the overhaul is _visual polish_, not added text.
- Rule 7/11 — no invented images; the exact brand font, if licensed, is founder-gated
  (the `--font-display` token makes it a one-line swap). Hanken Grotesk is the
  free-match default that ships now.
- Keep `pnpm build` + `pnpm test` green; commit every step; verify live.

## 5. Progress log

- 2026-06-21: plan written. Servings fix (combined cook) shipped (e26d6c6).
- _next: Phase F1 — the display-font swap._
