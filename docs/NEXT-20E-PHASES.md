# NEXT 20 PHASES — Sprint E: Inline Substitution + Voice Cook Pilot

Purpose: a two-feature sprint that (1) completes the ingredient substitution
loop with a long-press affordance on the Grab screen, and (2) ships a
feature-flagged voice-command pilot during the Cook phase. Both features build
on existing plumbing (NEXT-20D P13 substitution memory, Stage 0.5 P12
read-aloud, NEXT-20D P12 double-tap re-read) and are directly sourced from
STRATEGY.md §11.4 and §12.2.

Every phase must pass the Sous Test, preserve the no-settings-page rule, and
leave `pnpm lint`, `pnpm test`, `pnpm build` green. All phases ship directly to
`main`.

## Non-negotiables

- No invented dishes or images — all new UI runs on existing data only.
- No new settings pages. Preferences are learned, never configured.
- Voice pilot ships behind a feature flag (`VOICE_COOK_ENABLED`). Default off.
- Every new surface stays silent until real data is available.
- Minimalist bias: one icon, one inline row, one toast — nothing more.

---

## Feature A — Long-Press Ingredient → Inline Substitute (P1–P6)

**STRATEGY.md ref:** §11.4 (Yummly — Contextual Ingredient Substitution Nudge)
**Moat strengthened:** Engine moat (intelligent recommendations) + Data moat
(substitution memory deepens preference model)
**Existing plumbing:** `ai.suggestSubstitution` endpoint (live),
`useSubstitutionMemory` hook (NEXT-20D P13, 90-day per-dish/per-ingredient TTL),
`IngredientList` component with checkbox + "I don't have this" flow.

### Phase 1 — `useLongPress` hook

Create `src/lib/hooks/use-long-press.ts`. A lightweight hook that fires a
callback after a configurable hold duration (default 500ms). Must handle:

- Touch devices: `onTouchStart` → timer → `onTouchEnd`/`onTouchMove` cancel
- Mouse: `onMouseDown` → timer → `onMouseUp`/`onMouseLeave` cancel
- Haptic feedback: call `navigator.vibrate(10)` if available (silent no-op if not)
- Cancel on scroll: attach a passive `touchmove` listener that cancels if
  cumulative deltaY > 10px (prevents false fires while scrolling ingredient list)
- Returns `{ onTouchStart, onTouchEnd, onTouchMove, onMouseDown, onMouseUp, onMouseLeave }`
  spread onto the target element

**Files:** `src/lib/hooks/use-long-press.ts`
**Tests:** `src/lib/hooks/use-long-press.test.ts` — 4 tests: fires after hold,
cancels on early release, cancels on scroll, respects custom duration.
**LOC:** ~40

### Phase 2 — Inline substitute row in `IngredientList`

Wire `useLongPress` onto each ingredient row in `IngredientList`. On long-press:

1. Show a single-line loading state below the ingredient row: italic "Finding a
   substitute..." with a subtle pulse animation
2. Call the existing `ai.suggestSubstitution` tRPC endpoint with
   `{ ingredientName, dishSlug, cuisineFamily }`
3. On success, replace loading with the substitute text in a warm chip:
   "→ Try: [substitute]" with an `ArrowRightLeft` icon (already imported)
4. Persist via `useSubstitutionMemory.save(dishSlug, ingredientName, substitute)`
5. Second long-press on same ingredient → instant retrieval from memory, no AI call
6. Dismiss: tap anywhere outside or swipe the chip away

**Key constraint:** No modal, no sheet, no overlay. The substitute renders
inline, pushing content down by exactly one row height (~36px). This preserves
the Grab screen's scroll position and avoids the "I lost my place" problem.

**Error path:** If the AI call fails, show "Couldn't find a substitute — try
tapping the checkbox" and fade after 3s. No retry button (keeps UI clean).

**Files:** `src/components/guided-cook/ingredient-list.tsx` (modify)
**LOC:** ~50 lines added to IngredientList

### Phase 3 — "Saved as my swap" confirmation + memory hint

When a substitute is saved to memory (Phase 2 step 4), flash a brief toast:
"Saved as your swap for [ingredient]" using the existing `toast()` from
`use-toast`. Duration: 2s, position: bottom.

On subsequent visits to the same dish's Grab screen, if `useSubstitutionMemory`
has a cached substitute for an ingredient, render a subtle hint below that
ingredient row: "last time: [substitute]" in muted text (text-muted-foreground,
font-size 12px). This hint is static (no long-press needed) and reminds the user
of their past swap without requiring action.

