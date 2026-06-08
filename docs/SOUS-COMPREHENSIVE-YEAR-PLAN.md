# Sous — Comprehensive Year Plan (redraft, 2026-06-08)

> **This supersedes the nutrient-only `NUTRIENT-PLATFORM-52-WEEK-PLAN.md`.** That
> plan's nutrient track continues here as **Track D**; this redraft widens the
> horizon to the whole product and adds three first-class tracks the founder
> asked for:
>
> - **Track A — Delight:** UI animation + engagement-action refinements.
> - **Track B — Frictionless logging:** nutrition logging in a compact, ≤2-tap UI.
> - **Track C — Evidence-based Ayurveda:** expanded and _less conservative_ — every
>   herb still earns its place with a meta-analysis or multiple RCTs, but the bar
>   now admits the moderate/emerging tier (with honest labels), not just the top 5.
> - **Track D — Nutrient backbone:** the remaining data/coverage/intelligence work.

---

## 0. Operating principles (the bar for EVERY week)

1. **Frictionless + compact** (rules 6 & 13): default to the fewest words and the
   fewest taps. If a feature needs a form, it's wrong — find the one-tap version.
2. **No-scroll** (rule 10): primary action visible on a 375×667 viewport.
3. **One primary action per screen** (rule 2).
4. **Honesty contract:** every health/nutrition/Ayurveda claim is hedged,
   food-first, sourced, and never a medical promise. "Estimate" and "educational,
   not medical advice" stay visible; food amounts ≠ study doses.
5. **3-round recursive loop + unit tests per week** (carried from the old Part 6):
   - _R1_ build + self-review against the spec.
   - _R2_ adversarial review — attack the edges, verify the honesty contract.
   - _R3_ polish — minimal text, a11y, reduced-motion, no-scroll, perf.
   - _Tests_ co-located `*.test.ts`; every week ships green typecheck + lint + build.
6. **AUTO-BUILD [AB] vs FOUNDER-GATED [FG]** (rule 12): sequence AB first; for FG
   weeks, ship the abstraction/stub now so integration is one config edit later.
7. **Always commit to main and push.** No worktrees, no feature branches.

---

## 1. Shipped foundation (what's already live — the down-payment)

- **Nutrition engine + Info surface:** ingredient-computed per-serving nutrition,
  154-ingredient registry, ~89% catalogue coverage, macro-ring + targets +
  micros, serving-size scaling, coverage floor + drift guards.
- **Bioavailability tips (W27+):** vit C↔iron, turmeric+pepper, tea↔iron timing,
  vit D↔calcium, soaking↔phytate, cooked-tomato↔lycopene — with a "the science"
  evidence panel (real papers) in the Profile sheet.
- **Glycemic estimate (W28):** soft, clearly-estimated GL pill on the Info sheet.
- **Ayurvedic lens (v1):** 5 herbs (ginger, turmeric, fenugreek, cinnamon, black
  pepper), evidence + safety + sources, toggle + per-dish notes.
- **Therapeutic/clinical layer:** educational evidence cards + `/clinician` review
  surface, badged "unreviewed", live on deployed builds for clinician evaluation.
- **Logging primitives:** nutrition diary data model, daily totals/dashboard,
  hydration tracking, serving slider.
- **Content tab:** Featured hero, articles/reels/research, nutrient-education
  spotlights (W46).
- **Compact controls:** the text Filter (cuisine/meal-type/role), age-band +
  cuisine dropdowns, side-count selector, grocery nutrition rollup (W33),
  nutrition share card (W45), one-tap nutrition-goal card (W47).
- **Motion/polish:** a site-wide micro-interaction + animation pass already
  landed; this plan's Track A makes it systematic and complete.

---

## 2. THE THREE NEW TRACKS

### Track A — Delight: UI animation + engagement actions

**Thesis.** Sous already cooks; now it should _feel_ alive. Animation is not
decoration — it's feedback (did my tap land?), continuity (where did this come
from?), and reward (I did a good thing). Every motion respects `prefers-reduced-
motion` by construction.

**A-backlog (each its own week, scheduled in §3):**

- **A1 Motion system / tokens.** One source of truth for durations, easings, and
  spring configs (`--motion-fast/base/slow`, standard spring). Reduced-motion
  fallbacks baked into the tokens, not bolted on. Replaces ad-hoc Framer values.
