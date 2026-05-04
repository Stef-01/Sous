/**
 * Pure helpers for the W46 pod creation flow.
 *
 * Generates collision-resistant invite codes + composes the
 * full ChallengePod from form input. Pure / testable without
 * touching React or localStorage.
 */

import {
  POD_SCHEMA_VERSION,
  type ChallengePod,
  type PodMember,
} from "@/types/challenge-pod";

/** 6-character invite code drawn from the safe alphabet
 *  (uppercase A-Z + 0-9, excluding I/O/0/1 to avoid the
 *  6-vs-G / I-vs-1 / O-vs-0 confusion in shared codes). */
const SAFE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode(rng: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += SAFE_ALPHABET[Math.floor(rng() * SAFE_ALPHABET.length)];
  }
  return out;
}

/** Slugify a pod name for the pod id. Falls back to "pod" when
 *  the name slugifies to empty (e.g. emoji-only). */
function slugifyPodName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return slug.length > 0 ? slug : "pod";
}

/** Allocate a deterministic pod id from name + creation
 *  timestamp. Format: `pod-<slug>-<n>` where n is the unix
 *  timestamp in seconds (collision-resistant for V1 single-pod-
 *  per-device; multi-pod gets server-assigned ids in Y2). */
export function nextPodId(name: string, now: Date = new Date()): string {
  return `pod-${slugifyPodName(name)}-${Math.floor(now.getTime() / 1000)}`;
}

/** Allocate a member id within a pod. Format `mem-<podSlug>-<n>`
 *  where n is one greater than the highest existing numeric
 *  suffix among `existingIds`. Defensive against non-canonical
 *  ids in the existing set (preserved but not counted). */
export function nextPodMemberId(
  podId: string,
  existingIds: ReadonlyArray<string>,
): string {
  // podId = "pod-<slug>-<ts>"; we just want the "<slug>" piece.
  const slugMatch = podId.match(/^pod-([a-z0-9-]+)-\d+$/);
  const slug = slugMatch?.[1] ?? "member";
  const re = new RegExp(`^mem-${slug}-(\\d+)$`);
  let max = 0;
  for (const id of existingIds) {
    const m = id.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return `mem-${slug}-${max + 1}`;
}

/** Compute the dietary-flag union across the roster — same
 *  contract as the W35 household table aggregator. Sorted +
 *  deduped for deterministic display + filter behaviour. */
export function aggregateDietaryFromMembers(
  members: ReadonlyArray<PodMember>,
): string[] {
  const set = new Set<string>();
  for (const m of members) {
    for (const flag of m.dietaryFlags) set.add(flag);
  }
  return Array.from(set).sort();
}

export interface PodCreationInput {
  /** Pod display name (1-60 chars). */
  name: string;
  /** Hour of Sunday at which the gallery reveals (0-23). */
  revealAtHour: number;
  /** Initial member roster — owner is implicitly members[0]. */
  members: ReadonlyArray<{
    displayName: string;
    avatar: string;
    ageBand: PodMember["ageBand"];
    dietaryFlags: ReadonlyArray<string>;
    cuisinePreferences: ReadonlyArray<string>;
  }>;
  /** Optional IANA timezone; V1 defaults to "" (host-local
   *  inferred at render time). */
  podTimezone?: string;
  /** Optional creation timestamp for tests. */
  now?: Date;
  /** Optional rng for deterministic invite code generation in
   *  tests. */
  rng?: () => number;
}

/** Compose a full ChallengePod from creation-form input.
 *  Pure / dependency-free — caller persists via setPod. */
export function buildPodFromCreation(input: PodCreationInput): ChallengePod {
  const now = input.now ?? new Date();
  const podId = nextPodId(input.name, now);
  const isoNow = now.toISOString();

  const members: PodMember[] = input.members.map((m, idx) => {
    const memberId = `mem-${slugifyPodName(input.name)}-${idx + 1}`;
    return {
      schemaVersion: POD_SCHEMA_VERSION,
      id: memberId,
      displayName: m.displayName,
      avatar: m.avatar.slice(0, 8),
      ageBand: m.ageBand,
      dietaryFlags: [...m.dietaryFlags],
      cuisinePreferences: [...m.cuisinePreferences],
      joinedAt: isoNow,
      vacationSince: null,
      weeksMissed: 0,
    };
  });

  const ownerId = members[0]?.id ?? "mem-owner";
  return {
    schemaVersion: POD_SCHEMA_VERSION,
    id: podId,
    name: input.name,
    createdAt: isoNow,
    ownerId,
    adminIds: [ownerId],
    members,
    dietaryFlags: aggregateDietaryFromMembers(members),
    podTimezone: input.podTimezone ?? "",
    revealAtHour: input.revealAtHour,
    inviteCode: generateInviteCode(input.rng),
    inviteCodeExpiresAt: null,
    pausedThisWeek: false,
  };
}
