import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getDatabaseUrl } from "./connection";

let _db: PostgresJsDatabase<typeof schema> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    const url = getDatabaseUrl();
    if (!url) {
      throw new Error(
        "No database connection string. Set DATABASE_URL (or POSTGRES_URL, " +
          "which the Vercel↔Supabase integration injects automatically).",
      );
    }
    // Supabase Postgres via postgres-js. `prepare: false` is required
    // when connecting through the Supabase transaction pooler (port
    // 6543), which does not support prepared statements; it is also
    // safe for direct / session-pooler connections.
    _client = postgres(url, { prepare: false });
    _db = drizzle(_client, { schema });
  }
  return _db;
}

// Convenience alias  -  lazily initialized on first property access
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_, prop) {
    const instance = getDb();
    return (instance as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type Database = PostgresJsDatabase<typeof schema>;
