# Pet Room — Aesthetic Overhaul Plan (mockup parity)

Founder request 2026-06-10: make the full-screen Tamagotchi look like the
AI-generated spec images. This doc is the appraisal → RCA → execution plan.
All phases are AUTO-BUILD (code only, no founder assets required) unless
flagged.

## Appraisal: the seven gaps (impact order)

| #   | Gap           | Current                                | Spec                                                             |
| --- | ------------- | -------------------------------------- | ---------------------------------------------------------------- |
| 1   | Pixel density | dog 28×24, room 180×120 flat blocks    | dog ~70-90 cells w/ detail; room has grain/pattern density       |
| 2   | Tonal depth   | 1 tone per material (7-color palette)  | 3 blacks + 3 rusts on the dog; shaded rug/floor/wall             |
| 3   | Outline pass  | none                                   | 1px near-black contour around every sprite/prop                  |
| 4   | Typography    | app sans, uppercase                    | chunky bitmap font everywhere                                    |
| 5   | Icons         | OS emoji (antialiased, off-palette)    | hand-pixelled in-palette icons                                   |
| 6   | Panel chrome  | uniform border-2 + radius (CSS)        | 9-slice pixel bevel: tan border, lit/dark edges, notched corners |
| 7   | Lighting      | 2 faint radial gradients on flat fills | lamp light pool, lit wall band, corner/under-furniture AO        |

## RCA

The ceiling was **authoring economics, not rendering**. SVG rects render
pixel art losslessly at any grid size, but every cell is a hand-typed
character; grid size and tone count were budgeted down to what could be
hand-placed reliably in one pass. Emoji, system font, and CSS borders were
zero-effort defaults that each break the retro fiction. The generator that
made the spec pays no per-cell authoring cost.

**Fix strategy: pay the authoring cost once, programmatically.** Write
helpers that do the expensive parts (outline tracing, banded shading,
dithering) as functions over the maps instead of hand-typing them, so a 2×
grid with 3-tone materials costs roughly the same hand-effort as today's
flat 1×.

## Execution plan

### Phase A — Bitmap typography + pixel chrome (biggest win/line)

- Add a pixel font via `next/font/google` (Pixelify Sans for body-size
  legibility; optionally Press Start 2P for the DOBE nameplate only),
  loaded ONLY on the pet screen (scoped className, `display: swap`).
- `PixelFrame` component replacing `Panel`: layered box-shadows (no images)
  → 2px outer dark #1a1410, 2px tan #8a6648, 1px inner highlight top-left
  #c9a06a, 1px inner shadow bottom-right, square-notched corners via four
  corner rects (absolutely-positioned 4px squares matching the page bg).
- Saturate the panel palette to spec chroma (fill #2b2117 → #2e2014; titles
  #e8d9b5 → #f0d9a0).

### Phase B — In-palette pixel icon set

- `pixel-icons.tsx`: 12×12 hand-placed SVG icons — drumstick, droplet,
  bolt, heart, leaf, shield, ball, frying pan, bar-chart, bone, flame,
  paw. Same `<rect>` technique as the sprite; replaces every emoji on the
  pet screen (stat rows, action tiles, activity rows, inventory falls back
  to emoji only for arbitrary pantry foods — flag: a pixel food-icon set
  is a later nice-to-have).

### Phase C — Sprite v3 (the dog)

- Programmatic helpers in pixel-doberman.tsx:
  - `outline(grid, color)` — trace the silhouette, stamp 1px contour.
  - `shade(grid, bands)` — remap base tones by row band (highlight top,
    shadow bottom) so 3-tone coats don't triple hand-placement.
- Upscale hero to ~44×34: rounded skull, open-mouth smile + tongue, eye =
  W + K pupil + 1px sparkle, 2-tone rust muzzle, chest patch highlight,
  haunch shading, tail with rust tip. Same mood/pose recomposition + the
  existing structural tests extended (outline present on every non-"." edge
  cell; ≥3 K-family tones in stand pose).

### Phase D — Room v2

- Grid to 240×160 (band stays 3:2). Add: baseboard + wall trim, curtains +
  sill flowers on the window, bookshelf with 5 book spines, rug pattern
  (2-tone diamond + paw print), ball next to the dog, floor grain strokes,
  stepped lamp light pool (3 opacity rects, not a gradient), corner AO
  rects, under-furniture shadows. Keep ≤2 gradients total.

### Phase E — Bars, buttons, arrows (honest data garnish)

- Stat bars: notched pixel caps, 2px inner shadow, spec saturation.
- Trend arrows like the spec's ▲ — REAL: compare each stat to yesterday's
  aggregate (the diary already has it); ▲ green / ▼ muted; omit when no
  yesterday data. No fake "+20 ⭐" rewards (no real economy — unchanged).
- Action tiles → PixelFrame treatment with Phase-B icons.

### Phase F — Eyes-on loop + gate

- Screenshot-iterate each phase against both spec images (≥2 rounds on the
  dog). Full suite + build. Commit per phase.

## Scope honesty

A raster from an image generator has unlimited per-pixel freedom; this plan
gets the code path to ~90% of the spec's read. The last 10% (painterly
micro-noise, perfect anatomical curves) is only reachable by shipping the
spec images as assets — founder-gated by the image-pipeline rule (rule 11)
and unnecessary if Phases A–E land well.
