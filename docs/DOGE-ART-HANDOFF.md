# Dobe Diegetic Room — Art Handoff Spec

**For:** the founder / AI image pipeline producing the bespoke pixel-art sprites.
**Status:** the interactive SYSTEM is 100% built and tested behind a default-OFF
flag (`docs/DOGE-DIEGETIC-ROOM-3MO-PLAN.md`, Month 1 — commits 089b9a4 → b06bba8).
**The only thing standing between it and the reference render is the art in this
doc.** Each asset below is a one-field drop-in — no code change.

> Why this doc exists (CLAUDE.md rule 7/11/12): I do not generate the bespoke
> pixel art (that's the separate AI image pipeline). Everything that _can_ be
> auto-built is — the manifest, the data-binding, the value fills, selection, the
> drill card, the animation, the a11y proxies, and the loader that swaps a sprite
> in. This spec is the trigger for the founder-gated half.

---

## 1. How a sprite drops in (the runbook — one slot at a time)

1. Paint the sprite to this spec (transparent PNG, nearest-neighbour).
2. Drop it at `public/tamaweb/resources/img/doge/objects/<slotId>.png`.
3. In `public/tamaweb/src/doge/room-manifest.js` **and** the TS mirror
   `src/lib/doge/room-manifest.ts`, flip that slot's `art`:
   ```js
   // from:
   art: { kind: "solid", color: { r, g, b } },
   // to:
   art: { kind: "sprite", src: "resources/img/doge/objects/hydration.png" },
   ```
4. Unregister the `/tamaweb/` service worker + clear caches (the SW-cache gotcha),
   reload `/doge?roomobjects=1`.
5. Eyeball it; if it needs nudging, adjust only the manifest `anchor`/`size`.

**To preview an asset before committing it:** drop the PNG anywhere under
`public/tamaweb/` and load `/doge?roomobjects=1&roomart=<slotId>:<path>` — the
`?roomart` override swaps that one slot live without touching the manifest.

**Safety net:** if a sprite is missing or fails to load, the slot automatically
falls back to its procedural `solidColor` rect (the Drawer draws `solidColor` only
when no image is loaded). A typo never breaks the room. So the procedural stand-in
authored in code is the permanent fallback — these sprites only _upgrade_ the look.

---

## 2. The 6 metric objects + 2 feed companions

All coordinates are **world units on the 96×96 grid** (the room background is
`{x:0, y:0, width:96, height:96}`; the canvas is CSS-scaled up). `anchor` = the
sprite's **top-left** corner. Paint each sprite at its `size` in pixels (or a 2–4×
multiple for crisper nearest-neighbour detail — it's drawn at `size`). The
placeholder `color` is the intended hue, to hint the object.

| slot (`<slotId>`) | what it is                                   | anchor (x,y) | size (w×h) | z   | fill        | fillBox (x,y w×h) | hint colour         |
| ----------------- | -------------------------------------------- | ------------ | ---------- | --- | ----------- | ----------------- | ------------------- |
| `hydration`       | **water bottle** (liquid level = your water) | 8, 52        | 14×32      | 2   | clip/liquid | 2,4 10×26         | blue `120,190,230`  |
| `protein`         | **kibble bowl**                              | 26, 64       | 20×14      | 4   | level/mound | 2,2 16×10         | brown `180,120,70`  |
| `fiber`           | **green salad bowl**                         | 42, 78       | 18×12      | 5   | level/mound | 2,2 14×8          | green `110,180,90`  |
| `vitamins`        | **2 vitamin bottles on a shelf/table**       | 72, 56       | 16×16      | 3   | clip/fill   | 2,2 12×12         | orange `230,160,80` |
| `energy`          | **left mini-bar in the speech bubble**       | 46, 40       | 12×6       | 6   | clip/bar    | 1,1 10×4          | gold `240,200,120`  |
| `mood`            | **right mini-bar in the speech bubble**      | 60, 40       | 12×6       | 6   | clip/bar    | 1,1 10×4          | pink `240,150,160`  |
| `protein-bag`     | **food bag** (shows today's meals)           | 30, 54       | 12×14      | 4   | — (feed)    | —                 | tan `200,170,120`   |
| `feed-log`        | **spiral notebook** (the FEED LOG)           | 5, 74        | 24×20      | 5   | — (feed)    | —                 | navy `90,120,180`   |

**The `fillBox` is where the VALUE shows.** Paint the **empty vessel** (the bottle
outline with a transparent interior, the empty bowl, the empty bar frame); the app
draws the band-coloured value fill (red <30 / amber 30–70 / green ≥70) _inside_ the
`fillBox` and animates its level. So: paint the container, leave the fillBox region
clear for the fill. Energy + mood share one **speech-bubble frame** drawn above the
dog — but each bar is its own object (paint them as two bars; the bubble frame can
be a separate decor sprite, see §4).

**Optional fill-strips (the `frames` upgrade).** For the kibble/salad mounds, a 5-cell
horizontal strip reads better than a flat fill: cell 1 = empty bowl, cell 5 = full
mound, evenly between. Drop `<slotId>_fill.png` (5 cells, each `size`-sized, square
`cellSize`) and set the slot's `fill.mode:"level"→"frames"` + `fill.spritesheet:
{src, rows:1, columns:5, cellSize}`. Optional — the procedural fill is fine without it.

---

## 3. Hard constraints (every sprite)

- **96×96 world, nearest-neighbour pixel art**, transparent PNG (`image-rendering:
pixelated`). No anti-aliased edges.
- **No baked-in text or numbers.** The value lives in the fill + the on-tap drill
  card (rule 13 + rule 7 — a baked "75%" would lie the moment the data moves). The
  reference's printed `%` is rendered by the app on demand, never painted.
- **No baked drop-shadow / outline.** Hover + selection add the outline FX (`#7CE0E6`
  cyan hover, gold selected) in code; a baked shadow would double up.
- **Palette:** match the cream/navy game UI + the room's day/night wallpaper. The
  drill card is dark-navy (`#1b2447` panel, `#46598f` border, `#ffb96b` title,
  `#ffe1b0` value) — keep object sprites consistent with the room, not the card.
- Anchor the art to **top-left** = the manifest `anchor`; keep the drawn content
  within `size` so the hitbox (= `size`) matches what's seen.

---

## 4. The room background + decor (solves the edge-to-edge framing)

The biggest open item in priority A — "the whole room should be seen, edge-to-edge,
no black/cut-off margins" — is **a portrait room PNG**, the proper fix the framing
RCA (`docs/DOGE-ROOM-FRAMING-PRD.md`) identified (the current 96×96 square can't fill
a portrait screen without letterbox; the app fills the margin with a sampled palette
bleed as the interim).

- **Portrait room background** → drop the PNG and set `App.scene.home.image` (one
  string — the proven `princess`-skin precedent, App.js:1046/1760) and/or a manifest
  `layers[].kind:"scene-image"` with `src`. A ~9:16 room (e.g. 96×170) lets the room
  fill the screen flush; until then the edge-bleed stays.
- **Decor sprites** (poster "FEED WELL / LIVE WELL", wall shelf + trophy + plant,
  bed, window, nightstand, rug, the dog's ball + bone toys, the comic speech-bubble
  frame) — each a pure `art.kind:"sprite"` slot that **binds to no data**. They're
  reserved in the manifest as decor; drop the PNG + add the slot.
- **The Doberman** is the existing Tamaweb pet sprite (already reskinned). The
  reference's collar/tag/pose would be a pet-sprite update, handled in the pet
  pipeline, not here.

---

## 5. Reference

The target is the founder-provided golden-hour diegetic room (the hydration bottle's
liquid IS the water %, the kibble bowl IS protein, the spiral notebook IS the feed
log, etc.) — see `docs/DOGE-DIEGETIC-ROOM-3MO-PLAN.md` §0 for the full decomposition.
A live placeholder screenshot (flag-on, procedural rects in place) can be captured
from `/doge?roomobjects=1` to paint against; the object positions there match this
table exactly.

**Once these land, flip `art.kind` per slot and the room becomes the reference — with
zero code change.**
