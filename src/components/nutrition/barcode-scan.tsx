"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import type { BrandedFood } from "@/lib/nutrition/branded-food";
import { diaryLogBranded } from "@/lib/hooks/use-nutrition-diary";
import { haptic } from "@/lib/motion/haptics";

/** Minimal BarcodeDetector typing (not yet in lib.dom everywhere). */
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (opts?: {
  formats?: string[];
}) => BarcodeDetectorLike;

function getBarcodeDetector(): BarcodeDetectorCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { BarcodeDetector?: BarcodeDetectorCtor };
  return w.BarcodeDetector ?? null;
}

/**
 * BarcodeScan (#14) — point the camera at a package (BarcodeDetector where the
 * browser has it; a manual code field everywhere) → Open Food Facts lookup via
 * our proxy (same mapper as search, so scanned == searched) → one-tap log.
 */
export function BarcodeScan({ date }: { date?: Date }) {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [found, setFound] = useState<BrandedFood | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const Detector = getBarcodeDetector();

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  };
  useEffect(() => stop, []);

  const lookup = async (code: string) => {
    setStatus("Looking up…");
    try {
      const res = await fetch(
        `/api/branded-food/barcode?code=${encodeURIComponent(code)}`,
      );
      const data = (await res.json()) as {
        food: BrandedFood | null;
        error?: string;
      };
      if (data.food) {
        haptic("select");
        setFound(data.food);
        setStatus(null);
      } else {
        setStatus(data.error ?? "No product found.");
      }
    } catch {
      setStatus("Lookup failed — try again.");
    }
  };

  const startScan = async () => {
    if (!Detector) return;
    setStatus(null);
    setFound(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setScanning(true);
      // attach on next frame once the <video> exists
      requestAnimationFrame(async () => {
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        const detector = new Detector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e"],
        });
        const tick = async () => {
          if (!streamRef.current) return;
          try {
            const codes = await detector.detect(video);
            const code = codes[0]?.rawValue;
            if (code) {
              stop();
              await lookup(code);
              return;
            }
          } catch {
            // detection hiccup — keep polling
          }
          setTimeout(tick, 150);
        };
        tick();
      });
    } catch {
      setStatus("Camera unavailable — type the code instead.");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Detector && !scanning && (
          <button
            type="button"
            onClick={startScan}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/50 active:scale-[0.97]"
          >
            <Camera size={13} className="text-[var(--nourish-green)]" />
            Scan barcode
          </button>
        )}
        <input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && manualCode.length >= 8) lookup(manualCode);
          }}
          inputMode="numeric"
          placeholder="…or type the code"
          aria-label="Barcode number"
          className="min-w-0 flex-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] text-[var(--nourish-dark)] outline-none placeholder:text-[var(--nourish-subtext-faint)] focus:border-[var(--nourish-green)]/50"
        />
        {manualCode.length >= 8 && (
          <button
            type="button"
            onClick={() => lookup(manualCode)}
            className="rounded-full bg-[var(--nourish-green)] px-3 py-1.5 text-[12px] font-semibold text-white active:scale-[0.97]"
          >
            Look up
          </button>
        )}
      </div>

      {scanning && (
        <div className="relative overflow-hidden rounded-xl border border-neutral-200">
          {}
          <video ref={videoRef} className="h-44 w-full object-cover" muted />
          <button
            type="button"
            onClick={stop}
            aria-label="Stop scanning"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {status && (
        <p className="text-[12px] text-[var(--nourish-subtext)]">{status}</p>
      )}

      {found && (
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
          <span className="min-w-0 flex-1 text-[13px] text-[var(--nourish-dark)]">
            <span className="font-semibold">{found.name}</span>
            {found.brand && (
              <span className="text-[var(--nourish-subtext-faint)]">
                {" "}
                · {found.brand}
              </span>
            )}
            {typeof found.nutrition.calories === "number" && (
              <span className="text-[var(--nourish-subtext)]">
                {" "}
                · {Math.round(found.nutrition.calories)} kcal
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => {
              haptic("commit");
              diaryLogBranded(found, 1, { date });
              setFound(null);
              setManualCode("");
            }}
            className="shrink-0 rounded-full bg-[var(--nourish-green)] px-3 py-1.5 text-[12px] font-semibold text-white active:scale-[0.97]"
          >
            Log it
          </button>
        </div>
      )}
    </div>
  );
}
