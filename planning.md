# Sous — Guided Recipe Database Expansion: System Design & Planning

> **Last updated:** 2026-04-06
> **Related docs:** `CLAUDE.md` (conventions), `docs/Sous_whitepaper_PRD_v1.docx` (product vision)

## Executive Summary

Sous currently has guided cook steps for only **25 of 203 sides (12%)** and **4 of 76 meals (5%)**. Users clicking "Start cooking" on any uncovered recipe see "This recipe doesn't have guided cook steps yet" — a dead end that kills conversion. This document defines the system for researching, translating, storing, versioning, and scaling guided cook data to 100% coverage, plus a custom recipe system for user modifications.

---

## 1. Current State Audit

### Coverage Gap

| Category | Total | Has Guided Cook | Missing | Coverage |
|----------|-------|----------------|---------|----------|
| Sides | 203 | 25 | 178 | 12% |
| Meals | 76 | 4 | 72 | 5% |
| **Total** | **279** | **29** | **250** | **10%** |

### Sides WITH Guided Cook Steps (25)
aloo-gobi, arancini, baingan-bharta, bruschetta, caesar-salad, caprese-salad, edamame, elote, esquites, garlic-bread, guacamole, gyoza, karaage, lachha-paratha, mexican-rice, minestrone, miso-soup, onigiri, pico-de-gallo, raita, spring-rolls, tabbouleh, tomato-soup, tzatziki, skillet-cornbread

### Meals WITH Guided Cook Steps (4)
butter-chicken, fish-tacos, pad-thai, pizza-margherita

### Priority Targets (High-traffic meals without coverage)
tonkotsu-ramen, grilled-salmon, falafel-wrap, pasta-carbonara, sushi-platter, chicken-tikka-masala, bbq-ribs, bibimbap, beef-burger, chicken-shawarma, steak, chicken-katsu, pho-bo, lamb-chops, teriyaki-chicken

---

## 2. Recipe Research Pipeline

### 2.1 Source Selection Strategy

**Tier 1 — Gold Standard Sources** (always prefer):
- Serious Eats (Kenji Lopez-Alt, Stella Parks) — rigorous testing, explains *why*
- Cook's Illustrated / America's Test Kitchen — tested 30+ variations
- NYT Cooking — professional recipe development
- Bon Appetit — clear technique instruction

**Tier 2 — Reliable Community Sources**:
- AllRecipes (use 4.5+ star, 100+ reviews only)
- BBC Good Food
- RecipeTin Eats (Nagi)
- Budget Bytes
- Woks of Life (Chinese/Asian authority)
- Just One Cookbook (Japanese authority)

**Tier 3 — Cultural Authority Sources** (for authenticity):
- Maangchi (Korean)
- Hebbar's Kitchen (South Indian)
- Chinese Cooking Demystified (YouTube + written)
- Hot Thai Kitchen (Thai)
- Ottolenghi (Middle Eastern/Mediterranean)

### 2.2 Research Protocol Per Recipe

For each recipe that needs guided cook steps:

```
STEP 1: Identify 3-5 top-rated recipes from Tier 1-2 sources
  - Search: "[dish name] recipe site:seriouseats.com OR site:bonappetit.com"
  - Cross-reference with "[dish name] best recipe" general search
  - Check YouTube for visual technique references

STEP 2: Analyze commonalities across sources
  - Core ingredient list (what appears in ALL recipes)
  - Key technique steps (what every version does)
  - Points of divergence (where recipes disagree)
  - Common mistakes mentioned across sources

STEP 3: Synthesize into Sous format
  - Distill into 4-8 clear cook steps
  - Each step: one action, one outcome
  - Extract mistake warnings from recipe notes/comments
  - Extract quick hacks from "notes" sections
  - Derive doneness cues from technique descriptions
  - Add cuisine facts from cultural context

STEP 4: Validate
  - Steps are logically ordered
  - Ingredient list matches steps (nothing referenced that isn't listed)
  - Timer values are realistic
  - Skill level assessment is accurate
```

### 2.3 Translation Rules (Web Recipe -> Sous Format)

| Web Recipe Element | Sous Field | Translation Rule |
|---|---|---|
| Recipe title | `name` | Keep canonical name, add cuisine qualifier if ambiguous |
| "Ingredients" section | `ingredients[]` | Decompose into name + quantity + isOptional + substitution |
| Step paragraphs | `steps[]` | Split multi-action paragraphs into single-action steps |
| "Tips" / "Notes" | `quickHack` | Attach to most relevant step |
| "Don't do this" warnings | `mistakeWarning` | Attach to step where mistake would happen |
| "It should look like..." | `donenessCue` | Attach to step where visual check matters |
| Cultural background | `cuisineFact` | Add to most relevant step, keep under 2 sentences |
| Prep + Cook time | `prepTimeMinutes`, `cookTimeMinutes` | Use source values, cross-reference |
| "Optional" ingredients | `isOptional: true` | Mark and add substitution note |

