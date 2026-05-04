"use client";

/**
 * /community/pod — Cooking Pod Challenge home.
 *
 * W46 surface per `docs/COOKING-POD-CHALLENGE.md` V2. Three
 * states:
 *
 *   1. No pod yet — friendly pitch + Create / Join CTAs.
 *   2. Pod, mid-week — current challenge recipe + binary
 *      member completion list + "Cook this week's challenge"
 *      deeplink.
 *   3. Pod, gallery dropped — photo grid + per-cook score
 *      chips + reaction emoji + pod's weekly score with the
 *      consistency multiplier visible.
 *
 * Wraps the W45 substrate (pod-score helpers + schema +
 * useCurrentPod). No new score logic here — the page is a thin
 * display over the pure helpers.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChefHat, Plus, TicketCheck, Users } from "lucide-react";
import { useCurrentPod } from "@/lib/pod/use-current-pod";
import { PodHomeContent } from "@/components/community/pod-home-content";

export default function PodPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { pod, weeks, submissions, mounted } = useCurrentPod();

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
            onClick={() => router.push("/community")}
            aria-label="Back to Content"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            Pod challenge
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        {!mounted ? (
          <div className="h-44 animate-pulse rounded-2xl bg-white/70" />
        ) : pod === null ? (
          <NoPodState />
        ) : (
          <PodHomeContent pod={pod} weeks={weeks} submissions={submissions} />
        )}
      </main>
    </motion.div>
  );
}

function NoPodState() {
  return (
    <section className="space-y-4 rounded-2xl border border-dashed border-neutral-200 bg-white/40 p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--nourish-green)]/10">
        <Users
          size={26}
          className="text-[var(--nourish-green)]"
          strokeWidth={1.8}
        />
      </div>
      <div className="space-y-1.5">
        <p className="font-serif text-base font-semibold text-[var(--nourish-dark)]">
          Cook with friends
        </p>
        <p className="mx-auto max-w-[280px] text-xs text-[var(--nourish-subtext)]">
          Form a pod with 2-8 friends or coworkers. A new recipe drops every
          Monday. Cook it on your own time, share a photo Sunday night, and see
          everyone&apos;s plate at once.
        </p>
      </div>
      <ul className="mx-auto max-w-[280px] space-y-2 text-left text-xs text-[var(--nourish-subtext)]">
        <li className="flex items-start gap-2">
          <ChefHat
            size={14}
            className="mt-0.5 shrink-0 text-[var(--nourish-green)]"
            aria-hidden
          />
          <span>
            <strong className="text-[var(--nourish-dark)]">Score-based.</strong>{" "}
            Better cooks score higher. Up to 2 cooks per day count.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Users
            size={14}
            className="mt-0.5 shrink-0 text-[var(--nourish-green)]"
            aria-hidden
          />
          <span>
            <strong className="text-[var(--nourish-dark)]">
              Even pace bonus.
            </strong>{" "}
            Pods where everyone cooks evenly score the most.
          </span>
        </li>
      </ul>
      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <Link
          href="/community/pod/create"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--nourish-green)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--nourish-dark-green)]"
        >
          <Plus size={14} aria-hidden /> Create a pod
        </Link>
        <Link
          href="/community/pod/join"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-[var(--nourish-dark)] transition hover:border-neutral-300"
        >
          <TicketCheck size={14} aria-hidden /> Join with code
        </Link>
      </div>
    </section>
  );
}
