"use client";

import { cn } from "@/lib/utils/cn";

interface Props {
  /** Optional eyebrow caps over the title. Uses the canonical .sous-label. */
  eyebrow?: string;
  title: string;
  /** Right-aligned action. Pass label + onClick OR label + href. */
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

/**
 * SectionHeader — the single section-title treatment for the Content tab.
 * Eyebrow (canonical .sous-label) + serif title + optional "See all" action.
 * Replaces the four hand-rolled `font-serif text-xl` headers across the
 * content components so the surface has one type rhythm (rule 6 + 13).
 */
export function SectionHeader({ eyebrow, title, action, className }: Props) {
  const actionClass =
    "inline-flex shrink-0 items-center gap-0.5 self-end pb-1 text-[12px] font-semibold text-[var(--nourish-green)] transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40";
  return (
    <div className={cn("flex items-end justify-between gap-3 px-1", className)}>
      <div>
        {eyebrow && (
          <p className="sous-label text-[var(--nourish-green)]">{eyebrow}</p>
        )}
        <h2 className="mt-0.5 font-serif text-[19px] leading-tight text-[var(--nourish-dark)]">
          {title}
        </h2>
      </div>
      {action &&
        (action.href ? (
          <a href={action.href} className={actionClass}>
            {action.label}
          </a>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className={actionClass}
          >
            {action.label}
          </button>
        ))}
    </div>
  );
}
