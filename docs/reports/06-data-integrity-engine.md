# Data Layer & Recommendation Engine — Critical Review

**Reviewer role:** Data/ML Engineer
**Date:** 2026-05-31
**Scope:** `src/data/` (catalog, guided-cook, compass, content, parent-mode) + `src/lib/engine/` + `src/lib/pairingEngine.ts`
**Method:** Static parse + read-only `tsx`/`node`/`jq` execution of the actual data and engine modules. No build/test run.

---

## TL;DR

The **catalog is clean** on the hard-integrity axes that matter for shipping: zero duplicate IDs, zero broken `sidePool` refs, zero missing/orphan image files, zero broken pairing references (once resolved through the name→ID bridge), and a **build-gated** orphan check (`pnpm validate:data` runs in `build`). Schema is consistent across all records.

The two real problems are **coverage** and **engine signal**, not corruption:

1. **Guided-cook coverage is the dominant gap (rule 4).** Only **7/76 meals (9.2%)** and **126/205 sides (61.5%)** have a guided-cook flow. **148 of 281 catalog entities (52.7%) have no quest-shell steps** and render a `DeadEndShell` ("Cook steps coming soon") instead of Mission→Grab→Cook→Win. Graceful, but a rule-4 violation at the data level.
2. **Two engine dimensions are fed dead inputs in production.** The live engine (`pairing-engine.ts` via tRPC) builds candidates with hardcoded `prepTimeMinutes:10, cookTimeMinutes:10` and `proteinGrams/fiberGrams/caloriesPerServing = null` for **all 205 sides**, so the **prepBurden scorer is a constant 0.8 for every candidate** and the nutrition fiber/calorie bonuses never fire. The dimensions are implemented and weighted as documented, but ~13% of the weight (prepBurden) carries zero discriminating signal.

**Determinism verdict:** The ranking engine is **deterministic given (inputs + calendar day)** — confirmed empirically (two same-process calls produce byte-identical top-3). The `getDayOfYear()` / `new Date()` in `ranker.ts:91` is **by design** (the documented daily tie-break rotation) and only reorders genuine score ties; it does not perturb the underlying ranking. One real nuance: `seasonalScorer` reads `new Date()` for the _score itself_ (4-season step function), so outputs are technically **not reproducible across season boundaries** even with identical inputs — a Medium deviation from the strict "deterministic given the same inputs" wording. The legacy `Math.random()` path (`pairingEngine.ts`) is **dead code** (no front-end consumer).

---

## Catalog counts (verified)

| Entity                   | Count                                     | Source                                                  |
| ------------------------ | ----------------------------------------- | ------------------------------------------------------- |
| Meals                    | **76**                                    | `src/data/meals.json` (array)                           |
| Sides                    | **205**                                   | `src/data/sides.json` (array)                           |
| Pairings (mains keyed)   | **19**                                    | `src/data/pairings.json` (object, keyed by meal _name_) |
| Pairing rows total       | **956**                                   | across the 19 mains                                     |
| Food images on disk      | **129**                                   | `public/food_images/*.png`                              |
| Compass dishes           | **50**                                    | `src/data/compass-dishes.ts`                            |
| Eat-out fixtures         | **8**                                     | `src/data/eat-out-fixtures.ts`                          |
| Stanford content records | source-attributed, `isPlaceholder: false` | `src/data/content/stanford.ts`                          |

Schema consistency: **all 8 meal keys present in all 76 meals**; **all 9 side keys present in all 205 sides** (the 9th key, `guidedCookSteps`, is intentionally sparse — 50/205). No missing required fields.

---

## Findings (severity-ranked)

### HIGH — Guided-cook coverage gap = rule-4 violation for 148/281 entities

**Files:** `src/data/guided-cook-steps.ts`, `src/data/sides.json`, `src/lib/trpc/routers/cook.ts:91-92`, `src/app/cook/[slug]/page.tsx:616-632`

Rule 4 mandates that _every_ recipe renders the Mission→Grab→Cook→Win quest shell. Measured coverage:

|           | With guided cook | Total   | Coverage  | Gap     |
| --------- | ---------------- | ------- | --------- | ------- |
| **Meals** | 7                | 76      | **9.2%**  | 69      |
| **Sides** | 126              | 205     | **61.5%** | 79      |
| **Total** | **133**          | **281** | **47.3%** | **148** |

