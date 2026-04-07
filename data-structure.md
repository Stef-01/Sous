# Data Structure Inventory — Sous

> **Purpose:** Single source of truth for all existing data in the repo. Consult this before creating, modifying, or migrating any data to avoid redundancy and rework.

---

## 1. Existing data files

| File                     | Size   | Format      | Description                                                         |
| ------------------------ | ------ | ----------- | ------------------------------------------------------------------- |
| `src/data/meals.json`    | 53 KB  | JSON array  | 93 main dishes with metadata                                        |
| `src/data/sides.json`    | 97 KB  | JSON array  | 203 side dishes with metadata                                       |
| `src/data/pairings.json` | 233 KB | JSON object | Pre-computed pairing scores from Python engine                      |
| `src/data/index.ts`      | 0.5 KB | TS          | Exports `meals`, `sides`, `getSideById`, `getSidesByIds`            |
| `src/data/pairings.ts`   | 5 KB   | TS          | Resolves engine names to app IDs, builds ranked lists, heatmap data |
| `src/data/sideBridge.ts` | 2 KB   | TS          | Maps Python engine side names to app slug IDs                       |

---

## 2. Meal schema (current)

**Source:** `src/types/index.ts` &rarr; `Meal` interface
**Count:** 93 meals

```typescript
interface Meal {
  id: string; // slug: "butter-chicken"
  name: string; // "Butter Chicken"
  aliases: string[]; // ["murgh makhani", "makhani chicken"]
  heroImageUrl: string; // "/food_images/butter_chicken.png"
  sidePool: string[]; // ["naan-bread", "basmati-rice", ...] — curated side IDs
  cuisine: string; // "Indian"
  description: string; // One-paragraph description
  nourishVerified?: boolean;
}
```

### Cuisines represented (11 unique)

| Cuisine       | Meal count |
| ------------- | ---------- |
| Indian        | 16         |
| Filipino      | 16         |
| Japanese      | 7          |
| Korean        | 6          |
| Thai          | 6          |
| Chinese       | 6          |
| Vietnamese    | 5          |
| Mexican       | 4          |
| American      | 4          |
| Italian       | 2          |
| Mediterranean | 3          |

### Verified meals

32 meals have `nourishVerified: true` (all Indian + all Filipino).

---

## 3. Side dish schema (current)

**Source:** `src/types/index.ts` &rarr; `SideDish` interface
**Count:** 203 sides

```typescript
interface SideDish {
  id: string; // slug: "caesar-salad"
  name: string; // "Caesar Salad"
  imageUrl: string; // "/food_images/caesar_salad.png"
  tags: string[]; // ["salad", "classic", "italian"]
  description: string; // One-paragraph description
  pairingReason: string; // "crisp greens to cut through rich, heavy mains"
  nutritionCategory: "protein" | "carb" | "vegetable";
  nourishVerified?: boolean;
}
```

### Nutrition category distribution

| Category  | Count |
| --------- | ----- |
| vegetable | ~110  |
| carb      | ~65   |
| protein   | ~28   |

### Verified sides

83 sides have `nourishVerified: true` (primarily Indian sides: raitas, chutneys, pickles, vegetables, breads, rice).

---

## 4. Pairing scores (engine-generated)

**Source:** `src/data/pairings.json`
**Format:** `{ "Main Name": [{ side, score, tier, reasons }] }`
**Total entries:** ~975 individual pairing scores

```typescript
type RawPairingEntry = {
  side: string; // Engine side name (e.g., "Cucumber Raita")
  score: number; // 0-100 pairing score
  tier: string; // "excellent" | "strong" | "good" | "experimental" | "low"
  reasons: string[]; // 3-5 explanation strings
};
```

### Engine-scored mains (21 meals)

Indian: Bell Pepper Curry, Bhindi Masala, Butter Chicken, Chicken Biryani, Chicken Tikka Masala, Eggplant Methi, Kadhi, Marathi Moong Curry, Masoor Dal, Mattar Paneer, Mixed Veg + Paneer, Mumbai Pav Bhaji, Mushroom Masala, Sambar, Tandoori Vegetables, Tofu Bhurji

International: BBQ Ribs, Beef Burger, Fish Tacos, Pasta Carbonara, Sushi Platter

### Name bridging

The Python engine uses display names; the app uses slug IDs. Two mappings exist:

- **`pairings.ts`** — `ENGINE_MAIN_TO_MEAL_ID`: 19 main name &rarr; meal ID entries
- **`sideBridge.ts`** — `ENGINE_TO_APP`: 16 explicit side name &rarr; side ID entries + auto-slugify fallback

