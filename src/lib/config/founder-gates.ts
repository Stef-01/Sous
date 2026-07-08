export type FounderGateId =
  | "auth"
  | "database"
  | "storage"
  | "realtime"
  | "charity-payments"
  | "ai";

export type FounderGateMode = "mock" | "stub" | "live";

export interface FounderGateStatus {
  id: FounderGateId;
  mode: FounderGateMode;
  ready: boolean;
  configuredEnv: string[];
  missingEnv: string[];
  blockedByFlag: string | null;
  notes: string[];
}

export interface FounderGateEnv {
  CLERK_SECRET_KEY?: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  SOUS_AUTH_ENABLED?: string;

  DATABASE_URL?: string;
  POSTGRES_URL?: string;

  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SOUS_STORAGE_ENABLED?: string;
  NEXT_PUBLIC_SOUS_STORAGE_ENABLED?: string;
  SOUS_REALTIME_ENABLED?: string;
  NEXT_PUBLIC_SOUS_REALTIME_ENABLED?: string;
  R2_BUCKET_NAME?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_PUBLIC_DOMAIN?: string;

  STRIPE_SECRET_KEY?: string;
  SOUS_CHARITY_CHARGE_ENABLED?: string;

  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  SOUS_AI_ENABLED?: string;
  SOUS_LLM_DAILY_BUDGET_MICRO_USD?: string;
  SOUS_LLM_MONTHLY_BUDGET_MICRO_USD?: string;
}

export interface LlmCostBudget {
  dailyBudgetMicroUsd: number | null;
  monthlyBudgetMicroUsd: number | null;
}

export type LlmCostGuardDecision =
  | {
      ok: true;
      reason: "within-budget" | "no-budget-configured";
    }
  | {
      ok: false;
      reason: "daily-budget-exceeded" | "monthly-budget-exceeded";
    };

const GATE_ORDER: FounderGateId[] = [
  "auth",
  "database",
  "storage",
  "realtime",
  "charity-payments",
  "ai",
];

export function resolveFounderGateStatuses(
  env: FounderGateEnv = process.env as FounderGateEnv,
): FounderGateStatus[] {
  return GATE_ORDER.map((id) => resolveFounderGateStatus(id, env));
}

export function resolveFounderGateStatus(
  id: FounderGateId,
  env: FounderGateEnv = process.env as FounderGateEnv,
): FounderGateStatus {
  switch (id) {
    case "auth":
      return resolveAuthGate(env);
    case "database":
      return resolveDatabaseGate(env);
    case "storage":
      return resolveStorageGate(env);
    case "realtime":
      return resolveRealtimeGate(env);
    case "charity-payments":
      return resolveCharityPaymentsGate(env);
    case "ai":
      return resolveAiGate(env);
  }
}

export function summariseFounderGateModes(
  statuses: ReadonlyArray<FounderGateStatus>,
): Record<FounderGateId, FounderGateMode> {
  const out = {} as Record<FounderGateId, FounderGateMode>;
  for (const status of statuses) out[status.id] = status.mode;
  return out;
}

export function parseLlmCostBudget(env: FounderGateEnv): LlmCostBudget {
  return {
    dailyBudgetMicroUsd: parsePositiveInt(env.SOUS_LLM_DAILY_BUDGET_MICRO_USD),
    monthlyBudgetMicroUsd: parsePositiveInt(
      env.SOUS_LLM_MONTHLY_BUDGET_MICRO_USD,
    ),
  };
}

export function decideLlmCostGuard(input: {
  budget: LlmCostBudget;
  projectedDailyMicroUsd: number;
  projectedMonthlyMicroUsd: number;
}): LlmCostGuardDecision {
  const daily = input.budget.dailyBudgetMicroUsd;
  const monthly = input.budget.monthlyBudgetMicroUsd;
  if (daily !== null && input.projectedDailyMicroUsd > daily) {
    return { ok: false, reason: "daily-budget-exceeded" };
  }
  if (monthly !== null && input.projectedMonthlyMicroUsd > monthly) {
    return { ok: false, reason: "monthly-budget-exceeded" };
  }
  if (daily === null && monthly === null) {
    return { ok: true, reason: "no-budget-configured" };
  }
  return { ok: true, reason: "within-budget" };
}

function resolveAuthGate(env: FounderGateEnv): FounderGateStatus {
  const required = [
    "CLERK_SECRET_KEY",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  ] as const;
  const parts = envPresence(env, required);
  const blocked =
    env.SOUS_AUTH_ENABLED === "false" ? "SOUS_AUTH_ENABLED" : null;
  const live = parts.missing.length === 0 && blocked === null;
  return {
    id: "auth",
    mode: live ? "live" : "mock",
    ready: live,
    configuredEnv: parts.configured,
    missingEnv: parts.missing,
    blockedByFlag: blocked,
    notes: live
      ? ["Clerk provider and server auth can be enabled."]
      : ["Mock user remains the default; no sign-in wall is required."],
  };
}

function resolveDatabaseGate(env: FounderGateEnv): FounderGateStatus {
  const hasDatabaseUrl = hasValue(env.DATABASE_URL);
  const hasPostgresUrl = hasValue(env.POSTGRES_URL);
  const live = hasDatabaseUrl || hasPostgresUrl;
  return {
    id: "database",
    mode: live ? "live" : "stub",
    ready: live,
    configuredEnv: [
      ...(hasDatabaseUrl ? ["DATABASE_URL"] : []),
      ...(hasPostgresUrl ? ["POSTGRES_URL"] : []),
    ],
    missingEnv: live ? [] : ["DATABASE_URL|POSTGRES_URL"],
    blockedByFlag: null,
    notes: live
      ? ["Postgres-backed reads and write-through persistence can run."]
      : [
          "The app keeps serving bundled content and localStorage writes until the Supabase connection string is present.",
        ],
  };
}