- Sides are covered by two stores: `guidedCookData` (119 keyed entries) ∪ inline `guidedCookSteps` on sides.json (50; 7 of these are inline-only, not in `guidedCookData`).
- Meals are covered only by `guidedCookMeals` (7 entries: `masoor-dal, pizza-margherita, butter-chicken, fish-tacos, pad-thai, bibimbap, chicken-adobo`).
- The build-gated validator (`src/lib/db/validate-guided-cook.ts`) reports these same numbers ("Sides 119 with guided cook (58%), Meals 7 (9%)") but **only fails on orphans, not on coverage gaps** — so this gap ships by design.

**Behavior when steps are missing:** `cook.getSteps` returns `{ dish: null, steps: [], ingredients: [] }` (cook.ts:91-92); the cook page renders `DeadEndShell` with title "Cook steps coming soon" (page.tsx:620-626). No crash, but the user does **not** get the quest shell — they bounce back to Today. `getCombinedSteps` (cook.ts:160-165) silently `.filter()`s out any side lacking data, so a 3-side plate can quietly cook fewer than 3.

**Impact:** A user who picks any of the 69 uncovered meals (e.g., most Mediterranean/Thai/Korean/Vietnamese/Chinese mains) as the _thing they want to cook_ hits a dead-end rather than a guided cook. Since the Today page's primary action is "cook the main," this directly undercuts the core loop for the majority of the catalog.

**Remediation:**

1. Treat coverage as a release gate, not just a report: add a threshold flag to `validate-guided-cook.ts` (e.g., fail if meal coverage < target) so the gap is tracked against an explicit number, not silently tolerated.
2. Author guided-cook flows for the highest-traffic uncovered meals first (rule 7: real sources, add to catalog, then add steps). Prioritize meals that are also `nourishVerified` (32/76) and have a `heroImageUrl` (35/76) since those are the most surfaced.
3. Until coverage is closed, make `DeadEndShell` route the user to a _cookable_ alternative from the same meal's `sidePool` rather than only "Back to Today," so the screen still drives a cook (rule 1 / rule 10).

---

### MEDIUM — Two scoring dimensions carry zero signal in production (dead inputs)

**Files:** `src/lib/trpc/routers/pairing.ts:34-58` (candidate builder), `src/lib/engine/scorers/prep-burden.ts`, `src/lib/engine/scorers/nutrition-balance.ts:102-114`

The live engine path is `Today page → trpc.pairing.suggest → suggestSides → rankCandidates` over **all 205 sides** (confirmed: `page.tsx:232`). The candidate builder `buildCandidatesFromStatic()` hardcodes for every side:

- `prepTimeMinutes: 10`, `cookTimeMinutes: 10` (comment: "default estimate")
- `proteinGrams: null`, `fiberGrams: null`, `caloriesPerServing: null`

Consequences, verified empirically against the real builder:

- **prepBurden returns a constant 0.8 for all 205 candidates** (total = 20 min ≤ threshold for every effort level). It contributes a flat offset, never a ranking signal — yet it holds **0.13 weight** (`DEFAULT_WEIGHTS`).
- nutrition-balance's fiber bonus (`fiberGrams >= 4`) and low-calorie bonus (`caloriesPerServing <= 150`) can **never fire** → the nutrition dimension degrades to a coarse category-vs-category lookup.
- `flavorProfile` and `temperature` are _derived from tags/description_ (good — they vary: 3 distinct temps, real flavor sets), and `cuisineFamily` is derived (11 distinct values), so those dimensions do discriminate.

Empirical ranking spread (main = "butter chicken", real builder, all 205 sides): **43 distinct totalScore buckets**, unique top score. So the engine still differentiates — but it's doing so on ~5 effective dimensions, not the documented 6, with a 6th (prepBurden) and part of nutrition contributing noise-free constants.

**Remediation:**

