# Casa — Native Migration Plan (Sous → Casa, go-native)

> **Status:** Proposal for review · **Author:** Claude (autonomous) · **Date:** 2026-06-27
> **Decision on file:** The founder chose **go native** — adopt the Casa React Native (Expo) shell
> as the product across iOS + Android + web, and port the real Sous engine, catalog, AI, and
> backend into it. This document is the technical plan to do that **without losing features**.
> **Out of scope (founder directive):** the Tama web game / Doge pet (deferred to a late, post-ship
> phase for **native** re-integration) and the arcade mini-games.
> **All five §12 product decisions are now resolved (founder, 2026-06-27) and binding — see §12.**
> Headline bindings: when in doubt **always adopt Casa**; **one codebase** (Expo/RN-Web on every
> platform, no separate Next.js frontend); **full rename incl. internal identifiers**; therapeutics
> ship **live for the clinician-approved subset**.

---

## 0. TL;DR

- The attached `casa.bundle` is a **complete, polished React-Native-Web app shell** (Expo SDK 56,
  RN 0.85, React 19, Archivo type, forest-green design system, **33 screens + 4 sheets**, a full
  data _model_) — but it is an **empty shell**: sample data, trivial logic, **no engine, no
  catalog, no AI, no auth, no backend, no persistence.**
- The existing **Sous** app is a mature **Next.js 15 web app** with the opposite profile: a real
  recommendation **engine**, the real **catalog** (~200 sides / ~76 meals + guided-cook steps),
  **AI** (craving parse, vision, coach), a live **Supabase** DB via tRPC/Drizzle, Clerk auth,
  push, and **70+ routes**.
- **The two halves fit together.** The plan is a **shared-core monorepo**: lift the Sous
  engine/intelligence/types/catalog (all pure TypeScript) into a `packages/core` consumed by
  **both** the new Casa Expo app **and** a slimmed Next.js backend. The Casa shell becomes the UI
  on all three platforms; Next.js demotes to a **headless API + marketing/SEO/gift/clinician web
  shell**.
- **Design risk is low.** Sous and Casa have already **converged**: same 4-tab IA
  (Today · Path · Nutrition · Content), same forest-green brand, same geometric-grotesque display
  type. Casa is the destination of the in-flight Sous aesthetic overhaul, now native.
- **The real work is the data/engine/backend port + 5 genuinely net-new screens** (the Culinary
  Therapeutics "clinician wedge": Therapy, Protocols, ProtocolDetail, Tonic, Vitality) **+ a
  handful of new screens for features Sous embeds rather than routes** (Coach, Discover, Reel,
  Lesson, Challenge, the 4 preference sheets).

### Founder-gated dependencies (surface these in parallel — CLAUDE.md rule 12)

These block specific phases but **not** the foundation. Everything else is AUTO-BUILD now.

| Dependency                                         | Needed for                         | Auto-buildable prep now                                                          |
| -------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------- |
| Apple Developer + Google Play accounts             | Phase 6 store ship                 | EAS config, bundle ids, store-listing copy, icons (shell already has them)       |
| Clerk **production** keys + RN SDK config          | Phase 5 real auth                  | `@clerk/clerk-expo` wiring behind a mock-user flag (mirrors current Sous bypass) |
| OpenAI / Anthropic API keys (prod budget)          | Phase 5 live AI                    | The AI client abstraction + **mock fallbacks** (Sous already has these)          |
| Real clinical / clinician content + partnerships   | Phase 4 Culinary Therapeutics data | The schema, adapters, sample-flagged seed data, env-var contract                 |
| Real editorial content (articles/research/experts) | Phase 3 Content magazine           | The UI + `isPlaceholder`/`(sample)` flags (Sous already does this)               |
| R2 / Upstash prod credentials                      | Phase 5 image upload + cache       | Storage/cache abstraction + signed-URL contract                                  |

---

## 1. What each codebase actually is

### 1.1 The Casa shell (the bundle) — UI/UX is DONE, brains are MISSING

