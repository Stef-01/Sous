# SOP — Recipe (Markdown + images) → Sous catalogue

A standard operating procedure for ingesting a real recipe export (a `.md` +
an `images/` folder, or a `*-export.zip`) into the Sous catalogue as a fully
cookable, fully-nutrition'd dish whose **step photos render in the correct order
inside the guided cook flow**. Run this verbatim every time; do not skip the
cross-check or appraisal gates.

> Provenance/legality: only ingest REAL recipes from reputable sources or the
> founder's own exports (CLAUDE.md rule 7). The photos are real export images,
> NOT AI-generated (rule 11 is about the generation pipeline, not real photos).

---

## 0. Inputs & conventions

- Source lives in `~/Downloads/Recipes/<name>/` or `<name>-export.zip`.
- A recipe is a **meal** (main) → `src/data/meals.json`, or a **side/snack** →
  `src/data/sides.json`. Decide from the recipe's Course/role.
- `slug`: kebab-case, unique across the file. Stefan-curated recipes are
  enumerated in `STEFAN_CURATED_SLUGS` (`src/lib/utils/dish-source.ts`).
- Images: `public/food_images/<slug>/hero.jpg` + `step-1.jpg … step-N.jpg`.
- Step photos live on `StaticCookStep.imageUrl` and are rendered by
  `src/components/guided-cook/step-card.tsx`.

---

## 1. Unzip into a clean per-recipe dir

```bash
mkdir -p /tmp/rcp/<slug>
unzip -o -q "~/Downloads/Recipes/<name>-export.zip" -d /tmp/rcp/<slug>/
# (rm -rf is blocked by the safety hook — use a fresh dir name instead.)
```

Read the `.md`: title, `Source:` URL, `Cuisine:`, `Yield`, `Prep/Cook Time`,
the **Ingredients** list, the numbered **Instructions** (note the section
grouping), and the **nutrition block** (Calories, Carbs, Protein, Fat, SatFat,
Mono/Poly/Trans Fat, Cholesterol, Sodium, Potassium, Fiber, Sugar, Vitamin A in
IU, Vitamin C/Calcium/Iron in mg). Per serving.

---

## 2. Decide the step list, THEN map photos to steps (correct order is the point)

Collapse the instructions into N clear cook steps (each a `StaticCookStep`).
Then map one photo per step. **Mapping fidelity depends on the export:**

- **Manifest-backed export** (`image-manifest.csv` with a `role` column —
  "Hero image", "Prep step", "Cooking step", "Serving shot", …): this is the
  reliable case. `Hero image` → `hero.jpg`; take the `Prep step` + `Cooking
step` rows **in their numbered filename order** and assign them to the steps
  they depict, 1→N. The renamed files (`04-mango-salsa…`, `08-seasoned-raw-
salmon…`) tell you exactly what each shows — match the image's subject to the
  step's action.
- **No manifest (raw `DSCxxxx.jpg`)**: photos are NOT in `.md` order (that's
  alphabetical). Sort by **DSC capture number ascending, treating `0xxx` as
  AFTER `9xxx`** (the shoot rolled over the thousand) — that's process order.
  Map earliest→prep steps, latest plated shots→final/serve steps + `hero`. This
  is a documented **best-effort**, not a labelled mapping — note it in the file
  header and scrutinise it harder in §6.

Write the mapping down (step N ← source file) before copying — it's the artifact
the cross-check verifies against.

---

## 3. Copy + resize the chosen photos

```bash
cp_img() { local s; s=$(find /tmp/rcp -name "$1" | head -1); \
  sips -Z 900 -s formatOptions 82 "$s" --out "$2" >/dev/null 2>&1 && echo "ok $2"; }
mkdir -p public/food_images/<slug>
cp_img "<hero source>"   "public/food_images/<slug>/hero.jpg"
cp_img "<step1 source>"  "public/food_images/<slug>/step-1.jpg"
# … one per step. A step with no good photo gets imageUrl: null (no file).
```

~900px long edge keeps the repo light (~100–200 KB/photo).

---

## 4. Author the guided-cook flow

Add a `StaticDishData` entry (e.g. in `src/data/stefan-curated-recipes.ts`,
spread into `guidedCookData` in `src/data/guided-cook-steps.ts`):

