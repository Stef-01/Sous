"use client";

/**
 * /community/pod/join — invite-code redemption.
 *
 * V1 vibecode constraint: pods are single-pod-per-device
 * localStorage. The owner's device is the source of truth, so a
 * recipient on another device can't actually join until auth +
 * Postgres land in Year-2 W1-W4. This page is the placeholder
 * surface; the form accepts a code and explains the constraint
 * honestly rather than mock-joining a fake pod that doesn't
 * exist.
 *
 * The code-input affordance still ships so the design + flow
 * are validated. When the Y2 unlock lands, the form swaps from
 * placeholder to real fetch with no surface change.
 */

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, TicketCheck } from "lucide-react";
import { SectionKicker } from "@/components/shared/section-kicker";

export default function JoinPodPage() {
  const reducedMotion = useReducedMotion();
  const [code, setCode] = useState("");

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
            Join with code
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        <section className="space-y-3 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
          <SectionKicker as="p" size="10px">
            Enter the 6-character invite code
          </SectionKicker>
          <input
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
            }
            placeholder="ABCD23"
            maxLength={6}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-3 text-center font-mono text-[18px] tracking-[0.4em] text-[var(--nourish-dark)] placeholder:text-[var(--nourish-subtext)]/70 focus:border-[var(--nourish-green)] focus:outline-none focus:ring-2 focus:ring-[var(--nourish-green)]/20"
          />
        </section>

        <section className="space-y-2 rounded-2xl border border-amber-200/60 bg-amber-50 p-4 text-center">
          <TicketCheck
            size={18}
            className="mx-auto text-amber-700"
            aria-hidden
          />
          <p className="font-serif text-sm font-semibold text-amber-900">
            Cross-device join lands Year-2
          </p>
          <p className="mx-auto max-w-[300px] text-[11px] leading-relaxed text-amber-800">
            Sous pods live on each member&apos;s device until we ship the
            multi-device backend (auth + sync) — that&apos;s Year-2 W1-W4 per
            the founder-unlock runbook. Until then, ask the pod owner to create
            the pod from your shared device, or wait for the unlock.
          </p>
        </section>

        <Link
          href="/community/pod/create"
          className="block w-full rounded-2xl bg-[var(--nourish-green)] py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--nourish-dark-green)]"
        >
          Create a pod instead
        </Link>
      </main>
    </motion.div>
  );
}
