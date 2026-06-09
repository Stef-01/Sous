# Sous UI Overhaul — Sequenced Execution Plan

> Built by a 7-agent workflow (4 code-grounded designers → sequence → synthesize →
> adversarial review) and then **revised** to close the honesty/correctness gaps the
> review found. The corrections below are **binding** — they override anything later
> in the plan that conflicts.

## 0. Binding revisions from the adversarial review (read first)

These amend the phases that follow. They exist because the draft, while well-sequenced,
shipped two honesty gaps and a few correctness gaps.

**R1 (HIGH) — the "Educational / not clinician-reviewed" badge must be GLANCE-visible.**
The draft collapses all evidence cards (which carry the review-status badge) behind a
default-collapsed disclosure — so the glance could show a confident health headline with
the "unreviewed" signal hidden. Fix: render a compact **"Educational · not clinician-
reviewed"** status pill at glance level, co-located with the honesty chip, **whenever any
health framing (headline/facets) is shown** — never only behind the tap. Add a test:
_the glance renders the status badge whenever `sousRead` is non-null._ (Alternative,
also acceptable: condition-specific framing only appears once the Therapeutic lens is
explicitly chosen, so the Everyday default makes zero reviewable claims.)

**R2 (HIGH) — the synthesized headline is a COMPOSITION DESCRIPTOR, not a health verdict.**
`assertNoMedicalClaim` is a blocklist; it won't catch a well-formed sentence that
over-synthesizes an _estimate_ into an implied effect (e.g. phrasing the glycemic
heuristic as "a gentle effect on blood sugar"). Fix: the headline template bank is
restricted to **descriptive statements of what the food IS** ("plant-forward", "a good
source of protein") — **no effect/outcome verb is allowed in the headline**. All
glycemic/effect language lives in the deep-dive beside its grade label + hedge. Rename
internal copy so it never reads as "Sous's verdict on your health." Add an **adversarial
fixture set** (borderline, single-ingredient, and macro-vs-glycemic-disagreement dishes)
asserting the headline stays descriptive and never asserts an effect.

**R3 (MED) — reconcile the two synthesized voices.** `sousRead` (single-dish composition,
Phase 1) and `evaluatePlate().appraisal` (plate balance, Phase 6) answer _different_
questions; state that explicitly, route `evaluatePlate.appraisal` through the **same**
claim-contract test gate (it's currently un-gated user copy), and add a cross-surface test
that they never contradict on a shared dish.

**R4 (MED) — Phase 3 celebration must be idempotent.** Do not run side effects inside the
`setStore` updater (double-fires under StrictMode/concurrent). Compute the milestone purely
(return `next` + a pending-celebration descriptor); fire the toast + localStorage dedup in
a `useEffect` keyed on the committed store with a ref guard; localStorage is the single
source of truth checked before dispatch. Add a StrictMode double-invoke test (one toast).

**R5 (MED) — one owner for the Today no-scroll budget.** Phases 4, 5, and the first-run
coachmark each add Today vertical content. Phase 4 **owns** the 375×667 budget; add a
single integration checkpoint after Phases 4+5 asserting the craving CTA + tab bar are
visible without scrolling with the eating card populated, the card-peek present, and the
coachmark showing (Rule 10 is non-negotiable).

**R6 (MED) — moderate→amber is a claim-strength change, not a token refactor.** Phase 8
remaps "moderate" evidence from green to amber (the correct honesty fix). Pull it out as
its own line item with a decision-log entry (Rule 8) + an eyes-on confirmation that no
dish that read "strong/green" now reads misleadingly weak — not a silent snapshot diff.

**R7 (LOW) — ownership + drift guards.** `nutrition-ring-compact-prop` is a **hard
Phase-1 prerequisite** that must merge before Track B Phase 4 starts; `nutrition-ring-
card.tsx` is touched by 4 phases — serialize edits, single owner. Add
`src/lib/engine/dish-nutrition.ts` to Phase 1's imports (the canonical
`NUTRITION_COVERAGE_FLOOR`) and test that `sousRead` imports the constant rather than
hardcoding 0.7. Write the canonical streak-display inventory and pick **one** persistent
ambient home (Rule 13).

---

## 1. Thesis

The health and nutrition layer of Sous has accreted into a kitchen-sink Info sheet that dumps clinician-grade evidence cards, four un-synthesized micro-signals, and three competing quality-color languages onto a casual cook who just wants to know "is this good — log it." This overhaul resolves the two-audience collision (cook vs. clinician) by leading every health surface with one synthesized, hedged "Sous read" headline and collapsing the clinical depth one tap behind a disclosure; reuniting the logging reward with the moment of the tap (firstMilestone/streakMilestone are built and tested but wired to zero UI today); giving the product a "what did I eat today" home on the screen users open daily; and unifying the visual grammar so a single brand green means "tap to act" and a distinct sage means "this is good." It is delivered in ten phases across three parallelizable tracks, every item AUTO-BUILD, with the honesty contract (FOOD_FIRST_HEDGE + assertNoMedicalClaim + evidence-grade gating) preserved at every step.

## 2. Guiding principles (CLAUDE.md rules this overhaul honours)

- **Rule 2 — one primary action per screen**: the swiper Cook button dominates; Save/Pass recede to peer ghost circles; Log it stays the single CTA in the Info glance; the lens switcher is subordinate chrome.
- **Rule 6 + Rule 13 — simplicity-first / disclosure-on-demand**: every clinical module moves behind a tap; facets become icon+label pills with no redundant numbers; the Today eating card is a ring + count + one tap-through, never a second dashboard.
- **Rule 10 — no-scroll on 375×667**: the glance must reach Log it without scrolling (pin with `mt-auto`); the up-next banner must not push the skill tree below the fold; the lens switcher sits above the fold.
- **Rule 11 — current feature state (do not revert)**: no new tabs, no settings sprawl; the lens switcher is a view toggle, not a settings panel (Rule 3).
- **The honesty contract (the load-bearing constraint of this overhaul)**: FOOD_FIRST_HEDGE and the Educational/Reviewed/Clinician-review status badge stay co-located with any expanded effect-size card; the synthesized headline is computed only from nutrition macros and is lens-invariant; `assertNoMedicalClaim` gates every generated string; no view toggle can upgrade claim status. Everyday is the default floor.
- **Rule 12 — AUTO-BUILD classification**: every item below ships from this repo + existing tooling. There are no founder-gated items in this overhaul (see §5).

## 3. Phases

Effort key: **S** ≈ a few hours · **M** ≈ a day · **L** ≈ multi-day. All items are **AUTO-BUILD**.

---

### Phase 1 — Sous-read foundation + ambient honesty (Info de-clutter, part 1)

**Goal**: Stand up the pure synthesizer and the two zero-dependency primitives the whole Info-sheet overhaul imports, plus the safe `compact` prop on NutritionRingCard — without yet changing how the sheet renders.

**`sous-read-engine`** — _the synthesizer_ · **M** · AUTO-BUILD

- **Problem**: The sheet shows four independent micro-signals (Nutrient-dense badge, GlycemicPill, buried protein-completeness, "Built on" composition chips) with no synthesizing sentence. The user has to assemble the verdict themselves.
- **Solution**: New pure module `src/lib/nutrition/sous-read.ts` exporting `sousRead(nutrition, foodGroups): SousRead | null`. Reuses the existing scorers verbatim — `nutrientDensity`/`isNutrientDense`, `proteinQuality`, `estimateGlycemicLoad` — plus a tiny shared `foodGroupRoles(foodGroups)` helper factored out of `plan-balance.ts` (PROTEIN_GROUPS / hasVegetable / hasProtein) so the two can't drift. Output: `{ headline, facets[] }` — one hedged sentence from a fixed claim-safe template bank, plus 2–4 short facet pills. Returns `null` below `NUTRITION_COVERAGE_FLOOR` so no verdict is fabricated.
- **Touches**: `src/lib/nutrition/sous-read.ts` (new), `nutrient-density.ts`, `protein-quality.ts`, `glycemic.ts`, `plan-balance.ts` (extract `foodGroupRoles`), `claim-contract.ts` (test gate), `sous-read.test.ts` (new).
- **Risk**: Template assembly drifting into implied medical claims. Mitigate with a small fixed template bank, report-blessed stems only ("gentle effect on", "a good source of"), and routing every output through `assertNoMedicalClaim` in tests. The coverage-floor null gate guards over-synthesis of thin data.
- **Verify**: `pnpm test src/lib/nutrition/sous-read.test.ts` — leafy veg → nutrient-dense + plant-forward + low-glycemic headline; fried/white-rice → no nutrient-dense facet + higher-carb headline; full fixture sweep of all seeded dishes passes `assertNoMedicalClaim`; `null` below floor. `pnpm lint`.

**`honesty-chip`** — _persistent ambient hedge_ · **S** · AUTO-BUILD

- **Problem**: The honesty signal is a 10.5px faint paragraph at the very bottom of the panel — easy to scroll past, and once the evidence layer collapses behind a tap, a glance could show health framing with the hedge out of view.
- **Solution**: New `src/components/shared/honesty-chip.tsx` rendering the single `FOOD_FIRST_HEDGE` constant as a persistent, low-emphasis pill pinned at the top of the glance (under the drag handle / first child of MealHealthPanel). Neutral styling, **not** green (it's a caveat). Single source of truth — imports the constant so copy can't drift. Replaces the bottom paragraph.
- **Touches**: `src/components/shared/honesty-chip.tsx` (new), `claim-contract.ts` (reuse), `meal-health-panel.tsx` (mount at top, remove bottom paragraph).
- **Risk**: A pill can read as dismissible chrome. Keep it visually present but neutral; never conditionally hide it whenever any health framing shows.
- **Verify**: Chip visible in the glance before any tap; assert rendered text `=== FOOD_FIRST_HEDGE`; old bottom paragraph gone; legible at 375px without scroll.

**`nutrition-ring-compact-prop`** — _ring + legend only_ · **S** · AUTO-BUILD

- **Problem**: The glance needs just the energy ring + macro legend, but NutritionRingCard is monolithic — always renders Daily-targets bars, Key-nutrients grid, the Complete-nutrient expand, and the footnote.
- **Solution**: Add optional `compact?: boolean`. When true: render only the energy-summary block (MacroRing + legend), servings sub-line, and source footnote; skip Daily-targets, Key-nutrients, and the Complete expand. Default `false` keeps every existing call site byte-identical. The inline Nutrient-dense badge is removed (SousReadCard owns that facet) — verify no other consumer depends on it standalone.
- **Touches**: `nutrition-ring-card.tsx` (add prop, gate 3 blocks).
- **Risk**: Other call sites (cook flow, side-pairing, diary, daily-nutrition-card, meal-health-panel) must keep the full view — `grep` all usages first; default-false guarantees it.
- **Verify**: `grep` all usages; render with and without `compact`; full view byte-identical for existing callers. `pnpm build` + `pnpm test`.

**Ships**: A tested, claim-safe `sousRead()` synthesizer, a reusable honesty chip, and a compact ring mode. **User-visible surface unchanged** — the new primitives aren't mounted yet; this ships as a green build with new tests passing, the safe substrate for Phase 2.

---

### Phase 2 — Info sheet Glance/Deep-dive split (the appraisal's #1 recommendation)

**Goal**: Deliver the casual-cook glance (synthesized headline + facet pills + ring + Log it) with all clinician-grade evidence collapsed one tap behind "Evidence & full nutrition."

**`sous-read-card`** — _the glance headline component_ · **S** · AUTO-BUILD · depends on `sous-read-engine`

- **Problem**: There's no surface that presents the verdict at a casual glance. The ring is a full clinical breakdown; the headline has nowhere to live.
- **Solution**: New presentational `src/components/shared/sous-read-card.tsx`, props `{ nutrition, foodGroups, className }`. Calls `sousRead(...)`; renders nothing if null. The hedged sentence in nourish-dark ~15px, then one row of facet pills reusing the **exact** existing pill styling (WholeFoodComposition green-tint chip). No numbers beside pills (Rule 13d). Deliberately tiny — droppable later into the Win screen and side-pairing detail.
- **Touches**: `sous-read-card.tsx` (new), `meal-health-panel.tsx` (reuse pill classes), `nutrition-ring-card.tsx` (reuse chip class).
- **Risk**: Green overload (F4). Until the quality-grammar work (Phase 8) lands, keep facet pills on the existing green-tint token — do not invent a new shade.
- **Verify**: Render with a dense-veg fixture and a refined-carb fixture; one sentence + 2–4 pills, no numbers, null on thin coverage; sentence wraps to ≤2 lines at 375px.

**`glance-deepdive-split`** — _restructure MealHealthPanel_ · **M** · AUTO-BUILD · depends on `sous-read-card`, `honesty-chip`

- **Problem**: MealHealthPanel stacks ~10 modules in fixed order (food-first header, composition, per-condition effect-size cards, ring, glycemic, bioavailability, ayurvedic, ingredients-to-check, dietary profile, log/share, hedge prose). A user who wants "is this good, log it" wades through GRADE/effect-size cards.
- **Solution**: Two render groups inside the same component (no new sheet, no routing change). **GLANCE** (always visible): SousReadCard headline+facets → NutritionRingCard in `compact` mode → one BioavailabilityTip → the Log it + Share row (lifted out of NutritionSnapshot, pinned at the glance bottom). **DEEP-DIVE** (behind one "Evidence & full nutrition" disclosure, collapsed): per-condition EvidenceRowItem list + PersonalizedSubhead + status badge, GlycemicPill, AyurvedicDishNote, IngredientsToCheck, DietaryProfile, and the full ring breakdown. The disclosure reuses the existing `showAll` ChevronDown-rotate pattern. **Nothing is deleted** — clinical depth is one tap away.
- **Touches**: `meal-health-panel.tsx` (restructure), `nutrition-ring-card.tsx` (`compact`), `sous-read-card.tsx`, `glycemic-pill.tsx`, `ayurvedic-dish-note.tsx`, `ingredients-to-check.tsx`, `dietary-profile.tsx`, `log-it-button.tsx`.
- **Risk** (the honesty contract): pushing evidence rows behind a tap must keep the reviewed/clinicianReview personalization gating AND the hedge co-located with those rows **when expanded** — never an effect-size card without its grade label and hedge in the same view. FOOD_FIRST_HEDGE renders both as the ambient chip and inside the expanded deep-dive header (which is exactly why `honesty-chip` shipped first). Second risk: Rule 10 — pin Log/Share with `mt-auto` so the glance fits the sheet's 68% height without scroll.
- **Verify**: Open the Info sheet — glance shows ring + headline + facets + Log it, no effect-size cards or target bars; Log it reachable without scrolling at 375×667. Tap "Evidence & full nutrition" → effect-size cards, glycemic, full breakdown appear, each evidence card still carries its grade label + hedge. `pnpm test` (registry-guard + new hedge-presence test) + `pnpm build`.

**Ships**: Opening the Info sheet leads with the energy ring + one hedged sentence + facet pills + ambient honesty chip + Log it, reachable without scrolling at 375×667; every clinical module is intact one tap behind a single disclosure. **The two-audience collision is resolved.**

---

### Phase 3 — Logging unification + streak-at-the-tap

**Goal**: Every logging surface fires the same earned-moment celebration at the moment of the tap, on one LogItButton primitive with one copy/state/haptic — wiring firstMilestone/streakMilestone (today dead code) into the actual write path.

**`log-engine-streak-at-log`** — _celebration in the write path_ · **M** · AUTO-BUILD · no deps

- **Problem**: The streak milestone only fires when the user **visits** the diary page (an effect that reads `history.streak` and pushes a toast). Logging from the Info sheet, cook readout, or quick-add produces a flat success toast and zero celebration. `firstMilestone()` is fully implemented + unit-tested but wired into no UI — "First meal logged" / "First cook done" never fire anywhere. The win is computed at a passive page view, not the active tap.
- **Solution**: Make the diary hook the single celebration authority. In `use-nutrition-diary.ts`, add a pure `celebrateForLog(prevStore, nextStore, today)` that runs inside `logCook`/`logBranded` after `write()`: compute lifetime log/cook counts for `firstMilestone(...)`, recompute `loggingStreak(...)` for `streakMilestone()`, and for any non-null milestone not already in localStorage (reuse the existing `sous-celebrated-${id}` dedup key) push an `achievement` toast and set the flag. Then **delete** the now-duplicate celebration effect from `diary/page.tsx` — the hook owns it.
- **Touches**: `use-nutrition-diary.ts`, `milestones.ts`, `diary/page.tsx`, `use-toast.ts`.
- **Risk**: Must fire exactly once per milestone, never on a duplicate render. Key purely off the localStorage flag; compute inside the `setStore` updater so it sees the committed next store. `logCook` runs in a setState updater — push the toast/localStorage write in `queueMicrotask` after commit to avoid setState-in-render warnings.
- **Verify**: Unit — fresh store, `logCook` once → `firstMilestone('cook')` toast queued; 3 consecutive days → streak-3 toast once, second render silent. Manual 375×667 — first-ever "Log it" → "First meal logged" toast immediately (not only after navigating to Path); diary page no longer double-fires.

**`log-unify-primitive`** — _one LogItButton_ · **M** · AUTO-BUILD · depends on `log-engine-streak-at-log`

- **Problem**: Logging is fragmented into five divergent surfaces, each re-implementing the same write: log-it-button (green pill), cook-nutrition-readout (a different full-width tinted button, different copy, different toast "See it on the Path tab"), text-quick-log match chips, branded-food-search, diary quick-add recents. Three button shapes, three copy variants, two toast bodies, two "already logged" computations. No single mental model of "logging."
- **Solution**: Promote LogItButton to the canonical control. Add `variant?: 'pill' | 'block'` (block = the cook-readout full-width style) and keep `servings`. Move "already logged today" detection into LogItButton. Standardise one toast (`Logged {name} · in today's diary`, dedupKey `log-${slug}`); drop the "Path tab" string. Rewire cook-nutrition-readout to `<LogItButton variant='block' />`; align text-quick-log and diary quick-add to LogItButton's chip classes. Keep branded-food-search on `logBranded` (carries embedded nutrition) — align styling only, not the write path.
- **Touches**: `log-it-button.tsx`, `cook-nutrition-readout.tsx`, `text-quick-log.tsx`, `diary/page.tsx`, `branded-food-search.tsx`.
- **Risk**: The cook readout's block button carries the serving-slider value — keep passing `servings` through (regression risk on the W42 serving-size feature). Branded stays on `logBranded`. Rule 2: the block variant stays visually subordinate to a screen's primary CTA.
- **Verify**: `pnpm build` + `pnpm test`. Log the same dish from Info, cook readout, diary quick-add → identical states, toast copy, haptic. Serving slider at 2 → diary entry shows ×2. Branded still logs with its brand label. `grep` confirms no remaining "Add to today's nutrition" string.

**Ships**: Logging from the Info sheet, cook readout, quick-add, text-log, or branded search produces an identical button, identical "Logged … · in today's diary" toast, identical state and haptic — and the first-ever log/cook fires a real achievement toast at the tap. **The reward is reunited with the action.**

> Track note: Phase 3 is fully independent of Phases 1–2 and can run in parallel by a second agent.

---

### Phase 4 — Diary becomes the Today home + first-win choreography

**Goal**: Give the product a "what did I eat today" home on the screen users open daily, eliminate the duplicate daily-eating representation on Path, and sequence the canonical first-win arc.

**`diary-today-home`** — _glanceable Today eating card_ · **M** · AUTO-BUILD · depends on `log-engine-streak-at-log`, `nutrition-ring-compact-prop`

- **Problem**: There is no "what did I eat today" home. The diary lives only at `/path/diary`, reachable solely through Path's "Your kitchen" grid which is collapsed by default — two taps and a disclosure behind the home screen. The core feedback loop is invisible on the screen users open every day.
- **Solution**: Add a compact `TodayEatingCard` on Today, below the QuestCard hero and above "More options" (after WhosAtTable). Conditional and quiet: renders nothing when `entries.length === 0` (empty state owned by first-run-choreography); once anything is logged, a `compact` NutritionRingCard (ring + kcal + one-line legend) + the count ("3 logged today") + a tap-through to `/path/diary`. Driven entirely off the already-imported `useNutritionDiary()` (`dayNutrition` is already memoised for deficits — zero new fetch).
- **Touches**: `today-eating-card.tsx` (new, ~50 lines), `today/page.tsx`, `nutrition-ring-card.tsx` (`compact`).
- **Risk**: Rule 10 — keep it strictly conditional (only after ≥1 log) and compact (~96px), placed below the hero so the craving CTA + QuestCard stay above the fold. Rule 6 — cap at ring + count + one tap-through, no inline targets/micros. F4 — the ring uses the `--data-*` macro palette, not `--nourish-green`.
- **Verify**: 375×667 — empty diary → card absent, craving CTA above fold; log one dish → card appears with filled ring + "1 logged today", tap → `/path/diary`; the compact ring shows no Daily targets / Key nutrients / Complete summary; no extra network call.

**`diary-as-journey-link`** — _demote the duplicate on Path_ · **S** · AUTO-BUILD · depends on `diary-today-home`

- **Problem**: With the diary promoted to Today, Path's DailyNutritionCard now duplicates it — two "today's nutrition" representations of one queue. Path should be the journey/history view, not a second daily-eating home.
- **Solution**: Clarify the split — Today = today's plate (live), Path = the longer arc. Remove DailyNutritionCard from `path/page.tsx` (leaving WeeklyTrendCard + Hydration as the journey signals), keeping the "Diary" tile in the "Your kitchen" grid as the editable full-day entry (no longer the only door). The minimal, surgical half of T1d.
- **Touches**: `path/page.tsx`, `daily-nutrition-card.tsx`.
- **Risk**: Don't strand the editable day view — `/path/diary` must remain reachable (keep the grid tile) since the compact Today card is read-only by design. Leave a code comment pointing at TodayEatingCard as the canonical daily surface so the Path-as-journey cluster doesn't re-add it.
- **Verify**: After logging — Today shows the eating card; Path no longer shows a duplicate "Today's nutrition" ring but keeps WeeklyTrend/Hydration; `/path/diary` still opens the editable list and remove-with-undo works; no dead link.

**`first-run-choreography`** — _the first win as invitation_ · **M** · AUTO-BUILD · depends on `diary-today-home`, `log-engine-streak-at-log`

- **Problem**: First run is dead-ends: the quiz auto-opens once, then the user lands on a generic queue, a 0-day streak with no "start your streak" affordance, an empty diary with a terse "Nothing logged yet today," and a Path launcher grid. The aha (logging closes a ring + lights a streak) is never staged.
- **Solution**: A lightweight, localStorage-gated thread that **reuses existing components**, no onboarding engine. (1) Empty-diary-as-invitation: replace the bare empty line with one warm card — a ghost/dashed compact ring + "Cook or log your first dish to start today's plate" + one primary action that opens the Today craving search. (2) Zero-streak: the first-log toast from `log-engine-streak-at-log` already supplies the "streak started" moment. (3) One dismissible, self-clearing coachmark on Today after quiz-close ("Search a craving to cook your first dish →"), under a `sous-firstrun-seen` flag. The arc: quiz → craving highlight → first cook (`firstMilestone('cook')`) → first log (`firstMilestone('log')` + streak) → TodayEatingCard ring appears.
- **Touches**: `diary/page.tsx`, `today-eating-card.tsx`, `today/page.tsx`, `streak-counter.tsx`, `milestones.ts`.
- **Risk**: Over-engineering into a tutorial. Cap strictly to empty-state copy + one coachmark + the toasts that already exist; the coachmark is one line, dismissible, self-clearing. Rule 2 — the invitation's primary action **is** "open craving search," so it points at the existing primary, not a rival.
- **Verify**: Clear `sous-*` keys → Today loads, quiz opens; close → one-line coachmark; complete a cook → "First cook done!"; log → "First meal logged" + streak chip shows 1 + TodayEatingCard ring appears; reload → coachmark gone, no re-celebration. Empty diary shows the invitation card with exactly one primary action. 375×667 no-scroll holds throughout.

**Ships**: Today shows a compact "your plate today" ring once anything is logged (empty state is a warm one-action invitation, not a void); Path stops duplicating it and keeps WeeklyTrend/Hydration as the journey view; a fresh user is walked pick-craving → cook → log → see-the-loop-close with first-cook/first-log toasts and a self-clearing coachmark.

---

### Phase 5 — Queue de-duplication + swiper CTA hierarchy

**Goal**: Collapse the two confusing meal-queue representations into one unmistakable "tap to browse the deck" affordance and re-weight the fullscreen swiper so Cook is the single dominant action.

> Both items edit `quest-card.tsx` — serialize them against each other; run the pair parallel to Tracks A and B.

**`queue-dedup-affordance`** — _one clear door to the deck_ · **S** · AUTO-BUILD · no deps

- **Problem**: Two representations of the same queue with an unclear relationship. QuestCard's inline MealQueuePreview opens the fullscreen MealSwipeQueueOverlay via a 40px glass Maximize2 circle that's easy to miss and reads as "fullscreen this image," not "this is the front of a swipeable deck." The section label and meta line duplicate what the fullscreen card shows again.
- **Solution**: Keep one inline card, make it unmistakably the door to the deck: (1) replace the Maximize2 glass circle with a bottom-overlaid pill reading "Browse N meals" (from `queueDishes.length`) in the existing white/92 pill style + a fanned-card / chevron glyph. (2) Add a 2–3px peek of a second card behind the hero (an `aria-hidden` rotated/scaled sibling div, no image, zero network cost). (3) Keep the whole card as the open target; drop the floating circle. One object, one obvious action.
- **Touches**: `quest-card.tsx` (MealQueuePreview only).
- **Risk**: The deck-peek div must not break the aspect-square crop or the priority-image LCP — keep it purely decorative. Bind the count to `queueDishes.length` (not the constant `QUEUE_SIZE`) so it stays truthful when filters shrink the queue.
- **Verify**: 375×667 — inline card shows a "Browse N meals" pill + card-peek; tapping anywhere opens the swiper; shrink the queue with a filter → count updates; no Maximize2 circle remains; CTA + tab bar visible without scroll.

**`swiper-cta-hierarchy`** — _Cook dominates_ · **S** · AUTO-BUILD · no deps

- **Problem**: In MealSwipeQueueOverlay the bottom bar packs Pass + Save + Cook + title + meta + a floating Info pill into ~180px. Save renders as a full-height outlined pill with a "Save" label, reading nearly as loud as Cook — a borderline Rule-2 violation (two near-equal CTAs).
- **Solution**: Re-weight to one dominant action: (1) demote Save to an icon-only 52px circle matching Pass (heart icon, no label) — a peer of Pass. (2) Change the grid from `[52px_0.9fr_1.2fr]` to `[52px_52px_1fr]` so Cook spans the freed width as the single solid-white dominant pill. (3) Keep the saved state as a pink heart fill on the now-icon-only circle. (4) Keep the Info pill as the single ambient secondary. Result: Pass · Save (ghost circles) · Cook (solid, wide).
- **Touches**: `quest-card.tsx` (MealSwipeQueueOverlay bottom bar only).
- **Risk**: Icon-only Save lowers save discoverability — keep the `aria-label`, the `s` keyboard shortcut, and the pink-fill confirmation. Both Save and Cook keep ≥44px touch targets (they're 52px).
- **Verify**: 375×667 — two equal ghost circles (Pass, Save) + one wide solid Cook; squint test — only Cook pops; tap Save toggles pink-fill + haptic; `s` still saves; Cook still routes via `onCookDish`.

**Ships**: The inline meal card shows a "Browse N meals" pill + a card-peek telegraphing a swipeable deck (no orphan Maximize2 circle); inside the swiper, Pass and Save are equal ghost circles and Cook is the single wide solid primary — **one unambiguous action per surface**.

---

### Phase 6 — Live plate ring on the search result stack

**Goal**: Surface the already-computed plate evaluation as a live "your plate" ring + synthesized one-liner above the Cook CTA, replacing the buried "Evaluate plate" button.

**`plate-ring-result-stack`** — _one composed verdict for main+sides_ · **M** · AUTO-BUILD · depends on `queue-dedup-affordance`

- **Problem**: ResultStack already runs `evaluatePlate()` on the live selection (status / appraisal / categoryCoverage / oneBestMove, deterministic) but only surfaces it as a thin secondary "Evaluate plate – Balanced" button that opens a sheet. There's no at-a-glance composed signal that updates as you select/deselect/reroll sides; the veg/protein/carb coverage is computed and thrown away on the main screen.
- **Solution**: Add a compact "Your plate" ring strip directly above the sticky Cook CTA, driven by the already-computed `evaluation`. The ring reuses MadeItRing's `ringMetrics()` (export-and-reuse, no duplicated arc math): count = covered food groups 0..3, target = 3; three coverage dots as labelled mini-pills, colour-tied to `appraisalTone` via the existing `toneColor` map. To its right, the synthesized one-liner = `evaluation.appraisal` (the 5–10 word honest headline). Tapping opens the **same** EvaluateSheet that exists today. Delete the standalone "Evaluate plate" button — the ring is the entry now. Re-renders live because `evaluation` is a `useMemo` on `selectedSides`.
- **Touches**: `result-stack.tsx`, `plate-ring.tsx` (new), `made-it-ring.tsx` (export `ringMetrics`), `EvaluateSheet.tsx`.
- **Risk** (honesty): must NOT read as a clinical grade — show the qualitative appraisal sentence, never a percentage or letter; the ring encodes a 0/1/2/3 food-group **count**, not a quality score. Coordinate green with the quality-grammar work (Phase 8). Collapse gracefully when `selectedSides` is empty (`evaluation === null` → render nothing, never a 0/3 "failing" ring on first paint).
- **Verify**: Run a search, pick sides — 3/3 + "Balanced plate" for a complete plate; deselect the protein side → 2/3 + a "good_start"/"needs-work" line live; tap → existing EvaluateSheet with alreadyWorking + one best move; old "Evaluate plate" button gone; zero sides → no ring; no numeric/grade printed anywhere.

**Ships**: Picking sides shows a live ring (food groups covered) + the honest appraisal sentence that updates instantly as sides change; tapping opens the existing EvaluateSheet. **No numeric or letter grade appears anywhere.**

---

### Phase 7 — Path as a journey with momentum

**Goal**: Reframe Path's top from a static map into a path with forward motion — a slim "Up next" action banner that names the next skill and carries the live streak.

**`path-journey-momentum`** — _"Up next" banner_ · **M** · AUTO-BUILD · no deps

- **Problem**: Path reads as a tools drawer. The SkillTree is already the hero and "Your kitchen" is already collapsed (good), but the page opens cold — Level/XP/badges chrome + a static tree with no single "here is your next step, tap to act" line. The active node is the implicit "what's next" but nothing names it.
- **Solution**: Insert a slim "Up next" banner between PathHeader and SkillTree, derived deterministically from `nodesWithStatus`: the first `active` node else the first `unlocked` — SkillIcon + name + a one-line "next step" label + chevron, as one full-width button calling the existing `handleNodeTap(node.id)` (opening SkillDetailSheet). One button with a label (Rule 13), not a paragraph, not a second map — it shares the exact tap handler, so there's one source of truth.
- **Touches**: `path/page.tsx`, `up-next-banner.tsx` (new), `skill-detail-sheet.tsx`.
- **Risk**: Re-introducing the "duplicate of the active node" the existing code comment deliberately avoided — make it visually a thin action banner (not a tree-node card) and share `handleNodeTap`. Rule 10 — keep it to a single ~56px row; render only when an `active` node exists (a brand-new user falls back to the first foundation node or renders nothing) so the tree never drops below the fold.
- **Verify**: Open Path with progress — the banner names the active skill, tapping opens the same SkillDetailSheet as the tree node; with zero progress it points at the first foundation skill (or hides) and the tree stays visible without scrolling at 375×667; no second tree/map introduced.

**`path-streak-at-log`** — _ambient streak readout_ · **S** · AUTO-BUILD · depends on `path-journey-momentum`

- **Problem**: Forward momentum (streak) lives only inside the demoted "Your journey" card, and celebration only fires on diary visit. Path's top has no live "you're on a roll" signal tied to the journey.
- **Solution**: When `stats.currentStreak >= 1`, show a flame + "N-day streak" right-aligned inside the up-next-banner, so one row carries both "next step" and "current streak." Pull `currentStreak` from the `useCookSessions().stats` already destructured in `path/page.tsx`. **No new celebration here** (that's owned by `log-engine-streak-at-log`) — purely the persistent ambient readout. Icon + number pill, no prose.
- **Touches**: `up-next-banner.tsx`, `path/page.tsx`.
- **Risk**: Don't double-print the streak — PathHeader deliberately omits it. Putting it in the banner means JourneySummary below also shows day-streak. Resolve by making the banner the single live momentum readout and hiding JourneySummary's streak stat when the banner shows it; document the choice in a code comment (Rule 13 regression guard).
- **Verify**: With a 3-day streak the banner shows a flame + "3-day streak" alongside the next-step label; the streak number is not duplicated in two visible places at once; with 0 streak the pill is absent.

**Ships**: Opening Path leads with a single "Up next" banner naming the active skill (tap = same SkillDetailSheet as the tree node) with the current streak flame right-aligned; the journey reads as forward motion you're protecting — with the streak printed in exactly one place.

> Track note: Phase 7 is independent of the Info/diary/queue clusters; it only needs Track B's logging in place for the streak to be meaningful.

---

### Phase 8 — Unified quality grammar: tokens + primitive + migration

**Goal**: Replace the 3–4 hand-redeclared quality-color languages with one EvidenceTier token ramp + `<EvidenceTierBadge>`, and migrate every evidence/strength surface onto it (keeping directional glycemic deliberately separate).

**`grammar-tier-token`** — _the keystone_ · **S** · AUTO-BUILD · no deps

- **Problem**: The same three-state quality grammar (good/some/limited) is hand-redeclared as raw Tailwind strings in ≥4 files (meal-health-panel, ayurvedic-mode-section, ayurvedic-dish-note, glycemic-pill), with no single source of truth — `high` is green-at-12% in one place and `strong` is the same token elsewhere, while glycemic adds a fourth color (orange-100). They have already partly drifted (amber-700 vs -800 vs -500).
- **Solution**: Add three semantic CSS tokens to `globals.css` `:root` and `[data-theme=dark]` under an "Evidence-tier ramp — the ONLY colours allowed for evidence/quality strength" comment: `--tier-strong[-bg]`, `--tier-moderate[-bg]`, `--tier-limited[-bg]` (strong→sage green distinct from CTA green, moderate→amber, limited→neutral). Create `src/components/shared/evidence-tier.tsx` exporting a `TIER` record keyed on `EvidenceTier = 'strong' | 'moderate' | 'limited'`, an `<EvidenceTierBadge>` wrapping MetaPill-style markup, and pure mappers `gradeToTier` (high→strong, moderate→**moderate**, low/very-low→limited) and `strengthToTier`. Reuse the existing MetaPill chip shape.
- **Touches**: `globals.css`, `evidence-tier.tsx` (new), `meta-pill.tsx`, `evidence-card.ts`.
- **Risk**: Today's `strongGrade = grade === 'high' || grade === 'moderate'` collapses moderate into green; `gradeToTier` keeps moderate as amber — more honest, but it visibly changes which rows look "strong." This is the intended honesty correction; snapshot-review it so it's deliberate, not a regression.
- **Verify**: Unit — `gradeToTier('high')==='strong'`, `('moderate')==='moderate'`, `('low')==='limited'`, `('very-low')==='limited'`; `strengthToTier` round-trips. Visual — one high/moderate/low row + glycemic + an ayurvedic herb show exactly three swatch colors (no orange, no second amber). `grep` for `bg-amber-100|orange-100|nourish-green)/12` in the four files returns zero after migration.

**`grammar-migrate-surfaces`** — _rewire every surface_ · **M** · AUTO-BUILD · depends on `grammar-tier-token`

- **Problem**: The four surfaces keep their bespoke markup until rewired. Glycemic uses a non-conforming directional scale (low=good → high=bad) that cannot map 1:1 onto an evidence tier where strong=good.
- **Solution**: (1) meal-health-panel EvidenceRowItem → `<EvidenceTierBadge tier={gradeToTier(row.grade)} label={row.gradeLabel} />`; the Reviewed/Educational/Clinician-review badge gets its **own** status variant (orthogonal to evidence tier — do not fold it into the union) reusing MetaPill geometry. (2) ayurvedic-mode-section + ayurvedic-dish-note → delete duplicated STRENGTH records, import shared TIER via `strengthToTier`. (3) glycemic-pill → keep it **off** the evidence-tier scale: render directionally (e.g. "Glycemic load Low/Medium/High" in `--nourish-subtext` with one `tier-strong` dot only when `band==='low'`), documenting in the evidence-tier header **why** glycemic is excluded.
- **Touches**: `meal-health-panel.tsx`, `ayurvedic-mode-section.tsx`, `ayurvedic-dish-note.tsx`, `glycemic-pill.tsx`.
- **Risk**: Glycemic is the trap — naively mapping its band onto the tier makes "high glycemic" render in the same amber as "moderate evidence," conflating a warning with a strength. Mitigate with the header comment + a test asserting glycemic does not import EvidenceTierBadge.
- **Verify**: `pnpm test` (existing snapshots updated, not broken). Toggle Ayurvedic on a turmeric dish — herb strength badge is pixel-identical to the evidence-row grade badge of the same tier; the Reviewed badge and a "high" evidence badge are visually distinguishable (status vs tier families). `grep` for `bg-amber-100`, `bg-orange-100`, `neutral-100 text-neutral-500`, `nourish-green)/12` in evidence/strength context returns zero.

**Ships**: Every evidence badge, ayurvedic herb-strength chip, and review-status badge speaks one three-tier grammar from a single token source; glycemic stays directional and visually distinct so "high glycemic = bad" can't be confused with "strong evidence = good." **Four drifting color languages collapse to one.**

> Sequenced after Phase 2 so the migration touches modules already relocated into the deep-dive, not markup Phase 2 just moved.

---

### Phase 9 — Green de-load: reserve brand green for actions

**Goal**: Repoint every quality/strength green onto the distinct sage `tier-strong`, leaving solid brand green exclusively for primary actions (Cook, Log it).

**`green-deload`** · **M** · AUTO-BUILD · depends on `grammar-tier-token`

- **Problem**: F4 core: solid `--nourish-green` is the Cook/Log CTA **and** tinted green-at-8–12% is "good evidence," "strong grade," "low glycemic," "nutrient-dense," "matched to your focus," and the Ayurvedic toggle. The brand's one action color does quadruple duty as a quality color. The smoking gun: LogItButton's logged state `bg-[var(--nourish-green)]/12` is the **exact** token used for "Good evidence" — the CTA's resting state and an evidence verdict are the same pixel.
- **Solution**: One rule, enforced via `globals.css` comments: solid `--nourish-green` / `--nourish-button` is for **primary actions only** (Cook, Log it primary, the Ayurvedic toggle "on" track is borderline-acceptable as an action). All quality/strength signaling uses `--tier-strong`, set to a perceptibly distinct **sage / desaturated green** (e.g. `#4a8c5c` / the `--nourish-light-green` family) so "good" reads as a calm positive, not a button. Concretely: repoint the Nutrient-dense chip and over-target NutrientBar fill in nutrition-ring-card, PersonalizedSubhead's green, and the food-first header label off `--nourish-green` onto `--tier-strong` (or `--nourish-subtext` for the section label). **Leave LogItButton's solid-green action state alone** — that's what we're protecting. **Do not touch the `--data-*` macro arcs** (carb terracotta / protein blue / fat gold) — a separate legitimate ramp; the over-target bar fill is the only green in that card to repoint.
- **Touches**: `globals.css`, `nutrition-ring-card.tsx`, `meal-health-panel.tsx`, `log-it-button.tsx`.
- **Risk**: Over-correction — too-close sage changes nothing, too-far fragments the palette. Needs a **real eyes-on, on-device pass**, not just token math. Risk of desaturating a genuine CTA if the `grep` is sloppy.
- **Verify**: Side-by-side device screenshot of the Info sheet — the only solid-green elements are Log it and the lens toggle; every verdict (evidence badges, nutrient-dense, over-target bars, matched-to-focus) is the distinct sage `tier-strong`. Contrast-check `tier-strong-fg` on `tier-strong-bg` clears WCAG AA. CTA green and tier green are nameably different when shown adjacent.

**Ships**: On the Info sheet the only solid-green elements are Log it and the lens toggle; every verdict is the calm sage `tier-strong` — a user can finally tell "tap this to act" from "this is a good thing." Contrast clears AA.

> Can start the moment `grammar-tier-token` lands, overlapping `grammar-migrate-surfaces`. Isolated for its own eyes-on + contrast pass so it doesn't block the migration from shipping.

---

### Phase 10 — Lens switcher + honesty guard (Everyday default)

**Goal**: Add one segmented Everyday · Therapeutic · Ayurvedic view toggle that separates the casual-cook and clinician audiences, defaulting to Everyday, with a test layer proving the lens can never upgrade claim status.

**`lens-switcher`** — _one segmented control_ · **L** · AUTO-BUILD · depends on `grammar-migrate-surfaces`

- **Problem**: Two reading lenses are wired independently and invisibly. The Ayurvedic lens is a localStorage toggle buried in the Profile sheet; the therapeutic lens is driven by env feature-flags + the user's `conditions` care-profile (evidence rows + "matched to your focus"). A casual cook gets both layers dumped on the Info sheet at once with no way to say "I just want the everyday view," and no single place names which lens is active.
- **Solution**: A single segmented control at the top of the Info sheet body, above WholeFoodComposition: `[ Everyday | Therapeutic | Ayurvedic ]`, reusing the existing side-count segmented-control shape. Promote the Ayurvedic localStorage hook into a unified `useHealthLens()` (`src/lib/hooks/use-health-lens.ts`, key `sous-health-lens-v1`, values `everyday|therapeutic|ayurvedic`); `useAyurvedicMode` becomes a thin derived selector (`lens === 'ayurvedic'`). Behavior: **everyday** → WholeFoodComposition + NutritionSnapshot + the synthesized headline + Log/Save only, hide evidence rows and the herb note; **therapeutic** → current behavior, gated exactly as today by reviewed/clinicianReview; **ayurvedic** → herb notes. The lens never fabricates personalization. Default **must** be `everyday`.
- **Touches**: `meal-health-panel.tsx`, `use-health-lens.ts` (new), `use-ayurvedic-mode.ts`, `ayurvedic-mode-section.tsx`, `ayurvedic-dish-note.tsx`.
- **Risk**: Rule 3 (no settings sprawl) — frame it as a **view toggle** (like side-count), not a settings panel; one control, no sub-options. Rule 2 — subordinate chrome, never competing with Log it. SSR hydration — preserve the existing `useAyurvedicMode` mounted-guard or the sheet flashes the wrong lens. Default `everyday` so first-run casual users aren't dropped into the clinical view.
- **Verify**: Unit — `useHealthLens` default `'everyday'`, persists across reload, `useAyurvedicMode` derives correctly. E2E (Playwright) — open Info on a turmeric dish, default shows no evidence rows + no herb note; Therapeutic → evidence rows (still Educational unless env-approved); Ayurvedic → herb note, evidence rows hide. FOOD_FIRST_HEDGE present in all three. Switcher above the fold at 375×667, Log it remains dominant.

**`lens-default-honesty`** — _the guardrail_ · **S** · AUTO-BUILD · depends on `lens-switcher`

- **Problem**: Splitting into lenses creates a new honesty risk: a future edit could make "Therapeutic lens" imply reviewed evidence, or let Ayurvedic claims bleed into the everyday headline. The claim contract must remain the single arbiter regardless of lens.
- **Solution**: An assertion/test layer, **not new UI**: (1) a co-located test asserting MealHealthPanel renders the status badge (Reviewed | Clinician review | Educational) and FOOD_FIRST_HEDGE for all three lens values × all three gate combinations. (2) Ensure the synthesized headline is computed **only** from nutrition macros — never from therapeutic effect sizes or ayurvedic claims — so it is identical across lenses; encode lens-invariance as a test. (3) Keep the lens value out of any URL/analytics payload that could read as a health-condition disclosure (mirror the existing "derived flags only" rule).
- **Touches**: `meal-health-panel.tsx`, `claim-contract.ts`, `meal-health-panel.test.tsx` (new/extended).
- **Risk**: Low risk, high value — the guardrail keeping the simplification from quietly breaking the honesty contract. Main risk is forgetting the clinicianReview env path; tie the test to the same `NODE_ENV` gating the feature-flags use so it doesn't false-fail in the dormancy golden tests.
- **Verify**: `pnpm test` — the 3×3 lens/gate matrix passes; headline-invariance passes (same dish → identical Sous-read string under all three lenses). Manual — in clinicianReview mode the badge reads "Clinician review" (never "Reviewed") on every lens; `assertNoMedicalClaim` still passes against the headline.

**Ships**: A single subordinate segmented control lets the user pick Everyday (clean default — no evidence rows, no herb notes), Therapeutic (gated evidence rows), or Ayurvedic (herb notes); FOOD_FIRST_HEDGE and the status badge persist on all three, the synthesized headline is provably lens-invariant, and no lens can imply reviewed evidence. **The two-audience collision is fully resolved with the honesty contract intact.**

---

## 4. Dependency / critical-path summary

**Critical path** (longest chain, gates the lens capstone):

```
sous-read-engine → sous-read-card → glance-deepdive-split
                                          ↓
honesty-chip ─────────────────────────────┘
                   grammar-tier-token → grammar-migrate-surfaces → lens-switcher → lens-default-honesty
```

**Three parallel tracks** (respect the 3-parallel-task guardrail):

- **Track A — Info / quality / lens (critical path)**: Phase 1 (`sous-read-engine` + `honesty-chip` + `nutrition-ring-compact-prop`, mutually independent) → Phase 2 (`sous-read-card` → `glance-deepdive-split`) → Phase 8 (`grammar-tier-token` → `grammar-migrate-surfaces`) → Phase 9 (`green-deload`, overlaps the migrate step once the token lands) → Phase 10 (`lens-switcher` → `lens-default-honesty`).
- **Track B — Logging / diary (independent of A)**: Phase 3 (`log-engine-streak-at-log` → `log-unify-primitive`) → Phase 4 (`diary-today-home` → `{diary-as-journey-link, first-run-choreography}`). Begins in parallel with Track A Phase 1. **Caveat**: `diary-today-home` also needs `nutrition-ring-compact-prop` — start that one prop early or have Track B own it.
- **Track C — Queue / swiper / Path (fully independent)**: Phase 5 (`queue-dedup-affordance` + `swiper-cta-hierarchy`) → Phase 6 (`plate-ring-result-stack`, needs queue-dedup first). Separately, Phase 7 (`path-journey-momentum` → `path-streak-at-log`) — independent of everything except Track B's logging being in place for the streak to mean anything.

**Hard ordering caveats**:

- `honesty-chip` **must** land before `glance-deepdive-split`, or the split briefly shows health framing with the hedge out of view (honesty-contract violation).
- `nutrition-ring-compact-prop` **must** precede both `glance-deepdive-split` and `diary-today-home`.
- `queue-dedup-affordance` and `swiper-cta-hierarchy` both edit `quest-card.tsx` — serialize them to avoid merge conflicts.
- `diary-as-journey-link` must ship in the **same** phase as `diary-today-home`, or Today and Path briefly both claim "today's nutrition."

**Effort tally**: 8 × S, 8 × M, 1 × L (lens-switcher). No item exceeds L.

## 5. Out of scope / founder-gated

- **No founder-gated items in this overhaul.** Every item is AUTO-BUILD — it ships from this repo + npm + existing tooling, with no external account, paid service, human counsel, real users, or third-party asset required (CLAUDE.md Rule 12).
- **Not building a new onboarding engine** — `first-run-choreography` is strictly empty-state copy + one coachmark + the milestone toasts that already exist. A multi-step wizard is out of scope (violates the radical-simplicity thesis).
- **Not adding new routes, tabs, or sheets** — the Glance/Deep-dive split happens inside the existing MealHealthPanel; the lens switcher is a view toggle, not a settings screen (Rules 3, 11).
- **Not editing the `--data-*` macro arc palette** (carb/protein/fat) — a separate legitimate ramp untouched by the green de-load.
- **Glycemic stays deliberately off the evidence-tier scale** — it is directional (low=good → high=bad), not a quality strength; re-unifying it is explicitly out of scope and guarded by a test.
- **Real clinician names / lab affiliations and real reviewed-evidence status** remain a separate Stage-2 editorial workstream — this overhaul preserves the Educational/`isPlaceholder` honesty framing and never upgrades claim status (Rule 11; the env-flag `clinicianReview` path stays dormant and only its dormancy is tested here).
- **The full Path-as-journey reframe (T1d)** is only partially landed here (`path-journey-momentum` + the `diary-as-journey-link` de-duplication); a deeper weekly/lifetime journey redesign is a separate future cluster, flagged in code comments so this work isn't re-reverted.
