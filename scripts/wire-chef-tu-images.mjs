/**
 * Wire Chef Tu David Phu's (partner-authorized) downloaded photos into the
 * catalog: point each tu- dish's heroImageUrl/imageUrl at the local
 * /food_images/<snake_id>.jpg, but ONLY when that file actually exists on disk.
 *
 * This makes the step safe after adversarial image verification: if any image
 * was flagged as a wrong/mismatched photo and deleted, that dish simply keeps
 * heroImageUrl=null (gradient+emoji fallback) and its reference stays
 * "reshoot-needed" — nothing wrong ever gets shipped.
 *
 *   node scripts/wire-chef-tu-images.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const mealsPath = path.join(ROOT, "src/data/meals.json");
const sidesPath = path.join(ROOT, "src/data/sides.json");
const refsPath = path.join(ROOT, "src/data/chef-tu-image-references.json");

const meals = JSON.parse(fs.readFileSync(mealsPath, "utf8"));
const sides = JSON.parse(fs.readFileSync(sidesPath, "utf8"));
const refsDoc = JSON.parse(fs.readFileSync(refsPath, "utf8"));

const localFor = (id) => `/food_images/${id.replace(/-/g, "_")}.jpg`;
const fileExists = (id) =>
  fs.existsSync(path.join(ROOT, "public", localFor(id)));

let wiredMeals = 0;
let wiredSides = 0;
let skipped = [];

for (const m of meals) {
  if (!m.id.startsWith("tu-")) continue;
  if (fileExists(m.id)) {
    m.heroImageUrl = localFor(m.id);
    wiredMeals++;
  } else {
    m.heroImageUrl = null;
    skipped.push(m.id);
  }
}
for (const s of sides) {
  if (!s.id.startsWith("tu-")) continue;
  if (fileExists(s.id)) {
    s.imageUrl = localFor(s.id);
    wiredSides++;
  } else {
    s.imageUrl = null;
    skipped.push(s.id);
  }
}

// update the reference doc status
for (const r of refsDoc.references) {
  if (fileExists(r.id)) {
    r.status = "incorporated";
    r.localPath = localFor(r.id);
  } else {
    r.status = "reshoot-needed";
  }
}
refsDoc._README =
  "Chef Tu David Phu's recipe-library photos, incorporated with the partner chef's authorization. `localPath` is the self-hosted copy now used by the app (public/food_images/*.jpg); `sourceImageUrl` is the original on his site. These interim photos will be replaced by the original aesthetic plate photoshoot, after which `status` flips back to reshoot and localPath is repointed to the new /food_images/*.png.";

fs.writeFileSync(mealsPath, JSON.stringify(meals, null, 2) + "\n");
fs.writeFileSync(sidesPath, JSON.stringify(sides, null, 2) + "\n");
fs.writeFileSync(refsPath, JSON.stringify(refsDoc, null, 2) + "\n");

console.log(
  `wired ${wiredMeals} meals + ${wiredSides} sides to local images` +
    (skipped.length
      ? `; skipped (no file → fallback): ${skipped.join(", ")}`
      : ""),
);
