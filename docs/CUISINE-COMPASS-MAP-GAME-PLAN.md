# Cuisine Compass Map Game — Comprehensive Plan

> **Filed:** 2026-05-04 alongside the Y5 intelligence-layer pivot.
> **Theme:** Take the existing `/games/cuisine-compass` placeholder and rebuild it into a GeoGuessr-grade origin-pinning game with a Wordle-tier viral loop. Beautiful world map, drag-and-drop pins, distance-based scoring, daily-puzzle cadence, pod-vs-pod leaderboard, solo daily streak. Has to look polished — never vibe-coded.
> **Y5 sprint:** new Sprint N inserted W41–W44 (replaces the prior "Performance audit" slot, which moves to Sprint O W45–W48; year-close stays W49–W52). Substrate (pure helpers + dataset) lands first; map UI in the second half of the sprint.

## Single-sentence framing

A daily one-puzzle dish-pinning game where you drag a pin onto the world map to guess where a dish was created/eaten, scored by great-circle distance with a 30-second timer, shareable as a Wordle-style emoji grid, and competable solo or pod-vs-pod.

## Why this works

- **GeoGuessr's core loop** + **Wordle's viral cadence** combine well: GeoGuessr drives the depth of engagement (pin-drop precision, distance scoring) while Wordle drives the daily-recurrence rhythm (one puzzle/day, emoji-grid-share, no skipping).
- Sous already has the audience (cooking-curious users), the catalog (cuisine origins), and the social layer (pods) — the game becomes the _bridge_ between the cooking app and the friend-network.
- Educational by accident: pinning Pad See Ew lands you on Thailand, then the post-pin screen shows the dish history + a one-tap link to cook it. Conversion path from game → cook flow is short and natural.

## The reference experience — what GeoGuessr-grade means

Looked-at-side-by-side comparisons should pass the "this looks built by a real studio" sniff test. Specifically:

1. **Map quality.** Vector tiles (MapLibre or Mapbox-compatible style) with a custom muted-cream palette matching the Sous design tokens. No default Google Maps look.
2. **Pin physics.** Pin lifts on press with a subtle drop-shadow trail; snaps to the cursor as a finger tip; lands with a tiny bounce + ring-pulse animation. Drag is finger-precise; never feels rubbery or skipped.
3. **Reveal animation.** Once submitted, the great-circle line draws between guess and answer in 600ms with a fade-in distance label at the midpoint. Both pins pulse once, then settle.
4. **Score reveal.** Score ticks up from 0 to your earned value over ~1.2s with a soft bell sound (silent in reduced-motion mode).
5. **Typography.** Score in serif (matches Sous brand). Distance in tabular monospace. Headlines in `font-serif text-4xl`. No double-bordered cards. No gratuitous gradients.
6. **Offline-friendly.** All map tiles + dish dataset cached in service worker. Daily puzzle prefetched on first morning load so the game still works on subway / spotty wifi.
7. **No third-party watermarks.** No Mapbox-attribution chrome stacked at the bottom of the map (use a tiny one-line credit in the about sheet).
8. **A11y.** Full keyboard support — arrow keys drop the pin, Enter submits. Screen reader announces "pin placed at 51° N, 0° E. Submit to see distance." Reduced-motion gates every animation.

## Game design

### Daily puzzle structure

A single puzzle per day, rotated deterministically from a curated 365-dish set. Same puzzle for everyone in a calendar day (UTC midnight rotation), so leaderboards + share-grids are comparable.

```
┌─────────────────────────────────────────────────┐
│  Day 437 · May 4                                │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │                                          │    │
│  │   [hero food photo — Pad See Ew]         │    │
│  │                                          │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Where was Pad See Ew first cooked?              │
│                                                 │
│  ╔═════════════════════════════════════════╗    │
│  ║   [world map — drag a pin]              ║    │
│  ║                                         ║    │
│  ║                                         ║    │
│  ╚═════════════════════════════════════════╝    │
│                                                 │
│  ⏱  00:24                                       │
│                                                 │
│  [submit guess]                                 │
└─────────────────────────────────────────────────┘
```

### Scoring formula

Maximum 5,000 points per puzzle (matches GeoGuessr exactly so users from that audience already understand the scale). Score decays exponentially with great-circle distance + linearly with elapsed time:

```
distancePoints = 5000 * exp(-distanceKm / 2000)
timeMultiplier = max(0.5, 1 - (elapsedSec - 5) / 60)
                  ↑ 5 sec free, then linear decay; floor at 0.5
score = round(distancePoints * timeMultiplier)
```

Examples:

- Pinned within 100km in 8 seconds → `5000 * exp(-0.05) * 0.95 = 4516 pts`
- Pinned 500km off in 20 seconds → `5000 * exp(-0.25) * 0.75 = 2922 pts`
- Pinned wrong continent (8000km) in 45 seconds → `5000 * exp(-4) * 0.33 = 30 pts`
- Time-out at 30s → submit at current pin location with multiplier 0.5

### Streaks + share grid

Wordle-style daily streak: cook 5 puzzles in a row → 5-day streak chip. Share button generates an emoji grid:

