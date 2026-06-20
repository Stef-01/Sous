/**
 * gen-doge-atlas.mjs — generate the Doberman sprite-skin atlases that reskin the
 * vendored pet. Original pixel art authored here (the palette + part vocabulary
 * come from Sous's own src/components/nutrition/pixel-doberman.tsx); nothing is
 * derived from Tamaweb's reserved art.
 *
 * Output: public/tamaweb/resources/img/doge/doge_{baby,child,teen,adult,elder}.png
 * + doge-atlas.manifest.json. Each PNG is a 4x4 grid of cellSize cells; the cell
 * layout obeys the engine's animation table (PetDefinition.animations), which
 * indexes cells 1-based and is SHARED by all characters — so a replacement atlas
 * must honor exact pose-per-cell. See docs/DOGE-INTEGRATION-PLAN.md §2.
 *
 *   stage   cellSize  atlas
 *   baby    16        64x64
 *   child   24        96x96
 *   teen    24        96x96
 *   adult   32        128x128
 *   elder   32        128x128
 *
 * Run: node scripts/gen-doge-atlas.mjs   (or: pnpm gen:doge-atlas)
 */
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/tamaweb/resources/img/doge");

// Classic black-and-rust Doberman palette (from pixel-doberman.tsx).
const COLORS = {
  K: "#2b2622", // coat
  H: "#403931", // coat rim light (top edge)
  S: "#1c1916", // coat shadow (underside)
  D: "#121212", // nose + mouth
  R: "#bd6a26", // rust markings
  r: "#d98c48", // rust highlight
  W: "#f6efe4", // eye shine
  P: "#ef9bb0", // tongue
  E: "#e98b9c", // pink inner ear
  O: "#171310", // 1px contour
};

const GRID = 16; // every pose is authored on a 16x16 grid

// ── Front-facing Doberman parts (from pixel-doberman buildMap, padded to 16w) ──
const EARS_UP = ["..K.........K...", "..KK.......KK...", "..KKK.....KKK..."];
const EARS_DOWN = [
  "...............",
  "..KK.......KK...",
  "..KKK.....KKK...",
].map(padR);
const HEAD = ["..KKKKKKKKKKK...", "..KRKKKKKKKRK..."];
const EYES_OPEN = "..KWKKKKKKKWK...";
const EYES_CLOSED = "..KKKKKKKKKKK...";
const EYES_SAD = "..KKKKKKKKKKK..."; // no shine
const EYES_SHOCK = "..WWKKKKKKWWK..."; // wide
const MUZZLE = ["..KKKrRRrKKKK...", "...KRrRRRrRK....", "...KRRDDRRRK...."];
const MUZZLE_OPEN = [
  "..KKKrRRrKKKK...",
  "...KRrDDDrRK....",
  "...KRDPPDRRK....",
]; // mouth open + tongue
const CHIN = "....KRRRRK......";
const CHIN_TONGUE = "....KRPPRK......";
const BODY_FRONT = [
  ".....KKKK.......",
  "....KKRRKK......",
  "...KKRRRRKK.....",
  "...KKRRRRKK.....",
  "...KKKRRKKK.....",
  "...KRK...KRK....",
];

function padR(s) {
  return (s + "...............").slice(0, GRID);
}

/** Normalize any pose to exactly GRID x GRID (pad rows wide + pad to GRID rows). */
function norm(rows) {
  const g = rows.map(padR);
  while (g.length < GRID) g.push(padR(""));
  return g.slice(0, GRID);
}

/** Compose a 16x16 front pose from parts (ears/eyes/mouth swapped per mood). */
function front({
  ears = EARS_UP,
  eyes = EYES_OPEN,
  muzzle = MUZZLE,
  chin = CHIN,
} = {}) {
  const rows = [...ears, ...HEAD, eyes, ...muzzle, chin, ...BODY_FRONT].map(
    padR,
  );
  while (rows.length < GRID) rows.push(padR(""));
  return rows.slice(0, GRID);
}

// ── Side-facing Doberman (facing right): docked-tail nub, four legs ──
function side(legs) {
  return [
    "...............",
    "..........K..K.",
    "..........KKKK.",
    ".K......KKKKKKK",
    ".KK....KKKKWKKK",
    "..KKKKKKKKKKRRD",
    "..KKKKKKKKKKKK.",
    "..KKRRRRRRKKKK.",
    "..KKRRRRRRKKKK.",
    "..KKKKKKKKKKKK.",
    "...KKKKKKKKKK..",
    ...legs,
    "...............",
  ]
    .map(padR)
    .slice(0, GRID);
}
const LEGS_STAND = ["...K..K..K..K..", "...K..K..K..K..", "...R..R..R..R.."];
const LEGS_WALK = ["..K...K..K...K.", ".K....K..K....K", ".R....R..R....R"];

