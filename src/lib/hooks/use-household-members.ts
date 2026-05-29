"use client";

/**
 * useHouseholdMembers — localStorage-backed CRUD store for the
 * "who's at the table" picker (W32 substrate, surfaces in
 * W33-W36).
 *
 * Mirrors the W15 / W22 / W24 pref-hook pattern:
 *   - freshDefault factory (no shared mutable state)
 *   - object-shape gate before destructuring (W15 RCA)
 *   - schema-version check
 *   - partial-recovery parser (drops invalid entries; better
 *     than losing the whole list when one member is corrupt)
 *
 * Vibecode-scoped: localStorage only. Sprint-2 founder-unlock
 * swaps to Drizzle / Postgres for cross-device sync.
 *
 * Pure parser `parseStoredHouseholdMembers` is exported so
 * tests can exercise it without a DOM.
 */

import { useCallback, useEffect, useState } from "react";
import {
  appendMember as appendHelper,
  removeMemberById as removeHelper,
  updateMemberById as updateHelper,
  findMemberById,
} from "@/lib/household/household-helpers";
import {
  householdMemberSchema,
  type HouseholdMember,
} from "@/types/household-member";

const STORAGE_KEY = "sous-household-members-v1";

/** Pure parser. Defends against:
 *   - missing key → empty list
 *   - corrupt JSON → empty list
 *   - non-array root → empty list
 *   - per-member schema failures → drops invalid entries silently
 *     (better partial recovery than losing the whole list) */
export function parseStoredHouseholdMembers(
  raw: string | null | undefined,
): HouseholdMember[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: HouseholdMember[] = [];
  for (const item of parsed) {
    const result = householdMemberSchema.safeParse(item);
    if (result.success) out.push(result.data);
  }
  return out;
}

function persist(members: ReadonlyArray<HouseholdMember>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch {
    // ignore — quota / privacy mode
  }
}

export function useHouseholdMembers() {
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate from localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") {
      setMounted(true);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setMembers(parseStoredHouseholdMembers(raw));
    } catch {
      setMembers([]);
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const append = useCallback((member: HouseholdMember) => {
    // Validate before persisting — keeps the on-disk payload
    // schema-clean even if a caller hand-rolls a member.
    const result = householdMemberSchema.safeParse(member);
    if (!result.success) return;
    setMembers((prev) => {
      const next = appendHelper(prev, result.data);
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setMembers((prev) => {
      const next = removeHelper(prev, id);
      persist(next);
      return next;
    });
  }, []);

  const update = useCallback(
    (
      id: string,
      patch: Partial<
        Omit<HouseholdMember, "id" | "createdAt" | "schemaVersion">
      >,
    ) => {
      setMembers((prev) => {
        const next = updateHelper(prev, id, patch);
        // Re-validate the updated member; fall back to prev if
        // the patch breaks the schema.
        const updated = findMemberById(next, id);
        if (updated && !householdMemberSchema.safeParse(updated).success) {
          return prev;
        }
        persist(next);
        return next;
      });
    },
    [],
  );

  const clear = useCallback(() => {
    persist([]);
    setMembers([]);
  }, []);

  const getById = useCallback(
    (id: string) => findMemberById(members, id),
    [members],
  );

  return {
    members,
    mounted,
    append,
    remove,
    update,
    clear,
    getById,
  };
}
