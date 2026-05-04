# Sous Design System

> **Filed:** 2026-05-03 (Y3 W47 — Sprint L design-system docs).
> **Purpose:** Single canonical reference for tokens, primitives,
> and patterns the app uses. New surfaces import from these
> contracts; the WCAG audit, the dark-mode swap, and the motion
> review all touch this layer rather than every component.

---

## 1. Design tokens

### 1.1 Color tokens

Defined in `src/app/globals.css` as CSS custom properties; consumed
via the typed map in `src/styles/tokens.ts`.

Primary palette:

- `--nourish-green` — primary brand, CTAs, success state.
- `--nourish-dark-green` — hover state on green CTAs.
- `--nourish-light-green` — accent, fluency-tier rings.
- `--nourish-gold` — warning, partial-progress, expiring-soon.
- `--nourish-warm` — flame, streak, heat indicators.
- `--nourish-cream` — page-level surface.
- `--nourish-input-bg` — input + skeleton placeholder background.
- `--nourish-dark` — text on light surfaces.
- `--nourish-subtext` — muted text, captions, metadata.
- `--nourish-evaluate` — destructive / dangerous actions.

Borders (three-tier hierarchy):

- `--nourish-border-soft` — subtle dividers (rgba 5%).
- `--nourish-border` — standard divider (rgba 8%).
- `--nourish-border-strong` — emphatic divider (rgba 12%).

Shadows:

- `--shadow-card` — default card lift.
- `--shadow-raised` — sheet / modal elevation.
- `--shadow-cta` — primary CTA glow (green-tinted).
- `--shadow-cta-hover` — primary CTA hover glow.
- `--shadow-header` — 1-px header divider.

Surface tokens (Y3 W3 — semantic intent):

- `--surface-elevated` — elevated card / sheet background. Light = white; dark = dark-grey.
- `--surface-pressed` — chip / button background when active.
- `--surface-inverted` — dark on light, light on dark.

Typed accessor: `color('brandPrimary')` from `src/styles/tokens.ts` returns `var(--nourish-green)` with TS-checked token names.

### 1.2 Motion tokens

Defined in `src/styles/motion.ts`.

Duration scale (5 tiers, seconds):

- `instant: 0.06` — tap feedback, hover transitions.
- `fast: 0.12` — chip toggles, accordion expand.
- `normal: 0.18` — card-appear, sheet-slide.
- `slow: 0.32` — celebrations, hero reveals.
- `slower: 0.6` — page transitions, full-screen takeovers.

Easing tokens (5 named cubic-beziers): `standard`, `decelerate`, `accelerate`, `linear`, `sharp`.

Spring tokens (3 framer-motion configs): `standard` (260/25), `snappy` (400/15), `gentle` (200/30).

Reduced-motion gate: `withReducedMotion(duration, prefersReducedMotion)` returns 0 when the user's OS preference is set.

### 1.3 Typography

`--sous-text-body` (15px), `--sous-text-caption` (12px), `--sous-text-cook` (17px), `--sous-leading-cook` (1.55).

`big-hands` mode bumps body to 17px and cook to 20px via `[data-big-hands="true"]` selector.

Font families: Inter (sans), DM Serif Display (serif).

### 1.4 Dark-mode prep

Y3 W3 designed every primitive token's dark variant under `[data-theme="dark"]`. The toggle hook lives at `src/lib/hooks/use-theme.ts`. Dark mode is NOT enabled in production by default; opt-in via `ThemeChoice = "dark"`.

---

## 2. Reusable component primitives

### 2.1 MadeItRing — `src/components/shared/made-it-ring.tsx`

UX-recon pattern #10. Three-state SVG progress ring (empty / partial / full) driven by `count + target` props.

Props: `count`, `target`, `size?`, `centerGlyph?`, `ariaLabel?`, `className?`.

Used by: cuisine cards, pod gallery member strip, recipe-detail rings (planned), bake-sale recipe rings (planned).

WCAG: `role='img'` with descriptive `aria-label`. SVG strokes meet 3:1 contrast against page background.

### 2.2 IngredientPantryDot — `src/components/shared/ingredient-pantry-dot.tsx`

Three-state pantry-status dot (have / low / missing). Used inline before each ingredient in recipe surfaces.

Props: `status`, `daysToExpiration?`, `optional?`, `className?`.

Used by: cook flow Grab phase, daily novelty chip ingredient list, future recipe-detail surfaces.

WCAG: `role='img'` with status-narrating `aria-label` (e.g. "Low or expiring soon in pantry — expires in 1 day").

### 2.3 RecipeHeroCard — `src/components/shared/recipe-hero-card.tsx`

UX-recon patterns #1 + #2 + #3 + #4 in one component. Locked 16:10 hero image, eyebrow caps, serif title, meta strip, absolute-positioned save corner.

Props: `slug`, `title`, `eyebrow`, `imageUrl`, `prepTimeMinutes`, `ingredientCount`, `pantryCoverage?`, `spiceLevel?`, `saved`, `onToggleSave`, `highlighted?`, `href?`, `className?`.

