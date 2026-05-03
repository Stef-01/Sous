"use client";

/**
 * MemberForm — shared add/edit form for household members.
 *
 * W34 follow-on to the W33 roster page. Both the "Add member"
 * panel and the per-card inline edit mode render this. The
 * mode-aware submit label + the optional Cancel button are
 * the only consumer-visible differences between modes.
 *
 * Same extract-shared-form pattern as the W29 RecipeForm
 * extraction — refactor at edit-1 (when only one consumer
 * exists) means only that consumer changes; doing it at
 * edit-2 would be a bigger refactor with behavioural risk.
 */

import { useState } from "react";
import {
  HOUSEHOLD_AGE_BANDS,
  type HouseholdAgeBand,
} from "@/types/household-member";
import { SectionKicker } from "@/components/shared/section-kicker";
import { cn } from "@/lib/utils/cn";

export const COMMON_DIETARY_FLAGS = [
  "vegan",
  "vegetarian",
  "pescatarian",
  "gluten-free",
  "dairy-free",
  "nut-allergy",
  "shellfish-allergy",
  "low-sodium",
] as const;

export const COMMON_CUISINES = [
  "indian",
  "italian",
  "mexican",
  "japanese",
  "thai",
  "chinese",
  "french",
  "mediterranean",
  "american",
  "korean",
  "vietnamese",
] as const;

export interface MemberFormValues {
  name: string;
  avatar: string;
  ageBand: HouseholdAgeBand;
  spiceTolerance: number;
  dietaryFlags: string[];
  cuisinePreferences: string[];
}

export interface MemberFormProps {
  initialValues: MemberFormValues;
  mode: "add" | "edit";
  onSave: (values: MemberFormValues) => void;
  onCancel?: () => void;
}

export function emptyMemberFormValues(): MemberFormValues {
  return {
    name: "",
    avatar: "",
    ageBand: "adult",
    spiceTolerance: 3,
    dietaryFlags: [],
    cuisinePreferences: [],
  };
}

export function MemberForm({
  initialValues,
  mode,
  onSave,
  onCancel,
}: MemberFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [avatar, setAvatar] = useState(initialValues.avatar);
  const [ageBand, setAgeBand] = useState<HouseholdAgeBand>(
    initialValues.ageBand,
  );
  const [spice, setSpice] = useState(initialValues.spiceTolerance);
  const [dietary, setDietary] = useState<string[]>(initialValues.dietaryFlags);
  const [cuisines, setCuisines] = useState<string[]>(
    initialValues.cuisinePreferences,
  );

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      name: trimmed,
      avatar: avatar.trim().slice(0, 8),
      ageBand,
      spiceTolerance: spice,
      dietaryFlags: dietary,
      cuisinePreferences: cuisines,
    });
  };

  return (
    <section className="space-y-3 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
      <SectionKicker as="p" size="10px">
        {mode === "add" ? "Add member" : "Edit member"}
      </SectionKicker>

      <FormField label="Name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Alex"
          className={inputClass}
          maxLength={40}
        />
      </FormField>

      <FormField label="Avatar (emoji, optional)">
        <input
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="👋"
          className={inputClass}
          maxLength={8}
        />
      </FormField>

      <FormField label="Age band">
        <ChipGroup
          options={[...HOUSEHOLD_AGE_BANDS]}
          selected={ageBand}
          onSelect={(v) => setAgeBand(v as HouseholdAgeBand)}
        />
      </FormField>

      <FormField label={`Spice tolerance: ${spice} / 5`}>
        <input
          type="range"
          min={1}
          max={5}
          value={spice}
          onChange={(e) => setSpice(Number(e.target.value))}
          className="w-full accent-[var(--nourish-green)]"
        />
      </FormField>

      <FormField label="Dietary flags">
        <MultiChipGroup
          options={[...COMMON_DIETARY_FLAGS]}
          selected={dietary}
          onToggle={(v) =>
            setDietary((prev) =>
              prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
            )
          }
        />
      </FormField>

      <FormField label="Cuisine preferences">
        <MultiChipGroup
          options={[...COMMON_CUISINES]}
          selected={cuisines}
          onToggle={(v) =>
            setCuisines((prev) =>
              prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
            )
          }
        />
      </FormField>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim()}
          className="flex-1 rounded-xl bg-[var(--nourish-green)] py-2 text-sm font-semibold text-white transition hover:bg-[var(--nourish-dark-green)] disabled:opacity-50"
        >
          {mode === "add" ? "Save member" : "Save changes"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-medium text-[var(--nourish-subtext)] transition hover:border-neutral-300 hover:text-[var(--nourish-dark)]"
          >
            Cancel
          </button>
        )}
      </div>
    </section>
  );
}

function ChipGroup({
  options,
  selected,
  onSelect,
}: {
  options: ReadonlyArray<string>;
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition",
            opt === selected
              ? "bg-[var(--nourish-green)] text-white"
              : "bg-neutral-100 text-[var(--nourish-subtext)] hover:bg-neutral-200",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function MultiChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: ReadonlyArray<string>;
  selected: ReadonlyArray<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isOn = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            aria-pressed={isOn}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold lowercase tracking-wide transition",
              isOn
                ? "bg-[var(--nourish-green)] text-white"
                : "bg-neutral-100 text-[var(--nourish-subtext)] hover:bg-neutral-200",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[14px] text-[var(--nourish-dark)] placeholder:text-[var(--nourish-subtext)]/70 focus:border-[var(--nourish-green)] focus:outline-none focus:ring-2 focus:ring-[var(--nourish-green)]/20";
