# App-wide friction audit (2026-06-17)

A 5-agent critical appraisal of every surface for friction / integration /
correctness, driving recursive refinement loops. Each item: problem · file ·
fix. Tick as shipped.

## Round 1 — SHIPPED (`8ecbbe9`, `93e9b38`)

- [x] **Cook auto-log lost user-recipe nutrition** — used raw `slug` not `draftSlug`; user cooks logged with zero nutrition. `cook/[slug]/page.tsx`.
- [x] **Per-slot macro line blank for cooked dishes** — `slotSummary` ignored seed nutrition; now resolves seed-first/coverage-gated like `aggregateDay`. `tracking-cards.tsx` (+ regression test).
- [x] **Diary serving stepper never auto-quieted** — added outside-tap close. `diary-entry-row.tsx`.
- [x] **log-food search went blank on no match** — added a "No matches" state. `log-food.tsx`.
- [x] **Rule 11: clinician bylines lacked a "sample" marker** — shared `SampleTag` on article/research/expert/article-detail bylines.
- [x] **E2 stragglers** — who's-at-table, Grab ingredient cards, /sides empty, craving dropdown → `--shadow-card`. E2 now complete.

## P0 — correctness — SHIPPED

- [x] **Swipe planner manufactures dead meals** (`0bac543`) — replaced `patternsToCandidates` (slugified pattern _names_, 0/16 resolved) with `catalogCandidates` (re-sources from `buildQuestDishes`, filtered to `hasGuidedCook`), extracted to a pure `src/lib/planner/plan-candidates.ts` + a 0/16 regression guard test. `minCoverage` 0.4→0 so the planner isn't pantry-gated. Verified: `/cook/<scheduled slug>` now renders the real Mission flow.
- [x] **Combined cook traps you on Back across dishes** (`6d41274`) — already fixed before this audit was actioned: `prevDish()` added to `use-cook-store.ts`, wired in `combined/page.tsx`, with a regression test.
- [x] **Combined cook: sides logged but un-undoable** (`b7e2f0c`) — kept per-dish entries (rollups need them); made Undo batch-aware via a shared `batchId` + `diaryRemoveBatch`. Verified in-browser: 3-dish cook → "3 dishes logged" → Undo takes the diary 3→0.

## P1 — real friction (next loops)

- [ ] **Plan never feeds the shopping list** — no path turns a planned week into groceries; the aggregator (`use-shopping-list.ts`) is built for it. Add "Shop this week" on `plan/week/page.tsx` (walk `slotMap` → ingredients → diff pantry → `addMany`).
- [x] **Swipe planner empty on first run** (`0bac543`) — closed alongside the P0 dead-meals fix: `minCoverage: 0` means the discovery planner is no longer coverage-gated, so a sparse/empty pantry still fills the pool (ranked by recency/rotation/ease).
- [ ] **Deck "Cook" on a main opens a side-picker, not cooking** — the verb lies (routes to `/sides`). Relabel main action to "Plan / Build plate", reserve "Cook" for the straight-to-`/cook` path. `quest-card.tsx`, `meal-swipe-queue-cards.tsx:165`.
- [ ] **Search-result logging is always ×1** — doesn't use `lastServingsFor` "usual" portion (the idle chips do). `log-food.tsx:221`.
- [ ] **Branded 100 g default shown as fact** — label "per 100 g" when the serving was the fallback. `branded-food.ts`, `log-food.tsx:341`.
- [ ] **Craving search shows the active filter but can't edit it** (clear-only) — make the chip open `QuestFilterMenu`. `text-prompt.tsx:272`.
- [ ] **Three orphaned Path subpages** (`/path/cuisines`, `/path/llm-spend`, `/path/charity-spend`) — add entry points or delete.

## P2 — polish / cohesion

- [ ] Extract one `<SettingToggle>` primitive (6 toggles drift: spring vs CSS, off-color, knob travel).
- [ ] Pantry manual-add writes no inventory (qty/kcal pill asymmetry vs AI import).
- [ ] Pantry Mode invisible from the Pantry page (add a status line/link).
- [ ] "Browse 18 meals" count is a meaningless cap (~281 dishes) — show remaining or drop the number.
- [ ] Stale Path loading skeleton depicts the old layout → layout-shift flash.
- [ ] Replace raw `window.confirm` (week/pantry/shopping clears) with the in-app toast-undo.
- [ ] Content "Watch" nav pill silently route-changes while siblings scroll.
- [ ] Two "Eat out" entry points with different interaction models.

## Confirmed excellent (do not regress)

Deck position persistence (`use-deck-progress`); seed-first nutrition + coverage
gating; cook completion idempotency + wall-clock timers; the shared diary store;
shopping-list aggregation; pantry→reco rerank; reduced-motion discipline; the
two-step vision→correction pipeline; Content fully on the Track-E premium system.
