/**
 * Pure helpers for the household-memory loop.
 *
 * W32 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint G W32-W36
 * household memory). Pairs with the W32 `householdMemberSchema`
 * and the W32 `useHouseholdMembers` localStorage hook.
 *
 * Pure functions stay testable without rendering React or
 * touching the DOM. The persistence hook is a thin wrapper
 * around these.
 */

import {
  HOUSEHOLD_SCHEMA_VERSION,
  slugifyMemberName,
  type HouseholdMember,
} from "@/types/household-member";

/** Defensive default-member factory. New object every call so
 *  callers (or React's defaultValues clone) don't share mutable
 *  state. Pattern from W15 RCA. */
export function defaultHouseholdMember(
  now: string = new Date().toISOString(),
): HouseholdMember {
  return {
    schemaVersion: HOUSEHOLD_SCHEMA_VERSION,
    id: `mem-${Date.now()}`,
    name: "",
    ageBand: "adult",
    spiceTolerance: 3,
    dietaryFlags: [],
    cuisinePreferences: [],
    avatar: "",
    createdAt: now,
  };
}

/** Allocate the next member id given an existing list. Format is
 *  `mem-<slug>-<n>` where `n` is one greater than the highest
 *  existing numeric suffix for that slug — collisions from the
 *  same name yield distinct ids. Defensive against non-numeric
 *  ids in the existing set (those are preserved but not
 *  counted). */
export function nextMemberId(
  members: ReadonlyArray<HouseholdMember>,
  name: string,
): string {
  const slug = slugifyMemberName(name) || "member";
  const re = new RegExp(`^mem-${slug}-(\\d+)$`);
  let max = 0;
  for (const m of members) {
    const match = m.id.match(re);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }
  return `mem-${slug}-${max + 1}`;
}

/** Append a new member to the list. The caller passes the
 *  member; this helper returns a new array so React can detect
 *  the change. Does NOT validate — the persistence hook runs
 *  the schema before writing to disk. */
export function appendMember(
  members: ReadonlyArray<HouseholdMember>,
  member: HouseholdMember,
): HouseholdMember[] {
  return [...members, member];
}

/** Remove a member by id. Idempotent — removing a missing id
 *  returns the same logical list (a fresh array reference). */
export function removeMemberById(
  members: ReadonlyArray<HouseholdMember>,
  id: string,
): HouseholdMember[] {
  return members.filter((m) => m.id !== id);
}

/** Update the member with the given id, merging the patch over
 *  the existing record. Idempotent on a missing id (returns the
 *  list unchanged). */
export function updateMemberById(
  members: ReadonlyArray<HouseholdMember>,
  id: string,
  patch: Partial<Omit<HouseholdMember, "id" | "createdAt" | "schemaVersion">>,
): HouseholdMember[] {
  const idx = members.findIndex((m) => m.id === id);
  if (idx === -1) return [...members];
  const next = [...members];
  next[idx] = { ...next[idx], ...patch };
  return next;
}

/** Find a member by id. Returns null when no match. */
export function findMemberById(
  members: ReadonlyArray<HouseholdMember>,
  id: string,
): HouseholdMember | null {
  return members.find((m) => m.id === id) ?? null;
}
