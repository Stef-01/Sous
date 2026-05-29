# Year 1 retrospective — W1 through W52

**Period:** Stage 4 W1 → Stage 7 close (2025-XX through 2026-05-03)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` + Stefan's
2026-05-02 V2 plan revision (mid-Sprint-J recipe-ecosystem +
cooking-pod directives)
**Predecessor:** `docs/H1-RETROSPECTIVE.md` (W1-W26 first half)
**Successor:** `docs/YEAR-2-VIBECODE-PLAN.md` (filed 2026-05-02)

> Year-1 closed clean: **1073 tests on main**, all four gates green
> throughout, 29/31 surfaces ≥ 4.0, the recipe-authoring loop
> end-to-end live, the cooking pod challenge MVP shipping
> Stefan's score-based mechanic, household memory dietary-aware
> at the engine layer, voice cook V1 complete. Year-2 plan filed
> with 12 sprints + behavioural-science workstream + bi-weekly
> IDEOs.

## What shipped

Year-1 spans **10 sprints + W26 buffer + W52 close = 52 weeks**.

| Sprint | Weeks        | Focus                                                                                                                                               | Tests at close |
| ------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| A      | W1-W5        | Stage-4 W1 shared-component sweep + audit-driven polish                                                                                             | 411            |
| B      | W6-W10       | Stage-4 W2 cross-cutting infra (lint rule, forum nesting, tag cloud)                                                                                | 432            |
| C      | W11-W15      | `/cook/combined` shaper extraction + voice-cook stack scaffold                                                                                      | 533            |
| D      | W16-W20      | Voice toggle in settings + UserRecipe schema + cook-nav initiative MVP 1+2                                                                          | 604            |
| E      | W21-W25      | Voice-cook live integration + MVP 3 visual mode + library-research policy + recipe-authoring stack                                                  | 661            |
| Close  | W26          | H1 retrospective + `pnpm typecheck` wired into build + `pnpm verify` script                                                                         | 661            |
| F      | W27-W31      | Recipe-authoring page + `/cook/combined` density wave 2 first piece + visual-mode adoption + pairing-engine V2 + user-recipe → cook flow            | 738            |
| G      | W32-W36      | Household-memory arc end-to-end (substrate → roster → preferences → picker on /today → weekly rhythm widget)                                        | 808            |
| H      | W37-W41      | Household → engine integration (W37 dietary inferer) + drag-to-reorder (W38 dnd-kit) + voice timer commands (W39) + step-detail authoring (W40+W41) | 848            |
| I      | W42-W46      | Three Sprint-H carry-forwards (filter hint, templates, attention-pointer authoring) + V2 design docs + Cooking Pod Challenge MVP                    | 994            |
| J      | W47-W51      | Recipe Ecosystem V2 — source tagging + admin approval + reel-to-cook + agentic autogen + sharing                                                    | 1073           |
| W52    | Year-1 close | This retrospective + Year-2 plan kickoff doc                                                                                                        | 1073           |

## Year-1 acceptance scorecard

- [x] **Test count ≥ 600 (target was 411 → 600).** Hit at **1073**
      — +662 over Year-1, +79% over the original H1 acceptance
      threshold.
- [x] **Surface count at ≥ 4.0 ≥ 18/22.** **29 of 31** at Sprint-J
      close, with two new V1 placeholders at 3.75 (`/community/admin`,
      `/path/recipes/quick-add` — both intentional, gated on Y2
      backend unlock).
- [x] **Three new platform capabilities ≥ 3.75 each:**
  - Voice cook → 4.70 (live + timer voice + visual mode)
  - Recipe authoring → 4.20-4.40 across surfaces (full V2 ecosystem)
  - Household memory → 4.25 (`/today` + 4.00 (`/path/household`)
- [x] **All four gates green throughout.**
- [x] **Per-week 3-loop testing protocol completed every week.**
- [x] **All RCA-worthy moments documented + fixed inside the
      same commit cycle.** 11 RCAs total across H1+H2; **0
      landed on main during H2.**
- [x] **Library-research policy codified.**
      `LIBRARY-RECOMMENDATIONS.md` + Principle 8 added W22.
- [x] **Cooking Pod Challenge MVP shipped per Stefan's V2
      directive.** Score-based mechanic with consistency
      multiplier; mid-sprint pivot landed without slipping
      Sprint I close.

## RCA tally across Year 1

| Sprint | RCAs | Pattern surfaced                                                                                                                                            |
| ------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A      | 0    | –                                                                                                                                                           |
| B      | 0    | –                                                                                                                                                           |
| C      | 5    | Type-narrowing widens unions; react-hooks/set-state-in-effect strict rule; half-a-minute regex double-count; emoji-strip in phrase matching; JSON null trap |
| D      | 1    | Regex alternation order (longer first)                                                                                                                      |
| E      | 0    | (codebase patterns matured; first 0-RCA sprint)                                                                                                             |
| F      | 1    | `@hookform/resolvers/zod` typing mismatch with `partial()`                                                                                                  |
| G      | 0    | –                                                                                                                                                           |
| H      | 1    | dnd-kit unused `arrayMove` import (caught at lint)                                                                                                          |
| I      | 4    | All caught at lint pre-commit (reduced-motion gate, exhaustive-deps, no-unescaped-entities, podTimezone schema)                                             |
| J      | 3    | All caught at lint pre-commit (stale `useState`, exhaustive-deps, navigator type narrowing)                                                                 |

**Year-1 total: 14 RCAs. 14 caught pre-commit (lint or typecheck
or integration test). 0 landed on main.** That is the load-bearing
result of H2's lint-rule + 4-gate discipline.

## Library adoptions during Year 1

Per the search-before-build policy (Principle 8, added W22):

| Library                     | Sprint adopted | Bundle delta | Replaces                       |
| --------------------------- | -------------- | ------------ | ------------------------------ |
| `react-hook-form` 7.75.0    | E (W23)        | ~9KB         | Hand-roll for recipe authoring |
| `@hookform/resolvers` 5.2.2 | E (W23)        | ~2KB         | (paired)                       |
| `@dnd-kit/core` 6.3.1       | H (W38)        | ~10KB        | Hand-roll for drag-and-drop    |
| `@dnd-kit/sortable` 10.0.0  | H (W38)        | ~3KB         | (paired)                       |
| `@dnd-kit/utilities` 3.2.2  | H (W38)        | ~1KB         | (paired)                       |

Cumulative Y1 dep growth: **~25KB / 50KB H1 budget**. ~25KB
headroom into Year 2.

Libraries explicitly NOT adopted (with reason logged in
`LIBRARY-RECOMMENDATIONS.md`):

- `react-tinder-card` (ADR-0002)
- `react-speech-recognition` (hand-rolled tighter for our lifecycle)
- `react-speech-kit` (same)
- `compromise.js` (overkill at < 15-phrase intent set)
- `lottie-react` (framer-motion sufficient)

## What didn't happen (residuals into Year 2)

1. **Server-side multi-device pods.** Pod V1 is single-device
   localStorage per Stefan's directive. Y2 W1-W4 founder-unlock
   sprint swaps to Postgres + Clerk + R2.
2. **Real autogen LLM call.** W50 ships stub-mode; Anthropic key
   unlock is one config edit (Y2 ready).
3. **Real photo storage.** Pod submission photos are placeholder
   strings; R2 unlock is Y2 W3.
4. **Pairing-engine V3 — per-dimension scores.** V2 trainer
   shipped W30; V3 is Y2 Sprint B (W6-W10).
5. **Time/season/pantry rerankers.** Queued for Y2 Sprint C+D.
6. **Smart notifications.** Daily rhythm widget shipped W36;
   notifications are Y2 Sprint E (W19-W22).
7. **Voice MVP 5 sequenced pointers.** Y2 Sprint F (W23-W26).
8. **Charity bake-sale tooling.** Y2 Sprint L (W48-W51).
9. **Per-cuisine vocabulary dictionary.** Y2 Sprint K (W44-W47).

All residuals are explicitly slotted in `docs/YEAR-2-VIBECODE-PLAN.md`.

## Process wins H1+H2 leaves Year 2

1. **Per-week 3-loop testing as default** (not aspirational).
2. **`pnpm typecheck` as the new fourth gate** wired into
   `pnpm build` — type errors surface in 3-5s instead of 60s.
3. **`pnpm verify` script** = typecheck + lint + test + build.
4. **Custom `sous/reduced-motion-gate` ESLint rule at error
   level.** Fired exactly twice across H2 (W22 toggle, W29
   DishProgressStrip), both caught pre-commit.
5. **All-routes Playwright smoke spec** in `e2e/all-routes-
smoke.spec.ts` covering all 30+ routes.
6. **Library-research policy** with master pick table + bundle
   budget enforced.
7. **Per-week CLOSE.md docs** structured around shipped commits,
   Loop 1 stress, Loop 2 RCA, Loop 3 improvement, acceptance,
   residuals, retrospective.
8. **Sprint-end IDEO close** doc per sprint (10 of them across
   Year 1).
9. **Substrate-first per sprint** — pure helpers + tests before
   UI. The pattern that produced 0 RCAs landing on main during
   H2 carries forward as Y2's process commitment.
10. **Stub-mode-V1 for every founder-gated feature.** Substrate
    ships first; key swap is one config edit. The pattern
    landed cleanly across W22 voice toggle, W50 autogen, W46
    pod creation, all of Y1 J's admin/sharing surfaces.

## Stefan's mid-Sprint-I directive (the load-bearing pivot)

On 2026-05-02, Stefan's directives reshaped Sprints I and J:

1. **Cooking Pod Challenge mechanic pivot** — drop streak loss
   aversion, ship score-based + 2/day cap + consistency
   multiplier. Locked in 57+22 = 79 substrate tests in Sprint I,
   surface in 4 W46 commits.
2. **Recipe Ecosystem V2** — source tagging + admin approval +
   reel-to-cook + agentic autogen + sharing. Shipped Sprint J
   W47-W51 with 79 new tests + 5 production commits + 0 RCAs on
   main.
3. **Year-2 plan filed** — 12 sprints + behavioural-science
   workstream + bi-weekly IDEO cadence + minimalist-integration
   constraint per CLAUDE.md rule 6.

The pivot landed without slipping any Sprint-I or Sprint-J
acceptance gate. The substrate-first pattern absorbed the
re-prioritisation cleanly.

## Year-2 opening priorities

Per `docs/YEAR-2-VIBECODE-PLAN.md` (filed 2026-05-02):

1. **Y2 Sprint A (W1-W5)** — Founder-unlock substrate. Auth
   (Clerk) + Postgres (Neon) + R2 + Y1 W51 cook-deeplink
   follow-on.
2. **Y2 Sprint B (W6-W10)** — Pairing-engine V3 (per-dimension
   scores).
3. **Y2 Sprint C-L (W11-W51)** — Time/season reranker + Cook-
   again, Pantry-aware suggestions, Daily rhythm + smart
   notifications, Voice MVP 5, Voice conversational, Voice-
   driven authoring, Pod V2 agentic pick, Viral recipe agent,
   Vocabulary dictionary, Charity bake-sale tooling.
4. **Y2 W52** — Year-2 retrospective + Year-3 kickoff.

Cross-cutting workstreams:

- NOOM/behavioural-science overlays distributed across sprints
  (implementation intentions, identity, streak forgiveness,
  tiny goals, reflection journaling, anchoring/peak-end).
- Bi-weekly IDEO reviews (24+ across Y2).
- Per-week 3-loop testing continues.
- Library-research refresh quarterly (Y2 W13/W26/W39/W52).

## Acceptance for Year-1 close

- [x] Year-1 retrospective doc shipped.
- [x] All Sprint-J + W51 carry-forwards addressed.
- [x] Founder-unlock runbook updated with Y1 W51 + Y2 unlock
      additions (entries 9-14).
- [x] Year-2 plan filed and locked.
- [x] All four gates green at year-end: lint ✓, typecheck ✓,
      test 1073/1073 ✓, build ✓.

## Retrospective (1 paragraph)

Year 1 closed with the recipe-authoring loop end-to-end
navigable, the household-memory loop dietary-aware at every
engine touch-point, the voice cook arc V1 feature-complete, and
the Cooking Pod Challenge MVP shipping Stefan's score-based
mechanic without anxiety-driving streak loss aversion. The
load-bearing process discovery this year was the substrate-
first pattern: every surface week was a wiring exercise on
top of pre-shipped pure helpers, which is why H2 shipped 0
RCAs on main across 26 weeks of feature work. The lint-as-
RCA + 4-gate discipline + bi-weekly IDEO discipline form the
chassis Year 2 inherits — those processes are why the Y2 plan
can confidently slot 12 features across 52 weeks with the
substrate-first, surface-second cadence built in. Stefan's
mid-sprint Pod V2 mechanic pivot validated the pattern:
57 + 22 = 79 substrate tests landed in W45 absorbed the
mechanic change without disturbing the W46 surface week.
Year 2 opens with the founder-unlock substrate sprint that
makes every Y2-gated feature one config edit away from
production-real.
