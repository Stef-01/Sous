"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

/**
 * /doge — the Doberman virtual-pet game (Track A prototype). Mounts the vendored
 * Tamaweb game (CC BY-NC-SA code + author-permitted assets) in a sandboxed
 * iframe inside the Sous DeviceFrame; the pet is reskinned to a Doberman.
 *
 * The game lives at /tamaweb/ (public/tamaweb/, git-ignored — it does NOT ship in
 * this public repo until the written permission is documented in
 * docs/TAMAWEB-PERMISSION.md). If the asset bundle isn't present, we show a calm
 * "vendor it" hint instead of a broken frame, so the route is safe to commit now.
 *
 * Attribution (CC BY-NC-SA 4.0 + Tamaweb Terms of Use): the engine is
 * autosam/Tamaweb (https://github.com/autosam/Tamaweb). Reskinned to a Doberman;
 * embedded in a Next.js shell. See docs/TAMAWEB-PERMISSION.md + docs/DOGE-GAME-PLAN.md.
 */
export default function DogePage() {
  const router = useRouter();
  const [present, setPresent] = useState<boolean | null>(null);

  useEffect(() => {
    // Probe whether the vendored bundle exists (it's git-ignored, so a fresh
    // clone won't have it). HEAD avoids downloading the page.
    let alive = true;
    fetch("/tamaweb/index.html", { method: "HEAD" })
      .then((r) => alive && setPresent(r.ok))
      .catch(() => alive && setPresent(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="relative flex h-[100dvh] flex-col bg-black">
      <button
        type="button"
        onClick={() => router.push("/today")}
        aria-label="Back to Today"
        className="absolute left-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <ArrowLeft size={20} />
      </button>

      {present === false ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center text-white/80">
          <p className="font-serif text-xl text-white">
            Doge isn&rsquo;t vendored here
          </p>
          <p className="text-[13px] leading-relaxed">
            The game bundle is git-ignored and not in this clone. Drop the
            author-permitted Tamaweb build into{" "}
            <code className="rounded bg-white/15 px-1">public/tamaweb/</code> to
            play. See{" "}
            <code className="rounded bg-white/15 px-1">
              docs/TAMAWEB-PERMISSION.md
            </code>
            .
          </p>
        </div>
      ) : (
        <iframe
          src="/tamaweb/index.html"
          title="Doge — Doberman virtual pet"
          className="h-full w-full border-0"
          // The game manages its own audio/fullscreen; allow what it needs.
          allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
        />
      )}
    </div>
  );
}
