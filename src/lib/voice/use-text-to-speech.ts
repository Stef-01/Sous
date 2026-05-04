"use client";

/**
 * useTextToSpeech — thin wrapper around the browser's Web Speech
 * SpeechSynthesis API. Mirror of W12's useVoiceTranscript (input
 * side); this is the output side — the coach reading the current
 * step out loud when voice mode is on.
 *
 * W14 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint C voice cook).
 *
 * Vibecode-scoped: in-browser only, no third-party TTS service.
 * Falls back to a graceful no-op when the API isn't available.
 *
 * Lifecycle contract:
 *   - mount: hook is idle; `supported` reports availability.
 *   - call `speak(text)`: queues an utterance; if one is already
 *     speaking, that utterance is cancelled first (last-write-wins).
 *   - call `stop()`: cancels any pending or active utterance.
 *   - call `setMuted(true)`: any future speak() is a no-op until
 *     unmuted. Current utterance is cancelled.
 *   - unmount: any active utterance is cancelled (no audio leak).
 */

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Pure helper: is the SpeechSynthesis API available on the given
 * window-like object? Exported for unit testing.
 */
export function detectSpeechSynthesis(
  win: { speechSynthesis?: unknown } | undefined,
): boolean {
  if (!win) return false;
  return typeof win.speechSynthesis !== "undefined";
}

/**
 * Pure helper: pick the best available voice for a given language
 * tag. Preference order:
 *   1. exact lang match + default voice
 *   2. exact lang match
 *   3. lang prefix match (e.g. 'en' matches 'en-GB' if 'en-US' missing)
 *   4. first voice in the list
 *   5. null when the list is empty
 */
export interface VoiceLike {
  name: string;
  lang: string;
  default?: boolean;
}

export function pickVoiceForLang(
  voices: ReadonlyArray<VoiceLike>,
  preferredLang: string,
): VoiceLike | null {
  if (voices.length === 0) return null;
  const exact = voices.filter((v) => v.lang === preferredLang);
  const exactDefault = exact.find((v) => v.default);
  if (exactDefault) return exactDefault;
  if (exact.length > 0) return exact[0];

  const prefix = preferredLang.split("-")[0];
  const prefixMatch = voices.find((v) => v.lang.startsWith(prefix));
  if (prefixMatch) return prefixMatch;

  return voices[0];
}

interface SpeechSynthesisUtteranceLike {
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  voice: VoiceLike | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
}

interface SpeechSynthesisLike {
  speaking: boolean;
  pending: boolean;
  paused: boolean;
  cancel: () => void;
  speak: (utterance: SpeechSynthesisUtteranceLike) => void;
  getVoices: () => VoiceLike[];
}

declare global {
  interface Window {
    SpeechSynthesisUtterance?: new (
      text: string,
    ) => SpeechSynthesisUtteranceLike;
  }
}

export interface TextToSpeechResult {
  /** True iff the platform exposes SpeechSynthesis. */
  supported: boolean;
  /** True while an utterance is being spoken. */
  speaking: boolean;
  /** Persisted across calls (state-only on this hook). */
  muted: boolean;
  /** Last error reported by the synth, if any. */
  error: string | null;

  /** Queue an utterance; cancels any in-progress utterance first. */
  speak: (text: string, opts?: { lang?: string; rate?: number }) => void;
  /** Cancel any pending or active utterance. */
  stop: () => void;
  /** Toggle the mute state. While muted, speak() is a no-op. */
  setMuted: (muted: boolean) => void;
}

export function useTextToSpeech(opts?: {
  lang?: string;
  rate?: number;
}): TextToSpeechResult {
  const defaultLang = opts?.lang ?? "en-US";
  const defaultRate = opts?.rate ?? 1.0;

  const synthRef = useRef<SpeechSynthesisLike | null>(null);

  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate API-availability + listener cleanup on mount */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!detectSpeechSynthesis(window)) return;
    synthRef.current = (
      window as unknown as { speechSynthesis: SpeechSynthesisLike }
    ).speechSynthesis;
    setSupported(true);
    return () => {
      // Unmount cleanup: cancel any active utterance.
      const synth = synthRef.current;
      if (synth) {
        try {
          synth.cancel();
        } catch {
          // ignore — already-cancelled in some browsers
        }
      }
      synthRef.current = null;
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const speak = useCallback(
    (text: string, callOpts?: { lang?: string; rate?: number }) => {
      const synth = synthRef.current;
      if (!synth) return;
      if (muted) return;
      if (!text.trim()) return;
      if (typeof window === "undefined") return;
      const Utter = window.SpeechSynthesisUtterance;
      if (!Utter) return;

      // Cancel any in-progress utterance — last-write-wins.
      try {
        synth.cancel();
      } catch {
        // ignore
      }

      const u = new Utter(text);
      const lang = callOpts?.lang ?? defaultLang;
      u.lang = lang;
      u.rate = callOpts?.rate ?? defaultRate;
      u.pitch = 1.0;
      u.volume = 1.0;
      u.voice = pickVoiceForLang(synth.getVoices() ?? [], lang);
      u.onend = () => {
        setSpeaking(false);
      };
      u.onerror = (event) => {
        setError(event.error ?? "unknown");
        setSpeaking(false);
      };

      setError(null);
      setSpeaking(true);
      try {
        synth.speak(u);
      } catch (err) {
        setError(err instanceof Error ? err.message : "speak-failed");
        setSpeaking(false);
      }
    },
    [defaultLang, defaultRate, muted],
  );

  const stop = useCallback(() => {
    const synth = synthRef.current;
    if (!synth) {
      setSpeaking(false);
      return;
    }
    try {
      synth.cancel();
    } catch {
      // ignore
    }
    setSpeaking(false);
  }, []);

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next);
    if (next) {
      const synth = synthRef.current;
      if (synth) {
        try {
          synth.cancel();
        } catch {
          // ignore
        }
      }
      setSpeaking(false);
    }
  }, []);

  return {
    supported,
    speaking,
    muted,
    error,
    speak,
    stop,
    setMuted,
  };
}
