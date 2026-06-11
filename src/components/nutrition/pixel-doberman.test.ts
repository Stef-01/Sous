import { describe, expect, it } from "vitest";

import { buildHeroMap } from "./pixel-doberman";
import type { PetMood } from "@/lib/nutrition/pet-state";

const MOODS: PetMood[] = ["asleep", "hungry", "peckish", "content", "thriving"];
const POSES = ["stand", "bow"] as const;
const PALETTE = new Set([
  "K",
  "H",
  "S",
  "D",
  "R",
  "r",
  "W",
  "P",
  "E",
  "O",
  ".",
]);

describe("buildHeroMap", () => {
  it("v3: outline contour present, only adjacent to body cells", () => {
    const map = buildHeroMap("content", "stand").map((r) => r.split(""));
    let outlineCells = 0;
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[0].length; x++) {
        if (map[y][x] !== "O") continue;
        outlineCells++;
        const touchesBody = [
          map[y - 1]?.[x],
          map[y + 1]?.[x],
          map[y]?.[x - 1],
          map[y]?.[x + 1],
        ].some((c) => c && c !== "." && c !== "O");
        expect(touchesBody, `floating outline at ${x},${y}`).toBe(true);
      }
    }
    expect(outlineCells).toBeGreaterThan(20);
  });

  it("v3: standing coat carries 3 tones (base, rim light, shadow)", () => {
    const chars = new Set(buildHeroMap("content", "stand").join("").split(""));
    expect(chars.has("K")).toBe(true);
    expect(chars.has("H")).toBe(true);
    expect(chars.has("S")).toBe(true);
  });

  it("builds a rectangular grid (every row the same width) for every mood × pose", () => {
    for (const mood of MOODS) {
      for (const pose of POSES) {
        const map = buildHeroMap(mood, pose);
        expect(map.length).toBe(32);
        for (const row of map) {
          expect(row.length).toBe(40);
        }
      }
    }
  });

  it("uses only palette characters and '.'", () => {
    for (const mood of MOODS) {
      for (const pose of POSES) {
        const chars = new Set(buildHeroMap(mood, pose).join("").split(""));
        for (const ch of chars) {
          expect(PALETTE.has(ch), `unknown char "${ch}"`).toBe(true);
        }
      }
    }
  });

  it("bow pose differs from stand for every mood", () => {
    for (const mood of MOODS) {
      expect(buildHeroMap(mood, "bow").join("\n")).not.toBe(
        buildHeroMap(mood, "stand").join("\n"),
      );
    }
  });

  it("asleep hides the eye shine (no W pixels); awake moods show it", () => {
    for (const pose of POSES) {
      expect(buildHeroMap("asleep", pose).join("")).not.toContain("W");
      for (const mood of MOODS.filter((m) => m !== "asleep")) {
        expect(buildHeroMap(mood, pose).join("")).toContain("W");
      }
    }
  });

  it("ears: pink inner (E) when up, hidden when folded (asleep/hungry)", () => {
    for (const pose of POSES) {
      for (const mood of MOODS) {
        const joined = buildHeroMap(mood, pose).join("");
        if (mood === "asleep" || mood === "hungry") {
          expect(joined).not.toContain("E");
        } else {
          expect(joined).toContain("E");
        }
      }
    }
  });

  it("tongue (P) shows when thriving or in bow pose, otherwise hidden", () => {
    for (const mood of MOODS) {
      expect(buildHeroMap(mood, "bow").join("")).toContain("P");
    }
    expect(buildHeroMap("thriving", "stand").join("")).toContain("P");
    for (const mood of MOODS.filter((m) => m !== "thriving")) {
      expect(buildHeroMap(mood, "stand").join("")).not.toContain("P");
    }
  });

  it("always draws the nose (D) and rust markings (R)", () => {
    for (const mood of MOODS) {
      for (const pose of POSES) {
        const joined = buildHeroMap(mood, pose).join("");
        expect(joined).toContain("D");
        expect(joined).toContain("R");
      }
    }
  });
});
