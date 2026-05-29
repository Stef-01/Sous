"use client";

/**
 * /community/pod/create — pod creation form (W46).
 *
 * Vibecode V1: single-pod-per-device localStorage. The user
 * fills in pod name + reveal hour + member roster (themselves
 * + up to 7 more), submits → buildPodFromCreation composes a
 * schema-valid ChallengePod, useCurrentPod.setPod persists,
 * router.push('/community/pod') lands on the pod home.
 *
 * Real cross-device pod creation lands in Year-2 W1-W4 with
 * auth + Postgres + R2.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useCurrentPod } from "@/lib/pod/use-current-pod";
import { buildPodFromCreation } from "@/lib/pod/pod-create";
import { toast } from "@/lib/hooks/use-toast";
import { SectionKicker } from "@/components/shared/section-kicker";
import { cn } from "@/lib/utils/cn";
import { useHouseholdMembers } from "@/lib/hooks/use-household-members";

const AGE_BANDS = ["child", "teen", "adult", "senior"] as const;
type AgeBand = (typeof AGE_BANDS)[number];

interface MemberDraft {
  displayName: string;
  avatar: string;
  ageBand: AgeBand;
  dietaryFlags: string[];
  cuisinePreferences: string[];
}

function emptyMember(displayName: string = ""): MemberDraft {
  return {
    displayName,
    avatar: "",
    ageBand: "adult",
    dietaryFlags: [],
    cuisinePreferences: [],
  };
}

export default function CreatePodPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { setPod } = useCurrentPod();
  const { members: householdMembers } = useHouseholdMembers();

  const [name, setName] = useState("");
  const [revealAtHour, setRevealAtHour] = useState(21);
  const [members, setMembers] = useState<MemberDraft[]>([emptyMember("")]);

  const canSubmit =
    name.trim().length > 0 &&
    members.every((m) => m.displayName.trim().length > 0);

  const handleSeedFromHousehold = () => {
    if (householdMembers.length === 0) return;
    setMembers(
      householdMembers.slice(0, 8).map((hm) => ({
        displayName: hm.name,
        avatar: hm.avatar,
        ageBand: hm.ageBand,
        dietaryFlags: [...hm.dietaryFlags],
        cuisinePreferences: [...hm.cuisinePreferences],
      })),
    );
  };

  const handleAddMember = () => {
    if (members.length >= 8) return;
    setMembers((prev) => [...prev, emptyMember()]);
  };

  const handleRemoveMember = (idx: number) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePatchMember = (idx: number, patch: Partial<MemberDraft>) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const pod = buildPodFromCreation({
      name: name.trim(),
      revealAtHour,
      members: members.map((m) => ({
        displayName: m.displayName.trim(),
        avatar: m.avatar.trim().slice(0, 8),
        ageBand: m.ageBand,
        dietaryFlags: m.dietaryFlags,
        cuisinePreferences: m.cuisinePreferences,
      })),
    });
    setPod(pod);
    toast.push({
      variant: "success",
      title: `Pod "${pod.name}" created`,
      body: `Invite code: ${pod.inviteCode}`,
      dedupKey: "pod-created",
    });
    router.push("/community/pod");
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
          <Link
            href="/community/pod"
            aria-label="Back to Pod challenge"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            Create a pod
          </h1>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-md space-y-6 px-4 pt-4"
      >
        {/* Basics */}
        <section className="space-y-3 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
          <SectionKicker as="p" size="10px">
            Basics
          </SectionKicker>
          <FormField label="Pod name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sunday cooks club"
              maxLength={60}
              className={inputClass}
            />
          </FormField>
          <FormField label={`Sunday gallery at: ${revealAtHour}:00`}>
            <input
              type="range"
              min={12}
              max={23}
              value={revealAtHour}
              onChange={(e) => setRevealAtHour(Number(e.target.value))}
              className="w-full accent-[var(--nourish-green)]"
            />
          </FormField>
        </section>

        {/* Members */}
        <section className="space-y-3 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <SectionKicker as="p" size="10px">
              Members ({members.length} / 8)
            </SectionKicker>
            <div className="flex gap-2">
              {householdMembers.length > 0 && (
                <button
                  type="button"
                  onClick={handleSeedFromHousehold}
                  className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-[var(--nourish-subtext)] hover:border-neutral-300"
                >
                  Use household
                </button>
              )}
              {members.length < 8 && (
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--nourish-green)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/20"
                >
                  <Plus size={11} aria-hidden /> Add
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] text-[var(--nourish-subtext)]/70">
            You&apos;re the first member by default — that makes you the pod
            owner + admin. You can promote others to admin from the pod home.
          </p>
          <ul className="space-y-3">
            {members.map((m, idx) => (
              <li
                key={idx}
                className="space-y-2 rounded-xl border border-neutral-100 bg-neutral-50/60 p-3"
              >
                <div className="flex items-start gap-2">
                  <input
                    value={m.avatar}
                    onChange={(e) =>
                      handlePatchMember(idx, { avatar: e.target.value })
                    }
                    placeholder="🦄"
                    maxLength={8}
                    className={cn(inputClass, "w-14 shrink-0 text-center")}
                    aria-label={`Avatar for member ${idx + 1}`}
                  />
                  <input
                    value={m.displayName}
                    onChange={(e) =>
                      handlePatchMember(idx, { displayName: e.target.value })
                    }
                    placeholder={idx === 0 ? "Your name" : "Friend's name"}
                    maxLength={40}
                    className={inputClass}
                    aria-label={`Name for member ${idx + 1}`}
                  />
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      aria-label={`Remove member ${idx + 1}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-[var(--nourish-dark)]"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {AGE_BANDS.map((band) => (
                    <button
                      key={band}
                      type="button"
                      onClick={() => handlePatchMember(idx, { ageBand: band })}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition",
                        m.ageBand === band
                          ? "bg-[var(--nourish-green)] text-white"
                          : "bg-neutral-100 text-[var(--nourish-subtext)] hover:bg-neutral-200",
                      )}
                    >
                      {band}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-2xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          Create pod
        </button>
      </form>
    </motion.div>
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
