/**
 * Y4 Drizzle table definitions.
 *
 * Y4 Sprint C W9. Adds the server-side counterparts to every
 * Y3-Y4 localStorage-backed Zod schema:
 *
 *   - meal_plan_slots: per-user weekly meal-plan (Y3 W23 hook)
 *   - llm_call_entries: Y4 W1 LLM cost telemetry
 *   - charity_charge_entries: Y4 W5 charity ledger
 *
 * Same pattern as Y2 tables: standalone module so the Y4
 * additions are discoverable + the migration boundary is
 * explicit. Uses text user_id without FK references so the
 * module can be picked up independently by drizzle-kit (the
 * existing `users` table lives in schema.ts).
 *
 * Real-mode wire-up: `pnpm db:push` after pasting `DATABASE_URL`
 * creates the tables. Each existing localStorage hook gets a
 * follow-on commit that swaps to a server-of-record reader.
 *
 * (Cook sessions already have a server table in schema.ts;
 * not duplicated here.)
 */

import {
  pgTable,
  text,
  integer,
  bigint,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

// ── meal_plan_slots (Y3 W23) ────────────────────────────────

/** Server-side mirror of MealPlanWeek slots. One row per
 *  scheduled (week, day, meal) tuple. The Y3 W23 hook becomes
 *  read-through-cache once this table is online. */
export const mealPlanSlots = pgTable(
  "meal_plan_slots",
  {
    id: text("id").primaryKey(), // `${ownerId}-${weekKey}-${slot}`
    ownerId: text("owner_id").notNull(),
    /** ISO 8601 week key — "2026-W19". */
    weekKey: text("week_key").notNull(),
    /** "tue-lunch" / "wed-dinner" etc. */
    slot: text("slot").notNull(),
    recipeSlug: text("recipe_slug").notNull(),
    /** "swipe-planned" / "leftovers-auto" / "manual" / etc. */
    source: text("source").notNull(),
    scheduledAt: timestamp("scheduled_at").defaultNow().notNull(),
  },
  (t) => ({
    ownerWeekIdx: index("meal_plan_slots_owner_week_idx").on(
      t.ownerId,
      t.weekKey,
    ),
  }),
);

// ── llm_call_entries (Y4 W1) ────────────────────────────────

/** Server-side mirror of LlmCallEntry. The Anthropic + Tavily
 *  call sites write one row per real-mode call; the dashboard
 *  reads aggregate per-user spend. */
export const llmCallEntries = pgTable(
  "llm_call_entries",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    surface: text("surface").notNull(),
    /** ISO timestamp; preferred over the Postgres `now()` because
     *  the entry timestamp is captured at the call site. */
    calledAt: timestamp("called_at").notNull(),
    tokensBilled: integer("tokens_billed").notNull(),
    /** Stored as bigint — micro-USD can exceed int32 over a year
     *  for high-volume users. */
    costMicroUsd: bigint("cost_micro_usd", { mode: "number" }).notNull(),
    outcome: text("outcome").notNull(),
  },
  (t) => ({
    ownerCalledIdx: index("llm_call_entries_owner_called_idx").on(
      t.ownerId,
      t.calledAt,
    ),
    surfaceIdx: index("llm_call_entries_surface_idx").on(t.surface),
  }),
);

// ── charity_charge_entries (Y4 W5) ──────────────────────────

/** Server-side mirror of CharityChargeEntry. The Stripe webhook
 *  handler writes one row per charge.succeeded /
 *  charge.refunded event. */
export const charityChargeEntries = pgTable(
  "charity_charge_entries",
  {
    id: text("id").primaryKey(),
    /** Optional owner — non-attributable / public charges may
     *  pre-date a user account on the device. */
    ownerId: text("owner_id"),
    stripeChargeId: text("stripe_charge_id").notNull().unique(),
    eventSlug: text("event_slug").notNull(),
    nonprofitSlug: text("nonprofit_slug").notNull(),
    amountMicroUsd: bigint("amount_micro_usd", { mode: "number" }).notNull(),
    chargedAt: timestamp("charged_at").notNull(),
    status: text("status").notNull(), // "succeeded" | "refunded" | "pending"
  },
  (t) => ({
    eventIdx: index("charity_charge_entries_event_idx").on(t.eventSlug),
    nonprofitIdx: index("charity_charge_entries_nonprofit_idx").on(
      t.nonprofitSlug,
    ),
    chargedAtIdx: index("charity_charge_entries_charged_idx").on(t.chargedAt),
  }),
);