// ── Sit (front, haunches down) + Sleep (lying, eyes closed, curled) ──
function sit() {
  return [
    ...EARS_UP,
    ...HEAD,
    EYES_OPEN,
    ...MUZZLE,
    CHIN,
    "...KKKKKKKK....",
    "..KKRRRRRRKK...",
    "..KKRRRRRRKK...",
    "..KKKKKKKKKK...",
    "..RK......KR...",
  ]
    .map(padR)
    .slice(0, GRID);
}
const SLEEP = [
  "...............",
  "...............",
  "...............",
  "...............",
  ".....KK........",
  "....KKKK....K..",
  "...KKKKKKKKKKK.",
  "..KKKKKKKKKKKKK",
  "..KEKKRRRRRKKKD",
  "..KKKKRRRRRKKK.",
  "..KKKKKKKKKKKK.",
  "...KKKKKKKKKK..",
  "...RR..RR..RR..",
  "...............",
  "...............",
  "...............",
].map(padR);

// ── Cell → pose map (1-based cell index; obeys PetDefinition.animations) ──
// 1 idle · 2 idle/cheer/jump · 3 jump/open · 4 open/uncomf · 5 uncomf · 6 angry
// 7 shock · 8 blush · 9 side/blush · 10 side/walk · 11 walk · 12 walk/kiss
// 13 side-uncomf · 14 sit/eat · 15 sit/eat · 16 eat/sleep
function buildCells() {
  return [
    front(), //                                                1 idle
    front({ chin: CHIN_TONGUE }), //                           2 happy idle
    front({ muzzle: MUZZLE_OPEN, chin: CHIN_TONGUE }), //      3 jump / open / cheer
    front({ muzzle: MUZZLE_OPEN }), //                         4 open mouth (pre-eat)
    front({ ears: EARS_DOWN, eyes: EYES_SAD }), //             5 uncomfortable
    front({ ears: EARS_DOWN, eyes: EYES_SAD, muzzle: MUZZLE_OPEN }), // 6 angry/sad
    front({ eyes: EYES_SHOCK, muzzle: MUZZLE_OPEN }), //       7 shocked
    front({ eyes: EYES_SHOCK }), //                            8 blush/surprise
    side(LEGS_STAND), //                                       9 side idle
    side(LEGS_STAND), //                                      10 side idle/walk
    side(LEGS_WALK), //                                       11 walk
    side(LEGS_WALK), //                                       12 walk / kiss
    side(LEGS_STAND).map((r, i) => (i <= 5 ? r : r)), //      13 side uncomfortable
    sit(), //                                                 14 sit / eat
    sit(), //                                                 15 sit / eat
    SLEEP, //                                                 16 eat / sleep
  ];
}

// ── Craft passes: 1px contour + top rim-light / underside shadow ──
function craft(grid) {
  const at = (y, x) => (grid[y] && grid[y][x]) || ".";
  const set = (y, x, c) => {
    grid[y][x] = c;
  };
  // outline
  for (let y = 0; y < GRID; y++)
    for (let x = 0; x < GRID; x++) {
      if (at(y, x) !== ".") continue;
      const solid = (yy, xx) => at(yy, xx) !== "." && at(yy, xx) !== "O";
      if (
        solid(y - 1, x) ||
        solid(y + 1, x) ||
        solid(y, x - 1) ||
        solid(y, x + 1)
      )
        set(y, x, "O");
    }
  // shade per column
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      const c = at(y, x);
      if (c === "." || c === "O") continue;
      if (c === "K") set(y, x, "H");
      if (c === "R") set(y, x, "r");
      break;
    }
    for (let y = GRID - 1; y >= 0; y--) {
      const c = at(y, x);
      if (c === "." || c === "O") continue;
      if (c === "K") set(y, x, "S");
      break;
    }
  }
  return grid;
}

function cellToRects(rows, ox, oy, scale) {
  let out = "";
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const fill = COLORS[row[x]];
      if (!fill) continue;
      const px = (ox + x * scale).toFixed(2);
      const py = (oy + y * scale).toFixed(2);
      const s = scale.toFixed(2);
      out += `<rect x="${px}" y="${py}" width="${s}" height="${s}" fill="${fill}"/>`;
    }
  }
  return out;
}

const STAGES = [
  { name: "baby", cellSize: 16 },
  { name: "child", cellSize: 24 },
  { name: "teen", cellSize: 24 },
  { name: "adult", cellSize: 32 },
  { name: "elder", cellSize: 32 },
];

function renderStage(cells, cellSize) {
  const dim = cellSize * 4;
  const scale = cellSize / GRID;
  let body = "";
  for (let i = 0; i < 16; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const grid = norm(cells[i]).map((r) => r.split(""));
    craft(grid);
    body += cellToRects(
      grid.map((r) => r.join("")),
      col * cellSize,
      row * cellSize,
      scale,
    );
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges">${body}</svg>`;
  return new Resvg(svg, { background: "rgba(0,0,0,0)" }).render().asPng();
}

mkdirSync(OUT_DIR, { recursive: true });
const manifest = {};
for (const { name, cellSize } of STAGES) {
  const png = renderStage(buildCells(), cellSize);
  const file = `doge_${name}.png`;
  writeFileSync(resolve(OUT_DIR, file), png);
  manifest[name] = { path: `resources/img/doge/${file}`, cellSize };
  console.log(
    "wrote",
    file,
    `${cellSize * 4}x${cellSize * 4}`,
    png.length,
    "bytes",
  );
}
writeFileSync(
  resolve(OUT_DIR, "doge-atlas.manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log("wrote doge-atlas.manifest.json");
