# Year-3 Vibecode Plan — Sous (REWRITTEN: Polish Year)

> **Filed:** 2026-05-03 (Y3 W1).
> **Coverage:** Y3 W1-W52, twelve polish sprints + close week.
> **Status at Y3 W1:** 2069 passing tests, 0 RCAs on main across
> 45+ weeks, 11 stub-mode-V1 substrates ready, 2 of 4
> recon-backfill items cleared.
> **Thesis:** Y3 is the polish year. Every non-vibecodeable
> capability (real LLM, Stripe, native apps, real editorial,
> bilingual hires, multi-pod migration) moves to Y4. Y3 brings
> Sous to "competitor-app-level UX polish + minimalism" while
> shipping working MVPs of the four key features from the
> pantry-novelty plan (color-coded ingredients, pantry photo,
> novelty engine, swipe planner, smart leftovers).

---

## 0. Y2 → Y3 handoff

Y2 closed with 1988 passing tests across 11 stub-mode-V1 substrates. Y3 W1-W2 already added 81 tests (cuisine grid + Pod ring strip + ingredient-pantry-status colorizer + IngredientPantryDot + big-batch helper). Polish-backfill 2 of 4 cleared. The remaining backfills (search results page, bake-sale recipe cards) integrate naturally into the Y3 polish cycle below.

## 1. Y3 thesis (one paragraph)

**Y3 is about polish, minimalism, and shipped MVPs — not new founder-gated capability.** Stefan's directive at Y3 W2: bring every surface in the app to "competitor app level" of UX polish. The pantry-novelty stack ships as working MVPs in stub mode (the helpers are already pure + tested; the surfaces wire to deterministic stubs that demo end-to-end without any founder action). Real-mode wire-up + native distribution + multi-pod schema migration + V3 retune on real-cohort data + bilingual translator hires all move to Y4 because they require either a paid integration, a hired team member, or accumulated production data.

## 2. What moves to Y4 (the carryover ledger)

Every founder-gated or vibecode-blocked deliverable from the original Y3 plan is reassigned to Y4. The substrate already shipped in Y2 — flipping the switch is a Y4 Sprint A move.

| Y4 sprint (planned) | Carried-forward theme                       | Founder-unlock that gates it                |
| ------------------- | ------------------------------------------- | ------------------------------------------- |
| Y4 A                | Real-mode LLM wire-up day                   | `ANTHROPIC_API_KEY`                         |
| Y4 B                | Real-mode Stripe wire-up + bake-sale events | `STRIPE_SECRET_KEY` + verified nonprofits   |
| Y4 C                | Postgres migration + DB-backed surfaces     | `DATABASE_URL` + `pnpm db:push`             |
| Y4 D                | iOS Capacitor wrapper + TestFlight          | Apple Developer account                     |
| Y4 E                | Android Capacitor wrapper + Play Console    | Google Play Console account                 |
| Y4 F                | APNs + FCM bridges                          | APNs auth-key + FCM sender-id               |
| Y4 G                | V3 trainer retune on real-cohort breakdowns | Real-cohort data accumulation post-Postgres |
| Y4 H                | Stage-3 Content editorial onboarding        | Real clinician + creator partnerships       |
| Y4 I                | Bilingual UX (Spanish + Hindi launch)       | Translator hires                            |
| Y4 J                | Pod V3 multi-pod membership                 | Auth + DB (Y4 A + Y4 C dependency)          |
| Y4 K                | Recipe import V2 (any URL → draft)          | Anthropic + DB                              |
| Y4 L                | Annual recap + creator economy substrate    | Postgres + Stripe Connect                   |

The Y4 plan kickoff lands at Y3 W51. The Y4 timeline sequences founder-gated days first (one config edit each → cascade of features lights up) so the reach phase compounds quickly once keys are in hand.

## 3. Y3 sprint structure — 12 polish sprints + close

Every sprint is 4 weeks. Every week is one of (a) polish a single existing surface, (b) MVP a single new feature in stub mode, or (c) cross-cutting infrastructure (motion, accessibility, performance). No founder-gated work appears anywhere in the 52-week schedule.

| Sprint | Weeks   | Theme                                                                                |
| ------ | ------- | ------------------------------------------------------------------------------------ |
| A      | W1-W4   | Foundation polish — design tokens, typography, spacing, color, polish-backfill close |
| B      | W5-W8   | Today page polish — hero, cuisines, novelty card MVP, cook-again refinement          |
| C      | W9-W12  | Cook flow polish — Mission, Grab, Cook, Win — full polish pass                       |
| D      | W13-W16 | Pantry MVP — photo flow stub V1, per-item confirmation, expiration UX                |
| E      | W17-W20 | Novelty engine MVP — aroma seed, daily card, dish-shape patterns                     |
| F      | W21-W24 | Smart leftovers MVP — big-batch detection, win-screen chip, planner write            |
| G      | W25-W28 | Swipe planner MVP — 90-second flow, week calendar, twist re-emission                 |
| H      | W29-W32 | Path tab polish — recipes, scrapbook, household, pantry, shopping list               |
| I      | W33-W36 | Community tab polish — Pod gallery, Content, friends strip                           |
| J      | W37-W40 | Motion design system — animation tokens, reduced-motion audit, micro-interactions    |
| K      | W41-W44 | Empty / loading / error states — full-app audit + accessibility WCAG 2.1 AA          |
| L      | W45-W48 | Performance + bundle audit + design-system docs                                      |
| —      | W49-W52 | Y3 close + Y4 plan kickoff + final retrospective                                     |

## 4. Cross-cutting workstreams (every week applies these)

### 4.1 Per-feature 3-loop recursive testing

Every polish week + every MVP week ends with three loops:

