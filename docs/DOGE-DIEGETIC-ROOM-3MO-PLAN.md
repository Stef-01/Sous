# Dobe Diegetic Nutrition Room — 3-Month Technical Plan

**Status:** Accepted plan · **Date:** 2026-06-21 · **Supersedes the framing-only** `docs/DOGE-ROOM-FRAMING-PRD.md` (which found the fixed-96×96 room is our framing ceiling — this is the answer to that ceiling). · **Method:** multi-agent design + draft, every load-bearing fact verified against live engine code, then two adversarial review passes (completeness + rule-12) folded in.

> **The one-line bet:** every interactive, data-bound, individually-selectable, drillable thing is **AUTO-BUILD and ships now** behind a flag; **only painted pixels are founder-gated**, and each is a single-field manifest drop-in with zero logic change. We are blocked on the artist for **no logic**.

---

## 0. Critical appraisal — the reference vs. what Dobe is today

The reference image is a richly-illustrated portrait pixel-art bedroom at golden hour where **nutrition is _diegetic_** — every health metric is a **physical object in the room**, not a panel floating over it.

| Metric        | In the reference it is…                           | Today it is…           |
| ------------- | ------------------------------------------------- | ---------------------- |
| Hydration     | a **water bottle** whose liquid level = the %     | a bar in the cream HUD |
| Protein       | a **kibble bowl** + a labelled food bag           | a bar                  |
| Fiber         | a **salad bowl**                                  | a bar                  |
| Vitamins      | two **vitamin bottles on a side table**           | a bar                  |
| Mood + Energy | a **comic speech bubble** over the dog            | bars                   |
| Recent meals  | a **spiral "FEED LOG" notebook** ("FED TODAY: …") | a one-line text string |

**The central move** is that the data _is_ the world. That is the deepest possible expression of the standing Priority-A goal ("make nutrition native to the game") — we have been climbing toward it with a cream HUD + edge-bleed; the reference leapfrogs to embodiment. The seven honest deltas:

1. **Diegesis (the big one).** Today's nutrition is an overlay HUD; the reference embeds it as objects. This is a _system_ gap, not a styling one — and the one that, done right, finally satisfies the "individually selectable / drillable" depth bar **in-world**.
2. **Art fidelity.** The reference is bespoke, cohesive, Stardew-tier. Today's room is the stock Tamaweb 96×96 raster upscaled — soft, generic.
3. **Composition / full-bleed.** A deliberately-composed portrait scene edge-to-edge vs. a small square with sampled edge-bleed.
4. **HUD theme.** A **dark-navy beveled** panel with a gold paw vs. our cream `.surface-stylized`.
5. **The pet.** A detailed seated Doberman with collar/tag + ball + bone + heart bubble vs. the reskinned stock sprite.
6. **Recent-activity as object.** The feed-log notebook vs. our text line.
7. **Interactivity to our depth bar.** The reference _shows_ objects; our rule demands each be hoverable / selectable (object-box) / drillable. This plan makes every diegetic object a live, data-bound, selectable element — not a painted decoration.

**The constraint that shapes the entire plan (load-bearing):** CLAUDE.md rules 7 & 11 forbid generating the bespoke art — "that is handled by a separate AI image pipeline." So per rule 12 the **art is FOUNDER-GATED**, while **the entire diegetic-object engine, data-binding, selection/drill-down, scene composition, the dark-navy theme, the asset-slot manifest, placeholder art, and tests are AUTO-BUILD.** The plan front-loads all auto-buildable system work behind a precise asset contract so each sprite lands as a one-line drop-in — never scheduling "draw the room" as if it were AI-executable.

---

## 1. Founder-gated asset manifest (rule-12 header — commission these in Week 1, in parallel)

These are the **only** blockers, and **none** of them blocks any logic. Each is a single-field swap into a system that is otherwise 100% built and tested. The autonomous build does not wait on any of them.

| Founder-gated asset                                   | Drop path                                                                              | One-line integration                                       | Blocks                                                                         |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Room background PNG (portrait scene)                  | assign `App.scene.home.image` (string) — **proven live precedent** App.js:1046 / :1760 | assign string                                              | nothing (procedural `sampleRoomBackdrop` edge-bleed is the permanent fallback) |
| 6 metric-object sprites                               | `resources/img/doge/objects/<slotId>.png`                                              | flip `art.kind:"solid"→"sprite"`                           | nothing (procedural `solid`/`clip`/`level` fill is the permanent fallback)     |
| Fill-strips (kibble/salad mounds, N=5, cell 1 empty)  | `resources/img/doge/objects/<slotId>_fill.png`                                         | flip `fill.mode:"level"→"frames"` + add `fill.spritesheet` | nothing                                                                        |
| Decor sprites (poster, shelf, bed, window, rug, toys) | `resources/img/doge/objects/<decorId>.png`                                             | flip `art.kind:"solid"→"sprite"`                           | nothing (decor slots bind to no data)                                          |
| _(reserved, optional)_ pet-window portrait composite  | populate `petWindow` + a `scene-image` layer                                           | gated on a spike (P4 escalation)                           | not on the critical path                                                       |

