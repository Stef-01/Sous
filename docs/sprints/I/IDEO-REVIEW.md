# Sprint I (W42-W46) — IDEO Design Review

> Closes Sprint I per `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md`.
> Sprint focused on **Sprint H carry-forwards (W42-W44)** + the
> **Cooking Pod Challenge MVP (W45-W46)** per Stefan's
> 2026-05-02 mechanic-pivot directive.

## Review date

2026-05-02

## Build state at review

- Latest commit on main: `5eaf418` (W46 pod tile on /community).
- Test count: **994** (was 848 at Sprint H close — **+146 over
  the sprint**).
- Four-gate green: pnpm lint ✓, pnpm typecheck ✓, pnpm test ✓,
  pnpm build ✓.

## What landed in Sprint I

| Week | Commits                               | Output                                                                                                                                                |
| ---- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| W42  | 4210b6b                               | `/sides` household-filter visual hint (closes Sprint H carry-forward — the user can now see why pairings are narrowed)                                |
| W43  | f9dbdc4                               | Recipe-authoring template library: `seedToRecipeDraft` + 6-template manifest + `?fork=<slug>` flow + 21 tests                                         |
| W44  | 8fd8869                               | Attention-pointer authoring (textarea-based parser; 21 tests) + adapter passthrough + cook-page wire-up                                               |
| docs | dd6bd8c + 32e556a                     | Cooking Pod Challenge V1 design + V2 score-based pivot per Stefan's directive + Recipe Ecosystem V2 brief                                             |
| W45  | 1fd7bcb + 6876821                     | Pod-score substrate (57 helper tests) + ChallengePod schema + `useCurrentPod` persistence hook (22 parser tests). Cumulative pod substrate: 79 tests. |
| W46  | 6f3979e + cd6b3b1 + 1ea9382 + 5eaf418 | `/community/pod` page (3 states) + creation form + Y2-gated join page + win-screen submit slot + entry tile on /community home                        |

13 production commits + 2 design-doc commits across the sprint.

## Surface scoreboard delta

| Surface                 | Sprint-H close | Sprint-I close | Delta                                                                             |
| ----------------------- | -------------- | -------------- | --------------------------------------------------------------------------------- |
| `/today`                | 4.40           | 4.40           | – (unchanged this sprint)                                                         |
| `/cook/[slug]`          | 4.60           | **4.70**       | +0.10 (attention-pointer authoring + pod-challenge submit slot on win screen)     |
| `/path/recipes/new`     | 4.00           | **4.10**       | +0.10 (templates fork flow + step-detail authoring with attention pointers)       |
| `/path/recipes`         | 4.00           | **4.20**       | +0.20 (templates row visible in both empty + populated states)                    |
| `/sides`                | unchanged      | **4.00**       | NEW at 4.0 (filter hint surfaces the household constraint)                        |
| `/community`            | 4.00           | **4.10**       | +0.10 (pod tile entry point — invisible-on-cold-start, escalates as user invests) |
| `/community/pod`        | (n/a)          | **4.00**       | NEW (pod home with 3 states: no-pod CTA, mid-week, gallery)                       |
| `/community/pod/create` | (n/a)          | **3.75**       | NEW (creation form with household-roster shortcut)                                |
| `/community/pod/join`   | (n/a)          | **3.50**       | NEW (V1 placeholder with honest Y2-gated explainer)                               |
| All other surfaces      | unchanged      | unchanged      | –                                                                                 |

Score-≥-4 count: **27 of 29** (was 25/26 at Sprint H close —
three new surfaces shipped, two ticked up). The two below-4
surfaces are `/community/pod/join` (intentional V1 placeholder
gated on Y2 unlock) and `/community/pod/create` (functional but
will benefit from polish in Y2).

## Cross-cutting wins

1. **Cooking Pod Challenge MVP is end-to-end live.**
   The substrate-then-surface pattern from Sprint F-H paid off
   massively here. W45 shipped 79 tests of pure helpers (cook
   score, consistency multiplier, daily cap, weekKey, schema,
   parser); W46 wrapped them with four UI commits (page, create
   form, win-screen integration, entry tile) — each commit was a
   wiring exercise, not a discovery exercise. The full loop
   works:
   1. Create pod via `/community/pod/create` (with optional
      "Use household members" shortcut).
   2. Pod home tiles the recipe + member completion list mid-
      week, gallery + score on Sunday reveal.
   3. Cook the recipe → win screen surfaces "Submit to pod
      challenge" toggle with live score chip.
   4. Submit → upsertSubmission → pod home reflects.

2. **Mechanic pivot landed cleanly.** The V1 streak design
   would have shipped anxiety; Stefan's V2 score-based pivot
   ships positive-reinforcement craft signal + structural
   protections (2/day cap, consistency multiplier with 0.5
   floor). 57 unit tests pin the formula:
   `cook_score = stepCompletion×0.30 + selfRating×0.30 +
aesthetic×0.40` (× 100, capped) plus optional caption /
   step-image bonuses (+5 each, total cap 100), and
   `pod_weekly = sum × clamp(1 - cv × 0.5, 0.5, 1.0)`. The
   formula is locked before the surface; future changes break
   tests, not behavior.

3. **Attention-pointer infrastructure now has authoring + display
   end-to-end.** W29 shipped the overlay component but no
   authoring path. W44 closes that gap with a textarea-based
   parser (`circle: 0.3, 0.5 - watch the bubbles`) — pure +
   testable, no canvas-click UX surface area. The full visual-
   mode loop (W22 pref + W27 page-side + W29 overlay + W44
   authoring) is now load-bearing.

