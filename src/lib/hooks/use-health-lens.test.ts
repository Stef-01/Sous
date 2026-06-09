import { describe, expect, it, beforeEach, vi } from "vitest";
import { lensFilter, setHealthLens, HEALTH_LENSES } from "./use-health-lens";

describe("lensFilter — Phase 10 gating + honesty defaults", () => {
  it("everyday (default) shows NEITHER evidence nor herbs — the clean casual view", () => {
    expect(lensFilter("everyday")).toEqual({
      showEvidence: false,
      showHerbs: false,
    });
  });
  it("therapeutic shows evidence rows only", () => {
    expect(lensFilter("therapeutic")).toEqual({
      showEvidence: true,
      showHerbs: false,
    });
  });
  it("ayurvedic shows herb notes only", () => {
    expect(lensFilter("ayurvedic")).toEqual({
      showEvidence: false,
      showHerbs: true,
    });
  });
  it("NO lens ever shows both optional layers at once", () => {
    for (const l of HEALTH_LENSES)
      expect(lensFilter(l).showEvidence && lensFilter(l).showHerbs).toBe(false);
  });
  it("everyday is the FIRST (default) lens", () => {
    expect(HEALTH_LENSES[0]).toBe("everyday");
  });
});

describe("setHealthLens persistence", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = v;
        },
      },
    });
  });
  it("persists the chosen lens across reload", () => {
    setHealthLens("therapeutic");
    expect(window.localStorage.getItem("sous-health-lens-v1")).toBe(
      "therapeutic",
    );
    setHealthLens("everyday");
    expect(window.localStorage.getItem("sous-health-lens-v1")).toBe("everyday");
  });
});
