import { describe, expect, it } from "vitest";
import {
  REFLECTION_NOTE_PREFIX,
  REFLECTION_QUESTIONS,
  alreadyReflectedThisWeek,
  formatReflectionNote,
  isLastCookDayOfWeek,
  shouldShowReflectionPrompt,
} from "./reflection-prompt";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import type { RhythmPattern } from "@/lib/engine/rhythm-pattern";

const DAY_MS = 24 * 60 * 60 * 1000;

function fixtureSession(
  over: Partial<CookSessionRecord> = {},
): CookSessionRecord {
  return {
    sessionId: "cs-x",
    recipeSlug: "x",
    dishName: "X",
    cuisineFamily: "italian",
    startedAt: "2026-05-01T18:00:00Z",
    completedAt: "2026-05-01T19:00:00Z",
    favorite: false,
    ...over,
  };
}

function fixtureRhythm(over: Partial<RhythmPattern> = {}): RhythmPattern {
  return {
    typicalDays: [2, 6], // Tue + Sat
    typicalHour: 18,
    confidence: 0.7,
    streakHistory: Array.from({ length: 28 }, (_, day) => ({
      day,
      cooked: false,
    })),
    ...over,
  };
}

// ── REFLECTION_QUESTIONS ──────────────────────────────────

describe("REFLECTION_QUESTIONS", () => {
  it("exposes exactly 2 questions", () => {
    expect(REFLECTION_QUESTIONS.length).toBe(2);
  });

  it("first question asks about a favourite cook", () => {
    expect(REFLECTION_QUESTIONS[0]?.toLowerCase()).toContain("favourite");
  });

  it("second question asks what made it work", () => {
    expect(REFLECTION_QUESTIONS[1]?.toLowerCase()).toContain("work");
  });
});

// ── formatReflectionNote ──────────────────────────────────

describe("formatReflectionNote", () => {
  it("composes a marker-prefixed note with both answers", () => {
    const out = formatReflectionNote({
      favourite: "the carbonara",
      whatWorked: "the timing was right",
    });
    expect(out).toContain(REFLECTION_NOTE_PREFIX);
    expect(out).toContain("carbonara");
    expect(out).toContain("timing");
  });

  it("trims answer whitespace", () => {
    const out = formatReflectionNote({
      favourite: "  carbonara  ",
      whatWorked: "  timing  ",
    });
    expect(out).toContain("fav: carbonara");
    expect(out).toContain("worked: timing");
  });

  it("both answers empty → empty string (no orphan marker)", () => {
    expect(formatReflectionNote({ favourite: "", whatWorked: "" })).toBe("");
    expect(formatReflectionNote({ favourite: "  ", whatWorked: "  " })).toBe(
      "",
    );
  });

  it("note begins with the marker prefix when populated", () => {
    const out = formatReflectionNote({
      favourite: "x",
      whatWorked: "y",
    });
    expect(out.startsWith(REFLECTION_NOTE_PREFIX)).toBe(true);
  });
});

// ── alreadyReflectedThisWeek ──────────────────────────────

describe("alreadyReflectedThisWeek", () => {
  const now = new Date("2026-05-15T20:00:00");

  it("no sessions → false", () => {
    expect(alreadyReflectedThisWeek([], now)).toBe(false);
  });

  it("session with reflection note within 7d → true", () => {
    const session = fixtureSession({
      completedAt: new Date(now.getTime() - 3 * DAY_MS).toISOString(),
      note: `${REFLECTION_NOTE_PREFIX} fav: pizza\nworked: kids loved it`,
    });
    expect(alreadyReflectedThisWeek([session], now)).toBe(true);
  });

  it("session with reflection note older than 7d → false", () => {
    const session = fixtureSession({
      completedAt: new Date(now.getTime() - 10 * DAY_MS).toISOString(),
      note: `${REFLECTION_NOTE_PREFIX} fav: pizza`,
    });
    expect(alreadyReflectedThisWeek([session], now)).toBe(false);
  });

  it("session with non-reflection note → false (de-dup is marker-scoped)", () => {
    const session = fixtureSession({
      completedAt: new Date(now.getTime() - 1 * DAY_MS).toISOString(),
      note: "kids loved it but I forgot the salt",
    });
    expect(alreadyReflectedThisWeek([session], now)).toBe(false);
  });

  it("session with no note → false", () => {
    const session = fixtureSession({
      completedAt: new Date(now.getTime() - 1 * DAY_MS).toISOString(),
    });
    expect(alreadyReflectedThisWeek([session], now)).toBe(false);
  });
});

