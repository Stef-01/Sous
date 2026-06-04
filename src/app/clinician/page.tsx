/**
 * /clinician — the Culinary Therapeutics clinician review surface.
 *
 * A read-only, single-page rendering of the ENTIRE evidence registry +
 * methodology so a clinician can evaluate the system end-to-end and advise.
 * Server component (pure data, no interactivity). Gated to the review build —
 * NOT linked from the app, clearly marked unreviewed (never "approved", rule 11).
 */

import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { InterventionRecord } from "@/types/therapeutics";
import {
  buildClinicianReview,
  type ClinicianConditionView,
} from "@/lib/therapeutics/clinician-review";
import {
  GRADE_LABEL,
  CLASS_LABEL,
  formatEffect,
} from "@/lib/therapeutics/evidence-card";
import { FOOD_FIRST_HEDGE } from "@/lib/therapeutics/claim-contract";
import {
  clinicianReviewMode,
  therapeuticsActive,
} from "@/lib/therapeutics/feature-flag";

export const metadata: Metadata = {
  title: "Clinician Review — Culinary Therapeutics",
  robots: { index: false, follow: false },
};

export default function ClinicianReviewPage() {
  if (!clinicianReviewMode() && !therapeuticsActive()) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-serif text-2xl text-[var(--nourish-dark)]">
          Clinician review build not enabled
        </h1>
        <p className="mt-3 text-sm text-[var(--nourish-subtext)]">
          Set <code>NEXT_PUBLIC_THERAPEUTICS_CLINICIAN_REVIEW=1</code> to view
          the evidence registry review surface.
        </p>
      </main>
    );
  }

  const review = buildClinicianReview();

  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-8">
      {/* Unreviewed banner — the honesty contract, top of page. */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] leading-snug text-amber-900">
        <strong className="font-bold">
          CLINICIAN REVIEW BUILD · UNREVIEWED PROTOTYPE
        </strong>
        <p className="mt-1">
          Not for patient use. Every record below is <em>unreviewed</em> —
          effect sizes are transcribed from a synthesis report and need your
          verification. This page exists so you can tell us where it is wrong.
        </p>
      </div>

      <header className="mt-6">
        <h1 className="font-serif text-[28px] leading-tight text-[var(--nourish-dark)]">
          Culinary Therapeutics — Clinician Review
        </h1>
        <p className="mt-1 text-sm text-[var(--nourish-subtext)]">
          Registry v{review.version} · updated {review.updatedAt}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Conditions" value={review.stats.conditions} />
          <Stat label="Interventions" value={review.stats.interventions} />
          <Stat label="Scorable" value={review.stats.scorable} />
          <Stat label="Education-only" value={review.stats.educationOnly} />
        </dl>
        <p
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${
            review.claimAudit.ok
              ? "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]"
              : "bg-red-100 text-red-700"
          }`}
        >
          {review.claimAudit.ok
            ? `✓ Anti-overclaim audit passed — all ${review.stats.interventions} records + ${review.stats.interactions} rules claim-safe`
            : `✗ ${review.claimAudit.entries.length} claim violations — see console`}
        </p>
      </header>

      {/* Methodology */}
      <Section title="How it works (methodology)">
        <ul className="space-y-2 text-[13px] leading-relaxed text-[var(--nourish-dark)]">
          <li>
            <strong>Matching by food identity.</strong> A dish&apos;s resolved
            ingredients map to food groups + therapeutic classes; an
            intervention fires when the dish realizes its signal (e.g. lentils →
            legume → Portfolio/Mediterranean), not when a keyword happens to
            match.
          </li>
          <li>
            <strong>Anti-overclaiming spine.</strong> Records are{" "}
            <em>recipe-native</em>, <em>fortified-food</em>, or{" "}
            <em>extract-or-supplement</em>. Only the first two can move a
            recipe&apos;s score; supplement evidence is shown but never scored.
          </li>
          <li>
            <strong>Adherence-weighted ranking.</strong> When personalization is
            on, the therapeutic dimension is weighted{" "}
            <strong>{review.therapeuticWeight}</strong> — deliberately below
            taste (cuisine-fit / flavor-contrast at 0.22 each), because a dish
            nobody eats helps no one.
          </li>
          <li>
            <strong>Hard exclusions first.</strong> e.g. celiac → gluten-free is
            a filter applied before any optimization, overriding preferences.
          </li>
          <li>
            <strong>Two human gates.</strong> G1 (clinical sign-off — your
            review) flips records to approved + enables personalization for
            users; G5 (legal) clears the claim posture for production.
          </li>
        </ul>
        <p className="mt-3 rounded-lg bg-[var(--nourish-cream)] px-3 py-2 text-[12px] text-[var(--nourish-subtext)]">
          Food-first hedge shown on every user-facing claim: “{FOOD_FIRST_HEDGE}
          ”
        </p>
      </Section>

      {/* Conditions */}
      {review.conditions.map((c) => (
        <ConditionBlock key={c.id} condition={c} />
      ))}

      {/* Interactions */}
      <Section title="Nutrient interaction rules (deterministic)">
        <ul className="space-y-3">
          {review.interactions.map((r) => (
            <li
              key={r.id}
              className="border-t border-neutral-100 pt-3 first:border-0 first:pt-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[var(--nourish-dark)]">
                  {r.target}
                </span>
                <GradeBadge grade={r.grade} />
              </div>
              <p className="mt-1 text-[12px] leading-snug text-[var(--nourish-subtext)]">
                {r.rule}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Review asks */}
      <Section title="What we need from you">
        <ol className="list-decimal space-y-1.5 pl-5 text-[13px] text-[var(--nourish-dark)]">
          <li>
            Per-record sign-off: is each grade, effect size, and application
            note accurate + safe? Approve / revise / reject.
          </li>
          <li>
            Should any condition (celiac, IBD, anticoagulation) require a “see
            your clinician” interstitial before food suggestions?
          </li>
          <li>
            <strong>Candidate safety gap:</strong> we surface leafy greens for
            several conditions but have no vitamin-K / warfarin interaction
            warning. Should we add one?
          </li>
          <li>
            Is presence-matching (vs dose-matching against the dose signal)
            acceptable for an educational prototype?
          </li>
        </ol>
        <p className="mt-3 text-[12px] text-[var(--nourish-subtext-faint)]">
          Full appraisal: <code>docs/THERAPEUTICS-CLINICIAN-APPRAISAL.md</code>
        </p>
      </Section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[var(--nourish-cream)] px-3 py-2.5 text-center">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--nourish-subtext-faint)]">
        {label}
      </dt>
      <dd className="mt-0.5 font-serif text-xl text-[var(--nourish-dark)]">
        {value}
      </dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-green)]">
        {title}
      </h2>
      <div className="mt-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        {children}
      </div>
    </section>
  );
}

function GradeBadge({ grade }: { grade: InterventionRecord["grade"] }) {
  return (
    <span className="rounded-full bg-[var(--nourish-cream)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--nourish-subtext)]">
      {GRADE_LABEL[grade]} evidence
    </span>
  );
}

function RecordRow({ rec }: { rec: InterventionRecord }) {
  const isEducation = rec.interventionClass === "extract-or-supplement";
  return (
    <li className="border-t border-neutral-100 pt-3 first:border-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[13px] font-semibold text-[var(--nourish-dark)]">
          {rec.label}
        </span>
        <span
          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
            isEducation
              ? "bg-neutral-100 text-[var(--nourish-subtext)]"
              : "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]"
          }`}
        >
          {CLASS_LABEL[rec.interventionClass]}
        </span>
        <GradeBadge grade={rec.grade} />
        <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[var(--nourish-subtext)]">
          {rec.direction} · {rec.reviewStatus}
        </span>
      </div>
      {rec.effect && (
        <p className="mt-1 text-[12px] font-medium text-[var(--nourish-dark)]">
          {formatEffect(rec.effect)}
          {rec.effect.ciLow != null &&
            ` · 95% CI ${rec.effect.ciLow}–${rec.effect.ciHigh}`}
          {rec.effect.heterogeneityI2 != null &&
            ` · I² ${rec.effect.heterogeneityI2}%`}
        </p>
      )}
      {rec.doseSignal && (
        <p className="mt-0.5 text-[11px] text-[var(--nourish-subtext)]">
          Dose signal: {rec.doseSignal}
        </p>
      )}
      <p className="mt-1 text-[12px] leading-snug text-[var(--nourish-subtext)]">
        {rec.applicationNote}
      </p>
      <p className="mt-1 text-[11px] text-[var(--nourish-subtext-faint)]">
        Realized by: {rec.recipeSignals.join(" · ")}
      </p>
      <p className="mt-0.5 text-[11px] text-[var(--nourish-subtext-faint)]">
        Sources:{" "}
        {rec.sources.map((s) => `${s.title} (${s.studyType})`).join("; ")}
      </p>
    </li>
  );
}

function ConditionBlock({ condition }: { condition: ClinicianConditionView }) {
  const all = [...condition.scorable, ...condition.educationOnly];
  return (
    <section className="mt-8">
      <h2 className="font-serif text-xl text-[var(--nourish-dark)]">
        {condition.displayName}
      </h2>
      <p className="mt-0.5 text-[12px] text-[var(--nourish-subtext)]">
        {condition.plainDescriptor}
      </p>
      <div className="mt-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <dl className="space-y-1.5 text-[12px]">
          <Field label="First-line" value={condition.firstLineStrategy} />
          <Field
            label="Best adjuncts"
            value={condition.bestAdjuncts.join(", ")}
          />
          <Field label="Do not overstate" value={condition.avoidOverstating} />
          {condition.escalation && (
            <Field
              label="Escalation"
              value={`${condition.escalation.title} — ${condition.escalation.body}`}
            />
          )}
        </dl>
        <ul className="mt-4 space-y-3">
          {all.map((rec) => (
            <RecordRow key={rec.id} rec={rec} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 font-semibold text-[var(--nourish-subtext-faint)]">
        {label}:
      </dt>
      <dd className="text-[var(--nourish-dark)]">{value}</dd>
    </div>
  );
}
