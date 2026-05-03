# Y2 Sprint H (W31-W34) — Voice-driven recipe authoring substrate

> **Plan ref:** `docs/YEAR-2-VIBECODE-PLAN.md` Sprint H
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #15 (W31+W32) + #16 (W33+W34) absorbed
> into this sprint close.

## Build state at review

- Latest commit on main: `2dff148` (W33 mic visual state).
- Test count: **1639** (was 1590 at Sprint G close — **+49 this sprint**).
- Four-gate green: lint ok, typecheck ok, test ok (1639/1639), build ok.

## What landed in Sprint H

| Week | Output                                                                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| W31  | Silence detector pure helper — 13 tests. shouldStopForSilence with min-transcript gate + clock-skew defence + custom threshold support. |
| W32  | Voice-to-draft pipe — 18 tests. scrubVoiceTranscript filler stripping + voiceTranscriptToDraft prompt-bundle composer.                  |
| W33  | Mic visual state + transcript truncation — 18 tests. Three-state mic bucket + word-boundary truncation.                                 |
| W34  | Sprint H close + IDEOs #15 + #16 (this doc).                                                                                            |

3 production commits + 1 docs commit (this).

## What's deferred (substrate ready, surface integration waits)

The W31 plan calls for a UI toggle on `/path/recipes/quick-add` (Type/Voice mode switch). The substrate that the toggle hangs off lands in this sprint:

- silence detector (W31)
- voice-to-draft pipe (W32)
- mic visual state + transcript truncation (W33)

But the UI surface integration (the toggle, the mic button rendering, the route handler that consumes the prompt bundle) is deferred to a follow-on commit. That's because:

1. The pure helpers are end-to-end tested in isolation.
2. The hook layer (around `useVoiceTranscript`) needs RTL hook-mock infrastructure that the existing test harness doesn't yet have.
3. The route handler that calls Anthropic with the prompt bundle requires the W28 ANTHROPIC_API_KEY founder-unlock to validate end-to-end.

Substrate-first pattern again — three layers ready, one config edit + one UI surface commit away from end-to-end.

## UX-recon target hit (Sprint H primary)

**Surface:** recipe-author quick-add (planned per the framework — patterns #2 + #5 + #6).
**Status:** **Substrate ready, surface deferred** alongside the rest of the Sprint H surface integration. Pattern #5 (servings stepper) carries forward from Sprint G's deferral.

Acceptable per the framework's contract. The recon discipline maintained — patterns named, deferrals rationalised.

## Cross-cutting wins

1. **The voice pipeline now spans 5 layers.** parse-intent (Y1 W13) → step-recall (W27) → conversation-fallback (W28) → silence detector (W31) → voice-to-draft (W32). Each pure, each individually tested, all composable.
2. **Filler-word stripping is conservative + safe.** "like, " (with comma) is treated as filler; semantic "tastes like lemon" is preserved. The first draft over-stripped on bare "like" — caught at first test run, fixed in one regex tweak. The pattern: keep filler-strip lists narrow and tested.
3. **100 test files crossed at W31.** Pure-helper discipline keeps adding test surface without test-infrastructure complexity.

## RCA tally

0 RCAs on main this sprint.

The 0-RCAs-on-main streak now stretches **28 weeks** (Sprints A through H).

Mid-sprint catches that never reached main:

- W31: silence-detector "custom threshold respected" test had bad math (gap=4000, threshold=5000 should be no-stop, not stop). Caught at first run, test fixed.
- W32: scrubVoiceTranscript over-stripped "like" without the comma form. Regex tightened to require the comma.

## Carry-forward into Sprint I

- Sprint I (W35-W38) ships **Pod V2 agentic recipe pick + voted twist**. The W28 Anthropic substrate compounds: Sprint I's W35 agentic-picker uses the same stub-mode-V1 + structured-output pattern.
- Recon target per the framework: patterns #9 (filter chips) + #10 (made-it ring) — Pod gallery + members.
- The deferred quick-add surface integration carries to a Sprint I or J opportunistic landing once ANTHROPIC_API_KEY is set.

## Acceptance for Sprint-H close

- [x] Silence detector substrate shipped + tested (W31).
- [x] Voice-to-draft pipe shipped + tested (W32).
- [x] Mic visual state + transcript truncation shipped + tested (W33).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #15 + #16 absorbed (this doc).

## Retrospective

Sprint H closes the voice-authoring substrate cleanly. Three pure helpers, 49 new tests, zero new screens — exactly the shape Sprint G established. The surface-integration deferral is honest: the substrate is there, the hooks for it are there, the test surface is there; the actual UI thread-through waits for the API key + RTL hook-mock infrastructure.

Sprint I opens with the agentic Pod recipe picker — different domain (community), same stub-mode-V1 pattern.
