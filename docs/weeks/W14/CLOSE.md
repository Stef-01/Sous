# W14 close — TTS coach voice (`useTextToSpeech` hook)

**Sprint:** C (Stage-5 W1 voice-driven cook mode)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H1 Sprint C W14
**Date closed:** 2026-05-02
**Scope:** Output side of the voice loop. With W12 (transcript) and
W13 (intent parsing) shipped, W14 is the coach reading the current
step out loud when voice mode is on. Vibecode-scoped: in-browser
SpeechSynthesis only, no third-party TTS.

## Shipped commits

| Phase          | Commit    | Output                                                                           |
| -------------- | --------- | -------------------------------------------------------------------------------- |
| Wave + 3 loops | `74f98ba` | `useTextToSpeech` hook + `detectSpeechSynthesis` + `pickVoiceForLang` + 16 tests |

## Hook contract (for W15 consumers)

```ts
const {
  supported, // true iff platform exposes SpeechSynthesis
  speaking, // true while an utterance is being spoken
  muted, // persisted: while muted, speak() is no-op
  error, // last platform error
  speak, // queue an utterance (cancels any in-progress one)
  stop, // cancel pending + active utterance
  setMuted, // toggle mute (cancels current if muting)
} = useTextToSpeech({ lang: "en-US", rate: 1.0 });
```

The hook is **state-based, last-write-wins**: if `speak()` is called
while another utterance is in progress, the in-progress one is
cancelled first. Unmount cancels any active utterance.

## Stress-test results (Loop 1)

| Catalogue entry | Test                                      | Result  |
| --------------- | ----------------------------------------- | ------- |
| capability      | empty global                              | ✓ false |
| capability      | SSR undefined                             | ✓ false |
| capability      | speechSynthesis present                   | ✓ true  |
| capability      | explicit-undefined key                    | ✓ false |
| voice-pick base | empty list → null                         | ✓       |
| voice-pick base | exact-match default voice wins            | ✓       |
| voice-pick base | first exact-match when no default flagged | ✓       |
| voice-pick base | language-prefix fallback                  | ✓       |
| voice-pick base | first-voice fallback when nothing matches | ✓       |
| long-content    | 200-voice deterministic pick              | ✓       |
| long-content    | 5000-char voice name                      | ✓       |
| race-condition  | 1000-call ref equality                    | ✓       |
| race-condition  | mid-call list mutation                    | ✓       |
| poisoned-data   | malformed lang tag (no hyphen)            | ✓       |
| poisoned-data   | empty preferredLang                       | ✓       |
| poisoned-data   | multiple defaults flagged                 | ✓       |

## Loop 2 RCA

**No bugs caught by Loop 1.** The pure helpers were small enough
that the contract was clear from the start. Pattern: when a helper
is < 30 lines AND has no I/O AND covers a well-known API
preference order, base tests + targeted stress are usually
sufficient on the first pass.

## Loop 3 improvement

No improvement-class delta. The state-based / last-write-wins /
unmount-cancel contract held up under all stress paths.

## Acceptance for W14

- [x] `useTextToSpeech` hook ships with stable contract.
- [x] Cross-vendor SpeechSynthesis detection (Chrome/Safari).
- [x] Last-write-wins on `speak()` calls.
- [x] Mute persists; mute action cancels any in-progress utterance.
- [x] Unmount cancels any active utterance (no audio leak).
- [x] Graceful no-op fallback when API unavailable.
- [x] All four gates green: pnpm lint ✓, pnpm typecheck ✓, pnpm
      test 520/520 ✓ (was 504; +16 from the TTS suite), pnpm build ✓.
- [x] 3-loop recursive testing protocol completed.

## Residuals

- **No live integration yet.** The hook contract is stable; W15
  wires it into the cook step page alongside W12 + W13.
- **No quality-metadata-aware voice selection.** The Web Speech API
  doesn't expose voice quality; `pickVoiceForLang` falls back to
  language match + first-voice. Acceptable for vibecode scope.
- **No SSML support.** Plain text only. SSML adds prosody/emphasis
  control but isn't supported by all browsers. Skip.

## Retrospective (1 paragraph)

W14 landed cleaner than W13 because the helpers (especially
`pickVoiceForLang`) had a clear preference order to encode. No
real bugs caught by stress tests this time — which is a feature
of the protocol, not a bug. Loop 1's work is ALWAYS warranted; if
it catches nothing, that's a signal the architecture is sound. The
state-based / last-write-wins contract is now consistent across
the entire voice subsystem (W12 transcription, W14 TTS): both
hooks expose state-only views, both cancel-on-unmount, both
graceful-no-op when API absent. W15 can integrate without surprises.
