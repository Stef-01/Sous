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

- [x] **Plan never feeds the shopping list** (`9882cc1`) — "Shop this week" on `plan/week/page.tsx` walks `slotMap` → resolves ingredients → diffs pantry → `addMany` with recipe provenance; button → "{n} added — view shopping list". Verified: a Hiyayakko week → 7 items on `/path/shopping-list`.
- [x] **Swipe planner empty on first run** (`0bac543`) — closed alongside the P0 dead-meals fix: `minCoverage: 0` means the discovery planner is no longer coverage-gated, so a sparse/empty pantry still fills the pool (ranked by recency/rotation/ease).
- [x] **Deck "Cook" on a main opens a side-picker, not cooking** (`649cf33`) — shared `primaryActionLabel`/`goesStraightToCook` helpers: mains read "Build plate" (→ /sides), guided sides keep "Cook" (→ /cook), eat-out "Log it". Label can't drift from the route; 7 unit tests pin it.
- [x] **Search-result logging is always ×1** (`19a7a86`) — search rows now log `lastServingsFor(diaryStore, slug)` like the idle chips. Verified: a dish previously logged ×2 re-logs ×2.
- [x] **Branded 100 g default shown as fact** (`19a7a86`) — `parseServingGrams` reports the fallback; `BrandedFood.servingIsFallback` threads through `mapOffProduct`; the kcal label reads "NNN kcal / 100 g" only when the serving was the 100 g guess.
- [x] **Craving search shows the active filter but can't edit it** (`c98892f`) — the clear-only chip is now the editable `QuestFilterMenu` (adjust cuisine/cook-time/role, or Reset). Verified in-browser + 4 filter e2e pass on chromium.
- [x] **Three orphaned Path subpages** — DELETED per founder decision (keep libs). Removed the 3 page files (`/path/cuisines`, `/path/llm-spend`, `/path/charity-spend`) + the `/path/cuisines` e2e route-array entry + its DESIGN-SYSTEM "Live" row. The underlying libs (`cuisine-stats`, `llm-spend`, `charity`, `made-it-ring`) stay — a founder re-wires them behind real auth in one file later (rule 12). cuisines was skill-tree-redundant (rule 11); the two dashboards were internal founder surfaces (rule 3) with no entry point.

## P2 — polish / cohesion

- [x] Extract one `<SettingToggle>` primitive (`85a6065`) — all 6 toggles now share one canonical switch (48×28 / 24px knob, CSS-transform, reduced-motion-free).
- [x] **Pantry manual-add qty/kcal pill (`0de293b`)** — LEVELLED UP per founder decision: the manual add takes an optional quantity (e.g. "2 kg"); manual items now show the same qty/kcal pill as AI-imported. kcal is computed HONESTLY from the registry per-100g density for mass/volume units (omitted otherwise — never fabricated, per the nutrition-integrity rule). Verified: "Rice noodles" + "2 kg" → "2 kg · 7280 kcal".
- [x] Pantry Mode invisible from the Pantry page (`952f094`) — tappable status line on the pantry page.
- [x] "Browse N meals" meaningless cap (`952f094`) — dropped the number → "Browse meals".
- [x] Stale Path loading skeleton (`9ed53d7`) — rewritten to trace the current collapsed layout.
- [x] Replace raw `window.confirm` with in-app toast-undo (`4542f56`) — week/pantry/shopping, all with restore.
- [x] Content "Watch" nav pill route-change (`9ed53d7`) — now scrolls to the rail like its siblings; reels feed still reachable.
- [x] **Two "Eat out" entry points** — KEPT BOTH per founder decision (intentional, not friction): the Today-deck swipe-to-log tab + the `/eat-out` browse page are deliberate parallel models. No change. (Closed as won't-fix.)

## Confirmed excellent (do not regress)

Deck position persistence (`use-deck-progress`); seed-first nutrition + coverage
gating; cook completion idempotency + wall-clock timers; the shared diary store;
shopping-list aggregation; pantry→reco rerank; reduced-motion discipline; the
two-step vision→correction pipeline; Content fully on the Track-E premium system.
