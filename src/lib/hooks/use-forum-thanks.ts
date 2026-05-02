"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sous-forum-thanks-v1";

/**
 * useForumThanks — per-device "thanks" reaction count on forum
 * replies (W8 stub).
 *
 * The store is a flat map of `replyId → { thanked: boolean }`.
 * Counts are derived: a reply has either 0 (this device hasn't
 * thanked it) or 1 (this device has). Across many devices the
 * count would aggregate; for the localStorage prototype, the
 * per-device count IS the rendered count.
 *
 * When auth lands (FOUNDER-UNLOCK-RUNBOOK W13), this hook keeps
 * its API stable and the store flips to a TanStack-Query call —
 * call sites don't change.
 */

interface ThanksMap {
  [replyId: string]: { thanked: boolean };
}

function load(): ThanksMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ThanksMap) : {};
  } catch {
    return {};
  }
}

function persist(map: ThanksMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/** Pure helper for unit testing — applies a toggle to a map without
 *  touching localStorage. */
export function applyToggleThanks(map: ThanksMap, replyId: string): ThanksMap {
  const current = map[replyId];
  return {
    ...map,
    [replyId]: { thanked: !current?.thanked },
  };
}

export function useForumThanks() {
  const [map, setMap] = useState<ThanksMap>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setMap(load());
  }, []);

  const isThanked = useCallback(
    (replyId: string) => Boolean(map[replyId]?.thanked),
    [map],
  );

  const toggleThanks = useCallback((replyId: string) => {
    setMap((prev) => {
      const next = applyToggleThanks(prev, replyId);
      persist(next);
      return next;
    });
  }, []);

  /** Count for a given reply: per-device, so 0 or 1 today. */
  const thanksCount = useCallback(
    (replyId: string) => (map[replyId]?.thanked ? 1 : 0),
    [map],
  );

  return { isThanked, toggleThanks, thanksCount };
}
