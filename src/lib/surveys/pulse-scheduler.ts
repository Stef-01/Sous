"use client";

/**
 * Pulse scheduler (planning.md §6.2 W4) — decides whether (and which) pulse to
 * surface at an app moment. Shared-store ledger in localStorage; eligibility is
 * DETERMINISTIC (a string hash of deviceId+dayKey picks among candidates — no
 * Math.random, SSR-safe). Guardrails: ≤1 pulse/day, ≥72 h between pulses,
 * ≤2/week, quiet for 7 days after onboarding, per-pulse permanent dismiss, and
 * answered pulses don't return. "Never mid-cook" is enforced by the trigger
 * anchors (win-close is post-cook), not here.
 */

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  PULSES,
  pulsesForAnchor,
  type PulseAnchor,
  type PulseDef,
} from "@/data/pulses";

const STORAGE_KEY = "sous-pulse-ledger-v1";
const HOUR = 3_600_000;
const DAY = 86_400_000;
const MIN_GAP_MS = 72 * HOUR;
const WEEK_MS = 7 * DAY;
const QUIET_AFTER_ONBOARDING_MS = 7 * DAY;
const MAX_PER_WEEK = 2;

export interface PulseLedger {
  /** Each time a pulse was surfaced. */
  shown: { pulseId: string; at: string }[];
  /** Pulse ids the user answered (won't re-surface automatically). */
  answered: string[];
  /** Pulse ids permanently dismissed. */
  dismissed: string[];
  /** When onboarding completed (starts the 7-day quiet window). */
  onboardingDoneAt: string | null;
}

const EMPTY: PulseLedger = {
  shown: [],
  answered: [],
  dismissed: [],
  onboardingDoneAt: null,
};

/** Stable, non-cryptographic string hash (djb2). Deterministic — no RNG. */
export function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

const dayKeyOf = (iso: string) => iso.slice(0, 10);

/**
 * PURE: pick the pulse to show at `anchor` given the ledger + clock, or null.
 * Exported for tests — no I/O.
 */
export function selectEligiblePulse(
  anchor: PulseAnchor,
  ledger: PulseLedger,
  nowISO: string,
  deviceId: string,
): PulseDef | null {
  const now = Date.parse(nowISO);

  // Quiet window right after onboarding.
  if (
    ledger.onboardingDoneAt &&
    now - Date.parse(ledger.onboardingDoneAt) < QUIET_AFTER_ONBOARDING_MS
  ) {
    return null;
  }

  const shownTimes = ledger.shown.map((s) => Date.parse(s.at));
  // ≤1 per day.
  if (ledger.shown.some((s) => dayKeyOf(s.at) === dayKeyOf(nowISO)))
    return null;
  // ≥72 h since the last pulse.
  if (shownTimes.length && now - Math.max(...shownTimes) < MIN_GAP_MS) {
    return null;
  }
  // ≤2 in the trailing week.
  if (shownTimes.filter((t) => now - t < WEEK_MS).length >= MAX_PER_WEEK) {
    return null;
  }

  const candidates = pulsesForAnchor(anchor).filter(
    (p) => !ledger.answered.includes(p.id) && !ledger.dismissed.includes(p.id),
  );
  if (candidates.length === 0) return null;

  // Deterministic pick — stable for a given device + day.
  const idx = hashString(`${deviceId}:${dayKeyOf(nowISO)}`) % candidates.length;
  return candidates[idx];
}

/** Undismissed pulses for the volunteered "Tune my picks" list — unanswered
 *  first (lowest-signal), then the rest. Pure. */
export function volunteeredPulses(ledger: PulseLedger): PulseDef[] {
  const live = PULSES.filter((p) => !ledger.dismissed.includes(p.id));
  const unanswered = live.filter((p) => !ledger.answered.includes(p.id));
  const answered = live.filter((p) => ledger.answered.includes(p.id));
  return [...unanswered, ...answered];
}

// ── shared store ────────────────────────────────────────────────────────────
let snapshot: PulseLedger | undefined;
const listeners = new Set<() => void>();

function read(): PulseLedger {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<PulseLedger>) };
  } catch {
    return EMPTY;
  }
}
function getSnapshot(): PulseLedger {
  if (snapshot === undefined) snapshot = read();
  return snapshot;
}
function getServer(): PulseLedger {
  return EMPTY;
}
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function commit(next: PulseLedger): void {
  snapshot = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
  listeners.forEach((l) => l());
}

export function markPulseShown(pulseId: string, at: string): void {
  const prev = getSnapshot();
  commit({ ...prev, shown: [...prev.shown, { pulseId, at }].slice(-50) });
}
export function markPulseAnswered(pulseId: string): void {
  const prev = getSnapshot();
  if (prev.answered.includes(pulseId)) return;
  commit({ ...prev, answered: [...prev.answered, pulseId] });
}
export function dismissPulse(pulseId: string): void {
  const prev = getSnapshot();
  if (prev.dismissed.includes(pulseId)) return;
  commit({ ...prev, dismissed: [...prev.dismissed, pulseId] });
}
export function recordOnboardingDone(at: string): void {
  const prev = getSnapshot();
  if (prev.onboardingDoneAt) return; // first completion starts the quiet window
  commit({ ...prev, onboardingDoneAt: at });
}

/** A stable per-install id (persisted once) so the deterministic pulse pick is
 *  consistent across a device's day. Not used for tracking. */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = window.localStorage.getItem("sous-device-id");
    if (!id) {
      id = crypto.randomUUID?.() ?? `d${getSnapshot().shown.length}`;
      window.localStorage.setItem("sous-device-id", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function usePulseLedger() {
  const ledger = useSyncExternalStore(subscribe, getSnapshot, getServer);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard
  useEffect(() => setMounted(true), []);
  return { ledger, mounted };
}
