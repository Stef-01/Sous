/**
 * Data-source selector (Y4 W10).
 *
 * Pure helper: pick between localStorage and Postgres data
 * sources based on the runtime environment. Each
 * localStorage-backed substrate (LLM spend, charity ledger,
 * meal-plan, cook-sessions) gets a follow-on read-through
 * adapter — this module decides which one to instantiate.
 *
 * Real-mode flip: pasting DATABASE_URL into env is enough; the
 * existing client-side hooks continue to work (they read the
 * localStorage cache while the read-through adapter back-fills
 * from Postgres on hydrate). No code change needed at the call
 * sites.
 *
 * Pure / dependency-free / deterministic.
 */

export type DataSourceKind = "local" | "postgres";

export interface DataSourceSelectionInput {
  /** Whether `DATABASE_URL` is set in the environment. */
  hasDatabaseUrl: boolean;
  /** Whether the runtime is the browser (localStorage available)
   *  or a server-side render. */
  isBrowser: boolean;
}

export interface DataSourceSelection {
  kind: DataSourceKind;
  /** Human-readable rationale; surfaces in `/path/llm-spend`
   *  + `/path/charity-spend` so the founder sees which mode
   *  is active. */
  rationale: string;
}

/** Pure: select the data source based on env + runtime. */
export function selectDataSource(
  input: DataSourceSelectionInput,
): DataSourceSelection {
  // Server-side renders without a DATABASE_URL effectively
  // can't read anything — the hook surface returns the fresh
  // default. We still report "local" so the consumer routes
  // through the localStorage path on next mount.
  if (!input.hasDatabaseUrl) {
    return {
      kind: "local",
      rationale:
        "DATABASE_URL not set — using browser localStorage as source of record. Paste the env var to flip into Postgres mode.",
    };
  }
  // DATABASE_URL set → browser hydrates from Postgres on mount;
  // localStorage becomes write-through cache for offline-first
  // resilience.
  if (!input.isBrowser) {
    return {
      kind: "postgres",
      rationale: "Server-side; reading directly from Postgres.",
    };
  }
  return {
    kind: "postgres",
    rationale:
      "DATABASE_URL set; browser hydrates from Postgres + writes through localStorage cache.",
  };
}

/** Pure: detect from current environment. SSR-safe. */
export function detectRuntimeSelection(): DataSourceSelection {
  const hasDatabaseUrl =
    typeof process !== "undefined" &&
    typeof process.env?.DATABASE_URL === "string" &&
    process.env.DATABASE_URL.length > 0;
  const isBrowser = typeof window !== "undefined";
  return selectDataSource({ hasDatabaseUrl, isBrowser });
}
