# Pantry → Novelty Engine → Meal Planning — Comprehensive Feature Plan

> **Filed:** 2026-05-03 (Y3 W2, planning slot).
> **Status:** Substrate-spec ready for sprint allocation.
> **Origin:** Stefan's W2 brief — photo-pantry with novelty engine,
> color-coded "you-already-have" hints in recipes, gamified meal
> planning, smart-leftovers flow.
> **Approach:** Synthesised from existing meal-planning apps
> (Mealime, PlateJoy, Paprika, KitchenPal, Cooklist, MatchMyMeal,
> Meal Genius, SideChef, Smart Kitchen AI Pantry) and AI-flavor-
> pairing prior art (IBM Chef Watson, Foodpairing). Sources
> linked at the bottom of the doc.

---

## 1. The five-feature vision (one paragraph each)

### 1.1 Photo-to-pantry from grocery haul (the ingestion engine)

After every grocery run the user takes one photo of the haul on the kitchen counter. The app runs computer vision against the image, lists what it found with confidence flags, and asks the user to confirm in one tap. The pantry is updated automatically — no per-item search, no barcode scanning, no manual entry. Items are grouped by storage zone (pantry / fridge / freezer) inferred from the item type. Expiration dates are estimated from item-class defaults (lettuce 5 days, bell peppers 10 days, hard cheese 3 weeks, dry pasta 18 months) so the user can rely on staleness signals without typing dates. The user can re-photograph any time to update — the engine merges new findings with existing inventory rather than overwriting.

### 1.2 Novelty engine — daily unique taste profiles from current pantry

Given the current pantry, the engine surfaces ONE suggested combination per day that the user almost certainly has not tried — but that they could make from what's already on hand. The novelty score combines (a) how unfamiliar the pairing is to this specific user, derived from cook history, (b) how compatible the ingredients are by aroma-compound proximity, borrowing from the Foodpairing approach, and (c) how preparation-feasible the combination is in 20 minutes or less. The classic example: ham, sharp cheese, and a ripe pear sitting in the fridge separately suggest a French argyle-pear sandwich the user has never made — three ingredients they always buy, one combination they've never tried. The engine's job is to make those connections visible.

### 1.3 Color-coded "you already have" in recipes (the friction killer)

Every recipe rendered in the app — internal seed catalog, user-authored, externally retrieved via the W41 viral extractor — gets each ingredient line colored against the user's current pantry. Green dot: you have it (and enough). Yellow dot: you have it but quantity is low or stale. Outline only: you'd need to buy it. The colors are SUBTLE — never alarming, never prescriptive — designed so the cook can scan a recipe and immediately see "I can start this now" vs "I'd need three things from the store first." This is the highest-leverage UX move in the whole feature set: it transforms recipe browsing from "do I want this?" into "can I do this tonight?"

### 1.4 Gamified meal planner — swipe to plan a week

The meal planner presents one card at a time over a 90-second flow on Sunday afternoon. Each card shows a candidate meal with the pantry-coverage badge, prep time, and a single image. The user swipes right to schedule the meal, left to skip, or up to "show me a twist on this." After 7 right-swipes the week is planned. The flow runs on Sunday evening because that's when most users actually cook for the week — see the rhythm-pattern data from Y2 W19. The swipe is not a personality test; it's a 90-second commit. The card pool is filtered upfront by pantry coverage ≥ 70% so every candidate is feasible without major restocking.

### 1.5 Smart leftovers flow — "what to do tomorrow"

When the user finishes a cook flagged as "big batch" (rotisserie chicken, large pasta sauce, pot of soup, sheet-pan of veg), the win-screen surfaces the next-day suggestion automatically. Monday rotisserie chicken → Tuesday lunch chicken-rice or chicken sandwich derived from the leftover protein + current pantry. The substrate is a simple rules table: each "big batch" recipe has 2-4 successor recipes that consume the leftover at expected proportions. The user accepts → the successor is auto-planned for tomorrow's lunch slot in the weekly planner. No re-planning, no cognitive overhead.

