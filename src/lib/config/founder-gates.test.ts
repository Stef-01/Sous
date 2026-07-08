import { describe, expect, it } from "vitest";
import {
  decideLlmCostGuard,
  parseLlmCostBudget,
  resolveFounderGateStatus,
  resolveFounderGateStatuses,
  summariseFounderGateModes,
} from "./founder-gates";

describe("resolveFounderGateStatus", () => {
  it("keeps every gate mock/stub when no founder env is configured", () => {
    expect(summariseFounderGateModes(resolveFounderGateStatuses({}))).toEqual({
      auth: "mock",
      database: "stub",
      storage: "stub",
      realtime: "stub",
      "charity-payments": "stub",
      ai: "stub",
    });
  });

  it("marks auth live only when both Clerk keys are present", () => {
    expect(
      resolveFounderGateStatus("auth", {
        CLERK_SECRET_KEY: "sk",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk",
      }),
    ).toMatchObject({
      id: "auth",
      mode: "live",
      ready: true,
      missingEnv: [],
    });
  });

  it("lets SOUS_AUTH_ENABLED=false force the mock user path", () => {
    expect(
      resolveFounderGateStatus("auth", {
        CLERK_SECRET_KEY: "sk",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk",
        SOUS_AUTH_ENABLED: "false",
      }),
    ).toMatchObject({
      mode: "mock",
      ready: false,
      blockedByFlag: "SOUS_AUTH_ENABLED",
    });
  });

  it("marks database live when DATABASE_URL or POSTGRES_URL is present", () => {
    expect(
      resolveFounderGateStatus("database", {
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({
      mode: "live",
      ready: true,
      configuredEnv: ["DATABASE_URL"],
      missingEnv: [],
    });

    expect(
      resolveFounderGateStatus("database", {
        POSTGRES_URL: "postgres://vercel-supabase",
      }),
    ).toMatchObject({
      mode: "live",
      ready: true,
      configuredEnv: ["POSTGRES_URL"],
      missingEnv: [],
    });
  });

  it("keeps database in stub mode until a Supabase connection string exists", () => {
    expect(resolveFounderGateStatus("database", {})).toMatchObject({
      mode: "stub",
      ready: false,
      missingEnv: ["DATABASE_URL|POSTGRES_URL"],
    });
  });

  it("marks storage live from Supabase public env unless explicitly disabled", () => {
    expect(
      resolveFounderGateStatus("storage", {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      }),
    ).toMatchObject({ mode: "live", ready: true });

    expect(
      resolveFounderGateStatus("storage", {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
        SOUS_STORAGE_ENABLED: "false",
      }),
    ).toMatchObject({
      mode: "stub",
      ready: false,
      blockedByFlag: "SOUS_STORAGE_ENABLED",
    });
  });

  it("marks storage live from the existing R2 photo bucket contract", () => {
    expect(
      resolveFounderGateStatus("storage", {
        R2_BUCKET_NAME: "sous-photos",
        R2_ACCESS_KEY_ID: "access",
        R2_SECRET_ACCESS_KEY: "secret",
        R2_PUBLIC_DOMAIN: "https://photos.example.com",
      }),
    ).toMatchObject({
      mode: "live",
      ready: true,
      missingEnv: [],
    });
  });

  it("requires a realtime opt-in flag plus Supabase env", () => {
    expect(
      resolveFounderGateStatus("realtime", {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      }),
    ).toMatchObject({
      mode: "stub",
      ready: false,
      blockedByFlag: "SOUS_REALTIME_ENABLED",
    });

    expect(
      resolveFounderGateStatus("realtime", {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
        NEXT_PUBLIC_SOUS_REALTIME_ENABLED: "true",
      }),
    ).toMatchObject({ mode: "live", ready: true, blockedByFlag: null });
  });

  it("marks charity payments live only with Stripe key and no kill switch", () => {
    expect(
      resolveFounderGateStatus("charity-payments", {
        STRIPE_SECRET_KEY: "sk_test",
      }),
    ).toMatchObject({ mode: "live", ready: true });

    expect(
      resolveFounderGateStatus("charity-payments", {
        STRIPE_SECRET_KEY: "sk_test",
        SOUS_CHARITY_CHARGE_ENABLED: "false",
      }),
    ).toMatchObject({
      mode: "stub",
      ready: false,
      blockedByFlag: "SOUS_CHARITY_CHARGE_ENABLED",
    });
  });

  it("marks AI live when either Anthropic or OpenAI key is present", () => {
    expect(
      resolveFounderGateStatus("ai", { ANTHROPIC_API_KEY: "anthropic" }),
    ).toMatchObject({
      mode: "live",
      ready: true,
      configuredEnv: ["ANTHROPIC_API_KEY"],
    });

    expect(
      resolveFounderGateStatus("ai", { OPENAI_API_KEY: "openai" }),
    ).toMatchObject({
      mode: "live",
      ready: true,
      configuredEnv: ["OPENAI_API_KEY"],
    });
  });

  it("lets SOUS_AI_ENABLED=false force AI stub mode", () => {
    expect(
      resolveFounderGateStatus("ai", {
        ANTHROPIC_API_KEY: "anthropic",
        SOUS_AI_ENABLED: "false",
      }),
    ).toMatchObject({
      mode: "stub",
      ready: false,
      blockedByFlag: "SOUS_AI_ENABLED",
    });
  });
});

describe("LLM cost guard", () => {
  it("parses positive integer micro-USD budgets and ignores bad values", () => {
    expect(
      parseLlmCostBudget({
        SOUS_LLM_DAILY_BUDGET_MICRO_USD: "250000",
        SOUS_LLM_MONTHLY_BUDGET_MICRO_USD: "not-a-number",
      }),
    ).toEqual({
      dailyBudgetMicroUsd: 250000,
      monthlyBudgetMicroUsd: null,
    });
  });

  it("allows calls when no budget is configured", () => {
    expect(
      decideLlmCostGuard({
        budget: { dailyBudgetMicroUsd: null, monthlyBudgetMicroUsd: null },
        projectedDailyMicroUsd: 99_000_000,
        projectedMonthlyMicroUsd: 99_000_000,
      }),
    ).toEqual({ ok: true, reason: "no-budget-configured" });
  });

  it("blocks when the daily budget would be exceeded before monthly checks", () => {
    expect(
      decideLlmCostGuard({
        budget: {
          dailyBudgetMicroUsd: 10_000,
          monthlyBudgetMicroUsd: 1_000_000,
        },
        projectedDailyMicroUsd: 10_001,
        projectedMonthlyMicroUsd: 20_000,
      }),
    ).toEqual({ ok: false, reason: "daily-budget-exceeded" });
  });

  it("blocks when the monthly budget would be exceeded", () => {
    expect(
      decideLlmCostGuard({
        budget: {
          dailyBudgetMicroUsd: 10_000,
          monthlyBudgetMicroUsd: 20_000,
        },
        projectedDailyMicroUsd: 9_000,
        projectedMonthlyMicroUsd: 20_001,
      }),
    ).toEqual({ ok: false, reason: "monthly-budget-exceeded" });
  });
});
