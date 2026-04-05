# NOURISH Meal Pairer — Project documentation

> **Audience:** Developers and AI agents in this repository. **Purpose:** Describe how the app works, where important code and data live, and **track development progress** in one place. For **next-stage product planning** (prototype toward the full Sous platform), use **`planning.md`**. For **pairing logic, scoring, and refreshing engine data**, use **`PIPELINE.md`**. Broader product vision and target architecture are sketched in **`claude.md`** (that document may describe stack and folders not yet present in this prototype).

---

## How to maintain this document

After shipping a change:

1. Update **Implementation status** (below). Add a row if you introduce a new tracked deliverable.
2. Append a dated line to **Progress log**.
3. If pairing data, scoring, or regeneration steps change, update **`PIPELINE.md`** as well.

---

## 1. Product snapshot

Single-purpose **NOURISH Meal Pairer**: the user searches for a main dish and receives **three** suggested sides, with swap and reroll. Built with **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4**, **Framer Motion**, and **Fuse.js** for fuzzy search. Static meal and side catalogs live under `src/data/`; engine-ranked pairings ship as **`src/data/pairings.json`** (see `PIPELINE.md`). Strong emphasis on motion, accessibility (`useReducedMotion`), and mobile-specific result layouts.

---

## 2. Tech stack (this repository)

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16, TypeScript |
| UI | React 19, Tailwind 4, Framer Motion |
| Search | Fuse.js (client-side meal fuzzy match) |
| Data | JSON modules (`meals.json`, `sides.json`, `pairings.json`) |
| Analytics | Vercel Analytics / Speed Insights (see `src/lib/analytics.ts`) |

---

## 3. Repository map (high level)

| Path | Role |
|------|------|
| `src/app/page.tsx` | Main experience: stages, modals, verified toggle wiring |
| `src/app/layout.tsx`, `globals.css` | Shell and global styles |
| `src/data/` | `meals.json`, `sides.json`, `pairings.json`, `pairings.ts`, `sideBridge.ts`, `index.ts` |
| `src/lib/pairingEngine.ts` | Ranked vs random side selection, swap, verified filter |
| `src/lib/fuzzySearch.ts` | Meal search; respects verified filter |
| `src/lib/scoreColor.ts` | Heatmap and tier badge colors |
| `src/hooks/usePairing.ts` | Session state: `rankOffset`, `usedSideIds`, reroll/swap |
| `src/hooks/useMealSearch.ts` | Search + submit flow |
| `src/hooks/useSavedPairings.ts` | localStorage saved pairings |
| `src/components/search/` | `SearchInput`, `SearchDropdown`, chips |
| `src/components/results/` | `ResultsStage`, `HeroDish`, `SideDishCard`, `SideDishCardMobile`, `HoverCard`, `DishDetailModal`, `BalanceIndicator`, share/plate modals |
| `src/components/layout/` | `Navbar`, `AboutModal`, `SavedPairingsModal`, `SpinWheel` |
| `src/components/heatmap/` | Heatmap UI (e.g. `HeatmapModal.tsx`) |
| `src/app/api/heatmap/`, `api/search/` | API routes as implemented |
| `src/types/index.ts` | `Meal`, `SideDish`, `PairingScore`, etc. |

---

## 4. How the application works

### 4.1 User flow

1. **Search** — User types or picks a meal; Fuse.js suggests matches; selecting a meal starts pairing.
2. **Results** — Hero main + three sides; desktop uses circular cards; **mobile** uses stacked cards with scroll-triggered motion.
3. **Interactions** — Reroll (new triple), per-side **swap**, detail **modal**, **hover card** (fine pointer only), **save pairing**, optional **share plate** flows.
4. **Heatmap** — Opened from **About**; explores engine matrix (Indian mains covered by Python export).
5. **NOURISH Verified** — Navbar toggle filters meals/sides/ranked lists; persisted in `localStorage`.

### 4.2 Pairing selection

