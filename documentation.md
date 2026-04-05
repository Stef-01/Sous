# Sous — System Documentation

> **Audience:** Developers and AI agents. **Purpose:** Describe how everything that's been built works, where code lives, and what state each system is in. For forward planning, see **`planning.md`**. For pairing data pipeline, see **`PIPELINE.md`**.

---

## 1. Product overview

Sous is a cooking fluency platform. Users type a craving or photograph a dish and receive intelligently paired side dishes with step-by-step guided cooking. The product philosophy is radical simplicity: one screen, one action, one win. Think Duolingo for cooking confidence.

**Core loop:** Craving input -> Side dish pairing -> Optional evaluate -> Guided Cook -> Win

---

## 2. What's built and working

### 2.1 Today page (core experience) — COMPLETE

The Today page is the home screen and primary user surface. It contains:

| Component | File | Status |
|-----------|------|--------|
| Header (Sous logo + streak + bird avatar) | `src/app/(today)/page.tsx` | Working |
| Bird mascot with "I'm craving..." trigger | `src/components/today/bird-mascot.tsx` | Working |
| Quest card stack (swipeable Tinder-style) | `src/components/today/quest-card.tsx` | Working |
| Search popout (bottom sheet) | `src/components/today/search-popout.tsx` | Working |
| Text prompt (craving input) | `src/components/today/text-prompt.tsx` | Working |
| Camera input (photo capture) | `src/components/today/camera-input.tsx` | Working |
| Correction chips (photo → confirm) | `src/components/today/correction-chips.tsx` | Working |
| Result stack (3 side dish cards) | `src/components/today/result-stack.tsx` | Working |
| Fallback actions (rescue fridge, game, order out) | `src/components/today/fallback-actions.tsx` | Working |
| Friends strip (social proof) | `src/components/today/friends-strip.tsx` | Working (mock data) |
| Streak counter | `src/components/today/streak-counter.tsx` | Working |

**State machine:** The Today page manages view states: `idle` → `loading` → `results` | `camera` → `recognition` → `correction`. See `src/app/(today)/page.tsx` lines 19-25.

**Layout:** DeviceFrame wraps the app in a 390x844 phone mockup with `transform: translateZ(0)` to scope `position: fixed` elements. See `src/components/shared/device-frame.tsx`.

### 2.2 Quest card system — COMPLETE

5 curated dishes rotate as a swipeable card stack with drag interaction.

- Swipe right = "Cook this" → navigates to guided cook
- Swipe left = skip → next card
- X button dismisses, heart saves for later
- Stack shows 3 cards deep with scale/translate stacking
- COOK! and SKIP overlays appear during drag

File: `src/components/today/quest-card.tsx`

### 2.3 Pairing engine — COMPLETE

Two-tier pairing system:

**Tier 1: Engine-scored** (14 Indian mains × 66 sides = 924 pairings)
- Pre-computed by Python engine (`~/Documents/New project/pairing_system.py`)
- Additive heuristic scoring across 6 dimensions: plate structure, evidence priors, note-hit bonuses, flavor-note relations, secondary balance, clamping
- Tiers: excellent (≥85), strong (≥70), good (≥55), experimental (≥40), low (<40)
- Stored in `src/data/pairings.json`, adapted by `src/data/pairings.ts`

**Tier 2: Deterministic scoring engine** (all mains)
- 6 scorer modules in `src/lib/engine/scorers/`
  - `cuisine-fit.ts` — cuisine compatibility matrix
  - `flavor-contrast.ts` — flavor profile complementarity
  - `nutrition-balance.ts` — protein/carb/veg distribution
  - `prep-burden.ts` — combined prep time feasibility
  - `temperature.ts` — hot/cold contrast scoring
  - `preference.ts` — user preference vector dot product
- Weighted aggregation in `src/lib/engine/ranker.ts`
- Plain-language explanations in `src/lib/engine/explainer.ts`
- Orchestrated by `src/lib/engine/pairing-engine.ts`
- Has unit tests: `src/lib/engine/pairing-engine.test.ts`

**Legacy tier:** `src/lib/pairingEngine.ts` handles curated `sidePool` fallback with Fisher-Yates shuffle.

### 2.4 AI integration — COMPLETE

| Feature | Provider | File | Status |
|---------|----------|------|--------|
| Food photo recognition | OpenAI Vision (gpt-4o) | `src/lib/ai/food-recognition.ts` | Working |
| Craving text parsing | Anthropic Claude | `src/lib/ai/craving-parser.ts` | Working |
| Coach persona | Anthropic Claude | `src/lib/ai/coach.ts` | Stubbed |

