"use client";

/**
 * PixelDoberman — a hand-placed pixel-art Doberman (Tamagotchi style) drawn as
 * SVG rects from a character map. No image assets, no generation: every pixel
 * is in this file. Moods recompose the map (ears, eyes, tongue):
 *
 *   asleep   — ears soft, eyes closed (—), zzz handled by the caller
 *   hungry   — ears drooped, downcast eyes
 *   peckish  — ears up, flat eyes
 *   content  — ears up, open eyes
 *   thriving — ears up, open eyes, tongue out
 *
 * Palette: classic black-and-rust Doberman.
 */

import type { PetMood } from "@/lib/nutrition/pet-state";
import type { AccessoryId } from "@/lib/nutrition/pet-accessories";

/** Classic black-and-rust Doberman palette. */
const COLORS: Record<string, string> = {
  K: "#2b2622", // coat
  H: "#403931", // coat highlight (top-edge rim light, hero only)
  S: "#1c1916", // coat shadow (belly/underside, hero only)
  D: "#121212", // nose + mouth line
  R: "#bd6a26", // rust markings
  r: "#d98c48", // rust highlight
  W: "#f6efe4", // eye shine
  P: "#ef9bb0", // tongue
  E: "#e98b9c", // pink inner ear
  O: "#171310", // 1px contour outline (hero only)
  C: "#c8333d", // collar (earned at level 3)
  G: "#e8b73c", // gold collar tag / level-6 collar
  // ── Random accessory loot (variable reward) ──
  N: "#3a7bd5", // bandana blue
  M: "#e86a9c", // bow-tie pink
  Y: "#a86bd6", // party-hat purple
  L: "#15151c", // sunglasses lens
};

/** 15×16 character map, composed per mood. "." = transparent. */
function buildMap(mood: PetMood): string[] {
  const earsUp = ["..K.........K..", "..KK.......KK..", "..KKK.....KKK.."];
  const earsDown = ["...............", "..KK.......KK..", "..KKK.....KKK.."];
  const head = ["..KKKKKKKKKKK..", "..KRKKKKKKKRK.."]; // crown + brow pips
  const eyesOpen = "..KWKKKKKKKWK..";
  const eyesClosed = "..KKKKKKKKKKK..";
  const eyesSad = "..KwKKKKKKKwK..".replace(/w/g, "K"); // sad = no shine
  const muzzle = ["..KKKrRRrKKKK..", "...KRrRRRrRK...", "...KRRDDRRRK..."];
  const chinPlain = "....KRRRRK.....";
  const chinTongue = "....KRPPRK.....";
  const body = [
    ".....KKKK......",
    "....KKRRKK.....",
    "...KKRRRRKK....",
    "...KKRRRRKK....",
    "...KKKRRKKK....",
    "...KRK..KRK....",
  ];

  const ears = mood === "asleep" || mood === "hungry" ? earsDown : earsUp;
  const eyes =
    mood === "asleep" ? eyesClosed : mood === "hungry" ? eyesSad : eyesOpen;
  const chin = mood === "thriving" ? chinTongue : chinPlain;
  return [...ears, ...head, eyes, ...muzzle, chin, ...body];
}

/* ------------------------------------------------------------------------ */
/* Hero sprite — full-screen Tamagotchi room                                 */
/* ------------------------------------------------------------------------ */

const HERO_W = 40;
const HERO_H = 32;

/** Stamp a sprite onto the grid; "." pixels are transparent (no overwrite). */
function stamp(grid: string[][], ox: number, oy: number, sprite: string[]) {
  for (let dy = 0; dy < sprite.length; dy++) {
    const row = sprite[dy];
    for (let dx = 0; dx < row.length; dx++) {
      const ch = row[dx];
      if (ch === ".") continue;
      const y = oy + dy;
      const x = ox + dx;
      if (y >= 0 && y < HERO_H && x >= 0 && x < HERO_W) grid[y][x] = ch;
    }
  }
}

/**
 * v3 craft passes (sprite quality without quadratic hand-typing):
 * outline() traces a 1px O contour around the silhouette; shade() adds a
 * top-edge rim light (K→H, R→r) and a bottom-edge shadow (K→S) per column.
 */
