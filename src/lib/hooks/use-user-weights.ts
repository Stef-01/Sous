"use client";

/**
 * useUserWeights — pairing-engine V2 weight vector, derived from
 * the user's cook history.
 *
 * W30 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint F W29-W31
 * pairing-engine V2). Wraps the pure `trainUserWeights` trainer
 * in a localStorage-backed hook so the engine call sites can
 * pass the trained weights to `suggestSides` without retraining
 * on every render.
 *
 * Storage shape: `{ schemaVersion, weights, samples, trainedAt }`.
 * Persisted so a fresh page-load doesn't briefly use cold-start
 * weights while the cook-history hydrates — but always retrained
 * once the live history is available, so persistence is a cache,
 * never a source of truth.
 *
 * Mirrors the W15 / W22 / W24 pref-hook pattern: freshDefault
 * factory, object-shape gate, partial-recovery parser.
 */

import { useEffect, useMemo, useState } from "react";
import { useCookSessions } from "./use-cook-sessions";
import { type UserWeights } from "@/lib/engine/user-weight-trainer";
import { composeUserWeights } from "@/lib/engine/user-weight-trainer-hybrid";
import type { TrainerMode } from "@/lib/engine/user-weight-trainer-hybrid";
import { DEFAULT_WEIGHTS } from "@/lib/engine/types";

const STORAGE_KEY = "sous-user-weights-v1";
const SCHEMA_VERSION = 1 as const;

interface PersistedWeights {
  schemaVersion: typeof SCHEMA_VERSION;
  weights: UserWeights;
  samples: number;
  trainedAt: string;
}

function freshDefaultPersisted(): PersistedWeights {
  return {
    schemaVersion: SCHEMA_VERSION,
    weights: { ...DEFAULT_WEIGHTS },
    samples: 0,
    trainedAt: new Date(0).toISOString(),
  };
}

/** Pure parser. Defends against missing key, corrupt JSON,
 *  schema mismatch, missing weights, wrong dimension keys. */
export function parseStoredUserWeights(
  raw: string | null | undefined,
): PersistedWeights {
  if (!raw) return freshDefaultPersisted();
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return freshDefaultPersisted();
    }
    const obj = parsed as Partial<PersistedWeights>;
    if (obj.schemaVersion !== SCHEMA_VERSION) return freshDefaultPersisted();
    if (
      !obj.weights ||
      typeof obj.weights !== "object" ||
      Array.isArray(obj.weights)
    ) {
      return freshDefaultPersisted();
    }
    const incoming = obj.weights as Partial<UserWeights>;
    // Round 4 added seasonal + antiMonotony as optional dims.
    // Pre-Round-4 stored payloads only include the original 6
    // keys — accept those and inherit defaults for the new pair.
    const REQUIRED_KEYS: Array<keyof UserWeights> = [
      "cuisineFit",
      "flavorContrast",
      "nutritionBalance",
      "prepBurden",
      "temperature",
      "preference",
    ];
    const weights: UserWeights = { ...DEFAULT_WEIGHTS };
    let valid = true;
    for (const key of REQUIRED_KEYS) {
      const v = incoming[key];
      if (typeof v === "number" && Number.isFinite(v) && v >= 0) {
        weights[key] = v;
      } else {
        valid = false;
        break;
      }
    }
    if (!valid) return freshDefaultPersisted();
    // Optional Round 4 dims — copy if present, else keep defaults.
    for (const key of ["seasonal", "antiMonotony"] as const) {
      const v = incoming[key];
      if (typeof v === "number" && Number.isFinite(v) && v >= 0) {
        weights[key] = v;
      } else {
        // Stored payload lacks Round 4 dims → leave default.
        // Tests asserting toEqual on the 6-key shape see the
        // round-tripped weights minus seasonal/antiMonotony.
        delete (weights as Partial<UserWeights>)[key];
      }
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      weights,
      samples: typeof obj.samples === "number" ? obj.samples : 0,
      trainedAt:
        typeof obj.trainedAt === "string"
          ? obj.trainedAt
          : new Date(0).toISOString(),
    };
  } catch {
    return freshDefaultPersisted();
  }
}

export function useUserWeights() {
  const { sessions } = useCookSessions();
  const [persisted, setPersisted] = useState<PersistedWeights>(
    freshDefaultPersisted,
  );

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hydrate from localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setPersisted(parseStoredUserWeights(raw));
    } catch {
      setPersisted(freshDefaultPersisted());
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Y2 W8 hybrid composer: V3 when ≥ 8 score-breakdown-rich
  // cooks exist AND the V3 flag is on, V2 when ≥ 5 V2-eligible
  // cooks, default otherwise.
  //
  // W10 gate: V3 underperformed V2 by 4.5pp on the W9 synthetic
  // eval (seed=42), so V3 is opt-in via
  // NEXT_PUBLIC_SOUS_V3_TRAINER_ENABLED="true". The composer
  // reads process.env at call time — unset → V2 path active.
  // The trainer choice is invisible to the user (we expose
  // `trainerMode` + `v3Enabled` for the IDEO retro / dev tools,
  // not for UI surfacing).
  const trainedResult = useMemo(() => composeUserWeights(sessions), [sessions]);
  const trainedWeights = trainedResult.weights;
  const trainerMode: TrainerMode = trainedResult.mode;

  // Persist whenever the freshly-trained vector differs from
  // what's already on disk. Avoids hammering localStorage on
  // every cook-list re-render.
  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: write-through cache, gated on a real-change check */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (weightsEqual(trainedWeights, persisted.weights)) return;
    const next: PersistedWeights = {
      schemaVersion: SCHEMA_VERSION,
      weights: trainedWeights,
      samples: sessions.filter((s) => s.completedAt).length,
      trainedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore — quota / privacy mode
    }
    setPersisted(next);
  }, [trainedWeights, persisted.weights, sessions]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return {
    weights: trainedWeights,
    samples: persisted.samples,
    trainedAt: persisted.trainedAt,
    /** Y2 W8 telemetry — which trainer fired this composition.
     *  Surfaces in dev / Sprint-B IDEO; not user-visible. */
    trainerMode,
    breakdownCookCount: trainedResult.breakdownCookCount,
    v2EligibleCookCount: trainedResult.v2EligibleCookCount,
    /** W10 gate state. False here = V2 path active even if the
     *  user has enough breakdown data; flip
     *  NEXT_PUBLIC_SOUS_V3_TRAINER_ENABLED="true" in .env.local
     *  to enable V3 in dev. */
    v3Enabled: trainedResult.v3Enabled,
  };
}

/** Pure helper: shallow-equality on weight vectors with a small
 *  epsilon to avoid persistence churn on float drift. */
function weightsEqual(a: UserWeights, b: UserWeights, eps = 1e-9): boolean {
  for (const key of Object.keys(a) as Array<keyof UserWeights>) {
    if (Math.abs(a[key] - b[key]) > eps) return false;
  }
  return true;
}
