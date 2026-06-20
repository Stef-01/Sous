/**
 * gold-ledger — durable idempotency + daily-cap bookkeeping for Doge gold.
 *
 * Part of the wall (see gold-economy.ts): imports nothing from nutrition / XP /
 * diary. It is the credit-once authority — a cook pays exactly once (keyed by its
 * session id) even if /doge is opened days later — and enforces the per-day cap.
 * State lives in localStorage; the actual postMessage delivery is the bridge's
 * outbox.
 */

const LEDGER_KEY = "sous-doge-gold-ledger";

export interface GoldLedger {
  /** txnId/eventKey → gold already credited (credit-once memory). */
  paid: Record<string, number>;
  /** date (YYYY-MM-DD) → total gold proposed that day (for the cap). */
  byDay: Record<string, number>;
  /** date → number of cooks already paid that day (full-rate window). */
  cooksPaidByDay: Record<string, number>;
  /** date → number of manual logs paid that day. */
  manualLogsByDay: Record<string, number>;
}

function empty(): GoldLedger {
  return { paid: {}, byDay: {}, cooksPaidByDay: {}, manualLogsByDay: {} };
}

export function todayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function readLedger(): GoldLedger {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(LEDGER_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<GoldLedger>;
    return {
      paid: parsed.paid ?? {},
      byDay: parsed.byDay ?? {},
      cooksPaidByDay: parsed.cooksPaidByDay ?? {},
      manualLogsByDay: parsed.manualLogsByDay ?? {},
    };
  } catch {
    return empty();
  }
}

export function writeLedger(ledger: GoldLedger): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
  } catch {
    /* quota / disabled — best effort */
  }
}

/** True if this event key has already been credited (don't pay twice). */
export function alreadyPaid(ledger: GoldLedger, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(ledger.paid, key);
}

/** Record a settled credit against the day's cap + the event key. */
export function recordPaid(
  ledger: GoldLedger,
  key: string,
  amount: number,
  date: string,
): void {
  ledger.paid[key] = amount;
  ledger.byDay[date] = (ledger.byDay[date] ?? 0) + amount;
}