- **A2 Tap & press feedback.** A consistent press-scale + haptic vocabulary
  (light = select, medium = commit, success = win). One `useHaptic` + `<Pressable>`
  primitive; sweep every CTA/card onto it.
- **A3 Sheet & route choreography.** Unified open/close for vaul sheets, the Info
  sheet, the meal queue, and route transitions (shared-element where it reads as
  continuity — dish image → guided cook hero).
- **A4 List & card motion.** Stagger-in for the meal queue + result stack, layout
  animations for expand/collapse and reorder (FLIP), skeleton→content crossfade.
- **A5 Win & milestone celebrations.** Owl reactions, confetti restraint, streak
  milestones (3/7/30), first-cook, first-log, level-up; all reduced-motion safe.
- **A6 Engagement loop polish.** Daily quest "freshness" animation, weekly-
  challenge progress fills, gentle (never nagging) re-engagement cue, "cook of the
  day" reveal. Engagement = earned momentum, not dark patterns.
- **A7 Owl coach micro-animations.** Contextual mascot states (idle, thinking,
  celebrating, nudging) tied to real UI triggers only (rule: bounded coach).
- **A8 Empty-state & loading delight.** Friendly, on-brand empty states; optimistic
  UI for log/save/select so nothing feels like a wait.
- **A9 Scroll-driven reveals.** Subtle, content-respecting reveals on the Content
  tab + Path scrapbook; never janky, never blocking.
- **A10 Sound (optional, OFF by default).** A tiny, tasteful sound set for
  win/timer/select behind a setting; ships muted.
- **A11 Motion QA + perf.** 60fps audit, no layout thrash, bundle cost of motion
  measured, reduced-motion parity test for every animated surface.

**Per-week R3 always includes:** reduced-motion parity + a `prefers-reduced-motion`
test, and a "does this earn its frames?" cut (rule 6 applies to motion too).

---

### Track B — Frictionless compact nutrition logging

**Thesis.** Logging is where nutrition apps die — friction kills the habit. Sous's
edge is that it already _knows the dish you cooked_, so logging should be a
by-product of cooking, not a chore. Target: **log a meal in ≤2 taps, no forms.**

**B-backlog:**

- **B1 One-tap "I ate this".** From any dish (Info sheet, win screen, result card):
  a single "Log it" that writes the diary entry with smart defaults (meal slot from
  time-of-day, 1 serving). Undo toast; never a form.
- **B2 Compact diary day view.** The ring + a tight, swipe-to-edit list; portion
  quick-adjust inline (½ · 1 · 1½ · 2×) with the ring updating live. No modal.
- **B3 Quick-add tray.** Recent + frequent + favourites as one-tap chips; the
  whole "add something I didn't cook" path in one compact sheet.
- **B4 Photo log.** Snap → vision recognise → correction chip → log (reuses the
  two-step vision pipeline; never trusts vision alone). One confirm tap.
- **B5 Branded/quick log.** Branded search → log; barcode quick-log [FG: scanner].
  Branded items excluded from cooking-gap signals (existing pattern).
- **B6 Voice / text quick-log.** "I had a banana and yoghurt" → parsed entries to
  confirm (reuses the Claude structured-output parser). Optional, skippable.
- **B7 Logging streak + gentle nudges.** A logging streak that ties into Track A's
  celebration system; a single, dismissible end-of-day "round out your day?" cue
  (never a guilt loop).
- **B8 Smart day rollups + trends.** Day deficit/surplus insight line, week trends,
  "you tend to miss fibre on weekdays" style soft observations (hedged).
- **B9 Frictionless edit/undo.** Swipe to remove, long-press to adjust, full undo;
  idempotent, no data loss.
- **B10 Logging a11y + offline.** Works one-handed, screen-reader labelled,
  optimistic + offline-tolerant (writes locally, syncs when able).

**Compact rule for the whole track:** if any log path exceeds 2 taps or shows a
form field by default, it goes back to R3.

---

### Track C — Evidence-based Ayurveda (expanded · less conservative)

**Policy shift (the "less conservative" mandate).** v1 admitted only the top tier.
v2 uses an explicit **3-tier evidence model** and admits any culinary herb with
**≥1 peer-reviewed meta-analysis or ≥2 RCTs**, each labelled honestly:

