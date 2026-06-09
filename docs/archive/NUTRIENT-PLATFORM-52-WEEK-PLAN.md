> **⚠️ SUPERSEDED (2026-06-08) by `SOUS-COMPREHENSIVE-YEAR-PLAN.md`.** That redraft
> widens this nutrient-only plan into a comprehensive product year plan with three
> added tracks (UI animation/engagement, frictionless logging, expanded Ayurveda).
> This document's nutrient track continues there as **Track D**; keep it for the
> deep appraisal + shipped detail.

# Sous Nutrient & Ingredient Platform — Deep Appraisal + 52-Week Plan

_Authored 2026-06-06. Grounds: the live Sous nutrition infra map, two external
research passes (open-source repos + canonical data sources), and the macro-ring
UI already shipped (`e1aa9c1`). Follows rule 12 (AUTO-BUILD vs FOUNDER-GATED)
and rule 13 (minimal text, disclosure on demand)._

---

## ✅ SHIPPED STATUS (updated 2026-06-07)

~35 of the 52 weeks are built, each implemented → adversarially reviewed → fixed
→ committed, all green (3286 tests). The catalogue now shows real,
ingredient-composed nutrition for **88% of dishes (276 of 314), up from 40%** —
authored ingredient lists for 139 previously-blank dishes and grew the registry
121 → 148. The recursive-review loop caught and fixed a **critical false-safety
allergen bug** (173/219 dishes falsely "gluten-free"), a branded-zeros-fabricate-
deficits honesty bug, a deep-frying-oil over-count (3995 → 1393 kcal), 7
regressions, a science overstatement, an over-precise %DV claim, and a misleading
protein nudge — none of which single-pass work would have caught.

| Weeks   | Feature                                                                                                                                                                          | Status       |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| W1–W5   | ~50-nutrient panel from real USDA FDC data (B-vitamins, all minerals, amino acids); grouped complete summary                                                                     | ✅ `f406519` |
| W6–W8   | "Info" restructure → macro ring + ingredients-to-check + side-pairing detail                                                                                                     | ✅ `5165ae4` |
| W12     | Platform regression hardening (11 found → 7 fixed)                                                                                                                               | ✅ `eae7207` |
| W14     | Protein quality (DIAAS-lite, ≥1.0 = complete)                                                                                                                                    | ✅ `8776cd3` |
| W15–W17 | Daily nutrition diary + day dashboard + deficit insight                                                                                                                          | ✅ `d49019c` |
| W24–W25 | Nutrient-density score + weekly trends                                                                                                                                           | ✅ `73d5873` |
| W27     | Bioavailability tips (vitamin C↔iron, fat-soluble vitamins)                                                                                                                      | ✅ `8774f87` |
| W29–W31 | Deficiency-aware side reranking (Data×Engine moat)                                                                                                                               | ✅ `4dcfb9c` |
| W32     | Meal-plan balance rollup (food-group variety, honestly framed)                                                                                                                   | ✅ `8692d3b` |
| W34     | Dietary + allergen transparency (safety-redesigned: never asserts "free")                                                                                                        | ✅ `56d5f17` |
| W35     | Ingredient-coverage transparency ("from N of M ingredients")                                                                                                                     | ✅ `31ac7d7` |
| W11     | Registry growth 112 → 121 ingredients; fully-resolved dishes 45 → 66                                                                                                             | ✅ `efc8dce` |
| —       | Coverage-floor const consolidation                                                                                                                                               | ✅ `c82bb97` |
| W20–21  | Branded-food engine (Open Food Facts ODbL) in the diary + per-IP rate-limit/cache; cooked-only gap signals                                                                       | ✅ `25afa8f` |
| **#1**  | **Catalogue coverage: authored 139 dish ingredient lists + SIDE_INGREDIENTS source; registry 121 → 148; dishes showing nutrition 40% → 88% (127 → 276 of 314), no-data 139 → 2** | ✅ `a692905` |
| #2      | Quantity normalizer ("1 can" → 400 g; "to taste"/garnish excluded from coverage); deep-fry bath ≥1 cup = 10% absorbed                                                            | ✅ `870c52e` |
| #3      | Dietary inferer: stop eggplant→egg / butternut→butter false positives                                                                                                            | ✅ `5e27dab` |
| —       | Data quality pass: outlier scan fixed shirataki (855→87), pompano (96→236), bbq-ribs servings                                                                                    | ✅ `a77d476` |

**Remaining — a genuinely different character (deliberately not force-fit):**

- **Long-tail coverage (diminishing returns):** the last ~38 dishes sit below the
  0.7 floor on genuine specialty ingredients (banana heart, annatto, oxtail,
  bitter melon, papad) — one ingredient unblocks ~one dish past here. Catalogue
  is at 88%; the quantity-normalizer ("1 can"/garnish) and branded-food engine
  that used to live in this list are now SHIPPED (see table).
- **FOUNDER-GATED:** W22 barcode scanner · W42 clinician content review · W43
  personalized EER (needs NASEM coefficients) · W9–W10 personalized DRI (needs a
  profile + the pediatric DRI table extended past its public-health subset).
