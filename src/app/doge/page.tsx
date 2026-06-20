"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { DogeHealthPanel } from "@/components/doge/doge-health-panel";
import {
  SousBridge,
  creditCheckinGold,
  sayPendingCookFact,
  sayAmbientFact,
} from "@/lib/doge/sous-bridge";

/**
 * /doge — the Doberman virtual-pet game (Track A prototype). Mounts the vendored
 * game (CC BY-NC-SA code + author-permitted assets) in an iframe inside the Sous
 * DeviceFrame; the pet is reskinned to a Doberman.
 *
 * The game lives at /tamaweb/ (public/tamaweb/). A SousBridge is mounted here to
 * carry the typed postMessage protocol (gold credits, dish grants, fun-fact
 * speech) between Sous and the embedded game — see src/lib/doge/bridge-protocol.ts
 * and docs/DOGE-INTEGRATION-PLAN.md. If the bundle is somehow absent we show a
 * calm hint instead of a broken frame.
 *
 * Attribution (CC BY-NC-SA 4.0 + Tamaweb Terms of Use): the engine is
 * autosam/Tamaweb (https://github.com/autosam/Tamaweb). Reskinned to a Doberman;
 * embedded in a Next.js shell. See docs/TAMAWEB-PERMISSION.md + docs/DOGE-GAME-PLAN.md.
 */
export default function DogePage() {
  const router = useRouter();
  const [present, setPresent] = useState<boolean | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Probe whether the vendored bundle exists. HEAD avoids downloading the page.
    let alive = true;
    fetch("/tamaweb/index.html", { method: "HEAD" })
      .then((r) => alive && setPresent(r.ok))
      .catch(() => alive && setPresent(false));
    return () => {
      alive = false;
    };
  }, []);

  // Mount the Sous↔Doge bridge once. It listens on window for the game's
  // `doge:ready` handshake (resolving the iframe lazily), so construction order
  // vs. iframe load doesn't matter; it tears down on unmount.
  useEffect(() => {
    let factTimer: ReturnType<typeof setInterval> | null = null;
    const bridge = new SousBridge(() => iframeRef.current, {
      onReady: () => {
        // A beat after the dog settles in, share a fact about the last cook
        // (nutrition or food history), then an ambient one every few minutes.
        setTimeout(() => sayPendingCookFact(bridge), 2500);
        factTimer = setInterval(() => sayAmbientFact(bridge), 5 * 60 * 1000);
      },
    });
    // Engagement → money: opening Doge counts as the daily check-in (idempotent
    // per calendar day). The credit rides the same outbox the bridge flushes on
    // doge:ready, so it lands as soon as the game handshakes.
    creditCheckinGold();
    return () => {
      if (factTimer) clearInterval(factTimer);
      bridge.destroy();
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
            Doge isn&rsquo;t available here
          </p>
          <p className="text-[13px] leading-relaxed">
            The game bundle isn&rsquo;t present in this build. Expected at{" "}
            <code className="rounded bg-white/15 px-1">public/tamaweb/</code>.
            See{" "}
            <code className="rounded bg-white/15 px-1">
              docs/DOGE-INTEGRATION-PLAN.md
            </code>
            .
          </p>
        </div>
      ) : (
        <>
          <iframe
            ref={iframeRef}
            src="/tamaweb/index.html"
            title="Doge — Doberman virtual pet"
            className="h-full w-full border-0"
            // The game manages its own audio/fullscreen; allow what it needs.
            allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
          />
          {/* The nutrition system, attached to the game: real food/water → Dobe's
              health stats, overlaid on the home screen. See DOGE-PET-DASHBOARD-PLAN.md. */}
          <DogeHealthPanel />
        </>
      )}
    </div>
  );
}
