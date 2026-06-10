/**
 * PixelFrame (pet-room Phase A) — the spec's 9-slice bevel panel: dark outer
 * edge, tan frame, notched pixel corners, inner top-left highlight + bottom-
 * right shadow. Three nested layers sharing one corner-cut clip-path (outset
 * box-shadows can't survive clip-path, insets can).
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Classic pixel corner cut (4px notch on every corner). */
const NOTCH =
  "polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))";

export function PixelFrame({
  title,
  children,
  className,
  contentClassName,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div className={cn("bg-[#171310] p-[2px]", className)} style={{ clipPath: NOTCH }}>
      <div className="h-full bg-[#8a6648] p-[2px]" style={{ clipPath: NOTCH }}>
        <div
          className={cn(
            "h-full bg-[#2e2014] p-3 shadow-[inset_1px_1px_0_rgba(244,222,170,0.14),inset_-1px_-1px_0_rgba(0,0,0,0.5)]",
            contentClassName,
          )}
          style={{ clipPath: NOTCH }}
        >
          {title && (
            <p className="pb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#f0d9a0]">
              {title}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
