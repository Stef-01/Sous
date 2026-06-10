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

/** Classic black-and-rust Doberman palette. */
const COLORS: Record<string, string> = {
  K: "#26221f", // coat
  D: "#121212", // nose
  R: "#b06226", // rust markings
  r: "#cf8345", // rust highlight
  W: "#f6efe4", // eye shine
  P: "#ef9bb0", // tongue
  E: "#e98b9c", // pink inner ear
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

const HERO_W = 28;
const HERO_H = 24;

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
 * Head block (15×8), facing right. Skull + brow pip (R), open eye (W with K
 * pupil), rust muzzle with 2×2 nose (D) at the front tip, rust chin, and the
 * under-chin/neck line. Stamped at (hx, hy); ears/eye/tongue overlays use the
 * same anchor.
 */
const HERO_HEAD = [
  "...KKKKKKKK.....", // rounded skull top
  "..KKKKKKKKKK....",
  ".KKKKKKKKKKKK...",
  ".KKKKKKKRKKKK...", // rust brow pip
  ".KKKKKKKWKKKKK..", // small bright eye
  ".KKKKKKKKKRRRRD.", // muzzle band → dark nose tip
  ".KKKKKKKKrRRRDD.",
  "..KKKKKKKRRRRR..", // rust jaw
  "...KKKKKKKKK....", // neck
];

/** Pointed ear triangles (5×5), pink inner at the base. The pair lean
 *  outward like the reference (back ear mirrors the front). */
const HERO_EAR_BACK = ["....K", "...KK", "..KEK", ".KEEK", "KEEEK"];
const HERO_EAR_FRONT = ["K....", "KK...", "KEK..", "KEEK.", "KEEEK"];

/** Folded ear nub (5×2) — asleep / hungry. */
const HERO_EAR_FOLD = [
  ".KK..", //
  "KKKK.",
];

/** Closed-eye overlay (lid line) for asleep, stamped over the W pixels. */
const HERO_EYE_CLOSED = [
  "KK", //
  "rr",
];

/** Small tongue, hanging below the front of the mouth. */
const HERO_TONGUE = [
  "P", //
  "P",
];

/**
 * Standing body, stamped at (0, 9): docked tail up at the left, barrel body,
 * rust chest patch, four legs with rust from the knee down.
 */
const HERO_BODY_STAND = [
  "...K........................", // tail tip (docked, up)
  "...KK.......................",
  "....KK......................",
  "....KKKKKKKKKK..............", // back line → neck
  "...KKKKKKKKKKKK.............",
  "...KKKKKKKKKKKKKRRRK........", // chest patch
  "...KKKKKKKKKKKKKRRRK........",
  "...KKKKKKKKKKKKKrrKK........",
  "....KKKKKKKKKKKKKKKK........",
  "....KKKKKKKKKKKKKKK.........", // belly
  "....KK..KK....KK..KK........", // upper legs (coat)
  "....KK..KK....KK..KK........",
  "....RR..RR....RR..RR........", // rust from the knee down
  "....RR..RR....RR..RR........",
  "....rrr.rrr...rrr.rrr.......", // paws
];

/**
 * Play-bow body, stamped at (0, 3): butt and tail high at the left, back
 * sloping down to the lowered shoulders, rear legs tall, front legs stretched
 * forward along the ground.
 */
const HERO_BODY_BOW = [
  "....K.......................", // tail tip (up, butt high)
  "...KK.......................",
  "....KK......................",
  "....KKKKKK..................", // top of raised butt
  "...KKKKKKKKK................",
  "...KKKKKKKKKK...............",
  "...KKKKKKKKKKK..............",
  "...KKKKKKKKKKK..............", // back slopes into lowered head
  "...KKKKKKKKKKK..............",
  "....KKKKKKKKKK..............",
  "....KKKKKKKKKK..............",
  "....KKKKKKKKK...............", // belly
  "....KK..KK..................", // tall rear legs
  "....KK..KK..................",
  "....KK..KK..................",
  "....KK..KK....KRRK..........", // chest patch under lowered shoulders
  "....KK..KK....KRRK..........",
  "....RR..RR......KK..........", // rust knee-down; foreleg drops
  "....RR..RR......RRR.........",
  "....RR..RR......RRRRRRR.....", // forelegs stretched forward on ground
  "....rrr.rrr......rrr.rrr....", // rear paws + front paws reaching out
];

/**
 * Hero map (28×24), facing right, composed per mood + pose.
 *
 *   asleep   — eyes closed (lid line), ears folded
 *   hungry   — ears folded
 *   peckish / content / thriving — ears up
 *   thriving (any pose) or bow (any mood) — tongue out
 */
export function buildHeroMap(mood: PetMood, pose: "stand" | "bow"): string[] {
  const grid: string[][] = Array.from({ length: HERO_H }, () =>
    Array<string>(HERO_W).fill("."),
  );

  // Head anchor: bow lowers the head/shoulders by 4 rows.
  const hx = 13;
  const hy = pose === "stand" ? 6 : 10;

  stamp(
    grid,
    0,
    pose === "stand" ? 9 : 3,
    pose === "stand" ? HERO_BODY_STAND : HERO_BODY_BOW,
  );
  stamp(grid, hx, hy, HERO_HEAD);

  const earsUp = mood !== "asleep" && mood !== "hungry";
  if (earsUp) {
    stamp(grid, hx + 1, hy - 5, HERO_EAR_BACK);
    stamp(grid, hx + 8, hy - 5, HERO_EAR_FRONT);
  } else {
    stamp(grid, hx + 2, hy - 1, HERO_EAR_FOLD);
    stamp(grid, hx + 8, hy - 1, HERO_EAR_FOLD);
  }

  if (mood === "asleep") stamp(grid, hx + 7, hy + 4, HERO_EYE_CLOSED);
  if (mood === "thriving" || pose === "bow") {
    stamp(grid, hx + 11, hy + 8, HERO_TONGUE);
  }

  return grid.map((row) => row.join(""));
}

export function PixelDobermanHero({
  mood,
  pose = "stand",
  size = 220,
  className,
}: {
  mood: PetMood;
  pose?: "stand" | "bow";
  /** Rendered width in px (height follows the 28:24 grid). */
  size?: number;
  className?: string;
}) {
  const map = buildHeroMap(mood, pose);
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