---

## 3. Data Schema Design

### 3.1 Current Schema (What Exists)

```typescript
// cookSteps table (src/lib/db/schema.ts)
{
  id: uuid,
  sideDishId: uuid,        // FK to sideDishes
  phase: "mission" | "grab" | "cook" | "win",
  stepNumber: integer,
  instruction: text,
  timerSeconds: integer | null,
  mistakeWarning: text | null,
  quickHack: text | null,
  cuisineFact: text | null,
  donenessCue: text | null,
  imageUrl: text | null,
}

// ingredients table
{
  id: uuid,
  sideDishId: uuid,
  name: text,
  quantity: text,           // e.g., "1/3 cup shaved"
  isOptional: boolean,
  substitution: text | null,
}
```

### 3.2 Critical Appraisal of Current Schema

**Strengths:**
- `mistakeWarning`, `quickHack`, `cuisineFact`, `donenessCue` are *unique differentiators* — no other recipe app or format (Schema.org, Whisk, Mealie, Paprika, Mela) has these as first-class fields. This is what makes Sous feel like a cooking coach, not just a recipe viewer.
- `phase` enum maps directly to the quest flow (Mission -> Grab -> Cook -> Win). Unique to Sous.
- Separate `ingredients` table with `substitution` field is good relational design.

**Weaknesses identified:**
1. **No versioning** — if a recipe step is wrong, editing it loses history
2. **No source attribution** — we don't track where recipe data came from
3. **No user customization layer** — users can't modify steps or ingredients
4. **`quantity` is a plain string** — can't do serving multiplier math
5. **No step-to-ingredient references** — can't highlight which ingredients are used in which step
6. **No equipment/tools tracking** — "you need a wok" has nowhere to live
7. **Steps only attach to `sideDishes`** — meals (mains) need a separate FK or a polymorphic relation
8. **No `schemaVersion` field** — future migrations have no safety net

### 3.3 Proposed Schema Upgrades

**Priority 1 — Ship now (unblocks recipe expansion):**

```sql
-- Add source tracking to cook_steps
ALTER TABLE cook_steps ADD COLUMN source_url TEXT;
ALTER TABLE cook_steps ADD COLUMN source_name TEXT;

-- Add schema version for migration safety
ALTER TABLE side_dishes ADD COLUMN schema_version INTEGER DEFAULT 1;

-- Add meal cook steps support (reuse same table)
ALTER TABLE cook_steps ADD COLUMN meal_id UUID REFERENCES meals(id);
ALTER TABLE cook_steps ALTER COLUMN side_dish_id DROP NOT NULL;
-- Constraint: exactly one of side_dish_id OR meal_id must be set
```

**Priority 2 — Ship with user recipes:**

```sql
-- Recipe forks for user customization
CREATE TABLE user_recipe_forks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  -- Polymorphic: one of these is set
  side_dish_id UUID REFERENCES side_dishes(id),
  meal_id UUID REFERENCES meals(id),
  -- Delta storage
  ingredient_overrides JSONB DEFAULT '[]',
  step_overrides JSONB DEFAULT '[]',
  custom_notes TEXT,
  servings_multiplier REAL DEFAULT 1.0,
  status TEXT DEFAULT 'active', -- 'active' | 'archived'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Separate table for fully custom user recipes
CREATE TABLE user_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cuisine_family TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  skill_level TEXT DEFAULT 'beginner',
  hero_image_url TEXT,
  flavor_profile JSONB DEFAULT '[]',
  temperature TEXT DEFAULT 'hot',
  is_public BOOLEAN DEFAULT FALSE,
  schema_version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
-- User recipe steps and ingredients reuse cook_steps and ingredients tables
-- with user_recipe_id FK
```

**Priority 3 — Future polish:**

```typescript
// Structured ingredient quantities (for serving math)
interface StructuredQuantity {
  amount: number;        // 1.5
  unit: string;          // "cups"
  displayText: string;   // "1 1/2 cups" (original formatting)
}

// Step-to-ingredient references
interface StepIngredientRef {
  stepId: string;
  ingredientId: string;
}

// Equipment tracking
interface Equipment {
  id: string;
  name: string;          // "wok"
  isEssential: boolean;  // true = can't substitute
  alternative: string | null; // "large skillet"
}
```