**Handoff spec** lives in `docs/DOGE-ART-HANDOFF.md` (authored W5, frozen-measured W9, read-through W13): 96×96 nearest-neighbour world; transparent PNG; **no baked drop-shadow** (`showOutline` adds the selection FX); **no embedded text/numbers** (rule 13 — value is fill-encoded, the number is on-demand only); palette tokens from `injectHudStyle`; per-object `anchor/z/size` table; fill-strip spec.

---

## 2. Architecture decision (ADR-001, condensed)

All four independently-generated architecture proposals converged on a **manifest-driven hybrid**; they diverged only on the room-background mechanic. The chosen backbone is **canvas-native `Object2d` metrics + a thin DOM text/a11y skin**, grafting the best of the rest. Every claim below was verified against the live engine.

### 2.1 Rendering layer — two surfaces, one coordinate truth (the 96×96 world)

| Surface                                              | Owns                                                                          | Mechanism (verified)                                                                                                                                                                                                              |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Canvas (primary, the diegetic body)**              | presence, **depth/occlusion vs. the dog**, value-fill encoding, hover, select | `new Object2d` auto-registers (Object2d.js:53), z-sorted (Drawer.js:52), AABB hit-tested per frame at `App.mouse` mapped to the canvas (App.js:480); `onDraw` paints the fill; `showOutline`/`showBoundingBox` drive hover/select |
| **DOM (escape hatch — text + a11y only)**            | crisp word, exact `value/target`, the water action, keyboard/SR reachability  | one `.sous-room-drill` card + N focusable proxies in `.graphics-wrapper`, projected from the selected object's `getBoundingBox()` via the inverse of App.js:480                                                                   |
| **Background (founder-gated / procedural fallback)** | the room itself                                                               | `scene.home.image` one-string swap (App.js:1760); until art lands, the existing edge-bleed gradient (`sampleRoomBackdrop`) stays                                                                                                  |