- **Strong** — consistent meta-analyses / multiple RCTs.
- **Moderate** — a meta-analysis with heterogeneity or dose-dependence.
- **Emerging** — early but real (small RCTs / single meta-analysis); flagged as such.

**Still excluded (non-negotiable):** the dosha framework, pulse diagnosis, and any
claim without trial evidence. Every entry keeps: traditional use _and_ modern
evidence stated separately, a safety/interaction note, the food-vs-supplement-dose
caveat, and real sources. Supplement-only herbs (e.g. ashwagandha) are clearly
marked "not a cooking spice".

**C-backlog:**

- **C1 Expand the herb library 5 → 13.** Add the eight researched below; ensure
  the ingredient registry carries them (nigella/kalonji, saffron, tulsi, cardamom,
  amla, garlic, cumin) so per-dish matching works.
- **C2 3-tier evidence model + UI.** Strength badges (Strong/Moderate/Emerging),
  the policy note, and a "why these and not doshas" explainer.
- **C3 Ayurvedic Kitchen content section.** A Content-tab home for the herb index +
  per-herb deep dives (traditional use, the meta-analysis, the limits, the recipes
  that use it). Sample-flagged until editorial review.
- **C4 Recipe-level herb callouts.** When a dish contains an evidence-herb, a
  compact note on the Info sheet (already wired for v1; extend to the new herbs).
- **C5 Gentle condition tie-ins.** Where evidence supports it (tulsi/nigella →
  glycaemic, garlic → blood pressure, saffron → low mood), surface the herb inside
  the therapeutic layer — behind the SAME clinician-review + honesty rails, never
  as a prescription.
- **C6 Safety/interaction matrix.** A structured interactions table (blood
  thinners, glucose meds, pregnancy, coumarin, SSRIs) surfaced on each herb.
- **C7 Evidence-freshness job.** A periodic re-check task to update strength labels
  as new meta-analyses land (keeps the library honest over time).

**The expansion set (researched 2026-06-08, with primary meta-analyses):**

| Herb (culinary)                             | Outcome with best evidence                       | Tier         | Key safety flag                                    |
| ------------------------------------------- | ------------------------------------------------ | ------------ | -------------------------------------------------- |
| Ginger (Adrak) — _shipped_                  | Nausea (pregnancy/post-op)                       | Strong       | Blood thinners; ≤1g/day in pregnancy               |
| Turmeric (Haridra) — _shipped_              | Knee osteoarthritis pain                         | Strong       | Extract doses; blood thinners                      |
| Black pepper (Maricha) — _shipped_          | Curcumin bioavailability                         | Strong       | Drug metabolism (concentrated)                     |
| Fenugreek (Methi) — _shipped_               | Fasting glucose / HbA1c                          | Moderate     | Glucose meds; pregnancy                            |
| Cinnamon (Dalchini) — _shipped_             | Glycaemic control                                | Limited      | Cassia coumarin at high dose                       |
| **Garlic (Lashuna)**                        | Blood pressure & LDL (39 RCTs)                   | **Strong**   | Blood thinners; reflux                             |
| **Black cumin / Nigella (Kalonji)**         | Lipids + glucose (≈50 trials)                    | **Strong**   | Glucose/BP meds; pregnancy                         |
| **Saffron (Kesar)**                         | Mild–moderate depression (non-inferior to SSRIs) | **Strong**   | High dose / pregnancy; med interactions            |
| **Holy basil / Tulsi**                      | Fasting glucose + lipids (7 trials)              | **Moderate** | Glucose meds; pregnancy                            |
| **Amla (Indian gooseberry)**                | Blood lipids (9 RCTs)                            | **Moderate** | Blood thinners; very high vit C                    |
| **Ashwagandha** _(supplement, not a spice)_ | Stress/anxiety (22 RCTs), sleep                  | **Moderate** | Liver-injury reports; thyroid/sedatives; pregnancy |
| **Cardamom (Elaichi)**                      | Blood pressure + inflammation                    | **Emerging** | Few trials; interpret cautiously                   |
| **Cumin (Jeera)**                           | Lipids / glycaemic (small RCTs)                  | **Emerging** | Generally food-safe                                |