- **Polish:** W36–W39, W48–W52 — a11y (✅ done for the new surfaces), perf,
  regression, docs. **i18n is explicitly DEFERRED to the final public launch
  (post-beta), per founder direction (2026-06-07) — it is not a beta deliverable
  and must not be scheduled into beta work.**

The high-Sous-value AUTO-BUILD nutrition work is functionally complete: cook →
log → the engine learns your gaps → it suggests sides that close them, with
honest, safety-reviewed data throughout.

---

## Part 1 — Deep critical appraisal: does this work frictionlessly + at scale?

### 1.1 What the user actually asked for

Three intertwined product moves:

1. **A real nutrient platform** — not just cal+macros, but the full Cronometer-style
   picture: a macro ring, macronutrient targets, key micronutrients, and an
   expandable complete summary (vitamins, minerals, amino acids).
2. **An "Info" surface** (renamed from "Health") that fuses **health context +
   nutrition + an ingredients-to-check list**, so a user can decide _before
   committing to cook_ — "do I even have these ingredients?"
3. **The same Info, tappable, on side pairings** — so the decision ("do I want to
   make this?") happens at the pairing step too.

### 1.2 The core insight — Sous is ~70% there already

The expensive part of a nutrient platform is the **ingredient→nutrient engine**,
and Sous already has a real one:

- `src/lib/nutrition/compose.ts` — deterministic per-serving composition
  (Σ ingredient per-100g × grams ÷ servings), oil-absorption (10% for deep-fry),
  Result-pattern error handling.
- `src/data/ingredients/registry.generated.ts` — **112 USDA-mapped ingredients**,
  18-nutrient per-100g vectors, `fdcId` provenance.
- `src/lib/nutrition/quantity-to-grams.ts` — unit parsing (mass/volume/count,
  unicode fractions, density, "to taste" → null).
- `src/data/ingredients/recipe-links.generated.ts` — **144 recipes resolved**
  (~70% coverage), gated for display at `massedCoverage ≥ 0.7`.
- Targets exist: `fda-dv.ts` (FDA Daily Values, 21 CFR 101.9) + `dri-pediatric.ts`
  (NASEM DRIs, age-banded).

**So the platform is not a greenfield build — it's three expansions of a working
engine:** (a) widen the nutrient vector 18 → 40+ (incl. amino acids), (b) widen
the registry 112 → ~500 ingredients, (c) new _surfaces_ (Info, side-pairing
detail, daily diary). The macro-ring UI is already done.

### 1.3 Will it be frictionless? — the mechanics, flow by flow

**Frictionless principle #1 — precompute at build time, never at runtime.**
The engine is deterministic. Every dish's nutrient vector is composed _once_ by a
generator script (`scripts/nutrition/resolve-dishes.mjs`, already exists) and
committed as static JSON (`recipe-links.generated.ts`). The app never calls a
nutrition API at runtime → zero latency, works offline, no API keys, no rate
limits. **This is the single most important scalability decision and it's already
the architecture.** Widening to 500 ingredients changes the generated file size,
not the runtime cost.

**Frictionless principle #2 — the "ingredients-to-check" list is free.**
We already resolve a dish's ingredient lines (name + quantity) for the cook flow
(`IngredientList`) and the grocery thread. The Info sheet's "do I have these?"
list is the _same data_ cross-referenced against `usePantry()` (which already
exists). No new data — just a new view: each ingredient row shows a have/need
state (pantry hit = check, miss = empty), so the user sees coverage at a glance
_before_ committing. This is the highest-friction-reducing feature and it's
nearly free.

**Frictionless principle #3 — disclosure on demand (rule 13).**
The Info sheet shows, in order: a one-line health takeaway → the macro ring →
ingredients-to-check. Micros and the complete nutrient summary stay behind the
ring's expander. Side-pairing cards show nothing extra inline; a tap opens the
same Info sheet. No screen is text-heavy by default.

**The decision flow becomes:**

```
Today quest / side pairing
  → tap "Info"
    → health takeaway (1 line)   "Good source of fiber + omega-3"
    → macro ring + targets       (the shipped component)
    → ingredients to check       ✓ have 6 · need 2   ← decide here
  → "Cook this"  (only after the user knows they can)
```

The friction that exists today — committing to a cook, hitting the Grab screen,
_then_ discovering you're missing fish sauce — is removed.

### 1.4 Will it scale? — four scale axes, honestly assessed

| Axis               | Today                                                       | At 500 ingredients / 1000 dishes                                          | Bottleneck?                                                                                |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Runtime perf**   | static JSON, O(1) lookup                                    | identical (precomputed)                                                   | **No** — this is the whole point of build-time composition                                 |
| **Bundle size**    | registry ~deferred from Today (`guided-cook-summary` split) | 40 nutrients × 500 ingr ≈ ~1–2 MB JSON; keep it server-only / route-split | **Watch** — never ship the full registry to the Today bundle; lazy-load per dish           |
| **Coverage**       | 112 ingr → ~70% dishes                                      | 500 ingr → ~95% dishes                                                    | **The real work** — coverage is a data-curation grind, not an eng problem                  |
| **Data freshness** | SR Legacy frozen 2018                                       | same (whole-food composition is stable)                                   | **No** — whole-food nutrients don't change; branded foods (OFF) are the only moving target |

**The honest bottleneck is coverage, not engineering.** Going 112→500 ingredients
is a build-time import from USDA FDC (CC0) + name-matching curation. The
architecture already handles it; the work is matching ingredient names to FDC IDs
and verifying. That's why the plan front-loads a **bulk USDA import + matching
pipeline** (Q1) — it converts a manual grind into a generated artifact.

### 1.5 The moat angle (rule 8 / STRATEGY.md)

This deepens the **Data × Engine** moat already established by W1 (pantry
reranker). A recipe app that knows _the full nutrient consequence of every
ingredient choice_ — and can swap a side to fix a deficiency — is defensible in a
way a recipe list is not. The ingredient registry is the compounding asset: every
ingredient added improves coverage across all dishes that use it.

### 1.6 Risks + mitigations

| Risk                                     | Mitigation                                                                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| USDA SR Legacy frozen at 2018            | Whole-food composition is stable; acceptable. Foundation Foods (updated 2026) overrides where present.                                  |
| Branded items (OFF) are ODbL share-alike | Isolate OFF-derived data in its own namespace + attribution; never republish the derived dump. Keep core CC0.                           |
| 2023 EER coefficients only in a PDF      | Personalized energy target is FOUNDER-GATED on transcribing Table 5-16; ship FDA DV reference targets first (already done in the ring). |
| Amino-acid / micro accuracy              | Provenance + confidence flags already exist (`provenance`, `confidence`); surface them; gate display at coverage ≥ 0.7.                 |
| Medical-claim liability                  | Reuse the existing food-first hedge + clinician-review status; never prescribe.                                                         |

---

## Part 2 — The recommended open-source stack (verified by research)

| Layer                                     | Pick                                                                                                   | License                           | Role                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Whole-ingredient nutrients (keystone)** | USDA **FDC SR Legacy + Foundation Foods** JSON                                                         | **CC0**                           | per-100g vectors incl. all vitamins, minerals, **9 amino acids**; `food_nutrient.amount` is already per-100g |
| **Volume↔weight**                         | FDC `food_portion.csv` `gramWeight` + tiny hand density JSON                                           | CC0                               | per-ingredient cup/tbsp→g, joins on `fdc_id`                                                                 |
| **Ingredient text parsing**               | `parse-ingredient` (engine `numeric-quantity`)                                                         | MIT                               | "1 ½ cups flour" → structured qty                                                                            |
| **Unit math (within measure)**            | `convert-units`                                                                                        | MIT                               | normalize tsp/Tbs/cup, g/oz/lb                                                                               |
| **Branded / fast-food**                   | Open Food Facts (Parquet subset via DuckDB) + `openfoodfacts-nodejs`                                   | ODbL (data) / Apache-2.0 (client) | the "Whopper" tier, isolated namespace                                                                       |
| **Targets**                               | hand-encoded `dri.json` (NAS 2020, seed from `cfree14/nutriR`), `amdr.json`, `eaa.json` (WHO/FAO 2007) | facts (no license)                | RDA/AI × age × sex; AMDR macro %; 9 EAA scoring pattern                                                      |
| **Macro ring**                            | hand-rolled SVG (shipped) — or `react-minimal-pie-chart` (MIT, <2 kB) if richer charts needed          | MIT                               | the donut                                                                                                    |

**Rejected (verified):** `nutrifacts` (UNLICENSED), `react-svg-donut-chart`
(abandoned 2017), `recharts` (too heavy — pulls Redux), `food-units-converter`
(stale), `ifct2017` (India-specific + AGPL ambiguity). Facts (DRI/EAA numbers)
aren't copyrightable — transcribe rather than depend.

**Net:** the core stack is CC0/MIT; the only copyleft (OFF/ODbL) is quarantined
to the branded tier and only matters if we _republish_ the dataset (we won't).

---

## Part 3 — The 52-week plan

Legend: **[AB]** = AUTO-BUILD (everything needed is in-repo + npm + CC0 data;
an autonomous agent can ship it). **[FG]** = FOUNDER-GATED (needs an account,
paid service, real human/clinician, or real users) — each lists the shippable
AUTO-BUILD prep so integration is one config edit away when unblocked.

### Founder-gated dependencies (surfaced up front, act in parallel)

- **G1 — Personalized targets**: the 2023 NASEM EER Table 5-16 coefficients live
  only in the report PDF. _Prep (AB):_ build the `eer.json` schema + the target
  engine against FDA DV; flip to personalized when the founder transcribes ~30
  coefficients.
- **G2 — Barcode scanner**: a camera-barcode flow needs a device + a scanning lib
  decision + (optionally) the OFF live API. _Prep (AB):_ the branded-lookup
  engine + a manual "search branded food" path; the scanner is a thin front-end.
- **G3 — Clinician sign-off** on any new health takeaways (rule 11). _Prep (AB):_
  everything ships `isEducational: true` / "Educational" badge until reviewed.
- **G4 — Real DRI clinical review** for the personalized recommendation copy.

---

### Q1 (W1–13) — Foundation: widen the engine, ship the Info surface

**W1 — USDA FDC bulk import pipeline [AB]**

- Goal: a reproducible script that ingests the FDC SR Legacy + Foundation JSON and
  emits a queryable local food table.
- Files: `scripts/nutrition/import-fdc.mjs` (download/cache the CC0 zips to a
  git-ignored `.cache/fdc/`, parse `food.csv`/`food_nutrient.csv`/`nutrient.csv`/
  `food_portion.csv`), `src/data/nutrition/fdc-foods.generated.json` (slim: only
  whole-food candidates we'll map).
- Verify: script prints food count + nutrient coverage; a unit test asserts a
  known food (e.g. "Avocado, raw") resolves with protein/fat/fiber/folate.
- Detail: keep only Foundation + SR Legacy data types; drop Branded here.

**W2 — Widen the nutrient vector 18 → ~40 [AB]**

- Goal: extend `NutrientVector` / `PerServingNutrition` to the full panel: all B
  vitamins (B1/B2/B3/B5/B6/folate/B12), C, D, E, K, choline; minerals (Ca, Fe, Mg,
  P, K, Na, Zn, Cu, Mn, Se); water; cholesterol; sat/mono/poly fat; sugars; the 9
  EAAs as an optional sub-object.
- Files: `src/types/nutrition.ts` (add fields, all optional for back-compat),
  `src/lib/nutrition/compose.ts` (sum the new fields — it's vector addition, the
  loop already generalizes), the FDC nutrient-id → our-key map in
  `scripts/nutrition/fdc-nutrient-map.ts`.
- Verify: `pnpm typecheck`; compose test sums a 2-ingredient recipe across all
  fields; the drift-guard tests still pass.

**W3 — Regenerate the registry from FDC (112 → ~250) [AB]**

- Goal: every existing ingredient gets the full 40-nutrient vector from its
  `fdcId`; add ~140 new high-frequency ingredients (matched by name).
- Files: `scripts/ingredients/build-registry.mjs` (join our ingredient list to
  `fdc-foods.generated.json` by fdcId, fall back to fuzzy name match flagged
  `confidence: "approximated"`), regenerate `registry.generated.ts`.
- Verify: coverage report (resolved %), a test that every `fdcId`-mapped
  ingredient has ≥ 30 non-null nutrients.

**W4 — Regenerate recipe links + nutrition (coverage jump) [AB]**

- Re-run `scripts/nutrition/resolve-dishes.mjs` + `gen-cook-summary.ts` so all
  dishes pick up the widened vectors; re-run drift guards. Expected coverage
  70% → ~85%.

**W5 — Macro-ring polish + the full nutrient grouping [AB]**

- Goal: the shipped `NutritionRingCard` already renders ring + targets + key
  micros + expandable. Extend the expandable to the FDC grouping taxonomy:
  **General · Vitamins · Minerals · Amino acids · Fats** (matching the reference's
  "Complete Nutrient Summary" sections).
- Files: `nutrition-ring-card.tsx` (group `buildMicros` output by category;
  amino-acid rows when present), `src/lib/nutrition/nutrient-taxonomy.ts`.
- Verify: live — a high-protein dish (e.g. grilled salmon) shows an Amino acids
  group with isoleucine/leucine/lysine like the reference.

**W6 — "Info" surface: rename + restructure [AB]**

- Goal: rename the Today meal-card "Health" sheet → **"Info"**; structure it as
  **health takeaway (1 line) → NutritionRingCard → ingredients-to-check**.
- Files: `src/components/today/meal-health-sheet.tsx` (label + aria "Health"→
  "Info"; icon HeartPulse→Info), `meal-health-panel.tsx` (compose the three
  sections; drop the old 4-col macro grid in favor of the ring).
- Verify: live — the Today meal card "Info" grabber opens the new sheet.

**W7 — Ingredients-to-check component [AB]**

- Goal: a reusable list showing each dish ingredient with a have/need state vs the
  pantry, + a "need 2" summary, + one-tap "add missing to shopping".
- Files: `src/components/shared/ingredients-to-check.tsx` (consumes the resolved
  ingredient lines + `usePantry()` + `useShoppingList()` — all exist), wire into
  the Info sheet.
- Verify: live — toggle a pantry item, the check state updates; "add missing"
  threads quantity+recipe (the W-shopping thread already supports this).

**W8 — Side-pairing detail sheet (parity) [AB]**

- Goal: make the side-pairing result card's tap open the **same Info sheet**
  (health + ring + ingredients-to-check) so the user decides at the pairing step.
- Files: `src/components/today/result-stack.tsx` (the expand panel → mount the
  shared Info content for `side.id`), reuse `NutritionRingCard` +
  `IngredientsToCheck`.
- Verify: live — expand a side, see ring + ingredients-to-check; "Cook just this"
  remains the action.

**W9 — DRI target tables (age × sex) [AB]**

- Goal: replace the single FDA-DV target with proper RDA/AI by life-stage + sex.
- Files: `src/data/nutrition/dri.generated.json` (transcribe NAS 2020 from
  `cfree14/nutriR`'s bundled tables, cross-check NIH ODS), `src/lib/nutrition/
targets.ts` (`targetFor(nutrient, lifeStage, sex)`), `amdr.json`, `eaa.json`.
- Verify: unit tests vs known values (adult female calcium 1000 mg, etc.).

**W10 — Target engine wired into the ring [AB]**

- Goal: the ring's "Daily targets" use the DRI table + a chosen profile (default
  "adult, unspecified" → FDA DV; pediatric when Parent Mode age band set).
- Files: `nutrition-ring-card.tsx` (accept an optional `targets` prop),
  `targets.ts` resolver; Parent Mode already has the age band.
- Verify: switching age band changes the target denominators live.

**W11 — Coverage curation sprint (250 → ~400 ingredients) [AB]**

- Goal: import the next tranche of FDC foods for the unresolved ingredient names
  logged by the coverage report; push dish coverage ~85% → ~92%.
- Files: registry regeneration; a `scripts/ingredients/unresolved-report.mjs` that
  ranks unresolved names by dish frequency so curation targets the highest-impact
  gaps first.

**W12 — Nutrition tests + drift guards for the new vector [AB]**

- Extend `nutrition-system.test.ts`, `resolve-dish-lines.test.ts`,
  `guided-cook-summary.test.ts` to cover the 40-nutrient panel + amino acids; add a
  guard that every displayed dish has ≥ N resolved nutrients.

**W13 — Q1 review + recursive polish [AB]**

- Eyes-on every nutrition surface (cook flow, Info sheet, side detail); fix drift;
  ensure rule-13 minimalism holds; commit a Q1 coverage report doc.

### Q2 (W14–26) — Depth: amino acids, daily diary, personalization prep

**W14 — Amino-acid panel + protein-quality (DIAAS-lite) [AB]**
Surface the 9 EAAs (reference screenshot's Protein section) with the WHO/FAO
scoring pattern → a "complete protein?" signal. Files: `eaa.json`,
`src/lib/nutrition/protein-quality.ts`, ring's Amino acids group.

**W15 — Daily diary data model [AB]**
"Add to diary" (the reference's CTA) → a localStorage/Supabase day log of cooked
servings. Files: `src/lib/hooks/use-nutrition-diary.ts`, `src/types/diary.ts`
(date → entries[{recipeSlug, servings, at}]). Mirrors `useShoppingList` pattern.

**W16 — Daily totals + the day dashboard [AB]**
Aggregate diary entries → ΣNutrient for the day; a Path-tab "Today's nutrition"
card: the same ring, but for the _day_ vs the day's targets. Files:
`src/components/path/daily-nutrition-card.tsx`, `aggregateDay()` in the engine.

**W17 — Deficit/surplus insight line [AB]**
One ambient line ("low on iron today — a spinach side fixes it") computed from the
day's gaps × the side engine. Reuses `dish-therapeutic-profile`. Educational badge.

**W18 — Personalized target engine (FDA-DV → DRI → EER) [AB except G1]**
Build the `eer.json` schema + `energyTarget(profile)`; ship with the AMDR macro
split off FDA DV. **G1**: flip to 2023 NASEM EER when coefficients transcribed.

**W19 — Profile capture (playful, rule-3 compliant) [AB]**
Capture age band / activity through coach interactions (not a settings form);
store in the existing care-profile shape. Feeds targets.

**W20 — Branded-food engine (no UI yet) [AB]**
DuckDB-extract an OFF Parquet subset (top branded items) → `src/data/nutrition/
branded.generated.json` (isolated namespace, ODbL attribution). Build
`lookupBranded(name|barcode)`. No scanner yet.

**W21 — Branded search UI [AB]**
A "log a packaged food" search (the Whopper case) using the branded table; adds to
the diary. Files: `src/components/.../branded-search.tsx`.

**W22 — Barcode scan [FG: G2]**
_Prep (AB):_ the branded lookup-by-barcode path + a manual barcode-entry fallback.
_Gated:_ the camera-scan front-end + lib choice + (optional) OFF live API key.

**W23 — Water + hydration tracking [AB]** — ✅ SHIPPED `86fb819`. HydrationCard on
Path: tap-the-pip glass tracker (rule 13), 8-glass/2 L goal, localStorage per-day,
kept separate from the diary's food-moisture `water` nutrient to avoid
double-counting. (A personalised target rides with W43's EER work.)

**W24 — Nutrient-density score (ANDI-lite) [AB]**
A per-dish density score (nutrients per calorie) for ranking/badging; feeds the
side engine as a soft signal.

**W25 — Trends (week view) [AB]**
A 7-day rollup of the diary: which nutrients consistently under/over target.

**W26 — Q2 review + recursive polish [AB]**

### Q3 (W27–39) — Intelligence: the engine gets smart

**W27 — Bioavailability modifiers [AB]** (iron + vitamin-C synergy, oxalate/phytate
inhibition — Sous already tracks oxalate/phytate per the reference). Soft factors,
flagged.
**W28 — Glycemic estimate [AB]** (GI/GL heuristic from carb composition + fiber).
**W29–W30 — Deficiency-aware side reranking [AB]** — the day's gaps reweight
`suggestSides()` (the W1 reblend pattern). The flagship moat feature: "you're low
on omega-3 → these sides fix it."
**W31 — Therapeutic × nutrient unification [AB]** — merge the existing
condition/intervention engine with the nutrient targets into one Info takeaway.
**W32 — Meal-plan nutrition rollup [AB]** — the weekly planner shows the week's
nutrient balance; gaps suggest swaps.
**W33 — Grocery nutrition preview [AB]** — the grocery list shows the nutrition the
planned recipes will deliver.
**W34 — Allergen/diet hard-filter integration [AB]** — care-profile `avoid` flags
cross the ingredient registry.
**W35 — Confidence/provenance surfacing [AB]** — a clear "estimated vs measured"
indicator per nutrient (data already carries it).
**W36 — Restaurant/branded diary parity [AB]**.
**W37 — Performance pass [AB]** — route-split the registry; ensure Today bundle
never pulls the full nutrient data; measure.
**W38 — Accessibility + reduced-motion audit of all nutrition surfaces [AB]**.
**W39 — Q3 review [AB]**.

### Q4 (W40–52) — Platform: polish, scale, real content

**W40–W41 — Coverage to ~95% [AB]** (final FDC tranche + curation).
**W42 — Clinician review surface for nutrient takeaways [FG: G3/G4]** _Prep:_ the
review queue + educational gating already exist; gated on a real reviewer.
**W43 — Personalized DRI go-live [FG: G1]** (EER coefficients in).
**W44 — Branded data refresh pipeline [AB]** (scheduled OFF re-extract).
**W45 — Export / share nutrition (image card) [AB]**.
**W46 — Nutrient education content in the Content tab [AB]** (Featured slot can
spotlight a nutrient/ingredient — the "ingredient advertisement" variant the user
asked for).
**W47 — Onboarding: nutrition goals (playful) [AB]**.
**W48 — A11y + i18n number/unit formatting [AB]**. _A11y: ✅ done for the new
nutrition surfaces (dialog/Escape, ring SVG aria-label, aria-expanded). i18n
(incl. number/unit formatting + string externalization) is DEFERRED to the final
public launch (post-beta) per founder direction 2026-06-07 — do NOT schedule it
into beta._
**W49 — Full regression + drift-guard sweep [AB]**.
**W50 — Scale test: 1000 dishes, 500 ingredients [AB]** — generate synthetic load,
confirm build-time composition + bundle budgets hold.
**W51 — Documentation + runbook [AB]** (how to add an ingredient, regenerate,
verify).
**W52 — Year review + next-year thesis [AB]**.

---

## Part 4 — What shipped already (down-payment on this plan)

- **W5 (early)** — `NutritionRingCard` (macro ring + targets + key micros +
  expandable) — shipped `e1aa9c1`, live on the Grab screen.
- **Content Featured** — the hero slot that W46's nutrient-spotlight reuses —
  shipped `3ab2280`.
- The **ingredients-to-check** primitive is one component away (W7) because the
  pantry + resolved-ingredient + shopping-thread data all already exist.

## Part 5 — Immediate next actions (the first PRs an agent can pick up)

1. `scripts/nutrition/import-fdc.mjs` (W1) — the CC0 import; everything downstream
   depends on it.
2. Widen `NutrientVector` (W2) — additive, back-compat, unlocks the panel.
3. Info rename + restructure (W6) + ingredients-to-check (W7) — the highest
   user-visible friction win, and zero new data.

---

## Part 6 — Execution playbook: remaining weeks (3-round review + unit tests each)

> Status at 2026-06-07: catalogue nutrition coverage **89%** (280/314), registry
> **154 ingredients**, **3290 tests**. Shipped this run: #1 catalogue coverage,
> #2 quantity normalizer, #3 dietary-inferer fix, W20–21 branded engine + servings
> stepper, W23 hydration, the SIDE_INGREDIENTS drift-guard, the data-quality pass.
> W37 perf was **investigated → negative result** (precompute would regress the
> bundle; see below). Everything below is queued.

### The standard per-week loop — applied to EVERY week in this part

Each week is built then run through **three recursive review rounds** before the
**end-of-week test pass**. Do not skip a round; each has caught real bugs this
year (a 173/219 false-"gluten-free" safety bug, branded zeros fabricating
deficits, a 3995-kcal frying-oil over-count, eggplant→egg collisions).

1. **Round 1 — build + self-review.** Implement the deliverable. Self-audit for:
   correctness; **honesty** (no overclaim — gate display at `massedCoverage ≥ 0.7`,
   keep the "an estimate" framing, never assert a "free-of" allergen claim); and
   rule compliance (6/13 minimal text + disclosure-on-demand, 7 no invented
   recipes/images, 10 no-scroll at 375×667, 11 current-feature-state). Run
   `pnpm typecheck && pnpm lint`.
2. **Round 2 — adversarial review.** Spawn a fresh reviewer (Agent, or a Workflow
   find→verify for bigger weeks) prompted to BREAK it: wrong numbers, false-safety
   claims, double-counting, substring/collision bugs, and the edge cases
   (empty / null / huge / fractional / zero-coverage inputs). Fix every confirmed
   finding; re-review until a round comes back clean.
3. **Round 3 — polish + consistency.** a11y (role/`aria-label`/`aria-expanded`/
   Escape/keyboard reach, contrast, a text alternative for any SVG/chart),
   visual-token + spacing consistency, the reduced-motion gate, 375×667 no-scroll,
   and cross-surface consistency with the existing nutrition cards.
4. **End-of-week tests.** Co-located `*.test.ts` for the core logic + **every edge
   case surfaced in Round 2**; a **drift-guard** test if generated data changed
   (mirror the recipe-links guard); the full gate (`typecheck · lint · test ·
build`); a **live preview** check of the user-facing behavior; commit + push.

---

### Coming up next — AUTO-BUILD queue (priority order)

**W28 — Glycemic estimate (GI/GL heuristic).** Per-dish glycemic load from carb
composition + fiber (+ sugar/starch ratio), shown as a soft, clearly-estimated
Info pill; optional soft engine factor.

- _R1:_ `estimateGlycemicLoad(nutrition)` = available-carbs × heuristic GI ÷ 100,
  fiber discount; gate behind the coverage floor; label "rough estimate".
- _R2:_ the heuristic IS the risk — verify no single GI is presented as fact;
  attack zero-carb, all-fiber, and sugar-bomb dishes; ensure it never contradicts
  the honesty contract.
- _R3:_ one icon + short-label pill (rule 13), behind tap-to-expand; a11y label.
- _Tests:_ lentils GL < white-rice GL; fiber lowers GL; zero-carb → 0; null → null.

**W46 — Nutrient education content (Content tab).** Reuse the Featured hero to
spotlight a nutrient/ingredient ("why omega-3", "iron + vitamin-C"). Sample-flagged
copy (`isPlaceholder`) until the editorial workstream (rule 11).

- _R1:_ a `NutrientSpotlight` content type + 3–4 sample entries; wire into the
  Featured rotation; `(sample)` affiliation suffixes, no real clinician names.
- _R2:_ check for science overstatement (the W12-class bug) — every claim hedged,
  food-first framing, no therapeutic promises; verify placeholder flags present.
- _R3:_ Content-tab visual parity; reduced-motion; image fallbacks (rule: no
  generated images).
- _Tests:_ every spotlight entry carries `isPlaceholder: true`; the Featured
  rotation includes/excludes correctly; no entry asserts a cure.

**W47 — Onboarding: nutrition goals (playful).** Capture a light goal (more
protein / more veg / hydration) via a coach interaction (NOT a settings form,
rule 3); feeds a soft target.

- _R1:_ a one-tap coach card on first visit; store in the care-profile shape;
  default to "balanced" if skipped.
- _R2:_ ensure skippable + non-blocking; no PII; the goal only SOFTLY nudges (never
  hard-filters the plate); idempotent re-runs.
- _R3:_ rule-3 compliance (no settings page), no-scroll, reduced-motion, a11y of
  the choice control.
- _Tests:_ goal persists; skip → balanced default; goal maps to the expected soft
  weight; runs once.

**W45 — Export / share nutrition (image card).** Render a day's (or dish's)
nutrition as a shareable image card.

- _R1:_ an off-DOM canvas/SVG → PNG of the ring + key numbers + the "estimate"
  footer; a share/download affordance (download is permission-gated per the
  action rules).
- _R2:_ the export must carry the SAME honesty framing as the UI (estimate +
  coverage); attack empty-day, over-goal, and missing-data states; no PII leak in
  the image.
- _R3:_ a11y of the trigger; reduced-motion; correct rendering at 2× DPI.
- _Tests:_ the serializer produces a card for a known day; empty day → friendly
  empty card; the footer string is present.

**W33 — Grocery nutrition preview.** The grocery list shows the nutrition the
planned recipes will deliver (sum the planned dishes' per-serving × servings).

- _R1:_ reuse `getDishNutrition` over the planned list → a compact rollup on the
  grocery screen; gate at coverage.
- _R2:_ watch double-counting (shared ingredients) and the framing snag noted in
  the audit (is it "what you'll buy" vs "what you'll eat"?); branded items
  excluded from cooking-gap signals (the W20 fix pattern).
- _R3:_ minimal text, no-scroll, consistency with the meal-plan rollup (W32).
- _Tests:_ rollup = sum of planned dishes; empty list → null; partial-coverage
  dishes excluded.

**W36 — Restaurant/branded diary parity.** Make branded + (future) restaurant
diary entries first-class in the day rollup + history, consistent with cooked
entries.

- _R1:_ unify the entry renderer (cooked / branded share one row component);
  history view includes both.
- _R2:_ re-verify the cooked-only gap-signal split (branded must not drive the
  reranker — already fixed; add a regression test); fractional servings labels.
- _R3:_ visual parity, a11y of the unified row.
- _Tests:_ a mixed day aggregates both; gap signals stay cooked-only; remove works
  for both types.

**W44 — Branded data refresh pipeline.** A scheduled/manual OFF re-extract so the
branded cache (when added) stays fresh; until then, document the env-var contract.

- _R1:_ a `scripts/nutrition/refresh-branded.mjs` stub + the OFF attribution +
  rate-limit contract; a "last refreshed" timestamp surfaced.
- _R2:_ politeness (OFF rate-limit/cache — reuse the route's `checkRateLimit`);
  idempotent; graceful when OFF is unreachable.
- _R3:_ runbook note; founder-gated bits clearly flagged (scheduler/cron is FG).
- _Tests:_ the mapper handles a fixture OFF payload; malformed rows dropped; the
  timestamp updates.

**W40–W41 — Coverage to ~95% (final tranche).** Continue the long-tail registry +
ingredient-list curation from today's 89%.

- _R1:_ blocker analysis (the `.blockall` script pattern) → add the next FDC-backed
  batch; alias obvious synonyms.
- _R2:_ **outlier scan every batch** (the data-quality pass pattern — catch
  855-kcal-shirataki / 96-kcal-fish class errors); verify no proxy distortion.
- _R3:_ servings sanity for broth/fried/batch dishes; "estimate" framing intact.
- _Tests:_ the SIDE/MEAL drift guards stay green; a coverage-percentage assertion
  ratchets up and never regresses; per-batch outlier bounds (no dish > Nk kcal
  unflagged).

**W50 — Scale test (1000 dishes, 500 ingredients).** Synthetic load to confirm
build-time composition + bundle budgets hold.

- _R1:_ a generator for synthetic dishes/ingredients; run the full pipeline;
  measure resolve + build time + bundle size.
- _R2:_ find the break point (memory in `usda-ingest`/`expand`; prettier OOM);
  confirm the `.prettierignore`/`.gitignore` guards still hold at scale.
- _R3:_ document the budgets; add a CI-style budget assertion.
- _Tests:_ pipeline completes at 10× scale; a bundle-budget assertion; resolve is
  O(n) not O(n²).

**W49 — Full regression + drift-guard sweep.** End-to-end pass over every
nutrition surface + every generated artifact.

- _R1:_ re-run all generators; diff against committed; eyes-on every surface with
  real data.
- _R2:_ a completeness critic — "what's untested / unverified / drifted?"; close
  each gap.
- _R3:_ a11y + reduced-motion sweep of all nutrition surfaces (W38 scope).
- _Tests:_ all drift guards green; a snapshot of the coverage stats; the full gate.

**W51 — Documentation + runbook.** "How to add an ingredient, regenerate, verify"
end-to-end.

- _R1:_ write `docs/NUTRITION-RUNBOOK.md`: the spec → ingest → extract → expand →
  resolve → precompute-considered pipeline, with the tsx-vs-node + memory + prettier
  gotchas captured this year.
- _R2:_ have a fresh agent follow it cold to add one ingredient; fix every
  ambiguity it hits.
- _R3:_ link it from CLAUDE.md + the plan; keep it minimal.
- _Tests:_ a smoke test that the documented commands exist + run (lint the runbook
  code blocks).

---

### Review / checkpoint weeks (lighter, but still 3-round)

- **W26 / W39 — Q2 / Q3 reviews.** R1 inventory what shipped vs planned; R2
  adversarial "what's missing / overclaimed"; R3 polish + doc-sync. Tests: the
  full gate + a coverage/test-count snapshot committed to the plan.
- **W37 — Performance pass.** _Investigated this run → negative:_ a precompute
  table is ~412 KB ≈ the registry+recipe-links it would replace, and the registry
  still loads via the therapeutic path, so it would REGRESS the bundle. Re-open only
  with real bundle measurement; the safe win is **precompute + lazy-load
  meal-health-panel together** (drops ~270 KB raw) — do it measured, drift-guarded.
- **W38 — A11y + reduced-motion sweep.** Done for the new surfaces (dialog/Escape,
  ring SVG `aria-label`, `aria-expanded`, hydration pips). Remaining: a full
  axe-style pass over every nutrition surface. R1 audit; R2 keyboard-only + SR
  walkthrough; R3 fix + add the `sous/reduced-motion-gate` checks. Tests: a11y
  assertions on the key components.
- **W52 — Year review + next-year thesis.** Narrative + metrics; no code.

---

### Founder-gated weeks (AUTO-BUILD prep now; integration is one config edit)

Per rule 12, build the abstraction + schema + wiring stub now; the gate is only the
external credential/asset.

- **W18 / W43 — Personalized EER + DRI [FG: G1].** _Prep (AB):_ `eer.json` schema +
  `energyTarget(profile)` + the age/sex DRI matrix shape, shipping with the FDA-DV
  fallback. _Gate:_ transcribe the 2023 NASEM EER coefficients. R1 schema +
  fallback; R2 verify the fallback is honestly labeled "general DV, not personal";
  R3 a11y of any target display. Tests: fallback targets correct; the swap is a
  pure data change (a fixture proves it).
- **W19 — Profile capture (playful) [AB, feeds G1].** Build the coach-driven age/
  activity capture now (rule-3 compliant); it just has nothing personalized to feed
  until W43. Same 3-round + tests as W47.
- **W22 — Barcode scan [FG: G2].** _Prep (AB):_ `lookupBranded(barcode)` + a manual
  barcode-entry fallback (already partially there via the OFF route). _Gate:_ the
  camera-scan front-end + scanner lib + optional OFF API key. R2 must cover the
  malformed/﻿unknown-barcode path; tests on the lookup + manual entry.
- **W42 — Clinician review surface [FG: G3/G4].** Prep (the review queue +
  educational gating) already exists. _Gate:_ a real reviewer. Until then the
  Content/therapeutic copy stays `(sample)`-flagged (rule 11). R2 must verify
  nothing personalized/clinical ships un-reviewed.