Used by: bake-sale recipe carousel (planned wire-up), `/path/recipes` featured row (planned), swipe planner cards (currently use inline render — migration is a follow-up commit).

### 2.4 EmptyState — `src/components/shared/empty-state.tsx`

Y3 W30. Reusable empty-state component with `warm` (cold-start surfaces) + `subtle` (in-list filter result none) tones.

Props: `icon`, `headline`, `body?`, `primaryAction?`, `tone?`, `className?`.

WCAG: `role='status'` for non-disruptive announcement.

### 2.5 SkeletonCard — `src/components/shared/skeleton-card.tsx`

Y3 W42. Three variants (card, list-item, avatar-row). Reduced-motion safe (animate-pulse drops when preference set). `aria-hidden` so SR users don't hear shimmer announcements.

### 2.6 ErrorState — `src/components/shared/error-state.tsx`

Y3 W43. Three tiers (recoverable, degraded, blocking) with appropriate `role` + `aria-live`. Retry + secondary-action slots.

### 2.7 TapFeedback / ChipFeedback — `src/components/shared/tap-feedback.tsx`

Y3 W40. Standard tap-feedback springs over framer-motion. Reduced-motion gates the whileTap effect entirely.

---

## 3. Pure helpers (data layer)

### 3.1 Pantry layer

- `pantry-coverage.ts` — coverage math (have / total / missing).
- `ingredient-pantry-status.ts` — per-line status decision.
- `photo-pipeline.ts` — haul-shot detection + confirmation state machine.
- `item-class.ts` — 27-class taxonomy + freshness/expiration helpers.

### 3.2 Engine layer

- `pairing-engine.ts` — V2 trainer (Y1) + V3 trainer (Y2) blended.
- `time-rerank.ts` + `seasonal-tags.ts` — Sprint C reranker.
- `cook-again.ts` — Y2 W13 + Y3 W6 highlight tier.
- `peak-end-anchor.ts` — Y2 W26 win-screen overlay.
- `novelty.ts` + `dish-shape-patterns.json` (16 patterns) — daily novelty engine.
- `aroma-pairing.ts` + `aroma-profiles.json` (12 profiles) — Y3 W17 substrate, wire-up at future commit.
- `novelty-eval.ts` — synthetic-cohort threshold sensitivity sweep.

### 3.3 Recipe layer

- `big-batch.ts` + `big-batch-tags.json` (8 starter recipes) — leftovers successor matching.
- `voice-to-draft.ts` — Y2 W32 voice authoring pipe.
- `attention-pointer.ts` + `pointer-sequence.ts` — Y2 sequenced reveal substrate.

### 3.4 Planner layer (Y3 H2)

- `meal-plan.ts` (Zod schemas) + `use-meal-plan-week.ts` (persistent hook).
- `swipe-pool.ts` — card pool generator with coverage + dietary + recency + rotation + ease ranking.
- `planner/week-calendar.tsx` — reusable WeekCalendar render.

### 3.5 Voice layer

- `parse-intent.ts` — cook-mode voice command classifier.
- `step-recall.ts` — bounded Q&A over recipe steps.
- `conversation-fallback.ts` — Anthropic LLM escalation with bounded prompt + off-list rejection.
- `silence-detector.ts` — voice-input silence gate.
- `mic-visual-state.ts` — three-state mic icon driver.

### 3.6 Pod layer

- `agentic-picker.ts` — weekly recipe pick (stub mode + real-mode contract).
- `weekly-pick-trigger.ts` — Monday-morning cron-equivalent + race-safe token.
- `twist-vote.ts` — vote tally + streak detector.
- `pod-week-rings.ts` — per-member ring strip rows.

### 3.7 Charity layer

- `charity.ts` (Zod schemas).
- `nonprofits.json` (12 placeholder nonprofits).
- `stripe-charge.ts` — charge dispatcher with idempotency.
- `donation-display.ts` — formatter + identity badge.
- `bake-sale.ts` — pod shopping list aggregator + role round-robin.

---

## 4. Surface inventory (Y3 W47)

| Route                     | Status   | Key primitives used                               |
| ------------------------- | -------- | ------------------------------------------------- |
| `/today`                  | Polished | DailyNoveltyChip, TodayPlannedSlot, CookAgainChip |
| `/today/search`           | Live     | EyebrowCaps + ChipFeedback (filter chips)         |
| `/path`                   | Polished | (Path tab landing — links into subroutes)         |
| `/path/cuisines`          | Live     | MadeItRing, EmptyState                            |
| `/path/recipes`           | Live     | Pantry-coverage badge (W29)                       |
| `/path/recipes/new`       | Live     | RecipeForm (existing)                             |
| `/path/recipes/[id]/edit` | Live     | RecipeForm                                        |
| `/path/scrapbook`         | Live     | ScrapbookEntryCard (existing)                     |
| `/path/household`         | Live     | MemberCard (existing)                             |
| `/path/pantry`            | Live     | (zone grouping — opportunistic Y4 polish)         |
| `/path/pantry/scan`       | Live     | Stub-mode haul-shot flow (W13)                    |
| `/path/plan`              | Live     | Swipe surface (W26)                               |
| `/path/plan/week`         | Live     | WeekCalendar (W27)                                |
| `/path/shopping-list`     | Live     | EmptyStateCTA (existing)                          |
| `/cook/[slug]`            | Polished | StepCard, IngredientList with pantry dots         |
| `/community/pod`          | Polished | Pod gallery ring strip (W2)                       |
| `/community`              | Live     | Tag cloud, content tiles (Stage 3 lean)           |

