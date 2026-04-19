"use client";

import { useCallback, useEffect, useState } from "react";

const HISTORY_KEY = "sous-craving-history-v1";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_UNIQUE = 5;

export interface CravingHistoryEntry {
  query: string;
  usedAt: string;
}

function readAll(): CravingHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    const valid = parsed.filter(
      (e): e is CravingHistoryEntry =>
        !!e &&
        typeof (e as CravingHistoryEntry).query === "string" &&
        typeof (e as CravingHistoryEntry).usedAt === "string",
    );
    return valid.filter((e) => {
      const ts = new Date(e.usedAt).getTime();
      return Number.isFinite(ts) && now - ts <= TTL_MS;
    });
  } catch {
    return [];
  }
}

function persist(entries: CravingHistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // quota / disabled
  }
}

function normalize(q: string): string {
  return q.trim().replace(/\s+/g, " ");
}

/**
 * useCravingHistory  -  remembers the user's last N unique craving queries
 * for 30 days, MRU-ordered. One-tap rerun support. Silent dedupe by
 * case-insensitive match so "pasta" and "Pasta" don't both appear.
 */
export function useCravingHistory() {
  const [entries, setEntries] = useState<CravingHistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage on mount */
  useEffect(() => {
    setEntries(readAll());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const record = useCallback((rawQuery: string) => {
    const query = normalize(rawQuery);
    if (!query) return;
    const existing = readAll();
    const filtered = existing.filter(
      (e) => e.query.toLowerCase() !== query.toLowerCase(),
    );
    const next: CravingHistoryEntry[] = [
      { query, usedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, MAX_UNIQUE);
    persist(next);
    setEntries(next);
  }, []);

  const clear = useCallback(() => {
    persist([]);
    setEntries([]);
  }, []);

  return { entries, mounted, record, clear };
}