### 3.4 Why NOT These Alternatives

| Alternative | Rejected Because |
|---|---|
| **Store everything in JSON blobs** | Loses query ability, can't index steps, breaks relational integrity |
| **Use Schema.org format directly** | Too generic — no fields for mistakeWarning, quickHack, donenessCue, timer |
| **Cooklang plain-text format** | Great for humans, terrible for programmatic access. Can't query "all steps with timers > 5 min" |
| **Full recipe copies for user mods** | Wastes storage, loses provenance, can't propagate upstream fixes |
| **Version every edit** | Over-engineering — recipes aren't documents. Fork + delta is simpler |

---

## 4. Static Data Layer (Immediate Solution)

While the database schema upgrades are designed, the **immediate priority** is populating the static data file (`src/data/guided-cook-steps.ts`) so users stop seeing "recipe not here yet."

### 4.1 Static Data Format

```typescript
// Each entry in guidedCookData or guidedCookMeals
{
  name: "Chicken Karaage",
  slug: "karaage",
  description: "Japanese-style fried chicken...",
  cuisineFamily: "japanese",
  prepTimeMinutes: 20,
  cookTimeMinutes: 15,
  skillLevel: "intermediate",
  heroImageUrl: "/food_images/karaage.png",
  flavorProfile: ["savory", "umami", "crispy"],
  temperature: "hot",
  ingredients: [
    { id: "k-1", name: "Chicken thighs", quantity: "500g", isOptional: false, substitution: null },
    // ...
  ],
  steps: [
    {
      phase: "cook",
      stepNumber: 1,
      instruction: "Cut chicken thighs into bite-sized pieces...",
      timerSeconds: null,
      mistakeWarning: "Don't cut pieces too large — they won't cook through evenly.",
      quickHack: null,
      cuisineFact: "Karaage means 'Chinese-style frying' — the technique came to Japan in the 1600s.",
      donenessCue: null,
      imageUrl: null,
    },
    // ...
  ],
}
```

### 4.2 Batch Population Strategy

**Phase A — Quick wins (Week 1): 30 most-searched meals**
Target the meals that appear most in `sidePool` arrays across meals.json.

**Phase B — Side coverage (Week 2-3): 100 most-paired sides**
Start with sides that appear in the most meal pairings.

**Phase C — Long tail (Week 4): Remaining 120 recipes**
Complete coverage of all sides and meals.

### 4.3 Quality Checklist Per Recipe

Before adding any recipe to the static data:

- [ ] 3+ sources consulted and cross-referenced
- [ ] Ingredients list matches steps (no orphaned ingredients)
- [ ] Each step is a single clear action
- [ ] At least 2 mistakeWarnings across all steps
- [ ] At least 2 quickHacks across all steps
- [ ] At least 1 cuisineFact
- [ ] At least 1 donenessCue
- [ ] Timer values validated against source recipes
- [ ] Skill level accurately reflects technique complexity
- [ ] Prep + cook time totals are realistic

---

## 5. User Custom Recipes System

### 5.1 Three Tiers of Customization

**Tier 1 — Inline Tweaks (no account required)**
- Stored in localStorage
- Ingredient substitutions made during Grab phase are remembered
- Step notes ("I added extra garlic") saved per cook session
- These are ephemeral — lost if cache clears

**Tier 2 — Recipe Forks (requires account)**
- User modifies an existing Sous recipe
- Fork stored as delta (only changed fields) against base recipe
- User sees their version by default, can "reset to original"
- If Sous updates the base recipe, user's delta is preserved

**Tier 3 — Custom Recipes (requires account)**
- User creates a recipe from scratch
- Full recipe with all Sous fields (ingredients, steps, tips, etc.)
- Can optionally be made public (community feature, Phase 5)
- Renders through the same Mission -> Grab -> Cook -> Win flow

### 5.2 Fork Data Model

```typescript
interface RecipeFork {
  id: string;
  userId: string;
  baseRecipeId: string;     // slug of original
  baseRecipeType: "side" | "meal";
  ingredientOverrides: Array<{
    originalId: string;
    action: "substitute" | "remove" | "modify" | "add";
    newName?: string;
    newQuantity?: string;
    userNote?: string;
  }>;
  stepOverrides: Array<{
    originalStepNumber: number;
    action: "modify" | "skip" | "add_after";
    newInstruction?: string;
    newTimerSeconds?: number;
    userNote?: string;
  }>;
  customNotes: string | null;
  servingsMultiplier: number;
  createdAt: Date;
  lastCookedAt: Date | null;
  cookCount: number;
}
```

