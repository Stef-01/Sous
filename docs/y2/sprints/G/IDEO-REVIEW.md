# Y2 Sprint G (W27-W30) — Voice conversational follow-ups

> **Plan ref:** `docs/YEAR-2-VIBECODE-PLAN.md` Sprint G
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #13 (W27+W28) + #14 (W29+W30) absorbed into
> this sprint close.

## Build state at review

- Latest commit on main: `819060a` (W29 reflection journaling).
- Test count: **1590** (was 1500 at Sprint F close — **+90 this sprint**).
- Four-gate green: lint ok, typecheck ok, test ok (1590/1590), build ok.

## What landed in Sprint G

| Week | Output                                                                                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W27  | Step-recall intent + bounded Q&A (37 tests). Three intent kinds (did-i / what-next / should-i), regex classifier, recall walker with morphology stems.                      |
| W28  | Conversational LLM fallback (30 tests). Stub-mode V1 + real-mode contract. Bounded prompt window (3 prior + current + next 1), 200-char cap, off-list ingredient rejection. |
| W29  | Reflection journaling overlay (23 tests). Pure trigger gate + note-format helper. **6th of 6 NOOM-inspired behavioural overlays now shipped.**                              |
| W30  | Sprint G close + IDEOs #13 + #14 (this doc).                                                                                                                                |

3 production commits + 1 docs commit (this).

## Behavioural overlay scoreboard — completed

All 6 NOOM-inspired overlays from Y2 workstream 3.1 are now shipped as pure helpers:

| #   | Pattern                   | Sprint  | Mechanism                                                      |
| --- | ------------------------- | ------- | -------------------------------------------------------------- |
| 1   | Anchoring                 | C (W13) | Cook-again chip references prior rating + days-ago             |
| 2   | Implementation intentions | E (W21) | Nudge "Tuesday 5:30pm — when you're heading home..."           |
| 3   | Streak forgiveness        | E (W21) | Missed-week "Skipping last Tuesday is just data..."            |
| 4   | Identity reinforcement    | E (W21) | Rhythm widget "You're a Tuesday-night cook (12 weeks running)" |
| 5   | Peak-end anchoring        | F (W26) | Win-screen "Your best of the year — barely above 87"           |
| 6   | Reflection journaling     | G (W29) | End-of-week 2-question voice prompt → stored in note field     |

Pattern that held across all 6: **pure text-formatter / trigger-detector helpers**, zero new screens, zero new components. Behavioural science changes WORDS shown, not SCREENS shown.

## UX-recon target hit (Sprint G primary)

**Surface:** servings stepper (planned per the framework table — pattern #5).
**Status:** **Deferred to backfill.** Sprint G's voice-conversational deliverables consumed the budget. The servings stepper carries to a Sprint H opportunistic landing or a dedicated backfill week.

This is acceptable per the framework's acceptance contract: pattern named, deferral explicit + rationalised. The recon discipline is about consistent attention, not about landing every pattern in its planned sprint.

## Cross-cutting wins

1. **The voice pipeline now spans 3 layers.** parse-intent (Y1 W13) → step-recall (W27) → conversation-fallback (W28). Each layer has a confidence floor; lower-confidence answers escalate cleanly to the next layer. The W28 LLM call is gated behind W27's `confident: false` flag, so cost stays bounded.
2. **6 of 6 behavioural overlays land before voice authoring (Sprint H).** All overlays now compose with each other — for example, a user finishing their last typical Saturday cook gets BOTH the peak-end anchor (W26) AND the reflection prompt (W29) on the same win-screen. Composability without coupling.
3. **The morphology stem helper (W27 keywordStems) is reusable.** "blooming" → "bloom" matching unblocked the test that prompted it; the same helper will benefit Sprint J search ("baked" matching "baking", "tomatoes" matching "tomato") when that sprint lands.

## RCA tally

0 RCAs on main this sprint.

The 0-RCAs-on-main streak now stretches **24 weeks** (Sprints A through G).

Mid-sprint catches that never reached main:

- W27: should-i regex pattern had a literal trailing space inside an alternation that conflicted with the outer `\s+`. Caught at first test run (3 tests failed, fix was 1-line regex restructure).
- W27: morphology mismatch — "blooming step" failed against "bloom the spices". Added the keywordStems helper + retried; tests went green.

## Founder-unlock status

- **ANTHROPIC_API_KEY (W28 conversational LLM):** still unset. W28 stub mode runs end-to-end today. Real-mode swap is one env-var edit; the bounded-prompt + response-validator contract is in place.
- All other H1 founder-unlock substrates unchanged.

## Carry-forward into Sprint H

- Sprint H (W31-W34) ships **voice-driven recipe authoring**. Existing substrate compounds: Y1 W18 voice transcript + W50 autogen draft + Y2 W27/W28 voice Q&A.
- Recon target per the framework table: patterns #2 + #5 + #6 (recipe-author surfaces).
- Servings stepper backfill (#5) carries forward.

## Acceptance for Sprint-G close

- [x] Step-recall intent + helpers shipped + tested (W27).
- [x] Conversational LLM fallback shipped + tested (W28).
- [x] Reflection journaling overlay shipped + tested (W29).
- [x] All 6 of 6 behavioural overlays from Y2 workstream 3.1 landed.
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #13 + #14 absorbed (this doc).

## Retrospective

Sprint G closes the behavioural-science workstream. Six pure helpers, zero new screens — exactly the shape the framework called for in Y2 W11. The voice-conversational layer is bounded by the W28 contract: even if the LLM hallucinates, the off-list ingredient rejection + 200-char cap + step-windowed prompt mean the worst case is "stub fallback fires", which the user already experiences in cold-start.

Sprint H opens with voice recipe authoring — different shape (surface-side glue rather than pure helpers) but same discipline.
