"use client";

/**
 * useVoiceCook — coordinator hook for the entire voice-driven
 * cook experience. Wires the four W12-W15 + W18 pieces into one
 * unified surface that cook step pages can adopt with a single
 * import.
 *
 * W19 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint D, MVP 2
 * of the Google-Maps-style cook-nav initiative). With MVP 1's
 * "Done <X>" intent shipped, the coordinator can now translate
 * speech → intent → callback in one place rather than each cook
 * page wiring three hooks.
 *
 * Architectural note: this hook is the FIRST place the four
 * voice pieces converge. Until W19, each was tested in isolation;
 * the coordinator is the integration point. The pure piece —
 * how transcripts route to intents and which intents map to which
 * action — is exported as `routeIntent` so the integration math
 * stays unit-testable without a DOM.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { parseCookVoiceIntent, type CookVoiceIntent } from "./parse-intent";
import { useVoiceTranscript } from "./use-voice-transcript";
import { useTextToSpeech } from "./use-text-to-speech";
import { useVoiceCookPref } from "./use-voice-cook-pref";

export type VoiceCookAction =
  | { kind: "next" }
  | { kind: "back" }
  | { kind: "repeat" }
  | { kind: "done"; context: string | null }
  | { kind: "timer-set"; seconds: number }
  | { kind: "timer-cancel" }
  | { kind: "timer-status" }
  | { kind: "timer-add"; seconds: number }
  | { kind: "ignore" };

/**
 * Pure helper: map a CookVoiceIntent to a VoiceCookAction. The
 * mapping is mostly 1:1, but pause/resume/unknown collapse to
 * `ignore` because the cook step page doesn't have a
 * native pause concept (it's stateless on each step).
 *
 * Exported for unit testing the intent-routing math without a DOM.
 */
export function routeIntent(intent: CookVoiceIntent): VoiceCookAction {
  switch (intent.kind) {
    case "next":
      return { kind: "next" };
    case "back":
      return { kind: "back" };
    case "repeat":
      return { kind: "repeat" };
    case "done":
      return { kind: "done", context: intent.context };
    case "timer-set":
      return { kind: "timer-set", seconds: intent.seconds };
    case "timer-cancel":
      return { kind: "timer-cancel" };
    case "timer-status":
      return { kind: "timer-status" };
    case "timer-add":
      return { kind: "timer-add", seconds: intent.seconds };
    case "pause":
    case "resume":
    case "unknown":
      return { kind: "ignore" };
  }
}

interface UseVoiceCookOpts {
  /** Called on every recognised intent (other than `ignore`).
   *  The page wires this to its step navigation + timer reducer. */
  onAction?: (action: VoiceCookAction) => void;
  /** Page passes the current step's instruction text; the coach
   *  speaks it whenever the page changes step (driven by the
   *  consumer's effect, not by this hook). */

  speakOnNewStep?: (text: string) => void;
}

export function useVoiceCook(opts?: UseVoiceCookOpts) {
  const pref = useVoiceCookPref();
  const transcript = useVoiceTranscript({ lang: pref.lang });
  const tts = useTextToSpeech({ lang: pref.lang });

  // Track the last-routed transcript fragment so a single transcript
  // doesn't fire the same action twice as it grows from interim →
  // final. The hook only routes on the FINAL transcript suffix that
  // hasn't been routed yet.
  const routedLengthRef = useRef(0);
  const [lastAction, setLastAction] = useState<VoiceCookAction | null>(null);

  const onAction = opts?.onAction;

  // When a NEW final transcript chunk arrives, route it.

  useEffect(() => {
    if (!pref.enabled) return;
    const full = transcript.transcript;
    if (!full) return;
    if (full.length <= routedLengthRef.current) return;
    const fresh = full.slice(routedLengthRef.current);
    routedLengthRef.current = full.length;
    const intent = parseCookVoiceIntent(fresh);
    const action = routeIntent(intent);
    if (action.kind !== "ignore") {
      setLastAction(action);
      onAction?.(action);
      // After acting on a recognised intent, reset the recogniser's
      // transcript so the user's NEXT utterance starts fresh — this
      // matches Google-Maps-style "command, execute, ready for the
      // next command" UX.
      transcript.reset();
      routedLengthRef.current = 0;
    }
  }, [transcript, transcript.transcript, pref.enabled, onAction]);

  // Auto-start/stop the recogniser based on the user's preference.

  useEffect(() => {
    if (!pref.enabled) {
      transcript.stop();
      tts.stop();
      return;
    }
    if (transcript.supported && !transcript.listening) {
      transcript.start();
    }
  }, [pref.enabled, transcript, tts]);

  /** Speak the current step. Wired to the cook step page's effect
   *  on step-index change. No-op if voice cook is off or muted. */
  const speakStep = useCallback(
    (text: string) => {
      if (!pref.enabled) return;
      if (tts.muted) return;
      tts.speak(text);
    },
    [pref.enabled, tts],
  );

  return {
    enabled: pref.enabled,
    setEnabled: pref.setEnabled,
    transcript: transcript.transcript,
    interim: transcript.interim,
    listening: transcript.listening,
    speaking: tts.speaking,
    muted: tts.muted,
    setMuted: tts.setMuted,
    speakStep,
    lastAction,
    error: transcript.error ?? tts.error,
    supported: transcript.supported && tts.supported,
  };
}
