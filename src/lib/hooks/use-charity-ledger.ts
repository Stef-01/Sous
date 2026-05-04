"use client";

/**
 * useCharityLedger — bake-sale running-total hook (Y4 W6).
 *
 * Wraps the W5 aggregator + W6 storage layer in a localStorage-
 * backed hook. Same shape as Y4 W2 useLlmSpend.
 *
 * Real-mode wire-up: Y4 Sprint C swaps the localStorage layer
 * for a Postgres-backed sync. The hook surface stays unchanged.
 */

import { useCallback, useEffect, useState } from "react";
import {
  aggregateCharityRaised,
  estimateMonthlyRaisedMicroUsd,
  type CharityChargeEntry,
  type CharityRaisedAggregate,
} from "@/lib/charity/charity-ledger";
import {
  appendCharityCharge,
  buildCharityChargeEntry,
  CHARITY_LEDGER_STORAGE_KEY,
  freshCharityLedgerStorage,
  parseStoredCharityLedger,
  updateCharityChargeStatus,
  type CharityLedgerStorage,
  type NewCharityChargeInput,
} from "@/lib/charity/charity-ledger-storage";

export interface UseCharityLedgerOptions {
  /** Lookback window for aggregate. Default 30 days (longer
   *  than LLM-spend's 14d because charity is event-driven). */
  lookbackDays?: number;
  /** Override "now" for tests. */
  now?: Date;
}

export interface UseCharityLedgerResult {
  mounted: boolean;
  entries: ReadonlyArray<CharityChargeEntry>;
  aggregate: CharityRaisedAggregate;
  /** 30-day projection in micro-USD. 0 when fewer than 3 days
   *  of raises accumulated. */
  monthlyRaisedMicroUsd: number;
  /** Append a new charge. */
  recordCharityCharge: (input: NewCharityChargeInput) => void;
  /** Update an existing charge's status (refund / settle). */
  updateChargeStatus: (
    chargeId: string,
    status: CharityChargeEntry["status"],
  ) => void;
  /** Wipe all telemetry. */
  clearAll: () => void;
}

export function useCharityLedger(
  options: UseCharityLedgerOptions = {},
): UseCharityLedgerResult {
  const lookbackDays = options.lookbackDays ?? 30;
  const [storage, setStorage] = useState<CharityLedgerStorage>(() =>
    freshCharityLedgerStorage(options.now ?? new Date()),
  );
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate from localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(CHARITY_LEDGER_STORAGE_KEY);
      setStorage(parseStoredCharityLedger(raw));
    } catch {
      setStorage(freshCharityLedgerStorage());
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const persist = useCallback((next: CharityLedgerStorage) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CHARITY_LEDGER_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore — quota / privacy mode.
    }
  }, []);

  const recordCharityCharge = useCallback(
    (input: NewCharityChargeInput) => {
      setStorage((prev) => {
        const entry = buildCharityChargeEntry(input);
        const next = appendCharityCharge(prev, entry);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const updateChargeStatus = useCallback(
    (chargeId: string, status: CharityChargeEntry["status"]) => {
      setStorage((prev) => {
        const next = updateCharityChargeStatus(prev, chargeId, status);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearAll = useCallback(() => {
    setStorage(() => {
      const next = freshCharityLedgerStorage();
      persist(next);
      return next;
    });
  }, [persist]);

  const now = options.now ?? new Date();
  const aggregate = aggregateCharityRaised({
    entries: storage.entries,
    now,
    lookbackDays,
  });
  const monthlyRaisedMicroUsd = estimateMonthlyRaisedMicroUsd({
    entries: storage.entries,
    now,
  });

  return {
    mounted,
    entries: storage.entries,
    aggregate,
    monthlyRaisedMicroUsd,
    recordCharityCharge,
    updateChargeStatus,
    clearAll,
  };
}