function outline(grid: string[][]): void {
  const solid = (y: number, x: number) =>
    y >= 0 &&
    y < HERO_H &&
    x >= 0 &&
    x < HERO_W &&
    grid[y][x] !== "." &&
    grid[y][x] !== "O";
  for (let y = 0; y < HERO_H; y++)
    for (let x = 0; x < HERO_W; x++)
      if (
        grid[y][x] === "." &&
        (solid(y - 1, x) ||
          solid(y + 1, x) ||
          solid(y, x - 1) ||
          solid(y, x + 1))
      )
        grid[y][x] = "O";
}

function shade(grid: string[][]): void {
  for (let x = 0; x < HERO_W; x++) {
    // rim light: first solid coat/rust cell from the top
    for (let y = 0; y < HERO_H; y++) {
      const c = grid[y][x];
      if (c === "." || c === "O") continue;
      if (c === "K") grid[y][x] = "H";
      if (c === "R") grid[y][x] = "r";
      break;
    }
    // shadow: last coat cell from the bottom (legs/belly underside)
    for (let y = HERO_H - 1; y >= 0; y--) {
      const c = grid[y][x];
      if (c === "." || c === "O") continue;
      if (c === "K") grid[y][x] = "S";
      break;
    }
  }
}

/** Head v3.1 (19×12): rounded skull, brow pip, eye beside the muzzle root,
 *  and a snout that PROJECTS past the skull (the spec's defining read). */
const HERO_HEAD = [
  "....KKKKKKKK.......",
  "..KKKKKKKKKKK......",
  ".KKKKKKKKKKKKK.....",
  ".KKKKKKRRKKKKK.....",
  ".KKKKKWWKKKKKK.....",
  ".KKKKKWDKKKKKK.....",
  ".KKKKKKKRRRRRRRR...",
  ".KKKKKKKRRRRRRRRDD.",
  "..KKKKKKRRRRRRRRDD.",
  "..KKKKKKKRKKKRRRR..",
  "...KKKKKKKRRRRR....",
  "....KKKKKKKKK......",
];

/** Ear triangles v3 (6×7), pink core, leaning apart like the spec. */
const HERO_EAR_BACK = [
  ".....K",
  "....KK",
  "...KEK",
  "..KEEK",
  ".KEEEK",
  ".KEEEK",
  "KEEEEK",
];
const HERO_EAR_FRONT = [
  "K.....",
  "KK....",
  "KEK...",
  "KEEK..",
  "KEEEK.",
  "KEEEK.",
  "KEEEEK",
];

/** Folded ear nub — asleep / hungry. */
const HERO_EAR_FOLD = [
  ".KKK.", //
  "KKKKK",
];

/** Closed-eye lid line, stamped over the W pixels when asleep. */
const HERO_EYE_CLOSED = [
  "KKK", //
  "rrr",
];

/** Tongue inside the open mouth. */
const HERO_TONGUE = [
  "PP", //
  ".P",
];

/** Chef's toque (earned cosmetic, R8) — two puffs over a band, off-white. Sits
 *  on the crown between the ears. Stamped before shade/outline so it integrates. */
const HERO_TOQUE = [".WW.WW.", "WWWWWWW", "WWWWWWW", ".WWWWW."];

/* ── Random accessory loot sprites (variable reward, R8b) ───────────────────
 * Each is stamped onto the head in buildHeroMap (after the ears/eyes), before
 * shade+outline so it gets the same contour as everything else. */
const HERO_PARTY = ["..W..", ".YYY.", ".YYY.", "YYYYY"]; // cone + pom
const HERO_CROWN = ["G.G.G", "GGGGG"]; // little zig-zag crown
const HERO_SHADES = ["LLLLLLL", "L.L.L.L"]; // two lenses + bridge
const HERO_BANDANA = ["NNNNNNN", ".NNNNN.", "..NNN..", "...N..."]; // neck kerchief
const HERO_BOWTIE = ["M.M", "MMM", "M.M"]; // bow at the throat