---

## 2. What the existing apps get right (and where Sous differentiates)

| Feature                            | Closest comparable                       | What they do well                        | Sous differentiator                                     |
| ---------------------------------- | ---------------------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| Photo-to-pantry ingestion          | Smart Kitchen AI Pantry, Portions Master | Image recognition + barcode fallback     | Single "haul shot" UX — no per-item entry               |
| Recipe matching to current pantry  | Cooklist, KitchenPal                     | "Cook with what you have" recipe pool    | Color-coded inline in EVERY recipe — not a separate tab |
| Personalised meal plans            | Mealime, PlateJoy                        | Curated 30-min recipes; lifestyle survey | Pantry-coverage filter on every suggestion              |
| Drag-and-drop calendar             | Paprika                                  | Personal-cookbook calendar               | Generated suggestions vs blank calendar                 |
| Swipe-to-discover meal preferences | MatchMyMeal, Meal Genius                 | Tinder-shaped onboarding                 | One-time use during weekly plan, NOT every session      |
| Flavor-pairing novelty             | IBM Chef Watson, Foodpairing             | Aroma-compound matching                  | Bounded daily — one suggestion, not a firehose          |
| Leftover-aware sequencing          | (no app does this well)                  | n/a                                      | Big-batch → successor is the differentiator             |

**Where every comp falls short:** they all assume the user wants to spend more than 60 seconds engaging with the planning surface. Sous's working principle (the Sous Test) flips that — every surface should reduce time-to-cook, not extend it. The novelty engine ships ONE suggestion per day, not ten. The color-coded recipe ingredients require zero taps to reveal. The meal planner is a 90-second swipe, not a 20-minute session.

---

## 3. Architecture — data layer

Six new Drizzle / Zod schemas slot in alongside the existing Y2 W2 tables.

### 3.1 PantryItem (replaces / extends existing pantry storage)

```
PantryItem {
  id, userId
  canonicalName: string         // "fresh basil", normalised via the W15 helper
  storageZone: "pantry" | "fridge" | "freezer"
  quantityEstimate: "low" | "medium" | "high" | null
  estimatedQuantityUnit?: { value: number; unit: "g" | "ml" | "count" | "package" }
  ingestedAt: timestamp
  ingestedFrom: "photo" | "manual" | "barcode" | "recipe-write-back"
  expirationEstimate: timestamp  // computed by item-class default; user-editable
  itemClass: ItemClass            // see below
  confidenceFromIngestion: 0..1   // photo CV's confidence, 1.0 for manual
}
```

`ItemClass` is a closed taxonomy of ~120 item types — produce, dairy, dry goods, frozen, pantry-staple, condiment, protein. Each class has a default expiration window + storage zone + aroma-profile pointer. The taxonomy doubles as the lookup key into the novelty engine's compound database.

### 3.2 PantryPhoto

```
PantryPhoto {
  id, userId
  photoUri          // R2-backed
  capturedAt
  detectedItems: Array<{
    candidateName: string
    confidence: 0..1
    bbox?: [x, y, w, h]   // for the confirmation overlay
    matchedItemClass?: ItemClass
  }>
  userConfirmedAt: timestamp | null
  userRejectedItemNames: string[]   // detection corrections
}
```

The photo flow: capture → detect → user confirms (single tap "looks right" or per-item delete chips) → write to PantryItem rows. Detection runs server-side via Anthropic (vision-capable model) — same `ANTHROPIC_API_KEY` that lights up the W28 voice / W35 picker / W41 extractor.

### 3.3 IngredientAromaProfile (the novelty-engine substrate)

```
IngredientAromaProfile {
  itemClass: ItemClass
  aromaCompounds: Array<{ id: string; intensity: 0..1 }>
}
```

