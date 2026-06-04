# Swipe-Up Health Panel — Technical Plan

> **Status:** Plan (not yet built). Authored 2026-06-04.
> **Feature:** On the immersive meal card, swiping **up** raises a calm,
> minimalist panel of food-first health + Culinary-Therapeutics info for that
> dish, while the **bottom half of the food photo stays visible** as the anchor.
> **One-line thesis:** make the therapeutics moat _tangible per dish_ through
> pure progressive disclosure — invisible until asked for, so it adds zero
> default clutter (CLAUDE.md rule 13).

---

## 0. Founder gates surfaced up front (rule 12)

| Gate                      | Blocks                                                                                                           | AUTO-BUILD now                                                                                                                                                                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **G1 clinician sign-off** | the panel showing _personalized_ "this dish supports YOUR condition" framing with the Educational banner removed | the whole panel ships in **educational mode** behind `therapeuticsActive()`; `registryIsClinicianApproved()` only flips the "Educational" chip → "Reviewed" and unlocks personalization                                                                                                |
| **G5 legal review**       | production go-live of any health-condition copy                                                                  | copy is claim-safe-by-construction (`assertNoMedicalClaim`); the panel is env-gated off in prod until G5                                                                                                                                                                               |
| **Nutrition macros**      | a rich macro row (protein/fiber/kcal per serving)                                                                | `QuestDish` lacks macro grams; ship the **nutrition-snapshot slot + the data contract**, populate it when a real source (USDA — see `docs/adr/0001-nutrition-data-source.md`) lands. Until then the snapshot shows only what exists (`nutritionCategory`, ingredient-derived signals). |

Everything in §1–§7 below is **AUTO-BUILD** today except where tagged.

---

## 1. The interaction (the idea)

The immersive meal card (`FullscreenSwipeCard` inside `MealSwipeQueueOverlay`)
is already a full-bleed food photo with **horizontal** swipe (left = skip,
right = save). We add a **vertical** gesture on the same card:

- **Collapsed (default):** unchanged card. A single, low-key affordance hints at
  the panel — a 28px grabber pill + a hair-thin `Health` kicker sitting just
  above the action row, at ~40% opacity. That's the _entire_ added default UI.
- **Drag up (or tap the grabber):** a panel rises from the bottom. The photo
  **translates up + scales down slightly** so its **bottom ~50% stays visible**;
  the panel occupies the top ~55% with a soft cream surface and a grabber handle.
- **Snap points:** exactly **two** — `collapsed` (0) and `peek` (≈ −52% of card
  height). One snap keeps it minimalist; no "full-screen detail" tier in v1.
- **Dismiss:** drag down, tap the still-visible photo, swipe-down flick, or
  `Escape` (keyboard). The card returns to collapsed.