/**
 * Standing body v3 (36×20): docked tail up-left, level back, two rust chest
 * spots (the spec's), longer legs with rust socks, belly tuck.
 */
const HERO_BODY_STAND = [
  "....KK..............................",
  "....KKK.............................",
  "....KKK.............................",
  "......KKKKKKKKKKKKK.................",
  ".....KKKKKKKKKKKKKKK................",
  "....KKKKKKKKKKKKKKKKK...............",
  "....KKKKKKKKRRKKKKRRK...............",
  "....KKKKKKKKRRKKKKRRK...............",
  "....KKKKKKKKKKKKKKKKK...............",
  "....KKKKKKKKKKKKKKKK................",
  "....KKKKKKKKKKKKKKKK................",
  ".....KKKKKKKKKKKKKK.................",
  "....KKKK..KKK...KKK..KK.............",
  ".....KKK..KKK...KKK..KK.............",
  ".....KKK..KKK...KKK..KK.............",
  ".....RRR..RRR...RRR..RR.............",
  ".....RRR..RRR...RRR..RR.............",
  ".....RRR..RRR...RRR..RR.............",
  ".....rrr..rrr...rrr..rr.............",
  "....................................",
];

/** Play-bow body v3: butt high left, back sloping to lowered shoulders,
 *  forelegs stretched along the ground. */
const HERO_BODY_BOW = [
  ".....KK.............................",
  ".....KKK............................",
  "......KK............................",
  "......KKKKKKK.......................",
  ".....KKKKKKKKKK.....................",
  ".....KKKKKKKKKKKK...................",
  ".....KKKKKKKKKKKKK..................",
  ".....KKKKKKKKKKKKK..................",
  ".....KKKKKKKKKKKK...................",
  "......KKKKKKKKKKK...................",
  "......KKK..KKKKKK...................",
  "......KKK..KKKRRKK..................",
  "......KKK..KKKRRKK..................",
  "......KKK..KKKKKKK..................",
  "......RRR..RRR.KKK..................",
  "......RRR..RRR..KKK.................",
  "......RRR..RRR...KKKK...............",
  "......rrr..rrr....RRRRRRR...........",
  "..................rrrrrrr...........",
  "....................................",
];

/**
 * Hero map (40×32), facing right, composed per mood + pose, then shaded and
 * outlined programmatically.
 *
 *   asleep   — eyes closed (lid line), ears folded
 *   hungry   — ears folded
 *   peckish / content / thriving — ears up
 *   thriving (any pose) or bow (any mood) — tongue out
 */
export type PetCollar = "none" | "red" | "gold";

/** Earned cosmetics by Path level (goal-gradient, no purchases, R8): a chef's
 *  toque once you're cooking regularly (Lv2 ≈ a few cooks in), then a red collar
 *  at Lv3 and a gold one at Lv6. Pure so it's identical wherever Dobe appears
 *  (the pet room, the win screen) and unit-testable. */
export interface PetCosmetics {
  collar: PetCollar;
  toque: boolean;
}
export function cosmeticsForLevel(level: number): PetCosmetics {
  return {
    collar: level >= 6 ? "gold" : level >= 3 ? "red" : "none",
    toque: level >= 2,
  };
}

