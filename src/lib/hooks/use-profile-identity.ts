"use client";

/**
 * useProfileIdentity - device-local profile identity for the Profile sheet.
 *
 * This is deliberately not auth: Clerk is still founder-gated. The values here
 * make the current device feel owned, and provide a human author name for local
 * community recipe publishing.
 */

import { useCallback, useSyncExternalStore } from "react";

export const PROFILE_IDENTITY_STORAGE_KEY = "sous-profile-identity-v1";
export const PROFILE_IDENTITY_SCHEMA_VERSION = 1;

const MAX_DISPLAY_NAME_LENGTH = 40;
const MAX_EMAIL_LENGTH = 254;

export interface ProfileIdentity {
  v: typeof PROFILE_IDENTITY_SCHEMA_VERSION;
  displayName: string;
  email: string;
  updatedAt: string;
}

export const EMPTY_PROFILE_IDENTITY: ProfileIdentity = {
  v: PROFILE_IDENTITY_SCHEMA_VERSION,
  displayName: "",
  email: "",
  updatedAt: "",
};

export function normalizeDisplayName(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_DISPLAY_NAME_LENGTH);
}

export function normalizeProfileEmail(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().slice(0, MAX_EMAIL_LENGTH);
}

export function isProfileEmailValid(value: string): boolean {
  const email = normalizeProfileEmail(value);
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeProfileIdentity(
  value: Partial<ProfileIdentity>,
): ProfileIdentity {
  const email = normalizeProfileEmail(value.email);
  return {
    v: PROFILE_IDENTITY_SCHEMA_VERSION,
    displayName: normalizeDisplayName(value.displayName),
    email: isProfileEmailValid(email) ? email : "",
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
}

export function parseStoredProfileIdentity(
  raw: string | null | undefined,
): ProfileIdentity {
  if (!raw) return EMPTY_PROFILE_IDENTITY;
  try {
    const parsed = JSON.parse(raw) as Partial<ProfileIdentity>;
    if (parsed.v !== PROFILE_IDENTITY_SCHEMA_VERSION) {
      return EMPTY_PROFILE_IDENTITY;
    }
    return normalizeProfileIdentity(parsed);
  } catch {
    return EMPTY_PROFILE_IDENTITY;
  }
}

export function serializeProfileIdentity(profile: ProfileIdentity): string {
  return JSON.stringify(normalizeProfileIdentity(profile));
}

export function profileIdentityAuthorName(profile: ProfileIdentity): string {
  return normalizeDisplayName(profile.displayName) || "A community cook";
}

function stamp(profile: Omit<ProfileIdentity, "v" | "updatedAt">) {
  return normalizeProfileIdentity({
    ...profile,
    v: PROFILE_IDENTITY_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  });
}

function readStorage(): ProfileIdentity {
  if (typeof window === "undefined") return EMPTY_PROFILE_IDENTITY;
  try {
    return parseStoredProfileIdentity(
      window.localStorage.getItem(PROFILE_IDENTITY_STORAGE_KEY),
    );
  } catch {
    return EMPTY_PROFILE_IDENTITY;
  }
}

let snapshot: ProfileIdentity | undefined;
const listeners = new Set<() => void>();

function getSnapshot(): ProfileIdentity {
  if (snapshot === undefined) snapshot = readStorage();
  return snapshot;
}

function getServerSnapshot(): ProfileIdentity {
  return EMPTY_PROFILE_IDENTITY;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist(profile: ProfileIdentity): void {
  try {
    window.localStorage.setItem(
      PROFILE_IDENTITY_STORAGE_KEY,
      serializeProfileIdentity(profile),
    );
  } catch {
    // localStorage unavailable / quota - in-memory state still updates.
  }
}

function commit(profile: ProfileIdentity) {
  snapshot = profile;
  persist(profile);
  listeners.forEach((listener) => listener());
}

export function useProfileIdentity() {
  const profile = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setProfile = useCallback(
    (next: Omit<ProfileIdentity, "v" | "updatedAt">) => {
      const stamped = stamp(next);
      commit(stamped);
    },
    [],
  );

  const clear = useCallback(() => {
    commit(EMPTY_PROFILE_IDENTITY);
  }, []);

  return { profile, setProfile, clear };
}
