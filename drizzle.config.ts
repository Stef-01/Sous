import { defineConfig } from "drizzle-kit";

// NOTE: The canonical schema for the provisioned Supabase project is
// the committed SQL under `supabase/migrations/` (already applied).
// This config powers `drizzle-kit studio`/`generate` for the live
// client schema (src/lib/db/schema.ts). Avoid `drizzle-kit push`
// against the remote project — it does not see the y2/y4 stub tables
// or the SQL-level indexes and would report spurious drift. Use a new
// Supabase migration for schema changes instead.
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
