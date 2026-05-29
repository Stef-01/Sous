/**
 * Cuisine vocabulary lookup (Y2 Sprint K W44).
 *
 * Pure helpers for searching the curated vocabulary catalog.
 * The data layer (src/data/cuisine-vocabulary.json) is parsed
 * once at boot through `loadVocabulary` + cached in process.
 *
 * Three lookup shapes:
 *   - findByTerm(term) — exact-or-fuzzy match on the canonical
 *     name OR any regional alias.
 *   - searchByPrefix(query) — autocomplete shape; returns
 *     entries whose term or alias starts with the query.
 *   - listByCuisine(cuisine) — all entries for a cuisine
 *     family. Used by the Path-tab cuisine card surface.
 *
 * Pure / dependency-free. Loader is the only function that
 * touches the filesystem (server-side) or the bundled JSON
 * (client-side via direct import).
 */

import {
  vocabularyFileSchema,
  type VocabularyEntry,
  type VocabularyFile,
} from "@/types/cuisine-vocabulary";

/** Pure: validate + return a typed VocabularyFile from raw
 *  parsed JSON. Throws via Zod on any schema violation —
 *  catalogue errors should fail loud at load time, not produce
 *  silent lookup misses at request time. */
export function parseVocabularyFile(raw: unknown): VocabularyFile {
  return vocabularyFileSchema.parse(raw);
}

/** Pure: normalise a search query for the lookup helpers.
 *  Lowercase + trim + collapse whitespace. */
export function normaliseQuery(raw: string): string {
  if (typeof raw !== "string") return "";
  return raw.toLowerCase().trim().replace(/\s+/g, " ");
}

/** Pure: case-insensitive equality on the canonical term OR
 *  any regional alias. Returns the matching entry, or null. */
export function findByTerm(
  catalog: ReadonlyArray<VocabularyEntry>,
  query: string,
): VocabularyEntry | null {
  const q = normaliseQuery(query);
  if (q.length === 0) return null;
  for (const entry of catalog) {
    if (entry.term.toLowerCase() === q) return entry;
    for (const alias of entry.regionalNames) {
      if (alias.name.toLowerCase() === q) return entry;
    }
  }
  return null;
}

/** Pure: prefix-match search (autocomplete shape). Returns up
 *  to `limit` entries whose canonical term OR any alias starts
 *  with the query. Sorted alphabetically by canonical term. */
export function searchByPrefix(
  catalog: ReadonlyArray<VocabularyEntry>,
  query: string,
  limit: number = 8,
): VocabularyEntry[] {
  const q = normaliseQuery(query);
  if (q.length === 0) return [];
  const out: VocabularyEntry[] = [];
  const seen = new Set<string>();
  for (const entry of catalog) {
    if (out.length >= limit) break;
    const termLower = entry.term.toLowerCase();
    if (termLower.startsWith(q)) {
      if (!seen.has(termLower)) {
        out.push(entry);
        seen.add(termLower);
      }
      continue;
    }
    for (const alias of entry.regionalNames) {
      if (alias.name.toLowerCase().startsWith(q)) {
        if (!seen.has(termLower)) {
          out.push(entry);
          seen.add(termLower);
        }
        break;
      }
    }
  }
  return out.sort((a, b) => a.term.localeCompare(b.term));
}

/** Pure: all entries belonging to the given cuisine family.
 *  Case-insensitive. Sorted alphabetically by term. */
export function listByCuisine(
  catalog: ReadonlyArray<VocabularyEntry>,
  cuisine: string,
): VocabularyEntry[] {
  const c = normaliseQuery(cuisine);
  if (c.length === 0) return [];
  return catalog
    .filter((e) => e.cuisine.toLowerCase() === c)
    .slice()
    .sort((a, b) => a.term.localeCompare(b.term));
}

/** Pure: list every distinct cuisine family present in the
 *  catalog, sorted alphabetically. Useful for the Path-tab
 *  cuisine card grid. */
export function listCuisines(
  catalog: ReadonlyArray<VocabularyEntry>,
): string[] {
  const set = new Set<string>();
  for (const e of catalog) set.add(e.cuisine.toLowerCase());
  return Array.from(set).sort();
}