- **Horizontal swipe still works** while collapsed; it is **suppressed while the
  panel is open** (you're reading, not triaging).

### Gesture disambiguation (the one real technical risk)

Horizontal (skip/save) vs vertical (health) on the same draggable element.
Resolve with **axis-lock on drag start**:

- On `onDragStart`, capture the initial pointer. On the first ~8px of movement,
  compare `|dx|` vs `|dy|`. Lock to the dominant axis for the rest of the drag.
- Horizontal-locked → existing `decideSwipe`/`exitDistanceFor` logic (untouched).
- Vertical-locked → drive a `panelY` motion value; on release, `decidePanelSnap`
  (a new pure helper, mirrors `decideSwipe`) picks `collapsed`/`peek` from offset
  - velocity.
- Framer `dragDirectionLock` does most of this natively on `<motion.div drag>`;
  we add the snap math + the photo's coupled transform.

This keeps **both** existing swipe behaviors byte-identical when the user never
drags vertically (protects the golden non-regression posture).

---

## 2. Visual / minimalist spec

- **Surface:** `--nourish-cream` panel, hairline top border, a 36×4 grabber pill
  (`--nourish-border-strong`), generous 20px gutters, one-card-per-section rhythm
  matching `EvidenceProvenanceStrip`.
- **Photo coupling:** as `panelY` animates 0 → peek, the photo does
  `translateY: 0 → -8%` + `scale: 1 → 0.96` + a subtle darkening scrim grows on
  its top edge so the panel's bottom never fights the food texture.
- **Typography:** dish name in `font-serif text-lg`; section kickers in the
  existing `sous-label` uppercase-tracked style; evidence rows reuse the
  `EvidenceProvenanceStrip` type scale (effect = `tabular-nums`, GRADE chip).
- **Motion:** spring `{ stiffness: 320, damping: 30 }`; **fully gated on
  `useReducedMotion`** (reduced → no photo scale/translate, panel cross-fades in
  at the peek position, honoring `sous/reduced-motion-gate`).
- **Color restraint:** no new palette. GRADE chips reuse the existing
  evidence-strip treatment; the "Educational" chip is the existing one.

### Panel content (top → bottom), all claim-safe

1. **Kicker row:** `FOOD-FIRST EVIDENCE` · `Educational` chip (drops to
   `Reviewed` only when `registryIsClinicianApproved()`).
2. **Headline:** _what this dish brings_ — the matched intervention(s), e.g.
   "Good source of β-glucan · soluble fiber". Personalized line ("Supports your
   LDL focus") **only** when a care profile exists AND the registry is approved
   (G1); otherwise the generic, non-personalized phrasing.
3. **Evidence rows:** per matched intervention — name, `interventionClass` tag
   (recipe / fortified), `grade` chip, `formatEffect(effectSize)`, and the
   `applicationNote` (already clinician-honest). Reuses `buildEvidenceCard`
   row rendering.
4. **Nutrition snapshot** _(slot; data founder-gated):_ `nutritionCategory` +
   ingredient-derived signals now; macro row when the data source lands.
5. **Footer disclaimer:** the `FOOD_FIRST_HEDGE` + "Food-first ideas, not medical
   advice. Always work with your clinician." (the existing `ContentDisclaimer`
   inline variant).
6. **Empty/no-match state:** if the dish matches no scorable intervention, show a
   calm "No specific food-first evidence encoded for this dish yet" + the
   nutrition snapshot only — never an empty panel.

---

## 3. Component architecture

New (all under `src/components/today/`):

- **`MealHealthPanel.tsx`** — presentational. Props: `{ dish, careProfile,
open }`. Renders §2 content from the data layer. Holds no gesture state.
- **`use-meal-health-panel.ts`** (`src/lib/hooks/`) — owns `panelY` motion value,
  axis-lock state, and the open/close API (`open`, `onDragStart`, `onDrag`,
  `onDragEnd`, `close`). Returns the coupled photo transforms too.
- **`decidePanelSnap.ts`** — pure: `(offsetY, velocityY) => "collapsed" | "peek"`.
  Unit-tested exactly like `decideSwipe`.

Wiring point: **`FullscreenSwipeCard`** (now in `quest-card.tsx`; will live in
`meal-swipe-queue.tsx` after the pending UI-cluster extraction — this plan
assumes that extraction lands first, which is why it was sequenced). The card
composes: `<DishImage>` (existing) + the coupled transform + `<MealHealthPanel>`
absolutely positioned, driven by `use-meal-health-panel`.

No change to `MealQueuePreview` (the Today home card) in v1. A future secondary
entry (a small heart-pulse tap-target on the preview that opens the immersive
card pre-expanded) is a one-line follow-up, deliberately out of v1 scope.

---

## 4. Data layer

### New: `matchInterventionsForDish`

`scoreTherapeuticFit` already matches a dish (`{ name, tags, flavorProfile }`)
to scorable interventions but returns only a 0–1 score. Add a sibling in
`src/lib/engine/therapeutic-fit.ts` (or a new `therapeutic-match.ts`):

```ts
matchInterventionsForDish(dish): MatchedIntervention[]
// each: { record: InterventionRecord, matchedOn: string[] }
```

It reuses the _exact_ matching predicate `scoreTherapeuticFit` uses (factor it
into one shared internal `dishMatchesIntervention()` so the panel and the scorer
can never diverge). Pure, deterministic, unit-testable.

### Personalization (G1-gated)

When a `CareProfile` exists and `registryIsClinicianApproved()`, intersect the
matched interventions with `interventionsForCondition(care.conditions)` to surface
"supports your X focus". Until G1, show the generic matched list — same data,
non-personalized framing. **Never** mark anything `clinician-approved` in code.

### Claim safety

Every string the panel renders passes through the existing `assertNoMedicalClaim`
contract; a new registry-style **guard test** asserts the panel's _templated_
copy (the non-data wrapper sentences) is claim-safe, complementing the existing
per-record guard.

---

## 5. Gating & non-regression

- The panel + the grabber affordance render **only** when `therapeuticsActive()`
  (educational mode). When off → `FullscreenSwipeCard` is byte-identical to
  today (the golden test stays green; the vertical gesture handler isn't even
  attached).
- `registryIsClinicianApproved()` controls only: Educational→Reviewed chip +
  personalized framing. Default off everywhere (the existing env contract).
- Prod stays off until **G5** (`NEXT_PUBLIC_THERAPEUTICS_ACTIVE` unset) — the
  founder's one-flip, already wired this session.

---

## 6. Implementation phases (each ends green: typecheck · lint · test · build · live)

**Pre-req (already sequenced):** extract the meal-swipe-queue UI cluster from
`quest-card.tsx` into `meal-swipe-queue.tsx` so the card has a clean home.

1. **Data — `matchInterventionsForDish` + shared predicate** (AUTO-BUILD).
   Refactor `scoreTherapeuticFit` to share `dishMatchesIntervention`; add the
   match function + unit tests (matches, no-match, multi-match, grade ordering).
2. **`decidePanelSnap` pure helper + tests** (AUTO-BUILD). Mirror the
   `decideSwipe` test file.
3. **`MealHealthPanel` (static, no gesture)** behind a temporary always-true prop
   so it can be visually built + screenshot-tuned in isolation (AUTO-BUILD).
   Claim-contract guard test on its templated copy.
4. **`use-meal-health-panel` gesture hook + axis-lock + photo coupling**
   (AUTO-BUILD). Wire into `FullscreenSwipeCard` behind `therapeuticsActive()`.
   Live-verify: vertical drag opens to half-image peek; horizontal swipe
   unaffected; reduced-motion path; Escape/tap-photo dismiss.
5. **Personalization wiring** behind `registryIsClinicianApproved()`
   (AUTO-BUILD; stays visually dormant until G1).
6. **Nutrition snapshot slot** with the data contract; populates when the source
   lands (slot AUTO-BUILD, data FOUNDER-GATED).
7. **Regression guard** static test: panel renders only under `therapeuticsActive`;
   collapsed card byte-identical when off.

---

## 7. Risks & mitigations

| Risk                                                 | Mitigation                                                                                                              |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Gesture conflict (H-swipe vs V-panel)                | axis-lock on first 8px + Framer `dragDirectionLock`; covered by an interaction test                                     |
| Panel fights Today page scroll                       | N/A — lives in the **full-screen overlay**, not the scrolling Today page                                                |
| Overclaiming / medical-advice creep                  | every string through `assertNoMedicalClaim` + a templated-copy guard test; educational framing default; G1/G5 gates     |
| Thin dish nutrition reads as broken                  | snapshot shows only real data + a calm empty state; macro row is an explicit founder-gated slot, not a fake             |
| Bundle weight on Today                               | the registry is already lazy-loaded; the panel + match logic load only inside the (lazy) overlay, never the Today shell |
| Reduced-motion vestibular load (coupled photo scale) | full `useReducedMotion` gate → cross-fade, no scale/translate                                                           |

## 8. Open decisions for Stefan

1. **One snap or two?** v1 proposes one (`peek`, half-image). Add a `full` snap
   later if users want more detail without leaving the card.
2. **Home surface:** immersive card only (v1), or also a tap-affordance on the
   Today preview card?
3. **Affordance copy:** grabber + `Health`, or an icon only (heart-pulse), or a
   first-run coachmark that teaches the gesture once then never again?
4. **Nutrition source** (founder gate): USDA per ADR-0001, or defer the macro row
   entirely and ship therapeutics-only in v1?

---

## 9. Implementation status (shipped 2026-06-04)

Built v1 with the recommended defaults: **one snap** (`peek`, half-image),
**immersive card only**, **grabber + `Health`** affordance, **therapeutics-only**
(no fabricated nutrition). All behind `therapeuticsActive()` (absent in test +
production until the flag flips) and claim-safe per rule 11.

| Phase | What shipped                                                                                                                         | Files                                                                                                             | Commit        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------- |
| 1     | `matchInterventionsForDish(dish, conditions?)` over a shared `matchedSignalsFor` predicate (identical-by-construction to the scorer) | `lib/engine/therapeutic-fit.ts`                                                                                   | `24032f2`     |
| 2     | `decidePanelSnap` pure collapsed⇄peek snap (mirrors `decideSwipe`)                                                                   | `components/today/panel-snap.ts`                                                                                  | `24032f2`     |
| 3     | Static `MealHealthPanel` + reusable `interventionToEvidenceRow` (shared with the EvidenceProvenanceStrip)                            | `components/today/meal-health-panel.tsx`, `lib/therapeutics/evidence-card.ts`                                     | `782c42e`     |
| 4     | `use-meal-health-panel` hook + `MealHealthSheet` (drag='y', separate from the card's drag='x') wired into `MealSwipeQueueOverlay`    | `lib/hooks/use-meal-health-panel.ts`, `components/today/meal-health-sheet.tsx`, `components/today/quest-card.tsx` | `9d4b402`     |
| 5     | Personalization (`PersonalizedSubhead`) built + gated on `reviewed` (G1, default off) — dormant slot per rule 12                     | `components/today/meal-health-panel.tsx`                                                                          | `782c42e`     |
| 7     | Claim-safety regression guard (panel never surfaces extract-only / non-benefit records)                                              | `lib/engine/therapeutic-fit.test.ts`                                                                              | (this commit) |

Live-verified on a clean dev server (375px): grabber positioned above the action
bar; sheet opens with the photo top-half visible behind a scrim; empty state
(both copy paths) and the populated state (Grilled Salmon → omega-3 row with
class + grade badges, effect size, "In this dish: salmon", food-first hedge)
render cleanly; scrim-tap dismisses; horizontal skip/cook swipe unaffected; zero
console errors. +20 tests (3162 → guarded), typecheck + lint + build green.

### Decision: nutrition slot deferred (was §8.4)

**Phase 6 (macro row) intentionally NOT built.** Two project rules make a v1
nutrition block the wrong move: rule 7 (no invented data — there is no real macro
source in-repo; USDA is founder-gated G-nutrition) and rule 13 (the simplicity
budget — the dish's real facts, `cuisine / cook-time / ingredient-count`, are
already shown directly under the photo, so a second copy in the panel is a
redundant restatement). The panel ships therapeutics-only. When USDA macros land
(founder gate), add the row as a new, real surface — not a fake placeholder.
