import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * InlineError (E4) — the shared inline error treatment for fields + actions: a
 * quiet rose line with an icon, `role="alert"` so assistive tech announces it.
 * Use it under an input or beside an action that failed; toasts stay for
 * transient background events, not validation. Renders nothing when empty, so
 * callers can pass a possibly-undefined message unconditionally.
 */
export function InlineError({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={cn(
        "flex items-center gap-1.5 text-[12px] font-medium text-rose-600",
        className,
      )}
    >
      <AlertCircle size={13} className="shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
