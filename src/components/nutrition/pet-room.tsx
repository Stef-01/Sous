/**
 * PetRoom — decorative pixel-art room scene for the full-screen Tamagotchi
 * view. A cozy dark room at night on a 240×160 grid: wall with baseboard and
 * corner ambient-occlusion, curtained window (stars + city skyline + sill
 * flower pot), hanging lamp with a stepped light pool, framed heart,
 * bookshelf with a potted plant on top, plank floor with grain, a diamond
 * rug with a paw-print motif, a dog bed with a bone, and a red ball.
 *
 * Pure presentation, no state — server-safe. Everything is chunky <rect>s
 * (≥1 unit blocks, no curves); the only gradient is the soft radial window
 * moonlight. The pet stands centre-bottom (x≈100–140, y≥120) — that zone is
 * kept prop-free. Children render above the scene (z-10).
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const C = {
  wall: "#4a3f55",
  wallDark: "#423a4e",
  wallLight: "#564a64", // lit wall patch behind the lamp
  baseboard: "#2e2535",
  frame: "#2e2837", // window frame + sill + shelf backing
  sky: "#232036",
  star: "#f6efe4",
  skyline: "#1c1a2c",
  litWindow: "#f5c97a",
  curtain: "#6b4658",
  curtainFold: "#56394a",
  lamp: "#2b2b2b",
  glow: "#f5c97a",
  leaf: "#5d7a4d",
  leafLight: "#7a9c63",
  pot: "#a0522d",
  potRim: "#b96b3a",
  wood: "#6b4f3f", // picture frame + bookshelf
  heart: "#d4576b",
  bookOrange: "#b5651d",
  bookGold: "#9c7a2e",
  bookBlue: "#4d6e9c",
  plankA: "#5a4632",
  plankB: "#4e3c2a",
  seam: "#3a2c1e",
  rug: "#8a6f5c",
  rugBorder: "#a08874",
  bed: "#7d5a6b",
  bedInner: "#5d4252",
  bone: "#f6efe4",
} as const;

// [x, y, w, h] darker patches breaking up the flat wall
const WALL_PATCHES: number[][] = [
  [6, 74, 4, 4],
  [34, 78, 4, 4],
  [58, 82, 4, 4],
  [88, 16, 4, 4],
  [96, 62, 4, 4],
  [100, 94, 4, 4],
  [140, 8, 4, 4],
  [148, 60, 4, 4],
  [150, 96, 4, 4],
  [172, 86, 4, 4],
  [180, 14, 4, 4],
  [64, 98, 4, 4],
];

// [x, y, w, h] star pixels inside the window panes (sky: x24–72, y22–58)
const STARS: number[][] = [
  [28, 26, 1, 1],
  [35, 30, 2, 1],
  [42, 24, 1, 1],
  [52, 27, 1, 1],
  [60, 24, 2, 1],
  [66, 30, 1, 1],
  [30, 44, 1, 1],
  [38, 33, 1, 1],
  [55, 46, 1, 1],
  [68, 44, 1, 1],
];

// city silhouettes hug the sky bottom (y58)
const SKYLINE: number[][] = [
  [24, 48, 6, 10],
  [31, 52, 4, 6],
  [36, 46, 7, 12],
  [50, 50, 5, 8],
  [56, 47, 6, 11],
  [63, 52, 5, 6],
  [68, 49, 4, 9],
];
const LIT_WINDOWS: number[][] = [
  [26, 51, 1, 1],
  [38, 49, 1, 1],
  [58, 50, 2, 1],
  [64, 54, 1, 1],
  [69, 52, 1, 1],
];

// pixel heart, 5×4 grid of 2-unit blocks inside the picture frame
const HEART: number[][] = [
  [1, 0],
  [3, 0],
  [0, 1],
  [1, 1],
  [2, 1],
  [3, 1],
  [4, 1],
  [1, 2],
  [2, 2],
  [3, 2],
  [2, 3],
];

// book spines on the shelf: [x, y, w, h, palette key]
const BOOKS: [number, number, number, number, keyof typeof C][] = [
  [194, 59, 3, 8, "bookOrange"],
  [198, 58, 4, 9, "leaf"],
  [203, 60, 3, 7, "heart"],
  [194, 72, 4, 9, "bookBlue"],
  [199, 73, 3, 8, "bookGold"],
  [203, 74, 4, 7, "bookOrange"],
];

// vertical plank-end notches per floor row: [x, yTop, h]
const PLANK_ENDS: number[][] = [
  [48, 112, 11],
  [136, 112, 11],
  [200, 112, 11],
  [24, 124, 11],
  [112, 124, 11],
  [184, 124, 11],
  [64, 136, 11],
  [160, 136, 11],
  [224, 136, 11],
  [40, 148, 12],
  [140, 148, 12],
  [208, 148, 12],
];

// short grain dashes scattered per plank row: [x, y, w] (h is 1)
const GRAIN: number[][] = [
  [20, 116, 2],
  [70, 118, 1],
  [104, 114, 1],
  [150, 115, 2],
  [210, 119, 1],
  [62, 128, 1],
  [176, 131, 2],
  [225, 132, 1],
  [64, 140, 1],
  [200, 139, 2],
  [230, 144, 1],
  [30, 156, 1],
  [80, 157, 2],
  [110, 156, 2],
  [172, 156, 1],
  [220, 155, 2],
];

// diamond motif anchors on the rug (each renders as a 6×6 pixel diamond)

export type Daypart = "day" | "dusk" | "night";

export function PetRoom({
  className,
  children,
  daypart = "night",
}: {
  className?: string;
  children?: ReactNode;
  /** Real local time drives the window + lamp (Finch/AC presence pattern). */
  daypart?: Daypart;
}) {
  const sky =
    daypart === "day" ? "#7a9cc8" : daypart === "dusk" ? "#5a4a6e" : C.sky;
  const lampOn = daypart !== "day";
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <svg
        viewBox="0 0 240 160"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        className="absolute inset-0"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="pet-room-moon-glow">
            <stop offset="0%" stopColor={C.star} stopOpacity="0.10" />
            <stop offset="100%" stopColor={C.star} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* wall + lit patch behind the lamp */}
        <rect x="0" y="0" width="240" height="112" fill={C.wall} />
        <rect x="104" y="10" width="32" height="38" fill={C.wallLight} />
        {WALL_PATCHES.map(([x, y, w, h]) => (
          <rect
            key={`w${x}-${y}`}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={C.wallDark}
          />
        ))}

        {/* moonlight wash behind the window */}
        <rect
          x="8"
          y="6"
          width="84"
          height="70"
          fill="url(#pet-room-moon-glow)"
        />

        {/* window: frame, sky, stars, skyline, mullions */}
        <rect x="20" y="18" width="56" height="44" fill={C.frame} />
        <rect x="24" y="22" width="48" height="36" fill={sky} />
        {daypart === "day" && (
          <>
            <rect x="60" y="26" width="6" height="6" fill="#f5e07a" />
            <rect
              x="62"
              y="24"
              width="2"
              height="10"
              fill="#f5e07a"
              opacity="0.6"
            />
            <rect
              x="58"
              y="28"
              width="10"
              height="2"
              fill="#f5e07a"
              opacity="0.6"
            />
          </>
        )}
        {daypart !== "day" &&
          STARS.map(([x, y, w, h]) => (
            <rect
              key={`s${x}-${y}`}
              x={x}
              y={y}
              width={w}
              height={h}
              fill={C.star}
              opacity="0.9"
            />
          ))}
        {SKYLINE.map(([x, y, w, h]) => (
          <rect
            key={`b${x}-${y}`}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={C.skyline}
          />
        ))}
        {daypart !== "day" &&
          LIT_WINDOWS.map(([x, y, w, h]) => (
            <rect
              key={`l${x}-${y}`}
              x={x}
              y={y}
              width={w}
              height={h}
              fill={C.litWindow}
              opacity="0.7"
            />
          ))}
        <rect x="46" y="22" width="4" height="36" fill={C.frame} />
        <rect x="24" y="38" width="48" height="3" fill={C.frame} />

        {/* sill + tiny flower pot */}
        <rect x="16" y="62" width="64" height="3" fill={C.frame} />
        <rect x="64" y="58" width="5" height="4" fill={C.pot} />
        <rect x="66" y="55" width="1" height="3" fill={C.leaf} />
        <rect x="64" y="52" width="5" height="3" fill={C.heart} />
        <rect x="66" y="53" width="1" height="1" fill={C.glow} />

        {/* curtains: rod + two drapes with darker folds */}
        <rect x="15" y="13" width="66" height="2" fill={C.lamp} />
        <rect x="17" y="15" width="6" height="49" fill={C.curtain} />
        <rect x="19" y="15" width="1" height="49" fill={C.curtainFold} />
        <rect x="21" y="15" width="1" height="49" fill={C.curtainFold} />
        <rect x="73" y="15" width="6" height="49" fill={C.curtain} />
        <rect x="75" y="15" width="1" height="49" fill={C.curtainFold} />
        <rect x="77" y="15" width="1" height="49" fill={C.curtainFold} />

        {/* framed picture with pixel heart */}
        <rect x="160" y="26" width="16" height="16" fill={C.wood} />
        <rect x="163" y="29" width="10" height="10" fill={C.wallDark} />
        {HEART.map(([cx, cy]) => (
          <rect
            key={`h${cx}-${cy}`}
            x={163 + cx * 2}
            y={30 + cy * 2}
            width="2"
            height="2"
            fill={C.heart}
          />
        ))}

        {/* bookshelf: frame, two shelf openings, book spines, vase trinket */}
        <rect x="190" y="54" width="36" height="30" fill={C.wood} />
        <rect x="193" y="57" width="30" height="10" fill={C.frame} />
        <rect x="193" y="70" width="30" height="11" fill={C.frame} />
        {BOOKS.map(([x, y, w, h, tone]) => (
          <rect
            key={`bk${x}-${y}`}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={C[tone]}
          />
        ))}
        <rect x="214" y="62" width="3" height="5" fill={C.bone} />
        <rect x="215" y="59" width="1" height="3" fill={C.leaf} />
        <rect x="190" y="84" width="36" height="2" fill="#000" opacity="0.25" />

        {/* potted plant on top of the bookshelf */}
        <rect x="196" y="44" width="12" height="2" fill={C.potRim} />
        <rect x="198" y="46" width="8" height="8" fill={C.pot} />
        <rect x="200" y="40" width="6" height="4" fill={C.leaf} />
        <rect x="196" y="36" width="5" height="4" fill={C.leafLight} />
        <rect x="204" y="34" width="4" height="6" fill={C.leaf} />
        <rect x="200" y="32" width="4" height="4" fill={C.leafLight} />
        <rect x="194" y="32" width="3" height="3" fill={C.leaf} />

        {/* hanging lamp: cord, stepped shade, bulb */}
        <rect x="119" y="0" width="2" height="10" fill={C.lamp} />
        <rect x="116" y="10" width="8" height="2" fill={C.lamp} />
        <rect x="112" y="12" width="16" height="2" fill={C.lamp} />
        <rect x="108" y="14" width="24" height="3" fill={C.lamp} />
        <rect x="116" y="17" width="8" height="2" fill={C.glow} />

        {/* baseboard where wall meets floor, with 1px highlight */}
        <rect x="0" y="109" width="240" height="3" fill={C.baseboard} />
        <rect x="0" y="109" width="240" height="1" fill={C.wallDark} />

        {/* floor: alternating planks, seams, staggered plank ends, grain */}
        <rect x="0" y="112" width="240" height="11" fill={C.plankA} />
        <rect x="0" y="123" width="240" height="1" fill={C.seam} />
        <rect x="0" y="124" width="240" height="11" fill={C.plankB} />
        <rect x="0" y="135" width="240" height="1" fill={C.seam} />
        <rect x="0" y="136" width="240" height="11" fill={C.plankA} />
        <rect x="0" y="147" width="240" height="1" fill={C.seam} />
        <rect x="0" y="148" width="240" height="12" fill={C.plankB} />
        {PLANK_ENDS.map(([x, y, h]) => (
          <rect
            key={`p${x}-${y}`}
            x={x}
            y={y}
            width="1"
            height={h}
            fill={C.seam}
          />
        ))}
        {GRAIN.map(([x, y, w]) => (
          <rect
            key={`g${x}-${y}`}
            x={x}
            y={y}
            width={w}
            height="1"
            fill={C.seam}
          />
        ))}

        {/* rug — bordered, diamond pattern, paw print; the pet stands here */}
        <rect x="72" y="122" width="96" height="30" fill={C.rugBorder} />
        <rect x="76" y="126" width="88" height="22" fill={C.rug} />
        <rect x="80" y="130" width="1" height="1" fill={C.seam} />
        <rect x="82" y="130" width="1" height="1" fill={C.seam} />
        <rect x="84" y="130" width="1" height="1" fill={C.seam} />
        <rect x="80" y="132" width="5" height="3" fill={C.seam} />

        {/* under-furniture shadows: bed, pet position centre-bottom */}
        <rect x="10" y="152" width="48" height="3" fill="#000" opacity="0.25" />
        <rect
          x="106"
          y="146"
          width="28"
          height="4"
          fill="#000"
          opacity="0.25"
        />

        {/* dog bed: highlight rim, body, inner cushion, bone */}
        <rect x="12" y="128" width="44" height="24" fill={C.bed} />
        <rect x="12" y="128" width="44" height="1" fill={C.rugBorder} />
        <rect x="17" y="133" width="34" height="14" fill={C.bedInner} />
        <rect x="29" y="139" width="10" height="2" fill={C.bone} />
        <rect x="27" y="137" width="3" height="3" fill={C.bone} />
        <rect x="27" y="140" width="3" height="3" fill={C.bone} />
        <rect x="37" y="137" width="3" height="3" fill={C.bone} />
        <rect x="37" y="140" width="3" height="3" fill={C.bone} />

        {/* red ball on the floor, right of the rug */}
        <rect x="178" y="138" width="6" height="6" fill="#c8333d" />
        <rect x="178" y="141" width="6" height="1" fill="#7d1f28" />
        <rect x="179" y="139" width="2" height="1" fill={C.bone} />

        {/* corner ambient-occlusion + band under the ceiling */}
        <rect
          x="0"
          y="0"
          width="240"
          height="6"
          fill={C.skyline}
          opacity="0.3"
        />
        <rect
          x="0"
          y="0"
          width="8"
          height="160"
          fill={C.skyline}
          opacity="0.35"
        />
        <rect
          x="232"
          y="0"
          width="8"
          height="160"
          fill={C.skyline}
          opacity="0.35"
        />

        {/* stepped warm light pool under the lamp, washing down to the rug */}
        <rect
          x="110"
          y="19"
          width="20"
          height="110"
          fill={C.glow}
          opacity={lampOn ? "0.08" : "0.03"}
        />
        <rect
          x="96"
          y="19"
          width="48"
          height="110"
          fill={C.glow}
          opacity={lampOn ? "0.06" : "0.02"}
        />
        <rect
          x="82"
          y="19"
          width="76"
          height="110"
          fill={C.glow}
          opacity={lampOn ? "0.035" : "0.01"}
        />
      </svg>

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
