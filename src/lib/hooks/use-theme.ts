"use client";

/**
 * useTheme — light/dark/system theme hook (Y3 W3 follow-up).
 *
 * Three modes:
 *   - "light":  force light palette (default for cold-start).
 *   - "dark":   force dark palette (Y3 W3 designed values).
 *   - "system": follow `prefers-color-scheme` from the OS.
 *
 * Persistence: localStorage key `sous-theme`. Schema-version
 * gated (W15 RCA pattern). Cold-start defaults to "light" so
 * existing users see no change.
 *
 * Side effect: applies `<html data-theme="dark">` when the
 * resolved theme is dark; removes the attribute otherwise.
 * The CSS in `globals.css` swaps token values via
 * `[data-theme="dark"]` selector.
 *
 * Pure parts (`resolveActiveTheme`, `parseStoredTheme`) are
 * exported for unit testing without React.
 */

import { useEffect, useState } from "react";

const STORAGE_KEY = "sous-theme";
const SCHEMA_VERSION = 1 as const;

export type ThemeChoice = "light" | "dark" | "system";
export type ActiveTheme = "light" | "dark";

interface PersistedTheme {
  schemaVersion: typeof SCHEMA_VERSION;
  choice: ThemeChoice;
}

/** Pure: parse the stored theme payload. Defends against
 *  missing key, malformed JSON, schema mismatch, unknown
 *  choice values. Falls through to default on any failure. */
export function parseStoredTheme(raw: string | null | undefined): ThemeChoice {
  if (!raw) return "light";
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return "light";
    const obj = parsed as Partial<PersistedTheme>;
    if (obj.schemaVersion !== SCHEMA_VERSION) return "light";
    if (
      obj.choice === "dark" ||
      obj.choice === "light" ||
      obj.choice === "system"
    ) {
      return obj.choice;
    }
    return "light";
  } catch {
    return "light";
  }
}

/** Pure: resolve the active theme from the user's choice +
 *  the OS preference. Used both inside the hook and for tests. */
export function resolveActiveTheme(
  choice: ThemeChoice,
  systemPrefersDark: boolean,
): ActiveTheme {
  if (choice === "dark") return "dark";
  if (choice === "light") return "light";
  return systemPrefersDark ? "dark" : "light";
}

/** Pure: serialise a choice for localStorage write. */
export function serialiseTheme(choice: ThemeChoice): string {
  const payload: PersistedTheme = {
    schemaVersion: SCHEMA_VERSION,
    choice,
  };
  return JSON.stringify(payload);
}

export interface UseThemeResult {
  /** The user's explicit choice. */
  choice: ThemeChoice;
  /** The currently-applied theme (resolved against system pref
   *  when choice is "system"). */
  active: ActiveTheme;
  /** Set the choice + persist + apply. */
  setChoice: (choice: ThemeChoice) => void;
}

/** React hook: theme state + side effect to apply data-theme. */
export function useTheme(): UseThemeResult {
  const [choice, setChoiceState] = useState<ThemeChoice>("light");
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate from localStorage + listen to OS pref */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setChoiceState(parseStoredTheme(raw));
    } catch {
      setChoiceState("light");
    }

    if (typeof window.matchMedia === "function") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      setSystemPrefersDark(mq.matches);
      const onChange = (e: MediaQueryListEvent) =>
        setSystemPrefersDark(e.matches);
      // Modern + legacy listeners.
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else mq.addListener(onChange);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener("change", onChange);
        else mq.removeListener(onChange);
      };
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const active = resolveActiveTheme(choice, systemPrefersDark);

  // Side effect: apply data-theme attribute to <html>.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (active === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [active]);

  const setChoice = (next: ThemeChoice) => {
    setChoiceState(next);
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, serialiseTheme(next));
    } catch {
      // ignore — quota / privacy mode
    }
  };

  return { choice, active, setChoice };
}
