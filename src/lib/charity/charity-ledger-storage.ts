/**
 * Charity ledger persistence layer (Y4 W6).
 *
 * Zod schema + parser + pure helpers for the localStorage
 * payload that wraps the W5 aggregator. Same shape as the
 * Y4 W2 LLM-spend storage layer; W15 RCA pattern.
 *
 * Real-mode wire-up: Y4 Sprint C swaps the localStorage layer
 * for the Postgres-backed sync. The hook surface stays
 * unchanged.
 */

import { z } from "zod";
import type { CharityChargeEntry } from "./charity-ledger";

export const charityChargeStatusEnum = z.enum([
  "succeeded",
  "refunded",
  "pending",
]);

export const charityChargeEntrySchema = z.object({
  id: z.string().min(1).max(80),
  stripeChargeId: z.string().min(1).max(80),
  eventSlug: z.string().min(1).max(80),
  nonprofitSlug: z.string().min(1).max(80),
  amountMicroUsd: z.number().int().nonnegative(),
  chargedAt: z.string().datetime(),
  status: charityChargeStatusEnum,
});

export const CHARITY_LEDGER_SCHEMA_VERSION = 1 as const;
export const CHARITY_LEDGER_STORAGE_KEY = "sous-charity-ledger-v1";
/** Cap entries; ~150B per × 1000 = ~150KB. */
export const CHARITY_LEDGER_MAX_ENTRIES = 1000;

export const charityLedgerStorageSchema = z.object({
  schemaVersion: z.literal(CHARITY_LEDGER_SCHEMA_VERSION),
  entries: z.array(charityChargeEntrySchema),
  updatedAt: z.string().datetime(),
});
export type CharityLedgerStorage = z.infer<typeof charityLedgerStorageSchema>;

export function freshCharityLedgerStorage(
  now: Date = new Date(),
): CharityLedgerStorage {
  return {
    schemaVersion: CHARITY_LEDGER_SCHEMA_VERSION,
    entries: [],
    updatedAt: now.toISOString(),
  };
}

/** Pure: defensively parse a stored payload. Falls back to
 *  fresh on any failure (charity ledger is loss-OK on the
 *  client; the server-of-record lives in Stripe). */
export function parseStoredCharityLedger(
  raw: string | null | undefined,
  now: Date = new Date(),
): CharityLedgerStorage {
  if (!raw) return freshCharityLedgerStorage(now);
  try {
    const parsed = JSON.parse(raw);
    const result = charityLedgerStorageSchema.safeParse(parsed);
    if (!result.success) return freshCharityLedgerStorage(now);
    return result.data;
  } catch {
    return freshCharityLedgerStorage(now);
  }
}

/** Pure: append a new charge entry with cap-trim. */
export function appendCharityCharge(
  storage: CharityLedgerStorage,
  entry: CharityChargeEntry,
  now: Date = new Date(),
): CharityLedgerStorage {
  const next = [...storage.entries, entry];
  next.sort((a, b) => a.chargedAt.localeCompare(b.chargedAt));
  const trimmed =
    next.length > CHARITY_LEDGER_MAX_ENTRIES
      ? next.slice(next.length - CHARITY_LEDGER_MAX_ENTRIES)
      : next;
  return {
    ...storage,
    entries: trimmed,
    updatedAt: now.toISOString(),
  };
}

/** Pure: update an existing entry's status (e.g. when a Stripe
 *  webhook reports a refund). No-op if the id is unknown. */
export function updateCharityChargeStatus(
  storage: CharityLedgerStorage,
  chargeId: string,
  status: CharityChargeEntry["status"],
  now: Date = new Date(),
): CharityLedgerStorage {
  const idx = storage.entries.findIndex((e) => e.id === chargeId);
  if (idx === -1) return storage;
  const updated = { ...storage.entries[idx], status };
  const next = [...storage.entries];
  next[idx] = updated;
  return {
    ...storage,
    entries: next,
    updatedAt: now.toISOString(),
  };
}

export interface NewCharityChargeInput {
  stripeChargeId: string;
  eventSlug: string;
  nonprofitSlug: string;
  amountMicroUsd: number;
  status: CharityChargeEntry["status"];
  /** Override id (test determinism). */
  id?: string;
  /** Override timestamp (test determinism). */
  now?: Date;
}

export function buildCharityChargeEntry(
  input: NewCharityChargeInput,
): CharityChargeEntry {
  const now = input.now ?? new Date();
  return {
    id: input.id ?? `${now.getTime()}-${input.stripeChargeId}`,
    stripeChargeId: input.stripeChargeId,
    eventSlug: input.eventSlug,
    nonprofitSlug: input.nonprofitSlug,
    amountMicroUsd: Math.max(0, Math.floor(input.amountMicroUsd)),
    chargedAt: now.toISOString(),
    status: input.status,
  };
}