**Files:** `src/components/guided-cook/ingredient-list.tsx` (modify)
**LOC:** ~25 lines

### Phase 4 — Accessibility pass

- `useLongPress` must also trigger on `Space` key held for 500ms when the
  ingredient row is focused (keyboard equivalent of long-press)
- Substitute row: `role="status"`, `aria-live="polite"` so screen readers
  announce the substitute when it appears
- Loading state: `aria-busy="true"` on the ingredient row during AI call
- Long-press affordance: add `aria-description="Long press for substitute"` to
  each ingredient row

**Files:** `src/lib/hooks/use-long-press.ts`, `src/components/guided-cook/ingredient-list.tsx`
**LOC:** ~15 lines

### Phase 5 — Unit + integration tests

- `use-long-press.test.ts`: 4 tests (Phase 1)
- `ingredient-list-substitute.test.ts`: 5 tests:
  1. Long-press triggers AI call and renders substitute inline
  2. Cached substitute renders instantly without AI call
  3. Error state renders fallback message and fades
  4. "Last time" hint renders on revisit with cached data
  5. Keyboard Space-hold triggers substitute flow
- Playwright: 1 assertion in existing Grab screen spec: long-press an ingredient,
  verify substitute text appears within 3s (mock AI endpoint)

**Files:** `src/lib/hooks/use-long-press.test.ts`,
`src/components/guided-cook/ingredient-list-substitute.test.ts`,
`tests/e2e/grab-substitute.spec.ts`

### Phase 6 — Lint + build verification

Run `pnpm lint && pnpm test && pnpm build`. Fix any issues. Commit Feature A
to main.

---

## Feature B — Bounded-Vocabulary Voice Commands During Cook (P7–P18)

**STRATEGY.md ref:** §12.2 (Voice-Guided Cooking — promoted from UNDER
CONSIDERATION to BUILD-PILOT)
**Moat strengthened:** Behavioral moat (cook-completion rate → cooks-per-week)
**Existing plumbing:** `StepCard` component with `onNext`/`onPrev`/`onStartTimer`,
`speechSynthesis` read-aloud (Stage 0.5 P12), double-tap re-read (NEXT-20D P12),
`useReducedMotion` gating, `useBigHands` toggle.

### Phase 7 — Feature flag infrastructure

Create `src/lib/flags/voice-cook.ts`:

```typescript
export const VOICE_COOK_ENABLED =
  typeof window !== "undefined" &&
  localStorage.getItem("sous_voice_cook") === "true";

export function enableVoiceCook() {
  localStorage.setItem("sous_voice_cook", "true");
}
export function disableVoiceCook() {
  localStorage.removeItem("sous_voice_cook");
}
```

Default: off. Enabled per-device for pilot cohort. When the pilot graduates,
this file becomes a simple `export const VOICE_COOK_ENABLED = true`.

**Files:** `src/lib/flags/voice-cook.ts`
**LOC:** ~10

### Phase 8 — `useSpeechRecognition` hook

Create `src/lib/hooks/use-speech-recognition.ts`. Wraps the browser
`webkitSpeechRecognition` / `SpeechRecognition` API with:

- **Availability check:** `isSupported` boolean. Returns false on Firefox
  (no SpeechRecognition), server, or when permission denied.
- **Bounded vocabulary mode:** `interimResults` off, `continuous` true,
  `lang` = `"en-US"`. Recognition runs continuously while active.
- **Command parsing:** Raw transcript → lowercase → trim → match against the
  5-entry command map:

  | Transcript match | Command | Action |
  |---|---|---|
  | "next", "next step" | `NEXT` | `onNext()` |
  | "back", "go back", "previous" | `BACK` | `onPrev()` |
  | "repeat", "say again", "read" | `REPEAT` | re-trigger TTS for current step |
  | "start timer", "timer" | `TIMER` | `onStartTimer(seconds)` |
  | "how long", "time left" | `STATUS` | TTS speaks remaining timer |

- **Confidence threshold:** Ignore results with `confidence < 0.6`.
- **No-match handling:** Unrecognized commands are silently ignored (no error
  toast, no "I didn't understand"). This is critical — false negatives are
  tolerable, false positives are not.
- **Auto-restart:** If recognition stops unexpectedly (browser timeout), restart
  after 500ms unless explicitly stopped.
