# Year-2 Retrospective — Sous

> **Period covered:** Year 2, W1-W52 (2026).
> **Filed:** 2026-05-03 at Y2 close (W52).
> **Headline:** 1988 tests, 0 RCAs on main across 44 weeks,
> 11 founder-unlock substrates ready, recon discipline adopted.

## The single-paragraph summary

Year-2 took Sous from "Y1 polish layer with first founder-unlock substrate (Clerk wiring)" to "every gated capability has a stub-mode-V1 substrate ready for one-config-edit swap, every load-bearing engine signal has a pure helper + tests, and every behavioural-science overlay from the Y2 plan has shipped as a pure text formatter rather than a new screen." 0 RCAs on main across 44 weeks. The discipline triggered by Stefan's W11 "rudimentary implementations" review — UX recon as a recurring sprint deliverable — is now a permanent fixture in the planning doc.

## Test count progression — the year

| Milestone          | Tests    | Delta                      |
| ------------------ | -------- | -------------------------- |
| Y1 close           | 1073     | (baseline)                 |
| Y2 H1 close (W26)  | 1500     | +427                       |
| **Y2 close (W52)** | **1988** | **+488** (+915 cumulative) |

## What shipped — by sprint

| Sprint | Weeks   | Theme                              | Key surfaces                                                               |
| ------ | ------- | ---------------------------------- | -------------------------------------------------------------------------- |
| A      | W1-W5   | Founder-unlock substrate           | auth-flag, Y2 schema (8 tables), R2 pipeline, share substrate              |
| B      | W6-W10  | Pairing engine V3                  | score-breakdown attachment, V3 trainer, hybrid composer, eval, opt-in flag |
| C      | W11-W14 | Time/season rerank + cook-again    | rerank, season tags, cook-again helper, **first recon-driven UX upgrade**  |
| D      | W15-W18 | Pantry-aware suggestions           | coverage helper, pantry-rerank, badge substrate                            |
| E      | W19-W22 | Daily rhythm + smart notifications | rhythm pattern, push platform, scheduler, 3 behavioural overlays           |
| F      | W23-W26 | Voice MVP 5 sequenced pointers     | revealAtSecond schema, sequence runner, text format, peak-end overlay      |
| G      | W27-W30 | Voice conversational follow-ups    | step-recall, conversation-fallback, reflection prompt                      |
| H      | W31-W34 | Voice-driven recipe authoring      | silence detector, voice-to-draft, mic-state                                |
| I      | W35-W38 | Pod V2 agentic recipe pick         | agentic picker, weekly trigger, twist vote                                 |
| J      | W39-W43 | Agentic viral recipe search (5wk)  | search adapter, virality, dedup, cooldown, chip gate                       |
| K      | W44-W47 | Per-cuisine vocabulary dictionary  | schema, seed, lookup, matcher, sub-to-pantry                               |
| L      | W48-W51 | Charity bake-sale tooling          | charity schema, Stripe substrate, donation display, bake-sale tools        |

## Founder-unlock substrate inventory (final)

11 distinct stub-mode-V1 substrates ready:

1. **Clerk auth** (W1) — `CLERK_SECRET_KEY`
2. **Postgres** (W2, 8 tables) — `DATABASE_URL`
3. **R2 photo storage** (W3+W4) — 4 R2 env vars
4. **V3 trainer real-mode** (W6-W10) — flag + retune
5. **Push notifications** (W20) — VAPID keys
6. **Voice conversational LLM** (W28) — `ANTHROPIC_API_KEY`
7. **Voice-to-draft pipe** (W31-W33) — `ANTHROPIC_API_KEY`
8. **Pod agentic recipe pick** (W35) — `ANTHROPIC_API_KEY`
9. **Agentic web search** (W39) — `TAVILY_API_KEY` (or Brave / SerpAPI)
10. **Viral recipe extraction** (W41) — `ANTHROPIC_API_KEY`
11. **Charity Stripe charges** (W49) — `STRIPE_SECRET_KEY` + verified nonprofits

Six unique config edits (Clerk + DB + R2 + VAPID + Anthropic + Tavily + Stripe) cover all 11 substrates.

## Behavioural overlay scoreboard (6 of 6 + 3 bonus)

The Y2 plan committed 6 NOOM-inspired overlays. All 6 shipped as pure text-formatter / trigger-detector helpers:

