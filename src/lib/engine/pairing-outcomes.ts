/**
 * Pairing-outcome event corpus (the moat data flywheel — MOAT-APPRAISAL-2026-06
 * #1). The pairing engine is a commodity deterministic ruleset; the defensible,
 * uncopiable-with-scale asset is *what users actually accept and cook after each
 * suggestion*. This module is the append-only capture + export layer for the
 * `(shown → picked/rerolled/dismissed → cooked → rated)` tuple.
 *
 * Append-only is the whole point: a transition appends a NEW row (shown, then
 * picked, then cooked, then rated are four rows sharing one `suggestionId`) — so
 * this is a training CORPUS, not a state store. Local-first today; a dormant
 * server sink (pairing-outcomes-sync) makes it cross-device when POSTGRES_URL is
 * set, exactly like the diary/recipes write-through.
 *
 * Pure helpers (parse / cap / aggregate-key / CSV / NDJSON) live here and are
 * unit-tested in node; the localStorage wrappers are thin + window-guarded.
 */

export const PAIRING_OUTCOMES_KEY = "sous-pairing-outcomes-v1";
export const PAIRING_OUTCOMES_SCHEMA_VERSION = 1 as const;
/** ~250 B/row × 2000 ≈ 500 KB — a ring buffer; oldest rows drop first. */
export const PAIRING_OUTCOMES_MAX = 2000;

export type PairingOutcomeKind =
  | "shown"
  | "picked"
  | "rerolled"
  | "dismissed"
  | "cooked"
  | "rated";

/** The six live ScoreBreakdown dimensions (engine/types.ts) — the features the
 *  corpus carries so a future trainer can learn which dimensions predict a cook. */
export interface PairingDimensions {
  cuisineFit: number;
  flavorContrast: number;
  nutritionBalance: number;
  prepBurden: number;
  temperature: number;
  preference: number;
}

export interface PairingOutcome {
  /** `${batchId}:${rank}` — the join key that survives shown→cooked→rated. */
  suggestionId: string;
  /** One search → one batch (groups the 3 shown together). */
  batchId: string;
  /** Anon cohort key (getDeviceId()) — never PII. */
  deviceId: string;
  recipeSlug: string;
  /** Hash of the normalized main-dish intent — NOT raw text (PII rule). */
  mainDishIntentHash: string;
  cuisineFamily: string;
  /** 0-based position in the shown stack. */
  rank: number;
  shownAt: string;
  totalScore: number;
  dimensions: PairingDimensions;
  outcome: PairingOutcomeKind;
  outcomeAt: string | null;
  rating: number | null;
  favorite: boolean;
  feedback: string | null;
  schemaVersion: typeof PAIRING_OUTCOMES_SCHEMA_VERSION;
}

/** The stable join key for a suggestion slot. */
export function makeSuggestionId(batchId: string, rank: number): string {
  return `${batchId}:${rank}`;
}

const DIM_KEYS: (keyof PairingDimensions)[] = [
  "cuisineFit",
  "flavorContrast",
  "nutritionBalance",
  "prepBurden",
  "temperature",
  "preference",
];

function isFiniteNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** Defensive, partial-recovery parse: a malformed row is skipped, never throws,
 *  so one corrupt entry can't wipe the whole corpus (mirrors the llm-spend
 *  store's parse). */
