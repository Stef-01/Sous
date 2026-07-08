export const COOK_TOGETHER_SCHEMA_VERSION = 1 as const;
export const DEFAULT_PRESENCE_STALE_MS = 90_000;

export type CookTogetherParticipantStatus =
  | "present"
  | "cooking"
  | "done"
  | "left";

export interface CookTogetherParticipant {
  id: string;
  displayName: string;
  joinedAt: string;
  lastSeenAt: string;
  stepIndex: number;
  status: CookTogetherParticipantStatus;
  completedAt?: string;
}

export interface CookTogetherSession {
  schemaVersion: typeof COOK_TOGETHER_SCHEMA_VERSION;
  sessionId: string;
  recipeSlug: string;
  hostId: string;
  createdAt: string;
  updatedAt: string;
  participants: Record<string, CookTogetherParticipant>;
}

export type CookTogetherEvent =
  | {
      type: "participant-joined";
      participantId: string;
      displayName: string;
      at: string;
    }
  | { type: "heartbeat"; participantId: string; at: string }
  | {
      type: "step-changed";
      participantId: string;
      stepIndex: number;
      at: string;
    }
  | { type: "participant-completed"; participantId: string; at: string }
  | { type: "participant-left"; participantId: string; at: string };

export interface CreateCookTogetherSessionInput {
  sessionId: string;
  recipeSlug: string;
  hostId: string;
  hostName: string;
  at: string;
}

export interface PresenceSummary {
  totalCount: number;
  activeCount: number;
  completedActiveCount: number;
  waitingActiveCount: number;
  activeParticipantIds: string[];
  staleParticipantIds: string[];
}

export type SharedWinState =
  | {
      status: "waiting";
      activeCount: number;
      completedCount: number;
      requiredCount: number;
      waitingOn: string[];
    }
  | {
      status: "ready";
      activeCount: number;
      completedCount: number;
      completedAt: string;
      cooks: string[];
      headline: string;
    };

export interface PresenceOptions {
  nowIso: string;
  staleMs?: number;
}

export interface SharedWinOptions extends PresenceOptions {
  minParticipants?: number;
}

export function createCookTogetherSession(
  input: CreateCookTogetherSessionInput,
): CookTogetherSession {
  const host = createParticipant({
    participantId: input.hostId,
    displayName: input.hostName,
    at: input.at,
  });

  return {
    schemaVersion: COOK_TOGETHER_SCHEMA_VERSION,
    sessionId: input.sessionId,
    recipeSlug: input.recipeSlug,
    hostId: input.hostId,
    createdAt: input.at,
    updatedAt: input.at,
    participants: { [host.id]: host },
  };
}

export function applyCookTogetherEvent(
  session: CookTogetherSession,
  event: CookTogetherEvent,
): CookTogetherSession {
  switch (event.type) {
    case "participant-joined": {
      const existing = session.participants[event.participantId];
      const participant: CookTogetherParticipant = {
        ...(existing ??
          createParticipant({
            participantId: event.participantId,
            displayName: event.displayName,
            at: event.at,
          })),
        displayName:
          event.displayName.trim() || existing?.displayName || "Cook",
        lastSeenAt: event.at,
        status: existing?.completedAt ? "done" : "present",
      };
      return withParticipant(session, participant, event.at);
    }
    case "heartbeat": {
      const existing = session.participants[event.participantId];
      if (!existing || existing.status === "left") return session;
      return withParticipant(
        session,
        { ...existing, lastSeenAt: event.at },
        event.at,
      );
    }
    case "step-changed": {
      const existing = session.participants[event.participantId];
      if (!existing || existing.status === "left") return session;
      return withParticipant(
        session,
        {
          ...existing,
          stepIndex: normalizeStepIndex(event.stepIndex),
          lastSeenAt: event.at,
          status: existing.completedAt ? "done" : "cooking",
        },
        event.at,
      );
    }
    case "participant-completed": {
      const existing = session.participants[event.participantId];
      if (!existing || existing.status === "left") return session;
      return withParticipant(
        session,
        {
          ...existing,
          lastSeenAt: event.at,
          status: "done",
          completedAt: existing.completedAt ?? event.at,
        },
        event.at,
      );
    }
    case "participant-left": {
      const existing = session.participants[event.participantId];
      if (!existing) return session;
      return withParticipant(
        session,
        { ...existing, lastSeenAt: event.at, status: "left" },
        event.at,
      );
    }
  }
}

