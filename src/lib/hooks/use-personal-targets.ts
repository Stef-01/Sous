"use client";

/**
 * usePersonalTargets (#6) — the user's profile + derived daily targets, as one
 * shared reactive store (useSyncExternalStore — the diary/lens pattern).
 * Consumers: the nutrition ring's macro target bars, the Nutrition header's
 * "kcal left", and any future goal surfaces. Null profile → FDA-default
 * targets everywhere (the prior behaviour, byte-identical).
 */

import { useSyncExternalStore } from "react";
import {
  computePersonalTargets,
  type PersonalProfile,
  type PersonalTargets,
} from "@/lib/nutrition/personal-targets";
import { enqueueKvSync } from "@/lib/sync/diary-sync";
import { registerKvHandler } from "@/lib/hooks/use-nutrition-diary";

const KEY = "sous-personal-profile-v1";

let snapshot: PersonalProfile | null | undefined; // undefined = not hydrated
const listeners = new Set<() => void>();

function getSnapshot(): PersonalProfile | null {
  if (snapshot === undefined) {
    try {
      const raw = window.localStorage.getItem(KEY);
      snapshot = raw ? (JSON.parse(raw) as PersonalProfile) : null;
    } catch {
      snapshot = null;
    }
  }
  return snapshot;
}

function getServerSnapshot(): PersonalProfile | null {
  return null;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setPersonalProfile(
  profile: PersonalProfile | null,
  opts?: { sync?: boolean },
): void {
  snapshot = profile;
  try {
    if (profile) window.localStorage.setItem(KEY, JSON.stringify(profile));
    else window.localStorage.removeItem(KEY);
  } catch {
    // privacy mode — in-memory still works for the session
  }
  listeners.forEach((l) => l());
  // #1 sync — write through to device_kv (skip when ADOPTING a remote pull).
  if (opts?.sync !== false) {
    enqueueKvSync({ key: "personal-profile", value: { profile } });
  }
}

// Pull-side: adopt the remote profile only when this device has none set —
// the device the user typed on stays authoritative for its own edits.
registerKvHandler("personal-profile", (value) => {
  const remote = (value as { profile?: PersonalProfile | null }).profile;
  if (remote && getSnapshot() === null) {
    setPersonalProfile(remote, { sync: false });
  }
});

export function usePersonalTargets(): {
  profile: PersonalProfile | null;
  targets: PersonalTargets | null;
  setProfile: (p: PersonalProfile | null) => void;
} {
  const profile = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const targets = profile ? computePersonalTargets(profile) : null;
  return { profile, targets, setProfile: setPersonalProfile };
}
