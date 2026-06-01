import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Gap = "section" | "card" | "row" | "tight";

const GAP: Record<Gap, string> = {
  section: "var(--section-gap)", // 32px between major sections
  card: "var(--card-pad)", // 16px
  row: "var(--row-gap)", // 12px between list rows
  tight: "var(--space-2)", // 8px
};

/**
 * Section — vertical rhythm wrapper. Spacing is chosen from the 8-pt scale via
 * the `gap` prop, never typed as a raw `space-y-N`. Keeps every screen on the
 * same cadence. (planning.md overhaul, acceptance criterion G2)
 */
export function Section({
  children,
  gap = "section",
  className,
  ...rest
}: {
  children: ReactNode;
  gap?: Gap;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col", className)}
      style={{ gap: GAP[gap] }}
      {...rest}
    >
      {children}
    </div>
  );
}
