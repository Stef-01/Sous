"use client";

/**
 * useCurrentPod — localStorage-backed Cooking Pod state.
 *
 * W45 substrate per `docs/COOKING-POD-CHALLENGE.md` V2. V1 is
 * single-pod-per-device (Stefan-confirmed vibecode acceptable);
 * multi-device public launch lands Year-2 W1-W4 when auth +
 * Postgres + R2 unlock.
 *
 * Mirrors the W15 / W22 / W24 / W32 / W35 pref-hook pattern:
 *   - freshDefault factory (no shared mutable state)
 *   - object-shape gate before destructuring (W15 RCA)
 *   - schema-version check (W32 pattern)
 *   - per-record schema validation (drops invalid entries
 *     silently — better partial recovery than losing the whole
 *     pod state when one submission is corrupt)
 *
 * Pure parser `parseStoredPodState` exported so tests can
 * exercise it without a DOM.
 */

import { useCallback, useEffect, useState } from "react";
import {
  POD_SCHEMA_VERSION,
  challengePodSchema,
  podChallengeWeekSchema,
  podSubmissionSchema,
  type ChallengePod,
  type PodChallengeWeek,
  type PodState,
  type PodSubmission,
} from "@/types/challenge-pod";

const STORAGE_KEY = "sous-pod-state-v1";

function freshDefault(): PodState {
  return {
    schemaVersion: POD_SCHEMA_VERSION,
    pod: null,
    weeks: {},
    submissions: {},
  };
}

/** Pure parser. Defends against:
 *   - missing key → fresh default
 *   - non-JSON / corrupt payload → fresh default
 *   - JSON null / array / primitive → fresh default
 *   - schema-version mismatch → fresh default
 *   - per-record schema failures → drop the bad record, keep
 *     the rest (better partial recovery than losing the whole
 *     pod state)
 */
export function parseStoredPodState(raw: string | null | undefined): PodState {
  if (!raw) return freshDefault();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return freshDefault();
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return freshDefault();
  }
  const obj = parsed as Partial<PodState>;
  if (obj.schemaVersion !== POD_SCHEMA_VERSION) return freshDefault();

  // Pod: validate as a unit; null is a valid value (no pod yet).
  let pod: ChallengePod | null = null;
  if (obj.pod !== null && obj.pod !== undefined) {
    const result = challengePodSchema.safeParse(obj.pod);
    if (result.success) pod = result.data;
    // If pod is corrupt, fall back to "no pod" rather than
    // returning a defaulted skeleton — the user should know they
    // need to recreate.
  }

  // Weeks + submissions: per-record validation, drop the bad
  // ones silently.
  const weeks: Record<string, PodChallengeWeek> = {};
  if (obj.weeks && typeof obj.weeks === "object" && !Array.isArray(obj.weeks)) {
    for (const [k, v] of Object.entries(obj.weeks)) {
      const result = podChallengeWeekSchema.safeParse(v);
      if (result.success) weeks[k] = result.data;
    }
  }

  const submissions: Record<string, PodSubmission> = {};
  if (
    obj.submissions &&
    typeof obj.submissions === "object" &&
    !Array.isArray(obj.submissions)
  ) {
    for (const [k, v] of Object.entries(obj.submissions)) {
      const result = podSubmissionSchema.safeParse(v);
      if (result.success) submissions[k] = result.data;
    }
  }

  return {
    schemaVersion: POD_SCHEMA_VERSION,
    pod,
    weeks,
    submissions,
  };
}

function persist(state: PodState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore — quota / privacy mode
  }
}

export function useCurrentPod() {
  const [state, setState] = useState<PodState>(freshDefault);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate from localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") {
      setMounted(true);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setState(parseStoredPodState(raw));
    } catch {
      setState(freshDefault());
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Replace the entire pod (creation or full reload). Validates
   *  before persisting; falls back to no-op if the input fails. */
  const setPod = useCallback((pod: ChallengePod | null) => {
    if (pod !== null) {
      const result = challengePodSchema.safeParse(pod);
      if (!result.success) return;
    }
    setState((prev) => {
      const next: PodState = { ...prev, pod };
      persist(next);
      return next;
    });
  }, []);

  /** Append or update a challenge week (idempotent on weekKey). */
  const upsertWeek = useCallback((week: PodChallengeWeek) => {
    const result = podChallengeWeekSchema.safeParse(week);
    if (!result.success) return;
    setState((prev) => {
      const next: PodState = {
        ...prev,
        weeks: { ...prev.weeks, [week.weekKey]: result.data },
      };
      persist(next);
      return next;
    });
  }, []);

  /** Append or update a submission (idempotent on id). */
  const upsertSubmission = useCallback((submission: PodSubmission) => {
    const result = podSubmissionSchema.safeParse(submission);
    if (!result.success) return;
    setState((prev) => {
      const next: PodState = {
        ...prev,
        submissions: { ...prev.submissions, [submission.id]: result.data },
      };
      persist(next);
      return next;
    });
  }, []);

  /** Delete a submission by id. Idempotent on missing ids. */
  const removeSubmission = useCallback((id: string) => {
    setState((prev) => {
      if (!(id in prev.submissions)) return prev;
      const nextSubs = { ...prev.submissions };
      delete nextSubs[id];
      const next: PodState = { ...prev, submissions: nextSubs };
      persist(next);
      return next;
    });
  }, []);

  /** Wipe the entire pod state — admin "leave + delete" flow. */
  const clear = useCallback(() => {
    const next = freshDefault();
    persist(next);
    setState(next);
  }, []);

  return {
    state,
    pod: state.pod,
    weeks: state.weeks,
    submissions: state.submissions,
    mounted,
    setPod,
    upsertWeek,
    upsertSubmission,
    removeSubmission,
    clear,
  };
}

/** Pure helper: list submissions filtered to a specific week.
 *  Sorted by submittedAt ascending so the gallery renders
 *  deterministically. Used by computePodWeeklyScore + the W46
 *  gallery surface. */
export function listSubmissionsForWeek(
  state: PodState,
  weekKey: string,
): PodSubmission[] {
  const out: PodSubmission[] = [];
  for (const sub of Object.values(state.submissions)) {
    if (sub.weekKey === weekKey) out.push(sub);
  }
  out.sort((a, b) =>
    a.submittedAt < b.submittedAt ? -1 : a.submittedAt > b.submittedAt ? 1 : 0,
  );
  return out;
}

/** Pure helper: list active member ids (everyone NOT in
 *  vacation mode). Drives the consistency-multiplier
 *  denominator. */
export function activeMemberIds(pod: ChallengePod | null): string[] {
  if (!pod) return [];
  return pod.members
    .filter((m) => m.vacationSince === null || m.vacationSince === undefined)
    .map((m) => m.id);
}
