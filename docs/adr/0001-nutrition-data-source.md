# ADR 0001 — Nutrition Data Source for Parent Mode

> **Date:** 2026-05-04 (Phase A · Week 1)
> **Status:** Accepted
> **Deciders:** Stefan + Sous core
> **Reads from:** [`PARENT-MODE-RESEARCH.md`](../PARENT-MODE-RESEARCH.md) §6 open question 1, [`PARENT-MODE-PLAN.md`](../PARENT-MODE-PLAN.md) §5.4, [`STAGE-1-2-6MO-TIMELINE.md`](../STAGE-1-2-6MO-TIMELINE.md) week 1

---

## Context

Parent Mode requires per-serving nutrition data on every quest-eligible meal to:

1. Compute FDA-threshold nutrient claims (`high in` ≥ 20 % DV, `good source` ≥ 10 %).
2. Drive the `nutrient-spotlight` engine that surfaces 0–1 safe call-outs per recipe.
3. Power future surfaces (allergen filtering V1.1, sodium budget pairing in Stage 3+).

Three viable sources:

| Option                                  | One-time cost                                                   | Recurring cost               | Latency to first usable data                                          | Long-term flexibility                      |
| --------------------------------------- | --------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------- | ------------------------------------------ |
| **USDA FoodData Central** (build)       | ~80 hours engineering for ingredient mapping + per-serving math | $0                           | Slower (week 3 to populate top 30; weeks of catch-up to full catalog) | High — own the pipeline, no API dependency |
| **Edamam Nutrition Analysis API** (buy) | ~1–2 hours integration                                          | $50–500 / month at our scale | Same-day                                                              | Medium — vendor lock, ToS pivots           |
| **Spoonacular** (buy)                   | ~1–2 hours integration                                          | $30–300 / month at our scale | Same-day                                                              | Medium — same risks as Edamam              |

## Decision

**We build, on top of USDA FoodData Central.**

The decision is bound by two non-negotiable constraints from the founder:

1. **Sous is and will remain a free public-good system.** No paid tier, no premium nutrition layer, no ads. Therefore: no recurring per-API-call cost we cannot eat indefinitely.
2. **Parent Mode is V1 launch-critical.** It cannot depend on a vendor whose pricing model could pivot under a small free-app traffic profile (Edamam's free tier is rate-limited; Spoonacular's free tier is API-key-gated).

USDA FoodData Central is a U.S. government open dataset with no rate limits, no per-call cost, public-domain licensing, and authoritative provenance — the same source the FDA references for the Daily Value table. It is the natural fit for a free public-good app.

## Consequences

### Accepted costs

- **~80 hours of engineering** spread across Phase A (mostly Week 3 and Phase D Week 20). The mapping pipeline is one-time work; once a meal is mapped, additions are cheap.
- **Slower first-data**: top-30 meal coverage by end of Phase A Week 3. Full catalog (~75 quest-eligible meals) by Phase D Week 20.
- **Approximation error**: per-serving values will be ±10–15 % of canonical because home recipes vary by ingredient brand, ripeness, and prep. We accept this; the FDA threshold buckets (`high in` / `good source`) are coarse enough that the approximation error rarely shifts a claim tier.

### Mitigated risks

- **Long-term cost drift**: zero — USDA is taxpayer-funded, not commercial.
- **Vendor lock**: zero — we own every line of the mapping pipeline.
- **Audit defensibility**: USDA provenance is the strongest possible substantiation if the FTC ever asks.

### Implementation contract

- Mapping pipeline lives in `scripts/nutrition/usda-import.ts` (to be built in Week 3).
- Per-recipe output stored as a sibling JSON keyed by meal slug: `src/data/nutrition/per-recipe.json` (do **not** balloon `meals.json`).
- Each entry carries a `provenance: 'usda-fdc'` field and a `confidence: 'mapped' | 'approximated'` flag. Approximated entries display the methodology tooltip with a note that the value is an estimate; mapped entries display USDA attribution.
- A build-time check (`nutrition-coverage.test.ts`) flips on once the schema is stable and refuses to build if a quest-eligible meal lacks nutrition data.

## Pricing posture (decided concurrently)

The entire Sous platform — Today, Path, Content, Parent Mode, every present and planned feature — **is and will remain free**. There is no premium tier, no paywall, no ad surface, no data resale. This is a deliberate public-good posture and constrains every downstream decision: third-party services are chosen for free / educational / non-commercial fit; legal review (Phase D Week 23) frames Parent Mode as free educational content (which sits comfortably under FDA structure/function rules without crossing into health-claim territory); and the editorial Content tab uses sample placeholders or partner-attributed content rather than paid sponsorships.

This pricing decision was originally deferred to Phase E Week 25; it is moved up to here because every nutrition-data and editorial-partner choice downstream depends on it.

## Alternatives considered (and rejected)

- **Edamam free tier**: 5 calls/min, 10k/month — fine for a prototype, immediately throttled at any real traffic. Reject.
- **Spoonacular free tier**: 150 points/day with the analyze-recipe endpoint costing 1 point per ingredient — also immediately throttled. Reject.
- **Hybrid (USDA for mapped meals, paid API for fallback)**: introduces vendor risk we said we wouldn't take. Reject.
- **Crowdsource nutrition values from the cooking community**: no editorial QA capacity in-house; rejection-class accuracy risk for a kid-targeted feature. Reject.
- **Skip nutrient spotlight from V1**: undercuts the educational value that justifies Parent Mode's existence. Reject.

## Rollback

If USDA's mapping pipeline turns out to take significantly longer than estimated or accuracy is unacceptable on field tests in cohort 1 (Phase D Week 21), the rollback is to **disable the nutrient spotlight surface entirely** for V1 and ship Parent Mode without it. Parent Mode's other surfaces (kid-friendliness scoring, spice slider, kid-swap chip, kids-ate-it, lunchbox, component split) all stand on their own. Nutrition is the highest-effort surface but not load-bearing for the core kid-eats-it value prop.

This rollback is preferred to switching to a paid API mid-flight because it preserves the free-public-good posture without re-opening that decision.

## Review trigger

Re-evaluate this ADR if:

- USDA FoodData Central deprecates public access (unlikely, statutory-backed).
- A pediatric-nutrition-focused open dataset emerges with better food-recipe granularity than USDA SR Legacy / Foundation Foods.
- Sous changes its free-public-good pricing posture (currently locked).

Otherwise this ADR holds indefinitely.