- **Return shape:** `{ isSupported, isListening, startListening, stopListening,
  lastCommand, lastCommandTime }`

**Files:** `src/lib/hooks/use-speech-recognition.ts`
**Tests:** `src/lib/hooks/use-speech-recognition.test.ts` — mock
`webkitSpeechRecognition`, test all 5 commands map correctly, test confidence
threshold rejection, test auto-restart.
**LOC:** ~90

### Phase 9 — Microphone permission flow

Create `src/lib/hooks/use-mic-permission.ts`:

- On first activation, call `navigator.mediaDevices.getUserMedia({ audio: true })`
- Track permission state: `prompt` | `granted` | `denied`
- If denied, show a single toast: "Microphone access needed for voice commands.
  Check your browser settings." No modal, no settings page, no retry button.
- Permission is requested once and cached via the Permission API
  (`navigator.permissions.query({ name: "microphone" })`)

**Files:** `src/lib/hooks/use-mic-permission.ts`
**LOC:** ~35

### Phase 10 — Voice toggle button on `StepCard` footer

Add a single icon button to the `StepCard` footer row (alongside existing
nav arrows):

- Icon: `Mic` (from lucide-react) when inactive, `MicOff` when active
  (deliberate inversion — mic icon means "tap to activate", mic-off means
  "listening, tap to stop")
- Only renders when `VOICE_COOK_ENABLED && isSupported`
- Tap: toggles `startListening` / `stopListening`
- Visual state: when listening, the button gets a subtle pulsing ring animation
  (2s ease-in-out, opacity 0.3→0.6, red-400 ring) to indicate active listening
- `aria-label="Voice commands"` / `aria-pressed={isListening}`

**Position:** Right side of the footer, after the forward arrow. Does not
displace existing controls.

**Files:** `src/components/guided-cook/step-card.tsx` (modify)
**LOC:** ~30 lines added

### Phase 11 — Command feedback toast

When a voice command is recognized, show a brief confirmation toast at the top
of the StepCard (not the global toast — this is local to the cook screen):

- "Heard: next" / "Heard: back" / etc.
- Duration: 1.2s, fade out
- Uses the existing `motion` library for enter/exit animation
- Muted color (bg-muted, text-muted-foreground) — informational, not
  attention-grabbing
- `aria-live="assertive"` so screen readers announce it

**Files:** `src/components/guided-cook/voice-feedback-toast.tsx` (new, ~25 lines)
**LOC:** ~25

### Phase 12 — Wire commands to `StepCard` actions

In the cook page (`src/app/cook/[slug]/page.tsx` and
`src/app/cook/combined/page.tsx`), wire `useSpeechRecognition` commands to
existing StepCard callbacks:

| Command | Wiring |
|---|---|
| `NEXT` | Call `handleNext()` — same as right arrow tap |
| `BACK` | Call `handlePrev()` — same as left arrow tap |
| `REPEAT` | Call `speak(currentStep.instruction)` via existing TTS |
| `TIMER` | Call `handleStartTimer(currentStep.timerSeconds)` if step has timer |
| `STATUS` | Call `speak(\`${minutes} minutes ${seconds} seconds remaining\`)` from timer store |

**Key constraint:** Voice commands only fire during the Cook phase (not Mission,
not Grab, not Win). The hook auto-stops when navigating away from StepCard.

**Files:** `src/app/cook/[slug]/page.tsx`, `src/app/cook/combined/page.tsx`
**LOC:** ~40 lines added across both files

### Phase 13 — Hold-to-talk fallback

For noisy kitchen environments where continuous listening produces too many
false positives, add a hold-to-talk mode:

- Long-press (>300ms) on the mic button switches to push-to-talk: recognition
  starts on press, stops on release
- Visual: mic button background changes to red-100 while held
- The button label updates to "Hold to talk" via `aria-label`
- Preference persists in-session only (resets on page reload) — no settings page

**Files:** `src/components/guided-cook/step-card.tsx` (modify)
**LOC:** ~20 lines

### Phase 14 — Wake-word detection (stretch)

Optional enhancement: detect "hey Sous" as a wake word to activate listening
without tapping the mic button. Implementation:

- Continuous low-power recognition in a separate `SpeechRecognition` instance
  with `interimResults: true`
- Listen for interim results containing "hey sous", "hey souz", "a sous"
  (phonetic variants)
