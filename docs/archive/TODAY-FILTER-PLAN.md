# Today Filter — comprehensive plan

> ✅ **SHIPPED 2026-06-07** — Phase A `2e09934` (data/classify) · Phase B `9acca7c`
> (state) · Phases C–E `fdb2cc1` (button + sheet + role-aware wiring + polish).
> Verified live: Main → Side switches the feed (main → side); Meal type hides for
> non-main roles; "Any cuisine" + active-count badge. typecheck · lint · 3299
> tests · build green.

> Replace the Today page's two filter pills ("Any time" + "Cuisine") with a
> single **Filter** entry that opens a modern, frictionless faceted sheet, and
> add two new facets — **Meal type** (breakfast/lunch/dinner) and **Dish role**
> (Main default → Side / Drink / Snack). Date: 2026-06-07.

---

## 0. TL;DR — what changes

- The **Cuisine** pill (and the **Any time** cook-time pill next to it) collapse
  into one **Filter** button (`Sliders`/`SlidersHorizontal` icon + active-count
  badge) on the Today quest header.
- Tapping it opens a **bottom sheet** with a faceted category list:
  - **Cuisine** — the existing 11 cuisines (+ Any).
  - **Meal type** — Breakfast / Lunch / Dinner (+ Any time).
  - **[Role]** — labelled by its CURRENT value (default **Main**); tap to swap to
    **Side / Drink / Snack**. Never labelled "Size".
  - **Cook time** — the existing cap (folded in; Any / 15 / 20 / 30 / 45 / 60).
- Frictionless: **instant apply** (no Apply button), segmented chips, an active
  filter count on the button, a **Reset** affordance, smooth sheet animation,
  honest options (a facet value with zero results is disabled, not shown).
- The **role facet rewires what Today surfaces**: Main → the meal queue (today's
  behaviour, meal + side pairing); Side/Drink/Snack → a single-dish quest of that
  role (same Mission→Grab→Cook→Win shell, rule 4).

---

## 1. Current state (verified)

- `quest-card.tsx` renders **two** `<FilterDropdown>`s: cook-time (`filters.cookTime`,
  pill "Any time", lines ~282) + cuisine (`filters.cuisine`, pill "Cuisine", ~301).
  ("Chef Tu" in the meal queue is a creator byline, **not** a filter — leave it.)
- `useQuestFilters` (`src/lib/hooks/use-quest-filters.ts`) holds `{ cookTime,
cuisine }` in **sessionStorage** (resets at app close — rule-3 compliant: a
  felt-sense query, not a settings page).
- `FilterDropdown<T>` (`src/components/shared/filter-dropdown.tsx`): `{ value,
label, pillLabel, options: {value,label,pillLabel}[], onChange }`. Reusable.
- Data: **meals.json** (95, 11 cuisines: American, Chinese, Filipino, Indian,
  Italian, Japanese, Korean, Mediterranean, Mexican, Thai, Vietnamese) — NO
  daypart. **sides.json** (219, `nutritionCategory` ∈ vegetable/carb/protein/dairy)
  — NO role. **`meal-plan.ts` already exports `mealKeyEnum =
["breakfast","lunch","dinner"]`** — reuse it as the daypart vocabulary.

---

## 2. UX design — modern & frictionless

**The entry.** A single pill-button on the quest header: `⫶⫶ Filter` with a small
count badge when ≥1 non-default facet is set (e.g. "Filter · 2"). Replaces the two
existing pills, freeing header space (rule 6).

**The sheet.** A bottom sheet (reuse the branded-food / detail-sheet pattern:
`role="dialog"` + `aria-modal` + Escape + tap-scrim-to-close + safe-area pad).
Sections top→bottom, each a labelled group of selectable chips:

1. **Dish role** (FIRST — it's the most consequential): a segmented row showing the
   four roles. The current value reads as the section's live state (default
   **Main**). Tapping a role selects it immediately. Icons: Main 🍽 / Side 🥗 /
   Drink 🥤 / Snack 🍪 (lucide `Utensils` / `Salad` / `CupSoda` / `Cookie`).
