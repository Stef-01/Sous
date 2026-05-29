"use client";

/**
 * useVoiceTranscript — thin wrapper around the Web Speech API's
 * SpeechRecognition / webkitSpeechRecognition.
 *
 * W12 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint C, voice-
 * driven cook mode). This is the spike — the capability check + a
 * lifecycle-stable hook other surfaces (cook step page, today
 * camera-input prompt) can adopt in W12-W14.
 *
 * Vibecode-scoped: no third-party transcription service, no founder
 * gates. All runs in-browser; falls back to a graceful no-op when
 * the API isn't available (Safari < 14.1, Firefox without flags,
 * any non-browser context).
 *
 * Lifecycle contract:
 *   - mount: hook is idle; `supported` reports whether the API is
 *     available without holding any platform handle.
 *   - call `start()`: opens a recognition session; transcript
 *     updates as interim/final results arrive.
 *   - call `stop()`: ends the session; final transcript stays
 *     available until the next start().
 *   - unmount: any open session is force-stopped (no listener leak).
 *
 * The hook is deliberately STATE-BASED, not effect-based: every
 * mutation goes through `useState` so React can track it cleanly,
 * and React-Compiler doesn't complain about side-effects in render.
 */

import { useCallback, useEffect, useRef, useState } from "react";

// Cross-vendor SpeechRecognition global. webkit-prefixed in Safari
// and older Chrome; standard in modern Chrome/Edge.
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult:
    | ((event: {
        results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
      }) => void)
    | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionGlobals {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
}

/**
 * Pure helper: which constructor (if any) is available on the given
 * window-like object. Exported for unit testing — pass a mocked
 * `globalThis` shape to verify the detection logic without a real
 * browser.
 */
export function detectSpeechRecognitionCtor(
  win: SpeechRecognitionGlobals | undefined,
): SpeechRecognitionCtor | null {
  if (!win) return null;
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

export interface VoiceTranscriptState {
  /** True iff the current platform exposes a SpeechRecognition API. */
  supported: boolean;
  /** True while a recognition session is open. */
  listening: boolean;
  /** Concatenated final transcript. Cleared on each start(). */
  transcript: string;
  /** Most recent interim chunk (not yet final). Cleared on start/stop. */
  interim: string;
  /** Last error reported by the API, if any (e.g. 'not-allowed'). */
  error: string | null;
}

export interface VoiceTranscriptActions {
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export type UseVoiceTranscriptResult = VoiceTranscriptState &
  VoiceTranscriptActions;

export function useVoiceTranscript(opts?: {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}): UseVoiceTranscriptResult {
  const lang = opts?.lang ?? "en-US";
  const continuous = opts?.continuous ?? true;
  const interimResults = opts?.interimResults ?? true;

  const ctorRef = useRef<SpeechRecognitionCtor | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Capability check on mount only — `typeof window` is the right
  // gate (it's `undefined` during SSR).
  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate API-availability on mount */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ctor = detectSpeechRecognitionCtor(
      window as unknown as SpeechRecognitionGlobals,
    );
    if (ctor) {
      ctorRef.current = ctor;
      setSupported(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Force-stop any open session on unmount so the listener count
  // stays at 0 or 1 (verified by the W12 stress test below).
  useEffect(() => {
    return () => {
      const r = recognitionRef.current;
      if (r) {
        try {
          r.abort();
        } catch {
          // ignore — already-stopped sessions throw in Safari
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const start = useCallback(() => {
    const Ctor = ctorRef.current;
    if (!Ctor) return;
    // If a session is already open, abort it first so we don't
    // stack two recognition handles.
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = continuous;
    rec.interimResults = interimResults;

    setTranscript("");
    setInterim("");
    setError(null);
    setListening(true);

    rec.onresult = (event) => {
      let nextFinal = "";
      let nextInterim = "";
      for (let i = 0; i < event.results.length; i += 1) {
        const r = event.results[i];
        if (r.isFinal) nextFinal += r[0].transcript;
        else nextInterim += r[0].transcript;
      }
      if (nextFinal) {
        setTranscript((prev) => prev + nextFinal);
      }
      setInterim(nextInterim);
    };

    rec.onerror = (event) => {
      setError(event.error ?? "unknown");
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : "start-failed");
      setListening(false);
      recognitionRef.current = null;
    }
  }, [lang, continuous, interimResults]);

  const stop = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) {
      setListening(false);
      return;
    }
    try {
      r.stop();
    } catch {
      // ignore — already-stopped sessions throw in some browsers
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setInterim("");
    setError(null);
  }, []);

  return {
    supported,
    listening,
    transcript,
    interim,
    error,
    start,
    stop,
    reset,
  };
}
