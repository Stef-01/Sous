"use client";

import { useCallback, useEffect, useState } from "react";

/** localStorage key for the share log. v1 so we can migrate later without
 *  breaking old data. */
const SHARE_LOG_KEY = "sous-share-log-v1";
/** Keep at most this many entries. 50 comfortably fits any realistic usage
 *  and caps worst-case storage at ~10KB. */
const MAX_ENTRIES = 50;

export interface ShareLogEntry {
  /** The slug of the dish shared. */
  dishSlug: string;
  /** Display name at the time of sharing (survives dish-catalog renames). */
  dishName: string;
  /** ISO timestamp when the share happened. */
  sharedAt: string;
  /** Free-form first name the sender identified with at the time. Kept so
   *  we can surface "Alex cooked this too" type lines on the Path tally. */
  recipient?: string;
}

function load(): ShareLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SHARE_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is ShareLogEntry =>
          !!e &&
          typeof (e as ShareLogEntry).dishSlug === "string" &&
          typeof (e as ShareLogEntry).dishName === "string" &&
          typeof (e as ShareLogEntry).sharedAt === "string",
      )
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function persist(entries: ShareLogEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SHARE_LOG_KEY, JSON.stringify(entries));
    // Notify same-tab listeners — native `storage` events only fire in
    // other tabs. Without this the Path tally would lag a cycle behind
    // a Win-screen share.
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: SHARE_LOG_KEY,
        newValue: JSON.stringify(entries),
      }),
    );
  } catch {
    // quota exceeded / disabled — silent, share still succeeds.
  }
}

/** Imperative logger safe to call from any client component (e.g. Win
 *  screen) without subscribing to state updates. */
export function logShare(entry: Omit<ShareLogEntry, "sharedAt">) {
  const existing = load();
  const next: ShareLogEntry[] = [
    { ...entry, sharedAt: new Date().toISOString() },
    ...existing,
  ].slice(0, MAX_ENTRIES);
  persist(next);
}

/** React hook that exposes the current share log and re-reads on storage
 *  events so the Path tally stays fresh without a page reload. */
export function useShareLog() {
  const [entries, setEntries] = useState<ShareLogEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage + subscribe to storage events */
  useEffect(() => {
    setEntries(load());
    setMounted(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== SHARE_LOG_KEY) return;
      setEntries(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const log = useCallback((entry: Omit<ShareLogEntry, "sharedAt">) => {
    logShare(entry);
    setEntries(load());
  }, []);

  return { entries, mounted, log };
}
