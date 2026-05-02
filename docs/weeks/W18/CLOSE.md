# W18 close — MVP 1: "Done <X>" voice intent

**Sprint:** D (Stage-5 Sprint D — recipe authoring, with the new
Google-Maps-style cooking initiative woven in)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H1 Sprint D W18
**Date closed:** 2026-05-02
**Scope:** MVP 1 of the 6-stage Google-Maps cook-nav initiative.
Extend the W13 voice intent parser with step-completion detection
that respects negation.

## Shipped commits

| Phase          | Commit    | Output                                                             |
| -------------- | --------- | ------------------------------------------------------------------ |
| Wave + 3 loops | `33223a3` | `done` intent variant + `extractDoneContext` helper + 21 new tests |

## What "Done <X>" delivers

Real users cooking hands-free can now say any of:

- "done"
- "done chopping the onions" (preserves "chopping the onions" as
  context for the per-step duration log)
- "all done"
- "finished"
- "I'm done"
- "ready"

The intent maps semantically to "advance one step" (same effect
as `next`), but the `context` field carries the "what" forward
so analytics can later report "median time on the chopping step
was 3m 12s." The Google-Maps parallel: when you tell Maps you've
arrived, it logs the trip; when you tell Sous you're done, it
logs the action.

## Loop 1 — stress test results

| Test                                    | Assertion                             | Result |
| --------------------------------------- | ------------------------------------- | ------ |
| 21 new positive/negative cases          | each phrase + negation handled        | ✓      |
| 5000-char done-prefixed utterance       | survives without crash                | ✓      |
| 1000-call determinism on done utterance | identical results                     | ✓      |
| `undone`/`redone` substring trap        | does NOT false-positive               | ✓      |
| negation respected mid-utterance        | "no I'm not done" returns unknown     | ✓      |
| extractDoneContext × 4                  | bare/with-the/with/multi-word context | ✓      |

## Loop 2 RCA — regex alternation order

**Symptom:** `parseCookVoiceIntent("done with the onions")` returned
`context: "the onions"` instead of `"onions"`.

**Root cause:** regex `(?:with|the|with the)` is left-to-right
alternation. The engine tries `with` first, matches it, leaves
`the onions` in the capture group. Even though `with the` would
have matched, the engine commits to `with` because it came first
in the alternation list.

**Fix:** longer alternatives come first — `(?:with the|with|the)`.

**Pattern surfaced:** **Regex alternation order is significant for
greedy matching.** Any future intent parser using non-capturing
alternation should put the longer phrase first. Documented in the
parser's inline comment so the next contributor doesn't relearn it.

## Loop 3 improvement

No improvement-class delta beyond the Loop 2 fix. The intent shape
(separate `done` kind with `context` payload, NOT a `next` alias)
turned out to be the right architectural choice — it lets the
consumer decide whether to log + advance or just advance.

## Acceptance for W18

- [x] ≥ 6 step-completion phrasings recognised (we have 11).
- [x] No false positives on negated forms (5 tested, all bail).
- [x] No false positives on substring traps (`undone`, `redone`).
- [x] Context extraction works on "done X" / "done with X" / "done
      with the X" forms.
- [x] All four gates green: pnpm lint ✓, pnpm typecheck ✓, pnpm
      test 586/586 ✓ (was 565; +21 from W18), pnpm build ✓.
- [x] 3-loop recursive testing protocol completed; one real bug
      caught + fixed in Loop 2.

## Residuals

- **Live integration is W19.** The cook step page doesn't dispatch
  the new `done` intent yet. W19 (MVP 2: Voice-narrated step
  playback) is when the page actually consumes the intent + logs
  the context.
- **Locale: en-US only.** Phrase lists are English. The negation
  check is also language-specific (Spanish "no" overlaps; "still"
  doesn't translate cleanly). Locale expansion is a Sprint-J task.
- **Per-step duration log isn't persisted yet.** The `context` is
  available to consumers but no localStorage hook stores it. That
  ships when we have a real consumer (W19 or W20).

## Retrospective (1 paragraph)

The pure-helper architecture of the W13 parser paid off again
here: extending it from 9 intent kinds to 10 took ~30 lines of
production code + 21 tests. The negation-gate-first pattern (check
negations as a substring before any positive-form match) is the
right shape for any natural-language parser; documented for future
intent-parser work. Most-useful detail: Stefan's directive
explicitly called out "I'm not done" must NOT fire next — that's
the kind of precise spec point that separates a feature people
trust from one they fight.
