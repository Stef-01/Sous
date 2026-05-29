# Parent Mode — Feature Plan

> **Authored:** 2026-05-01
> **Reads from:** [`PARENT-MODE-RESEARCH.md`](./PARENT-MODE-RESEARCH.md)
> **Feeds:** [`STAGE-1-2-6MO-TIMELINE.md`](./STAGE-1-2-6MO-TIMELINE.md)
> **Status:** Design ready for review. Implementation week-by-week is in the timeline doc.
> **Karpathy guard:** Surgical changes only. Every new field, hook, and surface must trace to a research signal in the research doc. No speculative flexibility.

---

## 1. Goal & success criteria

**Goal:** A parent opens Sous on a Tuesday at 5:30pm and within 60 seconds has a meal that the 6-year-old will eat AND the parent will enjoy — without cooking twice, without dumbing the recipe down, and with one nutrition takeaway worth knowing.

**Success criteria (measurable):**

1. **Recommendation accuracy**: Parent Mode users rate ≥ 70 % of suggested meals 4★+ "everyone ate it" within 6 weeks of toggle-on.
2. **No cook-twice tax**: ≥ 80 % of recommended meals can be served as one base recipe (no separate kid version required).
3. **Nutrition surface recall**: ≥ 30 % of Parent Mode users can recall one nutrient call-out they saw in the past week (post-launch survey).
4. **No new tabs, no settings page, ≤ 3 net new screens** (CLAUDE.md rule 3 + 6 + 11 hard constraints).
5. **Zero unauthorized health/disease claims** in production UI copy. Every string passes the SAFE/UNSAFE cheatsheet in research §4.4.

**Non-goals (explicit):**

- Tracking child weight, height, or BMI.
- Diagnosing eating disorders, ARFID, allergies.
- Creating per-child profiles. Household-level only.
- Meal-kit fulfillment or grocery delivery.
- Replacing a registered dietitian.

---

## 2. The user mental model

A Parent Mode user toggles ONE thing. After that:

- The **Today quest card pool** rebalances toward kid-acceptable + adult-tasty intersections.
- The **guided cook flow** quietly inserts a few kid-aware moments (spice slider, "components on the side" toggle on the final assembly step, optional "plate it for the kid" cue).
- The **win screen** asks one extra two-tap question ("Did the kids eat it?") whose answer tunes future suggestions.
- A **subtle nutrient line** appears on a recipe that genuinely qualifies — never on every card. Quiet by default.
- A **content track** (Articles, Reels, Research) re-orders to show parent-relevant items higher.

That's the whole product surface. Everything else is plumbing.

---

## 3. Architecture

### 3.1 Where Parent Mode lives in the stack

```
src/
  types/
    parent-mode.ts          # NEW: ParentProfile, KidFriendlinessSignals, NutrientFlag
    nutrition.ts            # NEW: per-recipe nutrition shape + FDA-DV thresholds
  data/
    nutrition/
      dri-pediatric.ts      # NEW: DRI table by age band (research §3.2)
      fda-dv.ts             # NEW: FDA Daily Values table (children 4+)
      claim-thresholds.ts   # NEW: high-in / good-source / low-in cutoffs
      safe-phrasings.ts     # NEW: claim → approved sentence template
    meals/
      kid-friendliness/
        labels.json         # NEW: 8-field label per meal slug (hand-curated)
  lib/
    engine/
      scorers/
        kid-friendliness.ts # NEW: 7th scorer (joins existing 6)
      parent-mode/
        rebalance.ts        # NEW: re-weights pairing-engine output if PM on
        nutrient-spotlight.ts # NEW: picks 0-1 nutrient call-out per meal
        kid-swap-suggestor.ts # NEW: deterministic + AI swap suggestions
    hooks/
      use-parent-mode.ts    # NEW: profile + toggle, localStorage
      use-spice-tolerance.ts # NEW: 1-5 household default
      use-kids-ate-it.ts    # NEW: post-cook two-tap, feeds rebalancer
      use-exposure-log.ts   # NEW: 4-6 exposure tracker per ingredient
  components/
    today/
      parent-toggle-chip.tsx   # NEW: contextual one-tap chip on Today header
      kid-friendly-hint.tsx    # NEW: subtle line on QuestCard when PM on
    guided-cook/
      spice-slider.tsx         # NEW: 1-5 inline slider on relevant steps
      component-split-toggle.tsx # NEW: final-assembly branch
      kid-swap-chip.tsx        # NEW: "Make it kid-friendly" → 2-3 swaps
    shared/
      nutrient-spotlight-line.tsx # NEW: subtle one-line callout
      nutrient-info-tooltip.tsx   # NEW: "i" → methodology
    win-screen/
      kids-ate-it-prompt.tsx   # NEW: 2-tap (Yes / No / Some)
      lunchbox-suggest-chip.tsx # NEW: "Tomorrow's lunchbox" one-tap
    content/
      parent-track.tsx          # NEW: parent-relevant content reorder
```

