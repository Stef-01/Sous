# Stefan-curated recipes + the "custom" / source taxonomy

This documents the recipe ingestion from `~/Downloads/Recipes` and the Source
filter changes that went with it (commits `a561ffe`…`3e5ca24`).

## What shipped

**Five real recipes** were ingested from the founder's structured exports
(Simply Scratch) and a published Erewhon-dupe source (Clean Program), each with
full guided-cook steps, full per-serving nutrition, and a **real photo on every
step** (bar one intentional photo-less blend step):

| Slug                              | Type             | Step images                  |
| --------------------------------- | ---------------- | ---------------------------- |
| `honey-glazed-salmon-mango-salsa` | main (American)  | manifest-mapped (roles)      |
| `cheesy-beef-enchiladas-verde`    | main (Mexican)   | capture-order (DSC sequence) |
| `air-fryer-edamame`               | side (Japanese)  | manifest-mapped (roles)      |
| `turmeric-crush-smoothie`         | drink (American) | visual-inspection mapping    |
| `coconut-cloud-smoothie`          | drink (American) | visual-inspection mapping    |

Plus the provided **Black Bean Brownie** photos were wired onto its five
existing steps. All six are tagged **Stefan (curated)** via
`STEFAN_CURATED_SLUGS` in `src/lib/utils/dish-source.ts`. The two smoothies are
`role: "drink"` sides (like `thai-iced-tea`), cookable at `/cook/<slug>`.

- Catalogue entries: `src/data/meals.json` / `src/data/sides.json` (with
  `source: { creator: "Stefan", url }`).
- Guided-cook flows: `src/data/stefan-curated-recipes.ts` (spread into
  `guidedCookData`); each `StaticCookStep.imageUrl` → `public/food_images/<slug>/step-N.jpg`.
- Nutrition: `src/data/nutrition/per-recipe.ts` (full macro + micro panel from
  the export; `seed()` now spreads all provided fields).
- Images: `public/food_images/<slug>/` (`hero.jpg` + `step-N.jpg`), resized ~900px.

**Step→image mapping fidelity:** salmon + edamame ship an `image-manifest.csv`
with labelled roles (Hero / Prep step / Cooking step), so their mapping is
exact. The enchiladas export has no manifest — its photos are mapped by the
shoot's DSC capture order (≈ process order), so it's a close best-effort, not a
labelled mapping. The two smoothies ship generic `unnamed (n).jpg` files with
**no manifest and no capture order**, so each photo was mapped to its step by
**visual inspection** of the contents (mise → process → finished) per SOP §2,
then re-verified by walking the running cook flow. The instruction prose is
original, written from the published ingredient list + method (facts only); the
per-serving nutrition is a manual estimate (the source states none).

## Source taxonomy (multi-select)

The Today **Source** filter is now multi-select checkboxes (OR semantics; empty
= any). Facets: Nourish Verified · **Stefan (curated)** · Chef Tu · Clean
Program · **My creations** · Sous Original. Provenance derives from the slug
(`tu-` = Chef Tu, `custom-` = a user creation, enumerated sets for Stefan /
Clean Program) or from an explicit `source` on injected dishes.

## "My creations"

User-authored recipe drafts (`/path/recipes`) now surface in the Today deck
tagged **My creations**, routed through a `custom-<slug>` cook URL so they never
collide with a catalogue slug.

## Deferred (needs founder input — rule 12)

- **Erewhon smoothie dupes** — ✅ DONE. The `Tumeric Erewhon` / `Blue Coconut
Erewhon` folders were image-only, so the real published dupe recipes were
  sourced (Clean Program: Turmeric Crush + Coconut Cloud), ingredients + method
  written in original prose, per-serving nutrition estimated, and the provided
  photos mapped to steps by visual inspection. Shipped as the two `drink` sides
  above.
- **Paste-bridge "recipe" kind:** the import sheet covers pantry / groceries /
  food log. A fourth "recipe" kind (paste an AI-generated recipe → a custom
  creation) is a natural extension; it needs a nutrition-storage path for user
  recipes first (their nutrition is computed from ingredients today, with no
  per-recipe override store).
