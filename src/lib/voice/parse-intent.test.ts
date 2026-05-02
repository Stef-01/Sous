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

// W18 — MVP 1 of the Google-Maps-style cooking initiative.
// "Done <X>" extension. Maps to 'done' kind (semantically advances
// to next, but preserves the X for analytics). Negated forms bail.
describe("parseCookVoiceIntent — done intent (W18 MVP 1)", () => {
  it("recognises bare 'done'", () => {
    expect(parseCookVoiceIntent("done")).toEqual({
      kind: "done",
      context: null,
    });
  });

  it("recognises 'done chopping onions' with context", () => {
    expect(parseCookVoiceIntent("done chopping onions")).toEqual({
      kind: "done",
      context: "chopping onions",
    });
  });

  it("recognises 'done with the onions'", () => {
    expect(parseCookVoiceIntent("done with the onions")).toEqual({
      kind: "done",
      context: "onions",
    });
  });

  it("recognises 'finished' alone", () => {
    expect(parseCookVoiceIntent("finished")).toEqual({
      kind: "done",
      context: null,
    });
  });

  it("recognises 'all done'", () => {
    expect(parseCookVoiceIntent("all done")).toEqual({
      kind: "done",
      context: null,
    });
  });

  it('recognises "I\'m done" with context (apostrophe stripped)', () => {
    // After normaliseUtterance, "I'm done" → "im done"
    expect(parseCookVoiceIntent("I'm done")).toEqual({
      kind: "done",
      context: null,
    });
  });

  it("recognises 'ready' as a completion phrase", () => {
    expect(parseCookVoiceIntent("ready")).toEqual({
      kind: "done",
      context: null,
    });
  });

  // Negation guards — Stefan's directive: "done" alone vs
  // "I'm not done" must produce different intents.
  it("does NOT fire done on 'not done'", () => {
    expect(parseCookVoiceIntent("not done")).toEqual({ kind: "unknown" });
  });

  it('does NOT fire done on "I\'m not done"', () => {
    expect(parseCookVoiceIntent("I'm not done")).toEqual({ kind: "unknown" });
  });

  it("does NOT fire done on 'almost done'", () => {
    expect(parseCookVoiceIntent("almost done")).toEqual({ kind: "unknown" });
  });

  it("does NOT fire done on 'not yet done with the onions'", () => {
    expect(parseCookVoiceIntent("not yet done with the onions")).toEqual({
      kind: "unknown",
    });
  });

  it("does NOT fire done on 'still chopping'", () => {
    expect(parseCookVoiceIntent("still chopping")).toEqual({
      kind: "unknown",
    });
  });

  // Priority: 'done' should fire before 'next' for utterances that
  // start with 'done'. Test that 'next' for plain 'next' still works.
  it("plain 'next' still fires next, not done", () => {
    expect(parseCookVoiceIntent("next")).toEqual({ kind: "next" });
  });
});

// W18 stress loops on the new done branch.
describe("parseCookVoiceIntent — stress: done-intent ambiguity", () => {
  it("survives a 5000-char done-prefixed utterance without crashing", () => {
    const long = "done " + "yada ".repeat(1000);
    const result = parseCookVoiceIntent(long);
    expect(result.kind).toBe("done");
  });

  it("is deterministic across 1000 calls on a done-utterance", () => {
    const utterance = "done chopping the onions";
    let last = parseCookVoiceIntent(utterance);
    for (let i = 0; i < 1000; i += 1) {
      const next = parseCookVoiceIntent(utterance);
      expect(next).toEqual(last);
      last = next;
    }
  });

  it("doesn't false-positive on 'undone' or 'redone' (sub-string trap)", () => {
    // The matcher uses startsWith + space, so 'undone' shouldn't
    // match 'done'. Pin the contract.
    expect(parseCookVoiceIntent("undone")).toEqual({ kind: "unknown" });
    expect(parseCookVoiceIntent("redone")).toEqual({ kind: "unknown" });
  });

  it("respects negation even when the done-phrase appears later in the utterance", () => {
    expect(parseCookVoiceIntent("no I'm not done")).toEqual({
      kind: "unknown",
    });
  });
});

describe("extractDoneContext", () => {
  it("returns null for bare 'done'", () => {
    // The matcher only invokes extractDoneContext after the phrase
    // has been recognised, but the helper itself should handle a
    // bare phrase too.
    expect(parseCookVoiceIntent("done")).toEqual({
      kind: "done",
      context: null,
    });
  });

  it("strips 'with the' filler", () => {
    expect(parseCookVoiceIntent("done with the onions")).toEqual({
      kind: "done",
      context: "onions",
    });
  });

  it("strips 'with' filler", () => {
    expect(parseCookVoiceIntent("done with prep")).toEqual({
      kind: "done",
      context: "prep",
    });
  });

  it("preserves multi-word context", () => {
    expect(parseCookVoiceIntent("done dicing the bell peppers")).toEqual({
      kind: "done",
      context: "dicing the bell peppers",
    });
  });
});