**Net surface:** 5 new types/data files, 3 new engine modules, 4 new hooks, 8 new components. Zero new tabs. Zero settings pages.

### 3.2 Data flow

```
ParentMode toggle ON
   │
   ▼
useParentMode → mounts on Today + guided cook + win screen
   │
   ▼
QuestCard pool ─── pairing-engine + kid-friendliness scorer rebalances
   │
   ▼
Recipe selected → guided cook ─── spice slider + component split toggle render conditionally
   │
   ▼
Win screen ─── KidsAteIt prompt → useKidsAteIt logs result
   │                              → feeds preference vector for next session
   ▼
NutrientSpotlight ─── per-meal: pick top 1 nutrient passing threshold + safe phrasing
   │                              → render only if ≥ 1 qualifies
   ▼
Content tab ─── parent-track reorders Articles, Reels, Research by parent-relevance tags
```

---

## 4. Surface-by-surface design

### 4.1 The toggle (Profile & Settings sheet — W9 design pivot)

**Where it lives:** A new **Profile & Settings sheet** opened by tapping the owl mascot in the top-right of the Today header. The sheet is a bottom sheet (NOT a tab — bottom nav stays Today · Path · Content). The Parent Mode toggle + age band picker live inside this sheet alongside a profile placeholder (until Stage 2 W13 Clerk lands) and an about/disclaimer block.

**CLAUDE.md rule 3 amendment:** This sheet is the single permitted exception to the "no settings pages" rule. The amendment is captured in CLAUDE.md rule 3 itself. New configuration UI must NOT pile into the sheet without a written rule-3 amendment.