Static seed file (`src/data/aroma-profiles.json`) sourced from publicly-documented food-chemistry data, expressing each item class as a vector of aroma-compound IDs and relative intensities. The novelty engine computes pairing scores via cosine-similarity of these vectors. Real-mode upgrade later: per-item profiles refined from the Foodpairing API or an internal lab-derived table.

### 3.4 NoveltySuggestionLog

```
NoveltySuggestion {
  id, userId
  surfacedAt
  ingredientItemClasses: ItemClass[]
  suggestedDishName: string
  suggestedDishType: "sandwich" | "salad" | "pasta" | "snack-board" | etc.
  noveltyScore: 0..1
  pairingExplanation: string   // one sentence — "ham + pear share fruity-sweet aroma"
  userResponse: "accepted" | "skipped" | "ignored" | null
  cookSessionId: string | null  // if accepted + completed
}
```

Persisted log lets the engine A) avoid re-suggesting the same combination within a 30-day window and B) train the novelty score against real acceptance data. Same shape as the Y2 W42 viral chip cool-down state.

### 3.5 BigBatchTagging on existing recipe schema

Augments existing user-recipe + seed-recipe shapes with two optional fields:

```
RecipeAugment {
  isBigBatch: boolean                // does this recipe yield leftover-volume?
  expectedLeftoverItems: ItemClass[] // what survives for next-day use
  successorRecipeSlugs: string[]     // 2-4 follow-on recipes
}
```

Curation note: applies to the seed catalog directly (Stefan-curated). User-authored recipes stay opt-in via a single toggle in the recipe editor.

### 3.6 MealPlanWeek

```
MealPlanWeek {
  id, userId
  weekKey                              // "2026-W19" (matches Y2 W36 token shape)
  scheduled: Array<{
    daySlot: "mon-dinner" | "tue-lunch" | etc
    recipeSlug: string
    source: "swipe-planned" | "leftovers-auto" | "manual" | "shopping-list-write-back"
  }>
  pantryCoverageSnapshot: { coverage: 0..1; missing: ItemClass[] }
  swipePlannedAt: timestamp | null
}
```

A planned week is a small object — at most 21 slot entries (3 meals × 7 days). The "scheduled" slots persist; everything else is derived.

---

## 4. Architecture — engine layer

### 4.1 The pantry photo pipeline

```
takePantryPhoto()
  → uploadToR2()
  → analyzeWithAnthropicVision()   // bounded prompt, structured output
  → presentDetectionsToUser()      // tap-to-accept-all flow
  → writePantryItems()             // merges with existing inventory
```

The Anthropic vision call uses a structured-output schema requiring an array of `{candidateName, confidence, itemClass}` so the response is parseable without prose extraction. Same defence-in-depth as the W28 conversation fallback — capped response length, validated against the closed `ItemClass` taxonomy, off-list items rejected. Stub mode (no API key) returns a 6-item demo fixture so the UX flows through without keys.

### 4.2 The novelty engine

```
generateDailyNovelty(pantry, userHistory, now)
  → enumerateFeasibleCombinations(pantry, maxIngredients=4)
  → scorePairing(combo) via aroma-compound cosine
  → discountByUserFamiliarity(combo, userHistory)
  → discountByRecentSuggestion(combo, NoveltySuggestionLog)
  → top-1 by novelty * pairing-feasibility
  → mapToCanonicalDishShape(combo)   // "ham + pear + cheese" → "argyle pear sandwich"
```

The `mapToCanonicalDishShape` step uses a curated 200-pattern dish-shape lookup so the engine can NAME its suggestions concretely rather than emitting "ham, pear, sharp cheese." Each pattern is a tuple of (required-ingredient-classes, optional-classes, dishName, prepTimeMin, oneShotInstructions). Stefan-curated; ships as `src/data/dish-shape-patterns.json`.

### 4.3 The pantry-aware recipe colorizer

```
colorizeRecipeIngredients(recipe, pantry)
  → for each recipe.ingredient:
      match against pantry by canonicalName + ItemClass
      → status: "have" | "low" | "missing"
      → colorBadge: green | yellow | outline
```

