# Year 2 — Half-2 retrospective (Sprints G-L, W27-W52)

> **Filed:** 2026-05-03 (Y2 close).
> **Coverage:** Sprints G through L. Six sprints, 26 weeks.
> **Build state at H2 close:** 1988 passing tests, 0 RCAs on main
> across 44 weeks, four-gate green throughout.

## Test count progression

| Milestone          | Tests    | Delta from prior |
| ------------------ | -------- | ---------------- |
| Y2 H1 close        | 1500     | (baseline)       |
| Sprint G close     | 1590     | +90              |
| Sprint H close     | 1639     | +49              |
| Sprint I close     | 1712     | +73              |
| Sprint J close     | 1826     | +114             |
| Sprint K close     | 1900     | +74              |
| **Sprint L close** | **1988** | **+88**          |

**+488 tests across H2.** Combined with H1 (+427), Y2 added **+915 tests** to the suite.

## Per-sprint scorecard

| Sprint | Theme                             | Lines shipped                                   | Behavioural overlay         | Recon pattern              |
| ------ | --------------------------------- | ----------------------------------------------- | --------------------------- | -------------------------- |
| G      | Voice conversational follow-ups   | step-recall, conversation-fallback, reflection  | reflection journaling (#6)  | #5 (deferred)              |
| H      | Voice-driven recipe authoring     | silence-detector, voice-to-draft, mic-state     | —                           | #2/#5/#6 (substrate ready) |
| I      | Pod V2 agentic recipe pick        | agentic-picker, weekly-pick-trigger, twist-vote | tiny goals + identity (5)   | #9/#10 (deferred)          |
| J      | Agentic viral recipe search       | search-adapter, virality, dedup, cooldown, gate | variable reward (curiosity) | #2/#9 (deferred)           |
| K      | Per-cuisine vocabulary dictionary | schema, seed, lookup, matcher, sub-to-pantry    | —                           | #2/#10 (deferred)          |
| L      | Charity bake-sale tooling         | charity schema, Stripe, donation, bake-sale     | —                           | #1/#4 (deferred)           |

## Behavioural overlay tracker — final (6 of 6)

All six NOOM-inspired overlays from Y2 workstream 3.1 shipped as pure helpers:

| #   | Pattern                   | Sprint  | File                               |
| --- | ------------------------- | ------- | ---------------------------------- |
| 1   | Anchoring                 | C (W13) | cook-again.ts (chip text)          |
| 2   | Implementation intentions | E (W21) | push-sub.ts (formatNudgeText)      |
| 3   | Streak forgiveness        | E (W21) | push-sub.ts (missed-last-week var) |
| 4   | Identity reinforcement    | E (W21) | push-sub.ts (formatRhythmIdentity) |
| 5   | Peak-end anchoring        | F (W26) | peak-end-anchor.ts                 |
| 6   | Reflection journaling     | G (W29) | reflection-prompt.ts               |

Plus three additional behavioural shapes that landed via implementation:

- Tiny goals (Sprint I W37 — twist-vote.ts)
- Identity reinforcement #2 (Sprint I W37 — formatTwistStreakIdentity)
- Variable reward / curiosity (Sprint J W42 — formatViralChipCopy with FOMO-rejection discipline)

## Founder-unlock contract status (final)

| Slot                     | Substrate shipped | Founder action waiting                    |
| ------------------------ | ----------------- | ----------------------------------------- |
| Clerk auth               | Y2 W1             | `CLERK_SECRET_KEY` env                    |
| Postgres                 | Y2 W2 (8 tables)  | `DATABASE_URL` + `pnpm db:push`           |
| R2 photo storage         | Y2 W3+W4          | 4 R2 env vars                             |
| V3 trainer real-mode     | Y2 W6-W10         | Real-cohort eval + flag flip              |
| Push notifications       | Y2 W20            | VAPID keys                                |
| Voice conversational LLM | Y2 W28            | `ANTHROPIC_API_KEY`                       |
| Voice-to-draft pipe      | Y2 W31-W33        | `ANTHROPIC_API_KEY` (shared with W28)     |
| Pod agentic recipe pick  | Y2 W35            | `ANTHROPIC_API_KEY` (shared)              |
| Agentic web search       | Y2 W39            | `TAVILY_API_KEY` (or Brave / SerpAPI)     |
| Viral recipe extraction  | Y2 W41            | `ANTHROPIC_API_KEY` (shared)              |
| Charity Stripe charges   | Y2 W49            | `STRIPE_SECRET_KEY` + verified nonprofits |

**Eleven distinct stub-mode-V1 substrates.** Three founder-unlock keys (Clerk + DB + Stripe + R2 + VAPID + Anthropic + Tavily) cover the entire surface area of Y2's gated capabilities.

## RCAs on main: zero

44-week streak (Sprints A through L). Across 12 sprints + 52 weeks of original engine + UI work, zero root-cause analyses landed on main.

H2 mid-sprint catches that never reached main (sample):

- Sprint G W27: should-i regex literal-trailing-space conflict + morphology stem mismatch → caught at first test run
- Sprint H W31: silence-detector custom-threshold test math wrong → corrected
- Sprint I W35: agentic picker sorted by id rather than slug → caught by determinism test
- Sprint J W39: search adapter sanitiser stripped Unicode letters → caught by café/naan test
- Sprint J W40: virality regex over-matched "Mango" → tightened with digit+magnitude requirement
- Sprint K W44: vocab seed had alias = canonical duplicates → caught by seed-data sanity
- Sprint L W48-W51: 4 mid-sprint catches (alias dupes, form encoding, money formatting, multiplier validation)

The four-gate discipline (lint + typecheck + test + build) plus targeted seed-data sanity tests + determinism-of-pure-helpers tests pre-empted every issue that would have RCA-landed.

## Recon discipline retrospective (W11 → W52)

Stefan's W11 review triggered the framework. By Y2 close:

- 12 patterns documented in `docs/UX-RECON-FRAMEWORK.md`.
- Per-sprint primary target named in each IDEO doc (Sprints C through L).
- One full surface upgrade landed (Today result-stack at W11 — patterns #1 + #2 + #3 + #4).
- Eleven sprints with substrate ready for surface integration.

The substrate-first pattern + the recon discipline composed: every later sprint shipped the data layer + the helper layer for its target pattern, and the visual surface integration is queued for backfill weeks. Not all 12 patterns will land in Y3 H1 — but every one of them has a clear data + helper layer in place.

Backfill list at Y2 close (4 items, all surface-only):

- Pod gallery made-it ring (#10)
- Search results page eyebrow + filter chips (#2 + #9)
- Cuisine cards eyebrow + made-it ring (#2 + #10)
- Bake-sale recipe cards hero + save (#1 + #4)

These are the candidate items for a single dedicated polish week early in Y3 H1.

## What H2 looks like in one paragraph

H2's headline: **44 weeks 0-RCAs-on-main, +488 tests, 6 of 6 behavioural overlays landed, 11 founder-unlock substrates ready, every Y2 sprint closed clean.** The pattern that held across every sprint: pure-helper substrate first, surface integration deferred to backfill, structural safety (type signatures + safety gates + immutable state) over discipline-based rules. Y2 closes with the substrate for Y3 in better shape than Y1 closed for Y2 — by a wide margin.