Sources are catalogued in the **Appendix** and dropped into `ayurvedic-evidence.ts`
as the library expands.

---

### Track D — Nutrient backbone (continuing)

The remaining data/intelligence work from the old plan, unchanged in intent:

- **D1** Coverage to ~95% (final FDC tranche + curation).
- **D2** Amino-acid panel + protein-quality (DIAAS-lite).
- **D3** Nutrient-density score (ANDI-lite) + week trends.
- **D4** Deficiency-aware side reranking (the day's gaps reweight pairings).
- **D5** Confidence/provenance surfacing ("estimated vs measured").
- **D6** Allergen/diet hard-filter integration (care-profile `avoid`).
- **D7** Restaurant/branded diary parity (W36).
- **D8** Branded data refresh pipeline (scheduled OFF re-extract).
- **D9** Performance: route-split the registry; Today bundle stays lean.
- **D10** Personalised DRI go-live [FG: G1]; clinician review surface [FG: G3/G4].
- **D11** Scale test (1000 dishes, 500 ingredients) + drift-guard sweep.

---

## 3. The interleaved 52-week schedule

Tracks run in parallel so the product improves on every axis each quarter. Each
line is `[Track][AB/FG] — deliverable`. The 3-round + tests standard (§0.5) applies
to all.

### Q1 (W1–13) — Make it feel alive + log in two taps

- W1 `A1 [AB]` Motion system / tokens + reduced-motion parity test.
- W2 `B1 [AB]` One-tap "I ate this" from dish/win/result.
- W3 `C1 [AB]` Herb library 5→13 data + registry coverage for the new herbs.
- W4 `A2 [AB]` Tap/press feedback + haptic vocabulary primitive.
- W5 `B2 [AB]` Compact diary day view + inline portion quick-adjust.
- W6 `C2 [AB]` 3-tier evidence model + strength-badge UI + policy note.
- W7 `A3 [AB]` Sheet & route choreography (Info/queue/guided-cook continuity).
- W8 `B3 [AB]` Quick-add tray (recent/frequent/favourites).
- W9 `D1 [AB]` Coverage push toward ~95% (tranche 1).
- W10 `A4 [AB]` List/card motion (stagger, FLIP expand/reorder).
- W11 `B4 [AB]` Photo log (vision → correction chip → log).
- W12 `C3 [AB]` Ayurvedic Kitchen content section + herb index.
- W13 `— [AB]` Q1 review + recursive polish + perf/a11y sweep.

### Q2 (W14–26) — Reward the habit + deepen the data

- W14 `A5 [AB]` Win & milestone celebrations (streak/first-cook/first-log).
- W15 `B7 [AB]` Logging streak + Track-A celebration tie-in.
- W16 `C4 [AB]` Recipe-level herb callouts for the new herbs.
- W17 `D2 [AB]` Amino-acid panel + protein quality.
- W18 `A6 [AB]` Engagement-loop polish (quest freshness, challenge fills).
- W19 `B8 [AB]` Day rollups + trends + soft observations (hedged).
- W20 `C6 [AB]` Safety/interaction matrix per herb.
- W21 `B5 [AB]` Branded/quick log; barcode quick-log [FG: scanner] stub.
- W22 `A7 [AB]` Owl coach micro-animations (bounded triggers).
- W23 `D3 [AB]` Nutrient-density score + week trends.
- W24 `C5 [AB]` Gentle condition tie-ins (tulsi/nigella/garlic/saffron) behind rails.
- W25 `B9 [AB]` Frictionless edit/undo across the diary.
- W26 `— [AB]` Q2 review + recursive polish.

### Q3 (W27–39) — Intelligence + the long tail of delight

- W27 `D4 [AB]` Deficiency-aware side reranking.
- W28 `A8 [AB]` Empty-state & loading delight + optimistic UI.
- W29 `B6 [AB]` Voice/text quick-log (Claude structured output).
- W30 `D5 [AB]` Confidence/provenance surfacing.
- W31 `C7 [AB]` Evidence-freshness re-check job.
- W32 `A9 [AB]` Scroll-driven reveals (Content + Path).
- W33 `D6 [AB]` Allergen/diet hard-filter integration.
- W34 `B10 [AB]` Logging a11y + offline tolerance.
- W35 `D7 [AB]` Restaurant/branded diary parity.
- W36 `A10 [AB]` Optional sound set (ships OFF).
- W37 `D9 [AB]` Performance pass (route-split registry, motion budget).
- W38 `A11 [AB]` Motion QA + 60fps + reduced-motion parity sweep.
- W39 `— [AB]` Q3 review.

### Q4 (W40–52) — Platform, scale, and the gated go-lives

- W40 `D1 [AB]` Coverage to ~95% (final tranche).
- W41 `D8 [AB]` Branded data refresh pipeline.
- W42 `C [AB]` Ayurveda editorial pass (swap sample → reviewed; prep for FG sign-off).
- W43 `D10 [FG: G1]` Personalised DRI go-live (EER coefficients in).
- W44 `D10 [FG: G3/G4]` Clinician review surface for nutrient + herb takeaways.
- W45 `A [AB]` Delight regression: every animated surface re-audited.
- W46 `B [AB]` Logging regression + 2-tap guarantee re-verified end-to-end.
- W47 `C [AB]` Ayurveda regression: every herb has tier + safety + ≥1 live source.
- W48 `D11 [AB]` Scale test (1000 dishes, 500 ingredients).
- W49 `— [AB]` Full regression + drift-guard sweep.
- W50 `— [AB]` i18n number/unit formatting groundwork (copy stays English till launch).
- W51 `— [AB]` Documentation + runbooks (motion, logging, herb-add, regenerate).
- W52 `— [AB]` Year review + next-year thesis.

---

## 4. Founder-gated dependencies (act on in parallel)

| Gate                        | Blocks                                                    | Autonomous prep already shippable                                 |
| --------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------- |
| **Scanner SDK / camera**    | Barcode quick-log (B5)                                    | Branded search log path + the scan stub + result contract         |
| **G1 clinician sign-off**   | Personalised DRI; herb condition claims marked "reviewed" | Educational mode + the review surface (live, badged "unreviewed") |
| **G3/G4 editorial + legal** | Real clinician names; FTC/FDA claim posture               | Sample-flagged content + the claim contract + the kill-switch env |
| **Push infra**              | Re-engagement nudges (A6/B7) as push                      | In-app nudges (no push) + the notification content contract       |

Never schedule a gated week as if it were autonomous; the in-app/stub version
ships first so integration is one config edit when the gate clears.

---

## 5. Appendix — Ayurvedic evidence library (primary sources)

Strong tier additions:

- **Garlic** — BP + cholesterol meta-analyses: jn.nutrition.org/article/S0022-3166(23)00519-9 ; pmc.ncbi.nlm.nih.gov/articles/PMC6966103
- **Nigella sativa (black cumin/kalonji)** — lipids+glycaemic: onlinelibrary.wiley.com/doi/10.1002/ptr.6708 ; pubmed.ncbi.nlm.nih.gov/29154069
- **Saffron** — mild–moderate depression: pubmed.ncbi.nlm.nih.gov/30036891 ; pmc.ncbi.nlm.nih.gov/articles/PMC6503633

Moderate tier additions:

- **Holy basil / Tulsi** — fasting glucose + lipids: sciencedirect.com/science/article/abs/pii/S1756464618301166
- **Amla (Indian gooseberry)** — blood lipids (9 RCTs): pmc.ncbi.nlm.nih.gov/articles/PMC9137578
- **Ashwagandha** _(supplement, not a spice)_ — stress/anxiety + sleep: ods.od.nih.gov/factsheets/Ashwagandha-HealthProfessional ; pmc.ncbi.nlm.nih.gov/articles/PMC8462692

Emerging tier additions:

- **Cardamom** — BP + inflammation: pmc.ncbi.nlm.nih.gov/articles/PMC10804083
- **Cumin** — lipids/glycaemic (small RCTs): tracked for strength upgrade as data matures.

Shipped tier (already in `ayurvedic-evidence.ts`): ginger, turmeric, fenugreek,
cinnamon, black pepper — sources in that file.

---

## 6. Definition of done (per track)

- **Track A:** every interactive surface has intentional, reduced-motion-safe
  motion at ≤ its frame budget; a motion token system; no ad-hoc durations.
- **Track B:** any meal logs in ≤2 taps from cook/Info/quick-add/photo; the diary
  is one compact, editable view; offline-tolerant; a11y-clean.
- **Track C:** ≥13 herbs, each with a 3-tier label, separated traditional/modern
  framing, a safety note, and ≥1 live source; doshas excluded; the matrix + the
  Content section live.
- **Track D:** ~95% coverage, provenance shown, gated go-lives prepped, scale-tested.

---

## 7. Founder-flagged UI defect batch (2026-06-08) — 4-ROUND agent verification

The founder flagged four issues from real phone screenshots. These run under a
STRICTER **4-round recursive protocol** (one extra round beyond §0.5), with an
independent verifier agent confirming each round before the next. The bar: the
founder is _impressed_, not merely unblocked.

### The 4-round protocol (applied to every item here)

- **R1 — Build to spec.** Implement; self-review against the exact complaint;
  RCA the root cause (not the symptom) and record it.
- **R2 — Adversarial verify.** A separate verifier agent attacks the fix: overlap/
  occlusion/z-index (the bug class that broke the Info pill), long names, missing
  data, reduced-motion, the 375×667 no-scroll constraint, light + dark, RTL.
- **R3 — Cross-state sweep.** Re-check across many dishes, every ingredient
  category, both phone widths, and each surface the change touches (Grab list,
  shopping list, pantry) — live screenshots, not assertions.
- **R4 — Founder-acceptance.** Eyes-on against the ORIGINAL screenshot/complaint:
  the specific defect is gone, nothing regressed, and it looks genuinely better.
  Only then is the item done.

### The batch

1. **Info affordance broken (RCA + fix).** _Done._ Root cause: the collapsed health
   pill was pinned to a magic `134px` bottom offset to clear the action bar; the
   bar grew taller and occluded it into an unusable sliver. Fix: a clear top-right
   "ⓘ Info" pill (no drag, no magic offset). _R1–R4 passed; verified at top:16/
   right:16._ Follow-up (R3/R4 continuous): confirm on dishes with/without
   therapeutic evidence + long titles.
2. **Remove the "N / 18" queue counter.** _Done._ Kept the progress bar; dropped
   the count (no signal). _Verified absent._
3. **Declutter ingredient rows.** _Done._ Removed the inline "sub: X" subtext AND
   the bookmark/save button; the recipe's default substitution surfaces ONLY when
   the side ⇄ button is tapped. Pantry-stash remains reachable via the shopping-
   list → pantry flow. _R4 follow-up:_ confirm the sub panel still shows the
   default on tap across the Grab list.
4. **Replace ingredient emoji with realistic icons (the big one — full 4 rounds).**
   - **Repo selected:** Microsoft **Fluent Emoji** (`github.com/microsoft/
fluentui-emoji`, MIT) — the **3D** variant renders photoreal-ish food; Google
     **Noto Emoji** (Apache-2.0) is the flat-detailed fallback. Both beat the OS
     emoji that render inconsistently per device (the founder's "terrible" cause).
   - **R1 — integrate.** Vendor the needed subset into `public/ingredient-icons/`
     (no CDN, offline-safe, bundle-measured). Add `ingredientIcon(name)` resolving
     a canonical ingredient → asset, and an `<IngredientIcon>` that renders the
     image with the existing `ingredientEmoji()` as the graceful fallback. Map all
     registry ingredients + the common free-text names.
   - **R2 — adversarial.** Unmapped ingredients fall back cleanly; no broken-image
     icons; fixed dimensions (zero layout shift); `loading="lazy"`; bundle delta
     within budget; a11y (`alt`/decorative correct); reduced-motion irrelevant.
   - **R3 — cross-state.** Every ingredient category across the Grab list, shopping
     list, and pantry; long lists; light/dark; both phone widths — live shots.
   - **R4 — founder-acceptance.** Side-by-side vs the emoji screenshot; the icons
     read as the real ingredient and look premium. Ships under **Track A** as the
     ingredient-icon system; coverage gaps logged (no silent fallback at scale).
   - _Tests:_ `ingredientIcon` returns a path for known ingredients + null→fallback
     for unknowns; every mapped path exists on disk; the fallback never throws.

This batch's R1–R3 are AUTO-BUILD; R4 is a founder eyes-on gate (fast, not a
blocker). Item 4 (icons) is the only non-trivial build remaining.
