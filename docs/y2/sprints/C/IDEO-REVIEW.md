# Y2 Sprint C (W11-W14) — Time/season reranker + Cook-again + first recon-driven UX upgrade

> **Plan ref:** `docs/YEAR-2-VIBECODE-PLAN.md` Sprint C
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #5 (W11+W12) + #6 (W13+W14) absorbed into
> this sprint close.

## Build state at review

- Latest commit on main: `5ef7747` (Y2 W13 cook-again + Today chip).
- Test count: **1309** (was 1209 at Sprint B close — **+100 this sprint**).
- Four-gate green: `pnpm lint` ok, `pnpm exec tsc --noEmit` ok,
  `pnpm test` ok (1309/1309), `pnpm build` ok.

## What landed in Sprint C

| Week | Output                                                                                                                                                                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W11  | Time-of-day rerank substrate — pure helpers (`inferSeason`, `inferTimeOfDay`, `computeAdjustment`, `applyTimeOfDayRerank`); 42 tests; opt-in wire-up to `pairing-engine.ts`      |
| W11  | **Recon-driven UX upgrade** — Today result-stack hero card (UX-RECON-FRAMEWORK patterns #1 + #2 + #3 + #4); 96px image, eyebrow caps, time-effort meta strip, save-corner toggle |
| W11  | UX-RECON-FRAMEWORK.md — 12-pattern library, sprint-by-sprint mapping, IP-clean rule, 3-clause acceptance contract                                                                |
| W11  | YEAR-2-VIBECODE-PLAN workstream 3.7 added (UX recon discipline)                                                                                                                  |
| W12  | Seasonal-tag derivation — `deriveSeasonalTags` scans tag/desc hints (soup→winter-warming, salad→summer-fresh, etc.); 27 tests; rerank wire-up                                    |
| W13  | Cook-again memory pick — `pickReSuggestion(history, now)`; recency × seasonality × cuisine-rotation scoring; 31 tests                                                            |
| W13  | `CookAgainChip` Today surface — anchoring overlay ("you rated 5 stars 5 weeks ago"); calm aesthetic, gold accent vs RepeatCookChip's green                                       |
| W14  | Sprint C close + IDEO #5 + #6 (this doc)                                                                                                                                         |

5 production commits + 1 docs commit (this).

## V11/V12/V13 effect summary

The three engine commits compound nicely. A candidate's
final score now stacks four signals:

1. The base 6-dim engine score (Y1 W30 V2 trainer)
2. Y2 W7 V3 per-dimension trainer (gated off — see Sprint B)
3. W11 time-of-day nudge (±0.07 max) — rules-based season/time
4. W12 derived season tags (the +0.02 inside W11 now fires for
   sides whose generic tags imply a season, not just sides
   tagged with explicit "winter-warming" etc.)

Plus the Today surface gains the W13 cook-again chip — a memory
pick for 5-star recipes from 21-90 days ago, scored by recency
(triangular peak at 35d) × seasonality fit × cuisine rotation.

## UX-recon target hit (Sprint C primary)

**Surface:** Today result-stack card.
**Patterns landed:** #1 hero recipe card · #2 eyebrow categorisation · #3 time-effort-trust meta strip · #4 save-corner heart.
**Implementation discipline followed:**

- Pattern observation: documented across the food-app category
  (Serious Eats, Bon Appétit, NYT Cooking, etc.) in
  UX-RECON-FRAMEWORK.md in our own words.
- IP-clean: zero competitor screenshots committed; all CSS,
  copy, colour tokens, and component code original Sous-branded
  work.
- Acceptance contract met: pattern referenced in this doc; clean
  original implementation; visual richness of the card jumped
  meaningfully (44px thumbnail row → 96px hero card with
  eyebrow + meta strip + corner toggle + bottom action row).

Surface scoreboard delta — Today result-stack: 4.0 → 4.5 (rough
estimate; will tune after the next bi-weekly).

## Cross-cutting wins

1. **Recon discipline now baked into the plan.** Workstream
   3.7 + the per-sprint pattern table in UX-RECON-FRAMEWORK.md
   give every remaining Y2 sprint a clear visual upgrade target.
   Sprint D's primary is `/path/pantry` empty state + add flow
   (patterns #11 + #12).
2. **The eval discipline holds.** Sprint B closed with V3
   gated because the synthetic eval said it should be. Sprint C
   ships engine improvements that don't need an eval (rules-
   based, deterministic) — and the rules are documented +
   tested per dimension. No "we'll measure later" excuses.
3. **Helper compounding.** W12's `deriveSeasonalTags` is reused
   by W13's `seasonalityFitScore` — same kitchen vocabulary, two
   different consumers. Pure helpers continue to be the right
   shape for compounding leverage.

## RCA tally

0 RCAs on main this sprint.

Mid-sprint catches that never reached main:

- W11: `Result-stack` hero-card initial draft hit a TS error on
  `as Record<string, unknown>` — fixed via a different cast path
  before commit. Caught by typecheck gate.
- W11: `time-rerank.test.ts` initial draft had a brittle
  `toBeCloseTo` precision call — tightened before commit.
- W13: `CookAgainChip` first draft missed the `useReducedMotion`
  import → caught by the project's custom `reduced-motion-gate`
  ESLint rule. Fixed in the same session.

The H2-of-Y1 0-RCAs-on-main streak holds: **8 weeks** in a row
across Sprints A + B + C.

## Carry-forward into Sprint D

- Sprint D (W15-W18) ships **Pantry-aware suggestions**.
  Recon target per the framework table: `/path/pantry` empty
  state + add flow (patterns #11 tap-and-hold quick-add + #12
  empty-state with concrete preview).
- The W12 `deriveSeasonalTags` helper is available for
  pantry-driven suggestions: cross-reference seasonal vegetables
  in stock against current-season recipe candidates.
- The W13 `pickReSuggestion` helper is the foundation for any
  future "memory" features (e.g. forgotten favourites surface on
  Path / monthly digest).

## Acceptance for Sprint-C close

- [x] Time-of-day rerank substrate shipped + tested (W11).
- [x] Seasonal-tag derivation shipped + tested + wired (W12).
- [x] Cook-again helper + Today chip shipped + tested (W13).
- [x] Recon-driven UX upgrade landed on Today result-stack (W11).
- [x] UX-RECON-FRAMEWORK + Y2 plan workstream documented (W11).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #5 + #6 absorbed (this doc).

## Retrospective

Sprint C closed with the recon discipline in place + the first
surface upgrade live. Stefan's W11 review — "many implementations
have been rudimentary" — became the trigger for a permanent
practice rather than a one-off polish pass. Twelve patterns
mapped to twelve sprints means by Year-2 close every load-bearing
surface will have had at least one recon-driven upgrade. The
Today result-stack is the proof point that the discipline works:
visual richness up, code complexity steady, tests untouched, four
gates clean throughout.

Sprint D opens with the pantry empty-state — different surface,
same discipline. Bi-weekly IDEO #7 fires at W16 with the pantry
add-flow recon target mid-build.