---

## 5. Existing lib modules (logic to preserve)

| Module                      | Purpose                                                  | Reuse in V1?                                                                                         |
| --------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/lib/pairingEngine.ts`  | Ranked + random side selection, reroll, swap             | **Refactor** into `src/lib/engine/` — keep selection logic, replace scoring with new scorer pipeline |
| `src/lib/fuzzySearch.ts`    | Fuse.js meal search with verified filter                 | **Keep** for client-side typeahead; server-side search will use DB queries                           |
| `src/lib/nutrition.ts`      | Heuristic meal nutrition inference from name/description | **Keep** as fallback; V1 DB schema adds explicit nutrition fields                                    |
| `src/lib/plateAppraisal.ts` | ADA Plate Method evaluation (carb/protein/veg balance)   | **Keep** — wire into win screen or result stack                                                      |
| `src/lib/scoreColor.ts`     | Heatmap tier &rarr; color mapping                        | **Keep** for heatmap component                                                                       |
| `src/lib/motion.ts`         | Framer Motion spring configs                             | **Keep**                                                                                             |
| `src/lib/analytics.ts`      | Vercel Analytics event tracking                          | **Keep**                                                                                             |
| `src/lib/normalize.ts`      | Input text normalization                                 | **Keep**                                                                                             |

---

## 6. Existing components (26 total)

### Layout (4)

- `Navbar.tsx` — Header with logo, verified toggle, heatmap/saved actions
- `AboutModal.tsx` — About modal
- `SavedPairingsModal.tsx` — Displays saved pairings from localStorage
- `SpinWheel.tsx` — Random meal spin wheel

### Search (3)

- `SearchInput.tsx` — Main search field
- `SearchDropdown.tsx` — Typeahead dropdown
- `SuggestionChips.tsx` — Suggestion chips

### Results (9)

- `ResultsStage.tsx` — Hero meal + 3 sides container
- `HeroDish.tsx` — Main dish display
- `SideDishCard.tsx` — Desktop side card
- `SideDishCardMobile.tsx` — Mobile side card
- `HoverCard.tsx` — Contextual hover info
- `DishDetailModal.tsx` — Full detail view
- `RerollButton.tsx` — Reroll/swap button
- `BalanceIndicator.tsx` — Nutritional balance viz
- `PlateMethodModal.tsx` / `InlinePlate.tsx` / `SharePlateModal.tsx` — Plate evaluation & sharing

### UI primitives (3)

- `ConfettiBurst.tsx` — Confetti animation
- `MagicalLoader.tsx` — Loading spinner
- `SparkleEffect.tsx` — Sparkle overlay

### States (3)

- `EmptyState.tsx` — Initial state
- `ErrorMessage.tsx` — Error display
- `ShimmerPlaceholder.tsx` — Loading skeleton

### Heatmap (1)

- `HeatmapModal.tsx` — Meal/side heatmap

---

## 7. Existing hooks (5)

| Hook               | Purpose                                    | Reuse in V1?                             |
| ------------------ | ------------------------------------------ | ---------------------------------------- |
| `useMealSearch`    | Search query, API calls, shimmer state     | **Refactor** to use tRPC                 |
| `usePairing`       | Reroll/swap logic, usedSideIds, rankOffset | **Refactor** to use tRPC                 |
| `useSavedPairings` | localStorage saved pairings                | **Keep** short-term; migrate to DB later |
| `useReducedMotion` | `prefers-reduced-motion`                   | **Keep**                                 |
| `useSharePlate`    | Share plate functionality                  | **Keep**                                 |

---

## 8. Existing API routes (2)

| Route          | Method | Purpose                          |
| -------------- | ------ | -------------------------------- | ---------------------------- |
| `/api/search`  | GET    | `?q=<query>&verified=<0          | 1>` — returns meal + 3 sides |
| `/api/heatmap` | GET    | Returns full heatmap data matrix |

These will be replaced by tRPC procedures in V1.

---

## 9. Public assets

- **`public/food_images/`** — 200+ PNG images for meals and sides (named by slug)
- **`public/nourish-logo.svg`** — Brand logo (needs rename to Sous)
- **`public/og-image.png`** — Open Graph image
- **`public/favicon.ico`** — Favicon

---

## 10. What the V1 DB schema adds vs. what exists

| V1 Schema field                  | Already in JSON data?                  | Migration plan                         |
| -------------------------------- | -------------------------------------- | -------------------------------------- |
| `side_dishes.name`               | Yes (`sides.json`)                     | Seed from JSON                         |
| `side_dishes.slug`               | Yes (`sides.json` → `id`)              | Use existing `id` as slug              |
| `side_dishes.description`        | Yes (`sides.json`)                     | Seed from JSON                         |
| `side_dishes.cuisineFamily`      | Partially (via `tags`)                 | Derive from tags or assign during seed |
| `side_dishes.prepTimeMinutes`    | **No**                                 | Add during seed enrichment             |
| `side_dishes.cookTimeMinutes`    | **No**                                 | Add during seed enrichment             |
| `side_dishes.skillLevel`         | **No**                                 | Add during seed enrichment             |
| `side_dishes.flavorProfile`      | Partially (via `tags`)                 | Map from existing tags                 |
| `side_dishes.temperature`        | **No**                                 | Add during seed enrichment             |
| `side_dishes.proteinGrams`       | **No**                                 | Add during seed enrichment             |
| `side_dishes.fiberGrams`         | **No**                                 | Add during seed enrichment             |
| `side_dishes.caloriesPerServing` | **No**                                 | Add during seed enrichment             |
| `side_dishes.heroImageUrl`       | Yes (`sides.json` → `imageUrl`)        | Seed from JSON                         |
| `side_dishes.bestPairedWith`     | Implicit (reverse of `meals.sidePool`) | Compute from existing sidePool data    |
| `side_dishes.tags`               | Yes (`sides.json`)                     | Seed from JSON                         |
| `cook_steps.*`                   | **No**                                 | Create from scratch for V1 Guided Cook |
| `ingredients.*`                  | **No**                                 | Create from scratch for V1 Guided Cook |
| `users.*`                        | **No**                                 | Created at runtime by Clerk + app      |
| `cook_sessions.*`                | **No**                                 | Created at runtime                     |
| `saved_recipes.*`                | localStorage only                      | Migrate from localStorage              |
| `quiz_responses.*`               | **No**                                 | Created at runtime                     |

---

## 11. Data migration strategy

### Phase 1: Seed from existing JSON (no data loss)

1. **Side dishes** — Import all 203 from `sides.json`. Map fields:
   - `id` &rarr; `slug`
   - `name`, `description`, `imageUrl` &rarr; direct copy
   - `tags` &rarr; `tags` + derive `cuisineFamily` and `flavorProfile`
   - `nutritionCategory` &rarr; keep as tag, not in V1 schema (schema uses detailed nutrition)
   - `pairingReason` &rarr; store as metadata or use in explainer

2. **Meals** — Not in V1 DB schema (mains come from user input or AI recognition). Keep `meals.json` as reference data for:
   - Search suggestions / typeahead
   - Default quest cards
   - Photo recognition validation

3. **Pairing scores** — Keep `pairings.json` as engine data. The new scorer pipeline will eventually replace this, but existing scores remain valid for the 21 engine-scored mains.

### Phase 2: Enrich with Guided Cook data

For a target of 30-40 side dishes first, add:

- `cook_steps` — Mission/Grab/Cook/Win phase steps
- `ingredients` — Ingredient lists with quantities and substitutions
- `prepTimeMinutes`, `cookTimeMinutes`, `skillLevel`
- Nutrition details (`proteinGrams`, `fiberGrams`, `caloriesPerServing`)
- `temperature` ("hot" | "cold" | "room-temp")

### Phase 3: Expand to 80-100 fully enriched dishes

Fill remaining side dishes with cook steps, ingredients, and nutrition.

---

## 12. Key IDs and naming conventions

- **Meal IDs:** kebab-case slugs (`butter-chicken`, `fish-tacos`)
- **Side IDs:** kebab-case slugs (`caesar-salad`, `naan-bread`)
- **Image filenames:** snake_case PNGs (`butter_chicken.png`, `caesar_salad.png`)
- **Engine names:** Title Case display names (`Butter Chicken`, `Caesar Salad`)
- **Cuisine values:** Title Case (`Indian`, `Japanese`, `Mediterranean`)

---

## 13. Data NOT to regenerate

These already exist and must be reused:

1. **93 meals** with aliases, descriptions, cuisine, sidePool mappings, and hero images
2. **203 side dishes** with descriptions, tags, pairing reasons, nutrition categories, and images
3. **975 pairing scores** with tiers and multi-reason explanations
4. **200+ food images** in `public/food_images/`
5. **Name bridge mappings** between engine names and app slugs
6. **Fuzzy search configuration** (Fuse.js weights, thresholds)
7. **Pairing engine selection logic** (ranked walk, Fisher-Yates fallback, reroll/swap)
8. **Plate appraisal logic** (ADA method evaluation)
9. **All existing React components** — refactor, don't rewrite
