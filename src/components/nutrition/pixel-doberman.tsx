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
