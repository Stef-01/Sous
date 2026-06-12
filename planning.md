# Sous — Canonical Planning Document

> **THE planning doc.** Last rebuilt 2026-06-11 (founder-directed full
> consolidation). Everything an agent with zero chat context needs: the stage
> model, the MVP build policy, how every shipped system works (file paths
> included), the decision log that prevents regressions, and the execution
> queue. `CLAUDE.md` holds conventions; `STRATEGY.md` the thesis;
> `ROADMAP.md` granular build history; `docs/` deep dives (index at bottom).

---

## 1. Stage model (founder-set, 2026-06-11)

| Stage              | Goal                                                                                                   | Status            |
| ------------------ | ------------------------------------------------------------------------------------------------------ | ----------------- |
| **MVP**            | Look + feel good enough to attract stakeholder support and funding. Private eyes only.                 | **← WE ARE HERE** |
| Prototype          | Hardened MVP for repeated live demos; founder-gated keys live (Clerk, OpenAI, DATABASE_URL on Vercel). | next              |
| Public mini launch | Real users. ALL items in the Deferred Ledger (§2) must be resolved first.                              | gated on ledger   |
| Public full launch | Scale: live Places/Yelp data, real editorial, clinician review, monetisation.                          | later             |

**MVP build policy (founder decision):** during MVP/prototype, agents must
NOT block work on copyright, licensing, security hardening, or
content-compliance concerns. The build is private and indicative. Instead of
raising blockers, **log every such item in the Deferred Ledger below** and
keep building. The ledger is the contract: it is worked off, in full, during
"preparing for public mini launch".

## 2. Deferred Compliance & Safeguards Ledger

Every entry: what, where it lives, what replaces it at mini-launch prep.

| #   | Item                                                                                             | Where                                               | Mini-launch resolution                                                                        |
| --- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| L1  | Restaurant photos from venues' own sites (Zareen's, Oren's, Gott's, Reposado, Terún, Ramen Nagi) | `public/eat-out/*`                                  | Replace with licensed/partner photos or own photography; or Places API images under their ToS |
| L2  | Real restaurant names, menu items, prices, "vibe" lines in the demo dataset                      | `src/data/eat-out/stanford-demo.ts`                 | Partnerships or live Places/Yelp data (Y7 K); remove hand-set prices                          |
| L3  | Diary entries branded with real restaurant names                                                 | diary store via `demoDishToBrandedFood`             | Fine once L2 resolves (data source becomes licensed)                                          |
| L4  | Clean Program / Kaitlyn Noble recipe + photos (black bean brownies; smoothie dupes queued)       | catalog + `public/food_images/black-bean-brownies/` | Founder states blog affiliation; confirm rights in writing or replace with original content   |
| L5  | Clerk auth bypassed with mock user                                                               | `src/lib/auth/*`                                    | Re-enable Clerk; session-gate sync + social                                                   |
| L6  | Supabase RLS has no anon policies (server-only access) — service key must never reach the client | `src/lib/db`, Vercel env                            | Security review pass; key rotation                                                            |
| L7  | Rate limiting (Upstash) + error monitoring (Sentry) are credential-less scaffolds                | `src/lib/ratelimit`, `src/lib/monitoring`           | Wire real credentials; load-test                                                              |
| L8  | Content tab editorial is placeholder-flagged with fictional "(sample)" authors                   | `src/data/content/*`                                | Stage-2 editorial workstream; real clinician names only with consent                          |
| L9  | Therapeutics evidence cards marked "unreviewed"                                                  | `src/lib/therapeutics`                              | Clinician review (G1) + legal pass (G5)                                                       |
| L10 | Restaurant-portion nutrition is hand-estimated (`manual-estimate`/`approximated`)                | stanford-demo dishes                                | Replace with chain-published data or better estimates                                         |
| L11 | tesseract.js fetches eng.traineddata from a public CDN at runtime                                | `log-food.tsx` readText                             | Self-host the traineddata asset                                                               |
| L12 | Open Food Facts used under its open licence — attribution line exists; formal ODbL check pending | `/api/branded-food/*`                               | Confirm attribution requirements in UI                                                        |
| L13 | Pixelify Sans via Google Fonts (OFL — already compliant; logged for completeness)                | `src/lib/fonts/pixel-font.ts`                       | none needed                                                                                   |
| L14 | Chef Tu David Phu recipes/credits in catalog                                                     | `src/data/content/chef-tu.ts` + recipe credits      | Confirm partnership/permission in writing                                                     |

Add to this table whenever new third-party material enters the repo. Never
delete entries; mark them `RESOLVED <date>` when worked off.