- `name`, `slug`, `description`, `cuisineFamily` (lowercase engine family:
  american/mexican/japanese/italian/…), `prepTimeMinutes`, `cookTimeMinutes`,
  `skillLevel`, `heroImageUrl: "/food_images/<slug>/hero.jpg"`, `flavorProfile`,
  `temperature`.
- `ingredients[]`: `{ id: "<prefix>-<n>", name, quantity, isOptional, substitution }`.
- `steps[]`: `{ phase:"cook", stepNumber (1-indexed sequential!), instruction,
timerSeconds|null, mistakeWarning|null, quickHack|null, cuisineFact|null,
donenessCue|null, imageUrl:"/food_images/<slug>/step-N.jpg"|null }`.
  **stepNumber must match the photo's step number** — this is what keeps the
  picture in the right place.

---

## 5. Catalogue entry, nutrition, source tag, regen

1. `meals.json` / `sides.json` entry: `id`(=slug), `name`, `aliases`,
   `heroImageUrl`, `sidePool` (meals; **verify every id exists in sides.json**)
   or `tags`/`pairingReason`/`nutritionCategory`/`role` (sides),
   `cuisine`, `description`, `source: { creator, url }`.
2. `src/data/nutrition/per-recipe.ts`: a `seed("<slug>", { servingsPerRecipe, …
full panel … })`. Convert **Vitamin A IU → mcg RAE ≈ IU × 0.3**; set
   genuinely-unknown micros (vitaminD/omega3/zinc/magnesium/B12/choline/
   addedSugar) to `0` (honest zeros; provenance is "manual-estimate").
3. Tag the slug in `STEFAN_CURATED_SLUGS` (`src/lib/utils/dish-source.ts`).
4. Regenerate the derived data:
   ```bash
   npx tsx scripts/gen-cook-summary.ts
   node --import tsx scripts/nutrition/resolve-dishes.mjs   # recipe-links
   ```

---

## 6. Cross-check (REQUIRED — do not skip)

```bash
# JSON valid + entry counts moved
node -e "['meals','sides'].forEach(f=>{const a=JSON.parse(require('fs').readFileSync('src/data/'+f+'.json'));console.log(f,a.length)})"
# slug consistency across every layer
for f in src/data/meals.json src/data/sides.json src/data/stefan-curated-recipes.ts src/data/nutrition/per-recipe.ts src/lib/utils/dish-source.ts; do echo "$f: $(grep -c '<slug>' $f)"; done
# every step image + hero exists on disk and matches the step count
ls public/food_images/<slug>/
```

Manual cross-check list:

- [ ] slug identical in meals/sides ↔ guided-cook ↔ per-recipe ↔ STEFAN_CURATED_SLUGS.
- [ ] every `sidePool` id exists in `sides.json`.
- [ ] `step-N.jpg` count == number of steps with a non-null `imageUrl`.
- [ ] each step's photo actually depicts that step's action (open the files).
- [ ] `npx tsc --noEmit` clean.

---

## 7. Critical appraisal in the running app (REQUIRED)

Start the preview, open the cook flow, and **walk every step**:

1. `/cook/<slug>` → Mission (title, time, flavor tags, description correct).
2. → Grab (ingredients + quantities + "watch for" warnings correct).
3. → Cook: **for each step, confirm the photo shown matches the instruction**
   (e.g. the "mix the salsa" step shows the mixed-salsa photo, not the glaze).
   Screenshot at least step 1 and one mid-cook step.
4. Confirm `heroImageUrl` renders on the Today card / deck preview.
5. Fetch every image URL and assert HTTP 200.

If ANY photo is out of order or mismatched: fix the `imageUrl`↔`stepNumber`
mapping (§2/§4) and re-appraise. Repeat until perfect.

---

## 8. RCA round + gates (REQUIRED — no shortcuts)

- Run an adversarial self-review (or a review subagent) over the diff: slug
  collisions, duplicate ids, wrong nutrition units, mismatched/late photos,
  broken pairings.
- `pnpm lint && pnpm test && pnpm build` — all green.
- Add/extend a test if the recipe exercises new data shape.
- Commit to main with a message listing the recipe + step-image mapping method
  (manifest vs capture-order) and the verification done.

---

## Reference implementation

Commits `e9d6334` (3 recipes + per-step photos) and `3e5ca24` (review fixes)
are the worked example; `docs/STEFAN-CURATED-RECIPES.md` records the catalogue
of what's been ingested and the per-recipe mapping fidelity.
