import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import {
  ROOM_MANIFEST,
  STAT_LABELS,
  type ObjectSlot,
  type StatKey,
} from "./room-manifest";
import {
  readRoomBinding,
  parseRoomPayload,
  resolveCoverage,
  pctWord,
  fmtDetail,
} from "./room-binding";
import type { DogeHealthPayload } from "./doge-health-store";

const slot = (id: string): ObjectSlot => {
  const s = ROOM_MANIFEST.objects.find((o) => o.id === id);
  if (!s) throw new Error(`no slot ${id}`);
  return s;
};

const METRIC_KEYS: StatKey[] = [
  "energy",
  "mood",
  "hydration",
  "protein",
  "fiber",
  "vitamins",
];

const PAYLOAD: DogeHealthPayload = {
  stats: [
    {
      label: "Energy",
      pct: 27,
      fa: "bolt",
      detail: { value: 540, target: 2000, unit: "kcal" },
    },
    { label: "Mood", pct: 20, fa: "heart" },
    {
      label: "Hydration",
      pct: 75,
      fa: "droplet",
      detail: { value: 6, target: 8, unit: "glass" },
    },
    {
      label: "Protein",
      pct: 60,
      fa: "drumstick-bite",
      detail: { value: 30, target: 50, unit: "g" },
    },
    {
      label: "Fiber",
      pct: 14,
      fa: "leaf",
      detail: { value: 4, target: 28, unit: "g" },
    },
    { label: "Vitamins", pct: 22, fa: "shield-halved" },
  ],
  status: "Dobe's peckish",
  meals: ["Pho", "Caesar Salad"],
  updatedAt: 123,
};

describe("ROOM_MANIFEST shape", () => {
  it("has exactly the 6 metric slots, statKeys correct + label-matched", () => {
    const metricSlots = ROOM_MANIFEST.objects.filter((o) => o.bind.statKey);
    expect(metricSlots).toHaveLength(6);
    expect(new Set(metricSlots.map((o) => o.bind.statKey))).toEqual(
      new Set(METRIC_KEYS),
    );
    for (const o of metricSlots) {
      // label MUST equal the payload stat label (the bind key).
      expect(o.label).toBe(STAT_LABELS[o.bind.statKey as StatKey]);
    }
  });

  it("has 2 feed companions that bind to no metric", () => {
    const feed = ROOM_MANIFEST.objects.filter((o) => o.bind.feed);
    expect(feed).toHaveLength(2);
    for (const o of feed) expect(o.bind.statKey).toBeUndefined();
  });

  it("every object sits inside the 96x96 world with a positive hitbox", () => {
    for (const o of ROOM_MANIFEST.objects) {
      expect(o.anchor.x).toBeGreaterThanOrEqual(0);
      expect(o.anchor.y).toBeGreaterThanOrEqual(0);
      expect(o.anchor.x + o.size.w).toBeLessThanOrEqual(96);
      expect(o.anchor.y + o.size.h).toBeLessThanOrEqual(96);
      const hx = o.size.w - (o.hitbox?.shrinkX ?? 0) * 2;
      const hy = o.size.h - (o.hitbox?.shrinkY ?? 0) * 2;
      expect(hx).toBeGreaterThan(0);
      expect(hy).toBeGreaterThan(0);
    }
  });

  it("only hydration carries the water action; it reuses doge:logWater (no write)", () => {
    const withAction = ROOM_MANIFEST.objects.filter((o) => o.bind.action);
    expect(withAction.map((o) => o.id)).toEqual(["hydration"]);
    expect(withAction[0].bind.action).toBe("water");
  });
});

describe("rule-7 guard: number-less metrics never fabricate a value", () => {
  it("mood + vitamins have NO detailUnit but DO have coverageCopy", () => {
    for (const id of ["mood", "vitamins"]) {
      const s = slot(id);
      expect(s.bind.detailUnit).toBeUndefined();
      expect(s.bind.coverageCopy && s.bind.coverageCopy.length).toBeGreaterThan(
        0,
      );
    }
  });

  it("no coverageCopy hard-codes a percentage — any number is a {pct} token", () => {
    for (const o of ROOM_MANIFEST.objects) {
      if (!o.bind.coverageCopy) continue;
      // A literal "NN%" is forbidden; "{pct}%" is fine (no digit before the %).
      expect(o.bind.coverageCopy).not.toMatch(/\d+\s*%/);
    }
  });

  it("detail metrics (energy/protein/fiber/hydration) DO declare a unit", () => {
    for (const id of ["energy", "protein", "fiber", "hydration"]) {
      expect(slot(id).bind.detailUnit).toBeTruthy();
    }
  });
});

