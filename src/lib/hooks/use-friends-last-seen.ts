"use client";

import { useEffect, useState } from "react";

const KEY = "sous-friends-last-seen-v1";

/**
 * Tracks the last time the user opened the Today page so `FriendsStrip`
 * can signal which friend cooks arrived since their last visit.
 *
 * - Returns `null` on the first ever visit (so we show zero dots instead
 *   of painting the whole strip as new).
 * - Advances `lastSeenAt` to `now` after first paint so the dot clears
 *   the next time the user returns.
 */
export function useFriendsLastSeen() {
  const [lastSeenAt, setLastSeenAt] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const n = Number(raw);
        if (Number.isFinite(n)) setLastSeenAt(n);
      }
    } catch {
      // localStorage unavailable
    }
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Defer writing the new stamp so the current render still sees the
    // previous lastSeenAt value and can highlight recent cooks as new.
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(KEY, String(Date.now()));
      } catch {
        // localStorage unavailable
      }
    }, 400);
    return () => clearTimeout(id);
  }, []);

  return { lastSeenAt, mounted };
}

/**
 * Convert a human-ish `postedAgo` label ("3h", "yesterday", "2d") into
 * an approximate number of milliseconds.
 *
 * Deterministic + conservative — we'd rather miss a dot than fabricate one.
 */
export function parsePostedAgoMs(label: string): number | null {
  const trimmed = label.trim().toLowerCase();
  if (!trimmed) return null;
  if (trimmed === "yesterday") return 24 * 60 * 60 * 1000;
  const match = /^(\d+)\s*(m|h|d|w)$/.exec(trimmed);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return null;
  switch (match[2]) {
    case "m":
      return n * 60 * 1000;
    case "h":
      return n * 60 * 60 * 1000;
    case "d":
      return n * 24 * 60 * 60 * 1000;
    case "w":
      return n * 7 * 24 * 60 * 60 * 1000;
  }
  return null;
}
