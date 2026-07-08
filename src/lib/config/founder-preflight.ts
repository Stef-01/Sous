import {
  resolveFounderGateStatuses,
  type FounderGateEnv,
  type FounderGateId,
  type FounderGateStatus,
} from "./founder-gates";

interface FounderGatePlaybookEntry {
  id: FounderGateId;
  label: string;
  founderAction: string;
  smokeTest: string;
}

export interface FounderPreflightItem extends FounderGateStatus {
  label: string;
  founderAction: string;
  smokeTest: string;
}

export interface FounderPreflightReport {
  readyCount: number;
  totalCount: number;
  liveGates: FounderGateId[];
  blockedGates: FounderGateId[];
  nextAction: FounderPreflightItem | null;
  items: FounderPreflightItem[];
}

const PLAYBOOK: FounderGatePlaybookEntry[] = [
  {
    id: "database",
    label: "Database",
    founderAction:
      "Add the Supabase pooler connection string as DATABASE_URL, or use POSTGRES_URL from the Vercel Supabase integration.",
    smokeTest:
      "Run /api/health, complete one cook, then confirm the cook session persists after reload.",
  },
  {
    id: "auth",
    label: "Auth",
    founderAction:
      "Add auth provider keys and confirm Clerk versus Supabase Auth before enabling real sessions.",
    smokeTest:
      "Sign in, complete one cook, and confirm the session is tied to the real user id.",
  },
  {
    id: "storage",
    label: "Storage",
    founderAction:
      "Add Supabase Storage public env or the full R2 bucket env before enabling user photo uploads.",
    smokeTest:
      "Resolve a stored win photo to a public URL and render it on Path and gift/cook surfaces.",
  },
  {
    id: "realtime",
    label: "Realtime",
    founderAction:
      "Add Supabase public env and opt in with SOUS_REALTIME_ENABLED=true only after the live channel path is selected.",
    smokeTest:
      "Join the same cook from two browsers and confirm presence plus step progress converge.",
  },
  {
    id: "charity-payments",
    label: "Charity Payments",
    founderAction:
      "Add Stripe keys only after charity/KYC decisions and verified nonprofit records are ready.",
    smokeTest:
      "Run one test-mode pledge charge twice and confirm idempotency on retry.",
  },
  {
    id: "ai",
    label: "AI",
    founderAction:
      "Add Anthropic or OpenAI provider env plus daily/monthly budget env before enabling real calls.",
    smokeTest:
      "Trigger one real provider call, confirm cost telemetry, then verify over-budget blocking.",
  },
];

const PLAYBOOK_BY_ID = new Map(PLAYBOOK.map((entry) => [entry.id, entry]));

export function buildFounderPreflightReport(
  env: FounderGateEnv = process.env as FounderGateEnv,
): FounderPreflightReport {
  const statusesById = new Map(
    resolveFounderGateStatuses(env).map((status) => [status.id, status]),
  );
  const items = PLAYBOOK.map((entry) => {
    const status = statusesById.get(entry.id);
    if (!status) {
      throw new Error(`Missing founder-gate status for ${entry.id}`);
    }
    return toPreflightItem(status);
  });
  const liveGates = items.filter((item) => item.ready).map((item) => item.id);
  const blockedGates = items
    .filter((item) => !item.ready)
    .map((item) => item.id);

  return {
    readyCount: liveGates.length,
    totalCount: items.length,
    liveGates,
    blockedGates,
    nextAction: items.find((item) => !item.ready) ?? null,
    items,
  };
}

export function formatFounderPreflightReport(
  report: FounderPreflightReport,
): string {
  const lines = [
    "Founder unlock preflight",
    `Ready gates: ${report.readyCount}/${report.totalCount}`,
    "",
  ];

  for (const item of report.items) {
    const state = item.ready ? "READY" : item.mode.toUpperCase();
    lines.push(`${state} - ${item.label}`);
    lines.push(`  configured: ${listOrDash(item.configuredEnv)}`);
    lines.push(`  missing: ${listOrDash(item.missingEnv)}`);
    if (item.blockedByFlag) {
      lines.push(`  blocked by: ${item.blockedByFlag}`);
    }
    lines.push(`  note: ${item.notes.join(" ")}`);
  }

  lines.push("");
  if (report.nextAction) {
    lines.push(`Next founder action: ${report.nextAction.label}`);
    lines.push(`  ${report.nextAction.founderAction}`);
    lines.push(`Smoke after unlock: ${report.nextAction.smokeTest}`);
  } else {
    lines.push("Next founder action: all configured gates are ready.");
    lines.push("Smoke after unlock: run the full founder-unlock checklist.");
  }

  return lines.join("\n");
}

function toPreflightItem(status: FounderGateStatus): FounderPreflightItem {
  const entry = PLAYBOOK_BY_ID.get(status.id);
  if (!entry) throw new Error(`Missing founder-gate playbook for ${status.id}`);
  return { ...status, ...entry };
}

function listOrDash(values: string[]): string {
  return values.length > 0 ? values.join(", ") : "-";
}