1. Add real `prepTimeMinutes` / `cookTimeMinutes` (and ideally `nutritionCategory`-aligned macros) to `sides.json`, or derive them from the side's guided-cook step timers where present (126 sides have steps with `timerSeconds`). Then prepBurden becomes a live signal.
2. Until then, consider dropping prepBurden's weight to ~0 and renormalizing, so the documented weight table reflects reality rather than implying a signal that isn't there.
3. The `nourishVerified` flag and `nutritionCategory` exist on every side — wire `nutritionCategory` macros (even coarse buckets) so the nutrition bonuses can fire.

---

### MEDIUM — `seasonalScorer` reads wall-clock; output not reproducible across seasons

**File:** `src/lib/engine/scorers/seasonal.ts:16-17, 65`

`getCurrentSeason()` calls `new Date().getMonth()` with no injection at the call site inside the scorer (`score()` calls `getCurrentSeason()` with no arg). `seasonalScorer` is in `ALL_SCORERS` (pairing-engine.ts) and holds **0.07 weight**. This means the **score breakdown for an identical (main, side, prefs) input changes at the Dec/Feb→spring, May→summer, Aug→fall boundaries** — a genuine deviation from CLAUDE.md's "deterministic given the same inputs."

Distinction from the daily tie-break: the tie-break (`ranker.ts:83-96`) only reorders candidates whose scores are _already equal_, so the ranking is stable; the seasonal scorer changes the _scores themselves_. The effect is bounded (±0.2 on one 0.07-weight dimension → max ~0.014 totalScore swing) and intentional (seasonality is a product feature), but it's worth reconciling against the determinism claim.

**Remediation:**

1. Make the time source injectable end-to-end: `seasonalScorer` already accepts `now?: Date` in `getCurrentSeason` but the scorer never passes it. Thread a `now`/`asOf` through `suggestSides` → `rankCandidates` → scorer so callers (and tests) can pin it; default to `new Date()`.
2. Amend the CLAUDE.md "Side-dish engine" wording to "deterministic given the same inputs _and the same as-of date_," matching the daily-rotation caveat already documented.

---

### LOW — `anti-monotony` scorer reads `Date.now()` but is a no-op server-side

**File:** `src/lib/engine/scorers/anti-monotony.ts:67, 117-128`

The static `antiMonotonyScorer` calls `buildRecencyMap()` which reads `localStorage` via `readServedLog()`. Server-side (`typeof window === "undefined"`) this returns `[]`, so the scorer **always returns 0.9** in the tRPC path — a harmless constant. It does call `Date.now()` (line 67) but with an empty log the value is unused. The client never re-runs the engine, so the recency penalty (the actual feature) **never applies in the live flow**. Weight: 0.07.

**Impact:** The "adds variety to your week" dimension is effectively dead in production (constant 0.9). Not a correctness bug, but a documented dimension that doesn't function.

**Remediation:** If anti-monotony is meant to matter, pass the served-sides log from the client to `trpc.pairing.suggest` as an input and use `createAntiMonotonyScorer(recencyMap)` instead of the static instance. Otherwise drop it from `ALL_SCORERS` and renormalize weights.

---

### LOW — Legacy `pairingEngine.ts` is dead code with non-determinism (`Math.random`)

**Files:** `src/lib/pairingEngine.ts:111, 187`, `src/app/api/search/route.ts`

There are **two parallel engines**:

- `src/lib/engine/pairing-engine.ts` — the documented 6+2 scorer pipeline. **This is what the Today page uses** (`trpc.pairing.suggest`).
- `src/lib/pairingEngine.ts` — a name-keyed lookup over `pairings.json` with a **Fisher-Yates `Math.random()` fallback** (lines 111, 187) for the 57 mains without precomputed rows. Consumed only by `/api/search/route.ts` and the heatmap route — **no front-end component calls `/api/search`** (grep returns zero non-route consumers).

This is where the "scorer runs on ~14 of ~93 mains" and "`Math.random` in ranking" observations actually originate: `pairings.json` covers **19 mains** (14 original Indian + 5 international), and the fallback for the other 57 is random. But because this path is dead in the live UI, the non-determinism does not affect users today.

**Impact:** Confusing dual-engine architecture; a reader auditing determinism will (correctly) flag `Math.random` here and (incorrectly) assume the live engine is non-deterministic. Risk of the dead path being re-wired later.

