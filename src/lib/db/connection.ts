/**
 * Connection-string resolution.
 *
 * The app's canonical var is `DATABASE_URL`, but the **Vercel ↔ Supabase
 * integration** injects the connection string as `POSTGRES_URL` (pooled,
 * transaction mode) + `POSTGRES_PRISMA_URL` + `POSTGRES_URL_NON_POOLING`
 * — it does NOT set `DATABASE_URL`. Reading only `DATABASE_URL` means a
 * Vercel deploy wired through that integration silently falls back to
 * local/static mode and never touches Supabase.
 *
 * This helper accepts either name so the integration "just works" with no
 * manual env edit, preferring the pooled URL (safe with `prepare:false`).
 */
export function getDatabaseUrl(): string | null {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    "";
  return url.length > 0 ? url : null;
}

export function hasDatabaseUrl(): boolean {
  return getDatabaseUrl() !== null;
}
