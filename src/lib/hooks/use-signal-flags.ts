"use client";

/**
 * Reactive reader for the survey/pulse signal flags (`sous-signal-flags-v1`) —
 * the W5 "signal → consumer" bridge (planning.md §6.2). Onboarding (W3) and
 * pulses (W4) write the flags through `persistSurveySignals`; the surfaces that
 * change behaviour read them here. Shared-store pattern (cached snapshot +
 * listener set + `useSyncExternalStore`) so a pulse completing mid-session
 * updates every consumer without a remount, and a `storage` event keeps tabs in
 * sync. `useSyncExternalStore`'s server snapshot handles hydration: the first
 * client render matches the server (no flags), then React swaps in the real
 * snapshot — no mismatch, no per-consumer mounted guard needed.
 *
 * Flags in play (all optional booleans; absent = default behaviour):
 *   decisionFatigue → calmer, smaller deck with no reroll nudge
 *   budgetSensitive → pantry-overlap boost in pairing
 *   planNudgesOff   → suppress weekly-plan nudges
 *   verbose / terse → guided-cook step density
 *   feltEasier      → coach tone
 */

import { useSyncExternalStore } from "react";
import {
  getSignalFlags,
  SIGNAL_FLAGS_EVENT,
} from "@/lib/surveys/apply-survey-signals";

const FLAGS_KEY = "sous-signal-flags-v1";

export type SignalFlags = Record<string, boolean>;

const EMPTY: SignalFlags = {};
let snapshot: SignalFlags | undefined;
const listeners = new Set<() => void>();

function shallowEqual(a: SignalFlags, b: SignalFlags): boolean {
  const ak = Object.keys(a);
  if (ak.length !== Object.keys(b).length) return false;
  return ak.every((k) => a[k] === b[k]);
}

function getSnapshot(): SignalFlags {
  if (snapshot === undefined) snapshot = getSignalFlags();
  return snapshot;
}

function getServer(): SignalFlags {
  return EMPTY;
}

/** Re-read localStorage; only replace the cached snapshot + notify when the
 *  value actually changed, so the snapshot reference stays stable (no loop). */
function refresh(): void {
  const next = getSignalFlags();
  if (snapshot !== undefined && shallowEqual(snapshot, next)) return;
  snapshot = next;
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent): void {
  if (e.key === null || e.key === FLAGS_KEY) refresh();
}

function subscribe(cb: () => void): () => void {
  if (listeners.size === 0 && typeof window !== "undefined") {
    window.addEventListener(SIGNAL_FLAGS_EVENT, refresh);
    window.addEventListener("storage", onStorage);
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener(SIGNAL_FLAGS_EVENT, refresh);
      window.removeEventListener("storage", onStorage);
    }
  };
}

/** Reactive flags reader for client consumers. Returns `{}` until flags exist. */
export function useSignalFlags(): SignalFlags {
  return useSyncExternalStore(subscribe, getSnapshot, getServer);
}

/** Single boolean flag — convenience for consumers that need just one. */
export function useSignalFlag(name: string): boolean {
  return useSignalFlags()[name] === true;
}

export type StepDensity = "terse" | "default" | "verbose";

/**
 * W5: map the pacing-pulse flags to a guided-cook step density. `terse` wins if
 * both are somehow set (errs toward less clutter); the pacing pulse writes the
 * keys mutually-exclusively, so that tie-break is only defensive. Pure — unit
 * tested without React.
 */
export function stepDensityFromFlags(flags: SignalFlags): StepDensity {
  if (flags.terse) return "terse";
  if (flags.verbose) return "verbose";
  return "default";
}