| Layer                                          | State in the shell                                                                                                                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design system** (`src/theme/*`)              | ✅ Complete. Archivo 400–900, brand `#16341f`, macro triad (carb `#e0853c` / fat `#efb429` / protein `#d9544a`), radius ladder (chip 14 / media 16 / card 20 / hero 26 / pill 999), elevation tiers, 8-pt spacing. |
| **UI primitives** (`src/ui/*`)                 | ✅ `Txt`, `Icon` (react-native-svg), `Img` (registry resolver), `Screen`, `Fade`, `primitives` (Pill/Card/Ring/MacroBar/ArcGauge).                                                                                 |
| **Screens** (`src/screens/*`)                  | ✅ 33 screens + 4 bottom sheets, phone **and** laptop layouts, pixel-faithful to the prototype.                                                                                                                    |
| **Navigation** (`src/state/nav.ts`)            | ✅ 4 bottom tabs (Today · Path · Nutrition · Content), screen→tab map, chrome-visibility rules, laptop sidebar.                                                                                                    |
| **State** (`src/state/AppContext.tsx`)         | ⚠️ A single in-memory `useState` object + `patch` + ~50 named handlers. **No persistence.**                                                                                                                        |
| **Derived logic** (`src/state/selectors.ts`)   | ⚠️ Pure render-scope math (nutrition totals, recipe view, deck, plan). **No scoring/ranking/personalization.**                                                                                                     |
| **Data** (`src/data/*`)                        | ⚠️ Rich _types_ (`types.ts`) but **sample content**: **7 recipes**, a handful of tonics/protocols/content arrays.                                                                                                  |
| **Engine / AI / Auth / Backend / Persistence** | ❌ **Absent entirely.** No networking, no Zustand/TanStack, no Clerk, no AI SDK. `package.json` confirms it.                                                                                                       |

**The deck is the tell:** `deckSet()` just repeats `cookSuggestions` 48× with no ranking. In Sous,
the deck is `buildQuestDishes()` + the pairing engine + the taste flywheel + the household
aggregate. **That gap — sample arrays where Sous has intelligence — is the entire job.**

### 1.2 The Sous app — brains are DONE, UI is about to be replaced

- **Engine** (`src/lib/engine/`): pairing, scoring (cuisine-fit, flavor-contrast, kid-friendliness,
  household-heat…), cook-again, deck context-boost. Pure TS, deterministic, **unit-tested (4239
  tests)**.
- **Intelligence** (`src/lib/intelligence/`): the **taste flywheel** (signal-aggregator,
  preference-profile, dish-to-facets).
- **Catalog**: ~200 sides / ~76 meals, guided-cook steps, nutrition metadata, therapeutic-evidence
  tiers.
- **AI** (`src/lib/ai/`): craving parser (Claude, structured output), dish recognition (Vision),
  bounded coach — all with retry + **mock fallbacks**.
- **Backend**: tRPC router + Drizzle + **live Supabase**, Clerk (currently mock-bypassed), web
  push (VAPID), branded-food (USDA), R2/Upstash (abstractions).
- **70+ routes**, 4 tabs, the design tokens already moving to forest-green + geometric headings.

**Everything in `src/lib/**` that is pure TypeScript is portable verbatim.\*\* That is the leverage.

---

## 2. Target architecture — a shared-core monorepo

The cheapest, lowest-feature-loss way to go native is to **not rewrite the brains**. Reuse the
engine/intelligence/types/catalog in a shared package, run them **client-side in RN exactly as
they run client-side in Sous today**, and keep the server only for what genuinely needs a server
(secrets, DB, AI keys, SEO).

