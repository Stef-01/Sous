import { cn } from "@/lib/utils/cn";

/**
 * SectionKicker — small uppercase label rendered above section
 * headers across the app (Path home, Content tab home, skill-tree
 * milestones, settings sheet sections, forum reply count, expert
 * "From X" header, source attribution kicker).
 *
 * Codified from `docs/design-tokens.md`. See that doc for the
 * pattern's history across Stage 3.
 *
 * Default colour is the muted subtext token. The `green` variant is
 * for kickers that carry attribution or celebratory weight (e.g.
 * "Sourced from", "Auto-applied to your next cook").
 */

interface Props {
  children: React.ReactNode;
  /** Tighter "10px" or roomier "11px" — matches the existing
   *  call-site sizes. Default 11px. */
  size?: "10px" | "11px";
  /** Default subtext colour, or green for attribution/celebration. */
  variant?: "default" | "green";
  className?: string;
  /** Pass `as="p"` for headers that aren't h2-level. Default `h2`. */
  as?: "h2" | "h3" | "p";
}

export function SectionKicker({
  children,
  size = "11px",
  variant = "default",
  className,
  as: Tag = "h2",
}: Props) {
  return (
    <Tag
      className={cn(
        "font-bold uppercase",
        size === "10px"
          ? "text-[10px] tracking-[0.16em]"
          : "text-[11px] tracking-[0.12em]",
        variant === "green"
          ? "text-[var(--nourish-green)]"
          : "text-[var(--nourish-subtext)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
