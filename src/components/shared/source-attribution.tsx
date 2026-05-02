import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * SourceAttribution — the "Sourced from / Read the original / Sous
 * paraphrase, not a reproduction" aside that renders on Stanford-
 * attributed (and any other isPlaceholder: false + sourceUrl) items.
 *
 * Codified from `docs/design-tokens.md`. The component contract
 * enforces the legal posture (paraphrase disclaimer + linked source)
 * so it doesn't have to be remembered per call site.
 */

interface Props {
  sourceUrl: string;
  sourceTitle: string;
  /** ISO date the summary was captured. Optional — when present the
   *  paraphrase disclaimer line renders. */
  sourceFetchedAt?: string;
  /** Visual variant: green-tinted (article body) or white card
   *  (research detail body). */
  variant?: "tinted" | "card";
  className?: string;
}

function formatFetchedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function SourceAttribution({
  sourceUrl,
  sourceTitle,
  sourceFetchedAt,
  variant = "tinted",
  className,
}: Props) {
  const containerVariant =
    variant === "card"
      ? "border border-[var(--nourish-green)]/25 bg-white"
      : "border border-[var(--nourish-green)]/25 bg-[var(--nourish-green)]/5";

  const buttonVariant =
    variant === "card"
      ? "bg-[var(--nourish-cream)] ring-1 ring-[var(--nourish-green)]/20 hover:ring-[var(--nourish-green)]/40"
      : "bg-white shadow-sm ring-1 ring-[var(--nourish-green)]/20 hover:ring-[var(--nourish-green)]/40";

  return (
    <aside
      className={cn(
        "rounded-2xl p-4 text-[12px] text-[var(--nourish-dark)]/85",
        containerVariant,
        className,
      )}
      aria-label="Original source"
    >
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nourish-green)]">
        Sourced from
      </p>
      <p className="font-semibold text-[var(--nourish-dark)]">{sourceTitle}</p>
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-[var(--nourish-green)]",
          buttonVariant,
        )}
      >
        Read the original
        <ExternalLink size={11} aria-hidden />
      </a>
      {sourceFetchedAt && (
        <p className="mt-2 text-[10px] text-[var(--nourish-subtext)]">
          Summary captured {formatFetchedAt(sourceFetchedAt)} · Sous paraphrase,
          not a reproduction.
        </p>
      )}
    </aside>
  );
}
