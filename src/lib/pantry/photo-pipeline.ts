/**
 * Pantry photo pipeline (Y3 W13 — feature 1.1 substrate).
 *
 * Pure helpers for the photo-to-pantry haul-shot flow. Mirrors
 * the W3 R2 photo-pipeline pattern (Y2 W3): substrate-first,
 * stub-mode-V1 with deterministic fixture, real mode (Anthropic
 * vision) lights up at Y4 W5 founder-key day.
 *
 * Three layers:
 *   1. detectPantryItemsStub(photoBytesLength) — deterministic
 *      6-item fixture for stub mode. The seed length lets us
 *      vary the fixture slightly across captures so the demo
 *      doesn't feel canned.
 *   2. processDetections — confirmation state machine. Accept
 *      / reject / rename chip operations.
 *   3. mergeWithExistingPantry — write-back path. Adds new
 *      detections to the user's pantry without duplicating
 *      existing entries (the W15 normaliseIngredientName helper
 *      handles fuzzy matching).
 *
 * Pure / dependency-free / deterministic.
 */

import { normaliseIngredientName } from "@/lib/engine/pantry-coverage";

/** Item classes the stub fixture rotates through. Real mode
 *  pulls from the W15 ItemClass taxonomy (~120 entries). */
const STUB_FIXTURE_POOL: ReadonlyArray<DetectedItem> = [
  { name: "fresh basil", confidence: 0.92, itemClass: "fresh-herb" },
  { name: "lemon", confidence: 0.96, itemClass: "citrus" },
  { name: "garlic", confidence: 0.88, itemClass: "allium" },
  { name: "parmesan", confidence: 0.81, itemClass: "hard-cheese" },
  { name: "olive oil", confidence: 0.94, itemClass: "pantry-oil" },
  { name: "spaghetti", confidence: 0.97, itemClass: "dry-pasta" },
  { name: "cherry tomatoes", confidence: 0.85, itemClass: "produce" },
  { name: "eggs", confidence: 0.93, itemClass: "dairy-egg" },
  { name: "spinach", confidence: 0.78, itemClass: "leafy-green" },
  { name: "feta", confidence: 0.83, itemClass: "soft-cheese" },
];

export interface DetectedItem {
  /** Plain-English ingredient name. Display + write-back use
   *  this directly; the matcher normalises via the W15 helper. */
  name: string;
  /** Vision confidence 0..1. Real-mode threshold; stub-mode
   *  pre-populated with realistic variation. */
  confidence: number;
  /** ItemClass slug from the W15 taxonomy. */
  itemClass: string;
}

export interface DetectionResult {
  detected: DetectedItem[];
  /** Captured-photo byte length, useful for the seed-rotation
   *  in stub mode. Real mode echoes back the upload size for
   *  telemetry. */
  photoBytes: number;
  /** Mode flag. UX hides this; telemetry surfaces it. */
  mode: "stub" | "vision";
}

/** Pure: stub-mode detection. Returns 4-6 deterministic items
 *  drawn from the fixture pool. The exact subset rotates based
 *  on photoBytesLength so consecutive captures don't show the
 *  same items every time (even though the fixture itself is
 *  static). */
export function detectPantryItemsStub(
  photoBytesLength: number,
): DetectionResult {
  if (!Number.isFinite(photoBytesLength) || photoBytesLength <= 0) {
    return {
      detected: STUB_FIXTURE_POOL.slice(0, 6),
      photoBytes: 0,
      mode: "stub",
    };
  }

  // Deterministic rotation: pick 4-6 items based on the byte
  // length modulo. Same input → same output (testable).
  const count = 4 + (photoBytesLength % 3); // 4, 5, or 6
  const offset = photoBytesLength % STUB_FIXTURE_POOL.length;
  const detected: DetectedItem[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (offset + i) % STUB_FIXTURE_POOL.length;
    const item = STUB_FIXTURE_POOL[idx];
    if (item) detected.push(item);
  }
  return {
    detected,
    photoBytes: photoBytesLength,
    mode: "stub",
  };
}

export type ConfirmationOp =
  | { kind: "accept-all" }
  | { kind: "reject"; itemName: string }
  | { kind: "rename"; oldName: string; newName: string };

/** Pure: apply a confirmation operation to a detection list.
 *  Returns the updated list. Accept-all is a no-op on the
 *  list (the caller proceeds to write-back); reject removes
 *  the named item; rename swaps the name in place. */
export function applyConfirmationOp(
  items: ReadonlyArray<DetectedItem>,
  op: ConfirmationOp,
): DetectedItem[] {
  switch (op.kind) {
    case "accept-all":
      return [...items];
    case "reject":
      return items.filter(
        (i) =>
          normaliseIngredientName(i.name) !==
          normaliseIngredientName(op.itemName),
      );
    case "rename": {
      const oldNormalised = normaliseIngredientName(op.oldName);
      const next: DetectedItem[] = [];
      for (const i of items) {
        if (normaliseIngredientName(i.name) === oldNormalised) {
          next.push({ ...i, name: op.newName });
        } else {
          next.push(i);
        }
      }
      return next;
    }
  }
}

/** Pure: merge confirmed detections into the existing pantry.
 *  Returns the new pantry list. Items already present (case-
 *  insensitive normalised match) are skipped — no double-write.
 *  Returns:
 *    - nextPantry: full pantry post-merge
 *    - addedNames: subset that was actually added (for the
 *      'Added X new items' confirmation toast). */
export function mergeWithExistingPantry(
  detected: ReadonlyArray<DetectedItem>,
  existing: ReadonlyArray<string>,
): { nextPantry: string[]; addedNames: string[] } {
  const seen = new Set(existing.map(normaliseIngredientName));
  const next: string[] = [...existing];
  const added: string[] = [];
  for (const det of detected) {
    const norm = normaliseIngredientName(det.name);
    if (seen.has(norm)) continue;
    seen.add(norm);
    next.push(det.name);
    added.push(det.name);
  }
  return { nextPantry: next, addedNames: added };
}
