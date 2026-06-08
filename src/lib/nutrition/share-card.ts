/**
 * W45 — Export / share nutrition as an image card. The testable core is a PURE
 * SVG serializer (no DOM); the client turns the SVG into a PNG for download.
 * Carries the SAME honesty framing as the UI (an estimate footer); an empty day
 * yields a friendly empty card rather than a broken one. No PII in the image.
 */

export interface ShareCardInput {
  title: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export const SHARE_FOOTER =
  "Estimated from recipe ingredients — a guide, not a label.";

const W = 600;
const H = 600;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stat(x: number, label: string, value: string): string {
  return `
    <text x="${x}" y="392" text-anchor="middle" font-size="34" font-weight="700" fill="#1f3d2b">${esc(value)}</text>
    <text x="${x}" y="420" text-anchor="middle" font-size="20" fill="#5b6b60">${esc(label)}</text>`;
}

/** Pure SVG string for a dish/day's nutrition; null → a friendly empty card. */
export function buildNutritionShareSVG(input: ShareCardInput | null): string {
  const head = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="system-ui, -apple-system, sans-serif">
    <rect width="${W}" height="${H}" rx="36" fill="#f7f4ec"/>`;
  const footer = `<text x="${W / 2}" y="556" text-anchor="middle" font-size="17" fill="#9aa69c">${esc(SHARE_FOOTER)}</text>
    <text x="${W / 2}" y="582" text-anchor="middle" font-size="16" font-weight="700" fill="#2f7d4f">Sous</text>`;

  if (!input) {
    return `${head}
    <text x="${W / 2}" y="280" text-anchor="middle" font-size="32" font-weight="700" fill="#1f3d2b">No nutrition yet</text>
    <text x="${W / 2}" y="324" text-anchor="middle" font-size="22" fill="#5b6b60">Cook something to fill this in 🍳</text>
    ${footer}
  </svg>`;
  }

  return `${head}
    <text x="${W / 2}" y="92" text-anchor="middle" font-size="26" font-weight="600" fill="#5b6b60">${esc(
      "What this delivers",
    )}</text>
    <text x="${W / 2}" y="148" text-anchor="middle" font-size="40" font-weight="800" fill="#1f3d2b">${esc(
      input.title,
    )}</text>
    <circle cx="${W / 2}" cy="262" r="92" fill="none" stroke="#e3ded2" stroke-width="18"/>
    <circle cx="${W / 2}" cy="262" r="92" fill="none" stroke="#2f7d4f" stroke-width="18" stroke-linecap="round" stroke-dasharray="430 578" transform="rotate(-90 ${W / 2} 262)"/>
    <text x="${W / 2}" y="258" text-anchor="middle" font-size="52" font-weight="800" fill="#1f3d2b">${input.calories}</text>
    <text x="${W / 2}" y="290" text-anchor="middle" font-size="20" fill="#5b6b60">calories</text>
    ${stat(120, "Protein", `${input.protein_g}g`)}
    ${stat(280, "Carbs", `${input.carbs_g}g`)}
    ${stat(440, "Fat", `${input.fat_g}g`)}
    <text x="${W / 2}" y="470" text-anchor="middle" font-size="20" fill="#5b6b60">Fibre ${input.fiber_g}g</text>
    ${footer}
  </svg>`;
}