- On detection, activate the main command recognition for 10s, then auto-stop
- Battery consideration: only active when the cook screen is in foreground
  (`document.visibilityState === "visible"`)

**Gating:** Only ship this phase if Phase 8 accuracy testing shows >90% command
accuracy in quiet conditions. If not, skip to Phase 15.

**Files:** `src/lib/hooks/use-wake-word.ts` (new)
**LOC:** ~50

### Phase 15 — Unsupported browser fallback

When `isSupported` is false (Firefox, older Safari, WebView):

- The mic button does not render (no broken affordance)
- If the user somehow reaches the voice settings (future), show a single line:
  "Voice commands aren't available in this browser. Try Chrome or Edge."
- No feature flag change — the pilot still runs, it just self-disables on
  unsupported browsers

**Files:** Already handled by Phase 10's `isSupported` gate
**LOC:** 0 additional

### Phase 16 — Unit tests for voice pipeline

- `use-speech-recognition.test.ts`: 6 tests (Phase 8)
  1. Maps "next" → NEXT command
  2. Maps "go back" → BACK command
  3. Maps "start timer" → TIMER command
  4. Maps "repeat" → REPEAT command
  5. Maps "how long" → STATUS command
  6. Rejects low-confidence results
- `use-mic-permission.test.ts`: 3 tests
  1. Requests permission on first call
  2. Returns cached grant on second call
  3. Handles denial gracefully
- `voice-feedback-toast.test.ts`: 2 tests
  1. Renders command text
  2. Auto-dismisses after 1.2s

**Files:** test files alongside source files
**LOC:** ~80 total test code

### Phase 17 — Playwright smoke test

One E2E test: `tests/e2e/voice-cook.spec.ts`

- Mock `webkitSpeechRecognition` via `page.addInitScript`
- Navigate to a cook page for a known short dish
- Simulate recognition event with transcript "next"
- Assert step advances
- Simulate "back" → assert step goes back
- Gated behind `VOICE_COOK_ENABLED` flag in test setup

**Files:** `tests/e2e/voice-cook.spec.ts`
**LOC:** ~40

### Phase 18 — Lint + build + STRATEGY.md status update

1. Run `pnpm lint && pnpm test && pnpm build`. Fix any issues.
2. Update STRATEGY.md §12.2 status from `UNDER CONSIDERATION` to
   `PILOT — Sprint E P7-P17, feature-flagged`
3. Commit Feature B to main.

---

## Phases 19–20 — Final integration + ROADMAP update

### Phase 19 — Cross-feature integration test

Verify both features work together in a combined cook flow:

1. Start a combined cook (main + sides)
2. On Grab screen, long-press an ingredient → verify substitute appears
3. Proceed to Cook phase, activate voice → verify "next" advances steps
4. Complete cook → verify WinScreen renders normally

Manual walkthrough at 390×844 viewport. Screenshot verification.

### Phase 20 — Documentation + commit

1. Update ROADMAP.md with Stage 1.0 entry
2. Update FUTURE-SPRINTS.md to remove items now shipped
3. Final `pnpm lint && pnpm test && pnpm build`
4. Commit all changes to main, push

---

## Success Criteria

### Feature A (Inline Substitute)
- Long-press on any ingredient row surfaces a substitute within 3s
- Cached substitutes render instantly on revisit (0 AI calls)
- No modal, no sheet, no overlay — inline only
- Works on both single-dish and combined-cook Grab screens
- All existing IngredientList tests still pass

### Feature B (Voice Cook Pilot)
- 5 commands recognized with >90% accuracy in quiet conditions
- Zero false-positive actions (confidence threshold enforced)
- Mic button only appears when feature flag is on AND browser supports it
- Hold-to-talk fallback works for noisy environments
- Cook-completion rate tracked for pilot cohort vs. control
- Graceful degradation on unsupported browsers (no broken UI)

## Pilot Measurement Plan (Feature B)

- **Cohort:** 10% of users with ≥3 completed cooks
- **Primary metric:** Cook-completion rate (% of started cooks that reach WinScreen)
- **Secondary metrics:** Steps-per-voice-command ratio, voice-session duration,
  fallback-to-tap rate
- **Gate for full rollout:** ≥90% command accuracy in telemetry + measurable
  completion-rate lift vs. control (p < 0.05)
- **Kill criteria:** If accuracy drops below 80% or completion-rate is neutral
  after 2 weeks, revert to UNDER CONSIDERATION