Pure function. No AI call. The Y2 W15 pantry-coverage helper already ships the matching layer; this function adds the per-line status output the recipe view needs to render.

### 4.4 The swipe-to-plan generator

```
generateSwipeCardPool(pantry, userHistory, dietaryUnion, weekKey)
  → seedCandidates from {seed catalog, user drafts, bigBatch successors}
  → filter by pantryCoverage >= 0.7
  → filter by dietary union
  → score by (recency-of-last-make + cuisine-rotation + ease-of-prep)
  → return top 12 (enough for 7 right-swipes with skip headroom)
```

The user sees one card at a time. Swipe right → write to MealPlanWeek.scheduled. Swipe left → skip + decrement that recipe's surface-rate for next week. Swipe up → "twist" — re-emit a similar card with one ingredient swapped for novelty.

### 4.5 The leftovers successor engine

```
onCookComplete(recipe, win-screen)
  → if recipe.isBigBatch:
      successors = recipe.successorRecipeSlugs
      filter successors by current pantry coverage post-this-cook
      pick top-1 by user-history rotation
      → render "Tomorrow's lunch?" chip with one-tap accept
```

Single-tap acceptance writes the successor into the next-day lunch slot of the active MealPlanWeek. Falls back gracefully when no MealPlanWeek exists — creates a stub one with just that single slot.

---

## 5. Architecture — UX layer

### 5.1 Pantry photo capture (the haul shot)

Surface: `/path/pantry/scan`. Camera captures one image. Loading state runs the Anthropic call (~3-5 seconds). Result screen shows the photo with detected-item chips overlaid as semi-transparent labels. User taps "looks right" (single primary action) or taps individual chips to remove false positives. Confirm → pantry updates, route returns to wherever the user came from.

UX guard: never-block the user. If detection takes >8 seconds, the result screen shows a spinner with "still finding things — keep going" + a "skip this and add manually" affordance.

### 5.2 The daily novelty card on `/today`