**Why the mascot button:** Search (the mascot's previous tap target) keeps its primary entry via `CravingSearchBar` directly below the header, so repurposing the mascot is non-destructive. The mascot was already a visible "you" affordance in the profile-position slot; making it the actual profile entry is what users expect.

**First-time capture (unchanged):**

- During the existing coach quiz (first visit), the new "Who's at the table tonight?" question (W7) captures: `Just me`, `Adults only`, `Toddlers (1–3)`, `Little kids (4–8)`, `Big kids (9–13)`, `Mixed ages`.
- A kid-bearing answer auto-enables Parent Mode with the matching age band; the user can change either via the sheet thereafter.

**Sheet sections (W9 V1):**

1. **Profile** — placeholder block; real auth lands in Stage 2 W13.
2. **Parent Mode** — toggle (animated rocker) + Age band picker (5 chips: 1–3, 4–8, 9–13, 14–18, Mixed) shown only when PM is on. Includes the standard inline disclaimer.
3. **About** — free-public-good positioning + sample-content reminder.

**Persistence:** `localStorage:sous-parent-mode-v1`.

```ts
interface ParentProfile {
  enabled: boolean;
  ageBand: "1-3" | "4-8" | "9-13" | "14-18" | "mix";
  spiceTolerance: 1 | 2 | 3 | 4 | 5;
  flaggedAllergens?: string[]; // post-V1
  enabledAt: string; // ISO
}
```

### 4.2 Today quest card pool

**Behavior change when PM on:**

1. The 7th scorer (`kid-friendliness.ts`) joins the existing 6 (cuisine-fit, flavor-contrast, nutrition-balance, prep-burden, temperature, preference) in `pairing-engine.ts`.
2. `parent-mode/rebalance.ts` re-weights so kid-friendliness has weight ≈ 0.25 of total, sliding without dominating.
3. Pool composition tilts toward dishes flagged `parentModeEligible: true` (an optional curated allow-list maintained as a `meals/kid-friendliness/labels.json` annotation; not required for inclusion, just a boost).
4. **Existing dishes with high kid-friendliness scores keep their normal slot** — no separate kid-recipe catalog, just a re-ranking.

**QuestCard subtle additions when PM on:**

- A 9-pt line below the rationale: _"Kids tend to like this — based on familiar carrier (rice) and mild spice."_ Optional, only shown when `kidScore` ≥ threshold.
- A `Make it kid-friendly` chip next to the existing "Reroll" / "Save" actions (only on dishes scoring middle-of-the-road; high-scoring dishes don't need it; low-scoring dishes won't be in pool).

### 4.3 Guided cook spice slider

**Where:** Inline on any cook step that mentions a chili/cayenne/heat-bearing ingredient.

**UI:** A 1–5 dot slider with a one-line preview ("0–1 = paprika only · 5 = full heat"). Tapping rewrites the step instruction text inline (deterministic find-replace on chili amounts: 1 = drop chili, 2 = ¼ amount, 3 = ½, 4 = ¾, 5 = full).

**Persistence:** Household default in `use-spice-tolerance.ts` (localStorage). Per-recipe override is session-only.

**No AI required.** This is a deterministic transform on the recipe step text. Cheap, fast, reliable.

### 4.4 "Make it kid-friendly" chip on quest cards

**Trigger:** Tap the chip → bottom sheet with 2–3 swap suggestions.

**Logic:**

1. **Deterministic first.** Given the recipe's `bitter_load`, `smell_intensity`, `texture_risk`, `visible_green_flecks`, `heat_level`, generate canned swap candidates from a lookup table:
   - bitter_load ≥ 2 → "Swap arugula for romaine" / "Skip the radicchio"
   - smell_intensity ≥ 2 → "Use mild cheddar instead of blue cheese" / "Skip the fish sauce"
   - heat_level ≥ 3 → "Halve the chili" / "Serve chili oil on the side"
   - visible_green_flecks → "Garnish only the adult plates"
   - texture_risk ≥ 2 → "Roast instead of stew" / "Crisp the bottom"

2. **AI fallback** for recipes the lookup table doesn't cover well: a single AI call to `ai.suggestKidSwaps` (mock-fallback compatible with existing AI provider abstraction) returns 2–3 swaps.

**Persistence:** Selected swap saved per-recipe via the existing recipe-overlay system (`useRecipeOverlays`).

### 4.5 Component split toggle on the guided cook final step

**Where:** Only on the final-assembly step of recipes flagged `deconstructable: true`.

**UI:** A toggle: _"Plate it: One bowl · Adult & kid plates"_.

**Off (default):** existing single-step instruction.

**On:** the step splits into two parallel finishing strips — adult plate (full sauce, all herbs, full spice) vs. kid plate (sauce on the side, no green flecks, mild spice). Both strips show in a 2-column layout.

**No new screen.** Just a step branch.

### 4.6 Win screen "Did the kids eat it?" prompt

**Where:** After the existing star rating, a small two-tap row.

**UI:** _"Did the kids eat it?"_ `Yes` / `Some` / `No`.

**Effect:**

- Logs to `useKidsAteIt`.
- Feeds the recommendation engine: "yes" boosts similar dishes; "no" suppresses similar attribute clusters for ~14 days.
- Counts toward the exposure log if the dish has a tracked target ingredient (4–6 exposures per ingredient before liking is expected).

### 4.7 "Tomorrow's lunchbox" one-tap on win screen

**Where:** Below the existing reflect / share actions.

**UI:** A chip: _"Pack it for tomorrow's lunchbox?"_ → opens a bottom sheet with a one-paragraph "How to repurpose this for a lunchbox" tailored to the dish (cold-friendly variant, container shape, what to swap if it doesn't travel).

**No new route.** Bottom sheet only. Article-link to the Content tab if the dish has a matching lunchbox piece.

### 4.8 Nutrient spotlight line

**Where:** A single line at the bottom of the QuestCard back-face AND on the Win screen "Reflect" panel — when, and only when, a meal qualifies for an FDA-safe call-out.

**Logic:** `nutrient-spotlight.ts` walks the recipe's per-serving nutrition data, applies FDA thresholds (≥ 20 % DV → high in; ≥ 10 % DV → good source), and picks ONE nutrient using priority order:

1. Calcium, vitamin D, iron — public-health priorities for kids per DGA.
2. Fiber, potassium — secondary priorities.
3. Vitamin A, omega-3 ALA, zinc, magnesium, B12, choline — tertiary.

Then renders the matching `safe-phrasings.ts` template:

```
"Good source of calcium — calcium and vitamin D help build strong bones."
```

If no nutrient qualifies, the line doesn't render. Quiet by default.

**Tooltip:** A small `i` opens a sheet with: source attribution (USDA FoodData Central / NIH ODS), the exact %DV calculated, the standard disclaimer (research §4.5), and a link to the methodology page.

### 4.9 Content tab parent track

**No new tab.** When PM is on, the Content tab's `For You` section reorders to put parent-relevant articles, reels, and research briefs higher. Same components, same layout, different ranking.

**Tag schema:** Add `audience: 'parent' | 'general'` to existing content items (additive, default `general`).

**Featured hero carousel:** Already supports a `featured: true` flag; PM-on uses a `featured + parent`-tagged item if available, else falls back to the general featured set.

---

## 5. The 8 prerequisite chains

Parent Mode does not stand alone. These prerequisites must be confirmed (or built) before each surface ships. Items marked **EXISTS** are already in the prototype; items marked **NEEDS BUILD** are scope for the timeline.

### 5.1 Profile system → toggle

- **EXISTS:** Coach quiz infrastructure for one-time preference capture.
- **NEEDS BUILD:** `useParentMode` hook + chip component + extending coach quiz with the "Who's at the table?" question.

### 5.2 Recipe metadata → kid-friendliness scorer

- **EXISTS:** `meals.json` has cuisine, ingredients, prep time, taxonomy tags.
- **NEEDS BUILD:** 8-field `kid-friendliness/labels.json` covering at minimum the top 60 quest-card-eligible meals. Hand-curated. ~30 sec/meal × 60 = 30 min total per labeling pass.

### 5.3 Pairing engine → 7th scorer + rebalancer

- **EXISTS:** 6-scorer pipeline + ranker + explainer.
- **NEEDS BUILD:** `kid-friendliness.ts` scorer (slot into existing scorer interface), `parent-mode/rebalance.ts` weight adjuster.

### 5.4 Nutrition data layer → spotlight + claims

- **DOES NOT EXIST.** Recipes have ADA-plate categories (veg/protein/carbs) only.
- **NEEDS BUILD:** Per-recipe per-serving nutrition shape, ingredient-to-nutrient map (USDA FoodData Central import, ~80 hours), or third-party API (Edamam, Spoonacular — paid). Build vs. buy decision deferred to research §6.2 open question 1.

### 5.5 AI provider → swap suggestions

- **EXISTS:** `ai.suggestSubstitution` already in the tRPC AI router.
- **NEEDS BUILD:** New `ai.suggestKidSwaps` endpoint + mock-provider deterministic fallback.

### 5.6 Recipe overlay system → spice slider + swap memory

- **EXISTS:** `useRecipeOverlays` already supports per-step overrides and personal notes.
- **REUSE:** Spice-slider override and saved kid-swap selections both write to the existing overlay layer.

### 5.7 Win screen → kids-ate-it + lunchbox chip

- **EXISTS:** Win screen with star rating, note, photo, save, reflect.
- **NEEDS BUILD:** Two new components inserted below existing rows. No layout reorganization.

### 5.8 Content tab → parent track

- **EXISTS:** Content tab + filter strip + featured-hero carousel.
- **NEEDS BUILD:** Additive `audience` tag on content items + a feature-flagged ranking pass.

---

## 6. The five steal-from-competitors features (status check)

| #   | Feature                        | Plan section |
| --- | ------------------------------ | ------------ |
| 1   | Household Spice Slider         | §4.3         |
| 2   | "Make it Kid-Friendly" chip    | §4.4         |
| 3   | "Did the kids eat it?" two-tap | §4.6         |
| 4   | Component split toggle         | §4.5         |
| 5   | "Tomorrow's Lunchbox" one-tap  | §4.7         |

All five integrated into existing surfaces. Zero new tabs. Zero settings page. ≤ 3 net new screens (the bottom-sheet for swaps, the bottom-sheet for lunchbox, the methodology tooltip).

---

## 7. Sous-specific design contracts

### 7.1 The Sous Test (CLAUDE.md rule 1)

Parent Mode must pass: _"If this is the only thing the user sees, does it make them cook?"_

- The **toggle** alone does nothing user-visible — fail in isolation, but it's a hidden plumbing primitive.
- The **kid-friendliness hint on QuestCard** answers "will my kid eat this?" → drives cook decision. Pass.
- The **spice slider** removes the #1 friction parents have when starting a recipe. Pass.
- The **kids-ate-it** prompt is post-cook, not pre. Doesn't apply to the test (it's the loop that improves _next_ night).
- The **nutrient spotlight** is informational; it doesn't drive the cook decision but reinforces it. Acceptable as a quiet supplement.

### 7.2 One primary action per screen (CLAUDE.md rule 2)

The QuestCard already has `Cook this` as the primary action. The "Make it kid-friendly" chip is visually subordinate (smaller, less weight). Same for nutrient line. Pass.

### 7.3 No settings pages (CLAUDE.md rule 3)

Parent Mode is captured through the coach quiz and toggled via a chip on Today. No settings panel. Pass.

### 7.4 Quest shell consistency (CLAUDE.md rule 4)

Parent Mode dishes still flow through Mission → Grab → Cook → Win. The component split is a final-step branch, not a separate flow. Pass.

### 7.5 Simplicity-first UI (CLAUDE.md rule 6)

Every new element earns its pixel space:

- Kid hint line: only shows when score is high enough.
- Nutrient spotlight: only shows when a nutrient qualifies.
- Spice slider: only shows on heat-bearing steps.
- Component split toggle: only on `deconstructable` recipes.
- Kids-ate-it: post-cook only.

All conditional. Quiet by default. Pass.

### 7.6 No invented recipes or images (CLAUDE.md rule 7)

Parent Mode does not introduce new recipes. It re-ranks the existing meal/side catalog and adds metadata fields. Pass.

### 7.7 No-scroll navigation (CLAUDE.md rule 10)

All new elements either inline or push existing content. None push the primary CTA off the fold. Pass — verify in the 375×667 audit before merge.

### 7.8 Sample-content guardrails (CLAUDE.md rule 11, Stage 3 extension)

Nutrient claim copy is generated programmatically from `safe-phrasings.ts` templates that pass the SAFE/UNSAFE cheatsheet (research §4.4). Every string visible in production must be either a template output or a literal verbatim FDA-authorized health claim. No free-form AI-generated nutrient claim copy. Pass.

---

## 8. Acceptance criteria (before each surface ships)

| Surface                   | Acceptance                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Toggle                    | One-tap on/off, persists across reload, hides itself when off.                                                      |
| Kid-friendliness scorer   | Ranks 60 hand-labeled meals such that the top-12 are all rated "everyone ate it" by ≥ 4 of 5 internal-test parents. |
| QuestCard kid hint        | Renders only when `kidScore ≥ 0.65`; copy passes SAFE cheatsheet.                                                   |
| Spice slider              | Inline on all chili-bearing steps; deterministic text rewrite tested across 10 recipes.                             |
| Make-it-kid-friendly chip | Returns 2–3 deterministic swaps for the 60 labeled meals; AI fallback latency ≤ 2.5 s p95.                          |
| Component split           | Renders on `deconstructable: true` recipes only; both plates visible without scroll on 375×667.                     |
| Kids-ate-it prompt        | Two-tap completion; result feeds rebalancer within 1 s; suppression logic tested via a unit test.                   |
| Lunchbox chip             | Bottom sheet copy is recipe-aware; links Content article when one exists.                                           |
| Nutrient spotlight        | Renders only when ≥ 1 nutrient passes FDA threshold; copy generated only from `safe-phrasings.ts`.                  |
| Methodology tooltip       | Lists USDA + NIH ODS sources, includes the standard disclaimer verbatim, links methodology page.                    |
| Content parent track      | Reorders existing items only; no new content surface; falls back gracefully if no parent-tagged item exists.        |

---

## 9. Open questions resolved (and where)

| Question (research §7)           | Resolution                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Build vs. buy nutrition data?    | Decision in timeline week 7. Default: USDA FoodData Central import (free, ~80 h) unless a partner deal lands. |
| Age band UI default?             | Default 4–8 silently. Captured optionally via coach quiz.                                                     |
| Allergen system as prereq?       | Post-V1. Parent Mode V1 ships without allergen filtering; V1.1 adds it.                                       |
| Auth (Clerk) before or after PM? | After. PM ships on localStorage profile; Clerk in production-hardening wave.                                  |
| Editorial workflow?              | V1 keeps `(sample)` Content authors. V1.1 explores partner attribution.                                       |

---

## 10. What this plan deliberately does NOT do

- **No child-specific dietary prescriptions.** Everything is general guidance with the standard disclaimer.
- **No tracking of child weight, height, BMI, or health metrics.**
- **No AI-generated nutrient claim copy.** Templates only.
- **No new tab.** Toggle, hint, slider, chip, prompt, line — all integrated into existing tabs.
- **No paywall in V1.** PM is free at launch. Re-evaluate after 6 months of usage data.
- **No chatbot, no AI parenting advice.** Coach persona stays bounded.

---

Continue to [`STAGE-1-2-6MO-TIMELINE.md`](./STAGE-1-2-6MO-TIMELINE.md) for the week-by-week build plan.
