/**
 * PetRoom — decorative pixel-art room scene for the full-screen Tamagotchi
 * view. A cozy dark room at night: wall, window (stars + city skyline),
 * hanging lamp with a warm glow cone, shelf + plant, framed heart, plank
 * floor, a flat rug where the pet stands, and a dog bed with a bone.
 *
 * Pure presentation, no state — server-safe. Everything is chunky <rect>s
 * (2–4 unit blocks, no curves); the only gradients are the two soft radial
 * glows (lamp, window moonlight). Children render above the scene (z-10).
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const C = {
  wall: "#4a3f55",
  wallDark: "#423a4e",
  frame: "#2e2837", // window frame
  sky: "#232036",
  star: "#f6efe4",
  skyline: "#1c1a2c",
  litWindow: "#f5c97a",
  lamp: "#2b2b2b",
  glow: "#f5c97a",
  leaf: "#5d7a4d",
  leafLight: "#7a9c63",
  pot: "#a0522d",
  potRim: "#b96b3a",
  wood: "#6b4f3f", // picture frame + shelf
  heart: "#d4576b",
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
  [4, 6, 4, 4],
  [62, 26, 4, 4],
  [70, 58, 4, 4],
  [104, 8, 4, 4],
  [130, 14, 4, 4],
  [98, 48, 4, 4],
  [136, 70, 4, 4],
  [10, 60, 4, 4],
  [170, 36, 4, 4],
  [60, 4, 4, 4],
];

// [x, y, w, h] star pixels inside the window panes
const STARS: number[][] = [
  [23, 23, 1, 1],
  [29, 26, 1, 1],
  [44, 22, 2, 1],
  [48, 26, 1, 1],
  [25, 34, 1, 1],
  [40, 35, 1, 1],
  [49, 38, 1, 1],
];

// city silhouettes hug the sill (panes: x20–34 and x38–52, sill y44)
const SKYLINE: number[][] = [
  [20, 38, 4, 6],
  [25, 40, 3, 4],
  [29, 36, 5, 8],
  [38, 39, 4, 5],
  [43, 41, 3, 3],
  [47, 37, 5, 7],
];
const LIT_WINDOWS: number[][] = [
  [30, 38, 1, 1],
  [21, 40, 1, 1],
  [48, 39, 1, 1],
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

// vertical plank-end notches per floor row: [x, y]
const PLANK_ENDS: number[][] = [
  [40, 84],
  [120, 84],
  [80, 93],
  [160, 93],
  [24, 102],
  [100, 102],
  [150, 102],
  [60, 111],
  [132, 111],
];

export function PetRoom({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <svg
        viewBox="0 0 180 120"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        className="absolute inset-0"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="pet-room-lamp-glow">
            <stop offset="0%" stopColor={C.glow} stopOpacity="0.30" />
            <stop offset="55%" stopColor={C.glow} stopOpacity="0.12" />
            <stop offset="100%" stopColor={C.glow} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pet-room-moon-glow">
            <stop offset="0%" stopColor={C.star} stopOpacity="0.10" />
            <stop offset="100%" stopColor={C.star} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* wall */}
        <rect x="0" y="0" width="180" height="84" fill={C.wall} />
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
          y="8"
          width="56"
          height="50"
          fill="url(#pet-room-moon-glow)"
        />

        {/* window: frame, sky, mullions, stars, skyline */}
        <rect x="16" y="16" width="40" height="32" fill={C.frame} />
        <rect x="20" y="20" width="32" height="24" fill={C.sky} />
        {STARS.map(([x, y, w, h]) => (
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
        {LIT_WINDOWS.map(([x, y, w, h]) => (
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
        <rect x="34" y="20" width="4" height="24" fill={C.frame} />
        <rect x="20" y="30" width="32" height="3" fill={C.frame} />

        {/* framed picture with pixel heart */}
        <rect x="110" y="24" width="16" height="16" fill={C.wood} />
        <rect x="113" y="27" width="10" height="10" fill={C.wallDark} />
        {HEART.map(([cx, cy]) => (
          <rect
            key={`h${cx}-${cy}`}
            x={113 + cx * 2}
            y={28 + cy * 2}
            width="2"
            height="2"
            fill={C.heart}
          />
        ))}

        {/* shelf + potted plant */}
        <rect x="138" y="52" width="32" height="3" fill={C.wood} />
        <rect x="141" y="55" width="2" height="3" fill={C.plankB} />
        <rect x="165" y="55" width="2" height="3" fill={C.plankB} />
        <rect x="148" y="42" width="12" height="2" fill={C.potRim} />
        <rect x="150" y="44" width="8" height="8" fill={C.pot} />
        <rect x="152" y="38" width="6" height="4" fill={C.leaf} />
        <rect x="148" y="34" width="5" height="4" fill={C.leafLight} />
        <rect x="156" y="32" width="4" height="6" fill={C.leaf} />
        <rect x="152" y="30" width="4" height="4" fill={C.leafLight} />
        <rect x="146" y="30" width="3" height="3" fill={C.leaf} />

        {/* hanging lamp: cord, stepped shade, bulb */}
        <rect x="89" y="0" width="2" height="8" fill={C.lamp} />
        <rect x="86" y="8" width="8" height="2" fill={C.lamp} />
        <rect x="82" y="10" width="16" height="2" fill={C.lamp} />
        <rect x="78" y="12" width="24" height="3" fill={C.lamp} />
        <rect x="86" y="15" width="8" height="2" fill={C.glow} />

        {/* floor: alternating planks, seams, staggered plank ends */}
        <rect x="0" y="84" width="180" height="8" fill={C.plankA} />
        <rect x="0" y="92" width="180" height="1" fill={C.seam} />
        <rect x="0" y="93" width="180" height="8" fill={C.plankB} />
        <rect x="0" y="101" width="180" height="1" fill={C.seam} />
        <rect x="0" y="102" width="180" height="8" fill={C.plankA} />
        <rect x="0" y="110" width="180" height="1" fill={C.seam} />
        <rect x="0" y="111" width="180" height="9" fill={C.plankB} />
        {PLANK_ENDS.map(([x, y]) => (
          <rect
            key={`p${x}-${y}`}
            x={x}
            y={y}
            width="1"
            height="8"
            fill={C.seam}
          />
        ))}

        {/* rug — the pet stands here */}
        <rect x="52" y="94" width="76" height="22" fill={C.rugBorder} />
        <rect x="56" y="97" width="68" height="16" fill={C.rug} />

        {/* dog bed + bone */}
        <rect x="10" y="96" width="34" height="18" fill={C.bed} />
        <rect x="14" y="100" width="26" height="10" fill={C.bedInner} />
        <rect x="23" y="104" width="10" height="2" fill={C.bone} />
        <rect x="21" y="102" width="3" height="3" fill={C.bone} />
        <rect x="21" y="105" width="3" height="3" fill={C.bone} />
        <rect x="32" y="102" width="3" height="3" fill={C.bone} />
        <rect x="32" y="105" width="3" height="3" fill={C.bone} />

        {/* warm glow cone under the lamp, washing the rug */}
        <rect
          x="54"
          y="14"
          width="72"
          height="84"
          fill="url(#pet-room-lamp-glow)"
        />
      </svg>

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