### 5.3 Merge Strategy (Base Update + User Fork)

When Sous updates a base recipe (e.g., fixing a mistake):

1. Check if user's fork touches the same fields
2. If no conflict: apply base update, keep user's delta
3. If conflict: keep user's version, flag for review
4. User sees a subtle notification: "The original recipe was updated. Tap to see changes."

---

## 6. Critical Appraisal

### What This System Gets Right

1. **Delta-based forks** are the correct pattern. Full copies waste storage and lose provenance. Git-style version chains are over-engineered for recipes where users make 1-3 changes.

2. **Static data file as immediate solution** is pragmatic. Waiting for a perfect database migration before fixing the "recipe not here yet" error would delay user value by weeks.

3. **The Sous step schema is genuinely differentiated.** No other app stores `mistakeWarning`, `quickHack`, `cuisineFact`, and `donenessCue` as first-class fields. This is what transforms recipes from instruction lists into coaching experiences.

4. **Source attribution** is essential for legal protection and quality traceability.

### What Could Go Wrong

1. **Stale static data**: Recipes in `guided-cook-steps.ts` are frozen at build time. Bug fixes require a new deployment. Database migration (Priority 2) is the long-term fix.

2. **Recipe quality variance**: Rushed research produces worse steps than careful curation. The quality checklist in Section 4.3 is the mitigation.

3. **User forks at scale**: 10K users x 50 forks = 500K records. Delta model keeps storage small (~200 bytes per fork), but needs index on `(userId, baseRecipeId)`.

4. **Structured quantities deferred**: Serving multiplier math won't work until quantities are decomposed. Acceptable for v1 — most users cook for default serving size.

### What's Missing (Intentionally Deferred)

- **AI-generated steps**: CLAUDE.md rule #7 prohibits invented recipes. All steps must come from real sources.
- **Community recipe sharing**: Deferred to Phase 5 (Community tab).
- **Nutritional calculation**: Requires structured quantities (Priority 3).
- **Step images**: Requires stock photo sourcing or user contributions.
- **Video integration**: High value but high complexity.

---

## 7. Implementation Roadmap

### Immediate (This Sprint)
- [ ] Populate 10 high-priority meals with guided cook steps
- [ ] Populate 20 high-priority sides with guided cook steps
- [ ] Ensure "Start cooking" works for all recipe-of-the-day candidates

### Next Sprint
- [ ] Complete guided cook coverage for all 76 meals
- [ ] Complete guided cook coverage for top 100 sides
- [ ] Add database migration for `meal_id` on cook_steps table

### Sprint +2
- [ ] Complete 100% side coverage (remaining ~80 sides)
- [ ] Implement user recipe fork model (localStorage-first)
- [ ] Add fork UI in Grab/Cook phases ("Make it yours" button)

### Sprint +3
- [ ] Migrate forks to database (requires Clerk auth)
- [ ] Implement custom recipe creation flow
- [ ] Add source attribution display in Mission screen

---

## 8. Recipe Research Process (Step-by-Step for Contributors)

### How to Add a New Recipe

```
1. IDENTIFY the dish
   - Find its slug in sides.json or meals.json
   - Note its cuisine family, tags, and description

2. RESEARCH (15-20 min per recipe)
   - Search Tier 1 sources first (Serious Eats, ATK, NYT, BA)
   - Then Tier 2 (AllRecipes 4.5+, BBC, RecipeTin Eats)
   - Open top 3 results, read fully
   - Note consensus ingredients and technique

3. EXTRACT ingredients
   - List all ingredients that appear in 2+ sources
   - Mark optional ingredients (appear in only 1 source)
   - Find substitutions from recipe "Notes" sections
   - Format: { name, quantity, isOptional, substitution }

4. SYNTHESIZE steps (most important part)
   - Combine techniques from all sources into 4-8 clear steps
   - Each step = one action + one outcome
   - Write in second person: "Mince the garlic finely"
   - Add time context: "...for about 3 minutes"
   - Keep each step under 3 sentences

5. ENRICH with Sous metadata
   - mistakeWarning: What goes wrong? (from comments, "Tips" sections)
   - quickHack: Shortcuts? (from "Notes", speed variations)
   - cuisineFact: Cultural context? (from introductory text)
   - donenessCue: What does "done" look like? (from technique descriptions)
   - timerSeconds: Any timed steps? (from explicit timings in recipes)

6. VALIDATE
   - Read steps aloud — do they flow logically?
   - Cross-check: every ingredient is used in at least one step
   - Cross-check: no step references an unlisted ingredient
   - Verify total time = sum of step times + reasonable gaps

7. FORMAT and add to guided-cook-steps.ts
   - Follow existing entries as template
   - Run pnpm build to verify no TypeScript errors
   - Test in dev: navigate to /cook/[slug] and walk through all phases
```

