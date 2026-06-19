"use client";

import { useEffect, useState } from "react";
import { Check, type LucideIcon } from "lucide-react";
import { MetaPill } from "@/components/shared/meta-pill";
import { usePushSubscription } from "@/lib/hooks/use-push-subscription";

const INTENT_KEY = "sous-everywhere-notify-v1";

function readIntents(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(INTENT_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr)
      ? new Set(arr.filter((x) => typeof x === "string"))
      : new Set();
  } catch {
    return new Set();
  }
}

/**
 * NotifyMeRow — the honest card for a founder-gated surface (push, native
 * widget, watch). Today push is dormant (no VAPID), so tapping records intent
 * locally and the copy is truthful: we'll nudge in-app until OS push ships. The
 * moment VAPID lands, `usePushSubscription` flips to `ready` and the same tap
 * subscribes for real — no UI change. It NEVER shows a fake "on" state.
 */
export function NotifyMeRow({
  icon: Icon,
  label,
  hint,
  surfaceId,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  surfaceId: string;
}) {
  const { status, subscribe } = usePushSubscription();
  const [opted, setOpted] = useState(false);

   
  useEffect(() => {
    setOpted(readIntents().has(surfaceId));
  }, [surfaceId]);
   

  const handle = async () => {
    if (status === "ready") await subscribe();
    try {
      const next = readIntents();
      next.add(surfaceId);
      window.localStorage.setItem(INTENT_KEY, JSON.stringify([...next]));
    } catch {
      /* private mode / quota — intent is best-effort */
    }
    setOpted(true);
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-neutral-100 bg-white p-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
        >
          <Icon size={18} strokeWidth={1.9} />
        </span>
        <MetaPill variant="subtle" size="xs">
          {status === "ready" ? "Enable" : "Soon"}
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
      <button
        type="button"
        onClick={handle}
        disabled={opted}
        aria-pressed={opted}
        className={
          opted
            ? "inline-flex items-center gap-1.5 self-start rounded-full bg-[var(--nourish-green)]/10 px-3 py-1.5 text-[12px] font-semibold text-[var(--nourish-green)]"
            : "inline-flex items-center gap-1.5 self-start rounded-full border border-[var(--nourish-green)]/30 px-3 py-1.5 text-[12px] font-semibold text-[var(--nourish-green)] transition hover:bg-[var(--nourish-green)]/5"
        }
      >
        {opted ? (
          <>
            <Check size={13} strokeWidth={2.5} />
            On the list
          </>
        ) : (
          "Notify me"
        )}
      </button>
    </div>
  );
}
