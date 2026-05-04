/**
 * LLM-spend persistence layer (Y4 W2).
 *
 * Zod schema + parser + pure helpers for the localStorage
 * payload that wraps the Y4 W1 aggregator. Follows the W15 RCA
 * pattern: freshDefault factory, schema-version check,
 * partial-recovery parser.
 *
 * The hook layer (`use-llm-spend.ts`) wraps this. The dashboard
 * surface (W3) reads the aggregate + projection. Real-mode
 * wire-up flips this from "client-only telemetry record" to
 * "server-synced spend ledger" at Y4 Sprint C without changing
 * the API surface above.
 */

import { z } from "zod";
import type { LlmCallEntry, LlmSurface } from "./llm-spend";

export const llmSurfaceEnum = z.enum([
  "voice-conversation",
  "voice-to-draft",
  "pod-agentic-pick",
  "viral-search",
  "viral-extraction",
  "pantry-vision",
]);

export const llmOutcomeEnum = z.enum(["ok", "error", "rejected"]);

export const llmCallEntrySchema = z.object({
  id: z.string().min(1).max(80),
  surface: llmSurfaceEnum,
  calledAt: z.string().datetime(),
  tokensBilled: z.number().int().nonnegative(),
  costMicroUsd: z.number().int().nonnegative(),
  outcome: llmOutcomeEnum,
});

export const LLM_SPEND_SCHEMA_VERSION = 1 as const;
export const LLM_SPEND_STORAGE_KEY = "sous-llm-spend-v1";
/** Cap entries so localStorage can't grow unbounded. ~150B per
 *  entry × 1000 = ~150KB, well within budget. */
export const LLM_SPEND_MAX_ENTRIES = 1000;

export const llmSpendStorageSchema = z.object({
  schemaVersion: z.literal(LLM_SPEND_SCHEMA_VERSION),
  entries: z.array(llmCallEntrySchema),
  /** ISO timestamp last write. Useful for cache busting. */
  updatedAt: z.string().datetime(),
});
export type LlmSpendStorage = z.infer<typeof llmSpendStorageSchema>;

/** Pure: empty storage payload. */
export function freshLlmSpendStorage(now: Date = new Date()): LlmSpendStorage {
  return {
    schemaVersion: LLM_SPEND_SCHEMA_VERSION,
    entries: [],
    updatedAt: now.toISOString(),
  };
}

/** Pure: parse a stored payload. Defends against missing key,
 *  malformed JSON, schema mismatch, partial corruption. Falls
 *  back to fresh on any failure (telemetry data is loss-OK —
 *  worst case the dashboard just shows fewer days). */
export function parseStoredLlmSpend(
  raw: string | null | undefined,
  now: Date = new Date(),
): LlmSpendStorage {
  if (!raw) return freshLlmSpendStorage(now);
  try {
    const parsed = JSON.parse(raw);
    const result = llmSpendStorageSchema.safeParse(parsed);
    if (!result.success) return freshLlmSpendStorage(now);
    return result.data;
  } catch {
    return freshLlmSpendStorage(now);
  }
}

/** Pure: append a new entry, drop oldest if over the cap.
 *  Returns a new storage object — never mutates the input. */
export function appendLlmCall(
  storage: LlmSpendStorage,
  entry: LlmCallEntry,
  now: Date = new Date(),
): LlmSpendStorage {
  const next: LlmCallEntry[] = [...storage.entries, entry];
  // Sort by calledAt ascending so trim drops oldest deterministically.
  next.sort((a, b) => a.calledAt.localeCompare(b.calledAt));
  const trimmed =
    next.length > LLM_SPEND_MAX_ENTRIES
      ? next.slice(next.length - LLM_SPEND_MAX_ENTRIES)
      : next;
  return {
    ...storage,
    entries: trimmed,
    updatedAt: now.toISOString(),
  };
}

/** Pure: helper to construct an entry without the caller having
 *  to format dates / pick ids. The caller always knows the
 *  surface + outcome; everything else has a sensible default. */
export interface NewLlmCallInput {
  surface: LlmSurface;
  tokensBilled: number;
  costMicroUsd: number;
  outcome: LlmCallEntry["outcome"];
  /** Override id (test determinism). Otherwise time-based. */
  id?: string;
  /** Override timestamp (test determinism). */
  now?: Date;
}

export function buildLlmCallEntry(input: NewLlmCallInput): LlmCallEntry {
  const now = input.now ?? new Date();
  return {
    id: input.id ?? `${now.getTime()}-${input.surface}`,
    surface: input.surface,
    calledAt: now.toISOString(),
    tokensBilled: Math.max(0, Math.floor(input.tokensBilled)),
    costMicroUsd: Math.max(0, Math.floor(input.costMicroUsd)),
    outcome: input.outcome,
  };
}
