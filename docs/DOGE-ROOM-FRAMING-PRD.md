# Doge — Room Framing & Nutrition Integration (RCA + PRD)

Status: **shipped v1** (seamless full-screen room + wall-mounted health board).
Owner: autonomous build loop. Last update: 2026-06-20.

## The feedback (founder)

1. The game screen is only a small square — it should be the **entire screen**.
2. The UI should be **integrated into the whole pet room**, not a lazy flat-orange
   background behind the metrics.
3. The **health metrics should be in the living room** and appear seamless — in
   the same pixel-art style as the Doberman / Tamaweb's own panels.

## 5-stage critical appraisal of the prior state

1. **Scale** — the room rendered at ~40% of the screen height (a full-width but
   short square), so it read as "small".
2. **Backdrop** — the contain margins were a flat warm-orange gradient: a foreign
   surface, not part of the world. "Lazy."
3. **Integration** — the metrics floated on that orange band, visually detached
   from the room.
4. **Style** — (already fixed earlier) the panel was a dark glassy HUD; now it's
   the game's own `.surface-stylized` cream/orange pixel panel.
5. **Composition** — panel + orange + square room read as three stacked,
   unrelated bands rather than one scene.

## Root cause analysis

The Tamaweb room is a **fixed 96×96 px square background image**
(`resources/img/background/house/02.png`) and the entire world coordinate system
is 96×96 (`App.js` — mouse/pet/furniture math all divide by `canvas.width=96`).
There is **no taller or wider room asset**, and no camera that reveals more world.

Therefore a 1:1 image **cannot** fill a ~1:2.2 portrait screen:

- `object-fit: fill` → ~2× vertical distortion (the game's own broken default).
- `object-fit: cover` → zooms ~8.9× to fill height → a giant bed-blob, dog cropped
  off-screen (verified — strictly worse).
- `object-fit: contain` → whole room visible but a small square + margins (the
  state under critique).

So the real lever is **not** how we crop the square — it's **how we treat the
space around it.**

## The design (v1, shipped)

**Extend the room instead of framing it.** Each ~2s the receiver samples the room
canvas's own edge colours (top-centre = back wall, bottom corner = floor) and
bleeds them into the contain margins as a vertical gradient. The bedroom's white
wall now continues up to the metrics and the floor continues down — the scene
reads as **one tall room filling the screen**, and it adapts automatically to any
room (kitchen, etc.) and day/night.

The native cream/orange pixel nutrition panel sits on that wall as a **mounted
health-chart** (inset bevel + outer drop-shadow), so the metrics live in the
living room, seamless, no orange. Whole world stays visible; dog never cropped.

Files: `public/tamaweb/src/sous-bridge.js` (`sampleRoomBackdrop`, the fullscreen
layout CSS, the `.sous-nutrition-hud` panel styling).

## Honest ceiling / future options (need real assets — founder-gated)

The room can only ever _read_ as full-screen via edge-bleed; the actual painted
detail is 96×96. To make the room **natively** portrait/full-bleed:

- **A. New portrait room art** — commission 96×170 (or taller) background images
  per room with the floor/walls painted to the new aspect. Highest fidelity;
  needs an artist (rule 7: no invented art in-repo).
- **B. Procedural extension** — tile the floor texture down + wall texture up in
  the canvas itself (engine change in `Drawer`/`Scene`), so the bleed is real
  pixels, not a CSS gradient. Medium effort, no new art.
- **C. In-world metric objects** — render the stats as an actual pixel object in
  the room (a wall TV / framed chart sprite) rather than a DOM panel. Needs a
  sprite + engine wiring.

v1 (edge-bleed + DOM board) is the best fully-autonomous result without new art.
