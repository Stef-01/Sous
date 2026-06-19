"use client";

import { type LucideIcon } from "lucide-react";
import { MetaPill } from "@/components/shared/meta-pill";
import { cn } from "@/lib/utils/cn";
import type { SurfaceStatus } from "@/types/everywhere";

const STATUS_PILL: Record<
  SurfaceStatus,
  { label: string; variant: "green" | "subtle" }
> = {
  live: { label: "Live", variant: "green" },
  stub: { label: "Notify me", variant: "subtle" },
  soon: { label: "Soon", variant: "subtle" },
};

/**
 * SurfaceTile — one ecosystem touchpoint in the Sous Everywhere grid: an icon,
 * a short label, a three-word hint, and a status pill (rule 13: no paragraphs).
 * Renders a <button> when an action is given, else a plain card.
 */
export function SurfaceTile({
  icon: Icon,
  label,
  hint,
  status,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  status: SurfaceStatus;
  onClick?: () => void;
}) {
  const pill = STATUS_PILL[status];
  const className = cn(
    "flex flex-col gap-2.5 rounded-2xl border border-neutral-100 bg-white p-3.5 text-left shadow-sm",
    onClick &&
      "transition active:scale-[0.98] hover:border-[var(--nourish-green)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
  );
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
        >
          <Icon size={18} strokeWidth={1.9} />
        </span>
        <MetaPill variant={pill.variant} size="xs">
          {pill.label}
        </MetaPill>
      </div>
      <div>
        <p className="text-[14px] font-semibold leading-tight text-[var(--nourish-dark)]">
          {label}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-[var(--nourish-subtext)]">
          {hint}
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    );
  }
  return <div className={className}>{body}</div>;
}
