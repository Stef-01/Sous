import { describe, expect, it } from "vitest";

import { buildHeroMap } from "./pixel-doberman";
import type { PetMood } from "@/lib/nutrition/pet-state";

const MOODS: PetMood[] = ["asleep", "hungry", "peckish", "content", "thriving"];
const POSES = ["stand", "bow"] as const;
const PALETTE = new Set(["K", "D", "R", "r", "W", "P", "E", "."]);

describe("buildHeroMap", () => {
  it("builds a rectangular grid (every row the same width) for every mood × pose", () => {
    for (const mood of MOODS) {
      for (const pose of POSES) {
        const map = buildHeroMap(mood, pose);
        expect(map.length).toBe(24);
        for (const row of map) {
          expect(row.length).toBe(28);
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
