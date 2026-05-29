/**
 * Vocabulary matcher for Glossify (Y2 Sprint K W45).
 *
 * Pure helpers that find vocabulary terms inside a recipe step's
 * instruction text + return the spans for the Glossify component
 * to underline + wire to the popup.
 *
 * Match strategy:
 *   - Whole-word + case-insensitive on canonical term.
 *   - Whole-word + case-insensitive on every regional alias.
 *   - Plural-tolerant: term that ends in a consonant accepts
 *     "+s", terms that end in "y" accept "+ies", terms that end
 *     in "s/x/z/ch/sh" accept "+es" — small English rule set.
 *   - Multi-word terms ("garam masala", "mise en place") match
 *     as a single span.
 *
 * Returns spans sorted by start index. Overlapping matches are
 * resolved by preferring the longer match (so "garam masala" wins
 * over a phantom inner match on "garam").
 *
 * Pure / dependency-free / deterministic.
 */

import type { VocabularyEntry } from "@/types/cuisine-vocabulary";

export interface MatchSpan {
  start: number;
  end: number;
  /** The original matched text (case preserved). */
  text: string;
  /** The vocabulary entry the span points to. Caller wires this
   *  to the popup. */
  entry: VocabularyEntry;
}

/** Pure: compute plural-tolerant alternatives for a term. Used
 *  inside the matcher; exposed for tests. */
export function pluralAlternatives(term: string): string[] {
  const t = term.trim();
  if (t.length === 0) return [];
  const out: string[] = [t];
  const lower = t.toLowerCase();
  // Multi-word terms ("garam masala") — pluralise just the last word.
  const words = t.split(/\s+/);
  if (words.length > 1) {
    const lastIdx = words.length - 1;
    for (const plural of pluralAlternatives(words[lastIdx] ?? "")) {
      if (plural === words[lastIdx]) continue;
      out.push([...words.slice(0, lastIdx), plural].join(" "));
    }
    return out;
  }
  // Single-word: apply small English rule set.
  if (
    lower.endsWith("s") ||
    lower.endsWith("x") ||
    lower.endsWith("z") ||
    lower.endsWith("ch") ||
    lower.endsWith("sh")
  ) {
    out.push(t + "es");
  } else if (lower.endsWith("y") && !endsInVowelY(lower)) {
    // "berry" → "berries"; but "key" → "keys" (vowel + y).
    out.push(t.slice(0, -1) + "ies");
  } else {
    out.push(t + "s");
  }
  return out;
}

function endsInVowelY(s: string): boolean {
  if (s.length < 2) return false;
  const before = s[s.length - 2] ?? "";
  return ["a", "e", "i", "o", "u"].includes(before);
}

/** Pure: find every vocabulary span in the given text. Spans
 *  are sorted by start index; longer-match-wins on overlap. */
export function findVocabularyMatches(
  text: string,
  catalog: ReadonlyArray<VocabularyEntry>,
): MatchSpan[] {
  if (typeof text !== "string" || text.length === 0) return [];
  const candidates: MatchSpan[] = [];

  for (const entry of catalog) {
    const phrases: { phrase: string }[] = [];
    for (const p of pluralAlternatives(entry.term)) phrases.push({ phrase: p });
    for (const alias of entry.regionalNames) {
      // Skip aliases that contain parenthesised commentary.
      if (alias.name.includes("(")) continue;
      for (const p of pluralAlternatives(alias.name)) {
        phrases.push({ phrase: p });
      }
    }
    for (const { phrase } of phrases) {
      const re = buildWordBoundaryRegex(phrase);
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        candidates.push({
          start: m.index,
          end: m.index + m[0].length,
          text: m[0],
          entry,
        });
      }
    }
  }

  // Resolve overlaps — prefer longer match. Sort by start
  // ascending, length descending; greedy-walk + drop any span
  // that overlaps a previously-kept (longer) span.
  candidates.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - b.start - (a.end - a.start);
  });
  const kept: MatchSpan[] = [];
  for (const span of candidates) {
    const overlaps = kept.some(
      (k) => !(span.end <= k.start || span.start >= k.end),
    );
    if (!overlaps) kept.push(span);
  }
  return kept.sort((a, b) => a.start - b.start);
}

/** Pure: build a word-boundary regex for a phrase. Multi-word
 *  phrases use \s+ between tokens so "garam   masala" still
 *  matches. Special regex characters in the phrase are escaped. */
function buildWordBoundaryRegex(phrase: string): RegExp {
  const tokens = phrase
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map(escapeRegex);
  const inner = tokens.join("\\s+");
  return new RegExp(`\\b${inner}\\b`, "gi");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
