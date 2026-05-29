"use client";

/**
 * useLlmSpend — LLM cost telemetry hook (Y4 W2).
 *
 * Wraps the Y4 W1 aggregator + W2 storage layer in a
 * localStorage-backed React hook. Following the W15 RCA
 * pattern: freshDefault factory, safe parser, partial-recovery.
 *
 * Real-mode wire-up: Y4 Sprint C swaps the localStorage layer
 * for a Postgres-backed sync. The hook surface stays unchanged.
 */

import { useCallback, useEffect, useState } from "react";
import {
  aggregateSpend,
  estimateMonthlyBurn,
  type LlmCallEntry,
  type SpendAggregate,
} from "@/lib/telemetry/llm-spend";
import {
  appendLlmCall,
  buildLlmCallEntry,
  freshLlmSpendStorage,
  LLM_SPEND_STORAGE_KEY,
  parseStoredLlmSpend,
  type LlmSpendStorage,
  type NewLlmCallInput,
} from "@/lib/telemetry/llm-spend-storage";

export interface UseLlmSpendOptions {
  /** Lookback window for aggregateSpend. Default 14 days. */
  lookbackDays?: number;
  /** Override "now" for tests. */
  now?: Date;
}

export interface UseLlmSpendResult {
  mounted: boolean;
  entries: ReadonlyArray<LlmCallEntry>;
  aggregate: SpendAggregate;
  /** 30-day projection in micro-USD. 0 when fewer than 3 days
   *  of data accumulated. */
  monthlyBurnMicroUsd: number;
  /** Append a new call. Persists synchronously. */
  recordLlmCall: (input: NewLlmCallInput) => void;
  /** Wipe all telemetry (e.g. user-initiated reset). */
  clearAll: () => void;
}

export function useLlmSpend(
  options: UseLlmSpendOptions = {},
): UseLlmSpendResult {
  const lookbackDays = options.lookbackDays ?? 14;
  const [storage, setStorage] = useState<LlmSpendStorage>(() =>
    freshLlmSpendStorage(options.now ?? new Date()),
  );
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate from localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LLM_SPEND_STORAGE_KEY);
      setStorage(parseStoredLlmSpend(raw));
    } catch {
      setStorage(freshLlmSpendStorage());
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const persist = useCallback((next: LlmSpendStorage) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LLM_SPEND_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore — quota / privacy mode. Telemetry is loss-OK.
    }
  }, []);

  const recordLlmCall = useCallback(
    (input: NewLlmCallInput) => {
      setStorage((prev) => {
        const entry = buildLlmCallEntry(input);
        const next = appendLlmCall(prev, entry);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearAll = useCallback(() => {
    setStorage((prev) => {
      const next = freshLlmSpendStorage();
      persist(next);
      return { ...next, schemaVersion: prev.schemaVersion };
    });
  }, [persist]);

  // Per-render compute is fine: aggregateSpend is O(entries)
  // with entries capped at 1000, and the dashboard is the only
  // consumer. Avoiding useMemo keeps the React Compiler happy.
  const now = options.now ?? new Date();
  const aggregate = aggregateSpend({
    entries: storage.entries,
    now,
    lookbackDays,
  });
  const monthlyBurnMicroUsd = estimateMonthlyBurn({
    entries: storage.entries,
    now,
  });

  return {
    mounted,
    entries: storage.entries,
    aggregate,
    monthlyBurnMicroUsd,
    recordLlmCall,
    clearAll,
  };
}
