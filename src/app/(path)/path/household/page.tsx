"use client";

/**
 * /path/household — household-memory roster page.
 *
 * W33 follow-on to the W32 substrate (schema + helpers +
 * persistence hook). First surface in the household-memory arc
 * (Sprint G W32-W36). The "who's at the table" picker on /today
 * (W35) and weekly rhythm widget (W36) build on this roster.
 *
 * Same shape as the W28 /path/recipes list view: pre-hydration
 * skeleton, empty state with CTA, populated card stack. Add
 * happens inline via an expandable form panel at the top of the
 * list — single-page CRUD because household members carry less
 * data than recipes (no field arrays).
 *
 * Edit is queued for W34 and will reuse the same inline form
 * structure with a toggleable "edit mode" per card.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Users } from "lucide-react";
import { useHouseholdMembers } from "@/lib/hooks/use-household-members";
import {
  defaultHouseholdMember,
  nextMemberId,
} from "@/lib/household/household-helpers";
import {
  HOUSEHOLD_AGE_BANDS,
  type HouseholdAgeBand,
  type HouseholdMember,
} from "@/types/household-member";
import { SectionKicker } from "@/components/shared/section-kicker";
import { cn } from "@/lib/utils/cn";

export default function HouseholdPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { members, mounted, append, remove } = useHouseholdMembers();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <motion.div
      className="min-h-full bg-[var(--nourish-cream)] pb-24"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
    >
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/path")}
            aria-label="Back to Path"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            Household
          </h1>
          {mounted && members.length > 0 && (
            <button
              type="button"
              onClick={() => setAddOpen((v) => !v)}
              className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--nourish-green)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[var(--nourish-dark-green)]"
            >
              <Plus size={12} aria-hidden /> Add
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        {!mounted ? (
          <div className="h-24 animate-pulse rounded-2xl bg-white/70" />
        ) : (
          <>
            {(addOpen || members.length === 0) && (
              <AddMemberPanel
                existingMembers={members}
                onAdd={(member) => {
                  append(member);
                  setAddOpen(false);
                }}
                onCancel={
                  members.length > 0 ? () => setAddOpen(false) : undefined
                }
              />
            )}
            {members.length === 0 ? null : (
              <ul className="space-y-3">
                {members.map((m) => (
                  <li key={m.id}>
                    <MemberCard
                      member={m}
                      onRemove={() => remove(m.id)}
                      canRemove={members.length > 1}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </motion.div>
  );
}

function AddMemberPanel({
  existingMembers,
  onAdd,
  onCancel,
}: {
  existingMembers: ReadonlyArray<HouseholdMember>;
  onAdd: (member: HouseholdMember) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState("");
  const [ageBand, setAgeBand] = useState<HouseholdAgeBand>("adult");
  const [spice, setSpice] = useState(3);
  const [avatar, setAvatar] = useState("");

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const base = defaultHouseholdMember();
    onAdd({
      ...base,
      id: nextMemberId(existingMembers, trimmed),
      name: trimmed,
      ageBand,
      spiceTolerance: spice,
      avatar: avatar.trim().slice(0, 8),
    });
    setName("");
    setAgeBand("adult");
    setSpice(3);
    setAvatar("");
  };

  return (
    <section className="space-y-3 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
      <SectionKicker as="p" size="10px">
        Add member
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
        <div className="flex flex-wrap gap-1.5">
          {HOUSEHOLD_AGE_BANDS.map((band) => (
            <button
              key={band}
              type="button"
              onClick={() => setAgeBand(band)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition",
                ageBand === band
                  ? "bg-[var(--nourish-green)] text-white"
                  : "bg-neutral-100 text-[var(--nourish-subtext)] hover:bg-neutral-200",
              )}
            >
              {band}
            </button>
          ))}
        </div>
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

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim()}
          className="flex-1 rounded-xl bg-[var(--nourish-green)] py-2 text-sm font-semibold text-white transition hover:bg-[var(--nourish-dark-green)] disabled:opacity-50"
        >
          Save member
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

function MemberCard({
  member,
  onRemove,
  canRemove,
}: {
  member: HouseholdMember;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <article className="rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--nourish-green)]/10 text-base"
        >
          {member.avatar || (
            <Users size={18} className="text-[var(--nourish-green)]" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-base font-semibold text-[var(--nourish-dark)]">
            {member.name}
          </h2>
          <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--nourish-subtext)]/70">
            {member.ageBand} · spice {member.spiceTolerance}/5
            {member.dietaryFlags.length > 0 &&
              ` · ${member.dietaryFlags.join(", ")}`}
          </p>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${member.name}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-rose-500"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </article>
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