Single chip on the Today page, between cook-again (Y2 W13) and the friends strip. Curiosity-styled copy in the same shape as the Y2 W42 viral chip — never FOMO, always invitation. Tap → expanded card showing the suggested dish name, pairing explanation in one sentence, prep time, and the 3-4 ingredients (each with its color-coded "you-have" badge so the user sees instantly that no shopping is needed). Two actions: "make it tonight" (writes to today's dinner slot, opens cook flow) or "save for later" (stashes in a small archive).

UX discipline: the chip renders only when the daily-novelty score crosses a threshold. Some days the engine has nothing surprising to say — those days the chip simply doesn't render. NEVER fill the chip with a stale or low-novelty fallback.

### 5.3 Color-coded recipe rendering

Every recipe view (cook flow Mission step, recipe library card detail, viral chip preview) renders its ingredient list with the three-state badges. Subtle treatment: small dot at the start of each line, never the whole line backgrounded. Green → solid filled dot. Yellow → outlined dot with thinner stroke. Outline → outline dot with the lightest stroke. The visual hierarchy stays calm — the user can scan past the badges or read into them.

A11y: each badge has an aria-label ("In pantry", "Low or stale in pantry", "Need to buy"). Badges are reduced-motion safe (no animation).

### 5.4 The weekly swipe planner

Surface: `/path/plan` (new). One card at a time, full-width on mobile. Card shows: recipe hero image, dish name in the serif heading, eyebrow-cased meal type ("DINNER · 25 MIN"), pantry-coverage strip ("you have 6 of 8"), and a single subtle pairing-rationale line. Three swipe directions: right (schedule), left (skip), up (twist). After 7 right-swipes a "your week is planned" celebration screen previews the calendar with one-tap "looks good" or per-slot "swap" affordances.

The card pool is generated upfront so the swipe is fast (no per-card LLM call). Twists DO call the novelty engine but only on demand. The full 7-card swipe runs end-to-end in well under 90 seconds even with twists.

### 5.5 The smart-leftovers chip on the win screen

Augments the existing Y2 W26 peak-end win screen. When `recipe.isBigBatch` is true, after the celebration confetti (existing) and the peak-end anchor copy (Y2), a single chip surfaces below: "Tomorrow's lunch?" with the suggested successor recipe name and a one-tap accept. Decline = no action; the chip fades on next render. Accept = next-day lunch slot writes to MealPlanWeek; a small toast confirms.

### 5.6 The pantry overview on `/path/pantry`

Existing pantry surface (Y2 W17 substrate) gains a refresh: items grouped by storage zone (pantry / fridge / freezer), each item showing a small expiration progress bar (full = fresh, narrow = expiring soon). The whole zone-grouped view is one screen on a 375px viewport — no scroll on a typical pantry.

---

## 6. Sprint integration into the Y3 plan

The 5-feature set is a major lift — too big for one sprint. Mapping to the existing Y3 plan structure:

| Y3 sprint                       | Feature contribution                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Sprint A (W1-W4)**            | Polish-week + color-coded recipe ingredient layer (W4 stretch) — pure rendering on existing data |
| **Sprint B (W5-W8)**            | Anthropic real-mode wire-up — also the founder-unlock for the photo-pantry + novelty engine      |
| **Sprint C (W9-W12)**           | Already scoped (Stage-3 Content); no overlap                                                     |
| **NEW Sprint M (W17-W20)**      | **Pantry photo pipeline + ItemClass taxonomy + IngredientAromaProfile seed**                     |
| **NEW Sprint N (W21-W24)**      | **Novelty engine + dish-shape pattern catalog + daily novelty card on /today**                   |
| **NEW Sprint O (W25-W28)**      | **Swipe-to-plan + MealPlanWeek schema + the /path/plan surface**                                 |
| **NEW Sprint P (W29-W32)**      | **Smart leftovers + BigBatchTagging on existing recipes + win-screen chip**                      |
| **Sprint G original (W25-W28)** | Bilingual / multi-language UX — **slips to W33-W36** to absorb the new sprints                   |
| Subsequent sprints              | All slip 16 weeks — Pod V3 (now W37-W40), Recipe import V2 (W41-W44), etc                        |

The Y3 plan grows from 12 sprints to 16 sprints + close. Trade-off: deferred sprints (annual recap, creator economy) move to Y4. That's the right call — pantry → novelty → planning → leftovers is a coherent product surface that compounds; deferring it would leave Sous shipping its sharpest differentiator a year later than necessary.

### Revised Y3 cadence

- A (W1-W4): Polish + color-coded ingredients [feature 1.3]
- B (W5-W8): Real-mode wire-up
- C (W9-W12): Content editorial substrate
- D (W13-W16): Capacitor wrappers
- E (W17-W20): Pantry photo pipeline + aroma profiles [feature 1.1]
- F (W21-W24): Novelty engine + daily card [feature 1.2]
- G (W25-W28): Swipe-to-plan + meal plan schema [feature 1.4]
- H (W29-W32): Smart leftovers + win-screen chip [feature 1.5]
- I (W33-W36): V3 trainer retune + V4 design (was Sprint E)
- J (W37-W40): Voice cook MVP 6 (was Sprint F)
- K (W41-W44): Bilingual / multi-language UX (was Sprint G)
- L (W45-W48): Pod V3 multi-pod membership (was Sprint H)
- W49-W52: Year-3 close + Y4 plan kickoff

Y4 carries forward: recipe import V2, charity bake-sale events, skill-tree depth, annual recap, creator economy.

---

## 7. Founder-unlock dependencies

This feature set adds two new founder-unlock concerns:

| Slot                         | Action                                                                                       | Lights up                               |
| ---------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| **Vision-capable Anthropic** | already-shared `ANTHROPIC_API_KEY`                                                           | Pantry photo detection (no new env var) |
| **Aroma-profile data**       | (substrate decision) ship public seed; later licence Foodpairing or build internal lab table | Novelty engine pairing scores           |

The aroma-profile data is the gating decision. Three paths:

1. **Public seed (V1):** ship a hand-curated `aroma-profiles.json` with ~120 item-class entries derived from publicly-documented food-chemistry literature. Original prose, no licensed data.
2. **Foodpairing API integration (V2):** if the founder negotiates a Foodpairing licence, the engine swaps the seed for the API. Same engine code path, different data source.
3. **Internal lab-derived table (V3):** if Sous ever invests in food-chemistry analysis, build the internal table.

V1 ships first. V2 + V3 are flag-gated upgrades.

---

## 8. The Sous-Test compliance check

Every feature must answer: "If this is the only thing the user sees, does it make them cook?"

| Feature                     | Sous Test answer                                                                                    |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| 1.1 Pantry photo            | YES — the pantry IS the input to every cook decision; capturing it lowers every downstream friction |
| 1.2 Novelty engine          | YES — one suggestion, one tap to start cooking it                                                   |
| 1.3 Color-coded ingredients | YES — instantly converts "browsing" into "I can make this now"                                      |
| 1.4 Swipe planner           | YES, but only via downstream cook completions — direct contribution is delayed                      |
| 1.5 Smart leftovers         | YES — one tap on the win screen schedules tomorrow's cook                                           |

All five pass. Feature 1.4 is the weakest direct contributor but the highest-leverage compounder — a planned week of cooks dramatically increases sustained engagement, which is the load-bearing growth lever per the Stage-3 strategy.

---

## 9. Minimalism guardrails (CLAUDE.md rule 1, rule 2, rule 6)

The danger with this feature set is that each layer adds a new screen. The minimalism guardrails:

1. **Pantry photo flow:** no new top-level tab. Lives inside the existing `/path/pantry` surface as a "scan to update" affordance.
2. **Novelty card:** single chip on existing `/today`, BELOW the cook-again chip. Renders only when novelty-score crosses a threshold. NEVER fills with a fallback.
3. **Color-coded ingredients:** zero new screens. Inline rendering only.
4. **Swipe planner:** new surface at `/path/plan`. ONE primary action per card (swipe). 90-second budget end-to-end.
5. **Smart leftovers:** zero new screens. Inline chip on the existing win screen.

Total new top-level surfaces: ZERO. Total new sub-routes: ONE (`/path/plan`). Total new modal flows: ONE (the haul-shot capture, which is a sheet over `/path/pantry`).

---

## 10. Behavioural overlays this feature set ties into

The 9 Y2 behavioural overlays compound naturally:

- **Implementation intentions** (W21): "Saturday afternoon — let's plan the week's swipe" surfaces the planner via the existing rhythm scheduler.
- **Identity reinforcement** (W21): "You've cooked from photo-pantry 12 weeks running" — the planner becomes part of the user's identity.
- **Anchoring** (W13 cook-again chip): the leftovers chip is structurally identical — "you made the chicken yesterday → tomorrow's lunch is one tap away."
- **Variable reward** (W42): the daily novelty card IS the variable-reward surface for established users (curiosity-styled, never FOMO).
- **Reflection journaling** (W29): the post-week recap can ask "which novelty pick worked best this week?"

No new overlays needed.

---

## 11. Acceptance criteria for the feature set

Sprint-by-sprint acceptance:

- [ ] **Sprint A W4** — color-coded ingredient badges shipped on every existing recipe view; tests cover have/low/missing matrix; reduced-motion safe; aria-labels present.
- [ ] **Sprint E** — photo capture → Anthropic vision → confirmed PantryItem write end-to-end; stub mode returns deterministic 6-item fixture; real mode tested against a sandbox key.
- [ ] **Sprint F** — daily novelty card renders ONLY when score >= threshold; one suggestion per day; never duplicates within 30-day window; pairing-rationale always populated.
- [ ] **Sprint G** — swipe planner generates ≥ 12 candidates pre-swipe; 7-right-swipe flow completes in <90 sec on mobile; MealPlanWeek persists across page-reload.
- [ ] **Sprint H** — big-batch detection on cook completion; successor chip renders with single-tap accept; declines cleanly fade; planner integration tested.

Cumulative tests by end of Sprint H (Y3 W32): ≥ 2400. All four gates green throughout. 0 RCAs on main streak continues.

---

## 12. Risks + mitigations

| Risk                                                              | Mitigation                                                       |
| ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| Anthropic vision misclassifies haul photo items                   | Confirmation step is always in the loop; user can delete chips   |
| Aroma-profile public seed has gaps / inaccuracies                 | V1 substrate; founder-unlock V2 swaps to Foodpairing if licensed |
| Novelty engine surfaces stale "novel" picks                       | 30-day re-suggestion cool-down + threshold gate                  |
| Color-coded badges feel like nagging                              | Subtle dot-only treatment, never line-level highlighting         |
| Swipe planner becomes "yet another chore"                         | 90-second budget, opt-in trigger via rhythm-aware nudge          |
| Big-batch successor doesn't match user's actual leftover quantity | Single-tap accept, no quantity math required                     |

---

## 13. Out-of-scope for this feature set

- Quantitative pantry tracking ("3.4 oz remaining") — too high a friction-tax. Coarse "low / medium / high" suffices.
- Barcode scanning — defer to a later sprint when haul-photo coverage is unclear.
- Supermarket-delivery integration — explicit non-goal per Sous's positioning.
- Receipt-OCR ingestion — same friction concern as barcode; haul-photo is the primary channel.
- Calorie / macro tracking — explicit non-goal per the Stage-1 strategy.

---

## Sources (synthesised, not reproduced)

The plan synthesises patterns + capabilities from these public sources. None of the linked content is reproduced here; original Sous prose throughout.

- [Best Pantry Inventory App and Fridge Management Tool — Portions Master](https://portionsmaster.com/blog/best-pantry-inventory-app-and-fridge-management-tool/)
- [The 10 Best Meal Planning Apps in 2026 (Ranked & Compared) — FoodiePrep](https://www.foodieprep.ai/blog/meal-planning-apps-in-2026-which-tools-actually-simplify-your-kitchen)
- [Best meal planning apps in 2026: an honest comparison — Cooking with Robots](https://cookingwithrobots.com/blog/best-meal-planning-app-2026)
- [The Best Meal-Planning Apps in 2026 (Ranked) — Ollie](https://ollie.ai/2025/10/21/best-meal-planning-apps-in-2025/)
- [A 7-Day Meal Plan Using a Rotisserie Chicken — Taste of Home](https://www.tasteofhome.com/collection/7-day-meal-plan-rotisserie-chicken/)
- [IBM's AI computer has come up with some pretty incredible food pairings — QZ](https://qz.com/381226/ibms-ai-supercomputer-has-come-up-with-some-pretty-incredible-food-pairings)
- [Cognitive Cooking with Chef Watson — Next Nature](https://nextnature.org/en/magazine/story/2017/chef-watson)
- [AI and the Future of Flavour — FoodUnfolded](https://www.foodunfolded.com/article/ai-and-the-future-of-flavour)
- [Gamified AI Meal Planning: Meal Genius — TrendHunter](https://www.trendhunter.com/trends/meal-genius)
- [MatchMyMeal — Swipe. Match. Eat.](https://matchmymeal.app/)
- [Gamification preferences in nutrition apps — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11168059/)
- [KitchenPal — Pantry & Shopping App](https://kitchenpalapp.com/en/)
- [Cooklist — Pantry Meals Recipes (App Store)](https://apps.apple.com/us/app/cooklist-pantry-meals-recipes/id1352600944)
- [Pantry — AI Recipe Generator iPhone App](https://pantry.pfriedrix.com/)
- [Smart Kitchen: AI Pantry — Google Play](https://play.google.com/store/apps/details?id=pantry.inventory.kitchen.organizer&hl=en)
