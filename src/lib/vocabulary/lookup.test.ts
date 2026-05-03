import { describe, expect, it } from "vitest";
import {
  findByTerm,
  listByCuisine,
  listCuisines,
  normaliseQuery,
  parseVocabularyFile,
  searchByPrefix,
} from "./lookup";
import vocabRaw from "@/data/cuisine-vocabulary.json";

const catalog = parseVocabularyFile(vocabRaw);

// ── parseVocabularyFile (data file integrity) ─────────────

describe("parseVocabularyFile", () => {
  it("parses the bundled JSON without throwing", () => {
    expect(() => parseVocabularyFile(vocabRaw)).not.toThrow();
  });

  it("catalog has at least 10 entries (substrate seed)", () => {
    expect(catalog.length).toBeGreaterThanOrEqual(10);
  });

  it("each entry has required fields", () => {
    for (const e of catalog) {
      expect(e.term.length).toBeGreaterThan(0);
      expect(e.cuisine.length).toBeGreaterThan(0);
      expect(e.definition.length).toBeGreaterThan(10);
      expect(Array.isArray(e.regionalNames)).toBe(true);
      expect(Array.isArray(e.substitutions)).toBe(true);
    }
  });

  it("rejects malformed input (missing required fields)", () => {
    expect(() =>
      parseVocabularyFile([
        { term: "x", cuisine: "y" }, // missing definition
      ]),
    ).toThrow();
  });

  it("rejects non-array root", () => {
    expect(() => parseVocabularyFile({})).toThrow();
  });
});

// ── normaliseQuery ────────────────────────────────────────

describe("normaliseQuery", () => {
  it("lowercases", () => {
    expect(normaliseQuery("MISO")).toBe("miso");
  });

  it("trims", () => {
    expect(normaliseQuery("  miso  ")).toBe("miso");
  });

  it("collapses whitespace", () => {
    expect(normaliseQuery("garam   masala")).toBe("garam masala");
  });

  it("non-string → empty", () => {
    expect(normaliseQuery(null as unknown as string)).toBe("");
  });
});

// ── findByTerm ────────────────────────────────────────────

describe("findByTerm", () => {
  it("exact canonical match → entry", () => {
    const out = findByTerm(catalog, "tadka");
    expect(out?.term).toBe("tadka");
  });

  it("case-insensitive match", () => {
    expect(findByTerm(catalog, "TADKA")?.term).toBe("tadka");
  });

  it("regional-alias match → returns parent entry", () => {
    // "tarka" is an alias for "tadka" in the seed
    const out = findByTerm(catalog, "tarka");
    expect(out?.term).toBe("tadka");
  });

  it("multi-word term matches", () => {
    const out = findByTerm(catalog, "garam masala");
    expect(out?.term).toBe("garam masala");
  });

  it("missing term → null", () => {
    expect(findByTerm(catalog, "nonexistent-term-xyz")).toBe(null);
  });

  it("empty query → null", () => {
    expect(findByTerm(catalog, "")).toBe(null);
  });
});

// ── searchByPrefix ────────────────────────────────────────

describe("searchByPrefix", () => {
  it("prefix on canonical term → matching entries", () => {
    const out = searchByPrefix(catalog, "ta");
    const terms = out.map((e) => e.term);
    expect(terms).toContain("tadka");
    expect(terms).toContain("tagine");
  });

  it("prefix on regional alias → returns the parent", () => {
    // "tar" matches "tarka" alias of tadka
    const out = searchByPrefix(catalog, "tar");
    expect(out.some((e) => e.term === "tadka")).toBe(true);
  });

  it("results sorted alphabetically by canonical term", () => {
    const out = searchByPrefix(catalog, "ta");
    const terms = out.map((e) => e.term);
    expect([...terms]).toEqual([...terms].sort());
  });

  it("empty query → empty result", () => {
    expect(searchByPrefix(catalog, "")).toEqual([]);
  });

  it("respects limit", () => {
    expect(searchByPrefix(catalog, "", 0)).toEqual([]);
    expect(searchByPrefix(catalog, "s", 1).length).toBeLessThanOrEqual(1);
  });

  it("no matches → empty result", () => {
    expect(searchByPrefix(catalog, "zzzzzz")).toEqual([]);
  });
});

// ── listByCuisine ─────────────────────────────────────────

describe("listByCuisine", () => {
  it("returns entries for a known cuisine", () => {
    const out = listByCuisine(catalog, "italian");
    expect(out.length).toBeGreaterThan(0);
    for (const e of out) expect(e.cuisine.toLowerCase()).toBe("italian");
  });

  it("results sorted alphabetically by term", () => {
    const out = listByCuisine(catalog, "italian");
    const terms = out.map((e) => e.term);
    expect([...terms]).toEqual([...terms].sort());
  });

  it("case-insensitive cuisine match", () => {
    expect(listByCuisine(catalog, "ITALIAN").length).toBeGreaterThan(0);
  });

  it("unknown cuisine → empty", () => {
    expect(listByCuisine(catalog, "klingon")).toEqual([]);
  });

  it("empty cuisine → empty", () => {
    expect(listByCuisine(catalog, "")).toEqual([]);
  });
});

// ── listCuisines ──────────────────────────────────────────

describe("listCuisines", () => {
  it("returns at least 5 distinct cuisines from the seed", () => {
    expect(listCuisines(catalog).length).toBeGreaterThanOrEqual(5);
  });

  it("returned names are sorted + unique", () => {
    const cuisines = listCuisines(catalog);
    expect(cuisines).toEqual([...new Set(cuisines)]);
    expect(cuisines).toEqual([...cuisines].sort());
  });

  it("known cuisines present", () => {
    const cuisines = listCuisines(catalog);
    expect(cuisines).toContain("italian");
    expect(cuisines).toContain("indian");
  });
});

// ── seed-data sanity ──────────────────────────────────────

describe("seed data sanity", () => {
  it("no duplicate canonical terms (primary key invariant)", () => {
    const seen = new Set<string>();
    for (const e of catalog) {
      const lower = e.term.toLowerCase();
      expect(seen.has(lower)).toBe(false);
      seen.add(lower);
    }
  });

  it("definitions are at least 50 chars (substantive prose)", () => {
    for (const e of catalog) {
      expect(e.definition.length).toBeGreaterThanOrEqual(50);
    }
  });

  it("regional aliases don't repeat the canonical term", () => {
    for (const e of catalog) {
      for (const alias of e.regionalNames) {
        expect(alias.name.toLowerCase()).not.toBe(e.term.toLowerCase());
      }
    }
  });
});
