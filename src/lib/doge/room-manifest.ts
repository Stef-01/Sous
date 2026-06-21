/**
 * room-manifest — the typed contract for the DIEGETIC Dobe nutrition room
 * (docs/DOGE-DIEGETIC-ROOM-3MO-PLAN.md, Month 1 Week 1).
 *
 * This is the single drop-in seam: each object slot binds one Sous health datum
 * to an in-world object, and `art.kind:"solid"→"sprite"` is the ONE-FIELD swap
 * the founder flips when bespoke art lands (the system never changes).
 *
 * NOTHING renders from this file — it is data + types only. The runtime that
 * spawns Object2d's from it (`public/tamaweb/src/doge/room-objects.js`) is Week 2,
 * behind the default-OFF `sous-doge-room-objects-v1` flag. The plain-JS mirror that
 * the iframe loads is `public/tamaweb/src/doge/room-manifest.js` — kept byte-for-
 * structure in sync by `room-manifest.test.ts`.
 *
 * Coordinates are WORLD units on the fixed 96×96 grid; `anchor` is the top-left,
 * matching `Object2d.x/y`. The layer is READ-ONLY against `sous-doge-health-v1`
 * and reuses `doge:logWater`; it never writes stats or gold (CI-guarded).
 */

export type StatKey =
  | "energy"
  | "mood"
  | "hydration"
  | "protein"
  | "fiber"
  | "vitamins";
export type DetailUnit = "kcal" | "g" | "glass";
export type FillMode = "level" | "clip" | "frames" | "tint";

export interface RoomLayer {
  id: string;
  z: number;
  kind: "scene-image" | "procedural";
  /** FOUNDER-GATED portrait/room PNG; absent ⇒ procedural edge-bleed (today). */
  src?: string;
}

export interface FillRep {
  /** How the bound value (0..1) shows ON the object. Rule 13: never prints a number. */
  mode: FillMode;
  /** World px, relative to the object anchor. */
  fillBox?: { x: number; y: number; w: number; h: number };
  fillColor?: { r: number; g: number; b: number };
  /** pct thresholds for the red/amber/green band (default 40 / 70). */
  band?: { low: number; mid: number };
  /** FOUNDER-GATED fill-strip; when present the renderer flips level/clip→frames. */
  spritesheet?: {
    src: string;
    rows: number;
    columns: number;
    cellSize: number;
  };
}

export type ArtRef =
  /** AUTO-BUILD stand-in (the permanent fallback). */
  | { kind: "solid"; color: { r: number; g: number; b: number } }
  /** FOUNDER-GATED — the ONE drop-in flip. */
  | { kind: "sprite"; src: string; width?: number; height?: number };

export interface ObjectBind {
  /** Omitted ⇒ a pure decor / feed companion (no metric). */
  statKey?: StatKey;
  /** PRESENT ⇒ a clean number exists (drill shows value/target). ABSENT ⇒ coverage copy only. */
  detailUnit?: DetailUnit;
  /** REQUIRED when `detailUnit` is absent (mood/vitamins). Any number MUST be a
   *  `{pct}` token resolved live — never a hard-coded data value (rule 7). */
  coverageCopy?: string;
  /** Reuses the `doge:logWater` verb — hydration only. */
  action?: "water";
  /** Renders the `meals[]` list (the protein food-bag + feed-log notebook). */
  feed?: boolean;
}

export interface ObjectSlot {
  id: string;
  /** Must equal the payload `stats[].label` for metric slots (the bind key). */
  label: string;
  anchor: { x: number; y: number };
  z: number;
  /** World px = the default hitbox. */
  size: { w: number; h: number };
  art: ArtRef;
  fill: FillRep;
  hitbox?: { shrinkX?: number; shrinkY?: number };
  bind: ObjectBind;
}

export interface RoomManifest {
  version: 1;
  scene: "home";
  world: { width: 96; height: 96 };
  /** RESERVED for the P4 pet-window composite escalation — unused in M1/M2. */
  petWindow?: { x: number; y: number; w: number; h: number; scale: number };
  layers: RoomLayer[];
  objects: ObjectSlot[];
}

/** The fixed payload stat order; metric slots bind by `label` matching these. */
export const STAT_LABELS: Record<StatKey, string> = {
  energy: "Energy",
  mood: "Mood",
  hydration: "Hydration",
  protein: "Protein",
  fiber: "Fiber",
  vitamins: "Vitamins",
};

