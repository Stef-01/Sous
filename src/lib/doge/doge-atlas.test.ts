import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Locks the generated Doberman atlases (scripts/gen-doge-atlas.mjs) to the
 * geometry the vendored engine expects: a 4x4 grid at the per-life-stage cell
 * size (PetDefinition.spritesheetDefinitions), so spriteSkin sampling stays
 * aligned. Dependency-free — parses each PNG's IHDR width/height directly.
 */

const DOGE_DIR = resolve(process.cwd(), "public/tamaweb/resources/img/doge");

interface Manifest {
  [stage: string]: { path: string; cellSize: number };
}
const manifest: Manifest = JSON.parse(
  readFileSync(resolve(DOGE_DIR, "doge-atlas.manifest.json"), "utf8"),
);

// Must match PetDefinition.spritesheetDefinitions (cellSize per life stage).
const EXPECTED_CELL_SIZE: Record<string, number> = {
  baby: 16,
  child: 24,
  teen: 24,
  adult: 32,
  elder: 32,
};

/** Read width/height from a PNG's IHDR (bytes 16-23, big-endian). */
function pngSize(file: string): { width: number; height: number } {
  const buf = readFileSync(file);
  // PNG signature (8) + length (4) + "IHDR" (4) then width(4) height(4)
  expect(buf.subarray(12, 16).toString("ascii")).toBe("IHDR");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe("doge atlas manifest", () => {
  it("covers all five life stages", () => {
    expect(Object.keys(manifest).sort()).toEqual(
      ["adult", "baby", "child", "elder", "teen"].sort(),
    );
  });

  for (const stage of Object.keys(EXPECTED_CELL_SIZE)) {
    it(`${stage}: 4x4 atlas at the engine's cell size`, () => {
      const entry = manifest[stage];
      expect(entry).toBeDefined();
      expect(entry.cellSize).toBe(EXPECTED_CELL_SIZE[stage]);
      expect(entry.path).toBe(`resources/img/doge/doge_${stage}.png`);

      const { width, height } = pngSize(resolve(DOGE_DIR, `doge_${stage}.png`));
      // 4 columns x 4 rows of cellSize cells.
      expect(width).toBe(entry.cellSize * 4);
      expect(height).toBe(entry.cellSize * 4);
    });
  }
});
