# Combined Mains + Sides Guided Cook Flow — Build Plan

> **Created:** 2026-04-05
> **Prerequisite:** Existing side-only guided cook flow (31 sides with cook steps)

---

## Problem Statement

Currently, Sous only guides users through cooking **individual side dishes**. The user flow is:

1. Search for a main dish → engine ranks 3 sides
2. User selects a side → navigates to `/cook/[slug]`
3. Mission → Grab → Cook → Win for that **single side**

The main dish is only used as input to the pairing engine — it has no guided cook presence. The user is expected to already know how to cook their main, which contradicts the "Duolingo for cooking confidence" promise.

**Goal:** Build a combined guided cook flow where the user cooks both a main dish AND 1-3 paired sides in a single session, with segmented ingredient lists and sequential cook flows.

---

## Architecture Analysis

### What exists today

| Layer | Current State |
|-------|--------------|
| **Meals data** (`meals.json`) | 93 entries with `id, name, aliases, heroImageUrl, sidePool, cuisine, description` — **no cook steps, no ingredients, no prep/cook times** |
| **Sides data** (`sides.json`) | 203 entries with lightweight metadata — no cook steps inline |
| **Guided cook steps** (`guided-cook-steps.ts`) | 31 side dishes with full `StaticDishData`: ingredients, steps, timers, warnings, hacks, facts |
| **Cook store** (`use-cook-store.ts`) | Single-dish Zustand state: one `currentPhase`, one `currentStepIndex`, one `totalSteps` |
| **Cook router** (`cook.ts`) | `getSteps` takes a single `sideDishSlug` and returns one dish + its steps + its ingredients |
| **Cook page** (`cook/[slug]/page.tsx`) | Renders single-dish flow: Mission → Grab → Cook → Win |
| **Session tracking** (`use-cook-sessions.ts`) | Tracks one recipe per session in localStorage |

### What needs to change

1. **Meals need guided cook data** — ingredients + step-by-step instructions (same `StaticDishData` shape)
2. **Cook store** needs multi-dish awareness — tracking which dish (main vs side) is currently being cooked
3. **Cook router** needs a combined endpoint — accepts main slug + side slugs, returns all data
4. **Cook page** needs a new route or mode — `/cook/[slug]` stays for single-side cooks, new route for combined
5. **Ingredient list** needs segmented display — "For the Main" section + "For the Sides" section
6. **Session tracking** needs to record the full plate (main + sides cooked together)

---

## Phased Build Plan

### Phase A: Meal Guided Cook Data (Data Layer)
**Goal:** Add `StaticDishData` entries for main dishes, starting with the most popular meals that already have sides with cook steps.

#### A1. Extend `guided-cook-steps.ts` to support meals
- The existing `StaticDishData` interface works as-is for meals — same shape (name, slug, ingredients, steps, etc.)
- Add a new export: `guidedCookMeals: Record<string, StaticDishData>` alongside existing `guidedCookData` (which is sides)
- Add helper: `getStaticMealCookData(slug: string)` alongside existing `getStaticCookData(slug: string)`
- Add helper: `getAvailableMealCookSlugs(): string[]`

#### A2. Add first batch of meal cook flows (5-8 meals)
Priority meals (most referenced in sidePool, best coverage of cuisines):
- **Pizza Margherita** (Italian) — sides: caesar-salad, garlic-bread, bruschetta, caprese-salad all have cook flows
- **Butter Chicken** (Indian) — sides: garlic-naan, aloo-gobi, cucumber-raita, masoor-dal have cook flows
- **Fish Tacos** (Mexican) — sides: guacamole, pico-de-gallo, elote, esquites, mexican-rice have cook flows
- **Pad Thai** (Thai) — sides: spring-rolls, edamame have cook flows
- **Chicken Teriyaki** (Japanese) — sides: miso-soup, edamame, onigiri, gyoza have cook flows

Each meal entry follows `StaticDishData` shape with real, researched recipe instructions.

**Rule:** Per CLAUDE.md #7, only add cook flows for meals that already exist in `meals.json`. Research real recipes from reputable sources.

---

### Phase B: Combined Cook Router (API Layer)
**Goal:** New tRPC endpoint that returns a main + sides as a combined cook session.

#### B1. New `cook.getCombinedSteps` procedure
```typescript
cook.getCombinedSteps
  Input: { mainDishSlug: string, sideSlugs: string[] }
  Returns: {
    main: { dish, steps, ingredients } | null,
    sides: Array<{ dish, steps, ingredients }>,
    cookOrder: string[]  // Suggested sequence of slugs
  }
```

- Fetches main from `guidedCookMeals`, each side from `guidedCookData`
- `cookOrder` is a simple deterministic ordering: longest-cook-time first (so dishes that take longest start first)
- Falls back gracefully: if main has no cook data, returns `main: null` (user cooks their own main)
- If a side has no cook data, it's excluded from `sides` array

#### B2. Keep existing `cook.getSteps` unchanged
Single-side cook flow stays exactly as-is. No breaking changes.

---

### Phase C: Segmented Ingredient List (UI — Earlier Phase)
**Goal:** When cooking combined, the Grab phase shows ingredients segmented by dish.

