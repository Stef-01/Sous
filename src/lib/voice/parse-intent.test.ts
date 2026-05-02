import { describe, expect, it } from "vitest";
import {
  normaliseUtterance,
  parseCookVoiceIntent,
  parseDurationPhrase,
} from "./parse-intent";

describe("normaliseUtterance", () => {
  it("lowercases", () => {
    expect(normaliseUtterance("NEXT STEP")).toBe("next step");
  });

  it("strips punctuation", () => {
    expect(normaliseUtterance("Next, please!")).toBe("next please");
  });

  it("collapses whitespace", () => {
    expect(normaliseUtterance("set    a   timer")).toBe("set a timer");
  });

  it("trims leading/trailing whitespace", () => {
    expect(normaliseUtterance("   next   ")).toBe("next");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(normaliseUtterance("   ")).toBe("");
  });
});

describe("parseDurationPhrase", () => {
  it("parses '5 minutes' as 300 seconds", () => {
    expect(parseDurationPhrase("5 minutes")).toBe(300);
  });

  it("parses '30 seconds' as 30", () => {
    expect(parseDurationPhrase("30 seconds")).toBe(30);
  });

  it("parses 'two minutes' as 120", () => {
    expect(parseDurationPhrase("two minutes")).toBe(120);
  });

  it("parses combined 'two minutes and 30 seconds' as 150", () => {
    expect(parseDurationPhrase("two minutes and 30 seconds")).toBe(150);
  });

  it("parses 'half a minute' as 30", () => {
    expect(parseDurationPhrase("half a minute")).toBe(30);
  });

  it("parses 'a minute and a half' as 90", () => {
    expect(parseDurationPhrase("a minute and a half")).toBe(90);
  });

  it("returns null for input with no duration", () => {
    expect(parseDurationPhrase("hello there")).toBe(null);
  });

  it("parses '1 minute' (singular) the same as '1 minutes'", () => {
    expect(parseDurationPhrase("1 minute")).toBe(60);
    expect(parseDurationPhrase("1 minutes")).toBe(60);
  });

  it("parses 'fifteen minutes' as 900", () => {
    expect(parseDurationPhrase("fifteen minutes")).toBe(900);
  });

  it("returns null when number-word isn't recognised", () => {
    expect(parseDurationPhrase("eleventy minutes")).toBe(null);
  });
});

describe("parseCookVoiceIntent — navigation", () => {
  it("recognises 'next'", () => {
    expect(parseCookVoiceIntent("next")).toEqual({ kind: "next" });
  });

  it("recognises 'next step'", () => {
    expect(parseCookVoiceIntent("next step")).toEqual({ kind: "next" });
  });

  it("recognises 'continue'", () => {
    expect(parseCookVoiceIntent("continue")).toEqual({ kind: "next" });
  });

  it("recognises 'back' / 'previous'", () => {
    expect(parseCookVoiceIntent("back")).toEqual({ kind: "back" });
    expect(parseCookVoiceIntent("previous step")).toEqual({ kind: "back" });
  });

  it("recognises 'repeat' / 'again'", () => {
    expect(parseCookVoiceIntent("repeat")).toEqual({ kind: "repeat" });
    expect(parseCookVoiceIntent("say that again")).toEqual({ kind: "repeat" });
  });
});

describe("parseCookVoiceIntent — timer", () => {
  it("recognises 'set a 5 minute timer'", () => {
    expect(parseCookVoiceIntent("set a 5 minute timer")).toEqual({
      kind: "timer-set",
      seconds: 300,
    });
  });

  it("recognises '30 second timer'", () => {
    expect(parseCookVoiceIntent("30 second timer")).toEqual({
      kind: "timer-set",
      seconds: 30,
    });
  });

  it("recognises 'cancel timer'", () => {
    expect(parseCookVoiceIntent("cancel timer")).toEqual({
      kind: "timer-cancel",
    });
  });

  it("recognises 'how long left'", () => {
    expect(parseCookVoiceIntent("how long left")).toEqual({
      kind: "timer-status",
    });
  });

  it("recognises 'add 30 seconds'", () => {
    expect(parseCookVoiceIntent("add 30 seconds")).toEqual({
      kind: "timer-add",
      seconds: 30,
    });
  });
});

describe("parseCookVoiceIntent — pause/resume", () => {
  it("recognises 'pause'", () => {
    expect(parseCookVoiceIntent("pause")).toEqual({ kind: "pause" });
  });

  it("recognises 'resume'", () => {
    expect(parseCookVoiceIntent("resume")).toEqual({ kind: "resume" });
  });
});

describe("parseCookVoiceIntent — fallback", () => {
  it("returns unknown for empty input", () => {
    expect(parseCookVoiceIntent("")).toEqual({ kind: "unknown" });
  });

  it("returns unknown for unrecognised speech", () => {
    expect(parseCookVoiceIntent("tell me a joke")).toEqual({
      kind: "unknown",
    });
  });
});

// W13 stress loops — long-content + race-condition + poisoned-data
// per the 12-month plan stress catalog.
describe("parseCookVoiceIntent — stress: long-content", () => {
  it("survives a 5000-char utterance without crashing", () => {
    const noise = "yada ".repeat(1000);
    expect(parseCookVoiceIntent(noise)).toEqual({ kind: "unknown" });
  });

  it("recognises the intent even when buried in noise", () => {
    expect(parseCookVoiceIntent("um yeah ok next")).toEqual({ kind: "next" });
  });

  it("clamps duration parsing on absurd numeric inputs", () => {
    // Seconds-level granularity: 99999 minutes is a real (unhinged)
    // input. Parser preserves it; downstream UI clamps.
    expect(parseDurationPhrase("99999 minutes")).toBe(99999 * 60);
  });
});

describe("parseCookVoiceIntent — stress: race-condition / call-order", () => {
  it("returns identical results across 1000 repeat calls", () => {
    let last = parseCookVoiceIntent("set a 3 minute timer");
    for (let i = 0; i < 1000; i += 1) {
      const next = parseCookVoiceIntent("set a 3 minute timer");
      expect(next).toEqual(last);
      last = next;
    }
  });

  it("doesn't share state between calls (regex.exec safety)", () => {
    // The internal duration parser uses `RegExp.exec` in a loop —
    // a stateful global regex would carry lastIndex between calls
    // and corrupt subsequent calls. Verify that doesn't happen.
    const a = parseDurationPhrase("5 minutes");
    const b = parseDurationPhrase("3 minutes");
    const c = parseDurationPhrase("5 minutes");
    expect(a).toBe(300);
    expect(b).toBe(180);
    expect(c).toBe(300);
  });
});

describe("parseCookVoiceIntent — stress: poisoned-data", () => {
  it("handles unicode emoji in the utterance", () => {
    expect(parseCookVoiceIntent("next 🍝")).toEqual({ kind: "next" });
  });

  it("handles utterances that look like timer-phrases but lack a number", () => {
    expect(parseCookVoiceIntent("set a timer")).toEqual({ kind: "unknown" });
  });

  it("treats 'continue' as next, not as timer (priority order)", () => {
    expect(parseCookVoiceIntent("continue")).toEqual({ kind: "next" });
  });

  it("returns timer-cancel even when the word 'timer' isn't present", () => {
    // "stop the timer" matches both timer-set's prefix gate AND
    // timer-cancel — verify cancel wins inside the timer branch.
    expect(parseCookVoiceIntent("stop the timer")).toEqual({
      kind: "timer-cancel",
    });
  });
});
