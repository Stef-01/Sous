/**
 * EvidenceProvenanceStrip — the food-first evidence card (Culinary
 * Therapeutics CT-4).
 *
 * Renders a condition's graded, classed evidence with honest provenance: an
 * intervention-class badge (Recipe / Fortified food / Supplement·education), a
 * GRADE badge, the pooled effect when present, and the mandatory food-first
 * hedge. Until clinician review (founder gate G1) it shows an "Educational"
 * banner and never asserts personalization.
 *
 * Thin presentational shell over `buildEvidenceCard` (pure, tested). Renders
 * live only when the therapeutic feature is active (CT-3 gate), so it is
 * absent from the default app today.
 */

import type { ConditionId } from "@/types/therapeutics";
import { buildEvidenceCard } from "@/lib/therapeutics/evidence-card";
import { cn } from "@/lib/utils/cn";

interface Props {
  conditionId: ConditionId;
  className?: string;
}

export function EvidenceProvenanceStrip({ conditionId, className }: Props) {
  const card = buildEvidenceCard(conditionId);
  if (card.rows.length === 0) return null;

  return (
    <section
      aria-label={`Food-first evidence for ${card.displayName}`}
      className={cn(
        "rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--nourish-green)]">
          Food-first evidence
        </p>
        {!card.reviewed && (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-[var(--nourish-subtext)]">
            Educational
          </span>
        )}
      </div>
      <h3 className="mt-0.5 font-serif text-base text-[var(--nourish-dark)]">
        {card.displayName}
      </h3>

      <ul className="mt-3 space-y-3">
        {card.rows.map((row) => (
          <li
            key={row.id}
            className="border-t border-neutral-100 pt-3 first:border-0 first:pt-0"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[13px] font-semibold text-[var(--nourish-dark)]">
                {row.label}
              </span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                  row.isEducation
                    ? "bg-neutral-100 text-[var(--nourish-subtext)]"
                    : "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]",
                )}
              >
                {row.classLabel}
              </span>
              <span className="rounded-full bg-[var(--nourish-cream)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--nourish-subtext)]">
                {row.gradeLabel} evidence
              </span>
            </div>
            {row.effectText && (
              <p className="mt-1 text-[12px] font-medium text-[var(--nourish-dark)]">
                {row.effectText}
              </p>
            )}
            <p className="mt-1 text-[12px] leading-snug text-[var(--nourish-subtext)]">
              {row.note}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[10px] leading-snug text-[var(--nourish-subtext-faint)]">
        {card.hedge}
      </p>
    </section>
  );
}
