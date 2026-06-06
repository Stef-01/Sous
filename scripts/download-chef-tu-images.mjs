/**
 * Download Chef Tu David Phu's recipe-library photos into the local image
 * store. Authorized by the partner chef for incorporation into Sous.
 *
 * Reads src/data/chef-tu-image-references.json (the source URLs), downloads
 * each into public/food_images/<snake_id>.jpg, and validates it is a real,
 * non-trivial JPEG (HTTP 200 + JPEG magic bytes FF D8 FF + sane size). Prints a
 * report. Idempotent — re-running re-fetches. Files are committed (self-hosted,
 * like the other 130 food images); the aesthetic reshoot later replaces them.
 *
 *   node scripts/download-chef-tu-images.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const refs = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "src/data/chef-tu-image-references.json"),
    "utf8",
  ),
).references;
const OUT = path.join(ROOT, "public/food_images");
const fileFor = (id) => `${id.replace(/-/g, "_")}.jpg`;
const MIN_BYTES = 4096;

const results = [];
for (const r of refs) {
  const file = fileFor(r.id);
  const dest = path.join(OUT, file);
  try {
    const res = await fetch(r.sourceImageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Sous recipe importer; partner-authorized)",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      results.push({ id: r.id, file, ok: false, reason: `HTTP ${res.status}` });
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const isJpeg =
      buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    if (!isJpeg) {
      results.push({
        id: r.id,
        file,
        ok: false,
        reason: `not a JPEG (magic ${buf.slice(0, 3).toString("hex")})`,
        bytes: buf.length,
      });
      continue;
    }
    if (buf.length < MIN_BYTES) {
      results.push({
        id: r.id,
        file,
        ok: false,
        reason: `suspiciously small (${buf.length}B) — possible removed-image placeholder`,
      });
      continue;
    }
    fs.writeFileSync(dest, buf);
    results.push({ id: r.id, file, ok: true, bytes: buf.length });
  } catch (e) {
    results.push({ id: r.id, file, ok: false, reason: String(e.message || e) });
  }
}

const ok = results.filter((r) => r.ok);
const bad = results.filter((r) => !r.ok);
console.log(`downloaded ${ok.length}/${results.length} → public/food_images/`);
for (const r of ok)
  console.log(`  ✓ ${r.file}  (${(r.bytes / 1024).toFixed(0)} KB)`);
if (bad.length) {
  console.log(`\nFAILED (${bad.length}):`);
  for (const r of bad) console.log(`  ✗ ${r.id}: ${r.reason}`);
}
