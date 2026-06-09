# Goal-Driven Discovery — Critical Appraisal & Design Spec

_Status: design proposal · Built by a 7-agent workflow (evidence research + code-grounded reuse map → 3 design variants → synthesis → adversarial honesty/safety review), then revised to close the safety gaps the review found · Date: 2026-06-09 · Audience: founder_

> The **binding safety revisions** below override anything later in this spec that
> conflicts. They exist because the draft's safety case leaned on infra that doesn't
> exist and on framing that doesn't fully cover replete users. The safety verdict was
> **REVISE** — these close it.

## 0. Binding safety revisions (read first)

**S1 (HIGH) — v1 is BOOSTS-ONLY; "reduce" is deferred.** The draft's load-bearing claim
("no new ranking math — reduce is a capped negative inside the same 0.1 reblend") is false
against the code: `scoreDeficiencyFill` is purely additive/non-negative, and the reduce
keys (added-sugar / refined-carb) aren't in `DEFICIT_TARGET`, so "reduce" would silently
no-op. Decision: **ship boosts-only** — that genuinely rides the existing 0.1 lever with
zero new math and is honest + frictionless. "Reduce" is a _separately scoped_ follow-up
(a signed deficiency term + a `REDUCE_TARGET` table + a golden test proving it can only
break near-ties, ≤1-slot shift). The "no new math" framing holds **only** for boosts-only.

**S2 (HIGH) — the community-mode guardrails are NET-NEW build, and the hair goal ships
DORMANT.** There is no confirm-sheet / amber-badge / "less-proven" UI to reuse in the repo
— the persistent **"community · less proven"** pill, the one-time **confirm sheet**, the
"Less-proven" divider, and the **4th provenance tier** are new components and are _blocking_
acceptance criteria, not "reuse." The hair/community goal ships **behind an env flag,
default OFF** (mirroring `registryIsClinicianApproved`); the real gate is a **G1-style
clinician/founder sign-off**, not an env flip. A visual test asserts a community goal
**never** renders the green "Reviewed" styling.