- **`getRankedSidesForMeal(mealId)`** (`src/data/pairings.ts`) returns ordered scores when the meal exists in the engine export; **`pairingEngine.selectSides`** walks that list with a **`rankOffset`** (advanced on reroll/swap via **`usePairing`**). Sides already used in the session are skipped.
- If there is **no** ranked data, **`meal.sidePool`** is shuffled (Fisher–Yates style) for curated mains.
- **`sideBridge.ts`** aligns Python engine side names to app `sides.json` ids.
- **`PairingScore`** attaches **reasons** and **tier** to cards when ranked.

### 4.3 Reduced motion

Components respect **`useReducedMotion`**; spawn/exit simplifications apply when the user prefers reduced motion.

---

## 5. External pairing engine (source of truth for scores)

The heuristic Python scorer and spreadsheet-style tooling live outside this repo (e.g. `~/Documents/New project/`): `pairing_system.py`, exported **`pairings.json`**, and optional local docs. **Regeneration and scoring semantics** for the copy consumed by this app are documented in **`PIPELINE.md`**.

---

## 6. Implementation status

| Phase | Item | Status |
|-------|------|--------|
| Phase 1A | Kill idle animations | ✅ Complete |
| Phase 1B | Surface pairing rationale | ✅ Complete |
| Phase 2A | Fix CTA color | ✅ Complete |
| Phase 2B | Serif accent typography | ✅ Complete |
| Phase 2C | Replace logo with NOURISH | ✅ Complete |
| Phase 2D | Refine spawn glow ring | ✅ Complete |
| Phase 3A | Remove 3D parallax | ✅ Complete |
| Phase 3B | Pool exhaustion feedback | ✅ Complete |
| Phase 3C | Smart shimmer bypass | ✅ Complete |
| Phase 3D | Enrich detail modal | ✅ Complete |
| Phase 4A | Exit animation polish | ✅ Complete |
| Phase 4B | Stacked side dish layout (mobile) | ✅ Complete |
| Phase 4C | Scroll-triggered results (mobile) | ✅ Complete |
| Phase 5A | Typeahead search preview | ✅ Complete |
| Phase 5B | Contextual hover cards | ✅ Complete |
| Phase 6A | Save & share pairings | ✅ Complete |
| Phase 6B | Nutritional balance indicator | ✅ Complete |
| Phase 7A | Import pairing data | ✅ Complete |
| Phase 7B | Ranked side selection engine | ✅ Complete |
| Phase 7C | Side name & ID bridging | ✅ Complete |
| Phase 7D | Pairing reason display | ✅ Complete |
| Phase 8A | Heatmap data layer | ✅ Complete |
| Phase 8B | Heatmap component | ✅ Complete |
| Phase 8C | About → Heatmap entry point | ✅ Complete |
| Phase 8D | Heatmap score color utility | ✅ Complete |
| Phase 9A | Verified data schema | ✅ Complete |
| Phase 9B | Verified toggle UI | ✅ Complete |
| Phase 9C | Verified badge on cards | ✅ Complete |
| Phase 10 | Recipe integration | 🔲 Future |

---

## 7. Progress log

| Date | Notes |
|------|-------|
| 2026-04-04 | Renamed `planning.md` → `documentation.md` and restructured for agent/developer orientation; forward roadmap lives in `planning.md` (formerly `planning2.md`). |

---

## 8. Future work (from Phase 10)

- **Recipe links** — Wire "View recipe" to external search, an API, or internal pages.
- **Meal planning** — Weekly plans, grocery lists, calendar views.
- **Accounts** — Server-side preferences and history (vs localStorage-only features today).

---

## Appendix A — Priority matrix (historical planning)

| Impact | Effort | Item |
|--------|--------|------|
| High   | Low    | 4A: Exit animation polish |
| High   | Medium | 4B: Stacked side dish layout (mobile) |
| Medium | Low-Med| 4C: Scroll-triggered results (mobile) |
| High   | Medium | 5A: Typeahead search preview |
| Medium | Medium | 5B: Contextual hover cards |
| Medium | Med-Hi | 6A: Save & share pairings |
| Low    | Medium | 6B: Nutritional balance indicator |
| High   | Medium | 7A: Import pairing data |
| High   | Med-Hi | 7B: Ranked side selection engine |
| Medium | Medium | 7C: Side name & ID bridging |
| Medium | Medium | 7D: Pairing reason display |
| High   | High   | 8A-D: Heatmap visualizer |
| Medium | Medium | 9A-C: NOURISH Verified toggle |
| High   | High   | 10A-C: Recipe integration (future) |