**Why the hybrid (verified substrate facts):** pure-DOM (today's HUD) floats _over_ the world and can never be occluded by the dog; pure-canvas can't render readable text (`8px` engine font is unusable); the world is a fixed **96×96** raster with **no working camera zoom** (`cameraPosition.z` is never written) — so a true portrait scene is founder-PNG-only. Canvas owns the _body_ (so the dog occludes objects); DOM owns the _text_ (so it's legible + accessible).

### 2.2 Scene/asset manifest — the entire drop-in seam (one typed file)

Authored at `public/tamaweb/src/doge/room-manifest.js` (plain JS, `<script>`-loadable in-iframe) with a mirror `src/lib/doge/room-manifest.ts` for tests. **All coordinates are world units (0–96), `anchor` = top-left, matching `Object2d.x/y`.**

```ts
export type StatKey =
  | "energy"
  | "mood"
  | "hydration"
  | "protein"
  | "fiber"
  | "vitamins";

export interface RoomLayer {
  id: string;
  z: number;
  kind: "scene-image" | "procedural";
  src?: string;
}

export interface FillRep {
  mode: "level" | "clip" | "frames" | "tint"; // RULE 13: encodes value, never prints the number
  fillBox?: { x: number; y: number; w: number; h: number }; // world px, relative to anchor
  fillColor?: { r: number; g: number; b: number };
  band?: { low: number; mid: number }; // pct thresholds, default 40 / 70
  spritesheet?: {
    src: string;
    rows: number;
    columns: number;
    cellSize: number;
  };
}

export type ArtRef =
  | { kind: "solid"; color: { r: number; g: number; b: number } } // AUTO-BUILD stand-in (permanent fallback)
  | { kind: "sprite"; src: string; width?: number; height?: number }; // FOUNDER-GATED — the ONE drop-in flip

export interface ObjectSlot {
  id: string;
  label: string; // label must equal payload stats[].label
  anchor: { x: number | string; y: number | string };
  z: number;
  size: { w: number; h: number }; // world px = default hitbox
  art: ArtRef;
  fill: FillRep;
  hitbox?: { shrinkX?: number; shrinkY?: number }; // → Object2d.getBoundingBox(shrinkX, shrinkY)
  bind: {
    statKey?: StatKey; // omitted ⇒ pure decor slot
    detailUnit?: "kcal" | "g" | "glass"; // PRESENT ⇒ exact number exists; ABSENT ⇒ coverage copy only
    coverageCopy?: string; // REQUIRED when detailUnit absent (mood/vitamins) — rule-7 guard
    action?: "water"; // reuses doge:logWater; hydration only
    feed?: boolean; // renders meals[] rows (protein bag + notebook)
  };
}

export interface RoomManifest {
  version: 1;
  scene: "home";
  world: { width: 96; height: 96 };
  petWindow?: { x: number; y: number; w: number; h: number; scale: number }; // RESERVED — P4 escalation, unused in M1/M2
  layers: RoomLayer[];
  objects: ObjectSlot[]; // 9 metric/companion slots (see §2.3) + reserved decor
}
```

Every field maps to something that already exists: `anchor/size/z` → `new Object2d`; **`art.kind:"solid"→"sprite"` is the single drop-in switch** (`setImg`, App.js:1760); `bind.statKey` → the health key; `bind.detailUnit` + `stats[].detail` → `fmtDetail`; `bind.action` → `doge:logWater`; `fill.mode:"clip"` → the native polygon clip (Drawer.js:144); `fill.mode:"frames"` → the native atlas `cellNumber` (a **mutable runtime field**, reassigned live across the engine — proven seam).

### 2.3 Data-binding map

Source of truth: `localStorage["sous-doge-health-v1"]` (`DogeHealthPayload`), stat order fixed `[Energy, Mood, Hydration, Protein, Fiber, Vitamins]`. **Confirmed live: `detail` is emitted only when a clean number exists** — Mood & Vitamins carry **no detail** (`mk()` returns `undefined`, pet-screen-data.ts:151–182; store.ts:63). Fabricating a number for them violates rule 7 — the manifest enforces `coverageCopy` instead.

| Object                                           | Payload field                    | In-world encoding (numberless)                        | Select / drill reveal                                     | Action                              |
| ------------------------------------------------ | -------------------------------- | ----------------------------------------------------- | --------------------------------------------------------- | ----------------------------------- |
| **Hydration bottle**                             | `stats[2].pct`; `detail{…glass}` | `clip` liquid level to pct%                           | `"6 / 8 glasses"`                                         | **"Log a glass"** → `doge:logWater` |
| **Protein kibble bowl**                          | `stats[3].pct`; `detail{…g}`     | `frames` mound / `level`                              | `"30g / 50g"`                                             | —                                   |
| **Protein food bag** _(companion)_               | `meals[]`                        | front label = `meals.slice(0,3)`                      | full meals list                                           | —                                   |
| **Fiber salad bowl**                             | `stats[4].pct`; `detail{…g}`     | `frames` greens / `level`                             | `"4g / 28g"`                                              | —                                   |
| **Energy** _(own object — see correction P0/A6)_ | `stats[0].pct`; `detail{…kcal}`  | `clip` mini-bar                                       | `"540 / 2000 kcal"`                                       | —                                   |
| **Mood** _(own object)_                          | `stats[1].pct`; **NO detail**    | `clip` mini-bar                                       | **`coverageCopy`** ("Hearts 1/5") — never value/target    | —                                   |
| **Vitamins shelf**                               | `stats[5].pct`; **NO detail**    | `clip` fill-ring                                      | **`coverageCopy`** ("Avg DV {pct}%") — never value/target | —                                   |
| **Feed-log notebook**                            | `meals[]` + `status`             | one ruled row per meal + "+N more"; header = `status` | full feed                                                 | —                                   |

> Energy and Mood are **two separate `Object2d` slots** visually grouped by the bubble frame — _not_ one object with two hitboxes (the engine hit-tests one box per object). So `objects.length === 9` (6 metrics + food-bag + notebook… and the bubble is two of the six). This is correction **A6** below.

**Rule-13 ↔ "the reference prints %" reconciliation (deliberate):** the reference paints `75%` on every sign, but rule 13(d) forbids an encoder also printing its number. **Resolution by surface-split:** (a) the **in-world object** encodes value by **fill + colour band only — never a painted number** (this also keeps the artist from baking text into PNGs); (b) **hover** shows the short word (`pctWord`); (c) **select** discloses the exact `value/target` in the drill card (rule 13(e), disclosure on demand); (d) the legacy **DOM HUD readout** keeps its `%` because it is a _readout_, not the diegetic object. The `%` lives on the readout; the room object stays numberless.

### 2.4 Selection / accessibility / safety model

- **Hover** → `showOutline('#7CE0E6')` rim + caption shows `pctWord`.
- **Select** → a distinct selection frame (see correction **P0/A3** — _not_ the faint debug-red `showBoundingBox`) + the `.sous-room-drill` card anchored over the object.
- **Keyboard / SR** → a parallel list of focusable `role="button"` proxies (Tab order = manifest order) mirrors hover/select and reuses the existing Enter/Space handler; canvas occlusion meaning is carried in each proxy's `aria-label`.
- **Pointer-ownership contract (non-negotiable):** the DOM caption/drill/proxy layer is `pointer-events:none` except the water button + focus proxies, which sit in caption-only regions never over a canvas hitbox the engine must own.
- **Safety invariant:** the layer **only reads** `sous-doge-health-v1` and **only reuses** `doge:logWater`. It **never writes stats or gold** → the depleting-stat loop and the CI gold-economy wall are physically unreachable. A CI grep guard (added Week 1) fails the build on any `logGold` / stat-write / `setItem("sous-doge-health` in `room-objects.js`.
- **Flag:** `localStorage["sous-doge-room-objects-v1"]==="1"` **OR** `?roomobjects=1`, **default OFF**. `spawnRoomObjects()` early-returns unless flagged → production is byte-identical, build + test green. Deleting the two new files fully reverts with zero residue.

---

## 3. Adversarial corrections folded into the plan

Two independent code-verified review passes found the ADR's instinct sound but caught **load-bearing facts the first draft got wrong** and gaps hidden behind "verify live." These are folded into the weeks below; recorded here for traceability. **The four that would have sunk it are P0.**

| ID                    | Correction                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Folded into                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **P0/A1**             | **`onClick` auto-repeats at 60fps** (`mouse.isDown` held for the whole press; Drawer.js:73 fires `onClick` every frame while down). "Log a glass" as specified would fire **dozens of `doge:logWater` writes per tap**, and selection would toggle ~60×/s. **Fix:** an explicit per-object rising-edge detector (`!wasDown && isDown`) in `room-objects.js`; a test that 10 consecutive down-frames over the hydration hitbox yield **exactly one** `logWater`.                         | **W2** (before any wiring) |
| **P0/A2**             | **The DOM-projection formula is wrong** for the non-fullscreen view users see first: it hardcodes `96` (should read live `canvas.width`) and assumes the `contain` + `center 58%` letterbox always applies (it applies **only** under `.fullscreen`). **Fix:** a `projectWorldToCss()` that reads live canvas size, branches on `.fullscreen`, applies the contain-letterbox + offset math only there, with round-trip tests in **both** modes.                                         | **W4 / W10**               |
| **P0/A3**             | **`showBoundingBox()` is a faint 25%-opacity red wash** (hardcoded `red_pixel.png`, ignores colour) — a debug artifact that reads as _error_ and clashes with the red fill band. It does **not** satisfy the "object-box" depth bar. **Fix:** drive the selected state via a distinct `showOutline` colour (bright/thick cyan) **or** a real corner-bracket frame drawn in `onDraw`.                                                                                                    | **W4**                     |
| **P0/A4**             | The canvas itself has an inline `onclick="App.handlers.open_main_menu()"` (index.html:110) that fires on **every** canvas click — `pointer-events:none` on DOM siblings can't stop it. **Fix:** name the real mechanism — verify `App.preventNextGameplayControl` (set by the `Object2d.onClick` wrapper) actually suppresses the menu handler for this path; pull that **live verification forward to W4**, not month 3. If it doesn't suppress, that's a real bug to find in month 1. | **W4**                     |
| A5 (cadence)          | The bridge tick is **400ms**, not 3s; there is no 3s parse event to "cache on." **Fix:** invalidate the cached snapshot on the **400ms tick** (or, better, a `window.addEventListener('storage', …)` on the health key — the payload is written by the parent frame). `onDraw` still reads only the cached snapshot.                                                                                                                                                                    | **W3**                     |
| A6 (bubble)           | Energy + Mood must be **two `Object2d` slots** (one box per object in the engine), not one object with two hitboxes. `objects.length === 9`; all count assertions updated.                                                                                                                                                                                                                                                                                                              | **W1/W3**                  |
| A7 (states)           | Add an explicit **`loading`/`unknown` state** (neutral grey, no band) distinct from `empty` (`pct===0`) — "data not yet read" ≠ "you've had zero water." Wrap the payload parse in try/catch → null (a corrupt non-null value must not throw a frame). Every `Object2d` must carry explicit `width/height` (`getBoundingBox` derefs `this.image.width` otherwise, and the Drawer loop is not per-object try/caught).                                                                    | **W1–W3, W6**              |
| A8 (solidColor spike) | The `solidColor`-with-no-`img` render is correct-by-reading but **unproven live in this repo**. Add a **W1.5 spike**: prove `new Object2d({solidColor, width, height})` renders a filled, z-sorted rect _before_ declaring it the permanent fallback — the whole "only pixels are gated" bet depends on it.                                                                                                                                                                             | **W1.5**                   |
| A9 (CI guard early)   | Move the gold/stat-write CI grep guard to **W1** (10-line test) so the "physically unreachable" claim holds from the first commit.                                                                                                                                                                                                                                                                                                                                                      | **W1**                     |
| A10 (applyArt seam)   | Spawn every object through one `applyArt(obj, slot)` indirection in M1 (solid branch only) so M2's loader merely extends it — keeping the founder flip genuinely one-field, not a retrofit.                                                                                                                                                                                                                                                                                             | **W2/W3 → W8**             |
| A11 (author once)     | The `frames` loader and `DOGE-ART-HANDOFF.md` are each authored **once** (loader in M1 W3; doc drafted W5 → freeze-measure W9 → read-through W13), not re-implemented per month.                                                                                                                                                                                                                                                                                                        | **M1–M3 tags**             |
| A12 (coverageCopy)    | `coverageCopy` is authored copy — fine and rule-7-safe — **but any number in it ("Avg DV 22%") must be derived live from `pct`, never literal.** CI asserts no hard-coded digit that isn't a `${pct}` interpolation.                                                                                                                                                                                                                                                                    | **W1, W6**                 |
| A13 (reduced-motion)  | There is **no** host→iframe reduced-motion channel. The iframe reads its own `window.matchMedia('(prefers-reduced-motion: reduce)')` directly (no plumbing needed) and **branches the JS animation** (CSS alone won't stop it).                                                                                                                                                                                                                                                         | **W5**                     |
| A14 (VRT scope)       | Pixel-VRT against procedural placeholders churns and catches nothing. Scope VRT to **stable** surfaces (drill-card layout, focus ring, flag-off control) + **layout-box** assertions (object bbox via projection, not pixels); gate sprite-era pixel-VRT behind real art.                                                                                                                                                                                                               | **W11/W12 tags**           |
| A15 (HUD handoff)     | The legacy HUD's `syncHudVisibility` probes `elementFromPoint(w/2, h*0.62)` — a proxy/caption over that point silently breaks it. Make the HUD↔room handoff a **single source-of-truth flag**, not two DOM probes; test that proxies never change the probe result.                                                                                                                                                                                                                     | **W1/W2 → W13**            |
| A16 (typecheck path)  | `pnpm build` runs `validate:data && typecheck && next build`; the new `.ts` mirror is type-checked repo-wide regardless of imports — it must compile standalone from day one or it blocks _every_ commit.                                                                                                                                                                                                                                                                               | **W1 note**                |

---

## 4. Month 1 — Foundation + the diegetic-object ENGINE

**End state:** the entire interactive diegetic room _works_ with placeholder art — 9 individually-selectable, drillable, keyboard-reachable, live-bound objects; one working `doge:logWater` action; numberless in-world value + on-demand drill (rule 13); dark-navy theme; full-bleed composition; the pointer-ownership + open_main_menu mechanism _proven live_; coordinate projection handled in both fullscreen and embedded views. Flag OFF → production byte-identical. Stat loop + gold wall physically unreachable. `pnpm build`+`test`+`lint` green throughout.

**Standing weekly invariants:** flag-guard early-return; read-only + `doge:logWater` reuse; pointer-ownership contract; cached-parse on the 400ms tick (never per-frame); SW-unregister before every "verified live"; commit to main after each edit.

### Week 1 — Manifest contract, binding layer, CI guard rails

Nothing renders; everything is provably correct in isolation.

- **[AUTO]** `room-manifest.ts` + JS mirror (`window.SOUS_ROOM_MANIFEST`) — full types + the authored manifest, **9 metric/companion slots** (A6) in fixed order, `petWindow` present-unused, every `art.kind:"solid"` / layer `procedural` (the fields the artist flips). Compiles standalone (A16).
- **[AUTO]** `readRoomBinding(payload, slot)` (TS+JS) → `{pct, word, detailText|coverageText, meals?}`; `detailUnit` present ⇒ `value/target`; absent ⇒ `coverageCopy`, **never** a fabricated number (rule 7); parse wrapped try/catch → `null` (A7).
- **[AUTO]** `room-manifest.test.ts` (the rule-7 + shape guard): statKeys valid + ordered; anchors ∈ 0–96; sizes/hitboxes > 0; **mood & vitamins have no `detailUnit` AND a non-empty `coverageCopy` whose digits are only `${pct}` interpolations** (A12); only hydration has `action:"water"`; `.ts`↔`.js` parity snapshot.
- **[AUTO]** **gold/stat-write CI grep guard** (A9) — fails the build on any write path in `room-objects.js`, live from commit 1.
- **[AUTO]** Single HUD↔room source-of-truth flag stub (A15), replacing the dual DOM probe.

### Week 1.5 — `solidColor` render spike (A8)

- **[AUTO]** Prove `new Object2d({solidColor, width, height})` with no `img` renders a filled, z-sorted rect live in the iframe. Until green, "procedural = permanent fallback" is provisional. This de-risks the entire bet in two days.

### Week 2 — `spawnRoomObjects()`: real engine objects on screen, flag-gated

- **[AUTO]** `room-objects.js` `spawnRoomObjects()` — flag-guarded; on `home` only, iterates the manifest, spawns each slot via one **`applyArt(obj, slot)`** indirection (A10, solid branch), auto-registering into the Drawer. Every object has explicit `width/height` (A7).
- **[AUTO]** `index.html` load order (after `sous-bridge.js`); idempotent spawn/despawn on scene enter/leave, latched against the 400ms-tick double-spawn interleave (P2.4).
- **[AUTO]** **Rising-edge click detector** (P0/A1) — per-object `wasDown`; the logical "click" fires only on `!wasDown && isDown`. _This lands in W2, before any action wiring, because every later week depends on it._
- **[AUTO]** Color-coded **debug** rects (throwaway — deleted once fills land, A11/C2) at each anchor; z-depth via the furniture y-formula so the dog occludes / is occluded.
- **Verify:** flag-OFF → zero new objects, HUD identical, no console errors (the no-regression gate). Flag-ON → 9 rects at anchors; walk the dog → occlusion both ways; scene-switch → spawn-once; menu open/close → no leak; 60fps holds.

### Week 3 — Live data binding + numberless value-fill

- **[AUTO]** Cached snapshot invalidated on the **400ms tick / `storage` event** (A5); `onDraw` reads only the cache (dev assertion throws on a per-frame parse).
- **[AUTO]** `fill.mode:"level"` (rect bottom→top, Drawer.js:204) and `"clip"` (native liquid mask, Drawer.js:144) procedural fills — **the permanent fallback** (A11/C2, distinct from W2's debug rects). The `frames` loader is **authored once here** (A11/C3), inert until a strip exists.
- **[AUTO]** Color-band runtime (red <40 / amber 40–70 / green ≥70, from `fill.band`), matching the HUD `pctColor`.
- **[AUTO]** Energy & Mood as **two independent objects** (A6), each filling from its own statKey. Feed companions render `meals[]` (bag label + notebook rows), header = `status`, all from one source.
- **Verify:** fills track `pct` live (log a meal → fill moves next tick); bands correct at boundaries; empty + **loading** states distinct (A7); changing only energy moves only energy; **no painted number anywhere in-world** (rule 13); zero `JSON.parse` in the draw path.

### Week 4 — Selection, drill, a11y, the action, theme + composition (the depth week)

- **[AUTO]** Hover → `showOutline('#7CE0E6')` + caption word. **Select → a distinct cyan selection frame / corner-bracket (P0/A3), NOT the debug-red wash**; drill card anchored via `projectWorldToCss()` that branches fullscreen-vs-embedded (P0/A2); `roomSelected` persists across re-render.
- **[AUTO]** Drill content per the binding map (exact `value/target` for the 4 detail metrics; **coverage copy for mood/vitamins, never value/target**); hydration's card carries **"Log a glass"** → `post("doge:logWater")` — and via the W2 edge-detector it fires **exactly once per tap** (P0/A1).
- **[AUTO]** 9 focusable `role="button"` proxies (Tab = manifest order); every state wired incl. **loading** (A7); occlusion meaning in each `aria-label`; focus model (Esc closes, blur behavior, tab position vs. game chrome) specified.
- **[AUTO]** **Pointer-ownership + `open_main_menu` mechanism proven live** (P0/A4): a room-object click does **not** open the menu; empty-background click still does. Verified, not assumed.
- **[AUTO]** Dark-navy HUD theme (extend `injectHudStyle`); full-bleed composition; recompute projection on resize/scroll/fullscreen; with the flag ON, demote the legacy HUD via the single source-of-truth flag (A15).
- **Verify (Month-1 demo):** flag ON → 9 objects each hoverable + selectable + drillable + live-bound, one working action (gold/stats unchanged before/after), full keyboard path, placeholder art only. Flag OFF → byte-identical. All green.

### Week 5 — Hardening, art-handoff **draft**, rung-1 sign-off

- **[AUTO]** `docs/DOGE-ART-HANDOFF.md` **draft** (A11/C9) with placeholder measurements; flag-on layout screenshot; resize/scroll/fullscreen + HUD-demotion closeout; a scripted **drop-in dry run** (flip one slot `solid→sprite` against a 1×1 test PNG, zero other change) proving the founder seam before any real art exists.

**Month-1 exit:** flag-gated complete diegetic room with placeholder art; the four P0s designed + tested (not hand-waved); founder seam proven by a live dry run; production unchanged flag-off; all green.

---

## 5. Month 2 — Depth + fidelity scaffolding; the art contract made real

**End state:** every object is its own first-class selectable with **hover/focus/selected/empty/loading/error** wired on **both** the engine AABB and the DOM proxy; per-object **animated fill** (`level`/`clip`, `frames` proven on a synthetic strip); the **speech-bubble + spiral-notebook** composites ship; the **`AssetLoader`** swaps placeholder→real sprite **one slot at a time** with graceful fallback; the manifest is frozen + measured; the handoff doc + labeled screenshot make every founder drop a one-line integration; a regression matrix locks the contract.

- **Week 5 — Fill-state engine:** `FillRenderer` (`level`/`clip` liquid mask + meniscus; `frames` loader reused from M1 W3, A11/C3); color-band runtime; **fill animation** lerped ~250ms, **snapped under the iframe's own `matchMedia` reduced-motion** (A13). Tests: band boundaries, fill math, reduced-motion snap on frame 1.
- **Week 6 — Full state matrix on both surfaces:** per-object hitboxes incl. the **two-object bubble** (A6); hover/selected/empty/**loading**/error each wired + announced; drill per object; **mood/vitamins never produce a value/target in any state** (rule-7 guard asserted across all states). Pointer-ownership enforced + tested.
- **Week 7 — Composites:** `SpeechBubble` (frame + tail hosting the two independent Energy/Mood objects, z-sorted so the dog occludes it); `SpiralNotebook` (header = `status`, one row per meal reusing the existing `extra = meals.length - shown.length` count, A18/P2.6, each row independently hoverable); protein **food-bag** companion (same `meals[]`, stays in sync); **decor slots reserved** (poster/shelf/bed/window/rug/toys) binding to nothing.
- **Week 8 — The drop-in loader:** `AssetLoader` extends `applyArt` (A10) — `solid`→procedural, `sprite`→`setImg` (idempotent, async, **width/height always set so the load race can't deref** — P1.5); **graceful fallback** on `onerror` → revert to procedural + one warning (never a broken-image box); activate `frames` against a synthetic strip; `?roomart=<slot>:<path>` dev swap; `scene-image` layer loader (tagged **AUTO-BUILD, unproven-until-spike** — distinct from the proven `scene.home.image` string swap, A/C6); content-hash cache-bust note (SW gotcha).
- **Week 9 — Freeze + handoff (real) + regression lockdown:** `DOGE-ART-HANDOFF.md` **freeze-measured** (A11/C9) against the live layout; manifest frozen (`version:1`, all anchors/hitboxes/fillBoxes validated); **regression matrix** asserting — for every slot × {normal,hover,focus,selected,empty,loading,error} × {level,clip,frames} × {solid,sprite} — bind correctness, numberless-in-world, mood/vitamins-no-detail, pointer-ownership, and flag-off no-op; a deliberate contract violation in a test branch must **fail** the suite.

**Month-2 exit:** all objects individually selectable + drillable with every state wired on both surfaces; animated fills; composites + meals-sync; one-slot-at-a-time drop-in with graceful fallback; frozen manifest + real handoff doc; contract-lock regression matrix. Flag-off byte-identical; stat loop + gold wall untouched.

---

## 6. Month 3 — Integration, art drop-in choreography, production hardening

**End state:** the room is _indistinguishable from the reference the moment art lands_, and everything that is not painted pixels is done, wired, and verified live.

- **Week 9 — Asset-ingestion proven end-to-end** with a disposable **synthetic UI-primitive PNG** (flat swatch + 5-cell ramp — _not_ dish/room art; same allowance as the existing `red_pixel.png`; lives in `__fixtures__/`, **never referenced by the shipped manifest** — CI-asserted, A/C10). A committed `diff` snapshot proves the only difference between "synthetic art" and "real art lands" is the manifest `art.*`/`fill.spritesheet` strings — **zero runtime-logic diff**. The gold/stat-write CI guard (from W1) runs every week.
- **Week 10 — Responsive + perf:** `projectWorldToCss` recompute on resize/orientation/scroll/fullscreen with rAF coalescing (P0/A2); device matrix incl. **iPhone SE 375×667** (rule-10 no-scroll gate); 60fps with all objects (DevTools + `fpsInterval`), zero per-frame parse; DPR / `image-rendering:pixelated` crispness.
- **Week 11 — Depth + compositing:** z-choreography so the dog sits **on** the rug, **behind** the bottle, **in front of** the bed (verified at 3 pet-x positions); edge-bleed re-sampled after spawn; the **decorative** heart bubble kept visually + behaviorally distinct from the **data** Mood/Energy bubble; toys/decor placed as inert `sprite` slots; P4 pet-window composite stays reserved behind `petWindow` (spike-gated only). VRT scoped to layout boxes, not procedural pixels (A14).
- **Week 12 — A11y audit + VRT/e2e harness (built from zero — neither exists in the repo today):** full keyboard + SR pass (every state announced, reduced-motion honored); **automated** pointer-ownership/`open_main_menu` check; Playwright `toHaveScreenshot` baselines for stable surfaces + the flag-off control; e2e for the full loop (spawn → keyboard-select → drill matches payload → "Log a glass" → bottle rises → flag-off restores HUD); axe scan (zero serious/critical).
- **Week 13 — Docs + staged rollout:** `DOGE-ART-HANDOFF.md` **read-through** (A11/C9); the rollout ladder executed — (1) flag-on procedural on main; (2) `?roomart` proves the swap; (3) **flip default-on** behind one `ROOM_OBJECTS_DEFAULT` constant + a live design-pass sign-off; (4) reserved P4 escalation — each rung independently revertable, instant rollback (flag clear / one-line revert / GitHub revert) rehearsed; two-text-surface reconciliation final; full `pnpm verify` + the whole Playwright suite green on main.

**Month-3 exit:** ingestion proven with a synthetic sprite (real art = one-file drop); 60fps + drift-free projection across the device matrix; pet z-composites correctly among toys; complete a11y; brand-new VRT + e2e + axe green; handoff doc + screenshot finalized; staged rollout executed with instant rollback. The stat loop + gold wall were never touched; main stayed shippable and flag-off-identical the entire time.

---

## 7. Risks (carried forward honestly)

1. **Fidelity ceiling is real.** 96×96 raster, no zoom. Placeholders look like a debug overlay; even post-art it is charming-pixel, not Stardew-DPI. _Mitigation:_ ship the **system** now, gate the **look** on the artist, and **never** claim we render the reference autonomously (rule 7). Every "the room is live" milestone reads "the **system** is complete; the **room look** is the legacy backdrop until the portrait PNG lands" (P2.2) — the system is what is auto-buildable.
2. **The four P0 integration realities** (60fps click auto-repeat, projection in the embedded view, the selection-chrome artifact, the canvas `open_main_menu`) are designed + tested in **W2–W4**, not deferred to "verify live."
3. **SW cache** — game-bundle edits won't appear until the `/tamaweb/` service worker is unregistered; `pnpm build` is the real gate.
4. **Two text surfaces** — when room-objects is on, the legacy HUD is demoted via a single source-of-truth flag so rule 6/13 info-density doesn't regress (A15).

## 8. Definition of done (the bar this plan is held to)

A founder drops six PNGs (room + 6 object sprites) and three fill-strips into named paths, flips `art.kind`/`scene.image`/`fill.mode` in one manifest, busts the SW cache — and the screen becomes the reference: a diegetic, full-bleed, dark-navy-chromed pixel room where the hydration bottle's liquid _is_ your water, the kibble bowl _is_ your protein, the spiral notebook _is_ your feed log, and **every object is individually hoverable, selectable (with a real object-box), drillable to its exact number, and keyboard-reachable** — with zero line of logic changed, the stat loop and gold wall never touched, and `pnpm build` + `pnpm test` green the entire way.

---

_Plan authored 2026-06-21 from a multi-agent design effort (4 architecture proposals scored + synthesized → 3-month draft → 2 adversarial review passes, all facts verified against live `Drawer.js`/`Object2d.js`/`App.js`/`sous-bridge.js`). See `docs/DOGE-ROOM-FRAMING-PRD.md` for the framing-ceiling RCA this supersedes._
