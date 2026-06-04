# Culinary Therapeutics — Critical Appraisal for Clinician Prototype Review

> **Status:** Prototype for clinician evaluation · 2026-06-04
> **Audience:** Reviewing clinicians (dietitians, gastroenterologists, lipidologists, GPs) + founder
> **Purpose:** Honestly appraise what the therapeutics module IS, what it is NOT,
> what is ready for clinician critique, and the specific decisions we need
> clinician input on before any patient-facing use.
> **Hard constraint:** Nothing here is clinician-approved. Every record is
> `reviewStatus: "unreviewed"`, `isEducational: true`. This document exists so
> clinicians can tell us where the system is wrong.

---

## 1. What the system is (one paragraph)

A static, versioned, machine-readable **evidence registry** (10 conditions, 23
graded intervention records, a nutrient-interaction map, escalation notes) plus
an **engine** that (a) matches a dish to the food-first interventions it
realizes by _food identity_ (resolved ingredients → food groups/therapeutic
classes, not keyword spelling), (b) optionally re-ranks side-dish suggestions on
a therapeutic-fit dimension weighted _below_ taste, (c) runs hard dietary
exclusions first (e.g. celiac → gluten-free), and (d) surfaces graded evidence
with mandatory food-first hedging and an anti-overclaiming language contract.
Everything is gated behind two human sign-offs (G1 clinical, G5 legal) and is
invisible to end users.

## 2. Clinical design choices we made deliberately (please challenge each)

| Choice                                                                                                                                                                                                     | Rationale                                                                            | Where to push back                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Food-first, not food-only.** Every condition carries an escalation note; a mandatory hedge ("not a replacement for your clinician's plan") renders on every claim.                                       | The report's central caution.                                                        | Is the hedge strong/visible enough? Should certain conditions (celiac, IBD flares) carry a _stronger_ "see your clinician first" gate before _any_ food suggestion?      |
| **Anti-overclaiming spine.** Records are classed `recipe-native` / `fortified-food` / `extract-or-supplement`; only the first two can ever move a recipe's score. Supplements/extracts are education-only. | A recipe app must not imply a turmeric capsule's RCT applies to a turmeric dish.     | Is this the right line? Are there fortified-food cases you'd reclassify?                                                                                                 |
| **GRADE-style confidence** (high/moderate/low/very-low) on every record, with pooled effect sizes + CIs where we have them.                                                                                | Make uncertainty legible, not hidden.                                                | Are our grades defensible? Effect sizes are transcribed from the source report and **need your verification** — this is the core G1 task.                                |
| **Adherence-weighted ranking.** The therapeutic dimension is weighted 0.18, _below_ cuisine-fit and flavor-contrast (0.22 each).                                                                           | "Adherence is what makes a therapeutic diet work" — a dish nobody eats helps no one. | Is 0.18 right? Too low to matter? Too high for weak-evidence conditions? Should the weight scale with GRADE?                                                             |
| **Hard exclusions run first.** Celiac forces gluten-free before any optimization; it overrides preferences.                                                                                                | Standard of care; not a "preference."                                                | We can't yet attest certified/cross-contact safety — currently a UI warning, not a filter. Is a warning acceptable, or must we hard-block uncertified dishes for celiac? |
| **No labs, no diagnosis, no EHR.** Runs only on a self-reported "care profile" (conditions + dietary avoids).                                                                                              | Avoids practicing medicine; labs/EHR are a later founder gate (G3).                  | Does self-report without lab context create risk (e.g. someone self-labels "low iron" and over-relies on food)?                                                          |
| **Claim language is contractually constrained.** `assertNoMedicalClaim` bans cure/treat/reverse/heal/prevent/diagnose across every human-facing string, enforced by a test.                                | FTC/FDA structure-function safety (G5 legal).                                        | Are there phrasings we pass that you'd still consider a claim? Any we ban that you'd allow?                                                                              |

## 3. What is genuinely ready for your review

- **The evidence registry** — every condition × intervention with grade, class,
  effect size (+CI/I² where present), dose signal, the recipe signals that
  trigger it, and the exact claim-safe application note a user would see. This is
  the substance to critique. **(See the Clinician Review surface — §6.)**
- **The matching logic** — you can see, per dish, which interventions it
  surfaces and _why_ (which food-identity signal matched). The "Masoor Dal →
  legume → Portfolio/Mediterranean evidence" path is inspectable.
- **The interaction rules** (iron + vitamin C, LDL viscous-fiber stacking, etc.).
- **The escalation + exclusion logic.**
- **The scoring methodology** — the weight vector and how the therapeutic
  dimension blends in.

## 4. Honest limitations (do not mistake the prototype for the product)

1. **Effect sizes are unverified.** Transcribed from a synthesis report, not
   re-extracted from primary literature with DOIs. Verifying these is the G1
   task. Treat every number as provisional.
2. **No real citations yet.** `sources` carry descriptive titles + study types,
   not DOIs/URLs. Clinician review attaches the real references.
3. **Nutrition composition is approximate.** Per-serving macros are composed from
   a 88-ingredient USDA registry; coverage is 84% of recipe lines, deep-frying
   oil and serving counts are modeled with heuristics. We deliberately surface
   _food-group composition_ (mass/serving-independent, robust) rather than
   absolute macro numbers in the UI. The numbers exist for the system to reason
   over; they are not yet display-grade.
4. **Condition coverage is narrow** — 10 conditions, chosen for food-first
   evidence strength. Not a general medical-nutrition tool.
5. **No personalization safety net.** When personalized re-ranking is on, there
   is no check that the _quantity_ of an intervention in a dish meets the
   `doseSignal` (e.g. "≥3 g/day beta-glucan") — it matches presence, not dose.
   This is a known gap; dose-aware matching needs the quantity layer to mature.

## 5. The specific decisions we need from clinicians

1. **Per-record sign-off** — for each of the 23 records: is the grade right? the
   effect size right? the application note safe and accurate? Approve / revise / reject.
2. **Condition gating** — should any condition require a "see your clinician"
   interstitial before food suggestions (celiac, IBD, anyone on warfarin re:
   vitamin K greens)?
3. **The vitamin-K / anticoagulation interaction** — we surface leafy greens for
   several conditions; should we add an interaction warning for patients on
   warfarin? (Currently absent — a candidate safety gap.)
4. **Dose realism** — is presence-matching (vs dose-matching) acceptable for an
   educational prototype, or misleading?
5. **The weight (0.18)** and whether it should scale with evidence grade.

## 6. How to evaluate it (the Clinician Review surface)

A read-only review surface at **`/clinician`** renders the entire registry +
methodology in one place: every condition, every intervention with full
provenance, the interaction map, escalation notes, the scoring weights, and the
claim contract — each clearly marked unreviewed. Open it, work down each
condition, and mark where we are wrong. In the prototype build, the per-dish
health panel also runs in **clinician-review mode** (personalization visible, but
badged "Clinician review · unreviewed" — never "approved"), so you can see the
end-to-end behavior you are signing off on.

## 7. Our recommendation

The architecture is sound and claim-safe; the **content needs you**. We recommend
a first review pass focused on §5.1 (per-record sign-off) and §5.3 (the warfarin/
vitamin-K safety gap), since those are the highest-risk items between here and any
patient-facing pilot. Everything in the engine is built to let your revisions land
as data edits (a record's grade/effect/note/reviewStatus), not code changes.