---

---

## Appendix B — Phase dependency graph

```
Phase 7A (import data) + 7C (side bridge)
    ↓
Phase 7B (ranked engine)
    ↓
Phase 7D (reason display)
    ↓
Phase 8A (heatmap data) ← uses same pairings.ts
    ↓
Phase 8D (color utility)
    ↓
Phase 8B (heatmap component)
    ↓
Phase 8C (about entry point)

Phase 9A (verified schema) — independent, can start any time
    ↓
Phase 9B (verified toggle) — depends on 9A
    ↓
Phase 9C (verified badges) — depends on 9A
```

Phases 7 and 8 are sequential. Phase 9 is independent and can be
started in parallel with Phase 8 once Phase 7 is complete.

---

---

## Appendix C — Feature specifications (reference)

> Original phased specs (IDEO-oriented). **Phases 4–9 are implemented** in this prototype unless you find otherwise in code; treat this appendix as design rationale and file-level hints. Names may differ slightly (e.g. heatmap component filename).

## Phase 4 — Animation Polish & Mobile Layout

Quick, focused improvements to animation consistency and mobile usability.
Low-medium effort, high visual impact.

### 4A. Exit Animation Polish

**Problem:** Side dishes currently exit with a uniform scale-down-and-fade
regardless of where they entered from. A card that spawned from the lower-left
exits in the same generic way as one from the upper-right. This breaks spatial
consistency and makes the exit feel arbitrary rather than intentional.

**Changes:**

- `SideDishCard.tsx` — Modify `getSpawnVariants` so the `exit` state mirrors
  the `initial` state for each directional origin. If a card entered from
  `{ x: -100, y: 60, rotate: -25 }`, it exits back toward that same origin:
  `{ x: -80, y: 50, rotate: -20, scale: 0.3, opacity: 0 }`.
- Keep the staggered exit timing (`staggerDirection: -1`) from `ResultsStage`.
- The exit trajectory should be slightly shorter than the entry (80% distance)
  so exits feel snappy rather than a slow retreat.
- `useReducedMotion` users: exit remains `{ opacity: 0 }` (no direction).

**Files:** `SideDishCard.tsx`
**Effort:** Low

### 4B. Stacked Side Dish Layout (Mobile)

**Problem:** On mobile, 3 side dishes render as tiny circles in a tight
`grid-cols-3` row. The images are 96px, the dish names truncate, and pairing
reasons are nearly unreadable. Tap targets are small. Desktop layout works
well — mobile needs a fundamentally different approach.

**Changes:**

- Add a mobile-specific layout variant in `ResultsStage.tsx` that replaces the
  `grid-cols-3` with a vertical stack of horizontal cards.
- Each mobile card: `flex-row` layout with a 64px circular image on the left,
  a text stack on the right (dish name in serif, pairing reason below, swap
  icon at far right).
- Use responsive classes: `md:hidden` for mobile cards, `hidden md:grid` for
  the existing circle grid.
- Spawn animations adapt: mobile cards slide in from the left with staggered
  delays rather than directional spawns from various angles.
- Each card is a full-width tap target opening the detail modal.
- The swap button moves from an overlay circle to an inline icon button on
  the right edge of the card.

**Files:** `ResultsStage.tsx`, new `SideDishCardMobile.tsx` component (or
responsive variant within `SideDishCard.tsx`)
**Effort:** Medium

### 4C. Scroll-Triggered Results (Mobile)

**Problem:** On mobile, when results load, all side dish cards spawn their
animations simultaneously — even the ones below the viewport fold. The user
sees the first card animate but misses the others. When they scroll down,
cards are already static and the spawn delight is lost.

**Changes:**

- In the mobile layout only, wrap each side dish card in a viewport-aware
  animation trigger using Framer Motion's `whileInView` prop.
- Cards remain invisible (`opacity: 0, y: 20`) until they enter the viewport,
  then play their spawn animation.
- Use `viewport={{ once: true, amount: 0.3 }}` so the animation fires once
  when 30% of the card is visible.
