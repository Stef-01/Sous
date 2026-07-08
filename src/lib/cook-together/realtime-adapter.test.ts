import { describe, expect, it } from "vitest";
import {
  createCookTogetherRealtimeAdapter,
  createLocalCookTogetherAdapter,
  selectCookTogetherRealtimeMode,
} from "./realtime-adapter";
import { deriveSharedWinState } from "./session";

const T0 = "2026-07-08T03:00:00.000Z";
const T1 = "2026-07-08T03:01:00.000Z";
const T2 = "2026-07-08T03:02:00.000Z";

describe("Cook Together realtime adapter", () => {
  it("stays local by default and exposes a Supabase-ready stub only when configured", () => {
    expect(selectCookTogetherRealtimeMode({})).toBe("local");
    expect(
      selectCookTogetherRealtimeMode({
        NEXT_PUBLIC_SOUS_REALTIME_ENABLED: "true",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toBe("local");
    expect(
      selectCookTogetherRealtimeMode({
        NEXT_PUBLIC_SOUS_REALTIME_ENABLED: "true",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      }),
    ).toBe("supabase-stub");

    expect(
      createCookTogetherRealtimeAdapter({
        env: {
          NEXT_PUBLIC_SOUS_REALTIME_ENABLED: "true",
          NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
        },
      }).mode,
    ).toBe("supabase-stub");
  });

  it("broadcasts local session changes and converges two cooks on shared win", () => {
    const adapter = createLocalCookTogetherAdapter();
    const seen: string[] = [];
    const unsubscribe = adapter.subscribe("s1", (session) => {
      seen.push(
        Object.values(session.participants)
          .map((participant) => `${participant.id}:${participant.status}`)
          .sort()
          .join("|"),
      );
    });

    adapter.createOrJoin({
      sessionId: "s1",
      recipeSlug: "butter-chicken",
      participantId: "alex",
      displayName: "Alex",
      at: T0,
    });
    adapter.createOrJoin({
      sessionId: "s1",
      recipeSlug: "butter-chicken",
      participantId: "jamie",
      displayName: "Jamie",
      at: T0,
    });
    adapter.publish("s1", {
      type: "participant-completed",
      participantId: "alex",
      at: T1,
    });
    const final = adapter.publish("s1", {
      type: "participant-completed",
      participantId: "jamie",
      at: T2,
    });

    expect(final).not.toBeNull();
    expect(deriveSharedWinState(final!, { nowIso: T2 })).toMatchObject({
      status: "ready",
      cooks: ["Alex", "Jamie"],
    });
    expect(seen).toContain("alex:done|jamie:done");

    unsubscribe();
    adapter.publish("s1", {
      type: "heartbeat",
      participantId: "alex",
      at: "2026-07-08T03:03:00.000Z",
    });
    expect(seen.at(-1)).toBe("alex:done|jamie:done");
  });

  it("returns null for publishes before a session exists", () => {
    const adapter = createLocalCookTogetherAdapter();

    expect(
      adapter.publish("missing", {
        type: "heartbeat",
        participantId: "alex",
        at: T0,
      }),
    ).toBeNull();
  });
});