Recognition pipeline: photo → Vision API → structured output (dishName, confidence, cuisine, alternates) → correction chips if confidence < 0.7 → confirmed dish feeds pairing engine.

Craving parser: freeform text → Claude structured output → CravingIntent (dishName, cuisineSignals, effortTolerance, healthOrientation, moodSignals).

### 2.5 Guided Cook flow — COMPLETE

Four-phase cooking experience at `/cook/[slug]`:

1. **Mission** — Dish overview, what you'll learn, hero image
2. **Grab** — Ingredient checklist with quantities and substitutions
3. **Cook** — One step per screen with expandable chips:
   - Timer chip (countdown with controls)
   - Mistake chip (warning expandable)
   - Hack chip (shortcut expandable)
   - Fact chip (cuisine context expandable)
   - Doneness cues
4. **Win** — Completion celebration, save/photo/note/rating

Components in `src/components/guided-cook/`:
- `mission-screen.tsx`, `ingredient-list.tsx`, `step-card.tsx`
- `cook-timer.tsx`, `timer-chip.tsx`, `phase-indicator.tsx`
- `mistake-chip.tsx`, `hack-chip.tsx`, `fact-chip.tsx`
- `win-screen.tsx`

State: `useCookStore` (Zustand) manages session, phase, step index, timer. See `src/lib/hooks/use-cook-store.ts`.

Cook data: `src/data/guided-cook-steps.ts` provides static recipe data. tRPC `cook.getSteps` serves it via `src/lib/trpc/routers/cook.ts`.

### 2.6 Search and discovery — COMPLETE

- Fuzzy search via Fuse.js against 93 meals (`src/lib/fuzzySearch.ts`)
- Typeahead dropdown with cuisine badges (`src/components/search/SearchDropdown.tsx`)
- Suggestion chips for quick-starts (`src/components/search/SuggestionChips.tsx`)
- NOURISH Verified toggle filters to curated subset

### 2.7 Results display — COMPLETE

Desktop and mobile layouts for pairing results:

- `ResultsStage.tsx` — Layout orchestrator (grid on desktop, stacked on mobile)
- `HeroDish.tsx` — Main dish hero card
- `SideDishCard.tsx` / `SideDishCardMobile.tsx` — Side dish cards with tier badges and reasons
- `HoverCard.tsx` — Quick-glance info on desktop hover
- `DishDetailModal.tsx` — Full detail modal
- `BalanceIndicator.tsx` — Protein/carb/veg balance dots
- `InlinePlate.tsx` / `PlateMethodModal.tsx` — ADA plate visualization
- `SharePlateModal.tsx` — PNG export and native share
- `RerollButton.tsx` — Reroll and swap controls

### 2.8 Evaluate mode (ADA Plate Method) — COMPLETE

Pre-cook plate evaluation:
- Plate visualization with 3 sections (50% veg, 25% protein, 25% carbs)
- Confidence-first appraisal sentence (5-8 words)
- Food images populate plate sections
- Balance indicator with ✓/✗ markers
- Zero-guilt language, never preachy

File: `src/lib/plateAppraisal.ts` for scoring, plate UI in `results/` components.

### 2.9 Save and share — COMPLETE

- localStorage-based saved pairings (`src/hooks/useSavedPairings.ts`)
- Max 20 saved pairings with auto-eviction
- Saved pairings modal for browsing (`src/components/layout/SavedPairingsModal.tsx`)
- High-quality PNG plate export via `html-to-image`
- Native share API with clipboard fallback

### 2.10 Heatmap visualizer — COMPLETE

Interactive matrix (35+ mains × 148+ sides) showing compatibility scores:
- HSL color coding (red-to-green for engine-scored, blue for curated)
- Focus main dropdown, side filter, minimum score controls
- Ranked side panel below matrix
- Accessible from About modal
- Files: `src/components/heatmap/HeatmapModal.tsx`, `src/data/pairings.ts` (`getHeatmapData()`)

### 2.11 Infrastructure — COMPLETE

| System | Technology | File(s) | Status |
|--------|-----------|---------|--------|
| tRPC API | tRPC v11 + TanStack Query | `src/lib/trpc/` | Working (pairing, recognition, cook endpoints) |
| Database schema | Drizzle ORM + Neon Postgres | `src/lib/db/schema.ts` | Defined, 7 tables |
| Auth | Clerk | `src/components/auth-provider.tsx`, `src/middleware.ts` | Integrated |
| State management | Zustand | `src/lib/hooks/use-today-store.ts`, `use-cook-store.ts` | Working |
| UI primitives | shadcn/ui + Tailwind 4 | `src/components/ui/` | Working |
| Animations | Framer Motion 12 | Throughout, `src/lib/motion.ts` | Working |
| Phone frame | Custom DeviceFrame | `src/components/shared/device-frame.tsx` | Working |
| Tab bar | Progressive visibility | `src/components/shared/tab-bar.tsx` | Working |
| Analytics | Vercel Analytics | `src/lib/analytics.ts` | Integrated |

