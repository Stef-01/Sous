import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Radius = "sm" | "md" | "lg";

const RADIUS: Record<Radius, string> = {
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
};

/**
 * Card — the standard surface. One radius family, one padding, one shadow, so
 * cards read as a single family across the app. Replaces ad-hoc
 * `rounded-[22px]/[26px]/2xl` + per-component padding.
 * (planning.md overhaul, acceptance criterion G3)
 *
 * Depth is the layered `--shadow-card` stack whose first layer is a 0.5px
 * hairline ring (Track E1) — so no explicit border (border + ring = the blocky
 * double-edge Track E removes).
 */
export function Card({
  children,
  radius = "md",
  padded = true,
  className,
  ...rest
}: {
  children: ReactNode;
  radius?: Radius;
  /** Apply the standard 16px card padding. Off for image-forward cards. */
  padded?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white shadow-[var(--shadow-card)]",
        padded && "p-[var(--card-pad)]",
        className,
      )}
      style={{ borderRadius: RADIUS[radius] }}
      {...rest}
    >
      {children}
    </div>
  );
}
