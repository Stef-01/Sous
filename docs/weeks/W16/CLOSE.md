# W16 close — voice-cook toggle in profile settings sheet

**Sprint:** D (Stage-5 W2 recipe authoring loop, but opening with
the Sprint-C carry-forward voice-cook integration)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H1 Sprint D W16
**Date closed:** 2026-05-02
**Scope:** First user-visible piece of the W12-W15 voice stack —
the Voice Cook toggle in the profile settings sheet.

## Shipped commits

| Phase | Commit    | Output                                                                            |
| ----- | --------- | --------------------------------------------------------------------------------- |
| Wave  | `d8c652e` | Voice Cook section added to `ProfileSettingsSheet` between Parent Mode and About. |

## Surfaces touched

| File                                               | Change                                                                                                                                                                                                                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/shared/profile-settings-sheet.tsx` | +55 lines / -1. Imports `Mic` icon + `useVoiceCookPref`. New `<section>` with mic-icon avatar, SectionKicker, descriptive copy, role=switch toggle wired to `voicePref.setEnabled`. Footer note explaining browser support + permission flow + per-device persistence. |

## Acceptance for W16

- [x] First user-visible voice-cook UI shipped (the toggle).
- [x] CLAUDE.md rule 3 respected — voice cook lives in the single
      Settings sheet, NOT in a new tab or separate page.
- [x] Bottom nav unchanged: Today · Path · Content.
- [x] Toggle drives `useVoiceCookPref.setEnabled` which persists
      to localStorage; survives reloads.
- [x] All four gates green: pnpm lint ✓, pnpm typecheck ✓, pnpm
      test 533/533 ✓ (no test count change; UI-only delta),
      pnpm build ✓.

## 3-loop notes

- **Loop 1 (stress)** — UI toggle only; no new pure helpers added.
  Stress coverage on the underlying `parseStoredVoiceCookPref` was
  done in W15 (13 tests including 3 stress).
- **Loop 2 (RCA)** — No bugs caught; toggle landed clean.
- **Loop 3 (improvement)** — No improvement-class delta. The
  `freshDefaultPref()` factory pattern from W15 already covers
  the persistence concerns.

When a week is purely UI-driven and consumes already-tested helpers,
the 3-loop protocol can collapse — Loop 1 doesn't add new test
surface area when the underlying pure functions already have full
coverage. Documented this as a protocol-shape note.

## Residuals

- **Toggle is connected; cook step page isn't.** The toggle persists
  the user's preference but the cook step page (`src/app/cook/[slug]/
page.tsx`) doesn't read it yet. **W17 wires the page to consume:**
  - `useVoiceCookPref.enabled` to gate the voice subsystem
  - `useVoiceTranscript` to capture speech
  - `parseCookVoiceIntent` to dispatch intents
  - `useTextToSpeech.speak` to read each step on entry
- **No empty state for unsupported browsers.** When a user toggles
  voice cook on but their browser lacks SpeechRecognition, the
  cook page should surface a friendly note. Queued for W17.
- **No microphone-permission flow yet.** The first time voice cook
  runs, the browser prompts for mic access. The UX around that
  prompt — and around denial — needs design treatment in W17.

## Retrospective (1 paragraph)

W16 is the smallest week so far (one commit, one file, +55 lines)
but it's the load-bearing first step toward the user actually
seeing voice cook. The four hooks shipped in W12-W15 were
infrastructure; this week adds the on-ramp. The toggle's hidden-by-
default placement in the settings sheet is correct: voice cook is
a power-user feature, not a default behaviour. W17's job is to make
the toggle DO something — without that integration, the user can
flip the switch but nothing changes. Sprint D's plan (recipe
authoring loop, W16-W20 in the original 12-month plan) is now
slightly delayed because Sprint C's carry-forward took W16; that
delay is acceptable because authoring is purely autonomous-buildable
work that fits the remaining W18-W20 envelope.
