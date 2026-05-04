"use client";

/**
 * /path/household — household-memory roster page.
 *
 * W33 first surface; W34 expands the form to capture dietary
 * flags + cuisine preferences and adds inline edit mode on each
 * card. Both Add and Edit render through the shared
 * `<MemberForm>` component (extract-shared-form pattern from
 * the W29 RecipeForm).
 *
 * The "who's at the table" picker on /today (W35) and weekly
 * rhythm widget (W36) build on this populated roster.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useHouseholdMembers } from "@/lib/hooks/use-household-members";
import {
  defaultHouseholdMember,
  nextMemberId,
} from "@/lib/household/household-helpers";
import { type HouseholdMember } from "@/types/household-member";
import {
  MemberForm,
  emptyMemberFormValues,
  type MemberFormValues,
} from "@/components/household/member-form";

export default function HouseholdPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { members, mounted, append, remove, update } = useHouseholdMembers();
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = (values: MemberFormValues) => {
    const base = defaultHouseholdMember();
    append({
      ...base,
      id: nextMemberId(members, values.name),
      name: values.name,
      avatar: values.avatar,
      ageBand: values.ageBand,
      spiceTolerance: values.spiceTolerance,
      dietaryFlags: values.dietaryFlags,
      cuisinePreferences: values.cuisinePreferences,
    });
    setAddOpen(false);
  };

  const handleUpdate = (id: string, values: MemberFormValues) => {
    update(id, {
      name: values.name,
      avatar: values.avatar,
      ageBand: values.ageBand,
      spiceTolerance: values.spiceTolerance,
      dietaryFlags: values.dietaryFlags,
      cuisinePreferences: values.cuisinePreferences,
    });
    setEditingId(null);
  };

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
              onClick={() => {
                setEditingId(null);
                setAddOpen((v) => !v);
              }}
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
              <MemberForm
                initialValues={emptyMemberFormValues()}
                mode="add"
                onSave={handleAdd}
                onCancel={
                  members.length > 0 ? () => setAddOpen(false) : undefined
                }
              />
            )}
            {members.length === 0 ? null : (
              <ul className="space-y-3">
                {members.map((m) =>
                  editingId === m.id ? (
                    <li key={m.id}>
                      <MemberForm
                        initialValues={memberToFormValues(m)}
                        mode="edit"
                        onSave={(values) => handleUpdate(m.id, values)}
                        onCancel={() => setEditingId(null)}
                      />
                    </li>
                  ) : (
                    <li key={m.id}>
                      <MemberCard
                        member={m}
                        onEdit={() => {
                          setAddOpen(false);
                          setEditingId(m.id);
                        }}
                        onRemove={() => remove(m.id)}
                        canRemove={members.length > 1}
                      />
                    </li>
                  ),
                )}
              </ul>
            )}
          </>
        )}
      </main>
    </motion.div>
  );
}

/** Adapt a stored HouseholdMember to the MemberForm's input
 *  shape. Drops id / createdAt / schemaVersion (the form doesn't
 *  collect them). */
function memberToFormValues(m: HouseholdMember): MemberFormValues {
  return {
    name: m.name,
    avatar: m.avatar,
    ageBand: m.ageBand,
    spiceTolerance: m.spiceTolerance,
    dietaryFlags: [...m.dietaryFlags],
    cuisinePreferences: [...m.cuisinePreferences],
  };
}

function MemberCard({
  member,
  onEdit,
  onRemove,
  canRemove,
}: {
  member: HouseholdMember;
  onEdit: () => void;
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
          </p>
          {member.dietaryFlags.length > 0 && (
            <p className="mt-1 text-[11px] text-[var(--nourish-subtext)]">
              {member.dietaryFlags.join(" · ")}
            </p>
          )}
          {member.cuisinePreferences.length > 0 && (
            <p className="text-[11px] text-[var(--nourish-subtext)]">
              likes: {member.cuisinePreferences.slice(0, 3).join(", ")}
              {member.cuisinePreferences.length > 3
                ? ` +${member.cuisinePreferences.length - 3}`
                : ""}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${member.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-[var(--nourish-dark)]"
          >
            <Pencil size={14} />
          </button>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${member.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-rose-500"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
