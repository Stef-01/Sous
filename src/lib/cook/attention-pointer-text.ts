/**
 * Textarea-friendly serialisation for attention pointers.
 *
 * W44 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint I content
 * polish). Adds an authoring surface for the W29 MVP 4 SVG
 * attention pointers without requiring a canvas-click UX:
 * the user types one pointer per line in a structured but
 * readable format, the form parses it back to
 * `AttentionPointer[]`.
 *
 * Line format:
 *
 *   <shape>: <x>, <y> [- <label>]
 *
 * Examples:
 *
 *   circle: 0.3, 0.5
 *   circle: 0.3, 0.5 - watch the bubbles
 *   arrow: 0.7, 0.2 - stir here
 *
 * Conservative on parse errors: bad lines silently drop. The
 * caller stays in flow; the form's submit-time schema validation
 * catches structural issues.
 *
 * Pure / dependency-free.
 */

import type { AttentionPointer } from "./attention-pointer";

const LINE_RE =
  /^\s*(circle|arrow)\s*:\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*(?:[-–—]\s*(.*))?$/i;

/** Parse a pointer block — one pointer per line. Bad lines drop
 *  silently; the resulting array can be fed straight into the
 *  schema validation. */
export function parsePointerLines(text: string): AttentionPointer[] {
  if (!text) return [];
  const out: AttentionPointer[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.length === 0) continue;
    const m = line.match(LINE_RE);
    if (!m) continue;
    const shape = m[1].toLowerCase() as "circle" | "arrow";
    const x = Number(m[2]);
    const y = Number(m[3]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const labelRaw = (m[4] ?? "").trim();
    const label = labelRaw.length > 0 ? labelRaw.slice(0, 24) : undefined;
    out.push(label === undefined ? { shape, x, y } : { shape, x, y, label });
  }
  return out;
}

/** Inverse of parsePointerLines — round-trip-safe for authored
 *  pointers. Used by the step-detail panel to seed the textarea
 *  when editing an existing recipe. */
export function serialisePointerLines(
  pointers: ReadonlyArray<AttentionPointer> | null | undefined,
): string {
  if (!pointers || pointers.length === 0) return "";
  return pointers
    .map((p) => {
      const head = `${p.shape}: ${formatCoord(p.x)}, ${formatCoord(p.y)}`;
      return p.label && p.label.trim().length > 0
        ? `${head} - ${p.label.trim()}`
        : head;
    })
    .join("\n");
}

/** Format a normalised coordinate compactly: drop trailing zeros
 *  so "0.50000" renders as "0.5" but "0.55" stays "0.55". */
function formatCoord(n: number): string {
  if (!Number.isFinite(n)) return "0.5";
  // Round to 3 decimal places then strip trailing zeros.
  return parseFloat(n.toFixed(3)).toString();
}