export function listParticipants(
  session: CookTogetherSession,
): CookTogetherParticipant[] {
  return Object.values(session.participants).sort(
    (a, b) => a.joinedAt.localeCompare(b.joinedAt) || a.id.localeCompare(b.id),
  );
}

export function listActiveParticipants(
  session: CookTogetherSession,
  options: PresenceOptions,
): CookTogetherParticipant[] {
  return listParticipants(session).filter(
    (participant) =>
      participant.status !== "left" &&
      !isPresenceStale(
        participant,
        options.nowIso,
        options.staleMs ?? DEFAULT_PRESENCE_STALE_MS,
      ),
  );
}

export function summarizePresence(
  session: CookTogetherSession,
  options: PresenceOptions,
): PresenceSummary {
  const participants = listParticipants(session);
  const active = listActiveParticipants(session, options);
  const activeIds = new Set(active.map((participant) => participant.id));
  const completedActive = active.filter((participant) => isDone(participant));

  return {
    totalCount: participants.length,
    activeCount: active.length,
    completedActiveCount: completedActive.length,
    waitingActiveCount: active.length - completedActive.length,
    activeParticipantIds: active.map((participant) => participant.id),
    staleParticipantIds: participants
      .filter(
        (participant) =>
          participant.status !== "left" && !activeIds.has(participant.id),
      )
      .map((participant) => participant.id),
  };
}

export function deriveSharedWinState(
  session: CookTogetherSession,
  options: SharedWinOptions,
): SharedWinState {
  const active = listActiveParticipants(session, options);
  const completed = active.filter((participant) => isDone(participant));
  const minParticipants = options.minParticipants ?? 2;

  if (active.length >= minParticipants && completed.length === active.length) {
    const completedAt = completed
      .map((participant) => participant.completedAt)
      .filter((at): at is string => typeof at === "string")
      .sort()
      .at(-1);
    const cooks = completed.map((participant) => participant.displayName);

    return {
      status: "ready",
      activeCount: active.length,
      completedCount: completed.length,
      completedAt: completedAt ?? options.nowIso,
      cooks,
      headline: `${formatCookList(cooks)} finished together`,
    };
  }

  return {
    status: "waiting",
    activeCount: active.length,
    completedCount: completed.length,
    requiredCount: Math.max(minParticipants, active.length),
    waitingOn: active
      .filter((participant) => !isDone(participant))
      .map((participant) => participant.displayName),
  };
}

function createParticipant(input: {
  participantId: string;
  displayName: string;
  at: string;
}): CookTogetherParticipant {
  return {
    id: input.participantId,
    displayName: input.displayName.trim() || "Cook",
    joinedAt: input.at,
    lastSeenAt: input.at,
    stepIndex: 0,
    status: "present",
  };
}

function withParticipant(
  session: CookTogetherSession,
  participant: CookTogetherParticipant,
  at: string,
): CookTogetherSession {
  return {
    ...session,
    updatedAt: maxIso(session.updatedAt, at),
    participants: {
      ...session.participants,
      [participant.id]: participant,
    },
  };
}

function normalizeStepIndex(stepIndex: number): number {
  if (!Number.isFinite(stepIndex)) return 0;
  return Math.max(0, Math.floor(stepIndex));
}

function isDone(participant: CookTogetherParticipant): boolean {
  return (
    participant.status === "done" && typeof participant.completedAt === "string"
  );
}

function isPresenceStale(
  participant: CookTogetherParticipant,
  nowIso: string,
  staleMs: number,
): boolean {
  const now = Date.parse(nowIso);
  const lastSeen = Date.parse(participant.lastSeenAt);
  if (!Number.isFinite(now) || !Number.isFinite(lastSeen)) return false;
  return now - lastSeen > staleMs;
}

function maxIso(a: string, b: string): string {
  return a >= b ? a : b;
}

function formatCookList(cooks: string[]): string {
  if (cooks.length === 0) return "Everyone";
  if (cooks.length === 1) return cooks[0]!;
  if (cooks.length === 2) return `${cooks[0]} and ${cooks[1]}`;
  return `${cooks.slice(0, -1).join(", ")}, and ${cooks.at(-1)}`;
}
