"use client";

import { useMemo } from "react";
import { deriveCookRhythm } from "@/lib/engine/cook-rhythm";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

interface CookRhythmLineProps {
  sessions: CookSessionRecord[];
}

/**
 * A single italic caption that describes _when_ the user usually cooks.
 * Silent below `RHYTHM_MIN_COOKS`. Intentionally one-line, no chrome, no
 * button — a note from the app, not a control surface.
 */
export function CookRhythmLine({ sessions }: CookRhythmLineProps) {
  const rhythm = useMemo(() => deriveCookRhythm(sessions), [sessions]);
  if (!rhythm) return null;
  return (
    <p className="px-1 pt-1 text-center text-[11px] italic text-[var(--nourish-subtext)]/80">
      {rhythm.sentence}
    </p>
  );
}