export function parseStoredOutcomes(raw: string | null): PairingOutcome[] {
  if (!raw) return [];
  let arr: unknown;
  try {
    arr = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  const out: PairingOutcome[] = [];
  for (const r of arr) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    const dimsRaw = (o.dimensions ?? {}) as Record<string, unknown>;
    const dims = {} as PairingDimensions;
    let dimsOk = true;
    for (const k of DIM_KEYS) {
      const v = dimsRaw[k];
      dims[k] = isFiniteNum(v) ? v : 0;
      if (!isFiniteNum(v)) dimsOk = false;
    }
    if (
      typeof o.suggestionId !== "string" ||
      typeof o.recipeSlug !== "string" ||
      typeof o.outcome !== "string" ||
      !isFiniteNum(o.rank) ||
      !isFiniteNum(o.totalScore)
    ) {
      continue;
    }
    void dimsOk; // dims default to 0 on miss; row is still usable
    out.push({
      suggestionId: o.suggestionId,
      batchId: typeof o.batchId === "string" ? o.batchId : "",
      deviceId: typeof o.deviceId === "string" ? o.deviceId : "",
      recipeSlug: o.recipeSlug,
      mainDishIntentHash:
        typeof o.mainDishIntentHash === "string" ? o.mainDishIntentHash : "",
      cuisineFamily: typeof o.cuisineFamily === "string" ? o.cuisineFamily : "",
      rank: o.rank,
      shownAt: typeof o.shownAt === "string" ? o.shownAt : "",
      totalScore: o.totalScore,
      dimensions: dims,
      outcome: o.outcome as PairingOutcomeKind,
      outcomeAt: typeof o.outcomeAt === "string" ? o.outcomeAt : null,
      rating: isFiniteNum(o.rating) ? o.rating : null,
      favorite: o.favorite === true,
      feedback: typeof o.feedback === "string" ? o.feedback : null,
      schemaVersion: PAIRING_OUTCOMES_SCHEMA_VERSION,
    });
  }
  return out;
}

/** Append a row and cap to the ring-buffer size (pure — the testable core). */
export function appendOutcome(
  list: readonly PairingOutcome[],
  row: PairingOutcome,
  max = PAIRING_OUTCOMES_MAX,
): PairingOutcome[] {
  const next = [...list, row];
  return next.length > max ? next.slice(next.length - max) : next;
}

// ── localStorage wrappers (thin, window-guarded) ──────────────────────────────

export function loadOutcomes(): PairingOutcome[] {
  if (typeof window === "undefined") return [];
  try {
    return parseStoredOutcomes(localStorage.getItem(PAIRING_OUTCOMES_KEY));
  } catch {
    return [];
  }
}

/** Append one outcome locally (fire-and-forget; never throws). The server-sink
 *  enqueue is wired by the caller in pairing-outcomes-sync to keep this pure of
 *  the network. */
export function recordOutcomeLocal(row: PairingOutcome): void {
  if (typeof window === "undefined") return;
  try {
    const next = appendOutcome(loadOutcomes(), row);
    localStorage.setItem(PAIRING_OUTCOMES_KEY, JSON.stringify(next));
  } catch {
    /* storage full / unavailable — the corpus is best-effort, never blocks UX */
  }
}

// ── Founder export (Round 4) — pure, DOM-free ─────────────────────────────────

const CSV_COLUMNS = [
  "suggestionId",
  "batchId",
  "deviceId",
  "recipeSlug",
  "cuisineFamily",
  "rank",
  "outcome",
  "totalScore",
  "cuisineFit",
  "flavorContrast",
  "nutritionBalance",
  "prepBurden",
  "temperature",
  "preference",
  "rating",
  "favorite",
  "feedback",
  "shownAt",
  "outcomeAt",
] as const;

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  // Quote-wrap + double-quote-escape if the cell needs it.
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function outcomesToCsv(rows: readonly PairingOutcome[]): string {
  const header = CSV_COLUMNS.join(",");
  const lines = rows.map((r) =>
    [
      r.suggestionId,
      r.batchId,
      r.deviceId,
      r.recipeSlug,
      r.cuisineFamily,
      r.rank,
      r.outcome,
      r.totalScore,
      r.dimensions.cuisineFit,
      r.dimensions.flavorContrast,
      r.dimensions.nutritionBalance,
      r.dimensions.prepBurden,
      r.dimensions.temperature,
      r.dimensions.preference,
      r.rating,
      r.favorite,
      r.feedback,
      r.shownAt,
      r.outcomeAt,
    ]
      .map(csvCell)
      .join(","),
  );
  return [header, ...lines].join("\n");
}

/** Newline-delimited JSON — one row per line, the standard ML training shape. */
export function outcomesToNdjson(rows: readonly PairingOutcome[]): string {
  return rows.map((r) => JSON.stringify(r)).join("\n");
}
