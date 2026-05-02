# W13 close — voice intent parser

**Sprint:** C (Stage-5 W1 voice-driven cook mode)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H1 Sprint C W13
**Date closed:** 2026-05-02
**Scope:** turn voice transcripts (from W12's `useVoiceTranscript`)
into typed cook commands. Pure-function parser, no DOM, no hook
deps — fully testable.

## Shipped commits

| Phase          | Commit    | Output                                                                           |
| -------------- | --------- | -------------------------------------------------------------------------------- |
| Wave + 3 loops | `9a5b834` | parser + 38 tests (29 base + 9 stress) + 2 RCAs + auto-normalisation improvement |

## Surfaces touched

| File                                       | Change                                                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `src/lib/voice/parse-intent.ts` (NEW)      | 197 lines. `CookVoiceIntent` union, `normaliseUtterance`, `parseDurationPhrase`, `parseCookVoiceIntent`. |
| `src/lib/voice/parse-intent.test.ts` (NEW) | 38 vitest cases — 29 base + 9 stress (3 long-content, 2 race-condition, 4 poisoned-data).                |

## Loop 1 — stress test results

| Catalogue entry | Test                                              | Result                            |
| --------------- | ------------------------------------------------- | --------------------------------- |
| long-content    | 5000-char noise utterance                         | ✓ returns unknown without crash   |
| long-content    | "um yeah ok next" — intent buried in noise        | ✓ returns next                    |
| long-content    | 99,999 minute duration                            | ✓ preserves numeric (UI clamps)   |
| race-condition  | 1000-call determinism on `parseCookVoiceIntent`   | ✓ all returns equal               |
| race-condition  | regex.exec lastIndex safety across multiple calls | ✓ a===c, b distinct               |
| poisoned-data   | "next 🍝" emoji                                   | ✓ returns next (after Loop 2 fix) |
| poisoned-data   | "set a timer" without a number                    | ✓ returns unknown                 |
| poisoned-data   | "continue" priority (next, not resume)            | ✓ next                            |
| poisoned-data   | "stop the timer" priority (cancel, not set)       | ✓ timer-cancel                    |

## Loop 2 RCA — two real bugs Loop 1 caught

### Bug 1: `half a minute` double-counted as 90s

**Symptom:** `parseDurationPhrase("half a minute")` returned 90,
test expected 30.

**Root cause:** The `minutesRe` regex matched `"a minute"` (where
`a` is in `numericWords` as 1) → +60s. Then the half-detector
added 30s. Total 90.

**Fix:** Replace half-minute phrases with empty string BEFORE the
`minutesRe` pass. The `minutesRe` then can't see `"a minute"`
because the substring is gone, so no double-count.

**Test that pins the fix:** `parseDurationPhrase("half a minute") === 30`.

### Bug 2: emoji-trailed utterance returned unknown

**Symptom:** `parseCookVoiceIntent("next 🍝")` returned
`{ kind: "unknown" }`, test expected `{ kind: "next" }`.

**Root cause:** Phrase matchers used `normalised === phrase` or
`normalised.endsWith(\` \${phrase}\`)`. With the emoji at the end,
the normalised string was `"next 🍝"` (lowercase + non-letter
preserved), and neither equality nor endsWith matched.

**Fix:** `normaliseUtterance` now strips `[^a-z0-9\s]` — emoji,
unicode symbols, and any non-letter glyph — between the
punctuation strip and the whitespace collapse.

**Test that pins the fix:** `parseCookVoiceIntent("next 🍝") === { kind: "next" }`.

### Pattern surfaced

Phrase matching is brittle to trailing decorative characters.
**Rule:** any text-based intent parser MUST normalise to a
known-letter alphabet before matching. The codebase-wide
implication: anywhere a string is matched against a literal
phrase list, the input should pass through a `[^a-z0-9\s]`-strip
first. (Currently this only matters for voice-cook; if other
text intents land later — search query parsing, etc. — they
should adopt the same shape.)

## Loop 3 improvement — auto-normalisation

`parseCookVoiceIntent` now auto-applies `normaliseUtterance` on
its input. Callers can pass raw transcripts; the function is
idempotent on already-normalised strings (re-normalising drops
nothing because the alphabet is already restricted to letters).

This means W14's hook-side adoption can be:

```ts
useEffect(() => {
  if (!transcript) return;
  const intent = parseCookVoiceIntent(transcript);
  dispatch(intent);
}, [transcript]);
```

— no normalisation step in the consumer.

## Acceptance for W13

- [x] All cook-voice intents documented + tested (next, back,
      repeat, timer-set, timer-cancel, timer-status, timer-add,
      pause, resume, unknown).
- [x] Duration parser handles digit + word numerals, singular +
      plural, combined min+sec, half-minute special cases.
- [x] Auto-normalisation contract decided + tested.
- [x] All four gates green: pnpm lint ✓, pnpm typecheck ✓, pnpm
      test 504/504 ✓ (was 466 at W12 close; +38 from the
      parse-intent suite), pnpm build ✓.
- [x] 3-loop recursive testing protocol completed; 2 real bugs
      caught + fixed in Loop 2.

## Residuals

- **Hook-side adoption is W14.** This week is the parser only.
  Wiring it into `useVoiceTranscript` + dispatching into the cook
  step page's reducer is W14 alongside TTS coach voice.
- **Locale support is en-US only.** Phrase lists hardcode English.
  Spanish + others queued for W15+ (the i18n shim landed in
  Stage-3 W22a, so the localisation contract exists).
- **No fuzzy matching.** Misspellings and homophones get `unknown`.
  If a user says "necks" instead of "next", the parser bails. A
  future improvement could add a Levenshtein-distance fallback
  but only if usage data shows it's needed.

## Retrospective (1 paragraph)

Loop 1 caught two real bugs that would have shipped to production
otherwise. That's the protocol earning its keep — the stress tests
weren't theatrical; they exercised conditions the basic tests
didn't (decorative emoji at the end of an utterance, the
numeric-word "a" colliding with the half-minute special case).
The Loop-2 fixes both came in under 5 minutes because the test
failures pinpointed the exact location and the parser's pure-
function shape made the change risk-free. The single-most-useful
architectural choice was making `parseCookVoiceIntent` auto-
normalise: it removes a footgun for W14 callers while keeping the
function idempotent.
