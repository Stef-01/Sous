/**
 * celebrated-challenges — localStorage-backed remembrance of which
 * challenges the user has already received the one-time
 * celebration toast for (Y5 D, audit P0 · end-of-challenge
 * celebration polish).
 *
 * Pure-helper layer so the banner component (which fires the
 * toast) can stay thin. The persistence is the W15 RCA pattern:
 * freshDefault factory + defensive parser + per-record drop on
 * corruption.
 *
 * All exports are pure / dependency-free (no React, no DOM).
 */

export const CELEBRATED_CHALLENGES_STORAGE_KEY =
  "sous-eco-celebrated-challenges-v1";
const SCHEMA_VERSION = 1 as const;

interface StoredShape {
  v: number;
  /** Set of challenge slugs already celebrated. Stored as
   *  array (JSON has no Set). Sorted on write for diff stability. */
  slugs: ReadonlyArray<string>;
}

function freshDefault(): StoredShape {
  return { v: SCHEMA_VERSION, slugs: [] };
}

/** Pure: parse the stored payload defensively. Returns a fresh
 *  default on null / malformed JSON / schema mismatch. */
export function parseCelebratedChallenges(
  raw: string | null | undefined,
): StoredShape {
  if (!raw) return freshDefault();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return freshDefault();
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return freshDefault();
  }
  const obj = parsed as Partial<StoredShape>;
  if (obj.v !== SCHEMA_VERSION) return freshDefault();
  const slugs = Array.isArray(obj.slugs)
    ? Array.from(
        new Set(
          obj.slugs.filter((s): s is string => typeof s === "string" && !!s),
        ),
      )
    : [];
  return { v: SCHEMA_VERSION, slugs };
}

/** Pure: serialise the stored shape back. */
export function serializeCelebratedChallenges(state: StoredShape): string {
  return JSON.stringify({
    v: SCHEMA_VERSION,
    slugs: [...state.slugs].sort(),
  } satisfies StoredShape);
}

/** Pure: has this challenge slug already been celebrated? */
export function hasCelebrated(input: {
  state: StoredShape;
  slug: string;
}): boolean {
  return input.state.slugs.includes(input.slug);
}

/** Pure: mark a slug as celebrated; returns the next state. */
export function markCelebrated(input: {
  state: StoredShape;
  slug: string;
}): StoredShape {
  if (hasCelebrated(input)) return input.state;
  return {
    v: SCHEMA_VERSION,
    slugs: [...input.state.slugs, input.slug],
  };
}
