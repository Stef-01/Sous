"use client";

/**
 * DeadEndShell — load-bearing safety net for terminal empty /
 * error / not-found screens.
 *
 * RCA (2026-05-04): the cook empty state ("Cook steps coming
 * soon") rendered as a bare centered <div> with `min-h-full`
 * and a single CTA button. On real mobile, `min-h-full` can
 * collapse (DeviceFrame strips its scroll container, html/body
 * height is variable through the iOS visual-viewport
 * collapse), and a single CTA is fragile — any click race
 * (page-transition spring still mounting, hydration mid-flight,
 * pointer-events stuck) leaves the user stranded with no other
 * escape. This shell guarantees:
 *
 *   1. **Always-visible top-left back button** — fixed-position,
 *      `z-[80]`, escapes via `router.back()` or `/today`
 *      fallback. Independent of the body CTA.
 *   2. **`min-h-dvh`** — dynamic viewport height so the layout
 *      survives keyboard collapse / device-frame stripping.
 *   3. **Safe-area-aware padding** so content sits above the iOS
 *      home indicator and below the dynamic island.
 *   4. **Body CTA + secondary text-link** — never just a single
 *      button. The text-link routes to `/today` directly so even
 *      if the primary CTA's onClick fails, the link is a real
 *      anchor and works on any browser.
 *
 * Use this for EVERY error / empty / not-found terminal state.
 * Lint rule: `sous/no-orphan-empty-state` (added 2026-05-04)
 * forbids `min-h-full flex items-center justify-center` with a
 * single button — it points at this shell.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DeadEndShellProps {
  /** Headline (e.g. "Cook steps coming soon", "Couldn't load
   *  the recipe"). Required. */
  title: string;
  /** Body copy. 1-2 sentences max. */
  body?: string;
  /** Visual icon at the top of the content stack. Defaults
   *  to a chef-hat. */
  Icon?: LucideIcon;
  /** Primary CTA — when omitted, the shell still ships a
   *  "Back to Today" link. */
  primary?: {
    label: string;
    onClick: () => void;
  };
  /** Optional secondary CTA (text-link styling). */
  secondary?: {
    label: string;
    onClick: () => void;
  };
  /** Background tone — defaults to nourish-cream. */
  bgClassName?: string;
}

export function DeadEndShell({
  title,
  body,
  Icon,
  primary,
  secondary,
  bgClassName,
}: DeadEndShellProps) {
  const router = useRouter();
  const handleBack = () => {
    // Try router.back() first; if the history is empty (e.g.
    // direct entry via a deep-link), fall through to /today.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/today");
  };

  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col bg-[var(--nourish-cream)]",
        bgClassName,
      )}
      style={{
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      {/* Always-visible escape — top-left back button. Fixed so
          it never scrolls out, never depends on body content
          height, and never fights the body CTA for clicks. */}
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        className="fixed left-4 top-4 z-[80] inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-[var(--nourish-dark)] shadow-sm transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
        style={{
          top: "max(0.75rem, env(safe-area-inset-top))",
        }}
      >
        <ArrowLeft size={18} aria-hidden />
      </button>

      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        {Icon ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--nourish-green)]/10">
            <Icon
              size={24}
              className="text-[var(--nourish-green)]"
              strokeWidth={1.8}
              aria-hidden
            />
          </div>
        ) : null}
        <div className="space-y-1.5">
          <h1 className="font-serif text-base font-semibold text-[var(--nourish-dark)]">
            {title}
          </h1>
          {body && (
            <p className="max-w-[260px] text-sm text-[var(--nourish-subtext)]">
              {body}
            </p>
          )}
        </div>

        {primary && (
          <button
            type="button"
            onClick={primary.onClick}
            className="rounded-xl bg-[var(--nourish-green)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--nourish-dark-green)] active:scale-95"
          >
            {primary.label}
          </button>
        )}

        {secondary && (
          <button
            type="button"
            onClick={secondary.onClick}
            className="text-sm font-medium text-[var(--nourish-subtext)] underline-offset-4 hover:underline"
          >
            {secondary.label}
          </button>
        )}

        {/* Hard fallback: a real <Link> anchor that ALWAYS works,
            even if every button onClick is broken by a JS race or
            pointer-events bug. This is the load-bearing safety
            net — never remove it. */}
        <Link
          href="/today"
          prefetch
          className="text-xs text-[var(--nourish-subtext)]/80 underline underline-offset-4 hover:text-[var(--nourish-green)]"
        >
          Or jump to Today
        </Link>
      </main>
    </div>
  );
}
