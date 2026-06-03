import { cn } from "@/lib/utils/cn";

interface Props {
  name: string;
  /** Size + ring/offset utilities. Set a `text-*` size to scale the initials. */
  className?: string;
}

/**
 * Initials for a person's name: first letter of the first and last word
 * (e.g. "Venus Kalami" → "VK"). Falls back to the first two letters for a
 * single-word name.
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * ExpertAvatar — a calm, branded initials monogram standing in for a
 * clinician headshot. The prototype has no real expert photos and we never
 * generate fake likenesses, so a monogram is the honest "no photo" state: it
 * reads as intentional, unlike a food photo pressed into service as a face.
 * Pure presentational — safe to render in both server and client components.
 */
export function ExpertAvatar({ name, className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[var(--nourish-green)]/12 font-semibold leading-none tracking-tight text-[var(--nourish-green)] select-none",
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