#### C1. Extend `IngredientList` component
- New prop: `sections?: Array<{ label: string; ingredients: Ingredient[] }>`
- When `sections` is provided, render each section with a subheading (e.g., "For Pizza Margherita", "For Caesar Salad")
- When `sections` is absent, render flat list as today (backward-compatible)
- Each section is independently checkable
- Primary CTA: "I have everything" / "Let's cook!" (same as today)
- Shared ingredients across sections get a subtle "(also needed for Caesar Salad)" note

#### C2. Ingredient deduplication logic
- Utility function: `deduplicateIngredients(sections)`
- Matches by normalized ingredient name
- When same ingredient appears in multiple dishes, show it once in the first dish section with a note showing it's shared
- Quantities are NOT combined (user sees "2 cloves garlic" once, not "2 + 3 = 5 cloves")

---

### Phase D: Combined Cook Store (State)
**Goal:** Extend Zustand store to track multi-dish cook sessions.

#### D1. Add multi-dish state to `use-cook-store.ts`
```typescript
interface CookStore {
  // Existing single-dish fields (kept for backward compat)
  ...existing,

  // Combined flow additions
  cookMode: "single" | "combined";
  dishes: Array<{ slug: string; name: string; totalSteps: number }>;
  currentDishIndex: number;  // Which dish is currently being cooked

  // Actions
  startCombinedSession: (dishes: Array<{ slug, name, totalSteps }>) => void;
  nextDish: () => void;      // Move to next dish after completing current
  getCurrentDish: () => { slug, name, totalSteps } | null;
}
```

- In `single` mode, everything works as today
- In `combined` mode, after completing all steps of one dish, `nextDish()` resets `currentStepIndex` to 0 and increments `currentDishIndex`
- Win screen only shows after ALL dishes are complete

---

### Phase E: Combined Cook Page (UI — Full Flow)
**Goal:** New route `/cook/combined` that orchestrates the multi-dish flow.

#### E1. Route: `/cook/combined?main=SLUG&sides=SLUG1,SLUG2`
- Reads main + sides from URL params
- Fetches via `cook.getCombinedSteps`
- Renders the same Mission → Grab → Cook → Win shell

#### E2. Mission Screen (combined mode)
- Shows the main dish hero image + name
- Below: "Cooking with: Caesar Salad, Garlic Bread" (side names)
- Total time: sum of all prep + cook times
- Single CTA: "Let's gather"

#### E3. Grab Screen (combined mode)
- Uses Phase C's segmented ingredient list
- Section headers: "🍕 For Pizza Margherita", "🥗 For Caesar Salad"
- Single CTA at bottom: "I have everything"

#### E4. Cook Screen (combined mode)
- Cooks one dish at a time, in `cookOrder` sequence
- Between dishes: brief transition card ("✅ Pizza done! Next up: Caesar Salad")
- Step counter shows: "Caesar Salad · Step 2 of 5"
- Phase indicator shows: "Dish 1 of 3 · Cook"

#### E5. Win Screen (combined mode)
- Celebrates the full plate: "You cooked a complete meal!"
- Shows all dishes cooked with their images
- Single session recorded with all dish slugs

---

### Phase F: Wiring Into Existing Flows
**Goal:** Connect combined cook to the existing user journey.

#### F1. Result Stack "Cook selected" button
- Currently cooks first selected side only
- When main has guided cook data AND sides are selected:
  - Navigate to `/cook/combined?main=MAIN_SLUG&sides=SIDE1,SIDE2`
- When main has NO guided cook data:
  - Keep current behavior (cook first side via `/cook/[slug]`)

#### F2. Quest Card "Start cooking"
- If the dish has guided cook steps → `/cook/[slug]` (side-only, as today)
- No change needed here — quest cards are for discovering sides

#### F3. "Select sides to pair" from ingredient list
- Currently navigates to `/?selectSides=DISH_NAME`
- After combined flow is built, could navigate to combined route
- Deferred to Phase F (not needed for initial build)

---

## Execution Priority

| Phase | Effort | Dependency | Ship Independently? |
|-------|--------|------------|---------------------|
| **A** (meal cook data) | Medium | None | ✅ Yes — data only, no UI change |
| **B** (combined router) | Small | A | ✅ Yes — API only, no UI change |
| **C** (segmented ingredients) | Small | None | ✅ Yes — backward-compatible UI |
| **D** (combined store) | Small | None | ✅ Yes — backward-compatible state |
| **E** (combined cook page) | Large | A + B + C + D | ❌ Needs all above |
| **F** (wiring) | Small | E | ❌ Needs E |

**Recommended execution order:** A → C → B → D → E → F

Start with **A** (data) and **C** (segmented ingredients) in parallel since they have no dependencies. Then **B** (router) and **D** (store) once data exists. Finally **E** (combined page) and **F** (wiring) as the capstone.

---

## What to Build NOW (Next Phase)

**Phase A2 + C1:** Add the first 5 meal guided cook flows to the data layer, and build the segmented ingredient list UI.

This delivers immediate value:
- Meal cook data exists and is testable
- Ingredient list supports sections (can be previewed in single-dish mode)
- No breaking changes to the existing flow
- Sets up everything needed for Phases B-F

---

## Constraints

1. **No invented recipes** — Only add cook flows for meals in `meals.json`. Research real recipes.
2. **No new images** — Use existing `heroImageUrl` from `meals.json`.
3. **Quest shell consistency** — Combined flow must still follow Mission → Grab → Cook → Win.
4. **One primary action per screen** — Combined mode can't show two equally-weighted CTAs.
5. **Backward-compatible** — Existing single-side `/cook/[slug]` flow must not break.