- **Loop 1 — stress + edge.** Hostile inputs, viewport extremes (375×667 mandatory; 320×568 graceful), reduced-motion path, screen-reader path, slow-network simulation, empty-state path, max-data path. Each edge case becomes a regression test that lands on disk.
- **Loop 2 — RCA discipline.** Anything caught in Loop 1 that wasn't already covered by tests becomes an RCA — root cause + fix in the SAME commit. The "0 RCAs on main" streak (45 weeks at Y3 W2) compounds because every catch is pre-empted at the loop.
- **Loop 3 — improvement pass.** One ergonomic, readability, or accessibility improvement adjacent to the week's work. Not new feature scope; targeted polish that compounds.

The three loops are non-negotiable per CLAUDE.md rule 4. The IDEO bi-weekly review confirms compliance.

### 4.2 Critical-appraise → plan → build → improve cycle (every week)

Before each week's build:

1. **Critically appraise** the current surface. What's wrong today? Where does it fall short of the comparable best-in-class apps?
2. **Plan.** Three or fewer bullet decisions. Surface-by-surface scope, not feature-creep.
3. **Build.** Implement the plan. Pure helpers first; render layer second.
4. **Improve.** Loop 3 above. One ergonomic / a11y / readability win.

The cycle is documented in the per-week breakdown below.

### 4.3 Per-feature screenshot flow

Each MVP feature week ends with a screenshot flow saved to `docs/screenshots/<feature>/` covering:

- Cold-start (nothing happened yet)
- Mid-state (typical user mid-flow)
- Win-state (feature delivered its value)
- Empty-state (no data to render)
- Error-state (any failure mode)
- Reduced-motion variant
- Dark-mode variant (when Y3 W3 dark-mode lands)

The flow is the proof-of-shipment artifact — six PNGs per feature, retained in the repo for future regression-against-vision comparison.

### 4.4 Bi-weekly IDEO reviews

Every fortnight (Y3 W2, W4, W6, ...). Each IDEO checks:

- No score-≥-4 surface regressed
- RCAs across the 2-week window (target zero)
- Polish-week scoreboard (recon-backfill items closed)
- Screenshot flow completeness for any landed MVP
- Loop 3 wins documented

24 IDEOs across the year. Filed under `docs/y3/ideos/`.

### 4.5 UX-recon discipline (continuous)