## 3. Critical appraisal — everything requested in this chat window

| Request                                                               | Shipped state                                                            | Honest caveats                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 10-phase UI overhaul + recursive improvement rounds                   | Done, committed                                                          | —                                                                               |
| Mediterranean misclassification RCA + 20-food verify                  | Done; classification tests in suite                                      | —                                                                               |
| Path restructure + Nutrition 4th tab + auto-log on cook completion    | Done; tabs Today·Path·Nutrition·Content                                  | CLAUDE.md 3-tab wording needs founder commit (file env-protected)               |
| 13/15 tracking features (calendar + Apple Health deferred by founder) | Done + 5× verify loops each                                              | photo-log later replaced by OCR camera (D-3/D-4)                                |
| Supabase cross-device diary sync                                      | Done; outbox/tombstones/idempotent upserts; verified vs live DB via MCP  | No local DATABASE_URL (designed degradation); kv adopt fill-empty-only          |
| Mockup-parity grocery + meal plan (Crouton refs)                      | Done: row grammar, slot popover, day kcal, move grid, Plan entry on Path | Snack slot deliberately absent (D-12)                                           |
| Unified "Log food" (type/voice/OCR/barcode/staples)                   | Done; OCR proven end-to-end in Node (GREEK YOGURT fixture)               | In-browser shutter verified to frame-grab boundary (headless can't fake camera) |
| Unit swap g ⇄ cups                                                    | Done; engine-true; 11 tests                                              | Countables never convert (D-6)                                                  |
| Goal stars + plans                                                    | Done; pinning RCA fixed (zero/absent synthesize at 0%; overflow grid)    | Copy bound by claim contract                                                    |
| Pixel-Doberman Tamagotchi (full-screen, all-real)                     | Done; 5 spec rounds + 5 research rounds                                  | Coins/decay/fake buttons rejected (D-9)                                         |
| Eat-out Stanford demo (Zareen's + 12 more, loggable, goal-fit)        | Done; 6 venues wear own-site photos; featured swipe bar                  | Photos = Ledger L1/L2; 7 venues on matched repo photos                          |
| MacroFactor tracking layer (week strip/cards/slots)                   | Done; ⇄ mode; View all; redundancy cut via ring `microsOnly` (D-15)      | —                                                                               |
| Black bean brownies ingestion                                         | **QUEUED — full spec §6.1**                                              | hero photo committed by founder                                                 |
| Erewhon smoothie dupes ingestion                                      | Queued behind brownies                                                   | founder supplies images                                                         |
| IG/Toast sweep for remaining venue photos                             | Attempted; DoorDash/IG/Evvia wall headless browsers                      | Manual IG-save drop is the practical route                                      |

## 4. Technical reference — how the whole app works

**Read before building. Every system below is LIVE; breaking one is a
regression.** Stack: Next.js 15 App Router, React 19, Tailwind 4, tRPC,
Drizzle → Supabase Postgres.

### 4.0 The shared-store pattern (used by nearly all client state)

Module-level snapshot + `Set<listener>` + `useSyncExternalStore`,
localStorage persistence, server snapshot = empty, module-level action fns
callable outside React. Examples: `use-nutrition-diary.ts`,
`use-personal-targets.ts`, `streak-freeze.ts`, `use-nutrient-goals.ts`,
`use-unit-pref.ts`, `use-health-lens.ts`, `use-hydration.ts`. New
cross-surface state MUST use this pattern, not Context.

### 4.1 Today (`src/app/(today)/today/page.tsx`)

Craving search (primary CTA) → QuestCard deck. The deck pins **today's
planned meal first** (slot via `useMealPlanWeek` + `pickCurrentMeal` in
`src/types/meal-plan.ts`; hero label flips to "Planned for today") — there
is NO separate planned-meal card (D-7). Below: TonightChip, WhosAtTable,
more-options drawer (eat-out entry), NutritionGoalCard (renders once),
FriendsStrip. Dish-name hero is deliberately 30% smaller than
`.sous-display`.

### 4.2 Guided Cook (`src/app/cook/[slug]`, `src/components/guided-cook/`)

Mission→Grab→Cook→Win, always (rule 4). Grab = `ingredient-list.tsx`:
by-dish/by-station tabs, pantry dots, substitution AI, **unit toggle**
(g|cups — `useUnitPref` + `displayQuantity` → `convertQuantity`, which uses
the SAME density data as the nutrition engine; countables never convert).
Serving slider scales nutrition. **Win auto-logs the diary**
(`diaryLogCook(..., { auto: true })`; user recipes embed a computed vector
when coverage ≥ 0.5 via `computeUserRecipeNutrition`).

### 4.3 Nutrition engine (`src/lib/engine/dish-nutrition.ts`, `src/lib/nutrition/`)

Ingredient registry (`src/data/ingredients/registry.generated.ts`): per100g
vectors + `densityGPerCup` + `gramsPerPiece`, alias resolution via
`resolveIngredientByName`. Coverage gating at `NUTRITION_COVERAGE_FLOOR`
(0.7) everywhere — **no number is shown the engine can't back**. Deficits:
`computeDeficits`/`topDeficit` → `dishesForDeficit` (chips + pet craving +
reranker weights). Provenance/confidence enums ride every vector.

### 4.4 Nutrition tab (`src/app/(nutrition)/nutrition/page.tsx`)

Top→bottom: header (kicker + serif title + **pixel-dog Easter egg**) →
WeekStrip (real logged-day checks; doubles as the day pager) → CaloriesCard
→ MacrosCard (⇄ consumed/remaining) → streak-freeze rescue chip → Diary
meal-slot cards (`tracking-cards.tsx`: `bucketBySlot` 11h/16h boundaries,
real 4/4/9 splits via `slotSummary`, per-slot Log focuses LogFood, expand =
editable `DiaryEntryRow`s) → plan avoid-note → **LogFood** (`log-food.tsx`:
merged local+OFF results, "dal and rice" multi-log, OCR camera via
`extract-food-query.ts` + lazy tesseract, BarcodeDetector, voice, staples
chips) → ring card with **`microsOnly`** (D-15: ring/legend/targets REMOVED
here; Key nutrients + full breakdown stay) → weekly trend → hydration.

### 4.5 Goals & stars

`use-nutrient-goals.ts` (manual stars ∪ active plan bundle from
`goal-plans.ts`; all plan copy must pass `assertNoMedicalClaim`).
Key-nutrient selection = `selectKeyNutrientRows`: **every starred nutrient
renders — zero/absent ones synthesized at 0% from `NUTRIENT_DISPLAY`; the
grid grows past 4 slots** (tests in `key-nutrient-rows.test.ts`). Stars
feed: ring pinning, eat-out goal badges/filter, pet reading corner.

### 4.6 Diary sync (`src/lib/sync/diary-sync.ts`, `src/lib/trpc/routers/diary.ts`)

Local-first: every diary action enqueues into a persisted outbox → debounced
flush → idempotent server upsert on `(user_id, at)`; removals are
tombstones; one pull/session merges via pure `mergeRemoteEntries`.
`device_kv` carries personal-profile (adopt-when-empty), streak-freezes
(UNION), nutrient-goals (adopt-when-empty). Identity = `x-sous-device-id`.
Degrades to localStorage-only without DATABASE_URL.

### 4.7 Meal plan (`src/types/meal-plan.ts`, `use-meal-plan-week.ts`, `/path/plan*`)

21 sparse slots (7 days × 3 meals), zod-validated localStorage per ISO week.
Week view: day sections, slot popover on [+] (`?slot=` rides into the swipe
planner for the first schedule), coverage-gated per-meal + per-day kcal,
tap-meal manage sheet (Cook now / 7×3 move grid / Remove). Entry: Path "Plan".

### 4.8 Path (`src/app/(path)/path/page.tsx`)

Workflow trio Pantry·Plan·Groceries on top; "Your kitchen" drawer 2×2
(Favorites/My recipes/Household/Eco); Progression collapsible at bottom
(skill tree, journey, weekly goal, badges, Weekly recap link). XP:
`use-xp-system.ts` (level = floor(totalXP/100)+1).

### 4.9 Grocery (`/path/shopping-list`, `use-shopping-list.ts`)

Aisle-grouped; row grammar checkbox-left / name / bold qty right / emoji
far-right (Crouton ref); dashed dividers; unit-pref-aware quantities;
recipes carousel with per-recipe removal; nutrition rollup;
move-bought-to-pantry.

### 4.10 Eat out (`/eat-out`, `src/data/eat-out/stanford-demo.ts`)

13 real Stanford-area venues ≤20 km; featured swipe bar (all dishes,
goal-fit first, kcal before venue name); photo-led venue cards (heroImage =
venue's own photo when present, else first dish's matched repo photo — never
a gradient); venue sheet: per-dish macros + one-tap `diaryLogBranded`
(brand = restaurant, `manual-estimate`). Integrity tests pin: Zareen's
present, ≤20 km, **every referenced image exists on disk**, unique slugs,
±25% 4/4/9 macro sanity. Old global fixtures (`eat-out-fixtures.ts`) exist
only for the ranking-layer tests.

### 4.11 Pet — Dobe (`src/components/nutrition/pet-*.tsx`, `pixel-*.tsx`)

Easter egg: unlabeled pixel dog in the Nutrition header → full-screen
portalled room. EVERYTHING real: `computePetState` (hearts = 5 daily
achievements), hydration glasses, vitamin/fiber DV coverage
(`pet-screen-data.ts`), Path-XP nameplate, today's diary feed, pantry
inventory, deficit craving + `spotlightForNutrient` reading link,
`statTrends` arrows (null when yesterday empty), weekly recap chip (≥3
logged days last week). Sprite: 40×32 map + programmatic
`outline()`/`shade()`; moods recompose ears/eyes/tongue; collar at Lv3/Lv6;
breathing bob + random blinks; play-bow on tap. Room: 240×160 SVG with
real-clock dayparts. Chrome: PixelFrame bevels + Pixelify Sans + 12
hand-pixelled icons. NO decay/guilt/coins (D-9).

### 4.12 Misc systems

Hydration (goal 8 glasses). Streak freezes (earned ≤2, 28-day expiry,
bridge-not-count). Weekly wrapped (`/path/recap`). Health lens
(everyday/therapeutic/ayurvedic; the lens NEVER upgrades claim status).
Content tab: articles + nutrient spotlights (placeholder-flagged). Claim
contract: `assertNoMedicalClaim` bans cure/treat/prevent/heal/reverse/
diagnose stems — ALL new health copy must pass it, with a test.

### 4.13 Gates & conventions

Every change: `pnpm lint && pnpm test && pnpm build` green → commit to main
→ push (never branches, never uncommitted). Live-verify UI on the preview
server with seeded localStorage. Pure logic gets co-located vitest files.
`*.integration.ts` (network-dependent, e.g. `ocr-pipeline`) stays OUT of the
default suite. Data-referenced images MUST have a disk-existence test.
CLAUDE.md is env-protected — only the founder commits it.

## 5. Decision log (do NOT relitigate without founder approval)

| ID   | Date       | Decision                                                                                                                                    |
| ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| D-1  | 2026-06-09 | Nutrition is a 4th permanent tab; the diary lives there                                                                                     |
| D-2  | 2026-06-09 | Cook completion auto-logs the diary (`auto: true`)                                                                                          |
| D-3  | 2026-06-10 | Four logging surfaces collapsed into ONE LogFood; PhotoLog/TextQuickLog/BarcodeScan/BrandedFoodSearch components DELETED — do not resurrect |
| D-4  | 2026-06-10 | The camera READS text (OCR); it does not guess (no vision model, no key)                                                                    |
| D-5  | 2026-06-10 | Matcher: connector stopwords don't score; whole-word > prefix > substring                                                                   |
| D-6  | 2026-06-10 | Units: countables never convert; conversions use engine density data only                                                                   |
| D-7  | 2026-06-10 | TodayPlannedSlot + TodayEatingCard DELETED; planned meal pins as first deck card                                                            |
| D-8  | 2026-06-10 | Path top row = Pantry·Plan·Groceries; Recap under Progression                                                                               |
| D-9  | 2026-06-10 | Pet: NO decay/guilt, NO coins/gems, NO fake-action buttons; every number traces to a real store                                             |
| D-10 | 2026-06-10 | Pet growth = real Path level (puppy <3, red collar 3–5, gold 6+)                                                                            |
| D-11 | 2026-06-10 | Eat-out global fixtures (incl. Noma) replaced by the Stanford demo dataset                                                                  |
| D-12 | 2026-06-10 | Snack slot NOT added to the 3-meal plan model (founder paused it; revisit only on explicit ask)                                             |
| D-13 | 2026-06-11 | Nutrition header: no kcal-left, no streak chip, no CSV button (`diary-export.ts` kept as tested lib, UI retired)                            |
| D-14 | 2026-06-11 | Diary = Breakfast/Lunch/Dinner slot cards (11h/16h), not a flat list                                                                        |
| D-15 | 2026-06-11 | Nutrition-page ring card is `microsOnly` (no ring/legend/targets; Calories+Macros cards own the glance). Cook pages keep the full ring      |
| D-16 | 2026-06-11 | MVP stage policy + Deferred Ledger (§1–2): log, don't block                                                                                 |
| D-17 | 2026-06-10 | Trend arrows honest only: vs yesterday's real aggregate; omitted when yesterday empty; no fake rewards                                      |
| D-18 | 2026-05-04 | Info button is the floating bottom-center pill — never relocate user-specified UI without approval                                          |

## 6. Execution queue (next up, in order)

### 6.1 Black bean brownies — SHIPPED 2026-06-11 (commit 0807de8)

Landed exactly per this spec: folder-per-food images
(`public/food_images/black-bean-brownies/hero.jpg`; `step-N.jpg` slots
documented for the founder's incoming step photos), catalog entry, guided
cook steps, claim-safe health facts with contract test
(`src/data/black-bean-brownies.test.ts`). Spec retained below for the
smoothie pipeline to reuse.

Source: founder's blog (Clean Program; recipe + photography Kaitlyn Noble —
Ledger L4). Hero already committed:
`public/food_images/blackbeanbrowniesfinal.jpg` (750×550).

1. **Folder-per-food structure (NEW)**: create
   `public/food_images/black-bean-brownies/`; move hero in as `hero.jpg`.
   Founder will add step photos (`step-1.jpg` beans-in-processor,
   `step-2.jpg` batter, `step-3.jpg` pan, `step-4.jpg` cut, `step-5.jpg`
   stack). Steps render their photo when the file exists; degrade gracefully
   when absent.
2. **Catalog entry** (side/dessert; copy an existing side's shape in
   `src/data/`): id `black-bean-brownies`, cuisine `american`, tags
   dessert/baking/legume. Ingredients with quantities: 1 15-oz can black
   beans (rinsed, drained); 2 large eggs (or flax option: 2 tbsp ground flax
   - ¼ cup hot water, rest 10 min); ¼ cup coconut oil or ghee; 1 tsp
     vanilla; ⅓ cup raw cacao powder; ¾ cup coconut palm sugar; ½ tsp baking
     powder; ¼ tsp salt; optional ½ cup chocolate chips.
3. **Guided cook steps** (`src/data/guided-cook-steps.ts`): preheat 350°F
   (flax-egg variant as a hack chip) → blend everything except chips until
   smooth and creamy (photo 1) → fold chips in by hand (photo 2) →
   grease/parchment an 8×8 dish (photo 3) → pour + bake 20–25 min until a
   toothpick comes out clean (20-min timer; mistake chip: overbaking dries
   them — pull at clean toothpick) → cool slightly before cutting (photos
   4–5). **Schema extension**: optional `stepImageUrl` on the step type +
   StepCard renders the image (rounded-xl, above the instruction) when set.
4. **Health content — rephrase claim-safe** (the blog text contains banned
   stems: "preventing chronic illnesses", "prevent the risk", "reduces the
   chance"): association framing only — black beans ≈16 g fiber/cup (over
   half the daily value), supports digestion, fullness, and healthy LDL
   levels; ≈15 g/cup plant protein; the fiber+protein pair supports steady
   blood sugar (a strong dessert base); potassium supports healthy blood
   pressure; raw cacao is among the highest plant antioxidant sources and
   supports blood-vessel function. Run `assertNoMedicalClaim` over every new
   string in a test. Surface via the dish's existing health/info facet.
5. Registry: check black beans/eggs/coconut oil/cacao/coconut sugar per100g
   coverage; add cheap missing entries, else let coverage gate honestly.
   Tests: catalog validation, step-image disk existence (when present),
   claim safety. Verify `/cook/black-bean-brownies` end-to-end; gate; commit.

### 6.2 Following

- Erewhon smoothie dupes (same pipeline; founder supplies images; re-fetch
  the cleanprogram.com post at execution time).
- Remaining eat-out hero photos: founder saves from Instagram →
  `public/eat-out/<venue-slug>.jpg` → one-line heroImage wiring (the disk
  test auto-verifies).
- Pet: optional second idle animation (ear flick/tail sway); seasonal rooms.
- Guided-cook coverage for flowless dishes; Playwright journey suite.

## 7. Docs index

`STRATEGY.md` thesis + decision log · `ROADMAP.md` build log ·
`docs/SOUS-COMPREHENSIVE-YEAR-PLAN.md` forward plan ·
`docs/FOUNDER-UNLOCK-RUNBOOK.md` founder-gated keys ·
`docs/PRODUCTION-READINESS-PLAN.md` go-live ·
`docs/MOCKUP-POLISH-PLAN.md` (closed) ·
`docs/PET-AESTHETIC-OVERHAUL.md` (executed) ·
`docs/STAGE-3-LEAN-CONTENT.md` Content spec ·
`docs/INGREDIENT-NUTRITION-ARCHITECTURE-PLAN.md` registry design.
The remaining ~50 docs are point-in-time plans: on conflict, trust THIS file

- `ROADMAP.md` over any of them.
