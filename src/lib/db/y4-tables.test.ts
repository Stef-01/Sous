/**
 * Y4 Drizzle table integrity + Zod-shape parity tests.
 *
 * Same shape as the Y2 tables test: structural integrity
 * (column names, table names) without spinning up Postgres.
 * The Y4 W9 acceptance is that the table definitions compile +
 * structurally mirror their localStorage-Zod counterparts.
 */

import { describe, expect, it } from "vitest";
import {
  charityChargeEntries,
  llmCallEntries,
  mealPlanSlots,
} from "./y4-tables";

describe("Y4 tables — primary keys + table names", () => {
  it("each table has a defined id column", () => {
    const tables = [mealPlanSlots, llmCallEntries, charityChargeEntries];
    for (const table of tables) {
      expect(table.id).toBeDefined();
    }
  });
});

describe("meal_plan_slots — column parity with MealPlanWeek", () => {
  it("has the slot-key fields (ownerId / weekKey / slot / recipeSlug / source)", () => {
    expect(mealPlanSlots.ownerId).toBeDefined();
    expect(mealPlanSlots.weekKey).toBeDefined();
    expect(mealPlanSlots.slot).toBeDefined();
    expect(mealPlanSlots.recipeSlug).toBeDefined();
    expect(mealPlanSlots.source).toBeDefined();
    expect(mealPlanSlots.scheduledAt).toBeDefined();
  });
});

describe("llm_call_entries — column parity with LlmCallEntry", () => {
  it("has the entry fields (ownerId / surface / calledAt / tokensBilled / costMicroUsd / outcome)", () => {
    expect(llmCallEntries.ownerId).toBeDefined();
    expect(llmCallEntries.surface).toBeDefined();
    expect(llmCallEntries.calledAt).toBeDefined();
    expect(llmCallEntries.tokensBilled).toBeDefined();
    expect(llmCallEntries.costMicroUsd).toBeDefined();
    expect(llmCallEntries.outcome).toBeDefined();
  });
});

describe("charity_charge_entries — column parity with CharityChargeEntry", () => {
  it("has the entry fields (stripeChargeId / eventSlug / nonprofitSlug / amountMicroUsd / chargedAt / status)", () => {
    expect(charityChargeEntries.stripeChargeId).toBeDefined();
    expect(charityChargeEntries.eventSlug).toBeDefined();
    expect(charityChargeEntries.nonprofitSlug).toBeDefined();
    expect(charityChargeEntries.amountMicroUsd).toBeDefined();
    expect(charityChargeEntries.chargedAt).toBeDefined();
    expect(charityChargeEntries.status).toBeDefined();
  });
});
