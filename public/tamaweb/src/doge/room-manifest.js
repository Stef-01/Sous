/**
 * room-manifest.js — the plain-JS mirror of src/lib/doge/room-manifest.ts, loaded
 * inside the Tamaweb iframe (after sous-bridge.js) as window.SOUS_ROOM_MANIFEST.
 *
 * Diegetic Dobe nutrition room, Month 1 Week 1. Data only — nothing renders here.
 * Kept byte-for-structure in sync with the .ts by room-manifest.test.ts (parity).
 * Also exports via module.exports so the parity test can require() it in Node.
 */
(function () {
  var ROOM_MANIFEST = {
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

  if (typeof window !== "undefined") {
    window.SOUS_ROOM_MANIFEST = ROOM_MANIFEST;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = ROOM_MANIFEST;
  }
})();
