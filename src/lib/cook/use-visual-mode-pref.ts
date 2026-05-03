"use client";

/**
 * useVisualModePref — persisted user preference for "visual mode"
 * during cook flow. When on, the cook step page shows a large
 * step image with shrunken instruction text (Google-Maps "look,
 * don't read" mode).
 *
 * W22 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint E, MVP 3
 * of the cook-nav initiative). Mirrors the W15 useVoiceCookPref
 * shape — same persistence pattern, same defensive parser, same
 * freshDefault factory to avoid shared mutable state.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sous-visual-mode-pref-v1";

interface VisualModePref {
  enabled: boolean;
}

/** Defensive default factory — returns a NEW object on every call.
 *  Pattern from W15 RCA. */
function freshDefaultPref(): VisualModePref {
  return { enabled: false };
}

/**
 * Pure parser for stored payload. Defends against:
 *   - missing key → fresh default
 *   - non-JSON / corrupt payload → fresh default
 *   - JSON null / array / primitive → fresh default
 *   - JSON with wrong field types → coerced to default
 *   - extra fields → ignored
 */
export function parseStoredVisualModePref(
  raw: string | null | undefined,
): VisualModePref {
  if (!raw) return freshDefaultPref();
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return freshDefaultPref();
    }
    const obj = parsed as Partial<VisualModePref>;
    return {
      enabled: typeof obj.enabled === "boolean" ? obj.enabled : false,
    };
  } catch {
    return freshDefaultPref();
  }
}

export function useVisualModePref() {
  const [pref, setPrefState] = useState<VisualModePref>(freshDefaultPref);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate from localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") {
      setMounted(true);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setPrefState(parseStoredVisualModePref(raw));
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

  return {
    pref,
    enabled: pref.enabled,
    mounted,
    setEnabled,
  };
}
