import { describe, expect, it } from "vitest";
import { findVocabularyMatches, pluralAlternatives } from "./matcher";
import { parseVocabularyFile } from "./lookup";
import vocabRaw from "@/data/cuisine-vocabulary.json";

const catalog = parseVocabularyFile(vocabRaw);

// ── pluralAlternatives ────────────────────────────────────

describe("pluralAlternatives", () => {
  it("consonant ending → +s", () => {
    expect(pluralAlternatives("miso")).toContain("misos");
  });

  it("ends in 'sh' → +es", () => {
    expect(pluralAlternatives("dish")).toContain("dishes");
  });

  it("ends in 's' → +es", () => {
    expect(pluralAlternatives("tagine")).toContain("tagines");
    expect(pluralAlternatives("focaccia")).toContain("focaccias");
  });

  it("ends in 'y' (consonant + y) → -y +ies", () => {
    expect(pluralAlternatives("berry")).toContain("berries");
  });

  it("ends in 'y' (vowel + y) → +s only", () => {
    expect(pluralAlternatives("key")).toContain("keys");
    expect(pluralAlternatives("key")).not.toContain("kies");
  });

  it("multi-word phrase → only the last word pluralises", () => {
    const out = pluralAlternatives("garam masala");
    expect(out).toContain("garam masala");
    expect(out).toContain("garam masalas");
  });

  it("preserves the canonical first", () => {
    expect(pluralAlternatives("miso")[0]).toBe("miso");
  });

  it("empty input → empty list", () => {
    expect(pluralAlternatives("")).toEqual([]);
  });
});

// ── findVocabularyMatches ─────────────────────────────────

describe("findVocabularyMatches — basic", () => {
  it("empty text → empty spans", () => {
    expect(findVocabularyMatches("", catalog)).toEqual([]);
  });

  it("no match → empty spans", () => {
    expect(findVocabularyMatches("nothing notable here", catalog)).toEqual([]);
  });

  it("single canonical match → 1 span", () => {
    const out = findVocabularyMatches(
      "Stir miso into the soup at the end.",
      catalog,
    );
    expect(out.length).toBe(1);
    expect(out[0]?.entry.term).toBe("miso");
  });

  it("preserves the original cased text in the span", () => {
    const out = findVocabularyMatches("Add Miso paste.", catalog);
    expect(out[0]?.text).toBe("Miso");
  });
});

describe("findVocabularyMatches — multi-word terms", () => {
  it("matches 'garam masala' as a single span", () => {
    const out = findVocabularyMatches(
      "Sprinkle garam masala just before serving.",
      catalog,
    );
    expect(out.length).toBe(1);
    expect(out[0]?.text.toLowerCase()).toBe("garam masala");
  });

  it("matches 'mise en place' as a single span", () => {
    const out = findVocabularyMatches(
      "Get your mise en place ready first.",
      catalog,
    );
    expect(out.length).toBe(1);
    expect(out[0]?.entry.term).toBe("mise en place");
  });

  it("longer match wins on overlap (no double-counting)", () => {
    // "garam masala" should win; we should NOT also match
    // "masala" as a separate term (no such canonical anyway,
    // but the regex shouldn't over-match).
    const out = findVocabularyMatches("Toast garam masala in ghee.", catalog);
    expect(out.length).toBe(1);
  });
});

describe("findVocabularyMatches — regional aliases", () => {
  it("alias 'tarka' resolves to canonical 'tadka'", () => {
    const out = findVocabularyMatches("Pour the tarka over the dal.", catalog);
    expect(out[0]?.entry.term).toBe("tadka");
  });

  it("alias 'mirepoix' resolves to canonical 'soffritto'", () => {
    const out = findVocabularyMatches("Start with a mirepoix base.", catalog);
    expect(out[0]?.entry.term).toBe("soffritto");
  });
});

describe("findVocabularyMatches — plural-tolerant", () => {
  it("'tagines' → matches canonical 'tagine'", () => {
    const out = findVocabularyMatches(
      "Both tagines simmer overnight.",
      catalog,
    );
    expect(out[0]?.entry.term).toBe("tagine");
  });

  it("'misos' → matches canonical 'miso'", () => {
    const out = findVocabularyMatches(
      "Different misos behave differently.",
      catalog,
    );
    expect(out[0]?.entry.term).toBe("miso");
  });
});

describe("findVocabularyMatches — word boundaries", () => {
  it("does not match inside a longer word", () => {
    // "miso" canonical should NOT match "misogyny" or
    // "submission" (no such case here, but regression guard).
    const out = findVocabularyMatches(
      "Submission letter for the misogyny seminar.",
      catalog,
    );
    expect(out).toEqual([]);
  });

  it("punctuation as a boundary", () => {
    const out = findVocabularyMatches("Add miso, then stir.", catalog);
    expect(out.length).toBe(1);
  });

  it("hyphen as a boundary", () => {
    const out = findVocabularyMatches("miso-glazed cod", catalog);
    expect(out.length).toBe(1);
  });
});

describe("findVocabularyMatches — multiple matches in one text", () => {
  it("returns spans sorted by start index", () => {
    const out = findVocabularyMatches(
      "Use mise en place before stirring miso into the broth.",
      catalog,
    );
    expect(out.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < out.length; i++) {
      expect((out[i]?.start ?? 0) >= (out[i - 1]?.start ?? 0)).toBe(true);
    }
  });

  it("non-overlapping spans both kept", () => {
    const out = findVocabularyMatches(
      "Bloom the tadka, then deglaze the pan.",
      catalog,
    );
    expect(out.length).toBe(2);
    const terms = out.map((s) => s.entry.term);
    expect(terms).toContain("tadka");
    expect(terms).toContain("deglaze");
  });
});

describe("findVocabularyMatches — case-insensitive", () => {
  it("UPPERCASE matches", () => {
    const out = findVocabularyMatches("ADD MISO PASTE", catalog);
    expect(out.length).toBe(1);
  });

  it("MixedCase matches", () => {
    const out = findVocabularyMatches("Stir Garam Masala in.", catalog);
    expect(out.length).toBe(1);
  });
});

describe("findVocabularyMatches — output shape", () => {
  it("each span has start/end/text/entry fields", () => {
    const text = "Sprinkle miso on top.";
    const out = findVocabularyMatches(text, catalog);
    expect(out[0]?.start).toBeGreaterThanOrEqual(0);
    expect((out[0]?.end ?? 0) > (out[0]?.start ?? 0)).toBe(true);
    expect(text.slice(out[0]?.start ?? 0, out[0]?.end ?? 0)).toBe(out[0]?.text);
    expect(out[0]?.entry).toBeDefined();
  });
});
