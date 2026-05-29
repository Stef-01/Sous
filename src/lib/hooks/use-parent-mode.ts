"use client";

/**
 * useParentMode — Parent Mode profile + toggle.
 *
 * - Persists in localStorage under a versioned key.
 * - Captured one-time via the coach quiz "Who's at the table?" question;
 *   toggleable thereafter via the Today header chip (W9 surface).
 * - Default ageBand = "4-8" if the user skips the optional follow-up
 *   (PARENT-MODE-PLAN §9 open-question resolution).
 *
 * Plumbing only — no UI. UI lives in:
 *   src/components/today/parent-toggle-chip.tsx
 *   src/components/shared/coach-quiz.tsx (extension)
 *
 * The pure helpers (PARENT_MODE_STORAGE_KEY, parseStoredProfile,
 * DEFAULT_PARENT_PROFILE) are exported so use-parent-mode.test.ts can
 * exercise them without a DOM — matching the convention in
 * use-substitution-memory.test.ts.
 */

import { useCallback, useEffect, useState } from "react";
import type { AgeBand } from "@/types/nutrition";
import type { ParentProfile } from "@/types/parent-mode";

export const PARENT_MODE_STORAGE_KEY = "sous-parent-mode-v1";

/** Schema version — bump to invalidate stale localStorage on shape changes. */
export const PARENT_MODE_SCHEMA_VERSION = 1;

interface StoredShape {
  v: number;
  profile: ParentProfile;
}

export const DEFAULT_PARENT_PROFILE: ParentProfile = {
  enabled: false,
  ageBand: "4-8",
  spiceTolerance: 3,
  enabledAt: "",
};

/**
 * Pure parser. Returns DEFAULT_PARENT_PROFILE when the input is
 * malformed, missing, or carries a stale schema version. Exported so
 * tests can exercise migration paths without a DOM.
 */
export function parseStoredProfile(raw: string | null): ParentProfile {
  if (!raw) return DEFAULT_PARENT_PROFILE;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredShape>;
    if (
      parsed.v !== PARENT_MODE_SCHEMA_VERSION ||
      !parsed.profile ||
      typeof parsed.profile !== "object"
    ) {
      return DEFAULT_PARENT_PROFILE;
    }
    return { ...DEFAULT_PARENT_PROFILE, ...parsed.profile };
  } catch {
    return DEFAULT_PARENT_PROFILE;
  }
}

export function serializeProfile(profile: ParentProfile): string {
  const wrapped: StoredShape = {
    v: PARENT_MODE_SCHEMA_VERSION,
    profile,
  };
  return JSON.stringify(wrapped);
}

function load(): ParentProfile {
  if (typeof window === "undefined") return DEFAULT_PARENT_PROFILE;
  try {
    return parseStoredProfile(localStorage.getItem(PARENT_MODE_STORAGE_KEY));
  } catch {
    return DEFAULT_PARENT_PROFILE;
  }
}

function persist(profile: ParentProfile) {
  try {
    localStorage.setItem(PARENT_MODE_STORAGE_KEY, serializeProfile(profile));
  } catch {
    // localStorage unavailable / quota — UX-acceptable in prototype.
  }
}

export function useParentMode() {
  const [profile, setProfile] = useState<ParentProfile>(DEFAULT_PARENT_PROFILE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setProfile(load());
  }, []);

  const enable = useCallback((partial?: Partial<ParentProfile>) => {
    const next: ParentProfile = {
      ...DEFAULT_PARENT_PROFILE,
      ...load(),
      ...partial,
      enabled: true,
      enabledAt: new Date().toISOString(),
    };
    persist(next);
    setProfile(next);
  }, []);

  const disable = useCallback(() => {
    const next: ParentProfile = {
      ...load(),
      enabled: false,
    };
    persist(next);
    setProfile(next);
  }, []);

  const toggle = useCallback(() => {
    const current = load();
    if (current.enabled) {
      const next: ParentProfile = { ...current, enabled: false };
      persist(next);
      setProfile(next);
    } else {
      const next: ParentProfile = {
        ...current,
        enabled: true,
        enabledAt: new Date().toISOString(),
      };
      persist(next);
      setProfile(next);
    }
  }, []);

  const setAgeBand = useCallback((ageBand: AgeBand) => {
    const next: ParentProfile = { ...load(), ageBand };
    persist(next);
    setProfile(next);
  }, []);

  return { profile, enable, disable, toggle, setAgeBand };
}
