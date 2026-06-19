"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  UtensilsCrossed,
} from "lucide-react";
import { cravingForNow } from "@/lib/engine/craving-for-now";
import { cn } from "@/lib/utils/cn";

function dateSeed(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/**
 * WallpaperPreview — the hero of /everywhere. Binds to `cravingForNow(local
 * clock)` and renders tonight's craving as a phone-shaped wallpaper card, with
 * a "Save wallpaper" button that downloads `/api/wallpaper/[slug]` sized to the
 * device. Honest: a web app cannot set the OS wallpaper, so the button saves a
 * file and the sub-line says so (the one permitted line of prose, rule 13).
 */
export function WallpaperPreview() {
  const craving = useMemo(() => {
    const d = new Date();
    const r = cravingForNow({
      hour: d.getHours(),
      month: d.getMonth(),
      seed: dateSeed(d),
    });
    return r.success ? r.data : null;
  }, []);

  const [size, setSize] = useState<{ w: number; h: number }>({
    w: 1179,
    h: 2556,
  });

  /* eslint-disable react-hooks/set-state-in-effect -- read the real device pixel size on mount */
  useEffect(() => {
    const dpr = window.devicePixelRatio || 2;
    const w = Math.round((window.screen?.width || 393) * dpr);
    const h = Math.round((window.screen?.height || 852) * dpr);
    setSize({ w, h });
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const shortcutUrl = process.env.NEXT_PUBLIC_SOUS_SHORTCUT_URL;
  const [showSetup, setShowSetup] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!craving) return null;
  const downloadUrl = `/api/wallpaper/${craving.slug}?w=${size.w}&h=${size.h}`;

  // The stable daily URL an iOS Shortcut polls — hour=18 pins the evening
  // "tonight you're making" daypart regardless of when the automation runs.
  const dailyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/wallpaper/today?w=${size.w}&h=${size.h}&hour=18`
      : "";

  const copyDailyUrl = async () => {
    try {
      await navigator.clipboard.writeText(dailyUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the user can long-press the field instead */
    }
  };

  return (
    <div className="space-y-3">
      {/* Phone-shaped wallpaper mockup */}
      <div className="relative mx-auto aspect-[9/19] w-full max-w-[208px] overflow-hidden rounded-[2rem] border border-black/10 shadow-[var(--shadow-raised)]">
        {craving.imageUrl ? (
          <Image
            src={craving.imageUrl}
            alt={craving.name}
            fill
            sizes="208px"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, var(--nourish-green) 0%, var(--nourish-light-green) 45%, #a8d8b9 100%)",
            }}
          />
        )}
        {/* Scrim + caption */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 pb-6 pt-12">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/80">
            Tonight you&rsquo;re making
          </p>
          <p className="font-serif text-[17px] leading-tight text-white">
            {craving.name}
          </p>
        </div>
        {!craving.imageUrl && (
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <UtensilsCrossed
              size={16}
              className="text-white"
              strokeWidth={1.6}
            />
          </div>
        )}
      </div>

      {/* Save (download) — honest: the user sets it themselves. */}
      <a
        href={downloadUrl}
        download={`sous-${craving.slug}.png`}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nourish-green)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--nourish-dark-green)] active:scale-[0.98]"
      >
        <Download size={16} />
        Save wallpaper
      </a>
      <p className="px-1 text-center text-[11px] leading-snug text-[var(--nourish-subtext)]">
        A web app can&rsquo;t set your wallpaper — save it, then pick it in
        Photos.
      </p>

      {/* Auto-set daily (iOS) — disclosure on tap (rule 13). One-tap import
          when the founder publishes the Shortcut; until then a copyable daily
          URL + the 3-step recipe so any user can wire it themselves now. */}
      <div className="rounded-xl border border-neutral-100 bg-white">
        <button
          type="button"
          onClick={() => setShowSetup((s) => !s)}
          aria-expanded={showSetup}
          className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left"
        >
          <span className="text-[13px] font-semibold text-[var(--nourish-dark)]">
            Auto-set it daily (iOS)
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-[var(--nourish-subtext)] transition-transform",
              showSetup && "rotate-180",
            )}
          />
        </button>

        {showSetup && (
          <div className="space-y-3 border-t border-neutral-100 px-3.5 pb-3.5 pt-3">
            {shortcutUrl ? (
              <a
                href={shortcutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--nourish-green)]/10 py-2.5 text-[13px] font-semibold text-[var(--nourish-green)]"
              >
                Get the one-tap Shortcut
              </a>
            ) : null}

            <ol className="space-y-2 text-[12px] leading-snug text-[var(--nourish-subtext)]">
              <li>
                <span className="font-semibold text-[var(--nourish-dark)]">
                  1.
                </span>{" "}
                Shortcuts app → Automation → ＋ → Time of Day (e.g. 7 AM,
                daily).
              </li>
              <li>
                <span className="font-semibold text-[var(--nourish-dark)]">
                  2.
                </span>{" "}
                Add <em>Get Contents of URL</em> → paste the daily link below.
              </li>
              <li>
                <span className="font-semibold text-[var(--nourish-dark)]">
                  3.
                </span>{" "}
                Add <em>Set Wallpaper Photo</em> → Lock Screen. Done.
              </li>
            </ol>

            <button
              type="button"
              onClick={copyDailyUrl}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--nourish-green)]/30 py-2.5 text-[12px] font-semibold text-[var(--nourish-green)] transition hover:bg-[var(--nourish-green)]/5"
            >
              {copied ? (
                <>
                  <Check size={13} strokeWidth={2.5} />
                  Copied the daily link
                </>
              ) : (
                <>
                  <Copy size={13} />
                  Copy the daily link
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
