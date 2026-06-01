import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * FloatingLayer — the single contract for anything that floats over content
 * (sticky CTAs, FABs, toasts, the meal-plan pill). Applies the page rail +
 * `--float-inset` + bottom safe-area so a floating element can NEVER touch a
 * screen edge or the nav again. (planning.md overhaul, acceptance criterion G4)
 *
 * The outer layer is pointer-events-none so it doesn't trap taps on content
 * behind it; the inner content re-enables pointer events.
 */
export function FloatingLayer({
  children,
  className,
  z = 40,
}: {
  children: ReactNode;
  className?: string;
  /** z-index; default sits above content, below modals. */
  z?: number;
}) {
  return (
    <div
      style={{ zIndex: z }}
      className="pointer-events-none fixed inset-x-0 bottom-0 app-shell w-full page-x pb-[calc(env(safe-area-inset-bottom,0px)+var(--float-inset))]"
    >
      <div className={cn("pointer-events-auto", className)}>{children}</div>
    </div>
  );
}
