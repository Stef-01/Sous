import { describe, expect, it } from "vitest";
import type {
  RecipeProvenance,
  RecipeSource,
} from "@/types/preference-profile";
import {
  buildSourceInfoCopy,
  isVerifiedSource,
  partitionBySourceTier,
  signalDiscountForSource,
  sourceBadgeTone,
  sourceLabel,
} from "./recipe-source-taxonomy";

describe("isVerifiedSource", () => {
  it("classifies nourish-verified as verified", () => {
    expect(isVerifiedSource("nourish-verified")).toBe(true);
  });

  it("classifies nourish-curated as verified", () => {
    expect(isVerifiedSource("nourish-curated")).toBe(true);
  });

  it("classifies user-authored as unverified", () => {
    expect(isVerifiedSource("user-authored")).toBe(false);
  });

  it("classifies agent-found as unverified", () => {
    expect(isVerifiedSource("agent-found")).toBe(false);
  });
});

describe("sourceLabel", () => {
  it("uses 'Nourish Verified' for the top tier", () => {
    expect(sourceLabel("nourish-verified")).toBe("Nourish Verified");
  });

  it("uses 'Curated' for nourish-curated", () => {
    expect(sourceLabel("nourish-curated")).toBe("Curated");
  });

  it("makes the unverified-source kind explicit in the label", () => {
    expect(sourceLabel("user-authored")).toMatch(/Unverified/);
    expect(sourceLabel("user-authored")).toMatch(/user/);
    expect(sourceLabel("agent-found")).toMatch(/Unverified/);
    expect(sourceLabel("agent-found")).toMatch(/agent-found/);
  });
});

describe("sourceBadgeTone", () => {
  it("maps each source to a distinct tone", () => {
    const tones = new Set<string>();
    for (const s of [
      "nourish-verified",
      "nourish-curated",
      "user-authored",
      "agent-found",
    ] as RecipeSource[]) {
      tones.add(sourceBadgeTone(s));
    }
    expect(tones.size).toBe(4);
  });
});

describe("partitionBySourceTier", () => {
  const verifiedItem = {
    name: "Caprese",
    provenance: { source: "nourish-verified" } satisfies RecipeProvenance,
  };
  const curatedItem = {
    name: "Pesto",
    provenance: { source: "nourish-curated" } satisfies RecipeProvenance,
  };
  const userItem = {
    name: "Aunt Edna's Pasta",
    provenance: { source: "user-authored" } satisfies RecipeProvenance,
  };
  const agentItem = {
    name: "Pear-Ham Tartine",
    provenance: {
      source: "agent-found",
      sourceUrl: "https://bonappetit.com/recipe/x",
    } satisfies RecipeProvenance,
  };
  const noProvenance: { name: string; provenance?: undefined } = {
    name: "Mystery dish",
  };

  it("places verified + curated in the verified tier", () => {
    const out = partitionBySourceTier([verifiedItem, curatedItem]);
    expect(out.verified).toHaveLength(2);
    expect(out.unverified).toHaveLength(0);
  });

  it("places user-authored + agent-found in the unverified tier", () => {
    const out = partitionBySourceTier([userItem, agentItem]);
    expect(out.unverified).toHaveLength(2);
    expect(out.verified).toHaveLength(0);
  });

  it("treats items without provenance as verified (catalog-seeded default)", () => {
    const out = partitionBySourceTier([noProvenance]);
    expect(out.verified).toHaveLength(1);
    expect(out.unverified).toHaveLength(0);
  });

  it("preserves order within each tier", () => {
    const out = partitionBySourceTier([
      verifiedItem,
      agentItem,
      curatedItem,
      userItem,
    ]);
    expect(out.verified.map((i) => i.name)).toEqual(["Caprese", "Pesto"]);
    expect(out.unverified.map((i) => i.name)).toEqual([
      "Pear-Ham Tartine",
      "Aunt Edna's Pasta",
    ]);
  });

  it("handles an empty input", () => {
    const out = partitionBySourceTier([]);
    expect(out.verified).toEqual([]);
    expect(out.unverified).toEqual([]);
  });
});

describe("signalDiscountForSource", () => {
  it("verified + curated cooks contribute full weight", () => {
    expect(signalDiscountForSource("nourish-verified")).toBe(1.0);
    expect(signalDiscountForSource("nourish-curated")).toBe(1.0);
  });

  it("user-authored cooks contribute 0.7 weight (moderate trust)", () => {
    expect(signalDiscountForSource("user-authored")).toBe(0.7);
  });

  it("agent-found cooks contribute half weight (coarser tagging)", () => {
    expect(signalDiscountForSource("agent-found")).toBe(0.5);
  });
});

describe("buildSourceInfoCopy", () => {
  it("verified copy mentions clinician review", () => {
    expect(buildSourceInfoCopy({ source: "nourish-verified" })).toMatch(
      /clinician/i,
    );
  });

  it("curated copy notes no clinician review but follows guidelines", () => {
    const out = buildSourceInfoCopy({ source: "nourish-curated" });
    expect(out).toMatch(/Nourish catalog/);
    expect(out).toMatch(/clinician-reviewed/);
  });

  it("user-authored copy notes 'authored by a user' + unverified", () => {
    const out = buildSourceInfoCopy({ source: "user-authored" });
    expect(out).toMatch(/user/i);
    expect(out).toMatch(/verified/i);
  });

  it("agent-found copy includes source title when present", () => {
    const out = buildSourceInfoCopy({
      source: "agent-found",
      sourceTitle: "Bon Appétit",
      sourceUrl: "https://bonappetit.com/x",
    });
    expect(out).toMatch(/Bon Appétit/);
  });

  it("agent-found copy falls back to URL hostname when title missing", () => {
    const out = buildSourceInfoCopy({
      source: "agent-found",
      sourceUrl: "https://example.com/x/y",
    });
    expect(out).toMatch(/example\.com/);
  });

  it("agent-found copy appends agentNote when provided", () => {
    const out = buildSourceInfoCopy({
      source: "agent-found",
      agentNote: "Plant-forward, 380 kcal/serving.",
    });
    expect(out).toMatch(/Plant-forward/);
  });

  it("agent-found copy is graceful with neither URL nor title", () => {
    const out = buildSourceInfoCopy({ source: "agent-found" });
    expect(out).toMatch(/agent/i);
  });
});