// ── isLastCookDayOfWeek ───────────────────────────────────

describe("isLastCookDayOfWeek", () => {
  it("today is the only typical day → true", () => {
    const tuesday = new Date("2026-05-12T18:00:00"); // Tuesday
    expect(
      isLastCookDayOfWeek(fixtureRhythm({ typicalDays: [2] }), tuesday),
    ).toBe(true);
  });

  it("today is the LAST typical day in a multi-day pattern → true", () => {
    const saturday = new Date("2026-05-16T18:00:00"); // Saturday
    expect(
      isLastCookDayOfWeek(fixtureRhythm({ typicalDays: [2, 6] }), saturday),
    ).toBe(true);
  });

  it("today is an EARLY typical day in a multi-day pattern → false", () => {
    const tuesday = new Date("2026-05-12T18:00:00"); // Tuesday
    expect(
      isLastCookDayOfWeek(fixtureRhythm({ typicalDays: [2, 6] }), tuesday),
    ).toBe(false);
  });

  it("today is NOT a typical day → false", () => {
    const wednesday = new Date("2026-05-13T18:00:00"); // Wednesday
    expect(
      isLastCookDayOfWeek(fixtureRhythm({ typicalDays: [2, 6] }), wednesday),
    ).toBe(false);
  });

  it("low confidence (< 0.5) → false (don't fabricate from sparse data)", () => {
    const tuesday = new Date("2026-05-12T18:00:00");
    expect(
      isLastCookDayOfWeek(
        fixtureRhythm({ typicalDays: [2], confidence: 0.4 }),
        tuesday,
      ),
    ).toBe(false);
  });

  it("empty typicalDays → false", () => {
    expect(
      isLastCookDayOfWeek(fixtureRhythm({ typicalDays: [] }), new Date()),
    ).toBe(false);
  });
});

// ── shouldShowReflectionPrompt ────────────────────────────

describe("shouldShowReflectionPrompt — gating matrix", () => {
  const saturday = new Date("2026-05-16T19:00:00"); // Saturday
  const rhythm = fixtureRhythm({ typicalDays: [2, 6] });

  it("last cook day + no prior reflection → true", () => {
    expect(
      shouldShowReflectionPrompt({ rhythm, sessions: [], now: saturday }),
    ).toBe(true);
  });

  it("last cook day + prior reflection within 7d → false (de-duped)", () => {
    const session = fixtureSession({
      completedAt: new Date(saturday.getTime() - 2 * DAY_MS).toISOString(),
      note: `${REFLECTION_NOTE_PREFIX} fav: pasta`,
    });
    expect(
      shouldShowReflectionPrompt({
        rhythm,
        sessions: [session],
        now: saturday,
      }),
    ).toBe(false);
  });

  it("last cook day + reflection 8d ago → true (outside week window)", () => {
    const session = fixtureSession({
      completedAt: new Date(saturday.getTime() - 8 * DAY_MS).toISOString(),
      note: `${REFLECTION_NOTE_PREFIX} fav: pasta`,
    });
    expect(
      shouldShowReflectionPrompt({
        rhythm,
        sessions: [session],
        now: saturday,
      }),
    ).toBe(true);
  });

  it("non-last-cook-day → false even with no prior reflection", () => {
    const tuesday = new Date("2026-05-12T19:00:00");
    expect(
      shouldShowReflectionPrompt({
        rhythm,
        sessions: [],
        now: tuesday,
      }),
    ).toBe(false);
  });

  it("low rhythm confidence → false", () => {
    expect(
      shouldShowReflectionPrompt({
        rhythm: fixtureRhythm({
          typicalDays: [6],
          confidence: 0.3,
        }),
        sessions: [],
        now: saturday,
      }),
    ).toBe(false);
  });
});