```
Sous Compass · Day 437
4516 / 5000 ★★★★

🟩🟩🟩🟩
🟨🟩🟩🟨
⬜⬜🟨⬜
─────────
soustogether.app/c/437
```

Five rows × four columns: each cell is a quadrant of the great-circle path between the user's guess and the answer. Green = within 100km of that path segment; yellow = within 500km; white = off. The grid is visually distinctive (no other app's share-grid looks like this) and copies as plain Unicode so it pastes cleanly into iMessage / WhatsApp / X / Instagram-DM.

### Pod-vs-pod leaderboard

Solo and competitive at the same time. Each puzzle's score auto-contributes to the user's pod ranking:

- **Daily pod ranking:** sum of pod members' scores, divided by member count (so 4-person pods aren't penalised against 8-person pods).
- **Weekly pod ranking:** rolling 7-day sum of daily averages.
- **All-time pod ranking:** pod's accumulated score / days-active.

The leaderboard surface (`/games/cuisine-compass/leaderboard`) shows your pod's rank, your daily contribution, and the cross-pod top 10 for the week.

### Hint system (limited)

Two hints per puzzle, each costs 800 points:

- **Hint 1:** Reveal the continent.
- **Hint 2:** Reveal the country.

Using hints feels expensive (16% of max score per hint) so good players skip them. New players use hints freely on their first 5 puzzles to learn the scoring vibe.

### Dataset — 365 curated dishes

The hand-curated dish set is the load-bearing content. Sources:

- **Wikipedia regional cuisine articles** — the "Origins" section of each dish article cites a place + sometimes a coordinate.
- **Larousse Gastronomique** — the encyclopedic gastronomy reference (use for European + classical French dishes).
- **The Oxford Companion to Food** — Alan Davidson's authoritative source.
- **National Geographic Food Atlas** — strong on origin claims.

Each entry: dish name + origin city + lat/lng + 1-line history blurb + image URL.

```ts
interface CuisineCompassDish {
  slug: string;
  name: string;
  origin: { city: string; country: string; lat: number; lng: number };
  history: string; // 1-2 sentences for the post-puzzle reveal
  cuisineFamily: string; // matches Sous's existing cuisine catalog
  imageUrl: string;
  /** Calendar-day index (0-364) for the deterministic rotation. */
  dayIndex: number;
}
```

Editorial process:

- Land 50 dishes in Y5 N (the substrate sprint).
- Land 100 more in Y5 O follow-up.
- Land remaining 215 incrementally through Y6 + Y7 (push to Y7 plan as a content workstream).

If a calendar day's `dayIndex` slot has no dish (cold-start), fall back to a rotation of a curated subset.

## Architecture

### Substrate-first sequencing

All vibe-codeable today (no founder key needed):

```
src/types/cuisine-compass.ts          ← Zod schema for Dish, Guess, Score
src/lib/games/compass-scoring.ts      ← pure scoring fn + tests
src/lib/games/great-circle.ts         ← haversine distance fn + tests
src/lib/games/share-grid.ts           ← emoji-grid generator + tests
src/lib/games/daily-rotation.ts       ← dayIndex resolver (UTC) + tests
src/lib/hooks/use-compass-streak.ts   ← streak hook (W15 RCA pattern)
src/data/compass-dishes.ts            ← 50 curated dishes (Y5 N start)

src/components/games/compass-map.tsx  ← MapLibre wrapper + drag-pin behaviour
src/components/games/compass-reveal.tsx ← post-submit reveal animation
src/components/games/compass-share.tsx  ← share-grid card

src/app/games/cuisine-compass/page.tsx    ← daily puzzle surface
src/app/games/cuisine-compass/leaderboard/page.tsx ← pod + global ranks
```

### Map vendor

**MapLibre GL JS** — open-source fork of Mapbox GL, with a custom style fed by free OpenMapTiles (or self-hosted vector tiles via Protomaps for offline). Reasons:

