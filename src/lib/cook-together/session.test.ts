import { describe, expect, it } from "vitest";
import {
  applyCookTogetherEvent,
  createCookTogetherSession,
  deriveSharedWinState,
  listActiveParticipants,
  summarizePresence,
} from "./session";

const T0 = "2026-07-08T03:00:00.000Z";
const T1 = "2026-07-08T03:01:00.000Z";
const T2 = "2026-07-08T03:02:00.000Z";
const T3 = "2026-07-08T03:03:00.000Z";
const T4 = "2026-07-08T03:04:00.000Z";

function makeSession() {
  return createCookTogetherSession({
    sessionId: "cook-together-butter-chicken",
    recipeSlug: "butter-chicken",
    hostId: "alex",
    hostName: "Alex",
    at: T0,
  });
}

describe("Cook Together session core", () => {
  it("creates a host presence record without external services", () => {
    const session = makeSession();

    expect(session.schemaVersion).toBe(1);
    expect(session.recipeSlug).toBe("butter-chicken");
    expect(session.participants.alex).toMatchObject({
      displayName: "Alex",
      stepIndex: 0,
      status: "present",
    });
  });

  it("lets two simulated cooks finish into a shared win state", () => {
    let session = makeSession();
    session = applyCookTogetherEvent(session, {
      type: "participant-joined",
      participantId: "jamie",
      displayName: "Jamie",
      at: T1,
    });
    session = applyCookTogetherEvent(session, {
      type: "step-changed",
      participantId: "alex",
      stepIndex: 4,
      at: T2,
    });
    session = applyCookTogetherEvent(session, {
      type: "step-changed",
      participantId: "jamie",
      stepIndex: 3,
      at: T2,
    });

    expect(deriveSharedWinState(session, { nowIso: T2 })).toEqual({
      status: "waiting",
      activeCount: 2,
      completedCount: 0,
      requiredCount: 2,
      waitingOn: ["Alex", "Jamie"],
    });

    session = applyCookTogetherEvent(session, {
      type: "participant-completed",
      participantId: "alex",
      at: T3,
    });
    expect(deriveSharedWinState(session, { nowIso: T3 })).toMatchObject({
      status: "waiting",
      activeCount: 2,
      completedCount: 1,
      waitingOn: ["Jamie"],
    });

    session = applyCookTogetherEvent(session, {
      type: "participant-completed",
      participantId: "jamie",
      at: T4,
    });

    expect(deriveSharedWinState(session, { nowIso: T4 })).toEqual({
      status: "ready",
      activeCount: 2,
      completedCount: 2,
      completedAt: T4,
      cooks: ["Alex", "Jamie"],
      headline: "Alex and Jamie finished together",
    });
  });

  it("keeps presence deterministic by excluding stale and left participants", () => {
    let session = makeSession();
    session = applyCookTogetherEvent(session, {
      type: "participant-joined",
      participantId: "jamie",
      displayName: "Jamie",
      at: T1,
    });
    session = applyCookTogetherEvent(session, {
      type: "participant-joined",
      participantId: "casey",
      displayName: "Casey",
      at: T1,
    });
    session = applyCookTogetherEvent(session, {
      type: "participant-left",
      participantId: "casey",
      at: T2,
    });
    session = applyCookTogetherEvent(session, {
      type: "heartbeat",
      participantId: "alex",
      at: T3,
    });

    const nowIso = "2026-07-08T03:04:00.000Z";
    expect(
      listActiveParticipants(session, { nowIso, staleMs: 90_000 }).map(
        (participant) => participant.id,
      ),
    ).toEqual(["alex"]);
    expect(summarizePresence(session, { nowIso, staleMs: 90_000 })).toEqual({
      totalCount: 3,
      activeCount: 1,
      completedActiveCount: 0,
      waitingActiveCount: 1,
      activeParticipantIds: ["alex"],
      staleParticipantIds: ["jamie"],
    });
  });

  it("ignores out-of-order unknown participant updates", () => {
    const session = makeSession();
    const next = applyCookTogetherEvent(session, {
      type: "step-changed",
      participantId: "ghost",
      stepIndex: 8,
      at: T1,
    });

    expect(next).toBe(session);
  });
});
