/**
 * Zod schema for the per-cuisine vocabulary entries (Y2 Sprint K W44).
 *
 * Source of truth for the cuisine-vocabulary.json data file +
 * the lookup helpers in src/lib/vocabulary/. Strict shape so
 * the data layer fails loud at boot rather than producing
 * surprising lookup misses.
 */

import { z } from "zod";

export const regionalNameSchema = z.object({
  region: z.string().min(1),
  name: z.string().min(1),
});

export const substitutionSchema = z.object({
  swap: z.string().min(1),
  note: z.string().min(1),
});

export const vocabularyEntrySchema = z.object({
  /** Canonical term, lowercased + trimmed. Acts as the primary
   *  key — must be unique across the file. */
  term: z.string().min(1),
  /** Primary cuisine family. Multiple cuisines that share a
   *  term can each have their own entry. */
  cuisine: z.string().min(1),
  /** One-paragraph definition. Plain prose; no markdown. */
  definition: z.string().min(10),
  /** Regional naming variations — same dish, different region/
   *  language. */
  regionalNames: z.array(regionalNameSchema),
  /** Ingredient substitutions for the term — each swap entry
   *  includes a 1-line note on how the swap changes the dish. */
  substitutions: z.array(substitutionSchema),
  /** Optional pronunciation guide in folk-phonetic notation. */
  pronunciation: z.string().optional(),
  /** Optional 1-sentence origin note. */
  origin: z.string().optional(),
});

export type RegionalName = z.infer<typeof regionalNameSchema>;
export type Substitution = z.infer<typeof substitutionSchema>;
export type VocabularyEntry = z.infer<typeof vocabularyEntrySchema>;

export const vocabularyFileSchema = z.array(vocabularyEntrySchema);
export type VocabularyFile = z.infer<typeof vocabularyFileSchema>;