1. No mandatory watermark.
2. Free for unlimited tile loads (vs Mapbox's tiered pricing).
3. Style customisation produces the Sous-on-brand muted cream palette.
4. Bundle ~200KB gzipped — acceptable for a games surface that's lazy-loaded behind the More-Options menu.

Style: cream land, soft sage country borders, no street-level detail (only country + ocean), no labels above continent level. Looks like a Field Notes pocket atlas.

### Drag-and-drop pin

Custom React-Aria-built drag handle on top of MapLibre's marker abstraction:

- `pointerdown` on the pin OR anywhere on the map → pin lifts with `transform: translate(0, -8px) scale(1.1)` + drop-shadow.
- `pointermove` → pin tracks the pointer (clamped to map bounds).
- `pointerup` → pin drops with a 220ms spring animation; ring-pulse fires for 400ms.
- Keyboard fallback: arrow keys move the pin in 1° steps (Shift = 5°, Alt = 0.1° fine grain). Enter submits.

The pin component stays decoupled from the map: it calls `mapRef.current.unproject(pixelXY)` to compute lat/lng. No coupling to MapLibre's internal marker API beyond projection.

### Service-worker tile caching

On first puzzle load:

- Prefetch every map tile for the world at zoom levels 0-3 (~64 tiles = ~3MB total).
- Cache in IndexedDB via `workbox-precaching`.
- Subsequent puzzles never hit the network for tiles → instant load even on slow connections.

Daily puzzle dish data is also prefetched into localStorage at midnight so the puzzle is available immediately on first morning open.

## Y5 sprint allocation

The cuisine-compass game inserts as a new sprint, slotting between editorial-pushed-out and the existing performance/year-close cadence:

| Sprint                                 | Weeks       | Theme                               | Output                                                                                                                                                                                   |
| -------------------------------------- | ----------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (existing A–L per the updated Y5 plan) |
| **N**                                  | **W41–W44** | **Cuisine Compass map game**        | **Substrate (compass-scoring · great-circle · share-grid · daily-rotation · 50-dish dataset · MapLibre wrapper · drag-pin) + UI surface (daily puzzle + reveal + share + leaderboard).** |
| O                                      | W45–W48     | Performance + bundle audit (Y5 cut) | Same shape as Y3 W45-W48 (was Sprint K).                                                                                                                                                 |
| M                                      | W49–W52     | Year close + Y6 plan                | unchanged.                                                                                                                                                                               |

This pushes the original Sprint K (cohort dashboard polish) and Sprint L (intelligence-layer real-mode polish) **earlier** into W33-W40 (taking the slots Pod challenges 2.0 + Eat Out previously held; those move to W25-W32 and W37-W40 respectively, which is just compression — nothing drops).

## What pushes to Y7

Y7 picks up the dataset-content workstream:

- 215 more dishes (215 dishes × ~30min each ≈ 100 hours of editorial work; founder + 1 contributor over a quarter).
- Permission letters for any dish-image use (most can come from Wikimedia Commons CC0/CC-BY but a few need explicit licensing).
- Geo-cultural sensitivity review: dishes claimed by multiple regions (e.g. baklava, hummus) need a thoughtful 1-line acknowledgement of the dispute. Editorial reviewer handles this in Y7.

Adds to **`docs/YEAR-7-VIBECODE-PLAN.md`** under a new "Cuisine Compass content" workstream (Sprint M.5 or wedged into Sprint A's editorial-content workstream).

## Demo script (45 seconds within the bigger 90-second app demo)

1. From Today, tap the More-Options menu → tap "Quick helpers" → tap "Cuisine Compass" (or via /games tab). (5s)
2. Daily puzzle loads instantly (prefetched). Hero food photo (Pad See Ew). World map below. Timer starts. (5s)
3. Drag pin → tap roughly Bangkok. Pin lifts, tracks finger, lands with a soft bounce. Submit. (10s)
4. Reveal: great-circle line draws between guess and answer. Distance label fades in mid-line ("82 km"). Score ticks 0 → 4516. ★★★★ rating. (10s)
5. "Share" button → share grid renders. Emoji grid copy-to-clipboard. iMessage prefilled. (10s)
6. Tap "How does my pod compare?" → leaderboard shows Sunday Sous ranked #14 globally for the week. (5s)

## Wordle-tier viral mechanics

What specifically makes this loop go viral:

1. **One puzzle per day** — creates anticipation, prevents binge-fatigue, makes the streak meaningful.
2. **Universal puzzle** — same dish for everyone every day so leaderboards + grids are comparable; conversational currency (just like Wordle: "did you do today's?").
3. **Emoji grid share** — copy-as-plain-text means the grid travels everywhere (iMessage, WhatsApp, X, Instagram DM, Slack, etc.); spoiler-free (you can't reverse-engineer the dish from the emoji pattern); visually distinctive (no other share-grid looks like this).
4. **Pod overlay** — the social layer of Sous gives the game a cooperative dimension Wordle lacks (you're playing for your pod, not just yourself).
5. **Educational accident** — the post-puzzle reveal teaches you something. People share that learning ("I had no idea pad see ew was Thai!") — share-driven by curiosity, not just bragging.
6. **No log-in to play** — the daily puzzle is reachable at `/games/cuisine-compass` without any account; only the leaderboard requires sign-in. Lowers the share-and-onboard friction.
7. **Cook-it-now CTA** — the post-puzzle reveal has a "cook this dish tonight" button that 1-click routes into the existing Sous cook flow. The game converts directly into app retention. This is the one thing Wordle can't do that Sous can.

## In one paragraph

Cuisine Compass becomes Sous's Wordle: one daily puzzle, drag-pin guess on a beautiful Field-Notes-style map, GeoGuessr-grade scoring (5,000 points max, exponential distance decay, time-multiplier), Wordle-grade share grid (emoji rows, plain-text copy, paste-anywhere), pod-vs-pod leaderboard layered on top so the social cooking pods get a competitive dimension. The architecture is substrate-first: pure scoring + great-circle + share-grid helpers ship in Y5 Sprint N alongside a 50-dish curated dataset and a MapLibre wrapper with a custom Sous-cream style. The dataset content workstream extends to 365 dishes through Y7. The post-puzzle "cook this dish tonight" button ties the game directly back to Sous's core loop — the one mechanic Wordle can't do that we can.
