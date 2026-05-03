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
 *  trimmed label. Pure / idempotent; safe to call inside a render
 *  body. */
export function resolvePointer(p: AttentionPointer): {
  shape: AttentionPointerShape;
  xPct: number;
  yPct: number;
  label: string | null;
} {
  return {
    shape: p.shape,
    xPct: clampPointerCoord(p.x) * 100,
    yPct: clampPointerCoord(p.y) * 100,
    label:
      typeof p.label === "string" && p.label.trim().length > 0
        ? p.label.trim().slice(0, 24)
        : null,
  };
}
