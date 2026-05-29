"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * EmptyStateCTA — dashed-border card with centered icon, primary
 * line, helper line, and a green-pill CTA.
 *
 * Used codebase-wide on path/pantry, path/shopping-list,
 * path/favorites, and the forum empty-replies state. Codified from
 * `docs/design-tokens.md`.
 *
 * The CTA is a link by default (server-friendly). For onClick
 * behaviour pass `href={null}` and `onCtaClick`.
 */

interface CommonProps {
  icon: LucideIcon;
  iconSize?: number;
  primary: string;
  helper?: string;
  cta?: { label: string };
  className?: string;
}

interface LinkProps extends CommonProps {
  href: string;
  onCtaClick?: never;
}

interface ButtonProps extends CommonProps {
  href?: null;
  onCtaClick: () => void;
}

type Props = LinkProps | ButtonProps;

export function EmptyStateCTA(props: Props) {
  const { icon: Icon, iconSize = 22, primary, helper, cta, className } = props;

  const ctaButton = cta && (
    <CtaPill
      label={cta.label}
      href={"href" in props && props.href ? props.href : null}
      onClick={"onCtaClick" in props ? props.onCtaClick : undefined}
    />
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-neutral-200 bg-white/60 px-5 py-7 text-center",
        className,
      )}
      role="status"
    >
      <Icon
        size={iconSize}
        className="mx-auto mb-2 text-[var(--nourish-subtext)]"
        aria-hidden
      />
      <p className="text-sm font-medium text-[var(--nourish-dark)]">
        {primary}
      </p>
      {helper && (
        <p className="mx-auto mt-1 max-w-[260px] text-xs text-[var(--nourish-subtext)]">
          {helper}
        </p>
      )}
      {ctaButton && <div className="mt-4">{ctaButton}</div>}
    </div>
  );
}

function CtaPill({
  label,
  href,
  onClick,
}: {
  label: string;
  href: string | null;
  onClick?: () => void;
}) {
  const className =
    "inline-flex items-center gap-1.5 rounded-full bg-[var(--nourish-green)] px-4 py-2 text-xs font-semibold text-white transition-transform active:scale-[0.97]";
  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  );
}