**Remediation:** Either delete `src/lib/pairingEngine.ts` + `/api/search/route.ts` if truly unused, or document at the top of each that it is legacy/heatmap-only and not on the live cook path. If it must stay live anywhere, seed the Fisher-Yates with a day-derived value (mirror `ranker.ts`'s `getDayOfYear`) to make it deterministic.

---

## Referential integrity — clean (verified)

| Check                                                                          | Result                          |
| ------------------------------------------------------------------------------ | ------------------------------- |
| Duplicate meal IDs / names                                                     | **0 / 0**                       |
| Duplicate side IDs / names                                                     | **0 / 0**                       |
| `sidePool` → side ID refs broken                                               | **0** (76 meals, 0 empty pools) |
| `pairings.json` side-name refs resolvable via `sideBridge.resolveEngineSideId` | **956/956 = 100%**              |
| `guidedCookData` keys → side IDs                                               | **119/119 valid, 0 orphan**     |
| `guidedCookMeals` keys → meal IDs                                              | **7/7 valid, 0 orphan**         |
| `KID_FRIENDLINESS_LABELS` `recipeSlug` → meal IDs                              | **76/76 valid, 0 dup**          |
| Image refs (`heroImageUrl`/`imageUrl`) → files on disk                         | **0 missing**                   |
| Orphan image files (on disk, unreferenced)                                     | **0**                           |

**Note on the "demo recipeSlugs" history (commit `30c5859`):** clean now. My first pass flagged 6 pairing side-names as "missing" — those were **exact-name false positives** (`"Cucumber Raita"`, `"Instant Pot Basmati Rice"`, `"Garlic Naan"`, `"Onion Raita (Biryani Raita)"`, `"Cucumber Raita"`, `"Dry Chutneys (assorted)"`). All six resolve correctly through `sideBridge.ts` (explicit map + parenthetical-stripping slugify). End-to-end resolution is 100%.

**Orphan sides (informational, not a defect):** 37/205 sides appear in no meal `sidePool`. These are mostly Indian condiments/raitas/pickles and air-fryer/instant-pot sides. They are still reachable through the engine (which scores all 205) and through `pairings.json` rows, so "orphan from sidePool" ≠ unreachable. Worth a glance to confirm each is intentionally engine-only.

---

## Rule 7 (no invented recipes/images) — compliant

- **No invented images:** every referenced image file exists on disk; no file is referenced that isn't present (0 missing). Images-on-disk are fully utilized (0 orphans).
- **Catalog provenance:** meals/sides JSON carry **no per-record source attribution fields** (`source`, `sourceUrl`, etc.) — a gap if provenance auditing is ever required, but not evidence of invention.
- **Compass dishes:** 39/50 don't resolve to a catalog meal, but the file header documents them as hand-curated from **Wikipedia regional-cuisine articles, Larousse Gastronomique, Oxford Companion to Food** for a _geography guessing game_ (origin-city quiz), not cookable recipes. They use the `placeholder:<emoji>` convention for non-catalog dishes (no fabricated image files). **Not a rule-7 violation** — these are educational map pins, not quest-shell recipes, and have real documented sources.
- **Stanford content:** records set `isPlaceholder: false` and carry four source fields (`sourceUrl`, `sourceTitle`, `sourceFetchedAt`, `permissionEvidence`) pointing to Stanford Medicine Children's Health, gated by `docs/content-sources/STANFORD-PERMISSION.md` with a ≤30-verbatim-words rule. Strong provenance posture. (CLAUDE.md rule 11 still describes Content as placeholder; the data has since been upgraded — worth reconciling the rule text, but out of scope here.)
- **No AI-invention signal** found in the catalog data layer.

---

## Engine: documented spec vs implementation

| Documented (CLAUDE.md "Side-dish engine") | Implemented?                                                               | Notes                                                                                                                        |
| ----------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| cuisine fit                               | ✅ `scorers/cuisine-fit.ts`                                                | matrix + bestPairedWith + secondary signals; pure                                                                            |
| flavor contrast                           | ✅ `scorers/flavor-contrast.ts`                                            | complement/duplicate logic; pure                                                                                             |
| nutritional balance                       | ✅ `scorers/nutrition-balance.ts`                                          | category logic works; **fiber/calorie bonuses dead** (null inputs)                                                           |
| prep burden                               | ⚠️ `scorers/prep-burden.ts`                                                | implemented but **constant 0.8** in prod (hardcoded times)                                                                   |
| temperature complement                    | ✅ `scorers/temperature.ts`                                                | derived temps vary; pure                                                                                                     |
| user preference vector                    | ✅ `scorers/preference.ts`                                                 | dot-product over features; pure                                                                                              |
| (extra) seasonal                          | ✅ `scorers/seasonal.ts`                                                   | reads wall-clock → cross-season non-reproducibility                                                                          |
| (extra) anti-monotony                     | ⚠️ `scorers/anti-monotony.ts`                                              | server-side no-op (constant 0.9)                                                                                             |
| weighted aggregation                      | ✅ `ranker.ts` + `DEFAULT_WEIGHTS`                                         | weights: cuisine .22 / flavor .22 / nutrition .13 / prep .13 / temp .08 / pref .08 / seasonal .07 / antiMono .07             |
| top-3 returned                            | ✅ `topK(ranked, 3)`                                                       | default count 3                                                                                                              |
| plain-language explanations               | ✅ `explainer.ts`                                                          | top-2 dimensions → templated phrase, e.g. "Cilantro Mint Chutney pairs naturally with the cuisine and adds bright contrast." |
| deterministic, no randomness in ranking   | ✅ (live path)                                                             | confirmed: identical top-3 across same-process calls                                                                         |
| novelty via daily tie-break rotation      | ✅ `ranker.ts:59-68, 83-96`                                                | `hashTieBreaker(slug, dayOfYear)` reorders ties only; verified rotates across days                                           |
| Result pattern                            | ✅ `suggestSides` returns `{success:true,data}` \| `{success:false,error}` |                                                                                                                              |

**Empirical determinism test (live ranker, all 205 sides, main="butter chicken"):**

```
Run1 top5 == Run2 top5  →  true (byte-identical totalScores)
43 distinct totalScore buckets / 205 candidates
Daily tie-break rotation verified: tied slugs reorder for dayOfYear ∈ {1,2,3,151,365}
```

---

## Prioritized remediation summary

| #   | Severity | Item                                                                       | Fix effort                                                              |
| --- | -------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | HIGH     | Guided-cook coverage 7/76 meals, 148/281 entities → dead-ends (rule 4)     | Large (content authoring); small to gate it in `validate:data`          |
| 2   | MEDIUM   | prepBurden constant + nutrition bonuses dead (hardcoded `prepTime/macros`) | Medium (add real times/macros to sides.json or derive from step timers) |
| 3   | MEDIUM   | `seasonalScorer` wall-clock → cross-season non-reproducibility             | Small (thread injectable `now`; amend CLAUDE.md wording)                |
| 4   | LOW      | anti-monotony is a server-side no-op (dead dimension)                      | Small (pass served-log to engine, or drop + renormalize)                |
| 5   | LOW      | Legacy `pairingEngine.ts` `Math.random` dead path                          | Small (delete or document as legacy/heatmap-only)                       |
| —   | INFO     | No per-record source attribution on meals/sides                            | Small (add `sourceUrl` field if provenance audit ever needed)           |
| —   | INFO     | 37 sides orphaned from all `sidePool`s (engine-reachable)                  | Verify intent                                                           |

---

## Positives worth noting

- **Build-gated integrity:** `"build": "pnpm validate:data && pnpm typecheck && next build"` — orphan guided-cook entries can never reach production (validator exits 1).
- **Zero corruption** across IDs, refs, and images — the hard-integrity axes are solid.
- **Bridge layer is robust:** `sideBridge.ts` cleanly resolves engine display-names → app slugs (explicit map + slugify fallback), achieving 100% pairing resolution.
- **Live engine is genuinely deterministic** on the dimensions that get real inputs; the daily tie-break is correctly scoped to ties only.
- **Guided-cook steps are well-formed** where they exist: 0 non-sequential step numbers, 0 wrong-phase steps across 126 side flows (445 steps); 49% have timers, 79% mistake warnings, 56% quick hacks.
- **Strong content provenance** (Stanford content with source fields + permission doc; compass dishes cite Wikipedia/Larousse/Oxford).
