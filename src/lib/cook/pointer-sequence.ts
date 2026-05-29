/**
 * Pointer sequence runner (Y2 Sprint F W24).
 *
 * Consumes the W23 `AttentionPointer.revealAtSecond` field. Given
 * a list of pointers + elapsed step time in seconds, returns the
 * subset that should currently be visible.
 *
 * Pure / dependency-free / deterministic. The React layer
 * (`use-elapsed-seconds.ts` hook + AttentionPointerOverlay) calls
 * this once per render with the current elapsed time.
 *
 * Design choice: we re-derive the visible set on each tick rather
 * than incrementally adding pointers as their reveal time passes.
 * Re-derivation is O(n) on a small array (≤ 6 pointers per step
 * in practice) and avoids the bookkeeping of "which pointers have
 * I already shown" — important when stepKey changes (the elapsed
 * counter resets, and we want pointers to appear from scratch).
 */

import {
  normaliseRevealAtSecond,
  sortPointersByRevealTime,
  type AttentionPointer,
} from "./attention-pointer";

export interface ActivePointersOptions {
  /** When true, pointers that have already revealed STAY revealed
   *  even after elapsed advances past them. The W24 default is
   *  TRUE — once a pointer appears, it persists for the rest of
   *  the step. Pass false for "carousel" mode where each new
   *  pointer hides the previous (defer-to-MVP-6 territory). */
  persist?: boolean;
}

/** Pure: given pointers + elapsed seconds in the current step,
 *  return the subset that should be visible right now.
 *
 *  Sorted by reveal time (ascending) for deterministic render
 *  order. Persistent semantics by default — once revealed, a
 *  pointer stays. */
export function getActivePointers(
  pointers: ReadonlyArray<AttentionPointer>,
  elapsedSeconds: number,
  options: ActivePointersOptions = {},
): AttentionPointer[] {
  const persist = options.persist ?? true;
  const elapsedClamped = Number.isFinite(elapsedSeconds)
    ? Math.max(0, elapsedSeconds)
    : 0;

  // Sort first so output is in reveal order regardless of input.
  const sorted = sortPointersByRevealTime(pointers);

  if (persist) {
    return sorted.filter(
      (p) => normaliseRevealAtSecond(p.revealAtSecond) <= elapsedClamped,
    );
  }

  // Non-persist (carousel) mode — show only the latest revealed
  // pointer. Find the highest revealAtSecond ≤ elapsed; show
  // only that one (and any peers tied to the same time).
  let activeTime = -1;
  for (const p of sorted) {
    const rt = normaliseRevealAtSecond(p.revealAtSecond);
    if (rt <= elapsedClamped && rt > activeTime) activeTime = rt;
  }
  if (activeTime < 0) return [];
  return sorted.filter(
    (p) => normaliseRevealAtSecond(p.revealAtSecond) === activeTime,
  );
}

/** Pure: when does the next not-yet-revealed pointer fire?
 *  Returns null when all pointers have already revealed.
 *  Useful for the hook's "next tick" optimisation — it can
 *  pause its rAF loop and resume just before the next reveal. */
export function nextRevealTime(
  pointers: ReadonlyArray<AttentionPointer>,
  elapsedSeconds: number,
): number | null {
  const elapsedClamped = Number.isFinite(elapsedSeconds)
    ? Math.max(0, elapsedSeconds)
    : 0;
  let next: number | null = null;
  for (const p of pointers) {
    const rt = normaliseRevealAtSecond(p.revealAtSecond);
    if (rt > elapsedClamped) {
      if (next === null || rt < next) next = rt;
    }
  }
  return next;
}
