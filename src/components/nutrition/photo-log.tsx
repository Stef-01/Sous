"use client";

import { useRef, useState } from "react";
import { Camera, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import {
  matchDishesByText,
  type DishMatch,
} from "@/lib/nutrition/match-dish-by-text";
import { diaryLogCook } from "@/lib/hooks/use-nutrition-diary";
import { haptic } from "@/lib/motion/haptics";

/**
 * PhotoLog (#1) — snap your plate → the SAME vision pipeline the craving camera
 * uses (recognition.identify, retry/fallback/cost-tracking inside src/lib/ai)
 * → the identified name runs through the SAME catalogue matcher as typed logs
 * → tappable kcal-previewed chips (the correction-chip pattern: vision output
 * is never trusted alone, the user confirms the dish). Degrades honestly: if
 * vision fails or nothing matches, we say so and point at type-to-log.
 */
export function PhotoLog({ date }: { date?: Date }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [identified, setIdentified] = useState<string | null>(null);
  const [options, setOptions] = useState<DishMatch[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const identify = trpc.recognition.identify.useMutation();

  const onFile = async (file: File) => {
    setBusy(true);
    setStatus(null);
    setOptions([]);
    setIdentified(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      const result = await identify.mutateAsync({ imageBase64: base64 });
      if (!result.success || !result.dishName) {
        setStatus("Couldn't recognise that — try typing the dish below.");
        return;
      }
      setIdentified(result.dishName);
      // Vision name + alternates → catalogue matches (kcal-previewed chips).
      const names = [
        result.dishName,
        ...(Array.isArray(result.alternates) ? result.alternates : []),
      ];
      const seen = new Set<string>();
      const matches: DishMatch[] = [];
      for (const n of names) {
        for (const m of matchDishesByText(String(n), 2)) {
          if (!seen.has(m.id)) {
            seen.add(m.id);
            matches.push(m);
          }
        }
      }
      if (matches.length === 0) {
        setStatus(
          `Saw "${result.dishName}" — no catalogue match; try typing it below.`,
        );
      } else {
        setOptions(matches.slice(0, 4));
      }
    } catch {
      setStatus("Recognition is unavailable — try typing the dish below.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/50 active:scale-[0.97] disabled:opacity-50"
      >
        <Camera size={13} className="text-[var(--nourish-green)]" />
        {busy ? "Reading your plate…" : "Snap your plate"}
      </button>

      {status && (
        <p className="text-[12px] text-[var(--nourish-subtext)]">{status}</p>
      )}

      {options.length > 0 && (
        <div className="space-y-1.5">
          {identified && (
            <p className="text-[12px] text-[var(--nourish-subtext)]">
              Looks like <span className="font-semibold">{identified}</span> —
              confirm:
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {options.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  haptic("commit");
                  diaryLogCook(m.id, m.name, 1, { date });
                  setOptions([]);
                  setIdentified(null);
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
        </div>
      )}
    </div>
  );
}
