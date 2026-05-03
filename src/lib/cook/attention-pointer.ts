/**
 * Attention pointer — the data layer for MVP 4 of the cook-nav
 * initiative (W28 in the 12-month plan; slid to W29 because the
 * Sprint-A→E carry-forward took priority).
 *
 * A pointer is a small visual aid laid over the step image telling
 * the user WHERE to look: "look at this corner for golden edges",
 * "stir from the bottom here". Compared to the W22/W27 visual-mode
 * (which just promotes the image), a pointer gives spatial focus.
 *
 * MVP 5 (W36) animates a sequence of pointers; MVP 6 (post-W52)
 * replaces the static image+pointer with a short video loop. This
 * file is just the static foundation — pure data + clamping —
 * ready to layer animation on top.
 *
 * Pure / dependency-free so unit tests cover the clamp matrix
 * without touching React or the DOM.
 */

export type AttentionPointerShape = "circle" | "arrow";

export interface AttentionPointer {
  /** Pointer shape — circle (highlight a spot) vs arrow (point
   *  toward a spot from outside). MVP 4 implements both visually,
   *  but content authoring can start with circles only — they
   *  carry less directional ambiguity. */
  shape: AttentionPointerShape;
  /** Normalised X position over the parent image (0..1, left to
   *  right). Values outside [0,1] are clamped on read; do not
   *  depend on the unsanitised value. */
  x: number;
  /** Normalised Y position over the parent image (0..1, top to
   *  bottom). Same clamp policy as x. */
  y: number;
  /** Optional short label (≤ 24 chars) rendered next to the
   *  pointer. Use when the visual alone wouldn't tell the cook
   *  what to look for ("watch for sizzle"). */
  label?: string;
  /** Y2 W23 — sequence-runner schema delta. Seconds elapsed in
   *  the step before this pointer renders. 0 / unset = reveal
   *  immediately (W22 behaviour). Positive = sequence in.
   *  Existing content has no field set; the runner treats that
   *  as instant reveal so legacy steps are unaffected.
   *  Negative / non-finite values normalise to 0 via
   *  `normaliseRevealAtSecond`. */
  revealAtSecond?: number;
}

/** Clamp a single coordinate value to [0,1]. NaN / Infinity / null
 *  / undefined collapse to 0.5 — that puts a misconfigured pointer
 *  in the middle of the image so it's still visible (and obviously
 *  wrong) rather than off-screen and invisible. */
export function clampPointerCoord(value: number | null | undefined): number {
  if (value === null || value === undefined) return 0.5;
  if (!Number.isFinite(value)) return 0.5;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/** Resolve a pointer's display coordinates — clamped x/y plus a
 *  trimmed label + normalised reveal time. Pure / idempotent;
 *  safe to call inside a render body. */
export function resolvePointer(p: AttentionPointer): {
  shape: AttentionPointerShape;
  xPct: number;
  yPct: number;
  label: string | null;
  revealAtSecond: number;
} {
  return {
    shape: p.shape,
    xPct: clampPointerCoord(p.x) * 100,
    yPct: clampPointerCoord(p.y) * 100,
    label:
      typeof p.label === "string" && p.label.trim().length > 0
        ? p.label.trim().slice(0, 24)
        : null,
    revealAtSecond: normaliseRevealAtSecond(p.revealAtSecond),
  };
}

/** Y2 W23 — clamp a revealAtSecond value to a sane non-negative
 *  finite number. Undefined / null / NaN / Infinity / negative
 *  values all collapse to 0 (reveal immediately).
 *
 *  The cap of 600s = 10 minutes covers every sensible cook step;
 *  longer than that is almost certainly a content-authoring bug
 *  (the user shouldn't watch a single step for >10 min anyway).
 *  Cap rather than reject so the pointer still renders. */
export function normaliseRevealAtSecond(
  value: number | null | undefined,
): number {
  if (value === null || value === undefined) return 0;
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value > 600) return 600;
  return value;
}

/** Y2 W23 — order pointers by reveal time so the W24 sequence
 *  runner can iterate in chronological order. Stable: pointers
 *  with identical reveal times retain their input order so a
 *  recipe author's authoring sequence wins as a tiebreaker.
 *
 *  Returns a NEW array (no mutation of input). Pointers with
 *  unset / NaN / negative reveal time bucket as 0. */
export function sortPointersByRevealTime(
  pointers: ReadonlyArray<AttentionPointer>,
): AttentionPointer[] {
  return pointers
    .map((p, idx) => ({
      pointer: p,
      revealAt: normaliseRevealAtSecond(p.revealAtSecond),
      idx,
    }))
    .sort((a, b) => {
      if (a.revealAt !== b.revealAt) return a.revealAt - b.revealAt;
      return a.idx - b.idx;
    })
    .map((entry) => entry.pointer);
}

/** Y2 W23 — migrate a legacy AttentionPointer (which may lack
 *  `revealAtSecond`) to the W23 shape. Idempotent: applying
 *  twice yields the same result. Use when persisting authored
 *  pointers + want a stable on-disk shape. */
export function migrateAttentionPointer(
  legacy: AttentionPointer,
): AttentionPointer {
  return {
    shape: legacy.shape,
    x: legacy.x,
    y: legacy.y,
    ...(legacy.label !== undefined ? { label: legacy.label } : {}),
    revealAtSecond: normaliseRevealAtSecond(legacy.revealAtSecond),
  };
}