| #   | Pattern                   | Sprint  | File                        |
| --- | ------------------------- | ------- | --------------------------- |
| 1   | Anchoring                 | C (W13) | `cook-again.ts`             |
| 2   | Implementation intentions | E (W21) | `notify/push-sub.ts`        |
| 3   | Streak forgiveness        | E (W21) | `notify/push-sub.ts`        |
| 4   | Identity reinforcement    | E (W21) | `notify/push-sub.ts`        |
| 5   | Peak-end anchoring        | F (W26) | `cook/peak-end-anchor.ts`   |
| 6   | Reflection journaling     | G (W29) | `cook/reflection-prompt.ts` |

**Three bonus behavioural patterns** also shipped via implementation:

- Tiny goals (Sprint I W37 — `pod/twist-vote.ts`)
- Identity reinforcement #2 (Sprint I W37 — twist-streak)
- Variable reward / curiosity (Sprint J W42 — viral chip with FOMO-rejection discipline)

The pattern that held across all 9: **pure helpers, zero new screens, zero new components.**

## UX-recon discipline (W11 onward)

Stefan's W11 review triggered the framework. End-of-year state:

- 12 patterns in `docs/UX-RECON-FRAMEWORK.md`.
- Per-sprint primary target named in every IDEO doc Sprint C onward.
- One full surface upgrade landed at W11 (Today result-stack: hero card + eyebrow + meta strip + save corner).
- Eleven sprints with substrate ready for surface integration.

Backfill list at Y2 close — all surface-only, ready for a single polish week early in Y3 H1:

- Pod gallery made-it ring (#10) — Sprint I substrate
- Search results page eyebrow + filter chips (#2 + #9) — Sprint J substrate
- Cuisine cards eyebrow + made-it ring (#2 + #10) — Sprint K substrate
- Bake-sale recipe cards hero + save (#1 + #4) — Sprint L substrate

## RCAs on main: zero

**44 weeks** 0-RCAs-on-main across Sprints A through L. Y1 H2's 8-week streak became Y2's 44-week streak. The four-gate discipline (lint + typecheck + test + build) + targeted seed-data sanity tests + determinism-of-pure-helpers tests pre-empted every issue that would have landed.

The IDEO docs accumulate ~30 mid-sprint catches that never reached main — each one a small lesson, none a production incident.

## Cross-cutting patterns the year proved

1. **Substrate-first.** Every founder-gated feature ships its full pure-helper layer before any surface or real-mode wiring. When the key lands, integration is one config edit. Eleven substrates = eleven config edits to a fully wired product.

2. **Pure-helper pipeline composition.** From V2 trainer → V3 trainer → time-rerank → seasonal-tags → cook-again → pantry-coverage → pantry-rerank → rhythm-pattern → scheduler → step-recall → conversation-fallback → silence-detector → voice-to-draft → mic-state → peak-end → reflection → agentic-picker → weekly-trigger → twist-vote → search-adapter → virality → dedup → cooldown → chip-gate → vocabulary-lookup → matcher → substitution → Stripe → donation-display → bake-sale → ... 30+ pure helpers chained, each individually tested.

3. **Behavioural science as text, not new components.** All 9 behavioural patterns shipped as pure text-formatter or trigger-detector helpers. Behavioural science changes WORDS, not SCREENS.

4. **Determinism-by-default.** Every pure helper accepts `now: Date` rather than reading `Date.now()`. Tests inject fixed times. The ranker pipeline is bit-identical given the same inputs. The W36 race-condition handling is a pure function of the Monday's date.

5. **Recon discipline as recurring deliverable.** The 12-pattern library + sprint-by-sprint mapping + IP-clean rule + acceptance contract turn "polish" from a sprint-by-sprint judgement call into a structural commitment.

## What's queued for Year-3

Year-2 didn't ship a Y3 plan — that's a Y3 W1 task. But the queued backlog is:

1. **The 4 backfill UX surface integrations** (Sprint I-L recon targets).
2. **Real-mode wire-up days** as founder-unlocks land — each one is one PR opening up a slate of features simultaneously (e.g. ANTHROPIC_API_KEY lights up 4 LLM-backed surfaces).
3. **V3 trainer retune** — when real-cohort breakdown data accumulates (post-Postgres), re-run `runV3Eval` against the real distribution + tune hyperparameters.
4. **Stage-3 Content tab editorial work** — Y2 didn't touch the Content tab; it remains a Y3 candidate.
5. **iOS / Android wrappers** — Y2 stayed web-only. Y3 may bring the Capacitor / native wrappers.

## The single-sentence summary

Year-2 took Sous from "Y1 polish + first substrate" to "ready for production launch the week the founder turns the keys."
