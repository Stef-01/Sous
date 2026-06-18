import { describe, expect, it } from "vitest";
import {
  appendOutcome,
  makeSuggestionId,
  outcomesToCsv,
  outcomesToNdjson,
  parseStoredOutcomes,
  PAIRING_OUTCOMES_SCHEMA_VERSION,
  type PairingOutcome,
} from "./pairing-outcomes";

function row(over: Partial<PairingOutcome> = {}): PairingOutcome {
  return {
    suggestionId: "b1:0",
    batchId: "b1",
    deviceId: "dev",
    recipeSlug: "guacamole",
    mainDishIntentHash: "h",
    cuisineFamily: "mexican",
    rank: 0,
    shownAt: "2026-06-18T00:00:00.000Z",
    totalScore: 0.8,
    dimensions: {
      cuisineFit: 0.9,
      flavorContrast: 0.7,
      nutritionBalance: 0.5,
      prepBurden: 0.6,
      temperature: 0.5,
      preference: 0.4,
    },
    outcome: "shown",
    outcomeAt: null,
    rating: null,
    favorite: false,
    feedback: null,
    schemaVersion: PAIRING_OUTCOMES_SCHEMA_VERSION,
    ...over,
  };
}

describe("makeSuggestionId", () => {
  it("joins batch + rank into the stable key", () => {
    expect(makeSuggestionId("b1", 2)).toBe("b1:2");
  });
});

describe("parseStoredOutcomes", () => {
  it("round-trips a valid corpus", () => {
    const rows = [row(), row({ suggestionId: "b1:1", rank: 1 })];
    const parsed = parseStoredOutcomes(JSON.stringify(rows));
    expect(parsed).toHaveLength(2);
    expect(parsed[1].rank).toBe(1);
  });

  it("returns [] on null / malformed JSON, never throws", () => {
    expect(parseStoredOutcomes(null)).toEqual([]);
    expect(parseStoredOutcomes("{not json")).toEqual([]);
    expect(parseStoredOutcomes('{"a":1}')).toEqual([]); // not an array
  });

  it("skips a corrupt row but keeps the good ones (partial recovery)", () => {
    const raw = JSON.stringify([
      row(),
      { suggestionId: 5, recipeSlug: "x" }, // bad: non-string id
      row({ suggestionId: "b1:1" }),
    ]);
    const parsed = parseStoredOutcomes(raw);
    expect(parsed.map((r) => r.suggestionId)).toEqual(["b1:0", "b1:1"]);
  });

  it("defaults missing dimensions to 0 rather than dropping the row", () => {
    const raw = JSON.stringify([{ ...row(), dimensions: { cuisineFit: 0.5 } }]);
    const parsed = parseStoredOutcomes(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].dimensions.cuisineFit).toBe(0.5);
    expect(parsed[0].dimensions.preference).toBe(0);
  });
});

describe("appendOutcome (ring buffer)", () => {
  it("appends and caps to max, dropping the oldest", () => {
    let list: PairingOutcome[] = [];
    for (let i = 0; i < 5; i++) {
      list = appendOutcome(list, row({ suggestionId: `b:${i}` }), 3);
    }
    expect(list).toHaveLength(3);
    expect(list.map((r) => r.suggestionId)).toEqual(["b:2", "b:3", "b:4"]);
  });
});

describe("export helpers", () => {
  it("CSV has a header + one line per row, escaping commas/quotes", () => {
    const csv = outcomesToCsv([row({ feedback: 'too "salty", really' })]);
    const [header, line] = csv.split("\n");
    expect(header.startsWith("suggestionId,batchId")).toBe(true);
    expect(line).toContain('"too ""salty"", really"');
  });

  it("NDJSON is one JSON object per line", () => {
    const nd = outcomesToNdjson([row(), row({ suggestionId: "b1:1" })]);
    const lines = nd.split("\n");
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0]).suggestionId).toBe("b1:0");
  });
});
