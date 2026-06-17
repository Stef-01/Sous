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

| Request                                                               | Shipped state                                                                               | Honest caveats                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 10-phase UI overhaul + recursive improvement rounds                   | Done, committed                                                                             | —                                                                               |
| Mediterranean misclassification RCA + 20-food verify                  | Done; classification tests in suite                                                         | —                                                                               |
| Path restructure + Nutrition 4th tab + auto-log on cook completion    | Done; tabs Today·Path·Nutrition·Content                                                     | CLAUDE.md 3-tab wording needs founder commit (file env-protected)               |
| 13/15 tracking features (calendar + Apple Health deferred by founder) | Done + 5× verify loops each                                                                 | photo-log later replaced by OCR camera (D-3/D-4)                                |
| Supabase cross-device diary sync                                      | Done; outbox/tombstones/idempotent upserts; verified vs live DB via MCP                     | No local DATABASE_URL (designed degradation); kv adopt fill-empty-only          |
| Mockup-parity grocery + meal plan (Crouton refs)                      | Done: row grammar, slot popover, day kcal, move grid, Plan entry on Path                    | Snack slot deliberately absent (D-12)                                           |
| Unified "Log food" (type/voice/OCR/barcode/staples)                   | Done; OCR proven end-to-end in Node (GREEK YOGURT fixture)                                  | In-browser shutter verified to frame-grab boundary (headless can't fake camera) |
| Unit swap g ⇄ cups                                                    | Done; engine-true; 11 tests                                                                 | Countables never convert (D-6)                                                  |
| Goal stars + plans                                                    | Done; pinning RCA fixed (zero/absent synthesize at 0%; overflow grid)                       | Copy bound by claim contract                                                    |
| Pixel-Doberman Tamagotchi (full-screen, all-real)                     | Done; 5 spec rounds + 5 research rounds                                                     | Coins/decay/fake buttons rejected (D-9)                                         |
| Eat-out Stanford demo (Zareen's + 12 more, loggable, goal-fit)        | Done; 6 venues wear own-site photos; featured swipe bar                                     | Photos = Ledger L1/L2; 7 venues on matched repo photos                          |
| MacroFactor tracking layer (week strip/cards/slots)                   | Done; ⇄ mode; View all; redundancy cut via ring `microsOnly` (D-15)                         | —                                                                               |
| Black bean brownies ingestion                                         | **QUEUED — full spec §6.1**                                                                 | hero photo committed by founder                                                 |
| Erewhon smoothie dupes ingestion                                      | Queued behind brownies                                                                      | founder supplies images                                                         |
| IG/Toast sweep for remaining venue photos                             | Attempted; DoorDash/IG/Evvia wall headless browsers                                         | Manual IG-save drop is the practical route                                      |
| Mockup-driven onboarding/survey/glyph overhaul (28 imgs, docs/PLANS)  | **W1–W6 SHIPPED** (W4 f72e9a5, W5 suppression 8276cf5 + flag-consumers 86edec2, W6 9412d70) | Copy must stay claim-safe + stat-free (D-22); engine wiring is the value        |

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

| ID   | Date       | Decision                                                                                                                                                                                                                                                                     |
| ---- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-1  | 2026-06-09 | Nutrition is a 4th permanent tab; the diary lives there                                                                                                                                                                                                                      |
| D-2  | 2026-06-09 | Cook completion auto-logs the diary (`auto: true`)                                                                                                                                                                                                                           |
| D-3  | 2026-06-10 | Four logging surfaces collapsed into ONE LogFood; PhotoLog/TextQuickLog/BarcodeScan/BrandedFoodSearch components DELETED — do not resurrect                                                                                                                                  |
| D-4  | 2026-06-10 | The camera READS text (OCR); it does not guess (no vision model, no key)                                                                                                                                                                                                     |
| D-5  | 2026-06-10 | Matcher: connector stopwords don't score; whole-word > prefix > substring                                                                                                                                                                                                    |
| D-6  | 2026-06-10 | Units: countables never convert; conversions use engine density data only                                                                                                                                                                                                    |
| D-7  | 2026-06-10 | TodayPlannedSlot + TodayEatingCard DELETED; planned meal pins as first deck card                                                                                                                                                                                             |
| D-8  | 2026-06-10 | Path top row = Pantry·Plan·Groceries; Recap under Progression                                                                                                                                                                                                                |
| D-9  | 2026-06-10 | Pet: NO decay/guilt, NO coins/gems, NO fake-action buttons; every number traces to a real store                                                                                                                                                                              |
| D-10 | 2026-06-10 | Pet growth = real Path level (puppy <3, red collar 3–5, gold 6+)                                                                                                                                                                                                             |
| D-11 | 2026-06-10 | Eat-out global fixtures (incl. Noma) replaced by the Stanford demo dataset                                                                                                                                                                                                   |
| D-12 | 2026-06-10 | Snack slot NOT added to the 3-meal plan model (founder paused it; revisit only on explicit ask)                                                                                                                                                                              |
| D-13 | 2026-06-11 | Nutrition header: no kcal-left, no streak chip, no CSV button (`diary-export.ts` kept as tested lib, UI retired)                                                                                                                                                             |
| D-14 | 2026-06-11 | Diary = Breakfast/Lunch/Dinner slot cards (11h/16h), not a flat list                                                                                                                                                                                                         |
| D-15 | 2026-06-11 | Nutrition-page ring card is `microsOnly` (no ring/legend/targets; Calories+Macros cards own the glance). Cook pages keep the full ring                                                                                                                                       |
| D-16 | 2026-06-11 | MVP stage policy + Deferred Ledger (§1–2): log, don't block                                                                                                                                                                                                                  |
| D-17 | 2026-06-10 | Trend arrows honest only: vs yesterday's real aggregate; omitted when yesterday empty; no fake rewards                                                                                                                                                                       |
| D-18 | 2026-05-04 | Info button is the floating bottom-center pill — never relocate user-specified UI without approval                                                                                                                                                                           |
| D-19 | 2026-06-11 | Onboarding/survey UI follows the measured mockup grammar (docs/ONBOARDING-SURVEY-DESIGN-KIT.md) but keeps Sous identity: cream theme, nourish-green accent, serif titles — mockup palettes do NOT transfer                                                                   |
| D-20 | 2026-06-11 | UI emojis are replaced by the inline-SVG food-glyph set where a glyph exists; emoji remains only as final fallback. Pet + achievements exempt (D-9)                                                                                                                          |
| D-21 | 2026-06-11 | Micro-surveys ("pulses") are coach interactions: one screen, ≤8 s, one-tap skip, ≤1/day, ≥72 h apart, ≤2/week, deterministic scheduling (no Math.random), permanent per-pulse dismiss. Volunteered entry = single "Tune my picks" row in the existing Profile sheet (rule 3) |
| D-22 | 2026-06-11 | Mirror-summary/survey copy is forward-promise only — NO fabricated social-proof stats (the mockups' "users save 25%" pattern is banned by test)                                                                                                                              |
| D-23 | 2026-06-11 | Body-data capture (age/height/weight wheels) only behind the macros goal branch, each screen carrying the stored-privately caption; writes the EXISTING personal-targets store, no parallel store                                                                            |

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

### 6.2 Onboarding, micro-survey & food-glyph overhaul (mockup-driven) — QUEUED 2026-06-11

**Why.** Founder committed 28 reference mockups to `docs/PLANS/IMG_*.PNG`
(MOB light onboarding; a dark orange-accent calorie app; a navy blue-accent
MFP-style flow). They were pixel-measured and inventoried in
`docs/ONBOARDING-SURVEY-DESIGN-KIT.md` (the design-token + per-screen
geometry reference for everything below). Three things transfer to Sous:
(1) a reusable survey component grammar far more polished than the current
coach quiz, (2) an onboarding **narrative arc** (goal → friction → relatable
statements → tastes → mirror summary) that converts answers into engine
signals, and (3) **line-art food glyphs replacing UI emojis** (the dark app's
Dislikes grid is the model). Thesis fit (STRATEGY.md): every captured signal
sharpens recommendations and raises switching cost; capture stays inside the
60-second philosophy because pulses are one screen, ≤8 s, skippable in one
tap.

**Hard constraints carried in.** Rule 3: pulses are coach interactions, not
settings — the only volunteered entry point is one "Tune my picks" row in the
EXISTING Profile sheet. Rule 7/11: photo tiles use only existing
`food_images`/`eat-out` assets; glyphs are inline SVG UI chrome
(precedent: pet `pixel-icons.tsx`), not dish imagery — the image pipeline is
untouched. Rule 10: every survey screen pins its CTA with flex `mt-auto`,
verified at 375×667. Rule 13: option rows are glyph + label only; no
explanatory paragraphs; "(Recommended)" is inline subtext, never a badge.
Honesty (D-17 spirit): the mockups fabricate social proof ("MOB users save
25%") — Sous mirror copy is forward-promise only, enforced by test.

#### W1 — Survey kit (`src/components/survey/`) + types — SHIPPED 2026-06-16 (commit d830f49)

Shipped the full kit: zod-sourced `SurveyStepSchema` (11 step kinds), all
components (survey-shell, option/check rows, statement-swipe, thumb-row,
chip-cloud, photo-tile-grid, glyph-grid, wheel-picker, interstitial,
mirror-summary), the `survey-runner` (answers + back/skip + `showIf`
branches → emits `(answers, signals)`), the pure `compute-survey-signals`
aggregator, and pure `survey-logic` helpers. Added a `chips` step kind so the
chip-cloud component has a matching kind. Every kind was browser-verified at
390×844; 37 unit tests. The original spec below is retained for reference.

1. `src/types/survey.ts`: zod discriminated union `SurveyStepSchema` —
   `single` | `multi` | `likert` | `statements` | `thumbs` | `photo-tiles` |
   `glyph-grid` | `wheel` | `interstitial` | `mirror`. Each step declares
   `id`, `title`, optional `subtitle`, options (with `glyph`, `label`,
   optional `subtext`, optional `recommended`), and a `signals` map (option →
   preference updates / flags). `SurveyAnswers = Record<stepId, value>`.
   Infer all TS types from zod (house rule).
2. Components, all consuming the geometry tokens from the design kit doc
   (row min-h 64px `--radius-md`, gap 12, margin `--gutter`; selected =
   `--nourish-green` ring + check disc; CTA h-48 `--radius-pill`
   `--shadow-cta`):
   - `survey-shell.tsx` — back chevron + **segmented progress** (one 4px
     segment per step, gap 4, fill `--nourish-green`, track
     `--nourish-border`), serif title, 15px subtitle, content slot, pinned
     footer CTA. Flex column, `mt-auto` footer (rule 10).
   - `option-row.tsx` (single: radio-right → green check disc on select;
     supports `subtext` for witty-subtitle and "(Recommended)" patterns) and
     `check-row.tsx` (multi: 24px rounded checkbox left, supports an
     exclusive none-option that clears others).
   - `statement-swipe.tsx` — quote card stack (white, `--radius-lg`,
     `--shadow-raised`, oversized quote glyph, next-card peek at
     translateY(12px) scale(.96)); framer-motion drag with rotate; ✗/✓
     white circles (64px, `--shadow-raised`; `--nourish-evaluate` /
     `--tier-strong`) for tap fallback; respects `prefers-reduced-motion`
     (buttons only, no drag).
   - `thumb-row.tsx` — label + 👍/👎 toggle pair per row (three-state:
     like / dislike / unset), hairline dividers.
   - `chip-cloud.tsx` — wrap layout, h-32px pills; optional
     "Recommended for you" group rendered first with pre-tint.
   - `photo-tile-grid.tsx` — 2-col, gutter 12, `--radius-sm`, label strip on
     top (mockup detail), image below; **sources strictly from existing
     food_images via a static map**; multi or single select.
   - `glyph-grid.tsx` — 3-col circles (88px, surface fill); selected-dislike
     = accent ring + slash overlay + struck-through muted label (4557
     grammar).
   - `wheel-picker.tsx` — scroll-snap column, 5 visible rows, top/bottom
     fade masks, center highlight bar; optional unit segmented control
     (lb/kg, cm/ft-in) that converts in place; emits canonical units.
   - `interstitial.tsx` (glyph + eyebrow + serif headline + ≤2-line body)
     and `mirror-summary.tsx` (stacked echo cards: glyph + one-line
     forward-promise; dark pill CTA).
   - `survey-runner.tsx` — renders a `SurveyDef` (list of steps), owns
     answer state, back/skip, conditional branches (`showIf(answers)`), and
     emits `(answers, computedSignals)` on completion. Onboarding and pulses
     BOTH run through this one runner.
3. Tests: zod schema round-trips; runner branch logic; none-option
   exclusivity; reduced-motion path renders buttons. Axe pass on each
   component in vitest + jsdom where feasible.

#### W2 — Food glyph system (kills UI emojis) — SHIPPED 2026-06-16 (commit f71ebb5)

Shipped a 19-glyph registry (10 cuisines + 9 dish-type/protein) — standard
shapes vendor lucide ISC path data, cuisine-specifics (sushi/taco/takeout/pho/
noodles/curry/rice/bread) authored in the same grammar and visually verified.
Swapped: dish-image cuisine fallback (10 cuisines → distinct glyphs, was 4
reused lucide icons), planner week list, grocery card, journey thumbnail. The
coach-quiz option emojis stay until W3 rebuilds that surface (no throwaway).
48 new tests (registry integrity + mapping completeness). The original spec
below is retained for reference.

1. `src/components/icons/food-glyphs.tsx` — single-file registry of inline
   SVG line glyphs: 24×24 viewBox, stroke 1.75, round caps/joins,
   `currentColor`. Initial set (~64): 12 cuisines (ramen bowl, taco, pasta
   swirl, tagine, wok…), ~30 dislike-grade ingredients (broccoli, beets,
   blue cheese, mushroom, cilantro, olives, shellfish…), ~12 meal/type
   glyphs (salad, soup, bread, dessert, fish, chicken), ~10 abstract (flame,
   leaf, clock, piggy-bank, sparkle, lock). Export
   `<FoodGlyph name size />` + `FOOD_GLYPH_NAMES` const for tests.
2. `src/lib/utils/dish-glyph.ts` — `getDishGlyph(tags, cuisine)` mirroring
   `getDishEmoji`'s mapping table; `dish-emoji.ts` stays only as final
   fallback for names with no glyph.
3. Swap sites (surgical, this order): coach-quiz/onboarding options →
   glyphs; `dish-image.tsx` gradient fallback (replace the 4-icon lucide
   `CUISINE_ICON_MAP` with cuisine glyphs); grocery row far-right emoji →
   ingredient glyph when one exists (else keep emoji — no regression);
   `WhosAtTable` and Today chips. Achievements/pet emojis are explicitly
   OUT of scope (pet is D-9 territory).
4. Test: every onboarding option key, all 8 cuisines, and every dislike-grid
   id resolves to a registered glyph (`FOOD_GLYPH_NAMES` completeness test).

#### W3 — Onboarding v2 (rebuilds the coach quiz on the kit) — SHIPPED 2026-06-16 (commit a233776)

Shipped: the narrative arc on the W1 runner (goal → parent-age branch →
friction → statements → family statement → dietary → cuisines → skill → macro
numeric branch → personalised mirror). `src/data/onboarding-v2.ts` (def +
8 mastery cuisines), `OnboardingProfileV2` (zod), `apply-onboarding.ts` (pure
mapper → profile + preference vector + parent band + macro PersonalProfile +
kcal + mirror cards) and `onboarding-flow.tsx` (two-phase). Today mounts it in
place of the now-deleted coach-quiz UI (the data/aggregator stay for
recap/rhythm). Cuisine/flavor seeds warm the deck immediately via the
preference vector; dietary/skill/flags are captured for W5. Also fixed a
runner bug (consecutive same-kind steps reused one instance — now keyed by
step id). Both branches browser-verified; 14 new tests. NOTE vs the spec
below: `recordSignal(kind:onboarding)` warming is deferred to W5 (the existing
SignalKind enum has no onboarding kind — W5 owns signal→consumer wiring), and
the numeric branch adds a `sex` step (Mifflin-St Jeor needs it). The original
spec is retained for reference.

Narrative arc, ≤90 s, every step skippable, replacing the current 6-question
modal in `coach-quiz.tsx` (keep `computePreferencesFromAnswers` aggregation
approach, extend its input space; DELETE the old quiz UI after parity —
D-3 style, no resurrection):

1. **Goal** (single, glyph rows): hit macro goals / plan my week / super
   simple recipes / last-minute inspiration / feed my family / live well
   for longer. Sets `goalKey`; family answer reveals a one-tap Parent Mode
   age-band follow-up (existing `parentModeAgeBand` plumbing).
2. **Friction** (multi, none-option): lack of time / tired after work /
   cooking feels hard / no inspiration / recipes scattered / can't find the
   right ones. → effort + feature-emphasis flags.
3. **Statements** (swipe, 4 cards): money / time-wasted-searching /
   kid-struggle (only if family) / processed-food. → boolean flags.
4. **Dietary** (photo tiles): None / Veggie / Vegan / Pescatarian →
   `householdDietaryFlags` (existing engine input).
5. **Cuisines** (thumbs): the 8 mastery cuisines → ± preference-vector
   seeds (dislike = negative seed, not just absence).
6. **Skill** (single w/ witty subtitles): Novice…Advanced → skill gate +
   initial guided-cook verbosity.
7. **Numeric branch** (`showIf goalKey === 'macros'`): interstitial
   ("the next two help us size your day" + lock caption) → age/height/weight
   wheels (canonical kg/cm, privacy caption on each) → computed-result step:
   kcal target via existing personal-targets math, "Edit" affordance writes
   through `use-personal-targets.ts`. No new storage — this IS the existing
   targets store.
8. **Mirror summary**: one echo card per captured flag, forward-promise copy
   (e.g. budget → "Pantry-first picks to keep dinner cheap"; time → "30-min
   ceilings on weeknights"; kids → "Kid-tested pairings + Parent Mode";
   processed → "Whole-ingredient recipes float up"). CTA "Pick my first
   recipes" → Today deck pre-warmed from the new vector.

Persistence: versioned `OnboardingProfileV2` (zod) →
`localStorage sous-onboarding-v2` + existing `sous-preferences` /
`sous-effort-tolerance` keys (so the deck works unchanged) +
`users.preferenceVector` via tRPC when DB present. Each flag also lands as a
`recordSignal()` entry (kind `onboarding`) in `use-preference-profile.ts` so
confidence tiers start warm.

#### W4 — Pulse micro-surveys ("randomly triggered or volunteered") — SHIPPED 2026-06-16 (commit f72e9a5)

Shipped: 7 one-screen pulses on the W1 runner (`src/data/pulses.ts`), a
deterministic shared-store scheduler (`pulse-scheduler.ts` — hash-based
eligibility, ≤1/day · ≥72h · ≤2/week · 7-day post-onboarding quiet · per-pulse
dismiss), the unified write path (`apply-survey-signals.ts` → preferences /
effort / `sous-signal-flags-v1` / suppressed seeds), `PulseHost`, a "visit"
auto-trigger on Today, and the volunteered "Tune my picks" row in the Profile
sheet (rule 3). 32 tests. NOTE: anchors win-close/deck-exhaust/plan-open are
defined on the pulses + reachable via "Tune my picks"; wiring each app moment
is a thin follow-up. Original spec retained below.

1. `src/data/pulses.ts` — registry of one-screen pulses (each a 1-step
   `SurveyDef`): post-win statement card ("That felt easier than usual"
   ✓/✗ → confidence trend feeding coach tone); dislike sweep (glyph grid
   seeded from ingredients of recently skipped/rerolled recipes); cuisine
   thumbs refresh (only cuisines with weak signal — confidence-aware);
   step-pacing thumbs after a cook (→ verbosity pref); budget statement;
   planning-frequency Likert (Never→Always, gates meal-plan nudge cadence);
   meal-plan consent (Yes definitely / Open to trying / No thanks — "No"
   silences plan nudges entirely).
2. `src/lib/surveys/pulse-scheduler.ts` — shared-store pattern (§4.0),
   ledger in `localStorage sous-pulse-ledger-v1` (shown/answered/dismissed
   per pulse + timestamps). Eligibility is **deterministic**: hash of
   (deviceId, dayKey, pulseId) — SSR-safe, no `Math.random()`. Guardrails:
   ≤1 pulse/day, ≥72 h between pulses, ≤2/week, quiet for 7 days after
   onboarding, never mid-cook, per-pulse permanent dismiss, every pulse
   skippable in one tap. Trigger anchors: win screen close, deck exhaust,
   plan-week open, 3rd visit of a week.
3. Volunteered entry: a single "Tune my picks" row in
   `profile-settings-sheet.tsx` (rule-3-compliant: same sheet, one row)
   opening the runner with the user's lowest-confidence pulses first.
4. `src/lib/surveys/apply-survey-signals.ts` — PURE mapper
   `(answers) → { vectorDeltas, suppressedTags, flags, signals[] }`; the only
   write path for both onboarding and pulses. Fully unit-tested.

#### W5 — Signal → consumer wiring (the point of all of it) — SHIPPED (suppression 8276cf5; flag-consumers a85a69e + 86edec2)

Shipped the headline row first: a survey/pulse dislike (≤ −0.9 preference seed)
is a HARD exclusion in `pairing-engine.suggestSides` (schema-preserving), so a
disliked cuisine never reaches top-N — covers the "cuisine thumbs / dislikes →
excluded" + "suppressed tags reach pairing.suggest" rows, with engine tests.
DONE: the flag-consumer rows now read `sous-signal-flags-v1` through a reactive
`useSignalFlags` store (snapshot + `useSyncExternalStore`; the writer emits a
same-tab change event so a mid-session pulse updates consumers live):
decisionFatigue→calmer deck (queue 6 vs 18 + "Reroll all" hidden);
planNudgesOff→TonightChip commit nudge suppressed; pacing verbose/terse→StepCard
density (terse drops the hack+fact chips, verbose shows the hack inline);
felt-easier→a peer confidence line on the win screen; budgetSensitive→boosted
pantry-reuse weight (0.18 vs 0.08) threaded client→tRPC→engine. Browser-verified
the density + plan-nudge surfaces; unit tests for the density helper, the
confidence line (+claim-safety), and the engine budget boost. Original table
retained below.

| Captured              | Stored                            | Consumer                                          | Visible effect                            |
| --------------------- | --------------------------------- | ------------------------------------------------- | ----------------------------------------- |
| goalKey               | onboarding profile + goal weights | `dayDeficits` reblend, deck composition           | NutritionGoalCard + ranking tilt          |
| frictions: time/tired | `sous-effort-tolerance`           | engine prep-burden weight                         | quicker sides rank up; deck sorts by prep |
| statement: budget     | `budgetSensitive` flag            | pairing pantry-overlap boost; grocery rollup line | cheaper, pantry-first pairings            |
| statement: searching  | `decisionFatigue` flag            | deck size stays 3; reroll nudges off              | calmer deck                               |
| statement: kids       | parentProfile enable + ageBand    | existing parent-mode filters                      | kid-safe spice/allergen gates             |
| statement: processed  | vector boost `whole-foods`        | engine tag weight; Content spotlight order        | whole-ingredient picks float              |
| dietary tiles         | `householdDietaryFlags`           | `pairing.suggest` (existing param)                | hard filter                               |
| cuisine thumbs        | ± vector seeds + suppressed       | engine cuisine-fit term                           | likes rank up, dislikes excluded          |
| skill                 | skill gate + `cook-verbosity` kv  | quest gating; StepCard density                    | shorter/longer step text                  |
| wheels (age/h/w)      | `use-personal-targets` (existing) | deficits → engine + Nutrition tab                 | sized kcal/macros everywhere              |
| planning Likert       | `planNudgeCadence`                | TonightChip / plan chip frequency                 | nudges match habit                        |
| plan consent "No"     | flag                              | suppresses all plan nudges                        | respect the no                            |
| pulse: pacing         | verbosity pref                    | guided-cook StepCard                              | density adapts                            |
| pulse: felt-easier    | confidence trend                  | coach tone selection                              | tone matches trajectory                   |

Engine note: suppressed tags must reach `pairing.suggest` as exclusions
(today manual dislikes live client-side in `use-preference-profile.ts` —
thread them through the existing `userPreferences` param, no engine schema
break; add an engine test: suppressed cuisine never appears in top 3).

#### W6 — Copy safety + gates — SHIPPED 2026-06-16 (commit 9412d70)

Shipped the unified copy-safety gate (`src/data/survey-copy-safety.test.ts`):
every onboarding / pulse / mirror-template / import-prompt string passes
`assertNoMedicalClaim` + the no-fabricated-stats ban (D-22), in one sweep. The
Playwright e2e (onboarding happy/all-skip/numeric/pulse-cooldown) remains the
one piece not yet automated. Original spec retained below.

All survey/mirror strings pass `assertNoMedicalClaim` AND a new
no-fabricated-stats test (regex ban: `\d+\s*%[^.]*\b(users|cooks|people)\b`)
in `src/data/onboarding-v2.test.ts`. E2E: onboarding happy path, all-skip
path, numeric branch, pulse trigger + cooldown (`tests/e2e/onboarding.spec.ts`).
Live-verify at 375×667 (rule 10) and 430×932. Standard gates per §4.13;
commit per phase.

**Sequencing & classification.** All six workstreams are AUTO-BUILD (repo +
npm only; zero founder-gated dependencies). Order: W1 → W2 → W3 → W4 → W5 →
W6, each independently shippable; W2 can interleave after W1. **W1–W6 are all
SHIPPED + all follow-ups closed.** The pulse app-moment anchors
(win-close/deck-exhaust/plan-open) now fire alongside "visit" (commit fc8c9f8):
the Win screen stashes a one-shot anchor on the way back to Today, the browse
deck fires deck-exhaust on swipe-through, and a reusable `AnchorPulseHost` fires
plan-open on `/path/plan` — all gated by the same scheduler cooldowns. Playwright
journey coverage for the new Today-deck features (multi-select filters, side
search, skip-sides) lives in `e2e/today-filters-features.spec.ts`. The Erewhon
smoothie-dupes ingestion is DONE (Clean Program dupes → two Stefan-curated
`drink` sides), and the black-bean-brownie step photos were re-mapped to match
each step (SOP §7 crosscheck; commit 45d0a75).

### 6.3 Following

- Erewhon smoothie dupes — ✅ DONE (Clean Program dupes → two Stefan-curated
  `drink` sides with per-step photos + nutrition).
- Pet: second idle animation + seasonal rooms — ✅ DONE (ear-flick pose +
  `seasonFromMonth` windowsill accent; commit 7b7810a).
- Playwright journey suite — STARTED: the new Today-deck features
  (multi-select filters, side search, skip-sides) are covered in
  `e2e/today-filters-features.spec.ts`; broaden to onboarding next.
- **FOUNDER-GATED — Remaining eat-out hero photos:** founder saves from
  Instagram → `public/eat-out/<venue-slug>.jpg` → one-line heroImage wiring
  (the disk test auto-verifies).
- Guided-cook coverage for flowless dishes — needs REAL recipe sources
  (rule 7: no invented recipes), so founder-supplied or sourced exports only.
- Done alongside: black-bean-brownie step photos re-mapped (45d0a75); the
  ingredient-meta grocery classifier de-bugged + tested (1e49abb).

## 7. Docs index

`STRATEGY.md` thesis + decision log · `ROADMAP.md` build log ·
`docs/SOUS-COMPREHENSIVE-YEAR-PLAN.md` forward plan ·
`docs/FOUNDER-UNLOCK-RUNBOOK.md` founder-gated keys ·
`docs/PRODUCTION-READINESS-PLAN.md` go-live ·
`docs/MOCKUP-POLISH-PLAN.md` (closed) ·
`docs/ONBOARDING-SURVEY-DESIGN-KIT.md` measured tokens + inventory for §6.2 ·
`docs/PET-AESTHETIC-OVERHAUL.md` (executed) ·
`docs/STAGE-3-LEAN-CONTENT.md` Content spec ·
`docs/INGREDIENT-NUTRITION-ARCHITECTURE-PLAN.md` registry design.
The remaining ~50 docs are point-in-time plans: on conflict, trust THIS file

- `ROADMAP.md` over any of them.
