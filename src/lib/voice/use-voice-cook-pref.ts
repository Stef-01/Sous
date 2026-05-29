"use client";

/**
 * useVoiceCookPref — persisted user preference for "voice cook
 * enabled". Written to localStorage so it survives reloads.
 *
 * W15 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint C close).
 * Voice cook is opt-in — off by default. The setting lives in the
 * profile settings sheet (mascot tap) per CLAUDE.md rule 3
 * (single permitted Settings surface).
 *
 * Pure-test-friendly: `parseStoredVoiceCookPref` is exported so
 * the parsing logic can be unit-tested without a DOM.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sous-voice-cook-pref-v1";

interface VoiceCookPref {
  enabled: boolean;
  // Per-locale TTS preference; default en-US. Future i18n hook here.
  lang: string;
}

/**
 * Defensive default factory — returns a NEW object on every call so
 * a caller that mutates the result (test, polyfill) doesn't leak
 * state into subsequent calls. RCA from W15 Loop 2: returning a
 * shared `DEFAULT_PREF` const meant repeated calls returned the
 * same object; mutating one leaked into the next.
 */
function freshDefaultPref(): VoiceCookPref {
  return { enabled: false, lang: "en-US" };
}

/**
 * Pure parser for stored pref payload. Defends against:
 *   - missing key → fresh default
 *   - non-JSON / corrupt payload → fresh default
 *   - JSON `null` / array / primitive → fresh default
 *   - JSON of right shape but wrong field types → coerced to default
 *   - extra fields → ignored
 *
 * Always returns a freshly-allocated object (no shared mutable state).
 * Exported so tests can pin the parser without touching localStorage.
 */
export function parseStoredVoiceCookPref(
  raw: string | null | undefined,
): VoiceCookPref {
  if (!raw) return freshDefaultPref();
  try {
    const parsed = JSON.parse(raw);
    // RCA from W15 Loop 2: JSON.parse("null") returns null, and
    // accessing `.enabled` on null throws. Same for array / primitive
    // payloads. Gate on object-shape before destructuring.
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return freshDefaultPref();
    }
    const obj = parsed as Partial<VoiceCookPref>;
    return {
      enabled: typeof obj.enabled === "boolean" ? obj.enabled : false,
      lang: typeof obj.lang === "string" ? obj.lang : "en-US",
    };
  } catch {
    return freshDefaultPref();
  }
}

export function useVoiceCookPref() {
  const [pref, setPrefState] = useState<VoiceCookPref>(freshDefaultPref);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate from localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") {
      setMounted(true);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setPrefState(parseStoredVoiceCookPref(raw));
    } catch {
      setPrefState(freshDefaultPref());
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setEnabled = useCallback((enabled: boolean) => {
    setPrefState((prev) => {
      const next = { ...prev, enabled };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore — quota / privacy mode
      }
      return next;
    });
  }, []);

  const setLang = useCallback((lang: string) => {
    setPrefState((prev) => {
      const next = { ...prev, lang };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return {
    pref,
    enabled: pref.enabled,
    lang: pref.lang,
    mounted,
    setEnabled,
    setLang,
  };
}