function resolveStorageGate(env: FounderGateEnv): FounderGateStatus {
  const supabaseRequired = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ] as const;
  const r2Required = [
    "R2_BUCKET_NAME",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_PUBLIC_DOMAIN",
  ] as const;
  const supabaseParts = envPresence(env, supabaseRequired);
  const r2Parts = envPresence(env, r2Required);
  const hasSupabase = supabaseParts.missing.length === 0;
  const hasR2 = r2Parts.missing.length === 0;
  const blocked =
    env.SOUS_STORAGE_ENABLED === "false" ||
    env.NEXT_PUBLIC_SOUS_STORAGE_ENABLED === "false"
      ? flagName(env, [
          "SOUS_STORAGE_ENABLED",
          "NEXT_PUBLIC_SOUS_STORAGE_ENABLED",
        ])
      : null;
  const live = (hasSupabase || hasR2) && blocked === null;
  return {
    id: "storage",
    mode: live ? "live" : "stub",
    ready: live,
    configuredEnv: [...supabaseParts.configured, ...r2Parts.configured],
    missingEnv: live ? [] : [...supabaseParts.missing, ...r2Parts.missing],
    blockedByFlag: blocked,
    notes: live
      ? [
          "Cook-photo uploads can use the configured Supabase Storage or R2 rail.",
        ]
      : ["Photo upload callers keep returning null and fall back locally."],
  };
}

function resolveRealtimeGate(env: FounderGateEnv): FounderGateStatus {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ] as const;
  const parts = envPresence(env, required);
  const requested =
    env.SOUS_REALTIME_ENABLED === "true" ||
    env.NEXT_PUBLIC_SOUS_REALTIME_ENABLED === "true";
  const blocked = requested ? null : "SOUS_REALTIME_ENABLED";
  const live = requested && parts.missing.length === 0;
  return {
    id: "realtime",
    mode: live ? "live" : "stub",
    ready: live,
    configuredEnv: parts.configured,
    missingEnv: parts.missing,
    blockedByFlag: blocked,
    notes: live
      ? ["Cook Together can swap from local bus to Supabase Realtime."]
      : ["Cook Together stays on the deterministic local adapter."],
  };
}

function resolveCharityPaymentsGate(env: FounderGateEnv): FounderGateStatus {
  const required = ["STRIPE_SECRET_KEY"] as const;
  const parts = envPresence(env, required);
  const blocked =
    env.SOUS_CHARITY_CHARGE_ENABLED === "false"
      ? "SOUS_CHARITY_CHARGE_ENABLED"
      : null;
  const live = parts.missing.length === 0 && blocked === null;
  return {
    id: "charity-payments",
    mode: live ? "live" : "stub",
    ready: live,
    configuredEnv: parts.configured,
    missingEnv: parts.missing,
    blockedByFlag: blocked,
    notes: live
      ? ["Verified nonprofit pledge charges can use Stripe."]
      : ["Charity charge dispatcher remains in no-money stub mode."],
  };
}

function resolveAiGate(env: FounderGateEnv): FounderGateStatus {
  const hasAnthropic = hasValue(env.ANTHROPIC_API_KEY);
  const hasOpenAi = hasValue(env.OPENAI_API_KEY);
  const blocked = env.SOUS_AI_ENABLED === "false" ? "SOUS_AI_ENABLED" : null;
  const live = (hasAnthropic || hasOpenAi) && blocked === null;
  const budget = parseLlmCostBudget(env);
  const configured = [
    ...(hasAnthropic ? ["ANTHROPIC_API_KEY"] : []),
    ...(hasOpenAi ? ["OPENAI_API_KEY"] : []),
    ...(budget.dailyBudgetMicroUsd !== null
      ? ["SOUS_LLM_DAILY_BUDGET_MICRO_USD"]
      : []),
    ...(budget.monthlyBudgetMicroUsd !== null
      ? ["SOUS_LLM_MONTHLY_BUDGET_MICRO_USD"]
      : []),
  ];
  const missing = [
    ...(!hasAnthropic && !hasOpenAi
      ? ["ANTHROPIC_API_KEY|OPENAI_API_KEY"]
      : []),
  ];
  const notes = live
    ? ["Real AI providers can be selected by existing lazy factories."]
    : ["Mock and heuristic providers remain the default."];
  if (
    live &&
    budget.dailyBudgetMicroUsd === null &&
    budget.monthlyBudgetMicroUsd === null
  ) {
    notes.push(
      "No LLM budget env is configured; dashboard telemetry still records calls.",
    );
  }

  return {
    id: "ai",
    mode: live ? "live" : "stub",
    ready: live,
    configuredEnv: configured,
    missingEnv: missing,
    blockedByFlag: blocked,
    notes,
  };
}

function envPresence(
  env: FounderGateEnv,
  names: ReadonlyArray<keyof FounderGateEnv>,
): { configured: string[]; missing: string[] } {
  const configured: string[] = [];
  const missing: string[] = [];
  for (const name of names) {
    if (hasValue(env[name])) configured.push(name);
    else missing.push(name);
  }
  return { configured, missing };
}

function hasValue(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parsePositiveInt(value: string | undefined): number | null {
  if (!hasValue(value)) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function flagName(
  env: FounderGateEnv,
  names: ReadonlyArray<keyof FounderGateEnv>,
): string | null {
  for (const name of names) {
    if (env[name] === "false") return name;
  }
  return null;
}
