import { cn } from "@/lib/utils/cn";

/**
 * SampleTag — a quiet "sample" marker shown beside placeholder editorial
 * names/affiliations (CLAUDE.md rule 11). The content data is all flagged
 * `isPlaceholder: true`; this surfaces that flag right where the name is, so a
 * reader never mistakes a seeded clinician byline for a real attributed author.
 * Render gated on `isPlaceholder` — e.g. `{author?.isPlaceholder && <SampleTag />}`.
 */
export function SampleTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "ml-1 inline-block rounded bg-neutral-100 px-1 align-middle text-[9px] font-semibold uppercase tracking-wide text-[var(--nourish-subtext-faint)]",
        className,
      )}
    >
      sample
    </span>
  );
}
