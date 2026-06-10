"use client";

import { useState } from "react";
import { Search, Mic, Plus } from "lucide-react";
import {
  matchDishesByText,
  matchMultipleByText,
} from "@/lib/nutrition/match-dish-by-text";
import { diaryLogCook } from "@/lib/hooks/use-nutrition-diary";
import { haptic } from "@/lib/motion/haptics";

/** Minimal shape of the browser SpeechRecognition we use (avoids `any`). */
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: (e: {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
  }) => void;
  start: () => void;
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * TextQuickLog (W29) — log a meal by typing (or dictating) its name. Offline
 * fuzzy match against the catalogue (prefix + one-typo tolerant, stage 6);
 * results carry a kcal preview so the user picks confidently. Voice is offered
 * only where the browser supports it. No AI key required. `date` (default
 * today) lets the day pager back-fill a past day (stage 5).
 */
export function TextQuickLog({ date }: { date?: Date }) {
  const [q, setQ] = useState("");
  const matches = matchDishesByText(q);
  const multi = matchMultipleByText(q);
  const SR = getSpeechRecognition();

  const startVoice = () => {
    if (!SR) return;
    try {
      const rec = new SR();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.onresult = (e) => {
        const t = e.results?.[0]?.[0]?.transcript;
        if (t) setQ(t);
      };
      rec.start();
    } catch {
      // mic permission denied / unavailable — silent
    }
  };

  return (
    <section>
      <p className="sous-label mb-1.5">Log by name</p>
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200/80 bg-white px-3 py-2">
        <Search size={15} className="shrink-0 text-[var(--nourish-subtext)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type a dish you ate…"
          aria-label="Log a dish by name"
          className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--nourish-dark)] outline-none placeholder:text-[var(--nourish-subtext-faint)]"
        />
        {SR && (
          <button
            type="button"
            onClick={startVoice}
            aria-label="Dictate a dish"
            className="shrink-0 text-[var(--nourish-subtext)] hover:text-[var(--nourish-green)]"
          >
            <Mic size={15} />
          </button>
        )}
      </div>
      {/* #2 — "dal and rice" logs both in one tap. */}
      {multi.length >= 2 && (
        <button
          type="button"
          onClick={() => {
            haptic("commit");
            for (const m of multi) diaryLogCook(m.id, m.name, 1, { date });
            setQ("");
          }}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--nourish-green)] px-3.5 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[var(--nourish-dark-green)] active:scale-[0.97]"
        >
          <Plus size={12} />
          Log all {multi.length}: {multi.map((m) => m.name).join(" + ")}
        </button>
      )}
      {matches.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {matches.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                haptic("commit");
                diaryLogCook(m.id, m.name, 1, { date });
                setQ("");
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/50 hover:bg-[var(--nourish-green)]/5"
            >
              <Plus size={12} className="text-[var(--nourish-green)]" />
              {m.name}
              {m.kcal !== null && (
                <span className="text-[var(--nourish-subtext-faint)]">
                  {m.kcal} kcal
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
