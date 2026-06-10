"use client";

import { useState } from "react";
import { SectionKicker } from "@/components/shared/section-kicker";
import { usePersonalTargets } from "@/lib/hooks/use-personal-targets";
import type { PersonalProfile } from "@/lib/nutrition/personal-targets";
import { cn } from "@/lib/utils/cn";

/**
 * Personal targets capture (#6) — lives in the Profile sheet (the one
 * rule-3-permitted settings surface). Six fields → Mifflin-based daily targets
 * that drive the ring's target bars and the Nutrition "kcal left". Educational
 * estimate, hedged below; Clear restores the FDA defaults everywhere.
 */
export function PersonalTargetsSection() {
  const { profile, targets, setProfile } = usePersonalTargets();
  const [draft, setDraft] = useState<PersonalProfile>(
    profile ?? {
      sex: "female",
      age: 35,
      heightCm: 170,
      weightKg: 70,
      activity: "light",
      goal: "maintain",
    },
  );

  const num =
    (k: "age" | "heightCm" | "weightKg") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDraft((d) => ({ ...d, [k]: Number(e.target.value) }));

  const seg = <K extends "sex" | "activity" | "goal">(
    key: K,
    options: ReadonlyArray<{ v: PersonalProfile[K]; label: string }>,
  ) => (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          onClick={() => setDraft((d) => ({ ...d, [key]: o.v }))}
          className={cn(
            "flex-1 rounded-full px-2 py-1.5 text-[11px] font-semibold transition-colors",
            draft[key] === o.v
              ? "bg-[var(--nourish-green)] text-white"
              : "bg-neutral-100 text-[var(--nourish-subtext)] hover:bg-neutral-200",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <section className="mt-5 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
      <SectionKicker>Your targets</SectionKicker>
      <div className="mt-3 space-y-2.5">
        {seg("sex", [
          { v: "female", label: "Female" },
          { v: "male", label: "Male" },
        ])}
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["age", "Age", draft.age],
              ["heightCm", "Height cm", draft.heightCm],
              ["weightKg", "Weight kg", draft.weightKg],
            ] as const
          ).map(([k, label, value]) => (
            <label key={k} className="block">
              <span className="sous-label">{label}</span>
              <input
                type="number"
                inputMode="numeric"
                value={value || ""}
                onChange={num(k)}
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-[13px] text-[var(--nourish-dark)] outline-none focus:border-[var(--nourish-green)]/50"
              />
            </label>
          ))}
        </div>
        {seg("activity", [
          { v: "sedentary", label: "Sedentary" },
          { v: "light", label: "Light" },
          { v: "moderate", label: "Moderate" },
          { v: "active", label: "Active" },
        ])}
        {seg("goal", [
          { v: "lose", label: "Lose" },
          { v: "maintain", label: "Maintain" },
          { v: "gain", label: "Gain" },
        ])}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setProfile(draft)}
            className="flex-1 rounded-xl bg-[var(--nourish-green)] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[var(--nourish-dark-green)] active:scale-[0.97]"
          >
            {profile ? "Update targets" : "Set my targets"}
          </button>
          {profile && (
            <button
              type="button"
              onClick={() => setProfile(null)}
              className="rounded-xl border border-neutral-200 px-3 py-2.5 text-[13px] font-medium text-[var(--nourish-subtext)] transition hover:border-neutral-300 active:scale-[0.97]"
            >
              Clear
            </button>
          )}
        </div>
        {profile && targets && (
          <p className="text-[12px] text-[var(--nourish-dark)]">
            <span className="font-semibold">{targets.kcal} kcal</span> ·{" "}
            {targets.protein_g}g protein · {targets.carbs_g}g carbs ·{" "}
            {targets.fat_g}g fat
          </p>
        )}
        <p className="text-[11px] leading-snug text-[var(--nourish-subtext)]">
          An everyday estimate (Mifflin-St Jeor) — not medical or dietetic
          advice. Your clinician&apos;s plan wins.
        </p>
      </div>
    </section>
  );
}
