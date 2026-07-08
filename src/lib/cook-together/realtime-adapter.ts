import {
  applyCookTogetherEvent,
  createCookTogetherSession,
  type CookTogetherEvent,
  type CookTogetherSession,
} from "./session";

export type CookTogetherRealtimeMode = "local" | "supabase-stub";

export interface CookTogetherRealtimeEnv {
  SOUS_REALTIME_ENABLED?: string;
  NEXT_PUBLIC_SOUS_REALTIME_ENABLED?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
}

export interface JoinCookTogetherInput {
  sessionId: string;
  recipeSlug: string;
  participantId: string;
  displayName: string;
  at: string;
}

export type CookTogetherListener = (session: CookTogetherSession) => void;

export interface CookTogetherRealtimeAdapter {
  readonly mode: CookTogetherRealtimeMode;
  createOrJoin(input: JoinCookTogetherInput): CookTogetherSession;
  publish(
    sessionId: string,
    event: CookTogetherEvent,
  ): CookTogetherSession | null;
  getSnapshot(sessionId: string): CookTogetherSession | null;
  subscribe(sessionId: string, listener: CookTogetherListener): () => void;
}

export function selectCookTogetherRealtimeMode(
  env: CookTogetherRealtimeEnv = process.env as CookTogetherRealtimeEnv,
): CookTogetherRealtimeMode {
  const requested =
    env.SOUS_REALTIME_ENABLED === "true" ||
    env.NEXT_PUBLIC_SOUS_REALTIME_ENABLED === "true";
  const hasSupabase =
    Boolean(env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return requested && hasSupabase ? "supabase-stub" : "local";
}

/**
 * W17 adapter seam. The `supabase-stub` mode deliberately still uses the local
 * bus; the live Supabase channel can replace this factory without touching the
 * deterministic session core or consumers.
 */
export function createCookTogetherRealtimeAdapter({
  env = process.env as CookTogetherRealtimeEnv,
}: {
  env?: CookTogetherRealtimeEnv;
} = {}): CookTogetherRealtimeAdapter {
  return createLocalCookTogetherAdapter({
    mode: selectCookTogetherRealtimeMode(env),
  });
}

export function createLocalCookTogetherAdapter({
  mode = "local",
  initialSessions = [],
}: {
  mode?: CookTogetherRealtimeMode;
  initialSessions?: CookTogetherSession[];
} = {}): CookTogetherRealtimeAdapter {
  const sessions = new Map<string, CookTogetherSession>(
    initialSessions.map((session) => [session.sessionId, session]),
  );
  const listeners = new Map<string, Set<CookTogetherListener>>();

  function notify(session: CookTogetherSession): void {
    const sessionListeners = listeners.get(session.sessionId);
    if (!sessionListeners) return;
    for (const listener of sessionListeners) listener(session);
  }

  return {
    mode,
    createOrJoin(input) {
      const existing = sessions.get(input.sessionId);
      const next = existing
        ? applyCookTogetherEvent(existing, {
            type: "participant-joined",
            participantId: input.participantId,
            displayName: input.displayName,
            at: input.at,
          })
        : createCookTogetherSession({
            sessionId: input.sessionId,
            recipeSlug: input.recipeSlug,
            hostId: input.participantId,
            hostName: input.displayName,
            at: input.at,
          });

      sessions.set(input.sessionId, next);
      notify(next);
      return next;
    },
    publish(sessionId, event) {
      const existing = sessions.get(sessionId);
      if (!existing) return null;
      const next = applyCookTogetherEvent(existing, event);
      if (next !== existing) {
        sessions.set(sessionId, next);
        notify(next);
      }
      return next;
    },
    getSnapshot(sessionId) {
      return sessions.get(sessionId) ?? null;
    },
    subscribe(sessionId, listener) {
      const sessionListeners = listeners.get(sessionId) ?? new Set();
      sessionListeners.add(listener);
      listeners.set(sessionId, sessionListeners);

      const current = sessions.get(sessionId);
      if (current) listener(current);

      return () => {
        sessionListeners.delete(listener);
        if (sessionListeners.size === 0) listeners.delete(sessionId);
      };
    },
  };
}
