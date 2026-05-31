# Supabase Setup — Sous

The Sous backend is fully provisioned on Supabase. The database is
created, the schema is applied, all content is seeded, security (RLS)
is configured, and the app code talks to it via Drizzle + `postgres-js`.

**There is exactly one step left for the founder** (a secret only you
can retrieve): paste the database password into `.env.local`. Until
then the app runs in local/static mode — fully usable, with content
served from the bundled JSON and user writes kept in `localStorage`.

---

## 1. The provisioned project

| Item            | Value                                            |
| --------------- | ------------------------------------------------ |
| Project name    | `sous`                                           |
| Project ref     | `bkkjtmvyayieyeeshbim`                           |
| Region          | `us-east-1`                                      |
| API URL         | `https://bkkjtmvyayieyeeshbim.supabase.co`       |
| Publishable key | `sb_publishable_ESv4s35G9HC6HuHnQcor3A_NY4bd29E` |
| Postgres        | 17.6                                             |

> A dedicated project was created rather than reusing the org's
> existing (unrelated healthcare) project, so Sous has its own
> database, keys, and security boundary.

---

## 2. The one founder step — wire up `DATABASE_URL`

Create `.env.local` in the repo root (it is gitignored) and paste:

```dotenv
# Supabase — Sous (ref bkkjtmvyayieyeeshbim, us-east-1)
NEXT_PUBLIC_SUPABASE_URL="https://bkkjtmvyayieyeeshbim.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_ESv4s35G9HC6HuHnQcor3A_NY4bd29E"
SUPABASE_URL="https://bkkjtmvyayieyeeshbim.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_ESv4s35G9HC6HuHnQcor3A_NY4bd29E"

# Go live against Supabase — add your DB password and uncomment ONE:
# Direct (local dev):
# DATABASE_URL="postgresql://postgres:[YOUR-DB-PASSWORD]@db.bkkjtmvyayieyeeshbim.supabase.co:5432/postgres"
# Transaction pooler (Vercel/serverless — copy exact host from dashboard):
# DATABASE_URL="postgresql://postgres.bkkjtmvyayieyeeshbim:[YOUR-DB-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

Get the password from **Dashboard → Project Settings → Database**
(use **Reset database password** if you don't have it). For Vercel,
add `DATABASE_URL` (the pooler form) as an environment variable and
copy the exact pooler host from the dashboard's **Connect** dialog.

That's it. With `DATABASE_URL` set, `cook.getSteps` reads from
Postgres and `cookSession.complete` persists cooks server-side.

---

## 3. What's already done (autonomously)

- **Schema** — 22 tables created (migrations in `supabase/migrations/`):
  content (`side_dishes`, `meals`, `cook_steps`, `ingredients`),
  user/journey (`users`, `cook_sessions`, `saved_recipes`,
  `quiz_responses`, `parent_profile`, `kid_friendliness_label`,
  `kids_ate_it_log`, `recipe_overlay`), and the Y2/Y4 server tables
  (`user_recipes`, `recipe_score_breakdowns`, `pods`, `pod_members`,
  `pod_challenge_weeks`, `pod_submissions`, `notifications`,
  `meal_plan_slots`, `llm_call_entries`, `charity_charge_entries`).
- **Content seeded** — 205 side dishes, 76 meals, 445 cook steps,
  964 ingredients (119 dishes have full guided cook flows).
- **Security (RLS)** — enabled on every table. The content catalog is
  public read-only; all user-data tables are deny-by-default (no anon
  policy). The app's server connects with the `postgres` role, which
  bypasses RLS, so server-side queries are unaffected. The
  `security` advisor reports no errors/warnings (only the expected
  INFO "RLS enabled, no policy" on locked-down tables).
- **App wiring** — `src/lib/db/index.ts` uses `postgres-js`
  (`prepare: false`, pooler-safe). `cook.getSteps` reads content;
  `cookSession.complete` / `cookSession.history` read+write the
  journey log. All degrade gracefully to local/static mode when
  `DATABASE_URL` is unset.

### Live vs. table-ready

**Live now** (wired through tRPC + Drizzle): content catalog reads,
cook-step reads, cook-session writes + history.

**Table-ready** (schema + RLS exist; localStorage remains source of
truth until each hook is wired through): parent mode, kids-ate-it,
recipe overlays, pods/challenges, user recipes, meal plans, LLM
telemetry, charity ledger, notifications. Several of these are
founder-gated (Stripe, Anthropic keys, real multi-user auth); their
backend is ready so wiring is a follow-on, not a schema change.

---

## 4. Common tasks

```bash
# Re-seed a fresh DB/branch (needs DATABASE_URL):
pnpm db:seed

# Open Drizzle Studio against the DB:
pnpm db:studio

# Regenerate TypeScript types from the live schema (Supabase CLI):
supabase gen types typescript --project-id bkkjtmvyayieyeeshbim > src/lib/db/database.types.ts
```

### Schema changes

The canonical schema lives in `supabase/migrations/*.sql` (already
applied). Add changes as a **new** Supabase migration. Do **not** run
`drizzle-kit push` against the remote project — it does not model the
Y2/Y4 stub tables or the SQL-level indexes and would report spurious
drift. Keep `src/lib/db/schema.ts` in sync for the typed Drizzle
client.