**S3 (HIGH) — iron caveat for replete users.** Energy + Hair both boost iron; the
"helps if you're low" scope is behind a tap while the _behaviour_ nudges iron for everyone.
For iron-replete users and undiagnosed hemochromatosis (~1 in 200–300) that's at best
pointless, at worst harmful. Fix: keep iron weights **modest as a tested invariant** (iron
alone can't move a dish > 1 slot) **and** add a hemochromatosis/iron-overload caveat to the
Energy + Hair `safety` strings, surfaced in the confirm step ("don't chase extra iron if you
have a condition that builds iron up — a ferritin test settles it").

**S4 (MED) — the guard denylists sweep COPY, not just keys.** The biotin boost-map guard is
a no-op (biotin isn't a `PerServingNutrition` key); the real leak is supplement language in
the prose. Run, build-blocking, over **every** human-facing goal string (label, evidenceNote,
safety, divider, confirm): `assertNoMedicalClaim` + a **disordered-eating denylist**
(crash/cut/burn/restrict/cleanse/detox/calorie/weight-loss) + a **supplement-name denylist**
(biotin/collagen/"hair vitamin"/gummies).

**S5 (MED) — the bare nutrient star carries its scope on tap.** Holding/tapping an active
star reveals the same scoping microcopy ("leaning toward iron — helpful mainly if you're
genuinely low; a test confirms") so capability 1 can't imply a condition claim. The card
stays clean (rule 13).

**S6 (MED) — a goal must not out-weigh real logged data.** Cap goal weights **strictly
below** diary-deficit weights (don't max-merge a preference as equal to a measured shortfall);
golden test that activating a goal never demotes a diary-driven gap-filler.

**S7 (LOW) — tier wording + swipe-feed scope.** The 4th tier is a **provenance/labeling**
tier — the rerank weight stays **0.1 for community exactly as for established** (it never
escalates ranking). And Step 4 (main swipe feed) **excludes community-tier goals in the
first cut** so the highest-risk goal isn't promoted to the loudest surface.

---

## TL;DR

The whole feature is **one ranking lever you already shipped** (`reblendDeficiency` at `DEFICIENCY_FILL_WEIGHT=0.1`) with a thin honesty label on top. Build it as a _goal layer_, not a new engine. Two capabilities ship from the same nutrient-weight-map: a **focus-nutrient star** (capability 1) and **named health-plan goals with evidence tiers** (capability 2). The hard part isn't the engine — it's the **community/lower-evidence tier**, which must be _louder about its honesty than every other surface in the app while staying a gentle nudge in the ranker_.

---

## The single most important design decision

**A goal is a nutrient weight map, and it rides the existing 0.1 deficiency-fill tier — nothing more.**

Everything good about this feature follows from refusing to build a second ranking mechanism. The codebase already has the exact machinery: `deficitWeightMap()` produces a `Map<nutrientKey, weight 0..1>`, `scoreDeficiencyFill` scores each candidate against `DEFICIT_TARGET`, and `reblendDeficiency` applies it post-rank at weight `0.1` — strictly below every taste dimension, byte-identical no-op when empty. A focus nutrient is a **1-entry** map. A health-plan goal is a **multi-entry** map (its `boost` set). Both `max`-merge into the day's existing `dayDeficits` record that _already flows through tRPC `pairing.suggest`_.

This is the decision because it determines all the rest:

- **It keeps the nudge structurally subtle.** Goals cannot shout because they ride the lowest weight tier that exists. A high-iron side at #6 floats into the top 3; the #1 taste match stays put. No new tuning surface, no escalation path.
- **It makes "reduce" structurally incapable of becoming a ban.** Avoidances are a small _negative_ contribution inside the same 0.1 reblend — architecturally a down-weight, never a hard filter. The architecture, not the copy, is what keeps disordered-eating framing out.
- **It collapses capability 1 and capability 2 into one mental model.** What's starred in the Info list is exactly what's boosted in the queue. One fact, rendered twice.

If you take one thing from this doc: **do not let "goals" grow a second scorer, a second weight tier, or a settings panel.** The moment it does, you've built a different, worse feature.

---

## The biggest risk

**The community tier reads as a prescription despite the badge — and it lands on exactly the populations most primed to over-restrict.**

The community tier exists _for_ postpartum and perimenopausal hair-thinning — under-served groups who are (a) genuinely suffering, (b) under-studied by medicine, and (c) heavily marketed to by the supplement industry (biotin, "hair vitamins"). That is the right reason to build it. It is also the exact audience where a food app subtly surfacing "hair foods" can tip into appearance-anxiety-driven restriction, and where a misread badge becomes "the app told me this fixes my hair."

This is a _trust-and-safety_ risk, not an engineering one, and it's the thing that can sink the feature with one bad screenshot. The mitigations have to be **stronger guardrails, not weaker ones**, and they have to be enforced in _code_, not just copy:

1. **Persistent, non-dismissing amber badge** ("community · less proven") whenever a community goal is active — the one place in the app a badge is deliberately loud.
2. **Mandatory one-time confirm sheet** before activation ("Worth a try — not proven.").
3. **`assertNoMedicalClaim` guard test** over every goal string (build fails on cure/treat/prevent/reverse/heal/diagnose).
4. **A `DISORDERED_EATING_DENYLIST` guard test** (crash/cut/burn/restrict/cleanse/detox/calorie/weight-loss) over every goal string — no weight-loss goal ever ships.
5. **A `biotin` exclusion guard test** asserting no goal boost map ever contains biotin (Grade D, distorts labs) — and no goal copy ever names a supplement as a recommendation.
6. **`FOOD_FIRST_HEDGE`** renders on every condition-adjacent goal, verbatim, exactly as `MealHealthPanel` does today.

The tier label is the _only_ thing that changes between tiers. **The rerank strength never does** — community nudges exactly as gently as established (0.1). Tier changes how loudly we _label_ and how strong the _hedge_ is; it never changes how hard we _rank_.

---

## Recommended design

A thin **Goal layer** over existing machinery. Three new artifacts, no new ranking math:

| Artifact                                           | What                                                                                                            | Reuses                                                   |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `goalWeightMap(goal)` in `deficits.ts`             | Goal → `Map<nutrientKey, weight>`, mirrors `deficitWeightMap`                                                   | `DEFICIT_TARGET` denominator                             |
| `src/data/goals/health-goals.ts`                   | 5 typed `HealthGoal` records (boost map, reduce keys, tier, evidenceNote, safety, sources, `conditionAdjacent`) | `Grade` enum, `assertNoMedicalClaim`, `FOOD_FIRST_HEDGE` |
| Extended goal store (focus nutrient + active goal) | Device-scoped localStorage, run-once, coerce-guarded                                                            | `useNutritionGoal` capture/persist pattern               |

**Data flow (one path, both capabilities):**

```
star a nutrient  ──┐
                   ├─▶ goalWeightMap ──▶ max-merge into dayDeficits
pick a goal     ──┘                          │
                                             ▼
                          existing tRPC pairing.suggest (dayDeficits input)
                                             │
                                             ▼
                          reblendDeficiency @ 0.1  ──▶ side ranked #6 floats into top-3
```

**`HealthGoal` shape** (mirrors `InterventionRecord`, but deliberately _outside_ the `ConditionId`/G1 clinician gate — a nutrient nudge is a dietary preference, not a medical claim):

```ts
{ id, label /* ≤2 words */, tier: Grade /* high|low|very-low, shown as established|emerging|community */,
  boost: ReadonlyMap<nutrientKey, 0..1>, reduce: nutrientKey[] /* added-sugar/refined-carb signals ONLY */,
  evidenceNote, safety, conditionAdjacent: boolean, sources[] }
```

The 5 goals, mapped from the verified literature in EVIDENCE:

| Goal             | Tier          | Boost (nutrient keys)                                                         | Honest one-liner (behind tap)                                                      |
| ---------------- | ------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Low-inflammatory | established   | omega3_g, fiber_g, vitaminC_mg, (oily-fish / olive-oil / legume food signals) | "Benefit is the whole eating pattern — not a single nutrient or a pill."           |
| Energy           | established   | iron_mg, vitaminC_mg                                                          | "Helps mainly if your iron is genuinely low — a ferritin test confirms it."        |
| Gut health       | established   | fiber_g, (fermented-food signals)                                             | "Firm for regularity; the microbiome part is newer."                               |
| Skin             | emerging      | omega3_g, fiber_g (low-GI signals)                                            | "Some evidence, mostly for acne, from short studies."                              |
| Hair             | **community** | iron_mg, zinc_mg, protein_g, vitaminD_mcg, vitaminC_mg                        | "Helps mainly if you're genuinely low — persistent shedding is worth a clinician." |

> **Note on the iron/hair boosts:** `iron_mg` boosts are correct _and_ defensible because the engine only surfaces iron-rich _food_; it never recommends a supplement. The honesty line scopes the claim to "when you're low," matching the RCT subgroup. Keep the boost weights modest so a goal never out-ranks the user's actual taste preference.

---

## How it stays minimalist & frictionless

**Rule 3 (no settings):** capture is a one-tap coach interaction, never a panel.
**Rule 13 (minimal text):** a goal is a button-with-a-label; the _why_ lives behind a tap.

Two entry points, both on surfaces the user is already looking at:

1. **Focus nutrient = tap the star on a row in the Info nutrient list.** "The nutrient I starred" _is_ the goal. Zero new navigation. The starred row pins to the top of the list with a `--nourish-green` star and force-includes into the `keyRows` top slot. Single-focus only (one star at a time — keeps the map one entry and the influence legible). Tap the active star to clear.

2. **Named goal = one quiet `More…` chip** on the existing W47 coach card, opening a one-screen sheet of 5 labels (label + tier dot each, nothing else). One active goal at a time. `Just cooking` turns it off.

**The exact strings the user sees (the entire visible surface):**

| String                                                                                                                                       | Where                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `Iron` (and the other existing row labels)                                                                                                   | Info list — already present                                    |
| ☆ / ★ (toggle glyph, no caption)                                                                                                             | each nutrient row                                              |
| `More…`                                                                                                                                      | W47 coach card chip                                            |
| `Low-inflammatory` · `Energy` · `Gut health` · `Skin` · `Hair`                                                                               | goal picker (label only)                                       |
| `established` · `emerging` · `community` (lowercase, one word)                                                                               | tier dot on chip + Info panel                                  |
| `Less proven`                                                                                                                                | faint divider above community goals in the picker              |
| `community · less proven` (persistent amber pill)                                                                                            | Info panel + goal chip, **community only**                     |
| `Worth a try — not proven.` / `Popular and food-first. The science here isn't settled. Eat normally; never restrict.` / `Try it` / `Not now` | one-time community confirm sheet                               |
| `Food-first ideas — not a replacement for your clinician's plan.`                                                                            | `FOOD_FIRST_HEDGE`, condition-adjacent goals — reused verbatim |
| `Just cooking`                                                                                                                               | goal-off chip                                                  |

No `+iron` label on cards. No "reranked" banner. No number printed beside the star (the %DV bar already encodes it — rule 13d). **Net new persistent UI: one chip, one tier dot, one amber badge.** Everything else is behind a tap.

---

## How it subtly steers discovery

- The goal's nutrient(s) `max`-merge into the day's `dayDeficits` map and ride `reblendDeficiency` at **0.1** — below cuisine fit, flavor contrast, prep burden, every taste dimension. A gap-filling dish at #4–6 quietly rises into the visible top 3. Nothing is removed; nothing announces a re-sort.
- **`max`-merge, never sum** — when a diary deficit and a goal collide on the same key, taking the max prevents double-crediting one nutrient into a visible distortion.
- **Reduce = small capped negative** in the same reblend (keyed off `addedSugar_g` / refined-carb / food-group tags) so heavier-processed sides drift down a slot. It can only break near-ties. It is structurally a down-weight, never a filter.
- **Byte-identical no-op when no goal is set** — empty map, same golden-test guarantee as the diary path. Add a golden test asserting a single goal shifts the top-3 by **at most ~1 slot** so the nudge can't silently escalate.
- **Tier never scales the rerank.** All tiers nudge at 0.1.

**Critical gap — the swipe/quest feed is nutrient-blind today.** `buildQuestDishes` / `buildRoleQuestDishes` score only image/guided/verified/prefs/pantry/time-of-day/difficulty — _zero_ nutrient signal, and the deficiency reblend only touches the **side-pairing** path. The "subtly surface iron-rich dishes in the discovery queue" promise **does not exist for the swipe feed at all.** Wiring it requires calling `getDishNutrition` per quest dish, gating on `NUTRITION_COVERAGE_FLOOR (0.7)`, and adding a _small_ additive bonus alongside `pantryBoost`/`timeOfDayBoost`. **This is the largest piece of real work and should be scoped as its own step — do not pretend it's free.**

---

## Nutrient-goal vs health-plan-goal split

These are two capabilities sharing one engine path. Keep them distinct in the UI and the data model:

|                                      | **Nutrient goal** (capability 1)                                   | **Health-plan goal** (capability 2)                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| What it is                           | One `NUTRIENT_DISPLAY` key                                         | A named bundle of boosts + reduces + an evidence tier                                                                            |
| Capture                              | Tap a star in the Info list                                        | Pick a label from the `More…` sheet                                                                                              |
| Weight map                           | 1 entry                                                            | Multi-entry                                                                                                                      |
| Honesty load                         | Low — "lean toward iron" is a dietary preference, no medical claim | High — every string `assertNoMedicalClaim`'d, `FOOD_FIRST_HEDGE` on condition-adjacent goals, tier badge                         |
| Evidence tier                        | None (it's just a nutrient)                                        | `established` / `emerging` / `community`                                                                                         |
| Lives outside the G1 clinician gate? | Yes, trivially                                                     | **Yes, by deliberate design** — a `HealthGoal` is _not_ a `ConditionId`, so it never inherits the clinician-personalization gate |

**The split that matters most:** a nutrient goal is a _preference_ ("more of this"), so it carries no evidence apparatus. A health-plan goal makes an _implied health claim_ the moment it's named "Skin" or "Hair," so it must carry the full honesty payload. Building them as one undifferentiated thing would either over-burden the nutrient star with evidence chrome it doesn't need, or under-protect the named goals. **Two capture surfaces, one engine, distinct honesty obligations.**

The most important architectural choice here: **health-plan goals deliberately live outside the `ConditionId`/G1 system.** Reusing condition-level evidence would drag in the clinician-approval gate (`registryIsClinicianApproved`) and turn a lightweight nutrient nudge into a clinician-gated medical claim. A goal is a dietary preference with an honest evidence label — _not_ a therapeutic intervention. Document this decision explicitly so nobody later "unifies" them and silently switches on condition personalization.

---

## Evidence tiering & the community mode (given real weight)

**Three tiers, assigned per-goal from the verified literature, mapped onto the existing `Grade` enum** so the tier is a thin honest label over machinery that already grades evidence:

| Tier (user sees) | `Grade`         | Means                                                                                     | Example here                                                                                                                                                    |
| ---------------- | --------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `established`    | high / moderate | Reproduced RCT / meta-analysis / guideline backing for the protocol **as a food pattern** | Low-inflammatory Mediterranean pattern (multiple RCT meta-analyses lower CRP/IL-6); fibre for bowel function; iron-for-fatigue **in the low-ferritin subgroup** |
| `emerging`       | low             | Real trials, but short / small / mixed; mechanism plausible                               | Skin/acne (low-GI RCTs real but short and acne-specific; dairy mixed; collagen weak)                                                                            |
| `community`      | very-low        | Popular + mechanistically plausible, **not established as a food protocol** for the goal  | Hair-thinning (postpartum, perimenopause — groups researchers themselves flag as under-studied)                                                                 |

**Honesty rules that hold even at `established`:**

- Cite the **surrogate** honestly (lowered inflammatory markers, raised microbiome diversity) — never an outcome we didn't measure.
- **Scope the claim to the studied condition** ("when iron is low," not "for everyone tired").
- The low-inflammatory note must say the benefit is the **whole-food pattern, not isolated omega-3 capsules** (supplement RCTs are mixed/null). So we boost oily fish / veg / olive oil / legumes — never a pill.

**How the label stays honest and wires in (disclosure-on-demand):**

- The tier is **one small element** — a coloured dot + single lowercase word on the chip and Info panel. Never a sentence inline.
- **Tap/hold** the dot reveals the `evidenceNote`, the `safety` caveat, `FOOD_FIRST_HEDGE` (if condition-adjacent), and the real source links — reusing the `MealHealthPanel` grade-pill + hedge-footer layout (amber for unreviewed/low, green for high).
- Every human-facing string passes `assertNoMedicalClaim` in the registry guard test (the build fails on a banned claim).
- **A goal is promoted community → emerging → established only when verified sources (and, for condition-adjacent claims, clinician `reviewStatus`) support it.** The tier is stored as the `Grade` enum and earned in the data file's source list — never flippable in the UI. This blocks tier inflation in code.

### The community mode — gated, badged, worded for "tried, not prescribed"

This is the load-bearing piece. Reuse the therapeutics **dormancy-by-default + explicit-badge** discipline; add a **fourth provenance tier** to `feature-flag.ts` (the registry today has only unreviewed-educational vs clinician-approved — there is no "evidence not established, but let the user try it" state).

- **GATED.** Community goals are visually set apart under the faint `Less proven` divider and require an explicit **one-time confirm sheet** before activating — `Worth a try — not proven.` / `Popular and food-first. The science here isn't settled. Eat normally; never restrict.` / `Try it` · `Not now`. (Reuses the therapeutics confirm-sheet pattern — no new infra.) **Env flag defaults OFF in production** until the founder opts in, matching `registryIsClinicianApproved`'s posture (rule 12, founder-gated).
- **BADGED.** While active, a **persistent amber `community · less proven` pill** sits on the Info panel and the goal chip and **never auto-dismisses** — strictly stronger than the quiet dot for emerging/established. Reuse the amber "Clinician review · unreviewed" styling; **never** the green "Reviewed" styling.
- **WORDED for safety.** `biotin` is **deliberately excluded** from the hair boost map (Grade D, distorts labs) — enforced by a guard test asserting "biotin" never appears in any boost map. Copy is strictly food-first; no supplement is ever named as a recommendation. The disclosure names the real caveat: "Helps mainly if you're genuinely low on a nutrient — and persistent shedding is worth a clinician." `FOOD_FIRST_HEDGE` renders (hair is condition-adjacent). **No appearance pressure, no weight/restriction language anywhere** — guard-tested against the `DISORDERED_EATING_DENYLIST`. Time-limited/experimental protocols are never presented as permanent restriction (mirror the existing low-FODMAP "phase, not a lifelong diet" rule).

**Community is a feature with stronger guardrails, not a loophole with weaker ones.** It exists so medicine's under-served can try a sensible food-first plan while the UI states plainly the evidence is not established.

---

## Build sequence

Ship in dependency order; each step is independently valuable and reuses existing infra. AUTO-BUILD unless flagged.

**Step 1 — `goalWeightMap` + focus-nutrient star (capability 1).** _Effort S._
Extend the goal store with `focusNutrient: string | null` (coerce-guarded against `NUTRIENT_DISPLAY` keys, new localStorage key). Add `goalWeightMap()` next to `deficitWeightMap`. Wire the star into `NutritionRingCard`/`buildRows` (pin + glyph; `stopPropagation` so the star doesn't trigger row expansion). On the Today page, `max`-merge the 1-entry map into the existing `dayDeficits` before `pairing.suggest`. Golden test: null focus → byte-identical; single focus shifts top-3 by ≤1 slot. **No engine math, no tRPC schema, no DB change** — it's a client-side union into an input the server already accepts. _Also: delete the dangling W47 `nutritionGoalSoftWeights` dead path — route goals through the real reblend instead of leaving a parallel unused function._

**Step 2 — `HealthGoal` data model + 5 goals + tier dot + disclosure (capability 2, established/emerging only).** _Effort M._
Add `src/data/goals/health-goals.ts` with the 4 non-community goals. Add the `More…` chip + label-only picker. Render the tier dot; tap reveals `evidenceNote`/`safety`/`FOOD_FIRST_HEDGE`/sources reusing `MealHealthPanel`. Add the registry guard test (`assertNoMedicalClaim` + `DISORDERED_EATING_DENYLIST` + biotin-exclusion over all goal strings). Boost maps `max`-merge into `dayDeficits` exactly like step 1.

**Step 3 — Community tier (the hard part).** _Effort M. Env flag FOUNDER-GATED, default OFF in prod._
Add the fourth provenance tier to `feature-flag.ts` + env contract. Add the `Hair` goal, the `Less proven` divider, the one-time confirm sheet, and the persistent amber badge. This is shippable now as **badged-and-dormant**: the schema, the flag, the confirm sheet, the copy — all in code, behind an env flag the founder flips when comfortable (rule 12).

**Step 4 — Quest/swipe-feed nutrient awareness (the biggest gap).** _Effort M–L. Do this last; it's the only piece touching the quest scorer._
Add a `getDishNutrition` lookup per quest dish (gated on `coverage ≥ 0.7`) and a small additive nutrient-boost term in `buildQuestDishes`/`QuestCard` scoring, alongside `pantryBoost`/`timeOfDayBoost`. This extends goal-driven discovery from the side-pairing path to the swipe feed.

**Always:** a STRATEGY.md decision-log entry (the G1-decoupling decision + tiering rationale) and a ROADMAP sequencing entry — _before_ the build, per rules 8–9. There is currently **zero** prior art for this feature in STRATEGY/ROADMAP/docs.

---

## Out of scope (explicit)

- **No new scorer, no new weight tier, no second active goal.** Everything rides the existing 0.1 reblend.
- **No settings page, no preference checklist, no filter panel.** Capture is one tap on a surface the user already sees.
- **No condition personalization.** Health-plan goals stay outside the `ConditionId`/G1 clinician gate by design; this feature must not silently turn on condition-level reranking.
- **No supplements, ever.** Boost maps hold food-derived nutrient keys only; biotin is explicitly excluded and guard-tested.
- **No hard filters from goals.** Reduce is a soft down-weight; hard exclusions remain exclusively the allergen/care-profile path.
- **No weight-loss / restriction / calorie goal.** Denylist-guarded; doesn't ship.
- **No real clinician names, real lab affiliations, or "Reviewed" badge on any goal** — community/emerging tiers are honestly badged; promotion is earned via verified sources, never asserted in the UI.
- **No multi-nutrient star.** Multi-nutrient focus is expressed _only_ through named bundles, keeping the single star unambiguous.

---

## Key file paths

- Engine path to reuse: `src/lib/engine/scorers/deficiency-fill.ts`, `src/lib/engine/pairing-engine.ts` (`reblendDeficiency` ~178-204, wired 272-274), `src/lib/nutrition/deficits.ts` (`deficitWeightMap`, `DEFICIT_TARGET`)
- Transport to extend: `src/lib/trpc/routers/pairing.ts` (`dayDeficits` input), `src/app/(today)/today/page.tsx` (`dayDeficits` memo ~185-191)
- Capture pattern: `src/lib/hooks/use-nutrition-goal.ts` (extend, don't fork), `src/components/today/nutrition-goal-card.tsx`
- Info star surface: `src/components/shared/nutrition-ring-card.tsx` (`buildRows`, `keyRows`)
- Honesty contract: `src/lib/therapeutics/claim-contract.ts` (`assertNoMedicalClaim`, `FOOD_FIRST_HEDGE`), `src/lib/therapeutics/feature-flag.ts` (add 4th tier), `src/components/today/meal-health-panel.tsx` (badge + grade-pill template)
- Nutrient vocabulary: `src/data/nutrition/nutrient-display.ts`
- New artifacts: `src/data/goals/health-goals.ts`, `goalWeightMap()` in `deficits.ts`, extended goal store
- Quest-feed gap: `src/components/today/quest-pool.ts` (`buildQuestDishes`), `src/lib/engine/dish-nutrition.ts` (`getDishNutrition`, `NUTRITION_COVERAGE_FLOOR`)
