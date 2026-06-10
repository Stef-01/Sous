"use client";

/**
 * Unit preference (founder feature, 2026-06-10) — show ingredient quantities
 * in JUST metric (grams) or JUST US volume (cups/tsp). One shared reactive
 * store (the diary pattern): the profile sheet holds the setting, and the
 * ingredient list carries an inline swap so changing mid-cook is one tap.
 */

import { useSyncExternalStore } from "react";
import type { UnitSystem } from "@/lib/units/convert-quantity";

const KEY = "sous-unit-system-v1";

let snapshot: UnitSystem | undefined;
const listeners = new Set<() => void>();

function getSnapshot(): UnitSystem {
  if (snapshot === undefined) {
    try {
      const raw = window.localStorage.getItem(KEY);
      snapshot = raw === "metric" || raw === "us" ? raw : "us";
    } catch {
      snapshot = "us";
    }
  }
  return snapshot;
}
const getServerSnapshot = (): UnitSystem => "us";
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setUnitSystem(system: UnitSystem): void {
  snapshot = system;
  try {
    window.localStorage.setItem(KEY, system);
  } catch {
    // privacy mode — session-only
  }
  listeners.forEach((l) => l());
}

export function useUnitPref(): {
  system: UnitSystem;
  setSystem: (s: UnitSystem) => void;
} {
  const system = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { system, setSystem: setUnitSystem };
}
