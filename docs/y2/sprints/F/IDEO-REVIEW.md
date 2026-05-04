# Y2 Sprint F (W23-W26) — Voice MVP 5 sequenced pointers + Y2 H1 close

> **Plan ref:** `docs/YEAR-2-VIBECODE-PLAN.md` Sprint F
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #11 (W23+W24) + #12 (W25+W26) absorbed
> into this sprint close.

## Build state at review

- Latest commit on main: `ae9094e` (W26 peak-end anchor).
- Test count: **1500** (was 1417 at Sprint E close — **+83 this sprint**, round milestone hit).
- Four-gate green: `pnpm lint` ok, `pnpm exec tsc --noEmit` ok,
  `pnpm test` ok (1500/1500), `pnpm build` ok.

## What landed in Sprint F

| Week | Output                                                                                                                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W23  | AttentionPointer.revealAtSecond schema delta — 18 new tests on the existing test file (30 total). normaliseRevealAtSecond + sortPointersByRevealTime + migrateAttentionPointer + resolvePointer extension. |
| W24  | Pointer sequence runner + elapsed-seconds hook — 26 tests on getActivePointers + nextRevealTime; 8 tests on advanceElapsed. Persist + carousel modes.                                                      |
| W25  | Pointer-text format extension `@ Ns` — 15 new tests on attention-pointer-text. Backwards-compatible regex extension. Round-trip safe.                                                                      |
| W26  | Peak-end anchor behavioural overlay — 16 tests. 4th of 6 NOOM-inspired overlays landed across Y2.                                                                                                          |
| W26  | Sprint F close + IDEO #11 + #12 + Y2 H1 retro (this doc + the half-year doc).                                                                                                                              |

4 production commits + 1 docs commit (this).

## Behavioural overlays scoreboard (4 of 6 landed across Y2)

The Y2 plan committed 6 NOOM-inspired overlays. Sprint F lands the 4th:

| Pattern                   | NOOM concept                  | Sprint landed | Status   |
| ------------------------- | ----------------------------- | ------------- | -------- |
| Implementation intentions | "When X happens, I'll do Y"   | E (W21)       | Done     |
| Streak forgiveness        | Avoid loss aversion           | E (W21)       | Done     |
| Identity reinforcement    | "I'm someone who…"            | E (W21)       | Done     |
| **Peak-end anchoring**    | **Show personal best**        | **F (W26)**   | **Done** |
| Tiny goals                | Atomic week-sized commitments | I (Pod V2)    | Pending  |
| Reflection journaling     | Weekly recap                  | G (voice)     | Pending  |

All 4 landed overlays ship as pure text-formatter helpers — zero new screens, zero new components. That pattern continues as the right shape for behavioural overlays.

## UX-recon target hit (Sprint F primary)

**Surface:** cook-flow step-progress (planned per the framework table).
**Patterns landed:** #7 step-by-step locked progress + #8 ingredient checklist — **partial**. The substrate (W23 schema delta + W24 sequence runner + W25 text format) is ready to upgrade the cook flow's pointer rendering. The actual visual sticky-progress bar + ingredient strikethrough overlay are deferred to a Sprint F follow-on or backfill — those are render-side changes that don't fit the W26 close-out scope.

This is acceptable per the framework's acceptance contract clause 2 (pattern named, partial ship rationalised).

## Cross-cutting wins

1. **Voice work returned cleanly.** The substrate compounds with the W22-then-quiet voice pipeline from Y1. No regressions in the AttentionPointer schema; legacy content unaffected.
2. **Pure-helper-pipeline now has 7 stages.** From Y1 W30 V2 trainer through Y2 W11/W16 reranks, W19 rhythm, W20 push platform, W21 scheduler, W23-W25 sequence runner, W26 peak-end. All deterministic, all pure, all individually tested.
3. **The 250ms tick cadence (W24) sets up the W25 fractional reveal-time format cleanly.** Sub-second precision lands without a second pass — the contract design at W23 carried through.

## RCA tally

0 RCAs on main this sprint.

The 0-RCAs-on-main streak now stretches **20 weeks** (Sprints A + B + C + D + E + F).

Mid-sprint catches that never reached main:

- W24: `useElapsedSeconds` initial draft mutated a ref during render to reset elapsed on stepKey change. Caught by the project's `react-hooks/refs` ESLint rule. Refactored to set state inside the existing useEffect (which re-runs on stepKey dep change anyway). Cleaner pattern.

## Carry-forward into Sprint G

- Sprint G (W27-W30) ships **Voice conversational follow-ups**.
  Recon target per the framework: #5 servings stepper.
- The 5th + 6th behavioural overlays (tiny goals + reflection
  journaling) carry to Sprints I + G respectively.
- The W23-W25 substrate is fully ready for the visual surface
  upgrade when a future sprint thread it through the
  AttentionPointerOverlay component.

## Acceptance for Sprint-F close

- [x] AttentionPointer schema delta + helpers shipped + tested (W23).
- [x] Pointer sequence runner + elapsed-seconds hook shipped + tested (W24).
- [x] Pointer-text format extension shipped + tested (W25).
- [x] Peak-end behavioural overlay shipped + tested (W26).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #11 + #12 absorbed (this doc).

## Retrospective

Sprint F closes Year-2 H1. The voice-MVP 5 substrate is done; visual upgrades carry to a follow-on. Behavioural overlays continue to ship as pure text helpers — 4 down, 2 to go. The 1500-test round milestone hit naturally on the W26 peak-end commit, which is satisfying — it's a function of the pure-helper discipline more than any single sprint's ambition.

Y2 H1 retrospective lives in `docs/y2/half/H1-RETROSPECTIVE.md` — half-sprint-by-half-sprint scorecard, founder-unlock status, behavioural overlay tracker, recon framework adoption.