---

## 5. UX-recon framework patterns

12-pattern library lives in `docs/UX-RECON-FRAMEWORK.md`. Y3 added landed-pattern coverage:

| #   | Pattern               | Y3 status                                                           |
| --- | --------------------- | ------------------------------------------------------------------- |
| 1   | Hero card             | RecipeHeroCard reusable (W4); inline on Mission step + Today stack. |
| 2   | Eyebrow caps          | Across cuisines, search results, hero card, Mission step.           |
| 3   | Meta strip            | Hero card built-in; recipes list (W29).                             |
| 4   | Save corner           | RecipeHeroCard built-in.                                            |
| 5   | Servings stepper      | Deferred — Y4 polish week.                                          |
| 6   | Step-by-step progress | Cook flow already had it pre-Y3 (Y2 W23-W25).                       |
| 7   | Step-locked prog.     | Linked to #6.                                                       |
| 8   | Ingredient checklist  | IngredientList with pantry dots (W4-wire).                          |
| 9   | Filter chips          | Search results page (W4).                                           |
| 10  | Made-it ring          | Cuisines (W1), Pod gallery (W2).                                    |
| 11  | Identity strip        | Cuisines page (W1), Today rhythm widget (Y2).                       |
| 12  | Variable-reward       | Daily novelty chip (W8), cook-again highlight tier (W6).            |

---

## 6. WCAG 2.1 AA audit (carries from W44)

Single audit list in `docs/y3/sprints/K/IDEO-REVIEW.md`. Re-audit cadence: every Sprint K-equivalent (W41-W44 each year).

Continuing items (Y4 polish-week candidates):

- Cook flow Step + Win screen migration to shared primitives.
- Recipe-authoring forms (`/path/recipes/new`, `/.../edit`) inline error state migration.
- Profile sheet primitives migration.

---

## 7. How to add a new component

1. **Reuse first.** Check sections 2 and 3 above. If a primitive covers 80% of the need, extend it rather than duplicating.
2. **Token, don't hardcode.** Color through `color()`, motion through `duration()/spring()`, surface through `surface()`. Hardcoded values fail the W3 dark-mode swap.
3. **Pure helper first.** Engine logic goes in `lib/...`; React component only wraps it. Test the helper independently.
4. **Reduced-motion gate.** Any animation must check `useReducedMotion()` and either skip or shorten. Lint rule from Y1 catches the obvious cases.
5. **WCAG by construction.** `aria-label` on icons, `role='status'` or `role='alert'` on dynamic state, focus rings via the standard token classes, color is never the only signal.
6. **Empty + loading + error states.** Use EmptyState / SkeletonCard / ErrorState. Three states per surface is the floor; test all three.
7. **Tests.** Pure helpers ship with vitest tests. Components are visually verified during the polish week + audited during Sprint K.
8. **Substrate-first if founder-gated.** Ship the helper layer + stub mode FIRST. Real-mode wire-up lands at the founder-key day. Same pattern as Y2 W1 auth, Y2 W3 R2 photo pipeline, Y2 W7 V3 trainer, Y2 W28 voice conversation, Y2 W35 pod picker, Y2 W39 search, Y2 W41 viral extraction, Y2 W49 Stripe.

---

## 8. Process commitments (carried from CLAUDE.md + Y2 plan)

1. **Substrate-first.** Helper before render; stub before real mode.
2. **0 RCAs on main.** ~72-week streak at Y3 W44; target ~95+ at Y3 close.
3. **Four-gate.** lint + typecheck + test + build green at every commit.
4. **Critical-appraise → plan → build → improve.** Every week's work goes through the cycle.
5. **3x recursive testing.** Loop 1 stress + edge, Loop 2 RCA, Loop 3 polish.
6. **Per-feature screenshot flow.** Six PNGs per MVP feature.
7. **Bi-weekly IDEO reviews.**
8. **UX-recon discipline.** Per-sprint primary pattern named.
9. **Stanford content acquisition.** 1-2 hours/week.

---

## 9. Y4 carryover (founder-gated work)

Six unique config edits unlock 11+ Y2-Y3 substrates simultaneously: Clerk + Postgres + R2 + VAPID + Anthropic + Tavily + Stripe. The Y4 plan (filed Y3 W51) sequences these as one-config-edit-per-day.

This design system stays unchanged across the Y3→Y4 transition. The reach phase brings real data to the trained engines, real distribution channels (iOS/Android), and real editorial partnerships — but the visual + interaction layer continues compounding from this foundation.