describe("readRoomBinding", () => {
  it("detail metrics resolve exact value/target via fmtDetail", () => {
    expect(readRoomBinding(PAYLOAD, slot("hydration"))).toMatchObject({
      state: "ok",
      pct: 75,
      word: "On track",
      detailText: "6 / 8 glasses",
    });
    expect(readRoomBinding(PAYLOAD, slot("protein")).detailText).toBe(
      "30g / 50g",
    );
    expect(readRoomBinding(PAYLOAD, slot("energy")).detailText).toBe(
      "540 / 2000 kcal",
    );
  });

  it("coverage metrics resolve {pct} live and NEVER produce a value/target", () => {
    const vit = readRoomBinding(PAYLOAD, slot("vitamins"));
    expect(vit.coverageText).toBe("Avg daily value 22%");
    expect(vit.detailText).toBeUndefined();
    const mood = readRoomBinding(PAYLOAD, slot("mood"));
    expect(mood.coverageText).toBe("How Dobe's feeling today");
    expect(mood.detailText).toBeUndefined();
  });

  it("feed companions return the meals list", () => {
    const bag = readRoomBinding(PAYLOAD, slot("protein-bag"));
    expect(bag.state).toBe("ok");
    expect(bag.meals).toEqual(["Pho", "Caesar Salad"]);
    expect(readRoomBinding(PAYLOAD, slot("feed-log")).meals).toEqual([
      "Pho",
      "Caesar Salad",
    ]);
  });

  it("empty (pct 0) and feed-with-no-meals resolve to the empty state", () => {
    const empty: DogeHealthPayload = {
      ...PAYLOAD,
      stats: PAYLOAD.stats.map((s) => ({ ...s, pct: 0, detail: undefined })),
      meals: [],
    };
    expect(readRoomBinding(empty, slot("protein")).state).toBe("empty");
    expect(readRoomBinding(empty, slot("feed-log")).state).toBe("empty");
  });

  it("never throws — null / undefined / missing-stat payloads return error", () => {
    expect(readRoomBinding(null, slot("protein")).state).toBe("error");
    expect(readRoomBinding(undefined, slot("protein")).state).toBe("error");
    const noStats = { stats: [], status: "", meals: [], updatedAt: 0 };
    expect(readRoomBinding(noStats, slot("protein")).state).toBe("error");
  });

  it("mood/vitamins produce no value/target in ANY state (rule-7, all states)", () => {
    const states: (DogeHealthPayload | null)[] = [
      PAYLOAD,
      { ...PAYLOAD, stats: PAYLOAD.stats.map((s) => ({ ...s, pct: 0 })) },
      null,
    ];
    for (const p of states) {
      for (const id of ["mood", "vitamins"]) {
        expect(readRoomBinding(p, slot(id)).detailText).toBeUndefined();
      }
    }
  });
});

describe("parseRoomPayload never throws", () => {
  it("returns null on null/garbage and the payload on valid JSON", () => {
    expect(parseRoomPayload(null)).toBeNull();
    expect(parseRoomPayload("")).toBeNull();
    expect(parseRoomPayload("{not json")).toBeNull(); // the corrupt-value guard
    expect(parseRoomPayload("42")).toBeNull(); // valid JSON, wrong shape
    const ok = parseRoomPayload(JSON.stringify(PAYLOAD));
    expect(ok?.stats).toHaveLength(6);
  });
});

describe("pure helpers mirror the receiver", () => {
  it("pctWord bands", () => {
    expect([0, 30, 55, 80].map(pctWord)).toEqual([
      "Low",
      "Getting there",
      "On track",
      "Great",
    ]);
  });
  it("fmtDetail units + missing", () => {
    expect(fmtDetail({ value: 6, target: 8, unit: "glass" })).toBe(
      "6 / 8 glasses",
    );
    expect(fmtDetail({ value: 30, target: 50, unit: "g" })).toBe("30g / 50g");
    expect(fmtDetail(undefined)).toBeUndefined();
  });
  it("resolveCoverage only interpolates {pct}", () => {
    expect(resolveCoverage("Avg daily value {pct}%", 22.4)).toBe(
      "Avg daily value 22%",
    );
    expect(resolveCoverage("no token", 50)).toBe("no token");
  });
});

describe("TS ↔ JS manifest parity", () => {
  it("public/tamaweb/src/doge/room-manifest.js is structurally identical", () => {
    const src = readFileSync(
      join(process.cwd(), "public/tamaweb/src/doge/room-manifest.js"),
      "utf8",
    );
    const mod = { exports: {} as unknown };
     
    new Function("module", "window", src)(mod, undefined);
    expect(mod.exports).toEqual(ROOM_MANIFEST);
  });
});

describe("read-only safety invariant (CI guard)", () => {
  it("no file in the doge game layer writes stats or gold", () => {
    const dir = join(process.cwd(), "public/tamaweb/src/doge");
    const files = existsSync(dir)
      ? readdirSync(dir).filter((f) => f.endsWith(".js"))
      : [];
    expect(files.length).toBeGreaterThan(0); // room-manifest.js at least
    const forbidden = [
      /logGold/,
      /creditGold/,
      /grantGold/,
      /gold:\s*credit/,
      /setItem\(\s*["'`]sous-doge-(health|gold)/,
    ];
    for (const f of files) {
      const code = readFileSync(join(dir, f), "utf8");
      for (const re of forbidden) {
        expect(code, `${f} must stay read-only (matched ${re})`).not.toMatch(
          re,
        );
      }
    }
  });
});