/**
 * The authored room. Anchors/sizes are placeholder world boxes (frozen + measured
 * to the live layout in Month 2 W9); for now they only need to be valid (∈0..96,
 * size>0). Every `art.kind` is "solid" and every layer is "procedural" — the exact
 * fields the founder flips. 6 metric slots + 2 feed companions.
 */
export const ROOM_MANIFEST: RoomManifest = {
  version: 1,
  scene: "home",
  world: { width: 96, height: 96 },
  layers: [
    { id: "back-wall", z: -10, kind: "procedural" },
    { id: "floor", z: -9, kind: "procedural" },
  ],
  objects: [
    {
      id: "hydration",
      label: "Hydration",
      anchor: { x: 8, y: 52 },
      z: 2,
      size: { w: 14, h: 32 },
      art: { kind: "solid", color: { r: 120, g: 190, b: 230 } },
      fill: {
        mode: "clip",
        fillBox: { x: 2, y: 4, w: 10, h: 26 },
        fillColor: { r: 90, g: 170, b: 220 },
        band: { low: 40, mid: 70 },
      },
      bind: { statKey: "hydration", detailUnit: "glass", action: "water" },
    },
    {
      id: "protein",
      label: "Protein",
      anchor: { x: 26, y: 64 },
      z: 4,
      size: { w: 20, h: 14 },
      art: { kind: "solid", color: { r: 180, g: 120, b: 70 } },
      fill: {
        mode: "level",
        fillBox: { x: 2, y: 2, w: 16, h: 10 },
        fillColor: { r: 200, g: 130, b: 60 },
        band: { low: 40, mid: 70 },
      },
      bind: { statKey: "protein", detailUnit: "g" },
    },
    {
      id: "fiber",
      label: "Fiber",
      anchor: { x: 42, y: 78 },
      z: 5,
      size: { w: 18, h: 12 },
      art: { kind: "solid", color: { r: 110, g: 180, b: 90 } },
      fill: {
        mode: "level",
        fillBox: { x: 2, y: 2, w: 14, h: 8 },
        fillColor: { r: 120, g: 190, b: 80 },
        band: { low: 40, mid: 70 },
      },
      bind: { statKey: "fiber", detailUnit: "g" },
    },
    {
      id: "vitamins",
      label: "Vitamins",
      anchor: { x: 72, y: 56 },
      z: 3,
      size: { w: 16, h: 16 },
      art: { kind: "solid", color: { r: 230, g: 160, b: 80 } },
      fill: {
        mode: "clip",
        fillBox: { x: 2, y: 2, w: 12, h: 12 },
        fillColor: { r: 255, g: 140, b: 40 },
        band: { low: 40, mid: 70 },
      },
      // Rule 7: the only number is the live {pct} token, never a hard-coded value.
      bind: { statKey: "vitamins", coverageCopy: "Avg daily value {pct}%" },
    },
    {
      id: "energy",
      label: "Energy",
      anchor: { x: 46, y: 40 },
      z: 6,
      size: { w: 12, h: 6 },
      art: { kind: "solid", color: { r: 240, g: 200, b: 120 } },
      fill: {
        mode: "clip",
        fillBox: { x: 1, y: 1, w: 10, h: 4 },
        fillColor: { r: 255, g: 176, b: 0 },
        band: { low: 40, mid: 70 },
      },
      bind: { statKey: "energy", detailUnit: "kcal" },
    },
    {
      id: "mood",
      label: "Mood",
      anchor: { x: 60, y: 40 },
      z: 6,
      size: { w: 12, h: 6 },
      art: { kind: "solid", color: { r: 240, g: 150, b: 160 } },
      fill: {
        mode: "clip",
        fillBox: { x: 1, y: 1, w: 10, h: 4 },
        fillColor: { r: 230, g: 90, b: 110 },
        band: { low: 40, mid: 70 },
      },
      // Mood has no clean value/target → a qualitative descriptor (no number).
      bind: { statKey: "mood", coverageCopy: "How Dobe's feeling today" },
    },
    {
      id: "protein-bag",
      label: "Today's meals",
      anchor: { x: 30, y: 54 },
      z: 4,
      size: { w: 12, h: 14 },
      art: { kind: "solid", color: { r: 200, g: 170, b: 120 } },
      fill: { mode: "tint" },
      bind: { feed: true },
    },
    {
      id: "feed-log",
      label: "Feed log",
      anchor: { x: 5, y: 74 },
      z: 5,
      size: { w: 24, h: 20 },
      art: { kind: "solid", color: { r: 90, g: 120, b: 180 } },
      fill: { mode: "tint" },
      bind: { feed: true },
    },
  ],
};
