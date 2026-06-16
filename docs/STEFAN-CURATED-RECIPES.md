# Stefan-curated recipes + the "custom" / source taxonomy

This documents the recipe ingestion from `~/Downloads/Recipes` and the Source
filter changes that went with it (commits `a561ffe`…`3e5ca24`).

## What shipped

**Three real recipes** were ingested from the founder's structured exports
(Simply Scratch), each with full guided-cook steps, full per-serving nutrition,
and a **real photo on every step**:

| Slug                              | Type            | Step images                  |
| --------------------------------- | --------------- | ---------------------------- |
| `honey-glazed-salmon-mango-salsa` | main (American) | manifest-mapped (roles)      |
| `cheesy-beef-enchiladas-verde`    | main (Mexican)  | capture-order (DSC sequence) |
| `air-fryer-edamame`               | side (Japanese) | manifest-mapped (roles)      |

Plus the provided **Black Bean Brownie** photos were wired onto its five
existing steps. All four are tagged **Stefan (curated)** via
`STEFAN_CURATED_SLUGS` in `src/lib/utils/dish-source.ts`.

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
labelled mapping.

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

- **Erewhon smoothie dupes** (`Tumeric Erewhon`, `Blue Coconut Erewhon` folders):
  image-only, no recipe text or nutrition in the export. The "full nutrition
  required" rule forbids fabricating it, so these are NOT ingested. To add them,
  supply the recipe (ingredients + steps) and per-serving nutrition, or approve
  sourcing a real published dupe recipe.
- **Paste-bridge "recipe" kind:** the import sheet covers pantry / groceries /
  food log. A fourth "recipe" kind (paste an AI-generated recipe → a custom
  creation) is a natural extension; it needs a nutrition-storage path for user
  recipes first (their nutrition is computed from ingredients today, with no
  per-recipe override store).
