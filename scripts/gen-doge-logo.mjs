/**
 * gen-doge-logo.mjs — render an original "Doge" wordmark to replace the reserved
 * Tamaweb logo PNGs (ui/logo_trans_01.png is shown on the loading + egg-splash
 * screens). The Tamaweb name/logo are reserved branding (TERMS_OF_USE §2), so we
 * substitute our own mark. Output is original work authored here.
 *
 * Run: node scripts/gen-doge-logo.mjs
 */
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UI = resolve(__dirname, "../public/tamaweb/resources/img/ui");

const W = 1200;
const H = 500;

// A bold, rounded, two-tone wordmark with a little Doberman-ear accent — warm
// orange fill + cream outline to match the game's bubbly aesthetic.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffb454"/>
      <stop offset="1" stop-color="#f0922e"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#7a3d09" flood-opacity="0.35"/>
    </filter>
  </defs>
  <g filter="url(#soft)" font-family="Arial Rounded MT Bold, Avenir Next, Arial, sans-serif" font-weight="700" text-anchor="middle">
    <text x="${W / 2}" y="320" font-size="280"
          fill="url(#fill)" stroke="#fffdf7" stroke-width="16" paint-order="stroke" stroke-linejoin="round"
          letter-spacing="6">Doge</text>
  </g>
  <!-- two upright Doberman ears over the 'o', tiny accent -->
  <g fill="#2a2024">
    <path d="M455 150 L470 96 L500 150 Z"/>
    <path d="M548 150 L533 96 L503 150 Z"/>
  </g>
</svg>`;

const png = new Resvg(svg, {
  fitTo: { mode: "width", value: W },
  background: "rgba(0,0,0,0)",
  font: { loadSystemFonts: true },
})
  .render()
  .asPng();

for (const name of ["logo_trans_01.png", "logo_full.png", "logo_mask.png"]) {
  writeFileSync(resolve(UI, name), png);
  console.log("wrote", name, png.length, "bytes");
}
