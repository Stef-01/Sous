# NOURISH Pairing Pipeline

How meal-to-side pairings work, how the heatmap stays current, and how to add new data.

---

## Architecture Overview

The system has two pairing strategies:

| Strategy | Coverage | How it works |
|----------|----------|--------------|
| **Engine-scored** | 14 Indian mains x 66 Indian sides (924 pairings) | Deterministic multi-factor scoring in Python, pre-computed to `pairings.json` |
| **Curated** | 21 non-Indian mains x 8-12 sides each | Hand-picked `sidePool` arrays in `meals.json` |

The heatmap visualizer shows **both** strategies: engine-scored cells use a red-to-green gradient (0-100), curated cells appear in blue.

---

## Scoring Model (Engine)

The Python engine at `~/Documents/New project/pairing_system.py` uses an **additive heuristic** (not ML). Every main x side pair starts at a base score of **24** and accumulates bonuses/penalties across six dimensions.

### Scoring Dimensions

**1. Plate Structure (format fit)**
Does the side's physical form match the main's needs?
- Gravy main + starch: **+10**
- Gravy main + bread: **+8**
- Dry main + bread: **+10**
- Dry main + rice: **+6**
- Rice main + rice: **-7** (redundancy penalty)

**2. Evidence Priors (real-world anchors)**
Is this pairing commonly served together in Indian restaurants/homes?
- Side appears in evidence list: **+16**
- Side's category appears in evidence categories: **+7**

**3. Note-Hit Bonuses (flavor strategy)**
Does the side cover the main's flavor objectives?
- Preferred note hits: **min(12, 4 x count)**
- Complementary note hits: **min(8, 2 x count)**
- Avoid note hits: **-4 x count**

**4. Flavor-Note Relations**
Do the spice families cohere or clash?
- Shared notes (overlap): **min(10, 3 x count)**
- Compatibility map matches: **min(12, bonus)**
- Clash map matches: **max(-18, penalty)**

**5. Secondary Balance Checks**
- Spice gap (heat mismatch): +4 to -3
- Richness + freshness cut: +6 / heavy penalty: -7
- Texture contrast (saucy + crunchy): +4
- Acidity stacking: -4
- Format mismatch (breakfast with non-south-indian): -4

**6. Clamping & Tier Assignment**
Final score clamped to 0-100, then mapped:

| Score | Tier |
|-------|------|
| >= 85 | excellent |
| >= 70 | strong |
| >= 55 | good |
| >= 40 | experimental |
| < 40 | low |

### Reason Generation
Top 4 positive contributions are extracted as human-readable strings. Fallback: "general compatibility".

---

## Data Flow

```
Python Engine                     Next.js App
================                  ====================
pairing_system.py
  |
  v
pairings.json ----copy to---->  src/data/pairings.json
                                  |
                                  v
                                src/data/pairings.ts
                                  |-- getRankedSidesForMeal(mealId)
                                  |-- getHeatmapData()
                                  |
                                  v
                                src/data/sideBridge.ts
                                  |-- resolveEngineSideId(engineName)
                                  |   (9 explicit + auto-slugify)
                                  |
                                  v
                                src/lib/pairingEngine.ts
                                  |-- selectSides(meal, count)
                                  |-- swapOneSide(meal, sides, idx)
                                  |
                                  v
                                src/app/api/search/route.ts
                                src/app/api/heatmap/route.ts
```

---

## How the Heatmap Auto-Updates

The heatmap reads from two sources at runtime:

1. **`pairings.json`** — all engine-scored pairings (14 mains x 66 sides)
2. **`meals.json` + `sides.json`** — all app meals and their `sidePool` arrays

The `getHeatmapData()` function in `src/data/pairings.ts`:
- Iterates all engine mains first (real scores)
- Then iterates all app meals NOT in the engine (curated pools, marked as -1)
- Collects all unique side names from both sources
- Builds a complete matrix

**This means**: when you add a new meal to `meals.json` with a `sidePool`, it automatically appears in the heatmap as a curated row. When you add engine data to `pairings.json`, it appears as a scored row.

