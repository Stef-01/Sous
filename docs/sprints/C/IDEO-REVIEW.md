# Sprint C (W11-W15) — IDEO Design Review

> Closes Sprint C per `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md`.
> Sprint focused on **Stage-5 W1: voice-driven cook mode** — three
> hooks (`useVoiceTranscript`, `useTextToSpeech`, `useVoiceCookPref`)
> plus the pure intent-parser. Plus **W11 cook/combined density
> refactor** as the long-deferred Sprint-A and Sprint-B carry-forward.

## Review date

2026-05-02

## Build state at review

- Latest commit on main: pending (post-W15 close commit).
- Test count: **533** (was 432 at Sprint-B close — **+101 over the
  sprint** from new helper suites + voice-stack tests).
- Four-gate green: pnpm lint ✓, pnpm typecheck ✓ (NEW gate
  introduced this sprint), pnpm test ✓, pnpm build ✓.

## What landed in Sprint C

| Week | Commit(s)             | Output                                                                                                                                                                         |
| ---- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| W11  | `f147caf`             | `cook/combined` shaper extraction (5 pure helpers, 25 tests, page line count 1,126→1,117), `pnpm typecheck` script added, RCA on the wave-A type-narrowing build break.        |
| W12  | `8ad04bd`             | `useVoiceTranscript` hook + `detectSpeechRecognitionCtor` + 9 tests. State-based, last-write-wins, unmount-cancel.                                                             |
| W13  | `9a5b834` + `78af71f` | `parseCookVoiceIntent` + `parseDurationPhrase` + `normaliseUtterance` + 38 tests. 2 RCAs from Loop 1 stress (half-a-minute double-count, emoji-strip).                         |
| W14  | `74f98ba` + `f5a94c2` | `useTextToSpeech` hook + `pickVoiceForLang` + 16 tests. Same lifecycle contract as W12 (state-based, last-write-wins, unmount-cancel).                                         |
| W15  | (HEAD pending)        | `useVoiceCookPref` (persisted user preference) + `parseStoredVoiceCookPref` + 13 tests. 2 RCAs from Loop 1 stress (DEFAULT_PREF shared mutable state, JSON null payload trap). |

## Surface scoreboard delta

Sprint C didn't surface any new user-facing routes — the work was
all infrastructure (pure helpers + state-based hooks). The
`/cook/combined` page got a -9 line reduction (1,126 → 1,117) but
its IDEO score is unchanged at 3.25 because the visible UX hasn't
changed; the next density wave (visual sub-component extractions
flagged in W11 residuals) is W16+ work.

## RCA tally

5 RCA-worthy moments across Sprint C, all caught by the per-week
3-loop protocol's Loop 1 stress tests:

1. **W11** — pure-helper extraction widened a union-arm type,
   broke the build at the consumer prop. Fix: defensive coalesce
   at the prop boundary. Pattern documented in
   `docs/weeks/W11/RCA-helper-type-narrowing.md`.
2. **W12** — `react-hooks/set-state-in-effect` strict-rule lint
   failure on capability-check effect. Fix: eslint-disable block
   with rationale (codebase-standard pattern).
3. **W13a** — `half a minute` double-counted as 90s. Fix: replace
   half-minute phrase with empty placeholder before the minutes
   regex runs.
4. **W13b** — `next 🍝` emoji-trailed utterance returned unknown.
   Fix: `normaliseUtterance` now strips `[^a-z0-9\s]` before
   phrase matching.
5. **W15** — `DEFAULT_PREF` shared mutable state leaked across
   parser calls; `JSON.parse("null")` → null caused property-
   access throw. Fix: `freshDefaultPref()` factory + object-shape
   gate before destructuring.

## Cross-cutting wins this sprint

1. **The 3-loop protocol earned its keep.** 5 RCA-worthy moments
   caught + fixed inside the same commit cycle they were
   introduced. None of them shipped to users.
2. **`pnpm typecheck` script added** (W11 Loop 3) — closes a CI
   gap that had been carried since day one. Now part of the
   per-week four-gate sweep.
3. **State-based hook contract is consistent across the voice
   subsystem.** `useVoiceTranscript` (W12), `useTextToSpeech`
   (W14), `useVoiceCookPref` (W15) all expose state-only views,
   all cancel-on-unmount, all graceful-no-op when the platform
   API is absent.
4. **Pure helpers + per-helper test files standardised.** Every
   week shipped helpers extracted from page logic into
   `src/lib/voice/` or `src/lib/cook/` with their own test files.
   No DOM, no hook deps in the test suites.

## Carry-forward into Sprint D (W16-W20: recipe authoring loop)

Sprint D is **Stage-5 W2: recipe authoring loop** per the 12-month
plan. Carry-forward below should slip into early Sprint-D days
or get explicit deferral markers.

**Mandatory:**

1. **Live integration of the voice-cook stack** — W12-W15 shipped
   four hooks but no UI consumes them yet. Wiring the cook step
   page (`src/app/cook/[slug]/page.tsx`) to consume all four is
   queued for **Sprint-D W16 or W17 at the latest**. Without
   integration, the test count climbs but the user sees nothing.
2. **`/cook/combined` density wave 2** — the -9 line reduction in
   W11 cleared the easy data-shaper extractions; the next wave is
   visual-component extraction (dual-track step-progress strip,
   parallel-hint banner). Risky enough to need its own week.
3. **`pnpm typecheck` in CI / pre-commit hook.** Currently a
   manual gate; needs Husky + a `lint-staged`-style entry.

**Queued (deferred to dedicated sprints):**

- Voice cook locale support (en-US only today; i18n shim exists).
- Voice cook fuzzy matching (homophones, misspellings).
- Sprint D itself: schema + ingredient-list builder + step builder
  - share affordance (W16-W20 in the plan).

## Acceptance for Sprint-C close

- [x] Every score ≤ 2 from Sprint-B IDEO carry-forward addressed
      (W11 cook/combined refactor — wave A landed).
- [x] No regression in any screen scored ≥ 4 at Sprint-B close.
- [x] Test count monotonic-non-decreasing (432 → 533, +101).
- [x] Build green throughout the sprint.
- [x] All 5 RCA-worthy moments documented with fix + test.
- [x] Top mandatory carry-forward items locked into Sprint-D plan.

Sprint D opens with **voice-cook live integration** as W16's first
deliverable so the four shipped hooks aren't sitting on the shelf.
