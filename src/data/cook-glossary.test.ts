import { describe, it, expect } from "vitest";
import { cookGlossary, glossaryRegexSource, lookupTerm } from "./cook-glossary";

describe("cook glossary", () => {
  it("contains a meaningful number of entries", () => {
    expect(cookGlossary.length).toBeGreaterThan(20);
  });

  it("every entry has a non-empty meaning and at least one pattern", () => {
    for (const entry of cookGlossary) {
      expect(entry.term.length).toBeGreaterThan(0);
      expect(entry.meaning.length).toBeGreaterThan(10);
      expect(entry.patterns.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("pattern lookup is case-insensitive", () => {
    expect(lookupTerm("deglaze")?.term).toBe("Deglaze");
    expect(lookupTerm("Deglaze")?.term).toBe("Deglaze");
    expect(lookupTerm("DEGLAZE")?.term).toBe("Deglaze");
  });

  it("recognizes gerund and past-tense forms", () => {
    expect(lookupTerm("deglazing")?.term).toBe("Deglaze");
    expect(lookupTerm("deglazed")?.term).toBe("Deglaze");
    expect(lookupTerm("simmering")?.term).toBe("Simmer");
    expect(lookupTerm("folded")?.term).toBe("Fold");
  });

  it("returns undefined for words not in the glossary", () => {
    expect(lookupTerm("flibbertigibbet")).toBeUndefined();
    expect(lookupTerm("cook")).toBeUndefined();
    expect(lookupTerm("heat")).toBeUndefined();
  });

  it("handles multi-word entries", () => {
    expect(lookupTerm("al dente")?.term).toBe("Al dente");
  });
});

describe("glossary regex", () => {
  it("matches plain technique words as whole words", () => {
    const re = new RegExp(glossaryRegexSource, "giu");
    const text = "Simmer the sauce, then deglaze the pan with wine.";
    const matches = text.match(re);
    expect(matches).not.toBeNull();
    expect(matches?.map((m) => m.toLowerCase())).toEqual(
      expect.arrayContaining(["simmer", "deglaze"]),
    );
  });

  it("does not match partial words inside longer strings", () => {
    const re = new RegExp(glossaryRegexSource, "giu");
    // "dicement" is not a real word but proves boundary logic: if the regex
    // matched partial substrings it would fire on "dice".
    const text = "dicement overbrow";
    const matches = text.match(re);
    expect(matches).toBeNull();
  });

  it("captures multi-word phrases like 'al dente'", () => {
    const re = new RegExp(glossaryRegexSource, "giu");
    const text = "Cook the pasta until al dente, about 9 minutes.";
    const matches = text.match(re);
    expect(matches?.map((m) => m.toLowerCase())).toContain("al dente");
  });
});