```
casa/  (pnpm + Turborepo monorepo)
├─ packages/
│  └─ core/                     ← pure TS, platform-agnostic — SHARED by both apps
│     ├─ engine/                ←  Sous src/lib/engine  (pairing, scoring, cook-again, household-heat…)
│     ├─ intelligence/          ←  Sous src/lib/intelligence  (flywheel, signal-aggregator, dish-to-facets)
│     ├─ types/                 ←  Sous src/types  (Zod schemas — single source of truth)
│     ├─ catalog/               ←  Sous sides.json / meals.json / guided-cook-steps
│     └─ adapters/              ←  NEW: sousCatalog → Casa Recipe/CookSuggestion/Tonic/Protocol…
├─ apps/
│  ├─ mobile/                   ←  the Casa Expo shell — THE PRODUCT UI (iOS + Android + web via RN-Web)
│  │     • imports @casa/core for all ranking/scoring/flywheel (runs on-device)
│  │     • calls @casa/api-client only for AI, DB sync, auth
│  └─ web/                      ←  existing Next.js, SLIMMED to a headless backend + web shell:
│        • tRPC API + AI proxy (keys stay server-side) + Drizzle/Supabase + push + branded-food
│        • landing / SEO / OG cards / gift deep-links / clinician portal (SSR-worthy pages)
└─ turbo.json, pnpm-workspace.yaml, tsconfig.base.json
```

**Data flow**

- **On-device (RN):** craving/household/flywheel → `@casa/core` engine → ranked deck & pairings.
  No round-trip; identical to Sous's current client-side ranking.
- **Server (Next.js):** AI calls (never ship API keys to the client), DB reads/writes (diary,
  profile, cook history), auth. The RN app calls these over tRPC/REST.
