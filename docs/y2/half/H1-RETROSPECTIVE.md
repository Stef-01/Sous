# Year 2 — Half-1 retrospective (Sprints A-F, W1-W26)

> **Filed:** 2026-05-03 (W26 close-out).
> **Coverage:** Sprints A through F. Half the year, six sprints.
> **Build state at H1 close:** 1500 passing tests, 0 RCAs on main
> across 20 weeks, four-gate green throughout.

## Test count progression

| Milestone          | Tests    | Delta from prior |
| ------------------ | -------- | ---------------- |
| Y1 close           | 1073     | (baseline)       |
| Sprint A close     | 1121     | +48              |
| Sprint B close     | 1209     | +88              |
| Sprint C close     | 1309     | +100             |
| Sprint D close     | 1357     | +48              |
| Sprint E close     | 1417     | +60              |
| **Sprint F close** | **1500** | **+83**          |

**+427 tests across H1.** Pure-helper discipline doing the work — every sprint shipped a substrate layer that earned its own test surface.

## Per-sprint scorecard

| Sprint | Theme                              | Lines shipped              | Behavioural overlay                              | Recon pattern        |
| ------ | ---------------------------------- | -------------------------- | ------------------------------------------------ | -------------------- |
| A      | Founder-unlock substrate           | auth, schema, R2, share    | —                                                | (infra-only)         |
| B      | Pairing engine V3                  | trainer, eval, hybrid gate | —                                                | (engine-only)        |
| C      | Time/season rerank + cook-again    | rerank, season tags, chip  | anchoring (cook-again)                           | #1+#2+#3+#4 (Today)  |
| D      | Pantry-aware suggestions           | coverage, rerank, badge    | (deferred to data-day)                           | #2 ext (eyebrow)     |
| E      | Daily rhythm + smart notifications | rhythm, push, scheduler    | impl. intentions + streak forgiveness + identity | #6 partial (rhythm)  |
| F      | Voice MVP 5 sequenced pointers     | schema, runner, format     | peak-end anchoring                               | #7+#8 partial (cook) |

## Founder-unlock contract status

| Slot                    | Substrate shipped | Founder action waiting                                   |
| ----------------------- | ----------------- | -------------------------------------------------------- |
| Clerk auth              | Y2 W1             | `CLERK_SECRET_KEY` env                                   |
| Postgres                | Y2 W2 (8 tables)  | `DATABASE_URL` + `pnpm db:push`                          |
| R2 photo storage        | Y2 W3+W4          | 4 R2 env vars                                            |
| Cook deeplink author    | Y1 W51 + Y2 W4    | (works today; cross-device resolution waits on Postgres) |
| V3 trainer real-mode    | Y2 W6-W10         | Real-cohort eval + hyperparameter retune + flag flip     |
| Push notifications      | Y2 W20            | VAPID public + private keys                              |
| Pantry-aware UI surface | Y2 W15-W17        | Seed-catalog ingredient expansion (data, not config)     |

Seven distinct stub-mode-V1 substrates ready. Six are one config edit from real mode; one (V3 trainer) is gated on real-cohort data + retune.

## Behavioural overlay tracker (4 of 6 landed)

| #   | Pattern                   | Sprint | Mechanism                                                                      |
| --- | ------------------------- | ------ | ------------------------------------------------------------------------------ |
| 1   | Anchoring (cook-again)    | C      | Chip text "you rated 5★ N weeks ago"                                           |
| 2   | Implementation intentions | E      | Nudge copy "Tuesday 5:30pm — when you're heading home..."                      |
| 3   | Streak forgiveness        | E      | Missed-week nudge "Skipping last Tuesday is just data..."                      |
| 4   | Identity reinforcement    | E      | Rhythm widget "You're a Tuesday-night cook (12 weeks)"                         |
| 5   | Peak-end anchoring        | F      | Win-screen "Your best of the year — barely above 87"                           |
| 6   | Tiny goals                | I      | Pod weekly twist (pending)                                                     |
| —   | Reflection journaling     | G      | End-of-week voice prompt (pending — moved out of overlay slot 6 in plan check) |

The pattern across all 5 landed overlays: **pure text-formatter helpers**, zero new screens, all reusing existing surfaces. That's the right shape — behavioural science changes WORDS, not SCREENS.

## UX-recon discipline adoption

Stefan's W11 review ("many implementations have been rudimentary") triggered the framework. H1 shipped:

- `docs/UX-RECON-FRAMEWORK.md` — 12-pattern library + per-sprint mapping + IP-clean rule + acceptance contract.
- `docs/YEAR-2-VIBECODE-PLAN.md` workstream 3.7 — recon as recurring deliverable.
- 4 sprints with recon targets named (C primary; D, E, F partial).
- 1 surface fully upgraded to a recon pattern (Today result-stack — patterns #1+#2+#3+#4).

Adoption is steady-state. The framework's "1 surface upgrade per sprint" cadence is meeting its bar; H2 carries forward with patterns #5 (Sprint G servings stepper), #2+#5+#6 (Sprint H recipe authoring), #9+#10 (Sprint I Pod V2 filter chips + made-it ring), #2+#9 (Sprint J search), #2+#10 (Sprint K cuisine vocabulary), #1+#4 (Sprint L bake-sale).

## RCAs on main: zero

20-week streak (Sprints A through F). Across 6 sprints + 26 weeks of original engine + UI work, zero root-cause analyses landed on main. Mid-sprint catches across the half:

- Sprint A W3: emoji-only-filename test mismatch (caught at first run)
- Sprint B W7: TS index-signature cast (caught by typecheck)
- Sprint B W8: TS navigator narrowing (caught by typecheck)
- Sprint C W11: TS index-signature on hero card (caught by typecheck)
- Sprint D W16: pantry-rerank in-place sort mutation (caught by immutability test)
- Sprint E W19: rhythm-pattern Date.now() inside helper (caught by determinism review)
- Sprint E W21: scheduleNextNudge twin-pattern bug (caught by twin-pattern test)
- Sprint F W24: useElapsedSeconds in-render ref mutation (caught by react-hooks/refs lint)

Eight catches across the half, all before commit. The four-gate discipline (lint + typecheck + test + build) is the load-bearing layer.

## What H2 looks like

Sprint G (W27-W30) ships voice conversational follow-ups. Sprints H-L ship voice authoring, Pod V2 with agentic recipe pick, agentic viral search, per-cuisine vocabulary dictionary, and charity bake-sale tooling. W52 closes year 2.

Recon discipline + behavioural overlay shipping continues every sprint. Founder-unlock substrate is in place for every gated capability — the half-time review confirms the substrate-first pattern earned its keep.

## Retrospective

H1's headline: **20 weeks 0-RCAs-on-main, +427 tests, 7 founder-unlock substrates ready, 5 behavioural overlays landed, recon discipline baked in.**

The pivot at W11 (Stefan's review → recon framework) was the most important non-code decision of the half. Everything that followed had a polish discipline attached. The pure-helper pipeline now spans 7 dependent stages from V2 trainer through peak-end anchor — composable, deterministic, individually tested.

H2 opens with voice work + the next batch of UX-recon targets. Same discipline, different surface.
