"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Images,
  Bell,
  LayoutGrid,
  Monitor,
  Smartphone,
  Watch,
} from "lucide-react";
import { WallpaperPreview } from "@/components/everywhere/wallpaper-preview";
import { SurfaceTile } from "@/components/everywhere/surface-tile";
import { NotifyMeRow } from "@/components/everywhere/notify-me-row";

/**
 * /everywhere — the "Sous Everywhere" showcase. Advertises every way Sous shows
 * up in a user's life: the genuinely-buildable PWA surfaces are LIVE (the
 * dynamic wallpaper, the rotating gallery, today's craving), and the
 * founder-gated ones (push, native widget, watch) are honest "notify me" cards
 * over the existing push env contract. Reached only from the owl profile sheet
 * (rule 3); a sub-surface, no bottom nav.
 */
export default function EverywherePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-full flex-col bg-[var(--nourish-cream)] pb-16">
      <header className="page-x flex items-center gap-2 pt-5">
        <button
          type="button"
          onClick={() => router.push("/today")}
          aria-label="Back to Today"
          className="-ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--nourish-dark)] transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="sous-label text-[var(--nourish-green)]">
            Sous everywhere
          </p>
          <h1 className="font-serif text-2xl leading-tight text-[var(--nourish-dark)]">
            Crave it on every screen
          </h1>
        </div>
      </header>

      <main className="page-x mt-5 space-y-6">
        <WallpaperPreview />

        <section className="space-y-3">
          <h2 className="sous-label text-[var(--nourish-subtext)]">
            More places Sous shows up
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <SurfaceTile
              icon={Images}
              label="Craving gallery"
              hint="Full-screen, rotating."
              status="live"
              onClick={() => router.push("/everywhere/gallery")}
            />
            <SurfaceTile
              icon={LayoutGrid}
              label="The Today deck"
              hint="Where cravings live."
              status="live"
              onClick={() => router.push("/today")}
            />
            <SurfaceTile
              icon={Monitor}
              label="Desktop gallery"
              hint="Pin it on your Mac."
              status="live"
              onClick={() => router.push("/everywhere/gallery")}
            />
            <NotifyMeRow
              icon={Bell}
              label="Hunger-window nudge"
              hint="A ping at dinnertime."
              surfaceId="push"
            />
            <NotifyMeRow
              icon={Smartphone}
              label="Home-screen widget"
              hint="Glance, then cook."
              surfaceId="home-widget"
            />
            <NotifyMeRow
              icon={Watch}
              label="Apple Watch"
              hint="Tonight, on your wrist."
              surfaceId="watch"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