export function buildHeroMap(
  mood: PetMood,
  pose: "stand" | "bow",
  collar: PetCollar = "none",
  blink = false,
  earFlick = false,
  toque = false,
  accessory: AccessoryId | null = null,
): string[] {
  const grid: string[][] = Array.from({ length: HERO_H }, () =>
    Array<string>(HERO_W).fill("."),
  );

  const hx = 18;
  const hy = pose === "stand" ? 7 : 12;

  stamp(
    grid,
    0,
    pose === "stand" ? 11 : 7,
    pose === "stand" ? HERO_BODY_STAND : HERO_BODY_BOW,
  );
  stamp(grid, hx, hy, HERO_HEAD);

  const earsUp = mood !== "asleep" && mood !== "hungry";
  if (earsUp) {
    stamp(grid, hx + 1, hy - 6, HERO_EAR_BACK);
    // Second idle animation: the front ear flicks down for a beat, then back up.
    if (earFlick) {
      stamp(grid, hx + 8, hy - 1, HERO_EAR_FOLD);
    } else {
      stamp(grid, hx + 8, hy - 6, HERO_EAR_FRONT);
    }
  } else {
    stamp(grid, hx + 2, hy - 1, HERO_EAR_FOLD);
    stamp(grid, hx + 8, hy - 1, HERO_EAR_FOLD);
  }

  // Chef's toque on the crown (earned cosmetic) — stamped after the ears so it
  // sits on top, before shade/outline so it gets a contour like everything else.
  if (toque) stamp(grid, hx + 3, hy - 3, HERO_TOQUE);

  if (mood === "asleep" || blink) stamp(grid, hx + 5, hy + 4, HERO_EYE_CLOSED);
  if (mood === "thriving" || pose === "bow") {
    stamp(grid, hx + 11, hy + 9, HERO_TONGUE);
  }

  // Earned collar (real Path level): a band across the neck join, with a
  // gold tag at the front. Stamped before shade/outline so it integrates.
  if (collar !== "none") {
    const band = collar === "red" ? "C" : "G";
    const cy = hy + 11; // the neck row of HERO_HEAD
    for (let x = hx + 4; x <= hx + 11; x++) {
      if (grid[cy]?.[x] && grid[cy][x] !== ".") grid[cy][x] = band;
    }
    if (grid[cy + 1]?.[hx + 11] && grid[cy + 1][hx + 11] !== ".")
      grid[cy + 1][hx + 11] = collar === "red" ? "G" : "C"; // tag pops
  }

  // Random accessory loot (variable reward) — stamped last so it reads on top,
  // before shade/outline so it gets the same contour as the rest of the dog.
  switch (accessory) {
    case "party":
      stamp(grid, hx + 4, hy - 4, HERO_PARTY);
      break;
    case "crown":
      stamp(grid, hx + 4, hy - 2, HERO_CROWN);
      break;
    case "shades":
      stamp(grid, hx + 4, hy + 4, HERO_SHADES);
      break;
    case "bandana":
      stamp(grid, hx + 4, hy + 11, HERO_BANDANA);
      break;
    case "bowtie":
      stamp(grid, hx + 7, hy + 11, HERO_BOWTIE);
      break;
    default:
      break;
  }

  shade(grid);
  outline(grid);
  return grid.map((row) => row.join(""));
}

export function PixelDobermanHero({
  mood,
  pose = "stand",
  collar = "none",
  blink = false,
  earFlick = false,
  toque = false,
  accessory = null,
  size = 220,
  className,
}: {
  mood: PetMood;
  pose?: "stand" | "bow";
  collar?: PetCollar;
  blink?: boolean;
  /** Second idle animation — the front ear flicks down briefly. */
  earFlick?: boolean;
  /** Earned chef's toque on the crown (R8). */
  toque?: boolean;
  /** Random accessory loot equipped on the pet (R8b variable reward). */
  accessory?: AccessoryId | null;
  /** Rendered width in px (height follows the 28:24 grid). */
  size?: number;
  className?: string;
}) {
  const map = buildHeroMap(
    mood,
    pose,
    collar,
    blink,
    earFlick,
    toque,
    accessory,
  );
  const cols = HERO_W;
  const rows = map.length;
  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      width={size}
      height={(size / cols) * rows}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Pixel dog"
    >
      {map.flatMap((row, y) =>
        row.split("").map((ch, x) => {
          const fill = COLORS[ch];
          if (!fill) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={fill}
            />
          );
        }),
      )}
    </svg>
  );
}

export function PixelDoberman({
  mood,
  size = 120,
  className,
}: {
  mood: PetMood;
  /** Rendered width in px (height follows the 15:16 grid). */
  size?: number;
  className?: string;
}) {
  const map = buildMap(mood);
  const cols = 15;
  const rows = map.length;
  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      width={size}
      height={(size / cols) * rows}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Pixel dog"
    >
      {map.flatMap((row, y) =>
        row.split("").map((ch, x) => {
          const fill = COLORS[ch];
          if (!fill) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={fill}
            />
          );
        }),
      )}
    </svg>
  );
}