4. **Recipe-authoring loop reaches feature parity with seed.**
   Templates row (W43 fork flow) + step-detail authoring (W41) +
   attention-pointer authoring (W44) + cuisineFact / imageUrl
   schema (W40) collectively let the user author every chip the
   cook page renders. The W17-W31 substrate predicted this end-
   state; W41-W44 delivered.

5. **The W7 ESLint rule + lint-as-RCA pattern fired three times
   and saved us each time.** The `react-hooks/exhaustive-deps`
   rule caught a dep-array mistake on PodTile pre-commit;
   `react/no-unescaped-entities` caught 8 apostrophes in the new
   pod surface; `@typescript-eslint/no-unused-vars` caught a
   stale `computeWeekKey` import on the cook page. Three Loop-2
   RCAs all caught at edit time, none on main.

## RCA tally

3 RCA-worthy moments this sprint, all caught at lint:

1. **`computeWeekKey` unused import on cook page (W46)** —
   imported defensively, never referenced. Dropped.
2. **8 unescaped apostrophes on the new pod surface (W46)** —
   prettier formatted but lint enforces React's
   `no-unescaped-entities` rule. Replaced each with `&apos;`.
3. **PodTile useMemo had unnecessary `submissions` dep (W46)** —
   read everything via the parent `state` envelope.
   `react-hooks/exhaustive-deps` rule caught it; dep dropped.

Plus 1 Loop-2 caught at integration test:

4. **podTimezone schema rejected empty-string default** —
   `z.string().min(1).max(64).default("")` is internally
   inconsistent: the default fails its own min(1). Relaxed to
   `z.string().max(64).default("")` since empty string is the
   V1 sentinel for "host-local" (single-pod-per-device).

All four caught and fixed in the same edit cycle. Zero RCAs
landed on main.

## Library adoptions during Sprint I

None. The pod challenge work composed entirely of:

- `zod` (already in tree) — schema
- `framer-motion` (already in tree) — surface animations
- `lucide-react` (already in tree) — Users / TicketCheck /
  Camera / Play icons

Cumulative dep budget through H1+F+G+H+I: ~25KB / 50KB H1
ceiling. ~25KB headroom into Sprint J.

## Carry-forward into Sprint J (W47-W51)

Sprint J per the V2 plan revision is **Recipe Ecosystem V2**
per `docs/RECIPE-ECOSYSTEM-V2.md`:

1. W47 — Source tagging (user / community / nourish-verified)
   - filter UI on `/path/recipes` and templates row.
2. W48 — Admin approval flow (mock single-device).
3. W49 — Reel-to-cook integration (`Cook this` button on
   `/community/reels`).
4. W50 — Agentic recipe autogen (`/path/recipes/quick-add`
   with stub-mode LLM call; real Anthropic call gated on
   API key).
5. W51 — Sharing + IDEO Sprint-J close.

Plus the Sprint I residuals to consider for Sprint J:

- **Pod creation form polish** — household-shortcut button is
  hidden when no household members exist; the "no household yet"
  case could surface a small CTA → /path/household. Low priority.
- **Pod gallery photo upload** — V1 stamps a placeholder photo
  URI; real photo capture lands when the win-screen photo flow
  - R2 upload integrate (Y2).
- **Donate-a-Cook tag UI on submit** — V1 schema supports the
  three tags (shared / bake-sale / cooked-together) but the
  win-screen toggle doesn't yet collect them. Add when usage
  data shows the hook is engaged with.

## Acceptance for Sprint-I close

- [x] Every Sprint-H IDEO carry-forward addressed or explicitly
      redeferred. /sides filter hint shipped W42; pre-commit
      hook stays redeferred (CLAUDE.md rule against git config
      changes); attention-pointer content authoring shipped
      via the W44 textarea parser.
- [x] No regression in any score-≥-4 surface from Sprint-H close.
- [x] Test count monotonic (848 → 994, +146).
- [x] All four gates green throughout the sprint.
- [x] Cooking Pod Challenge MVP shipped (Stefan's directive).
- [x] V2 design docs filed (`COOKING-POD-CHALLENGE.md` rewritten,
      `RECIPE-ECOSYSTEM-V2.md` new).
- [x] 12-month plan revised with V2 Sprint-I + Sprint-J slots.
- [x] All Sprint-I new surfaces (≥ 3.5).

## Retrospective (1 paragraph)

Sprint I is the most substantively ambitious sprint of H2 so
far: a plan-doc rewrite mid-sprint (Stefan's mechanic pivot) +
a major new feature loop (pods) + three Sprint-H carry-
forwards (filter hint, templates, pointer authoring) all
shipped without a single RCA landing on main. The substrate-
first discipline was the load-bearing piece — by the time the
W46 surface week arrived, 79 tests of pod-score helpers + the
schema + parser hook locked in the contract; surface work was
mechanical wiring. The mechanic pivot itself was the most
interesting design choice: scrapping a streak-loss-aversion
loop in favour of positive-reinforcement scoring with
structural protections (2/day cap, consistency multiplier)
required rebuilding the formula but produced a cleaner contract
that aligns with CLAUDE.md rule 1 ("every Today element must
make the user cook"). The lint-as-RCA pattern earned itself a
third sprint of validation: three issues caught at edit time,
zero on main. Sprint J opens with Recipe Ecosystem V2 work —
source tagging + admin approval + reel-to-cook + agentic
autogen + sharing — all under the same minimalist directive
that produced the pod challenge surface.