- Desktop layout is unaffected — all cards are visible in the viewport and
  spawn simultaneously as before.
- The hero dish always spawns immediately regardless of device.

**Files:** `ResultsStage.tsx`, `SideDishCard.tsx` (or `SideDishCardMobile.tsx`)
**Effort:** Low-Medium

---

## Phase 5 — Search & Discovery

Reduce friction in the search flow and add information-on-demand without
requiring modal commitment.

### 5A. Typeahead Search Preview

**Problem:** The current search flow is: type meal name → click "Pair my meal"
→ wait for results. Three steps. If the user misspells or types a partial name,
they get an error state and must try again. The suggestion chips help, but only
for 6 pre-selected meals.

**Changes:**

- New `SearchDropdown.tsx` component rendered below `SearchInput`.
- As the user types (debounced 150ms), run Fuse.js fuzzy search on the client
  against the full meals list. Show up to 4 matching meal names in a dropdown.
- Each dropdown item shows: meal name (serif) + cuisine label (pill badge).
- Clicking a dropdown item immediately triggers the pairing — bypasses the
  submit button entirely. Two steps instead of three.
- Arrow keys navigate the dropdown. Enter selects the highlighted item.
- Escape closes the dropdown and returns focus to the input.
- Dropdown dismisses on blur, on Escape, or when results load.
- Import meals data client-side (it's a small JSON — 22 entries).

**Files:** New `SearchDropdown.tsx`, `SearchInput.tsx` (integrate dropdown),
`page.tsx` (wire up selection handler), client-side Fuse.js instance
**Effort:** Medium

### 5B. Contextual Hover Cards

**Problem:** Side dish cards show the name and pairing reason, but tags,
description, and detailed info require opening the full modal. The modal is a
commitment — it obscures the full pairing view. Users exploring options want
quick-glance info without context-switching.

**Changes:**

- New `HoverCard.tsx` component: a compact floating card that appears on
  300ms hover over a `SideDishCard`.
- Content: dish description (2 lines max), tag pills, and a "Swap" action link.
- Positioning: appears above the card on desktop, anchored to the card's center.
  Uses `position: absolute` relative to the card container.
- Enter animation: `opacity: 0, y: 4 → opacity: 1, y: 0` (150ms).
- Exit: fades out on mouse leave with 200ms delay to allow cursor to enter
  the hover card itself (preventing flicker).
- Does NOT appear on touch devices — the modal is the right pattern for mobile.
  Gate with `@media (hover: hover)` or a `useIsTouchDevice` check.
- Includes the same "Swap this side" button as the modal, for inline action.

**Files:** New `HoverCard.tsx`, `SideDishCard.tsx` (add hover trigger logic)
**Effort:** Medium

---

## Phase 6 — Engagement & Data Depth

Features that add return-visit motivation and informational value.

### 6A. Save & Share Pairings (localStorage)

**Problem:** Every pairing is ephemeral. Users discover a great combo, leave
the page, and it's gone. There's no reason to return. The app is a one-shot
tool rather than a growing personal collection.

**Changes:**

- New `useSavedPairings.ts` hook:
  - `savePairing(meal, sides)` — serializes to localStorage as JSON array.
  - `getSavedPairings()` — returns all saved pairings.
  - `removePairing(id)` — removes by generated ID.
  - Max 20 saved pairings. Oldest auto-removed on overflow.
  - Each saved pairing stores: meal name, meal image URL, side names, side
    image URLs, timestamp, and a generated UUID.

- **Save button** on `ResultsStage.tsx`:
  - A bookmark icon (outline → filled on save) appears near the reroll button.
  - On click: saves current pairing, icon fills with a brief plop animation,
    shows a toast-like "Pairing saved" confirmation that fades after 2s.
  - If already saved, shows filled icon + "Saved" label.

- **Saved Pairings view** via `Navbar.tsx`:
  - "Saved" link appears next to "About" in the navbar (hidden if no saves).
  - Opens a `SavedPairingsModal.tsx` — full-screen on mobile, modal on desktop.
  - Each saved pairing renders as a compact card: meal name (serif) + 3 tiny
    side dish thumbnails in a row + relative timestamp ("2 days ago").
  - Tap a saved pairing to load it into the main view (re-runs the search).
  - Swipe-to-delete on mobile, hover-reveal delete icon on desktop.

**Files:** New `useSavedPairings.ts` hook, new `SavedPairingsModal.tsx`,
`ResultsStage.tsx` (save button), `Navbar.tsx` (saved link)
**Effort:** Medium-High

### 6B. Nutritional Balance Indicator

**Problem:** Users choose sides based on taste pairing, but there's no
visibility into whether the overall meal is balanced. Three starch sides
taste great together but miss the mark nutritionally. A gentle visual cue
can inform without being prescriptive.

**Changes:**

- Add `nutritionCategory: "protein" | "carb" | "vegetable"` to each side
  dish in `sides.json` and `types/index.ts`.
- New `BalanceIndicator.tsx` component:
  - Renders 3 small colored dots in a row: green (vegetable), amber (carb),
    red/warm (protein).
  - Each dot is filled if at least one current side dish has that category.
    Unfilled dots are outlined/grey.
  - If all 3 are filled: subtle "Balanced" label appears below in green.
  - Non-judgmental — no warnings or negativity. Purely informational.
- Position: below the reroll/shuffle button area, inline with the results.
- Fade-in animation: appears 0.8s after results spawn, `opacity 0 → 1`.
- Tooltip on hover: "Your sides include [categories present]."

**Data scope:** All ~60 side dishes need a `nutritionCategory` field added.

**Files:** `sides.json`, `types/index.ts`, new `BalanceIndicator.tsx`,
`ResultsStage.tsx` (render indicator)
**Effort:** Medium

---

## Phase 7 — Pairing Engine Integration

Replace the random Fisher-Yates side selection with a deterministic,
ranked pairing system powered by the Python pairing engine. Uses **Option A**: precompute `pairings.json` at build time and consume it as static data in the frontend (see **§ 4.2** and **`PIPELINE.md`**).

### Source Reference

The pairing engine lives at `~/Documents/New project/`:

- `pairing_system.py` — Core scoring engine (1808 lines). 14 Indian
  mains × 66 sides = 924 deterministic pairings. Base score 24,
  clamped 0–100, with tier mapping (excellent ≥85, strong ≥70,
  good ≥55, experimental ≥40, low <40).
- `pairings.json` — Pre-computed full matrix output.
- **`PIPELINE.md`** — How scores work and how to refresh data in this repo.

### Catalog Gap Analysis

The Python engine covers **14 Indian mains** and **66 Indian sides**.
The Next.js app currently has **22 global-cuisine mains** and **87
sides** spanning Italian, Japanese, Mexican, American, Mediterranean,
Thai, Vietnamese, Korean, Chinese, and Indian cuisines.

Only **Chicken Biryani** exists in both catalogs. The 3 other Indian
mains in the Next.js app (Butter Chicken, Chicken Tikka Masala) are
present but use different naming. The remaining 8+ non-Indian mains
have no Python engine coverage.

**Strategy:** For the Indian mains covered by the engine, use ranked
pairings from `pairings.json`. For non-covered mains, retain the
existing `sidePool`-based selection but add a `ranked: false` flag
so the UI can distinguish engine-ranked from curated-random pairings.

### 7A. Import Pairing Data

**Goal:** Bring the pre-computed `pairings.json` into the Next.js app
as a static data module, alongside the existing `meals.json` and
`sides.json`.

**Changes:**

- Copy `pairings.json` from `~/Documents/New project/` into
  `src/data/pairings.json`.
- Create a `src/data/pairings.ts` adapter module:
  - Import `pairings.json` (the raw `{ "Main Name": [...] }` map).
  - Normalize main names to match the Next.js `meals.json` IDs. Build
    a lookup: `mainNameToId` mapping engine main names → app meal IDs.
    For example `"Chicken Biryani" → "chicken-biryani"`.
  - Normalize side names to match the app's `sides.json` IDs. Build a
    lookup: `sideNameToId` mapping engine side names → app side IDs.
  - Export a `getRankedSidesForMeal(mealId: string)` function that
    returns an ordered array of `{ sideId: string; score: number;
    tier: string; reasons: string[] }` sorted descending by score.
  - If a meal has no engine data, return `null` (signals: use fallback
    random selection).
- Add TypeScript types: `PairingScore` interface in `types/index.ts`.

**Mapping challenge:** The engine has 66 sides, the app has 87. Many
engine sides (e.g. "Phulka (Roti)", "Instant Pot Jeera Rice") don't
exist in the app's `sides.json`. Only sides present in BOTH catalogs
will appear in ranked results. Sides exclusive to the app's catalog
for a meal remain in the random pool as fallback.

**Files:** New `src/data/pairings.json`, new `src/data/pairings.ts`,
`src/types/index.ts` (add `PairingScore`)
**Effort:** Medium

### 7B. Ranked Side Selection Engine

**Goal:** Replace `pairingEngine.ts` to serve sides in ranked order,
descending through the scored list on each reroll.

**Changes:**

- Rewrite `selectSides()` in `pairingEngine.ts`:
  - First, check if `getRankedSidesForMeal(meal.id)` returns data.
  - **If ranked data exists:**
    - On initial load: return the top 3 highest-scored sides that
      exist in the app's `sides.json`.
    - Track a `rankPointer` (offset into the ranked list) per meal
      session. Starts at 0, advances by 3 on each reroll.
    - On reroll: advance pointer by 3, return next 3 ranked sides.
    - On single-side swap: advance pointer by 1, return next ranked
      side for that slot.
    - When the ranked list is exhausted, wrap around or signal pool
      exhaustion (reuse existing `poolExhausted` UX from Phase 3B).
  - **If no ranked data (non-Indian mains):**
    - Fall back to current Fisher-Yates random selection from
      `meal.sidePool`.
- Rewrite `swapOneSide()` to follow the same ranked-then-fallback
  logic.
- The `exclude` set (used IDs) still applies — skip sides already
  shown in this session.

**State management:** The `rankPointer` lives in the `usePairing`
hook or `page.tsx` state alongside `usedSideIds`. It resets to 0
when the user searches for a new meal.

**Files:** `src/lib/pairingEngine.ts` (rewrite), `src/app/page.tsx`
(add rank pointer state)
**Effort:** Medium-High

### 7C. Side Name & ID Bridging

**Goal:** Create a reliable mapping between the Python engine's side
names and the app's side IDs so ranked lookups resolve correctly.

**Changes:**

- Build `src/data/sideBridge.ts`:
  - A hand-curated `Map<string, string>` mapping engine side names
    to app side IDs where names differ. For example:
    - `"Cucumber Raita" → "raita"`
    - `"Garlic Naan" → "naan-bread"`
    - `"Instant Pot Basmati Rice" → "basmati-rice"`
    - `"Mirchi Ka Salan" → "mirchi-ka-salan"`
  - For exact matches (names identical), derive automatically by
    slugifying the engine name and checking against `sides.json` IDs.
  - Export `resolveEngineSideId(engineSideName: string): string | null`
    which returns the app side ID or `null` if no match exists.
  - Log unmapped sides at build/dev time for visibility.
- Use this bridge inside `pairings.ts` when building the ranked list.
- Sides that exist in the engine but NOT in `sides.json` are skipped
  (they have no images/descriptions in the app).

**Files:** New `src/data/sideBridge.ts`, `src/data/pairings.ts` (use
bridge)
**Effort:** Medium (mostly manual mapping work)

### 7D. Pairing Reason Display

**Goal:** Surface the engine's scoring reasons on side dish cards for
engine-ranked meals, replacing the generic `pairingReason` field.

**Changes:**

- When a side is served from ranked data, the `PairingScore.reasons`
  array (up to 4 strings from the engine) replaces the static
  `side.pairingReason` on the card.
- Show the first reason as the primary text on the card. Additional
  reasons appear in the hover card and detail modal.
- Add a subtle tier badge (e.g. "excellent", "strong") next to the
  side name on desktop cards. Use tier-specific colors:
  - excellent → gold
  - strong → green
  - good → default text
  - experimental → muted
  - low → grey
- If the side was NOT engine-ranked (fallback random selection), show
  the existing `pairingReason` with no tier badge.

**Files:** `SideDishCard.tsx`, `SideDishCardMobile.tsx`, `HoverCard.tsx`,
`DishDetailModal.tsx`, `ResultsStage.tsx` (pass reason/tier data)
**Effort:** Medium

---

## Phase 8 — Heatmap Visualizer

Build an interactive React-based heatmap visualizer showing the full
main × side compatibility matrix. Accessible from About → Heatmap
button. Reference implementation: `pairing_visualizer.py` which
generates standalone HTML with HSL-colored score cells, sticky headers,
and a ranked side panel.

### 8A. Heatmap Data Layer

**Goal:** Prepare the full pairing matrix as a client-consumable data
structure for the heatmap component.

**Changes:**

- In `src/data/pairings.ts`, add a `getHeatmapData()` export:
  - Returns `{ mains: string[]; sides: string[]; matrix: number[][] }`
    where `matrix[mainIndex][sideIndex]` is the score (0–100).
  - Also returns `ranked: { [mainName: string]: PairingScore[] }` for
    the ranked panel.
  - Only includes mains and sides that exist in the engine data (the
    14 Indian mains and their 66 sides).
- This is a static computation — runs once at import time, no
  re-renders.

**Files:** `src/data/pairings.ts` (add heatmap export)
**Effort:** Low

### 8B. Heatmap Component

**Goal:** Build a scrollable, color-coded heatmap table in React
matching the reference visualizer's UX.

**Changes:**

- New `src/components/heatmap/HeatmapVisualizer.tsx`:
  - Full-screen modal (opened from About modal).
  - Top section: title, description, 3 filter controls in a row:
    - "Focus Main" — `<select>` dropdown of all engine mains.
    - "Filter Sides" — text input for side name search.
    - "Minimum Score" — number input (0–100).
  - Heatmap table:
    - Rows = mains (14), Columns = sides (66).
    - Each cell colored with HSL: `hue = (score/100) * 120`,
      `sat = 72%`, `light = 38 + (100 - score) * 0.15`. Low scores
      are red (hue ~0), high scores are green (hue ~120).
    - Sticky first column (main names) and sticky top row (side
      names, rotated or wrapped for space).
    - Cell hover shows tooltip: side name + first reason.
    - Click on main row header selects that main in the ranked panel.
  - Ranked panel below heatmap:
    - Shows all sides ranked for the selected main.
    - Each item: rank number, side name, tier badge, score, progress
      bar (width = score%), first reason text.
    - Filtered by side name search and minimum score controls.
  - Horizontal scroll with `-webkit-overflow-scrolling: touch` and
    `scrollbar-gutter: stable`.
  - Side column headers: fixed 92px width, word-wrap for long names.
  - Framer Motion: modal entrance animation matching existing modals.
  - `useReducedMotion` respected.

**Files:** New `src/components/heatmap/HeatmapVisualizer.tsx`
**Effort:** High

### 8C. About → Heatmap Entry Point

**Goal:** Add a "Heatmap" button inside the About modal that opens
the heatmap visualizer.

**Changes:**

- In `AboutModal.tsx`, add a new staggered paragraph/button at the
  bottom of the content:
  - A styled button: "View Pairing Heatmap →" with the same motion
    variants as existing content.
  - On click: closes the About modal and opens the Heatmap modal.
- Wire the heatmap modal state in `page.tsx` or use a shared state
  approach (callback prop from `AboutModal` → parent).
- Add `showHeatmap` state to `page.tsx`, render
  `<HeatmapVisualizer open={showHeatmap} onClose={...} />`.
- Pass `onOpenHeatmap` callback to `AboutModal`.

**Files:** `AboutModal.tsx` (add button), `page.tsx` (state + render),
`Navbar.tsx` (no changes — heatmap is accessed via About only)
**Effort:** Low-Medium

### 8D. Heatmap Score Color Utility

**Goal:** Extract the HSL color function into a shared utility for
reuse across the heatmap and potential tier badges.

**Changes:**

- New `src/lib/scoreColor.ts`:
  - `scoreToHsl(score: number): string` — maps 0–100 to HSL string.
    Formula: `hsl(${Math.round((score/100) * 120)}, 72%, ${38 +
    Math.round((100 - score) * 0.15)}%)`.
  - `tierToColor(tier: string): string` — maps tier names to design
    system colors (gold, green, neutral, muted, grey).
- Import in `HeatmapVisualizer.tsx` and `SideDishCard.tsx` (for tier
  badges from Phase 7D).

**Files:** New `src/lib/scoreColor.ts`
**Effort:** Low

---

## Phase 9 — NOURISH Verified Toggle

Add a toggle system that limits displayed meals and sides to only
"NOURISH Verified" items — a curated subset that has been reviewed
for pairing quality. The verified list will be provided separately.

### 9A. Verified Data Schema

**Goal:** Add a `nourishVerified: boolean` field to meals and sides
data, defaulting to `false`. Populate once the verified list is
provided.

**Changes:**

- Add `nourishVerified: boolean` to `Meal` and `SideDish` types in
  `types/index.ts`.
- Add `"nourishVerified": false` to every entry in `meals.json` and
  `sides.json` as the default. Update to `true` once the verified
  list is provided by the user.
- The search, pairing engine, and heatmap all respect this flag when
  the toggle is active.

**Files:** `types/index.ts`, `meals.json`, `sides.json`
**Effort:** Low

### 9B. Verified Toggle UI

**Goal:** Add a toggle switch in the navbar/header that filters the
entire experience to NOURISH Verified items only.

**Changes:**

- New toggle component in `Navbar.tsx`: a small pill-shaped toggle
  with "NOURISH Verified" label and a checkmark icon.
  - When active: gold/green accent color, filled state.
  - When inactive: muted outline.
- Toggle state managed in `page.tsx` via `useState` and passed down
  as context or props.
- When toggle is ON:
  - `searchMeals()` in `fuzzySearch.ts` filters to only
    `nourishVerified: true` meals.
  - `selectSides()` in `pairingEngine.ts` filters ranked/random
    pool to only `nourishVerified: true` sides.
  - Heatmap visualizer filters to verified mains and sides only.
  - Suggestion chips on the search screen show only verified meals.
- When toggle is OFF: full catalog is available (current behavior).
- Persist toggle state in `localStorage` so it survives page reloads.

**Files:** `Navbar.tsx` (toggle UI), `page.tsx` (state),
`fuzzySearch.ts` (filter), `pairingEngine.ts` (filter),
`HeatmapVisualizer.tsx` (filter)
**Effort:** Medium

### 9C. Verified Badge on Cards

**Goal:** Show a small "Verified" badge on meal and side dish cards
when the item is NOURISH Verified.

**Changes:**

- Add a small checkmark-in-shield icon or "N" monogram badge on:
  - `HeroDish.tsx` — bottom-right corner of the hero image.
  - `SideDishCard.tsx` / `SideDishCardMobile.tsx` — next to the
    side name.
- Badge only appears when the item has `nourishVerified: true`,
  regardless of toggle state (so users can see verified items even
  in the full catalog view).
- Tooltip on hover: "NOURISH Verified — curated for pairing quality."

**Files:** `HeroDish.tsx`, `SideDishCard.tsx`, `SideDishCardMobile.tsx`
**Effort:** Low

---

## Phase 10 — Recipe Integration (Future)

### 10A. Recipe Link Resolution

Connect the "View Recipe" button to a real destination. Options:
- Link to external recipe sites (Google search with structured query).
- Integrate a recipe API (Spoonacular, Edamam, or similar).
- Build internal recipe pages with ingredients, steps, and nutrition.

### 10B. Meal Planning Flow

Extend from single meal pairing to full meal planning:
- "Plan my week" — 7 meals with sides.
- Grocery list generation from saved pairings.
- Calendar-style view of planned meals.

### 10C. User Accounts & Preferences

Move from localStorage to server-persisted accounts:
- Dietary preferences (vegetarian, gluten-free, dairy-free).
- Cuisine preferences weighting.
- History-aware suggestions ("try something you haven't had").

---

---

*Living document. Appendix specs can be parallelized during implementation; dependency graph reflects original sequencing.*
