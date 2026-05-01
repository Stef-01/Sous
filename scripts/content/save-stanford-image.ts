#!/usr/bin/env tsx
/**
 * save-stanford-image.ts — W3 deliverable from CONTENT-POPULATION-PHASE.md.
 *
 * Downloads an image from a Stanford-domain (or other authorised)
 * URL, resizes + re-encodes it as WebP at q=82, writes to
 * /public/content/<slug>/<filename>.webp, and prints a TypeScript
 * snippet ready to paste into the matching `src/data/content/*.ts`
 * entry's coverImageUrl + four attribution fields.
 *
 * Lives outside src/ so it never ships in the client bundle.
 *
 * Usage:
 *   pnpm tsx scripts/content/save-stanford-image.ts \
 *     --src "https://lifestyle.stanford.edu/path/image.jpg" \
 *     --slug "carbs-are-not-the-enemy" \
 *     --filename "hero" \
 *     --title "Stanford Lifestyle Medicine"
 *
 * Dependencies (devDependency):
 *   - sharp  (added on first run via `pnpm add -D sharp` if missing)
 */

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

interface Args {
  src: string;
  slug: string;
  filename: string;
  title: string;
  width: number;
  quality: number;
}

function parseArgs(argv: string[]): Args {
  const get = (key: string): string | undefined => {
    const idx = argv.indexOf(`--${key}`);
    return idx >= 0 ? argv[idx + 1] : undefined;
  };
  const src = get("src");
  const slug = get("slug");
  const filename = get("filename") ?? "hero";
  const title = get("title") ?? "Stanford";
  const width = Number(get("width") ?? "1080");
  const quality = Number(get("quality") ?? "82");
  if (!src || !slug) {
    console.error(
      "usage: save-stanford-image.ts --src <url> --slug <slug> [--filename hero] [--title 'Stanford Lifestyle Medicine'] [--width 1080] [--quality 82]",
    );
    process.exit(1);
  }
  return { src, slug, filename, title, width, quality };
}

async function loadSharp(): Promise<typeof import("sharp")> {
  try {
    return (await import("sharp")) as unknown as typeof import("sharp");
  } catch {
    console.error(
      "sharp is required but not installed. Run: pnpm add -D sharp",
    );
    process.exit(1);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sharp = await loadSharp();

  const repoRoot = resolve(process.cwd());
  const outRel = `public/content/${args.slug}/${args.filename}.webp`;
  const outAbs = resolve(repoRoot, outRel);
  await mkdir(dirname(outAbs), { recursive: true });

  // Fetch the source image as bytes. Bail loudly on non-2xx so we
  // never quietly write a 404 page as a "photo".
  const res = await fetch(args.src);
  if (!res.ok) {
    console.error(`fetch ${args.src} failed: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const inputBuffer = Buffer.from(await res.arrayBuffer());

  // Resize (preserve aspect, never upscale) + WebP encode.
  await sharp
    .default(inputBuffer)
    .resize({ width: args.width, withoutEnlargement: true })
    .webp({ quality: args.quality })
    .toFile(outAbs);

  // Permission-evidence path is conventional, not auto-saved here.
  const permissionEvidence = `docs/content-sources/${args.slug}/permission.png`;
  const permissionExists = existsSync(resolve(repoRoot, permissionEvidence));

  const fetchedAt = new Date().toISOString();

  console.log(`\n✓ wrote ${outRel}\n`);
  if (!permissionExists) {
    console.warn(
      `WARN: ${permissionEvidence} does not exist yet. Save the permission screenshot/email there before merging.`,
    );
  }
  console.log("paste this into the matching content data file:\n");
  console.log(`coverImageUrl: "/content/${args.slug}/${args.filename}.webp",`);
  console.log(`isPlaceholder: false,`);
  console.log(`sourceUrl: "${args.src}",`);
  console.log(`sourceTitle: "${args.title}",`);
  console.log(`sourceFetchedAt: "${fetchedAt}",`);
  console.log(`permissionEvidence: "${permissionEvidence}",`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
