import { describe, expect, it } from "vitest";
import mealsData from "@/data/meals.json";
import { gallerySequence, type GalleryContext } from "./gallery-sequence";

const ALL = mealsData as { id: string; heroImageUrl?: string | null }[];
const MEAL_IDS = new Set(ALL.map((m) => m.id));
const HAS_IMAGE = new Map(ALL.map((m) => [m.id, !!m.heroImageUrl]));

function ctx(over: Partial<GalleryContext> = {}): GalleryContext {
  return { hour: 19, month: 0, seed: 20260618, ...over };
}

describe("gallerySequence", () => {
  it("is deterministic for a fixed (hour, month, seed)", () => {
    expect(gallerySequence(ctx())).toEqual(gallerySequence(ctx()));
  });

  it("returns only real meal slugs, with no duplicates (rule 7)", () => {
    const seq = gallerySequence(ctx());
    expect(seq.length).toBeGreaterThan(0);
    expect(new Set(seq).size).toBe(seq.length);
    for (const slug of seq) expect(MEAL_IDS.has(slug)).toBe(true);
  });

  it("leads with image-bearing meals (vividness first)", () => {
    const seq = gallerySequence(ctx());
    const firstImageless = seq.findIndex((s) => !HAS_IMAGE.get(s));
    if (firstImageless === -1) return; // all have images — trivially ordered
    // No photographed meal appears after the first image-less one.
    for (let i = firstImageless; i < seq.length; i++) {
      expect(HAS_IMAGE.get(seq[i])).toBe(false);
    }
  });

  it("keeps the same membership across days but rotates the lead", () => {
    const a = gallerySequence(ctx({ seed: 1 }));
    const b = gallerySequence(ctx({ seed: 2 }));
    expect(new Set(a)).toEqual(new Set(b)); // same pool
    // The seeded shuffle rotates the order across days — sample many seeds and
    // confirm the lead dish varies (a single +1 seed could collide by chance).
    const leads = new Set<string>();
    for (let s = 0; s < 20; s++)
      leads.add(gallerySequence(ctx({ seed: s }))[0]);
    expect(leads.size).toBeGreaterThan(1);
  });
});