---

## 3. Data inventory

| File | Records | Description |
|------|---------|-------------|
| `src/data/meals.json` | 93 meals | Main dishes across 11 cuisines |
| `src/data/sides.json` | 203 sides | Side dishes with images, tags, nutrition |
| `src/data/pairings.json` | 924 scored pairs | Engine-scored Indian mains × sides |
| `src/data/guided-cook-steps.ts` | Variable | Static cook step data per recipe |
| `src/data/sideBridge.ts` | 9 explicit + auto | Python engine → app ID mapping |

See `data-structure.md` for detailed schema documentation.

---

## 4. tRPC router status

| Endpoint | Implementation | Notes |
|----------|---------------|-------|
| `pairing.suggest` | FULL | Parses craving, runs engine, returns top 3 |
| `pairing.explain` | FULL | Detailed "why this won" explanation |
| `recognition.identify` | FULL | OpenAI Vision → recognition result |
| `cook.getSteps` | FULL | Returns complete phase/step data for a dish |
| `cook.start` | STUB | Creates cook session (needs DB seeding) |
| `cook.complete` | STUB | Marks session complete, updates stats |
| `journey.recent` | STUB | Last 20 completed sessions |
| `journey.stats` | STUB | Cooking frequency, diversity, streak |
| `coach.quiz` | STUB | This-or-that preference quiz |
| `coach.vibePrompt` | STUB | Daily mood/energy prompt |
| `content.getSideDish` | STUB | Full side dish with steps/ingredients |
| `content.search` | STUB | Filtered side dish search |

---

## 5. NOURISH prototype features (historical)

The following features were completed in the original NOURISH Meal Pairer prototype, before the rebrand to Sous:

| Phase | Feature | Status |
|-------|---------|--------|
| 1A | Kill idle animations | Done |
| 1B | Surface pairing rationale | Done |
| 2A-D | CTA color, serif typography, logo, spawn glow | Done |
| 3A-D | Remove 3D parallax, pool exhaustion, smart shimmer, detail modal | Done |
| 4A-C | Exit animation polish, mobile stacked layout, scroll-triggered results | Done |
| 5A-B | Typeahead search preview, contextual hover cards | Done |
| 6A-B | Save/share pairings, nutritional balance indicator | Done |
| 7A-D | Import pairing data, ranked engine, side bridging, reason display | Done |
| 8A-D | Heatmap data layer, component, entry point, score colors | Done |
| 9A-C | Verified data schema, toggle UI, badges on cards | Done |

---

## 6. Sous rebrand features (current)

| Feature | Status |
|---------|--------|
| App rebrand to Sous (metadata, UI, storage keys, package name) | Done |
| Side dish hover zoom (Framer Motion whileHover) | Done |
| Today page with visual design polish | Done |
| DeviceFrame phone mockup with scrollbar hiding | Done |
| Quest card swipe system | Done |
| Bird mascot + speech bubble craving trigger | Done |
| Search popout bottom sheet | Done |
| Friends strip social proof | Done |
| Fallback actions row (rescue fridge, play game, order out) | Done |
| Tab bar with progressive visibility | Done |
| Micro-refinement: button alignment, badge overflow, spacing rhythm | Done |

---

## 7. Architecture decisions

### Why `transform: translateZ(0)` on DeviceFrame
Creates a containing block for `position: fixed` elements (tab bar, search popout) so they render inside the phone frame instead of relative to the browser viewport. The inner div handles scrolling while fixed elements stay pinned.

### Why two pairing systems
The Python engine provides high-quality scored pairings for 14 Indian mains (clinical origin from the NOURISH diabetes tool). The TypeScript engine (`src/lib/engine/`) scores all mains using a 6-dimension weighted model. Both are deterministic — no randomness in ranking.

### Why static JSON for cook data
V1 cook steps live in `src/data/guided-cook-steps.ts` as typed objects. The Drizzle schema (`cook_steps` table) is defined but not seeded yet. This allows development without a running database.

### Why Zustand over Context
Minimal boilerplate for UI state (input mode, camera state, cook session). Two stores: `useTodayStore` for the Today page state machine, `useCookStore` for the guided cook flow. Both are lightweight and co-located in `src/lib/hooks/`.