---

## Adding New Data

### Adding a new curated meal (no engine scoring)

1. **Add side dishes** to `src/data/sides.json` if they don't exist:
   ```json
   {
     "id": "caesar-salad",
     "name": "Caesar Salad",
     "imageUrl": "/sides/caesar-salad.jpg",
     "tags": ["american", "salad", "classic"],
     "description": "Crisp romaine with parmesan and croutons.",
     "pairingReason": "A cool, crunchy counterpoint.",
     "nutritionCategory": "vegetable"
   }
   ```

2. **Add the meal** to `src/data/meals.json`:
   ```json
   {
     "id": "grilled-chicken",
     "name": "Grilled Chicken",
     "aliases": ["bbq chicken", "chargrilled chicken"],
     "heroImageUrl": "/meals/grilled-chicken.jpg",
     "sidePool": ["caesar-salad", "mashed-potatoes", ...],
     "cuisine": "American",
     "description": "Simple herb-marinated chicken."
   }
   ```

3. **Done.** The meal appears in:
   - Search (via Fuse.js fuzzy matching)
   - Results (3 random sides from `sidePool`)
   - Heatmap (blue curated row)

### Adding engine-scored pairings for a new main

1. **Add the main** to `pairing_system.py`:
   - Add to `MAINS` dict with a `DishProfile`
   - Add to `MAIN_FLAVOR_NOTES`
   - Add to `MAIN_PAIRING_GUIDE` with evidence_sides, preferred/complementary/avoid notes

2. **Add any new sides** to `pairing_system.py`:
   - Add to `SIDES` dict with a `DishProfile`
   - Notes are auto-derived via `_derive_side_notes()`

3. **Run the engine**:
   ```bash
   cd ~/Documents/New\ project
   python3 pairing_system.py
   ```
   This regenerates `pairings.json` with the full matrix.

4. **Copy to app**:
   ```bash
   cp pairings.json ~/nourish-meal-pairer/src/data/pairings.json
   ```

5. **Update app data**:
   - Add the meal to `src/data/meals.json` (with `sidePool` from top-ranked engine results)
   - Add any new sides to `src/data/sides.json`
   - Add mapping in `src/data/pairings.ts` → `ENGINE_MAIN_TO_MEAL_ID`
   - If side names don't auto-slugify correctly, add to `src/data/sideBridge.ts` → `ENGINE_TO_APP`

6. **Verify**: `npx next build` — no TypeScript errors, sideBridge resolves all sides.

### Verifying side bridge resolution

```bash
# Quick check: all engine sides resolve
node -e "
const p = require('./src/data/pairings.json');
const { resolveEngineSideId } = require('./src/data/sideBridge');
const allSides = new Set();
for (const entries of Object.values(p)) {
  for (const e of entries) allSides.add(e.side);
}
let missing = 0;
for (const s of allSides) {
  if (!resolveEngineSideId(s)) {
    console.log('UNRESOLVED:', s);
    missing++;
  }
}
console.log(missing === 0 ? 'All sides resolve.' : missing + ' unresolved.');
"
```

---

## File Reference

| File | Purpose |
|------|---------|
| `src/data/meals.json` | 35 meals with sidePool arrays |
| `src/data/sides.json` | 148 side dishes |
| `src/data/pairings.json` | 924 engine-scored pairings (14 x 66) |
| `src/data/pairings.ts` | Engine adapter: `getRankedSidesForMeal()`, `getHeatmapData()` |
| `src/data/sideBridge.ts` | Engine name -> app ID resolution |
| `src/data/index.ts` | Data access: `meals`, `sides`, `getSideById()` |
| `src/lib/pairingEngine.ts` | Runtime selection: `selectSides()`, `swapOneSide()` |
| `src/lib/scoreColor.ts` | `scoreToHsl()`, `tierToClasses()` |
| `src/components/heatmap/HeatmapModal.tsx` | Heatmap visualizer UI |
| `src/app/api/heatmap/route.ts` | Heatmap data API |
| `~/Documents/New project/pairing_system.py` | Python scoring engine (source of truth) |
