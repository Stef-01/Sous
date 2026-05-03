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
 * Line format (Y1 W44, still supported):
 *
 *   <shape>: <x>, <y> [- <label>]
 *
 * Line format (Y2 W25 extension — sequenced reveal):
 *
 *   <shape>: <x>, <y> [@ <seconds>s] [- <label>]
 *
 * Examples:
 *
 *   circle: 0.3, 0.5
 *   circle: 0.3, 0.5 - watch the bubbles
 *   arrow: 0.7, 0.2 - stir here
 *   circle: 0.3, 0.5 @ 8s - watch the bubbles    (Y2 W25)
 *   arrow: 0.7, 0.2 @ 0.5s                        (sub-second OK)
 *
 * Conservative on parse errors: bad lines silently drop. The
 * caller stays in flow; the form's submit-time schema validation
 * catches structural issues.
 *
 * Pure / dependency-free.
 */

import {
  normaliseRevealAtSecond,
  type AttentionPointer,
} from "./attention-pointer";

/** Match a single pointer line. Capture groups:
 *    1. shape (circle / arrow)
 *    2. x coordinate
 *    3. y coordinate
 *    4. revealAtSecond (Y2 W25 — optional)
 *    5. label (optional)
 *
 *  The `s` after the seconds value is optional so authors can
 *  type "@ 8" or "@ 8s" — both read fine. */
const LINE_RE =
  /^\s*(circle|arrow)\s*:\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*(?:@\s*(\d+(?:\.\d+)?)\s*s?\s*)?(?:[-–—]\s*(.*))?$/i;

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

    // Y2 W25: optional @ Ns reveal-time segment
    const revealRaw = m[4];
    const revealParsed =
      typeof revealRaw === "string" && revealRaw.length > 0
        ? Number(revealRaw)
        : undefined;
    const revealAtSecond =
      revealParsed !== undefined && Number.isFinite(revealParsed)
        ? normaliseRevealAtSecond(revealParsed)
        : undefined;

    const labelRaw = (m[5] ?? "").trim();
    const label = labelRaw.length > 0 ? labelRaw.slice(0, 24) : undefined;

    const pointer: AttentionPointer = { shape, x, y };
    if (label !== undefined) pointer.label = label;
    if (revealAtSecond !== undefined && revealAtSecond > 0) {
      pointer.revealAtSecond = revealAtSecond;
    }
    out.push(pointer);
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
      let head = `${p.shape}: ${formatCoord(p.x)}, ${formatCoord(p.y)}`;
      // Y2 W25: emit @ Ns segment when reveal time is set + > 0
      const reveal = normaliseRevealAtSecond(p.revealAtSecond);
      if (reveal > 0) head += ` @ ${formatCoord(reveal)}s`;
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
