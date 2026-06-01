import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Screen — the outer page frame. Owns full height, the brand surface, and
 * (optionally) bottom clearance for the fixed nav. Headers render full-bleed
 * inside it; guttered content goes in <PageContainer>.
 *
 * Part of the reference-driven overhaul (planning.md): every page composes
 * Screen + PageContainer so the 20px rail and safe-areas can never drift.
 */
export function Screen({
  children,
  className,
  surface = true,
  navClearance = false,
}: {
  children: ReactNode;
  className?: string;
  /** Brand cream background. Pass false for custom surfaces (e.g. camera). */
  surface?: boolean;
  /** Reserve space at the bottom so content clears the fixed bottom nav. */
  navClearance?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-h-dvh w-full",
        surface && "bg-[var(--nourish-cream)]",
        navClearance && "pb-[calc(env(safe-area-inset-bottom,0px)+5rem)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * PageContainer — THE page rail. The single source of the 20px horizontal
 * gutter + centered mobile column. Nothing should hand-roll
 * `mx-auto max-w-md px-4` anymore.
 */
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("app-shell w-full page-x", className)}>{children}</div>
  );
}