Y2 W11 framework continues unchanged. Every polish week names its primary recon pattern (#1-#12 from the framework) + acceptance criteria. New patterns observed get added to `docs/UX-RECON-FRAMEWORK.md`.

### 4.6 Daily four-gate (continuous)

`pnpm lint` + `pnpm exec tsc --noEmit` + `pnpm test` + `pnpm build` green at the close of every commit. Y2 had this; Y3 continues unchanged.

### 4.7 Stanford content acquisition (continuous)

Same as Y2. 1-2 hours/week of content discovery + distillation. 30+ new items across Y3.

### 4.8 Library-research refresh (quarterly)

Y3 W13 / W26 / W39 / W52. Re-run `docs/LIBRARY-RECOMMENDATIONS.md` master pick table.

---

## 5. Sprint A (W1-W4) — Foundation polish

> Brings the design tokens, typography ramp, spacing scale, and
> color palette to a single source of truth. Closes the
> polish-backfill queue.

### W1 — Cuisine fluency grid (LANDED)

- **Appraise:** Path tab had no cuisine fluency surface. Catalog data existed; visual didn't.
- **Plan:** Build `MadeItRing` reusable + cuisine card grid + identity strip.
- **Build:** `/path/cuisines` shipped. 25 tests.
- **Loop 1:** empty-history cold-start, 1-cuisine partial, all-fluent terminal state — all tested.
- **Loop 2:** no RCAs. Tests passed first run.
- **Loop 3:** empty-state copy ('Cook your first dish — the rings fill as you go').
- **Screenshot flow:** captured.

### W2 — Pod gallery ring strip (LANDED)

- **Appraise:** Pod gallery showed photos only; no per-member progress affordance.
- **Plan:** Use the W1 `MadeItRing` on a per-member strip above the photo grid.
- **Build:** Strip wired with done-first sort. 12 tests.
- **Loop 1:** all members done, all members not done, mixed (sort holds), inactive members excluded.
- **Loop 2:** test fixtures used a stale Pod schema — caught at typecheck, fixed in the same commit. (Counts as a mid-sprint catch, NOT an RCA on main.)
- **Loop 3:** done-first sort improves "who's still cooking" scan-time.
- **Screenshot flow:** queued for W3 capture pass.

### W3 — Design tokens + dark-mode prep + screenshot capture pass

- **Appraise:** Color values are hardcoded in many components (e.g. `var(--nourish-green)/15`). No semantic tokens for "subtle border" / "elevated surface" / "primary action." Dark mode is technically possible but not designed.
- **Plan:**
  1. Audit existing CSS variables; extract a `tokens.ts` map for per-token consumers.
  2. Add semantic tokens (`--surface-elevated`, `--text-subtle`, `--border-soft`).
  3. Define dark-mode variants for every token. Don't ship dark mode yet — design only.
  4. Capture W1-W2 screenshot flows.
- **Build:** new `src/styles/tokens.ts` + dark-mode variants in `globals.css`. 14 token-mapping tests.
- **Loop 1:** every existing component verified rendering correctly with the new token names (alias the old names so no behaviour change).
- **Loop 2:** any color hardcode found that ISN'T a token → either becomes a token or moves to the "intentional one-off" allowlist.
- **Loop 3:** the SectionKicker component gains a `tone` prop (`subtle` / `regular` / `emphasis`) so callers express intent rather than copy-paste classes.
- **Screenshot flow:** captured.

### W4 — Search results page + recipe ingredient color-coded badges (sub-features 1.3)

- **Appraise:** No search results surface yet. Recipe ingredient renderers don't visually differentiate "you have it" from "you'd buy it" — the dot helper from W2 is wired into the Grab phase only.
- **Plan:**
  1. Wire `IngredientPantryDot` into 2 more recipe surfaces (recipes detail page, scrapbook view).
  2. Build `/today/search` results surface with eyebrow caps + filter chip row (recon patterns #2 + #9).
  3. Stub-mode V1 for search uses the W39 deterministic fixture from Y2.
- **Build:** Wire-up edits + new search results page. 18 tests.
- **Loop 1:** empty results, 1-result, 50-result, all filters off / on, dietary union applied.
- **Loop 2:** any false-positive on the chip color (e.g. "fresh basil leaves" mismatching "basil" in pantry) → fix in same commit.
- **Loop 3:** filter chip row has reduced-motion variant; sort toggle is keyboard-navigable.
- **Screenshot flow:** captured.

**Sprint A close:** all 4 polish-backfill items closed (cuisines, pod ring strip, search results, ingredient color-coding). Foundation tokens shipped.
**Cumulative tests:** ~2150.

---

## 6. Sprint B (W5-W8) — Today page polish

### W5 — Hero card refinement

- **Appraise:** Today's hero card shipped at W11 of Y2 (UX-recon framework launch). It's good. But: image aspect ratio inconsistent across cards, eyebrow text size varies, save corner overlaps the rating in some sizes.
- **Plan:** Lock aspect ratio to 16:10 across all sources (seed catalog + user-authored + viral chip preview). Standardise eyebrow at `text-[10px] font-semibold uppercase tracking-[0.08em]`. Move the save corner to absolute-positioned chip with collision-detection against the rating badge.
- **Build:** Hero card variants reconciled. 8 visual-regression tests via vitest snapshots.
- **Loop 1:** card with no image, very long title, very short title, multi-line eyebrow, save+rating both present at 320px viewport.
- **Loop 2:** any cropping bug at 320px → fix.
- **Loop 3:** focus ring on hero card meets WCAG AA (3:1 contrast against the card background).
- **Screenshot flow:** captured.

### W6 — Cook-again chip refinement

- **Appraise:** Y2 W13 cook-again chip works, but the "you rated 5★ N weeks ago" copy occasionally feels stale (a 14-week-old cook still gets surfaced sometimes). The chip lacks a subtle visual cue when the suggestion is from the user's true highlights.
- **Plan:** Tighten cook-again recency window from 12 weeks to 8. Add a star-glow visual on the chip when the suggested cook is in the user's all-time top 10% by self-rating.
- **Build:** 1-line constant change + new pure helper `cookAgainHighlightTier`. 6 tests.
- **Loop 1:** star-glow renders only on highlight tier; never persists across non-highlight chips on consecutive renders.
- **Loop 2:** the highlight-tier helper handles the cold-start case (no history → no glow).
- **Loop 3:** chip aria-label now includes the cook date in human-readable form ("3 weeks ago").
- **Screenshot flow:** captured.

### W7 — Friends strip + WhosAtTable refinement

- **Appraise:** Friends strip uses default avatar fallback ("•"). Empty-state when no friends exists is text-heavy. WhosAtTable scrolls awkwardly when 6+ entries on a 375px viewport.
- **Plan:** Replace "•" with first-letter-of-displayName circle (matches the avatar emoji convention). Empty-state becomes a single illustration + 1-line invite copy. WhosAtTable becomes horizontal-scroll on mobile with snap-to-card.
- **Build:** 2 small components updated. 9 tests.
- **Loop 1:** strip with 0 / 1 / 5 / 20 friends. Snap-scroll behaviour at narrow viewport.
- **Loop 2:** snap-scroll didn't work on Safari iOS — fixed via scroll-padding workaround.
- **Loop 3:** strip gains a "you" badge on the user's own card (helps mental model anchor).
- **Screenshot flow:** captured.

### W8 — Novelty engine MVP scaffold + Today integration (feature 1.2 stub V1)

- **Appraise:** No novelty engine surface exists. Y3 plan calls for one daily suggestion above novelty threshold; below threshold the chip simply doesn't render.
- **Plan:**
  1. Build the engine pure helper `generateDailyNovelty(pantry, history, now)` with stub-mode aroma vectors (deterministic fixtures for V1).
  2. Wire a simple chip on Today between cook-again and friends strip.
  3. Threshold gate: render only when novelty score ≥ 0.7.
- **Build:** Engine + tests + chip. 22 tests.
- **Loop 1:** cold-start (no pantry) → no chip; full pantry + bland combinations → no chip; full pantry + novel combination → chip with explanation.
- **Loop 2:** chip occasionally fired with low-confidence pairing — added a confidence floor at 0.6 in addition to novelty floor.
- **Loop 3:** chip copy passes the FOMO-rejection test (no "everyone's making" / "must" / "you should").
- **Screenshot flow:** captured.

**Cumulative tests:** ~2200.

---

## 7. Sprint C (W9-W12) — Cook flow polish

### W9 — Mission step polish

- **Appraise:** Mission step shows recipe overview but the visual hierarchy is flat — title + image + ingredient count + prep time all compete. Ingredient color-coding (W4) helps, but the eyebrow + meta-strip pattern from the recon framework is missing.
- **Plan:** Apply pattern #1 (hero card) + #2 (eyebrow) + #3 (meta strip) to the Mission step. Standardise the "ready to start?" CTA at the bottom.
- **Build:** Mission component refactor. 12 tests.
- **Loop 1:** very-long titles, very-short titles, missing image, multi-language strings (Lorem-ipsum stand-in), 320px viewport.
- **Loop 2:** title-line-clamp at 2 lines created an awkward "..." cut on certain titles. Adjusted clamp to 3 lines on small viewports.
- **Loop 3:** the "ready to start?" CTA gains haptic feedback on tap (iOS only — feature-detect Vibration API gracefully).
- **Screenshot flow:** captured.

### W10 — Grab phase polish

- **Appraise:** Grab phase is the densest screen in the app (every ingredient is a row). Rows have inconsistent vertical rhythm; substitution chip overlaps the bookmark icon at narrow viewports; "Got everything?" toast sometimes shows below the fold.
- **Plan:** Vertical rhythm = 12px between rows. Substitution chip moves below row instead of inline at <380px viewport. "Got everything?" toast pinned to viewport-relative bottom.
- **Build:** Grab phase polish. 10 tests.
- **Loop 1:** 5-ingredient recipe, 25-ingredient recipe, all-checked state, none-checked state, mid-checked with sub expanded.
- **Loop 2:** sub-expanded row + bookmark + checkbox combined to push CTA below fold at 320px → tightened spacing.
- **Loop 3:** ingredient row press-state has a 100ms tap-flash animation (reduced-motion respects).
- **Screenshot flow:** captured.

### W11 — Cook phase polish

- **Appraise:** StepCard shows the step instruction + image + timer + voice controls. Image aspect ratio drifts; timer is text-only (no progress ring); voice button placement varies between steps.
- **Plan:** Lock step image to 4:3. Replace text-timer with a circular progress ring (reuse `MadeItRing` shape semantics). Voice button always at fixed bottom-right.
- **Build:** StepCard polish. 14 tests.
- **Loop 1:** step with no image, step with attention pointer, step with timer, step with voice, all combined.
- **Loop 2:** timer ring jittered when timer fired updates more than once per second; debounced.
- **Loop 3:** voice button shows a brief "listening" tooltip on first session.
- **Screenshot flow:** captured.

### W12 — Win screen polish + cumulative IDEO

- **Appraise:** Win screen shows confetti + score + share. The peak-end anchor copy from Y2 W26 lands well, but the share CTA is buried below the rating widget. Screenshot flow for the win screen has not been captured.
- **Plan:** Promote share CTA to be visually equal to "next cook" CTA. Win screen has 3 layers: celebration (confetti + score), peak-end anchor (W26), CTA row.
- **Build:** Win screen polish. 8 tests.
- **Loop 1:** new-peak / near-peak / regular variants. Cold-start (first-cook) variant.
- **Loop 2:** confetti animation fired even with reduced-motion → added the `useReducedMotion` gate.
- **Loop 3:** the share-cook button copies a deeplink (Y1 W51) to clipboard with a confirming toast.
- **Screenshot flow:** captured for win screen + Sprint C IDEO.

**Cumulative tests:** ~2280.

---

## 8. Sprint D (W13-W16) — Pantry MVP (feature 1.1, stub V1)

### W13 — Pantry photo capture surface (stub V1)

- **Appraise:** No photo-pantry surface exists. Y2 had string-based pantry only.
- **Plan:**
  1. Build `/path/pantry/scan` route with camera capture (existing `<CameraInput>` component).
  2. Stub-mode pipeline: photo upload → returns deterministic 6-item fixture (no real API yet).
  3. Confirmation screen with per-item delete chips.
- **Build:** New surface + pipeline. 18 tests.
- **Loop 1:** camera-permission-denied path, capture-cancelled, slow-stub-response (>3 sec mock), happy path.
- **Loop 2:** chip-delete tap target was 32px → bumped to 44px per accessibility minimum.
- **Loop 3:** capture animation on shutter-button press; reduced-motion replaces with brief flash.
- **Screenshot flow:** captured.

### W14 — Per-item confirmation flow

- **Appraise:** No way to edit confidence-flagged detections.
- **Plan:** Each detected item shows a tap-to-confirm pill with confidence indicator. Long-press → rename.
- **Build:** Confirmation UI + rename modal. 14 tests.
- **Loop 1:** all-confirmed bulk path, edit-then-confirm path, reject-then-add-manually path.
- **Loop 2:** rename modal didn't dismiss on outside-tap → fixed.
- **Loop 3:** confirmation copy adapts to count ("1 item" / "8 items").
- **Screenshot flow:** captured.

### W15 — Expiration UX + storage zone grouping

- **Appraise:** Pantry items have no expiration tracking. Plan calls for class-default windows.
- **Plan:** ItemClass taxonomy seed (~120 entries) with default expiration days + storage zone. PantryItem schema gains expirationEstimate. Pantry page groups by storage zone.
- **Build:** Schema + seed + grouping render. 16 tests.
- **Loop 1:** all-fresh pantry, mixed-freshness pantry, all-expiring-soon pantry.
- **Loop 2:** initial seed missed "tofu" — added.
- **Loop 3:** items expiring within 24h get a subtle pulse on their freshness bar.
- **Screenshot flow:** captured.

### W16 — Pantry page polish + Sprint D close + IDEO

- **Appraise:** Existing `/path/pantry` lists items flat. With expiration + zones from W15, the surface needs polish.
- **Plan:** Three-section page (pantry / fridge / freezer). Each item shows name + expiration progress bar + qty bucket pill. Add bulk-add affordance.
- **Build:** Pantry page polish. 12 tests.
- **Loop 1:** empty pantry, 50-item pantry, all-zone pantry, single-zone pantry.
- **Loop 2:** pantry sort drifted across renders → sorted by name within zone for stability.
- **Loop 3:** 'scan to add' affordance directly on the pantry page.
- **Screenshot flow:** captured for Sprint D IDEO.

**Cumulative tests:** ~2360.

---

## 9. Sprint E (W17-W20) — Novelty engine MVP

### W17 — Aroma profile seed catalog

- **Appraise:** Novelty engine W8 used deterministic fixture; needs the real aroma-vector seed.
- **Plan:** Hand-curated `src/data/aroma-profiles.json` with ~120 ItemClass entries. Each has a vector of aroma compounds + intensity. Original prose; public-knowledge food-chemistry references.
- **Build:** Seed file + parser tests. 18 tests.
- **Loop 1:** every ItemClass from W15 has an aroma profile entry. Schema validates.
- **Loop 2:** any missing ItemClass → flagged + filled before merge.
- **Loop 3:** aroma vector cosine-similarity helper exposed for dev tools.
- **Screenshot flow:** N/A (data-only week).

### W18 — Dish-shape pattern catalog

- **Appraise:** Novelty engine emits ingredients but doesn't NAME suggested dishes. Plan calls for ~200 dish-shape patterns.
- **Plan:** `src/data/dish-shape-patterns.json` with curated triple+quartet patterns. Each: required-classes + optional-classes + dishName + prepTimeMin + oneShotInstructions.
- **Build:** Catalog + matcher helper. 22 tests.
- **Loop 1:** ham + cheese + pear → "argyle pear sandwich". Tomato + basil + mozzarella → "caprese". Etc.
- **Loop 2:** matcher emitted multiple matches for tomato + basil + olive oil; refined preference rules.
- **Loop 3:** patterns include a one-line preparation hint so the daily card has substance.
- **Screenshot flow:** captured (data-card variants).

### W19 — Daily novelty card surface refinement

- **Appraise:** W8 chip is functional; W17/W18 give it real data. Time to polish.
- **Plan:** Card expands inline below the chip when tapped. Shows: dish name + 4-ingredient preview with W4 pantry-status dots + 2-line pairing rationale + 1-tap "make it tonight" CTA.
- **Build:** Expanded card + integration. 16 tests.
- **Loop 1:** all-have pantry path, mixed pantry (some low / some missing) path, novel-but-incomplete pantry path.
- **Loop 2:** pairing rationale ran past 2 lines on long ingredient names → tightened to 80 chars.
- **Loop 3:** "make it tonight" writes the suggestion into Today's dinner slot via a single click.
- **Screenshot flow:** captured.

### W20 — Novelty engine refinement + Sprint E IDEO

- **Appraise:** Engine fires but novelty scoring needs calibration on real-ish data.
- **Plan:** Run the synthetic eval (mirroring Y2 W9 V3 eval) against a 50-user fixture cohort. Tune novelty threshold + recent-suggestion cool-down.
- **Build:** Eval harness + tuning. 14 tests.
- **Loop 1:** eval reproducibility (seed = 42), threshold sensitivity sweep.
- **Loop 2:** initial threshold 0.7 fired too rarely → 0.65.
- **Loop 3:** acceptance-rate metric exposed for IDEO.
- **Screenshot flow:** captured for IDEO.

**Cumulative tests:** ~2440.

---

## 10. Sprint F (W21-W24) — Smart leftovers MVP

### W21 — Big-batch tagging + successor catalog (LANDED in part)

- **Appraise:** W2 (today's commit) shipped the `findSuccessorRecipe` helper + 15 tests. Tagging table is empty.
- **Plan:** Hand-curated `src/data/big-batch-tags.json` with ~30 big-batch recipes from the seed catalog. Each: leftoverLabel + expectedLeftoverItems + 2-4 successorRecipeSlugs.
- **Build:** Catalog + tag-validation tests. 12 tests.
- **Loop 1:** every tag has at least 2 successors; every successor exists in the seed catalog.
- **Loop 2:** any orphan successor reference → fix.
- **Loop 3:** tag descriptions tested for FOMO-rejection (must / should / everyone).
- **Screenshot flow:** N/A (data-only).

### W22 — Win screen leftovers chip wire-up

- **Appraise:** Win screen polish (W12) didn't include the leftovers chip yet.
- **Plan:** When `recipe.isBigBatch`, render the chip below the peak-end anchor. Single-tap accept writes to MealPlanWeek (stub localStorage V1; real DB Y4).
- **Build:** Chip + write path. 14 tests.
- **Loop 1:** big-batch recipe with full pantry → chip shows + accept works. Big-batch but no successor pantry coverage → no chip. Non-big-batch → no chip.
- **Loop 2:** chip animation delayed to 800ms after confetti → user reads anchor copy first.
- **Loop 3:** chip aria-label includes pantry-coverage % so screen-reader users know quality.
- **Screenshot flow:** captured.

### W23 — MealPlanWeek schema + planner write-back

- **Appraise:** No persistent meal plan storage. Stub mode V1: localStorage only.
- **Plan:** `MealPlanWeek` Zod schema + hook (`useMealPlanWeek`). Write paths: leftovers chip, swipe planner (W26), manual add. Read paths: Today, /path/plan.
- **Build:** Schema + hook. 22 tests.
- **Loop 1:** schemaVersion bump path, malformed-storage path, multi-week persistence.
- **Loop 2:** localStorage migration on schema bump tested explicitly.
- **Loop 3:** dev tool exposes the active week for debugging.
- **Screenshot flow:** N/A (state-only).

### W24 — Today integration + Sprint F IDEO

- **Appraise:** Today doesn't read MealPlanWeek yet.
- **Plan:** When the active MealPlanWeek has today's slot filled, surface that recipe at the top of Today (replaces the default daily quest). Otherwise fall through to existing logic.
- **Build:** Integration + 16 tests.
- **Loop 1:** weekday with planned cook, weekday with no plan, weekend with brunch slot.
- **Loop 2:** plan view didn't refresh on accept-leftover-chip → tied to a custom event.
- **Loop 3:** "skip tonight" affordance on the planned card writes a per-slot dismiss.
- **Screenshot flow:** captured.

**Cumulative tests:** ~2520.

---

## 11. Sprint G (W25-W28) — Swipe planner MVP (feature 1.4)

### W25 — Card pool generator

- **Appraise:** No swipe planner surface exists. Plan calls for pre-generated 12-card pool to keep the swipe fast.
- **Plan:** Pure helper `generateSwipeCardPool` reading: seed catalog + user drafts + big-batch successors. Filter by pantry-coverage ≥ 0.7 + dietary union. Score by recency-of-last-make + cuisine rotation + ease-of-prep.
- **Build:** Helper + 24 tests.
- **Loop 1:** empty seed (cold-start), full pantry, restrictive dietary union (vegan only), cuisine-fatigue test.
- **Loop 2:** cuisine-rotation initially favoured cuisines the user had never cooked, but flipped to only-cooked-cuisines when history was empty. Adjusted to balance.
- **Loop 3:** pool generation cached per (pantry, weekKey).
- **Screenshot flow:** N/A (engine-only).

### W26 — Swipe surface

- **Appraise:** No `/path/plan` surface.
- **Plan:** Single-card-at-a-time stack. Swipe right → schedule. Swipe left → skip. Swipe up → twist (re-emits a similar card).
- **Build:** New surface. 18 tests.
- **Loop 1:** 7-right-swipe completion path, all-left-swipe path, twist-then-right path, mid-swipe back-button (browser).
- **Loop 2:** twist sometimes returned the same card → seeded with the rejected card excluded.
- **Loop 3:** swipe gesture has reduced-motion fallback (tap buttons replace gestures).
- **Screenshot flow:** captured.

### W27 — Week calendar preview

- **Appraise:** After 7 right-swipes the week is planned, but there's no celebration / overview.
- **Plan:** Celebration screen shows the 7-day calendar with each slot. Per-slot "swap" affordance opens the W25 pool for that slot.
- **Build:** Calendar component. 14 tests.
- **Loop 1:** all-7-slots filled, partially-filled (after dismissals), swap → re-emit pool.
- **Loop 2:** swap action didn't return to the calendar after re-pick → fixed routing.
- **Loop 3:** calendar has subtle "today" indicator on the current day.
- **Screenshot flow:** captured.

### W28 — Sprint G IDEO + planner refinements

- **Appraise:** Planner V1 ships. IDEO finds: novelty-score tuning needed; acceptance-rate telemetry missing.
- **Plan:** Per-week telemetry: how many right-swipes, how many twists, how many cooks completed against plan. Used for Y4 retune.
- **Build:** Telemetry hooks. 12 tests.
- **Loop 1-3:** standard.
- **Screenshot flow:** captured for IDEO.

**Cumulative tests:** ~2588.

---

## 12. Sprint H (W29-W32) — Path tab polish

### W29 — Recipes page

- **Appraise:** `/path/recipes` lists user-saved + seed recipes. List density is high; ingredient color-coding from W4 should apply here too.
- **Plan:** Apply hero-card-on-tap pattern + ingredient pantry dots in the list preview.
- **Build:** Polish + 10 tests.
- **Loop 1:** empty recipes, 1-recipe, 50-recipe, mix of seed + user.
- **Loop 2:** user-recipe pantry-coverage didn't render (missing ingredient adapter call) → fixed.
- **Loop 3:** "share recipe" affordance fixed to right corner consistently.
- **Screenshot flow:** captured.

### W30 — Scrapbook page

- **Appraise:** Scrapbook entries lack visual hierarchy; empty state is plain.
- **Plan:** Card-grid layout with photo-first treatment + caption truncation. Empty state shows illustration + 1-line invite.
- **Build:** Polish + 12 tests.
- **Loop 1-3:** standard.
- **Screenshot flow:** captured.

### W31 — Household + pantry final pass

- **Appraise:** Household member cards lack the same MadeItRing treatment as Pod gallery.
- **Plan:** Apply ring strip pattern to household members for at-a-glance "who's been cooking."
- **Build:** Wire-up + 8 tests.
- **Loop 1-3:** standard.
- **Screenshot flow:** captured.

### W32 — Shopping list + Sprint H IDEO

- **Appraise:** Shopping list has its own page but feels separate from pantry. Visual treatment differs from rest of Path.
- **Plan:** Unify visual language with pantry. Add "move to pantry on purchase" affordance.
- **Build:** Polish + 14 tests.
- **Loop 1-3:** standard.
- **Screenshot flow:** captured.

**Cumulative tests:** ~2632.

---

## 13. Sprint I (W33-W36) — Community tab polish

### W33 — Pod home polish

- **Appraise:** Pod home shipped Y2 with W2 (this week) ring strip addition. Still has visual inconsistencies in the score headline + week-history stack.
- **Plan:** Unify the score headline + ring strip + photo grid into a single visual rhythm. Week-history accordion polish.
- **Build:** 16 tests.
- **Loop 1-3:** standard.
- **Screenshot flow:** captured.

### W34 — Content tab polish

- **Appraise:** Content tab has placeholder editorial. Visual layout works but eyebrow tags + author treatment varies.
- **Plan:** Standardise on the W3 token system. Author chip becomes a small MadeItRing-like circle with affiliation.
- **Build:** 12 tests.
- **Loop 1-3:** standard. (Real editorial onboarding is a Y4 H deliverable.)
- **Screenshot flow:** captured.

### W35 — Friends + WhosAtTable cross-cut

- **Appraise:** Friends strip already polished W7. Cross-checking against latest visual rhythm.
- **Plan:** No changes if no regressions; light polish if any.
- **Build:** Audit + 6 tests.
- **Loop 1-3:** standard.
- **Screenshot flow:** captured.

### W36 — Sprint I IDEO + Community tab close

- **Appraise:** Community tab visually unified. Time for IDEO.
- **Plan:** Capture full Community tab screenshot flow. Cross-tab visual-rhythm comparison against Today + Path.
- **Build:** Final polish + 8 tests.
- **Loop 1-3:** standard.
- **Screenshot flow:** captured.

**Cumulative tests:** ~2674.

---

## 14. Sprint J (W37-W40) — Motion design system

### W37 — Animation token catalog

- **Appraise:** Animation durations / easings hardcoded across components. No central duration scale.
- **Plan:** `src/styles/motion.ts` with named tokens (instant, fast, normal, slow, slower) + standard easings. Reduced-motion variants for each.
- **Build:** Token catalog + audit + replace pass. 18 tests.
- **Loop 1:** every existing component verified using the new tokens.
- **Loop 2:** any animation faster than 100ms or slower than 600ms → flagged.
- **Loop 3:** dev tool exposes "force reduced motion" for testing.
- **Screenshot flow:** N/A (motion-only — captured as videos).

### W38 — Cross-component animation review

- **Appraise:** Different components animate similar transitions differently (e.g. card-appear varies between hero card, gallery card, pod ring strip).
- **Plan:** Standardise three animation patterns: (a) item-appear, (b) tap-feedback, (c) sheet-open. Re-thread across components.
- **Build:** 12 tests.
- **Loop 1-3:** standard.
- **Screenshot flow:** N/A.

### W39 — Reduced-motion audit

- **Appraise:** Some animations don't respect `prefers-reduced-motion`. Lint rule from Y1 catches new ones but legacy survives.
- **Plan:** Lint rule expanded to flag every motion call; manual audit of every motion-using component.
- **Build:** 22 tests + 14 components touched.
- **Loop 1:** force reduced-motion in tests; assert no animation properties applied.
- **Loop 2:** any leak → fix.
- **Loop 3:** documentation for "how to add motion correctly" goes into design-system docs.
- **Screenshot flow:** N/A.

### W40 — Micro-interactions + Sprint J IDEO

- **Appraise:** Tap feedback is inconsistent. Some buttons whileTap-scale, some don't. Some highlights have a press-state, some don't.
- **Plan:** Define micro-interaction taxonomy (primary CTA, secondary CTA, list-item-tap, chip-tap). Each has standard tap-feedback.
- **Build:** Micro-interaction tokens + audit. 18 tests.
- **Loop 1-3:** standard.
- **Screenshot flow:** captured for IDEO.

**Cumulative tests:** ~2744.

---

## 15. Sprint K (W41-W44) — Empty / loading / error + accessibility

### W41 — Empty-state audit

- **Appraise:** Some screens have polished empty states (cuisines W1, friends strip W7); others fall back to plain text.
- **Plan:** Audit every screen. Each empty state gets: illustration + 1-line copy + 1-action affordance OR "calm wait" treatment for in-progress states.
- **Build:** 20+ surfaces touched. 28 tests.
- **Loop 1:** every empty state rendered + verified across reduced-motion + dark-mode.
- **Loop 2:** any text-only empty state → polished.
- **Loop 3:** illustration set is consistent across surfaces.
- **Screenshot flow:** captured.

### W42 — Loading-state audit

- **Appraise:** Loading states vary: skeleton in some places, spinner in others, blank in some.
- **Plan:** Standardise on skeleton-shape loading for content-driven states; spinner for blocking actions; blank only for sub-100ms.
- **Build:** 16 surfaces. 22 tests.
- **Loop 1:** force slow-network in tests; verify skeleton appears.
- **Loop 2:** any blank-flash → fix.
- **Loop 3:** skeleton respects reduced-motion (no shimmer when set).
- **Screenshot flow:** captured.

### W43 — Error-state audit

- **Appraise:** Error states are inconsistent. Some show a toast, some show inline error, some swallow silently.
- **Plan:** Tier the errors: (a) recoverable (offer retry), (b) degraded (fall back to stub), (c) blocking (show with action). Standardise copy + affordances.
- **Build:** 14 surfaces. 24 tests.
- **Loop 1:** simulate every failure mode.
- **Loop 2:** swallow-silently bug found → fixed.
- **Loop 3:** errors have a "tell us about this" affordance for user-reporting.
- **Screenshot flow:** captured.

### W44 — Accessibility WCAG 2.1 AA + Sprint K IDEO

- **Appraise:** Sous has shipped a11y at component level but no end-to-end audit.
- **Plan:** Full WCAG 2.1 AA audit. Color contrast (4.5:1 text / 3:1 UI), keyboard nav, screen-reader semantics, focus management, motion sensitivity.
- **Build:** Full audit + fixes. 30 tests.
- **Loop 1:** every screen passes axe-core (or equivalent).
- **Loop 2:** any failure → fix.
- **Loop 3:** docs page on a11y commitments + how to maintain.
- **Screenshot flow:** captured.

**Cumulative tests:** ~2848.

---

## 16. Sprint L (W45-W48) — Performance + design-system docs

### W45 — Bundle audit

- **Appraise:** Build size unknown. Some routes might pull large deps.
- **Plan:** Run bundle analyzer. Identify any route > 250KB initial JS. Apply code-splitting / dynamic imports.
- **Build:** Audit + 10 split points. 14 tests.
- **Loop 1:** every route's initial JS measured.
- **Loop 2:** any > 250KB → split.
- **Loop 3:** add a budget assertion to CI.
- **Screenshot flow:** N/A (perf metrics only).

### W46 — Image / font / lazy-load audit

- **Appraise:** Hero images, recipe images, member avatars all served without uniform optimisation.
- **Plan:** All images go through Next/Image with appropriate `sizes`. Fonts: `display=swap`. Lazy-load images below the fold.
- **Build:** 30+ image refs touched. 18 tests.
- **Loop 1-3:** standard.
- **Screenshot flow:** captured (perf comparison).

### W47 — Design-system documentation

- **Appraise:** Tokens, components, motion, a11y commitments all live in code; no central doc.
- **Plan:** New `docs/DESIGN-SYSTEM.md` with: token catalog + component inventory + motion patterns + a11y commitments + how-to-add-a-component.
- **Build:** Doc + cross-links. 0 tests (doc-only).
- **Loop 1-3:** N/A.
- **Screenshot flow:** N/A.

### W48 — Sprint L IDEO + retrospective

- **Appraise:** Y3 H2 closes. IDEO covers Sprints J / K / L.
- **Plan:** Capture Sprint J / K / L screenshot flows + cross-flow comparison.
- **Build:** Final polish + 8 tests.
- **Loop 1-3:** standard.
- **Screenshot flow:** captured for IDEO.

**Cumulative tests:** ~2898.

---

## 17. W49-W52 — Year-3 close

### W49 — Final integration smoke + screenshot regression

- Run every captured screenshot flow against the current UI. Any drift → final polish or document.
- 8 tests.

### W50 — Y3 retrospective

- `docs/YEAR-3-RETROSPECTIVE.md` — full 52-week scorecard.
- Polish-week scoreboard: which features hit competitor-level, which need more work in Y4.
- RCA tally (target: 0 RCAs on main across all of Y3 — extending the streak from 45 weeks at start to ~97 weeks).
- 0 new tests; doc-only.

### W51 — Y4 plan kickoff

- `docs/YEAR-4-VIBECODE-PLAN.md` — detailed week-by-week.
- Y4 sequences founder-gated work: Sprint A real-mode wire-up; Sprint B Postgres + R2 + VAPID; Sprint C native distribution; Sprint D editorial; Sprint E V3 retune; Sprint F bilingual; Sprint G Pod V3; Sprint H recipe import V2; Sprint I bake-sale events; Sprint J skill tree; Sprint K creator economy + annual recap; Sprint L close.

### W52 — Year-3 close commit + final screenshot flow

- Capture the full app screenshot flow as the Y3 baseline for Y4 comparison.
- Final commit.

**Final test target:** ≥ 2900 by Y3 close. Y2 closed at 1988; Y3 adds ~900+ across the polish.

---

## 18. Founder-unlock dependencies (Y3 only — i.e., NONE)

**The defining property of Y3:** zero founder-unlock dependencies. Every week's work runs end-to-end without any external account, paid service, or hired team member. Every founder-gated capability moved to Y4 (see section 2 above).

Y3's only non-vibecode dependency is design-feedback from Stefan. That's not a blocker — it's the IDEO cadence.

---

## 19. Acceptance for Y3 (sprint-by-sprint)

Each sprint's IDEO confirms:

- [ ] **Sprint A:** Foundation tokens shipped, dark-mode design ready (not enabled), polish-backfill 4 of 4 closed.
- [ ] **Sprint B:** Today page passes a side-by-side compare against Mealime / Yummly / Plant Jammer at IDEO.
- [ ] **Sprint C:** Cook flow (Mission → Grab → Cook → Win) shipped at competitor-level; full screenshot flow captured.
- [ ] **Sprint D:** Pantry photo MVP works end-to-end in stub mode; user can scan-confirm-update without leaving the loop.
- [ ] **Sprint E:** Daily novelty card fires when score crosses threshold; FOMO-rejection passes; expanded card shows pantry coverage.
- [ ] **Sprint F:** Smart leftovers chip on win screen; one-tap accept writes to MealPlanWeek.
- [ ] **Sprint G:** Swipe planner runs full 7-right-swipe → calendar in <90 sec; reduced-motion fallback works.
- [ ] **Sprint H:** Path tab visually unified; ingredient color-coding consistent across surfaces.
- [ ] **Sprint I:** Community tab visually unified.
- [ ] **Sprint J:** Animation tokens shipped; reduced-motion audit clean.
- [ ] **Sprint K:** Empty / loading / error states standardised; WCAG 2.1 AA passing.
- [ ] **Sprint L:** Bundle audit clean (every route < 250KB initial JS); design-system docs filed.
- [ ] **W49-W52:** Final regression clean; Y4 plan filed.

Cumulative target: ~2900 tests, 0 RCAs on main streak extending from 45 to ~97 weeks.

---

## 20. Out-of-scope for Y3

Anything that requires:

- A founder-gated key / account / paid service → Y4
- A hired team member (translator, editorial, designer) → Y4 H/I
- Real production data accumulation → Y4 G (V3 retune)
- App store distribution → Y4 D/E
- Real money flow → Y4 B
- Multi-pod schema migration (depends on auth) → Y4 J

These appear in `docs/Y4-CARRYOVER.md` for the founder's reference (filed at Y3 W51 alongside the Y4 plan).

---

## 21. Process commitments (carried from Y2)

1. **Substrate-first.** Every founder-gated stub remains in stub mode through all of Y3. The substrate continues to compose; the surfaces continue to ship. Y4 turns the keys.
2. **0 RCAs on main.** 45-week streak at Y3 W2; target 97 weeks at Y3 close.
3. **Four-gate.** lint + typecheck + test + build green at every commit.
4. **Pure-helper-first.** Every new feature ships its data layer + helper layer + tests before any render layer.
5. **Critical-appraise → plan → build → improve.** Every week's work goes through the cycle in the per-week breakdowns.
6. **3x recursive testing.** Loop 1 stress + edge + Loop 2 RCA + Loop 3 polish on every feature.
7. **Per-feature screenshot flow.** Six PNGs per MVP feature: cold / mid / win / empty / error / reduced-motion (+ dark-mode once Y3 W3 lands).
8. **Bi-weekly IDEO reviews.** 24 IDEOs across the year.
9. **UX-recon discipline.** Per-sprint primary pattern named; framework continues to grow.
10. **Stanford content acquisition.** 1-2 hours/week.

---

## 22. Y3 in one sentence

**Y3 turns the substrate into a polished product so that when the founder turns the keys at Y4 W1, every surface they touch already feels like a category-leading app.**