- **Persistence:** on-device via **AsyncStorage/MMKV** (mirrors Sous's localStorage hooks), synced
  to Supabase through the backend when authed (offline-first).

**Why this is the right call**

- Reuses the _actual product moat_ (engine + flywheel + catalog) with zero logic rewrite.
- Web doesn't regress: RN-Web renders the same shell on web; Next.js keeps the SSR-worthy
  surfaces (SEO, OG, gift links, clinician portal).
- Clean separation lets Phases run independently and keeps each shippable.

---

## 3. Design-system reconciliation (low risk — already converged)

| Token family | Casa (shell)              | Sous (today)              | Plan                                                                                                                                      |
| ------------ | ------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Brand green  | `#16341f`                 | `--nourish-green #1d4d37` | **DECIDED: Casa `#16341f`.** Casa `theme/colors.ts` is canonical; when any token conflicts, Casa wins (founder rule §12.1).               |
| Display type | **Archivo** 400–900       | Hanken Grotesk            | Adopt **Archivo** (shell already loads it via `@expo-google-fonts/archivo`); both are geometric grotesques, so headings read identically. |
| Body type    | Archivo                   | Inter                     | Archivo for both (shell convention) — one fewer font to ship.                                                                             |
| Macro triad  | carb/fat/protein defined  | carb/fat/protein defined  | Identical intent → map 1:1.                                                                                                               |
| Radius       | chip/media/card/hero/pill | sm/md/lg/pill             | Map: sm→chip, md→media, lg→card+hero, pill→pill.                                                                                          |
| Spacing      | 4/8/12/16/24/34           | 4…40 8-pt grid            | Same grid; reconcile the top step.                                                                                                        |
| Elevation    | rest/lift/float/chip      | shadow-card/raised/cta    | Map 1:1 (Casa's are RN-native shadow tiers).                                                                                              |

**Action:** `packages/core` carries **no** styling; `apps/mobile/theme` is the canonical token set
(the shell's `theme/*`). The Sous `--nourish-*` CSS vars are retired on the app surface (kept only
on the Next.js marketing/SEO pages). **The in-flight `AESTHETIC-OVERHAUL-PLAN.md` web reskin is
superseded for the app UI** — its conclusions (forest green, geometric headings) are already baked
into Casa, so nothing is lost.

---

## 4. Data & engine port (the heart of the work)

### 4.1 Catalog adapter

Build `packages/core/adapters/` mapping the Sous catalog → the Casa data model:

| Casa type (`src/data/types.ts`)                   | Source in Sous                                    | Notes                                                                                                                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Recipe` (groups/steps/nut/more/ask)              | `meals.json` / `sides.json` + `guided-cook-steps` | Map ingredient tuples `[qty,unit,name,note,pantryRef]`, steps, `nut` (kcal/c/f/p + DV groups).                                                                                                              |
| `CookSuggestion` (deck card)                      | output of `buildQuestDishes()`                    | The engine **produces** these — see 4.2.                                                                                                                                                                    |
| `ChefKit`                                         | meal-kit data (or defer)                          | Sample today; founder-gated for real fulfillment.                                                                                                                                                           |
| `DiaryMeal` / `QuickAddFood`                      | nutrition logging model                           | Map to Sous diary entries.                                                                                                                                                                                  |
| `PantryItem`                                      | pantry hooks                                      | Direct map.                                                                                                                                                                                                 |
| `TherapeuticGauge` / `RecipeSynergy` / provenance | therapeutic-evidence tiers (partial)              | **Gap:** Casa wants per-recipe bioactive gauges + synergies; Sous has evidence tiers but not full gauges → **sample-flag the gaps**, populate where data exists. _(Founder-gated for real clinical depth.)_ |
| `Protocol` / `Prescription` / `Tonic`             | **none in Sous**                                  | **Net-new clinical content** (Phase 4, founder-gated).                                                                                                                                                      |
| content/community/reel/lesson types               | Sous Content magazine                             | Map; real editorial founder-gated, keep `(sample)` flags.                                                                                                                                                   |

Replace the shell's **7 sample recipes** with the real catalog behind the adapter; the screens are
data-driven, so they light up unchanged.

### 4.2 Wire the engine into the state machine

- Add an **engine selector layer** to `apps/mobile/state/selectors.ts` (the shell already centralizes
  derived data there): `deckSet()` → call `@casa/core.buildQuestDishes(profile, history, pantry,
difficulty, context)` and map results to `CookSuggestion[]`.
- Feed real context the shell already models: `household` (who's-at-table → `AggregatedTable`),
  weather lean, saved slugs, daypart — Sous's `DeckContext` ports directly.
- `AppContext` handlers (`logCooked`, `cookedThis`, `advanceDeck`, swaps) fire **flywheel signals**
  (`recordSignal('cooked'|'logged'|'swipe-right'…)`) into `@casa/core.intelligence`, persisted via
  AsyncStorage. This is the **taste flywheel**, ported verbatim.
- `RecipeScreen`'s therapeutic strip/synergies/glance read from the adapter (real where present,
  sample-flagged where gated).

**Outcome:** the deck, Today, Recipe, Nutrition, Pairing all run on the **real engine + real
catalog + real personalization** — the shell's design with Sous's brain.

---

## 5. Screen-by-screen migration map (every Casa screen accounted for)

Legend — **Action:** `WIRE` (shell UI exists, attach real data/engine) · `REDESIGN` (consolidate
Sous behavior into the new shell screen) · `NET-NEW` (no real Sous equivalent) · `DEFER`.

| Casa screen                                       | Sous source                                              | Action                       | Real data / engine source                                                    |
| ------------------------------------------------- | -------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| **today**                                         | `/today`                                                 | WIRE                         | `buildQuestDishes` + flywheel + household + streak/plan/freshly-made         |
| **home / Discover**                               | discovery folded in Today/search                         | REDESIGN                     | browse home over catalog + collections                                       |
| **swipe** (marquee deck)                          | `meal-swipe-queue-cards`, planner deck                   | REDESIGN                     | engine deck (`CookSuggestion[]`)                                             |
| **recipe**                                        | `/cook/[slug]` Mission, `/path/recipes/[id]`             | WIRE                         | catalog + guided-cook-steps + therapeutic adapter                            |
| **cook**                                          | Guided Cook (Mission→Grab→Cook)                          | WIRE                         | steps, timers, serving/spice scaling                                         |
| **cook-complete**                                 | `win-screen`                                             | WIRE→NET-NEW(route)          | rating, XP, eco savings                                                      |
| **nutrition**                                     | `/nutrition` diary                                       | WIRE                         | diary, macro rings, weekly trend _(pet/Doge **DEFER** — Tamaweb)_            |
| **path**                                          | `/path`                                                  | WIRE                         | skill tree, journey, XP, achievements                                        |
| **library**                                       | `/path/recipes` + `/path/favorites` + `/community/saved` | REDESIGN (consolidate)       | My Recipes / saved / drafts via `libTab`                                     |
| **plan**                                          | `/path/plan/week`                                        | WIRE                         | planner + `seedPlan`                                                         |
| **groceries**                                     | `/path/shopping-list`                                    | WIRE                         | list from plan + pantry                                                      |
| **pantry**                                        | `/path/pantry` (+ `/scan`)                               | WIRE                         | pantry; barcode via `expo-camera` (sub-action)                               |
| **household**                                     | `/path/household`                                        | WIRE                         | `AggregatedTable` (who's-at-table)                                           |
| **create**                                        | `/path/recipes/new`                                      | WIRE                         | recipe authoring + AI import                                                 |
| **drafts**                                        | `/path/recipes` (draft filter)                           | WIRE                         | draft state                                                                  |
| **eco**                                           | `/path/eco`                                              | WIRE                         | seasonal swaps / food-miles _(some data founder-gated)_                      |
| **content**                                       | `/community` magazine                                    | WIRE                         | articles/research/experts/forum _(real editorial founder-gated, `(sample)`)_ |
| **lesson**                                        | skill-detail / academy                                   | NET-NEW (screen)             | lesson model                                                                 |
| **search**                                        | `/today/search` + `/api/search`                          | WIRE                         | semantic/keyword search                                                      |
| **community**                                     | `/community/pod` + leaderboard + forum                   | REDESIGN                     | pods/challenges _(real social founder-gated)_                                |
| **reel**                                          | `/community/reels`                                       | NET-NEW (full-screen player) | reels feed _(content founder-gated)_                                         |
| **challenge**                                     | `/community/leaderboard` + weekly-challenge              | NET-NEW (screen)             | challenge engine                                                             |
| **profile**                                       | `profile-settings-sheet`                                 | WIRE                         | parent mode, age band                                                        |
| **coach**                                         | bounded coach (Today/win triggers)                       | NET-NEW (screen)             | coach notes/adherence/swaps _(AI founder-gated)_                             |
| **therapy**                                       | — (evidence badges only)                                 | **NET-NEW**                  | Culinary Therapeutics hub _(data founder-gated)_                             |
| **protocols**                                     | —                                                        | **NET-NEW**                  | therapeutic protocol library _(clinical, founder-gated)_                     |
| **protocol-detail**                               | —                                                        | **NET-NEW**                  | protocol + adherence _(founder-gated)_                                       |
| **tonic**                                         | —                                                        | **NET-NEW**                  | functional-tonic recipes _(content founder-gated)_                           |
| **vitality**                                      | nutrition trends (partial)                               | **NET-NEW**                  | food↔energy correlations _(data founder-gated)_                              |
| **sheets:** Preferences/Include/Dietaries/Recipes | profile sheet + filter menus + household                 | REDESIGN (consolidate)       | preference capture                                                           |

**Deferred / stays on web (no feature lost — relocated):**

| Item                                                       | Disposition                                                                                                                                        |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Doge pet + Tama web game** (`/doge`, `public/tamaweb/`)  | **DEFER** (founder directive). An iframe game can't run in RN; native re-impl is a separate project. Keep the bridge/data; exclude from this plan. |
| **Arcade mini-games** (`/games/*`)                         | **DEFER**. Candidate to fold into Path/Lessons later.                                                                                              |
| **Eat-out** (`/eat-out`, Stanford demo)                    | **DEFER** (founder-gated demo). Keep the venue data + a stub screen + the env contract.                                                            |
| **Gift deep-links** (`/gift/[slug]`)                       | **Keep on Next.js web**; universal-link opens the app.                                                                                             |
| **Marketing/landing, clinician portal, admin, sitemap/OG** | **Stay on Next.js** (SSR-worthy / internal).                                                                                                       |

---

## 6. Net-new screens to build (the critical ask)

**Tier A — truly net-new (no real Sous feature; this is the Culinary Therapeutics "clinician
wedge" productized).** UI is AUTO-BUILD now against the schema. **Posture (founder rule §12.5):
clinician-approved content ships LIVE and un-flagged; only not-yet-approved content stays gated /
`(sample)`-flagged.** _(Phase-4 input needed: the list of what is currently clinician-approved.)_

1. **Therapy** — the Culinary Therapeutics hub: therapeutic cuisines / bioactives, entry to
   protocols + tonics.
2. **Protocols** — library of therapeutic protocols (e.g. anti-inflammatory): focus, duration,
   markers, pillars, outcomes, sample recipe.
3. **ProtocolDetail** — a single protocol with prescriptions + **adherence tracking**.
4. **Tonic** — functional-drink recipes (when/why-now, ingredients, steps).
5. **Vitality** — food↔energy/vitality **correlations** + an energy series.

**Tier B — new screen for a feature Sous _embeds_ rather than _routes_ (data exists; the screen is
new).** All AUTO-BUILD.

6. **Coach** — promotes Sous's bounded coach (Today/win triggers) into a screen: coach notes,
   adherence, one-tap **swaps**.
7. **Discover** — a browse/discovery home distinct from Today (Sous folds this into Today/search).
8. **Reel** — a full-screen TikTok-style player (Sous has a feed, not the immersive player).
9. **Lesson** — an academy lesson detail (Sous has skill-detail sheets only).
10. **Challenge** — a dedicated weekly-challenge screen (Sous has pod/leaderboard pieces).
11. **CookComplete** — the win moment as its own routed screen (Sous renders it inline).
12. **Preference sheets** (Preferences / Include / Dietaries / Recipes) — consolidate Sous's
    scattered profile-sheet + filter menus + household dietary capture into 4 clean sheets.

_(Swipe sits between REDESIGN and NET-NEW — the marquee tonight's-dinner deck is a richer
interaction than Sous's queue/planner decks.)_

---

## 7. Feature-preservation audit (nothing silently dropped)

Every Sous feature flagged "at risk" by the inventory, with an explicit decision:

| Sous feature                                       | Decision     | Where it lands in Casa                                        |
| -------------------------------------------------- | ------------ | ------------------------------------------------------------- |
| Favorites / Saved recipes                          | **PORT**     | `library` (a `libTab`)                                        |
| Scrapbook (cooked-meal photos)                     | **PORT**     | `library`/`profile` section + cook-complete capture           |
| Pantry barcode scan                                | **PORT**     | `pantry` sub-action (`expo-camera`)                           |
| Meal-health metrics/sheet                          | **PORT**     | `recipe` + `nutrition` detail                                 |
| Forum / Research / Experts                         | **PORT**     | `content` + `lesson` sub-views _(real content founder-gated)_ |
| Daily-novelty tie-breaker                          | **PORT**     | engine logic in `@casa/core` (deck)                           |
| Cook-for-two / duet, cook-again, repeat-cook chips | **PORT**     | `today` chips wired to engine                                 |
| Streak / XP / achievements                         | **PORT**     | `today` + `path`                                              |
| Eat-out (Stanford demo)                            | **DEFER**    | stub + data + env contract                                    |
| Doge pet + games                                   | **DEFER**    | excluded (Tamaweb directive)                                  |
| Gift deep-links                                    | **RELOCATE** | Next.js web + universal link                                  |
| Clinician portal / admin                           | **RELOCATE** | Next.js web (internal)                                        |

---

## 8. Infrastructure & platform swap (web → native)

| Concern             | Sous (web)                       | Casa (native)                                              | Gating                                            |
| ------------------- | -------------------------------- | ---------------------------------------------------------- | ------------------------------------------------- |
| Auth                | Clerk (mock-bypassed)            | `@clerk/clerk-expo` (mock flag first)                      | prod keys **founder-gated**                       |
| Persistence         | localStorage + Zustand           | **AsyncStorage/MMKV** + Zustand (RN), offline-first sync   | AUTO                                              |
| Server state        | TanStack + tRPC hooks            | tRPC client over HTTP to the Next.js API                   | AUTO (keys gated)                                 |
| AI                  | server routes (keys server-side) | **same backend**, RN calls endpoints — **never ship keys** | prod budget **founder-gated**; mock fallback AUTO |
| Push                | web push / VAPID                 | **`expo-notifications`**                                   | APNs/FCM setup **founder-gated**                  |
| Images              | `next/image` + R2                | **`expo-image`** + R2 signed URLs from backend             | R2 creds **founder-gated**                        |
| Camera/Vision       | web file input                   | **`expo-camera`** → upload → backend Vision proxy          | AUTO (AI gated)                                   |
| OCR (recipe import) | Tesseract.js (client)            | move OCR **to backend** (or defer)                         | AUTO                                              |
| Maps (eat-out)      | MapLibre GL                      | `@maplibre/maplibre-react-native` **or DEFER**             | tied to eat-out (deferred)                        |
| Deep links          | Next routes                      | React-Navigation/Expo linking (gift/share/universal)       | AUTO                                              |
| Build/ship          | Vercel                           | **EAS Build + Submit**; Next.js backend stays on Vercel    | store accounts **founder-gated**                  |

**Env-var contract** (define now so gated integrations are a one-config flip later):
`CASA_API_URL`, `CLERK_PUBLISHABLE_KEY`, `AI_PROXY_URL`, `R2_PUBLIC_BASE`, `SUPABASE_URL`,
`PUSH_PROJECT_ID` — each with a mock/no-op default.

---

## 9. Testing & CI

- **`packages/core`** keeps **Vitest** — the 4239 existing engine/intelligence tests port **as-is**
  (pure TS, no DOM). This is the regression spine; it must stay green through every phase.
- **`apps/mobile`** uses **jest-expo** + React Native Testing Library for component/selector tests.
- **E2E:** Playwright (web) → **Maestro** (preferred for Expo) for native flows.
- **CI:** Turborepo pipeline — `typecheck` + `core` Vitest on every commit; `mobile` jest +
  `expo export` smoke build per PR; EAS build on release tags.

---

## 10. Phased roadmap (each phase shippable; AUTO-BUILD first — rule 12)

| Phase | Title                                                                                                                                                                                                                                                     | Classification                                                                                 | Exit criterion                                                                  |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **0** | **Foundation** — monorepo, bring shell in, `packages/core` (engine/intelligence/types/catalog moved), Expo app boots on sample data, CI (typecheck + core Vitest), Archivo/theme canonical, **full Sous→Casa rename incl. internal `sous-*` identifiers** | **AUTO-BUILD**                                                                                 | `pnpm turbo typecheck test` green; `expo start` runs the shell; core tests pass |
| **1** | **Real catalog + engine** — catalog adapter, replace 7 samples with ~200 sides/~76 meals, wire `buildQuestDishes`+flywheel+household into the deck/Today/Recipe, AsyncStorage persistence                                                                 | **AUTO-BUILD**                                                                                 | deck + Today run on real engine + real catalog on device                        |
| **2** | **Core loop parity** — Guided Cook (Mission→Grab→Cook→Win), Nutrition diary + macros, Path progression, feature-preservation pass 1 (favorites/scrapbook/pantry/groceries/plan/household)                                                                 | **AUTO-BUILD**                                                                                 | a full craving→cook→log→progress loop works end-to-end offline                  |
| **3** | **Content + discovery** — Content magazine, Discover/Search/Reel/Lesson/Challenge/Community                                                                                                                                                               | **AUTO-BUILD** UI · _real editorial FOUNDER-GATED (sample-flagged)_                            | screens render real catalog + sample-flagged editorial                          |
| **4** | **Culinary Therapeutics** — Therapy/Protocols/ProtocolDetail/Tonic/Vitality/Coach against the therapeutic schema                                                                                                                                          | **AUTO-BUILD** UI + schema/adapter/seed · _real clinical content + partnerships FOUNDER-GATED_ | screens fully interactive on sample-flagged data; env contract ready            |
| **5** | **Backend integration** — point RN at the Next.js tRPC backend; Clerk-Expo auth; live AI endpoints; push; R2 upload                                                                                                                                       | _mostly **FOUNDER-GATED** on accounts/keys; abstractions + mocks **AUTO-BUILD** now_           | authed sync + live AI behind config flags                                       |
| **6** | **Ship pipeline** — EAS Build/Submit, TestFlight/Play, store listings; slim Next.js to backend + landing/SEO/gift/clinician                                                                                                                               | **FOUNDER-GATED** (store accounts)                                                             | TestFlight build in hand                                                        |
| **—** | **Deferred** — Doge/Tama web game, arcade mini-games, eat-out                                                                                                                                                                                             | out of scope                                                                                   | n/a                                                                             |

---

## 11. Risk register

| Risk                                               | Severity       | Mitigation                                                                                                                                                                    |
| -------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Re-platform scope** (it's a full native rebuild) | High           | Shared-core monorepo reuses the engine/flywheel/catalog/tests **verbatim**; only the view layer is new, and it's **already built** (the shell). Phased, each phase shippable. |
| **Feature loss**                                   | High           | The §7 audit assigns every feature an explicit port/defer/relocate; the §5 map accounts for every Casa screen.                                                                |
| **Adapter fidelity** (catalog shape mismatch)      | Med            | Type-checked adapters + golden tests in `core`; sample-flag fields Sous can't source (therapeutics).                                                                          |
| **Clinical content depth** (Therapy/Protocols)     | Med            | Build UI + schema now; gate real content; never present sample clinical data as real (`(sample)` flags, mirroring Sous's content discipline).                                 |
| **Web regression (SSR/SEO/gift)**                  | Med            | Keep Next.js for SSR-worthy surfaces; RN-Web covers the app surface.                                                                                                          |
| **AI keys on client**                              | High           | **Never** ship keys — all AI via the backend proxy; mock fallback on device.                                                                                                  |
| **Store review / accounts**                        | Med            | Founder-gated; surfaced up front so accounts are provisioned in parallel.                                                                                                     |
| **Doge/Tamaweb**                                   | Low (deferred) | Explicitly out of scope; bridge/data retained for a later native re-impl.                                                                                                     |

---

## 12. Resolved decisions (founder, 2026-06-27)

All five open decisions are now settled. These are **binding** for the build:

1. **Aesthetics/format → ALWAYS Casa.** When Sous and Casa differ on any look-or-format question,
   adopt Casa with no further deliberation. Concretely: brand green is Casa's **`#16341f`**, display
   type is **Archivo**, and Casa's token ladders / screen layouts are canonical. The Casa shell (and
   its `Clove.dc.html` design codex) is the single source of design truth.
2. **One codebase.** Use the single codebase Casa was built in — the Expo/RN app serves **all
   platforms including web** (via react-native-web). **No separate Next.js frontend for web.** Next.js
   survives only as the headless backend + SEO/landing/gift/clinician shell (and even those are
   candidates to fold in later).
3. **Doge → re-integrate, very late stage.** Not dropped — but explicitly a **late** phase, after the
   core product is shipped, and re-integrated **natively** (no Tama web iframe).
4. **Rename to full depth — including identifiers.** Go deep: user-facing strings **and** internal
   `sous-*` / `Sous` identifiers → `casa-*` / `Casa` (tokens, packages, hooks, env keys, file names).
   No half-rename.
5. **Therapeutics → keep clinician-approved content LIVE.** Do **not** hide the whole wedge behind a
   flag. Everything that has been **clinician-approved** ships **live and un-flagged**; only
   not-yet-approved content stays gated / `(sample)`-flagged. _(Input needed at Phase 4: the list of
   what is currently clinician-approved, or where approval status is recorded.)_

---

## 13. What I can start now (no gating)

**Phase 0 is fully auto-buildable today.** On approval I will: stand up the monorepo, move
`engine`/`intelligence`/`types`/`catalog` into `packages/core` (keeping the 4239 Vitest tests
green), bring the Casa shell in as `apps/mobile`, boot it on sample data, wire CI, and apply the
Sous→Casa rename — then proceed into Phase 1 (real catalog + engine on the deck). Everything from
Phase 0–4 UI is AUTO-BUILD; I will surface each FOUNDER-GATED item (accounts/keys/clinical content)
as it approaches so they can be provisioned in parallel rather than discovered mid-build.