---

## 10. iPhone & Mobile Optimisation

> **Applied:** 2026-04-06
> **Scope:** iOS Safari performance, touch interaction, viewport handling, animation performance

### 10.1 Changes Applied

| # | Optimisation | File | Impact |
|---|---|---|---|
| 1 | `touch-action: manipulation` on `html` | `globals.css` | Eliminates 300ms tap delay on iOS; prevents double-tap zoom |
| 2 | `-webkit-text-size-adjust: 100%` | `globals.css` | Prevents unwanted text inflation on iOS Safari |
| 3 | `-webkit-font-smoothing: antialiased` | `globals.css` | Crisper, thinner text rendering on iOS |
| 4 | `overscroll-behavior: none` on `body` | `globals.css` | Prevents body rubber-band for app-like feel |
| 5 | `font-size: 16px` on inputs | `globals.css` | Prevents iOS auto-zoom when focusing form fields |
| 6 | `-webkit-tap-highlight-color: transparent` | `globals.css` | Removes grey tap flash; replaced by Framer Motion whileTap |
| 7 | `overscroll-behavior: contain` on scroll containers | `globals.css` + `skill-tree.tsx` | Prevents scroll chaining in nested scroll areas |
| 8 | `safe-area-top` / `safe-area-bottom` utilities | `globals.css` | Proper notch and home indicator handling |

### 10.2 Animation Rules (GPU-Only)

**Only animate these properties on mobile** (compositor-friendly, no layout/paint):
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (blur, brightness)

**Never animate on mobile:**
- `width`, `height`, `top`, `left`, `margin`, `padding`
- `border-radius` changes, `box-shadow` changes
- Use `scale` transform instead of `width`/`height` when possible

**Framer Motion guidelines:**
- Use `whileTap` instead of `whileHover` on touch (hover does nothing on mobile)
- Limit `layout` prop animations to small components (never full-page)
- Use `useReducedMotion()` hook to respect OS accessibility settings
- Keep micro-interactions under 300ms total
- Spring animations: `stiffness: 300-400, damping: 20-30` for snappy, physical feel

### 10.3 Viewport & Safe Areas

- Viewport configured with `viewport-fit: cover` in `layout.tsx` (enables safe area insets)
- Using `min-h-dvh` (dynamic viewport height) — fixes iOS Safari 100vh bug
- Tab bar uses `safe-area-bottom` class for home indicator padding
- All scroll containers use `-webkit-overflow-scrolling: touch` (momentum scrolling)

### 10.4 Touch Targets

- Minimum tap target: 44×44px (Apple HIG) / 48×48px (Google)
- Skill tree nodes: 64×64px ✓
- Tab bar links: ~48px height ✓
- Cook flow step buttons: full-width ✓
- Search input: full-width, 16px font ✓

### 10.5 Remaining iOS Considerations

- [ ] `prefers-reduced-motion` — CSS rules exist in globals.css but Framer Motion components should use `useReducedMotion()` hook
- [ ] Limit `backdrop-filter: blur()` to max 2 visible elements at once (GPU memory)
- [ ] Test on actual iPhone hardware for scroll performance with large skill trees
- [ ] Consider `contain: layout style paint` on independently-animating sections

---

## 11. Bug Fixes Applied

### 11.1 Meal Cook Routing (Critical)

**Bug:** The cook page (`/cook/[slug]`) only checked `getStaticCookData()` (sides dictionary) for guided cook data. ALL meals — including butter-chicken, fish-tacos, bibimbap, etc. — would always show "This recipe doesn't have guided cook steps yet" even when data existed in `guidedCookMeals`.

**Root cause:** The tRPC `getSteps` endpoint and the client-side cuisine lookup in `cook/[slug]/page.tsx` only imported and used `getStaticCookData()`, never `getStaticMealCookData()`.

**Fix:** Added fallback: `getStaticCookData(slug) ?? getStaticMealCookData(slug)` in both locations.

**Files changed:** `src/lib/trpc/routers/cook.ts`, `src/app/cook/[slug]/page.tsx`

### 11.2 Recipe Coverage Update

After adding bibimbap, baba-ganoush, and chicken-adobo:

| Category | Total | Has Guided Cook | Coverage |
|----------|-------|----------------|----------|
| Sides | 203 | 28 (+3) | 14% |
| Meals | 76 | 6 (+2) | 8% |
| **Total** | **279** | **34** | **12%** |
