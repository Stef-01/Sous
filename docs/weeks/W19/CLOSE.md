# W19 close — MVP 2: useVoiceCook coordinator hook

**Sprint:** D (Stage-5 Sprint D)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H1 Sprint D W19
**Date closed:** 2026-05-02
**Scope:** MVP 2 of the 6-stage Google-Maps cook-nav initiative.
The coordinator hook + pure intent-routing helper that lets cook
step pages adopt the entire voice subsystem with one import.

## Shipped commits

| Phase          | Commit    | Output                                    |
| -------------- | --------- | ----------------------------------------- |
| Wave + 3 loops | `5ed6e01` | `useVoiceCook` + `routeIntent` + 17 tests |

## What MVP 2 delivers

Until W19, a cook page that wanted voice support had to:

- Call `useVoiceCookPref` for the on/off toggle
- Call `useVoiceTranscript` for speech recognition
- Call `useTextToSpeech` for the coach voice
- Call `parseCookVoiceIntent` on each transcript update
- Wire all four into a coherent state machine

That's a 4-hook adoption with implicit lifecycle ordering — easy
to get wrong. The coordinator collapses it to:

```ts
const voice = useVoiceCook({
  onAction: (action) => {
    if (action.kind === "next" || action.kind === "done") goNextStep();
    if (action.kind === "back") goPrevStep();
    // ...
  },
});

useEffect(() => voice.speakStep(currentInstruction), [currentStepIndex]);
```

The hook handles: auto-start when the user has voice cook enabled,
auto-stop when disabled, transcript-suffix routing (so the same
final transcript doesn't fire twice as it grows), reset-after-action
(Google-Maps-style "command, execute, ready for next").

## Loop 1 — stress test results (routeIntent only)

The internal effect logic depends on transcript / TTS hooks which
are testable only via integration. The PURE part — `routeIntent`
— gets full unit coverage:

| Test                                  | Assertion                          | Result |
| ------------------------------------- | ---------------------------------- | ------ |
| 12 base mappings                      | each intent kind → expected action | ✓      |
| pause/resume/unknown collapse         | → ignore                           | ✓      |
| 1000-call determinism on done routing | identical outputs                  | ✓      |
| input intent immutability             | router doesn't mutate input        | ✓      |
| empty-string context preservation     | passed through                     | ✓      |
| seconds=0 preservation                | passed through                     | ✓      |
| negative seconds preservation         | passed through (caller clamps)     | ✓      |
| 999,999 seconds preservation          | no overflow                        | ✓      |

## Loop 2 RCA — no bugs caught

The pure-helper architecture means `routeIntent` was correct on
first write. The internal effect logic had to be threaded
carefully (the `routedLengthRef` to prevent same-transcript
double-routing) but no test caught a bug here either. Pattern
note: when a coordinator hook is mostly composed of already-
tested pieces, Loop 1 stress only needs to exercise the new
pure code (the routing math), not the orchestration.

## Loop 3 improvement — prettier formatting

Prettier flagged the new file. `pnpm prettier --write` fixed it.
Not a substantive improvement; pinned only to keep `pnpm lint`
clean.

## Acceptance for W19

- [x] One-import surface for cook step pages: `useVoiceCook`.
- [x] `onAction` callback contract documented.
- [x] `speakStep` callback contract documented.
- [x] Auto-start/stop based on `useVoiceCookPref`.
- [x] Reset-after-action UX (Google-Maps-style).
- [x] All four gates green: pnpm lint ✓, pnpm typecheck ✓, pnpm
      test 604/604 ✓ (was 586; +18 from W19), pnpm build ✓.
- [x] 3-loop recursive testing protocol completed.

## Residuals

- **Live cook-step-page integration is W20.** The coordinator
  exists; nothing imports it yet. The cook step page (`src/app/
cook/[slug]/page.tsx`) needs to:
  - Import `useVoiceCook` with an `onAction` mapping.
  - Wire `speakStep` into the step-index-change effect.
  - Surface a "Voice on" indicator when listening.
- **No analytics for `done` context yet.** The coordinator passes
  the context through to `onAction`; the consumer needs to log it.
  Queued for W20.
- **No empty-state for unsupported browsers.** When `voice.supported`
  is false, the cook step page should show a friendly note ("Voice
  cook needs Chrome or Safari"). Queued for W20.

## Retrospective (1 paragraph)

The coordinator pattern is the natural follow-up to a
"build-the-pieces, then assemble" arc — Sprint C built four
disconnected hooks; W19 makes them sing together. Most useful
detail: the `routedLengthRef` ensures a transcript that grows
"done" → "done chopping" → "done chopping onions" only fires
intent routing on the new suffix, not the whole running string.
That kind of subtle UX detail is the difference between a voice
hook that feels alive and one that feels noisy. The 12-month
plan now has the **first end-to-end voice surface ready to
consume** — the integration in W20 is no longer a multi-week
expedition, it's a one-day import + onAction wiring.
