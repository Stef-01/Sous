"use client";

/**
 * PixelIcons — hand-placed 12×12 pixel-art icons for the Tamagotchi screen,
 * same technique as pixel-doberman.tsx: character maps rendered as SVG rects
 * with crispEdges. No image assets — every pixel lives in this file.
 *
 * Each icon embeds its own small palette (3–5 colors) in `colors`; "." is
 * transparent. Shapes favour bold silhouettes with a 1px darker outline
 * (`o`) and keep a transparent margin where the shape allows.
 */

export type PixelIconName =
  | "drumstick"
  | "droplet"
  | "bolt"
  | "heart"
  | "leaf"
  | "shield"
  | "ball"
  | "pan"
  | "chart"
  | "bone"
  | "flame"
  | "paw";

interface PixelIconDef {
  /** 12 rows × 12 chars. "." = transparent. */
  map: string[];
  /** Per-icon char → fill legend. */
  colors: Record<string, string>;
}

export const PIXEL_ICONS: Record<PixelIconName, PixelIconDef> = {
  /** Roast drumstick — browned meat up top, cream bone knob below. */
  drumstick: {
    colors: {
      o: "#5b3318", // dark brown outline
      B: "#a8642a", // roast brown meat
      b: "#c98a4b", // crispy highlight
      C: "#f3e9d2", // bone cream
      c: "#d9c9a8", // bone shadow
    },
    map: [
      "...oooo.....",
      "..oBbbBo....",
      ".oBbbBBBo...",
      ".oBBBBBBBo..",
      ".oBBBBBBBo..",
      "..oBBBBBo...",
      "...oBBBo....",
      "....oCCo....",
      ".....oCo....",
      "....oCCCo...",
      "...oCcoCco..",
      "....oo.oo...",
    ],
  },

  /** Water droplet — two blues with a white shine on the left cheek. */
  droplet: {
    colors: {
      o: "#1e4f8f", // deep blue outline
      B: "#3f8fe0", // water blue
      L: "#7cc4f4", // light blue rim
      W: "#eaf6ff", // shine
    },
    map: [
      ".....o......",
      ".....oo.....",
      "....oLo.....",
      "....oLBo....",
      "...oLBBo....",
      "...oLBBBo...",
      "..oLWBBBBo..",
      "..oLWBBBBo..",
      "..oLBBBBBo..",
      "..oLBBBBBo..",
      "...oBBBBo...",
      "....oooo....",
    ],
  },

  /** Lightning bolt — two golds, jagged from top-right to bottom-left. */
  bolt: {
    colors: {
      o: "#8a5800", // dark amber outline
      G: "#f5b910", // gold
      Y: "#ffdf6b", // light gold edge
    },
    map: [
      "......oo....",
      ".....oYGo...",
      "....oYGo....",
      "...oYGGo....",
      "...oYGGooo..",
      "..oYGGGGGo..",
      "..ooooYGo...",
      ".....oYGo...",
      "....oYGo....",
      "....oGo.....",
      "...oGo......",
      "...oo.......",
    ],
  },

  /** Heart — two reds with a pink gleam on the left lobe. */
  heart: {
    colors: {
      o: "#8f1d2c", // dark red outline
      R: "#e0314b", // red
      P: "#ff8fa3", // pink gleam
    },
    map: [
      "............",
      "..ooo..ooo..",
      ".oRRRooRRRo.",
      ".oPRRRRRRRo.",
      ".oPRRRRRRRo.",
      ".oRRRRRRRRo.",
      "..oRRRRRRo..",
      "...oRRRRo...",
      "....oRRo....",
      ".....oo.....",
      "............",
      "............",
    ],
  },

  /** Leaf — two greens, tip up-right, light central vein, stem bottom-left. */
  leaf: {
    colors: {
      o: "#2c6b2f", // dark green outline + stem
      G: "#4caf50", // leaf green
      L: "#8bd97a", // light vein
    },
    map: [
      "........ooo.",
      "......ooGGo.",
      ".....oGGLo..",
      "....oGGLGo..",
      "...oGGLGGo..",
      "..oGGLGGo...",
      "..oGLGGGo...",
      "..oGLGGo....",
      "..oGGGo.....",
      "..oGGo......",
      ".oGo........",
      ".oo.........",
    ],
  },

  /** Shield — gold crest, light catch top-left, darker gold shading. */
  shield: {
    colors: {
      o: "#3a2d12", // dark outline
      G: "#e8b53a", // gold
      g: "#b98818", // dark gold shade
      W: "#ffe08a", // light gold shine
    },
    map: [
      "............",
      ".oooooooooo.",
      ".oGGGGGGGGo.",
      ".oGWGGGGGGo.",
      ".oGWGGGGGGo.",
      ".oGGGGGGggo.",
      "..oGGGGGgo..",
      "..oGGGGGgo..",
      "...oGGGgo...",
      "....oGGo....",
      ".....oo.....",
      "............",
    ],
  },

  /** Rubber ball — red with a white shine patch and a dark moulding seam. */
  ball: {
    colors: {
      o: "#5a1620", // dark seam + outline
      R: "#e23d3d", // red
      r: "#b02828", // red shade
      W: "#fff6ee", // shine patch
    },
    map: [
      "............",
      "....oooo....",
      "..ooRRRRoo..",
      "..oRWWRRRo..",
      ".oRWWRRRRRo.",
      ".oooooooooo.",
      ".oRRRRRRRro.",
      ".oRRRRRrrro.",
      "..oRRRrrro..",
      "..ooRrrroo..",
      "....oooo....",
      "............",
    ],
  },

  /** Frying pan — dark steel body, brown stick handle to the right. */
  pan: {
    colors: {
      o: "#1f1f24", // near-black outline
      S: "#4d5560", // steel
      s: "#7d8794", // steel rim light
      H: "#8a5a2b", // brown handle
      h: "#b07a40", // handle highlight
    },
    map: [
      "............",
      "............",
      "............",
      ".oooooo.....",
      ".ossssooooo.",
      ".oSSSSoHhHo.",
      ".oSSSSooooo.",
      ".oSSSSo.....",
      "..oooo......",
      "............",
      "............",
      "............",
    ],
  },

  /** Bar chart — green/gold/blue bars rising on a dark panel. */
  chart: {
    colors: {
      o: "#23262e", // frame
      d: "#343a48", // dark panel
      G: "#4caf50", // green bar
      Y: "#f5b910", // gold bar
      B: "#4f8fe8", // blue bar
    },
    map: [
      "............",
      ".oooooooooo.",
      ".oddddddBBo.",
      ".oddddddBBo.",
      ".odddYYdBBo.",
      ".odddYYdBBo.",
      ".oGGdYYdBBo.",
      ".oGGdYYdBBo.",
      ".oGGdYYdBBo.",
      ".oGGdYYdBBo.",
      ".oooooooooo.",
      "............",
    ],
  },

  /** Dog bone — cream with soft shadow, double knobs at each end. */
  bone: {
    colors: {
      o: "#8c6f4a", // warm dark outline
      C: "#f6ecd6", // bone cream
      c: "#d8c5a0", // cream shadow
    },
    map: [
      "............",
      "............",
      ".oo......oo.",
      ".oCCo..oCCo.",
      ".oCCooooCCo.",
      ".oCCCCCCCCo.",
      ".oCcCCCCcCo.",
      ".oCCooooCCo.",
      ".oCco..oCco.",
      ".oo......oo.",
      "............",
      "............",
    ],
  },

  /** Flame — orange body with a gold licking tip and hot inner glow. */
  flame: {
    colors: {
      o: "#9c2f12", // ember outline
      O: "#f56e26", // orange core
      Y: "#ffc83d", // gold tip + glow
    },
    map: [
      "......o.....",
      ".....oYo....",
      ".....oYo....",
      "....oYYo....",
      "....oOOOo...",
      "...oOOOOOo..",
      "..oOOOOOOo..",
      "..oOOYYOOo..",
      "..oOOYYOOo..",
      "..oOOOOOOo..",
      "...oOOOOo...",
      "....oooo....",
    ],
  },

  /** Paw print — three toes over a big warm-brown pad. */
  paw: {
    colors: {
      o: "#5e3a1d", // dark brown outline
      P: "#a06a35", // warm brown pad
      p: "#c98e57", // pad highlight
    },
    map: [
      "............",
      "..oo.oo.oo..",
      ".oPPoPPoPPo.",
      ".oPPoPPoPPo.",
      "..oo.oo.oo..",
      "...oooooo...",
      "..oPPppPPo..",
      "..oPPPPPPo..",
      "..oPPPPPPo..",
      "...oPPPPo...",
      "....oooo....",
      "............",
    ],
  },
};

export function PixelIcon({
  name,
  size = 14,
  className,
}: {
  name: PixelIconName;
  size?: number;
  className?: string;
}) {
  const { map, colors } = PIXEL_ICONS[name];
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label={name}
    >
      {map.flatMap((row, y) =>
        row.split("").map((ch, x) => {
          const fill = colors[ch];
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