2. **Meal type**: Any time · Breakfast · Lunch · Dinner segmented chips. (Applies
   to Main; for Side/Drink/Snack it's de-emphasised — see §5.)
3. **Cuisine**: a wrap of 11 cuisine chips + "Any" (single-select). Honest: a
   cuisine with no dishes for the current role is disabled.
4. **Cook time**: Any · ≤15 · ≤20 · ≤30 · ≤45 · ≤60 segmented chips.

**Interaction:** every tap **applies instantly** and the meal queue behind the
sheet updates live (no Apply/Cancel). A subtle **Reset** text-button (only when a
non-default facet is set) clears to defaults. Closing is dismiss-only.

**Visual:** the existing design tokens, chip = the result-stack pill style
(rounded-full, selected = filled green, unselected = subtle). Rule 13: each chip
is a short label, no explanatory prose; selected state is the only affordance.
Rule 10: the sheet caps at `max-h-[80dvh]` with internal scroll; the Today CTA
stays reachable underneath.

---

## 3. Data layer — the new classification (honest, rule 7)

No invented dishes/images — we only **classify existing catalogue entries**.

**3a. Meal daypart (`meals.json`).** Add `dayparts: ("breakfast"|"lunch"|"dinner")[]`
to each meal — a SET, because most mains suit several (pizza = lunch+dinner). A
curated pass:

- Breakfast set is small + specific (champorado, congee/arroz-caldo, egg dishes,
  tofu-bhurji, idli-type, pancake/waffle if present).
- Lunch+dinner is the default for hearty mains; lighter bowls add lunch.
- Populate via `scripts/data/classify-dayparts.mjs` (a heuristic from name/tags +
  a hand-checked override map), printed for review — NOT silently guessed.

**3b. Dish role (`sides.json`).** Add `role: "side"|"drink"|"snack"` (default
"side"). Curated:

- **Drink** (~5–10): thai-iced-tea, vietnamese-coffee, chaas, lassi-type, etc.
- **Snack** (~20–30): papadum, sesame-balls, churros, spring/summer-rolls,
  crispy-wontons, gyoza, satay, bao-buns, egg-tart, turnip-cake, etc.
- **Side** = everything else. Mains (meals.json) are always role **main**.

**3c. Schema + types.** Extend the Zod schemas in `src/types/` (meal + side),
infer the TS types, keep fields **optional** for back-compat (default daypart =
`["lunch","dinner"]`, default role = `"side"`). A drift/validation test asserts
every entry parses and every role/daypart is in the enum.

---

## 4. State model

Extend `useQuestFilters`:

```ts
export type MealTypeFilter = "any" | "breakfast" | "lunch" | "dinner";
export type DishRoleFilter = "main" | "side" | "drink" | "snack";

interface QuestFilterState {
  cookTime: CookTimeFilter; // existing
  cuisine: CuisineFilter; // existing
  mealType: MealTypeFilter; // NEW, default "any"
  role: DishRoleFilter; // NEW, default "main"
}
```

Same sessionStorage persistence + back-compat load (missing keys → defaults).
Add `activeFilterCount` (non-default facets) + `reset()`.

---

## 5. Wiring — how filters drive Today

- **role = main** (default): unchanged. The meal queue draws from `baseDishes`
  (meals), filtered by cuisine + cook-time + **dayparts ∋ mealType**. Cooking a
  meal still offers the side pairing (result-stack).
- **role ∈ {side, drink, snack}**: the meal queue draws from `sides.json` filtered
  by `role`, cuisine, cook-time. The user picks one → the **same quest shell**
  cooks that single dish (no further side pairing). Meal type is de-emphasised
  (sides aren't daypart-bound) — either ignored or a soft sort, decided in R1.
- The cuisine option list is rebuilt **per active role** so it never offers a
  cuisine with zero dishes for that role (the existing "honest options" pattern).
- Empty-state guard (existing): if a filter combo yields nothing, fall back to the
  unfiltered feed for that role rather than show an empty Today.

---

## 6. Files (component tree)

```
src/components/today/
  quest-filter-button.tsx     NEW — the "Filter · N" entry pill
  quest-filter-sheet.tsx      NEW — the bottom sheet (role/mealType/cuisine/cookTime)
  quest-card.tsx              EDIT — swap the two FilterDropdowns for the button+sheet;
                                     branch the queue source on role
src/lib/hooks/use-quest-filters.ts   EDIT — add mealType + role + count + reset
src/types/meal.ts / side.ts          EDIT — dayparts / role (optional, enum-validated)
src/data/meals.json, sides.json      EDIT — populated classification
scripts/data/classify-dayparts.mjs   NEW — review-printed daypart/role population
src/lib/today/quest-pool.ts (or quest-card memo)  EDIT — role-aware feed selection
```

---

## 7. Rules compliance

- **Rule 3** (no settings page): the Filter is a transient, session-scoped query —
  not persisted preferences, not a settings screen. Compliant (matches the
  existing useQuestFilters framing).
- **Rule 4** (quest shell): Side/Drink/Snack quests render through the SAME
  Mission→Grab→Cook→Win shell. No new flow.
- **Rule 6/13** (minimal text, disclosure-on-demand): one Filter button instead of
  two pills; the sheet uses chips, not prose; the role reads as its value, not a
  "Size" label.
- **Rule 10** (no-scroll): the Today CTA stays above the fold; the sheet scrolls
  internally, capped at 80dvh.
- **Rule 11** (don't revert current features): the Friends strip, coach quiz,
  cuisine-mastery, etc. are untouched; this only restructures the filter row.

---

## 8. Build sequence — each phase with 3-round review + unit tests

Every phase runs the standard loop (build+self-review → adversarial → polish →
tests), per the W-plan Part 6 protocol.

**Phase A — Data + schema (daypart + role).**

- _R1:_ extend the Zod schemas (optional, enum); write + run the classify script;
  hand-check the printed daypart/role map; populate the JSON.
- _R2 (adversarial):_ scan for mis-classifications (a dessert tagged "side" that's
  really a snack; a daypart that's wrong); verify no dish lost a field; confirm
  back-compat (old entries still parse).
- _R3:_ consistency — every role/daypart in the enum; defaults applied.
- _Tests:_ schema parses all 95 meals + 219 sides; every `role` ∈ enum, every
  `daypart` ∈ enum; counts (drinks ≥ 5, snacks ≥ 20) sane; a back-compat fixture
  (entry with no field → defaults).

**Phase B — State (`useQuestFilters`).**

- _R1:_ add mealType + role + activeFilterCount + reset; back-compat load.
- _R2:_ corrupt/partial sessionStorage → defaults; SSR guard; count correctness
  across every default/non-default combination.
- _R3:_ types exported + named consistently.
- _Tests:_ default state; load with missing keys → defaults; activeFilterCount for
  each combination; reset → all defaults; round-trips through sessionStorage.

**Phase C — Filter button + sheet UI.**

- _R1:_ build `quest-filter-button` + `quest-filter-sheet`; instant-apply; honest
  options; Reset; the role-labelled-by-value control.
- _R2:_ a11y attack (dialog/aria-modal/Escape/focus/keyboard reach of every chip);
  the disabled-zero-result option path; rapid toggling; rule-10 no-scroll at
  375×667; rule-13 (no stray labels/prose).
- _R3:_ visual-token + spacing consistency with the result-stack pills; reduced-
  motion gate on the sheet; active-count badge polish.
- _Tests:_ button shows the count; opening renders the four facets; selecting a
  chip calls the right setter; Reset clears; a cuisine with zero role-dishes is
  disabled. (RTL component tests.)

**Phase D — Wiring (role-aware feed).**

- _R1:_ branch the queue source on role (meals vs sides-by-role); apply cuisine +
  cook-time + daypart; keep the empty-state fallback.
- _R2:_ every role × cuisine × mealType combo yields a non-empty, correct feed (or
  the honest fallback); Main still pairs sides; Side/Drink/Snack cooks standalone;
  no regression to the craving flow.
- _R3:_ transition polish when role changes (the queue re-animates, not janks);
  reduced-motion.
- _Tests:_ feed selection by role returns only that role; cuisine filter excludes
  others; daypart filter on mains; empty combo → fallback feed; a Side quest
  reaches the cook shell.

**Phase E — End-to-end + regression.**

- Full gate (typecheck · lint · all tests · build); **live preview** walk: open
  Filter → switch role to Side → see sides → cook one; switch cuisine + meal type;
  Reset. Commit per phase.

---

## 9. Open decisions (resolve in R1 of the relevant phase)

1. **Does meal type apply to non-main roles?** Recommend: applies to Main; for
   Side/Drink/Snack it's hidden or a soft sort (sides aren't daypart-bound).
2. **Multi-select cuisine?** Recommend single-select (simpler, matches today).
3. **Does the role filter persist across app close** like the others? Yes (session-
   scoped) — but consider resetting role→Main on a fresh craving so the default
   experience is always "a meal".
4. **Snack/Drink side-pairing:** none (cook the single dish). Confirm with founder.

---

## 10. Estimated shape

~2 new components, 1 hook edit, 2 schema/data edits, 1 classify script, 1 wiring
edit — **all AUTO-BUILD** (no founder gate; the classification is curated from the
existing catalogue, no invented data). Phases A→E are independently committable.
