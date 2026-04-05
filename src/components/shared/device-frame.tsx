"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type DeviceMode = "phone" | "desktop";

interface DeviceFrameContextValue {
  mode: DeviceMode;
  setMode: (mode: DeviceMode) => void;
}

const DeviceFrameContext = createContext<DeviceFrameContextValue>({
  mode: "phone",
  setMode: () => {},
});

export function useDeviceMode() {
  return useContext(DeviceFrameContext);
}

/**
 * DeviceFrame — wraps the entire app in a phone-shaped container
 * when in "phone" mode (default for development). Provides a floating
 * toggle to switch between phone and desktop layouts.
 *
 * Uses `transform: translateZ(0)` on the content container to create
 * a new containing block for `position: fixed` elements (tab bar,
 * search popout, sticky headers), making them render inside the phone
 * frame instead of relative to the browser viewport.
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DeviceMode>("phone");

  const handleToggle = useCallback(() => {
    setMode((prev) => (prev === "phone" ? "desktop" : "phone"));
  }, []);

  if (mode === "desktop") {
    return (
      <DeviceFrameContext.Provider value={{ mode, setMode }}>
        {/* Floating toggle — bottom-right corner */}
        <DeviceToggle mode={mode} onToggle={handleToggle} />
        {children}
      </DeviceFrameContext.Provider>
    );
  }

  // Phone mode — render inside a phone-shaped frame
  return (
    <DeviceFrameContext.Provider value={{ mode, setMode }}>
      <div className="fixed inset-0 flex items-center justify-center bg-neutral-100 overflow-hidden">
        {/* Phone bezel */}
        <div className="relative" style={{ width: 390, height: 844 }}>
          {/* Phone outer shell */}
          <div
            className="relative overflow-hidden rounded-[3rem] border-[8px] border-neutral-800 bg-neutral-800 shadow-2xl"
            style={{ width: 390, height: 844 }}
          >
            {/* Notch / dynamic island */}
            <div className="absolute top-0 left-1/2 z-[100] -translate-x-1/2">
              <div className="h-[30px] w-[120px] rounded-b-2xl bg-neutral-800" />
            </div>

            {/* Status bar — rendered above the app content */}
            <div className="absolute top-0 left-0 right-0 z-[99] flex items-center justify-between px-8 pt-[8px]">
              <span className="text-[11px] font-semibold text-white select-none">9:41</span>
              <div className="flex items-center gap-1.5">
                {/* Signal bars */}
                <svg width="15" height="10" viewBox="0 0 15 10" className="opacity-80">
                  <rect x="0" y="7" width="2.5" height="3" rx="0.5" fill="white" />
                  <rect x="4" y="4.5" width="2.5" height="5.5" rx="0.5" fill="white" />
                  <rect x="8" y="2" width="2.5" height="8" rx="0.5" fill="white" />
                  <rect x="12" y="0" width="2.5" height="10" rx="0.5" fill="white" opacity="0.35" />
                </svg>
                {/* WiFi */}
                <svg width="14" height="10" viewBox="0 0 14 10" className="opacity-80">
                  <path d="M7 8.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="white" />
                  <path d="M4 6.5a4.5 4.5 0 0 1 6 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <path d="M1.5 4a8 8 0 0 1 11 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                </svg>
                {/* Battery */}
                <svg width="24" height="10" viewBox="0 0 24 10" className="opacity-80">
                  <rect x="0.5" y="0.5" width="20" height="9" rx="2" stroke="white" strokeWidth="1" fill="none" />
                  <rect x="2" y="2" width="14" height="6" rx="1" fill="white" />
                  <path d="M22 3.5v3a1.5 1.5 0 0 0 0-3z" fill="white" opacity="0.4" />
                </svg>
              </div>
            </div>

            {/*
              App content container.
              transform: translateZ(0) on the OUTER wrapper creates a new
              containing block — position:fixed elements (tab bar, modals,
              sticky headers) are positioned relative to this container.
              The INNER div handles scrolling, so fixed elements stay pinned.
            */}
            <div
              className="absolute inset-0 bg-white"
              style={{
                borderRadius: "calc(3rem - 8px)",
                transform: "translateZ(0)",
              }}
            >
              {/* Scrollable content area */}
              <div
                className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-hide"
                style={{ paddingTop: 44 }}
              >
                {children}
              </div>
            </div>

            {/* Home indicator bar */}
            <div className="absolute bottom-[6px] left-1/2 z-[100] -translate-x-1/2">
              <div className="h-[5px] w-[134px] rounded-full bg-white/30" />
            </div>
          </div>
        </div>

        {/* Floating toggle — positioned outside the phone on the page */}
        <DeviceToggle mode={mode} onToggle={handleToggle} />
      </div>
    </DeviceFrameContext.Provider>
  );
}

/**
 * Floating toggle button to switch between phone and desktop modes.
 */
function DeviceToggle({
  mode,
  onToggle,
}: {
  mode: DeviceMode;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "fixed z-[200] flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105",
        mode === "phone"
          ? "bottom-6 right-6"
          : "bottom-4 right-4"
      )}
      type="button"
      title={mode === "phone" ? "Switch to desktop layout" : "Switch to phone layout"}
    >
      {mode === "phone" ? (
        <>
          <Monitor size={18} className="text-[var(--nourish-subtext)]" />
          <span className="text-sm font-medium text-[var(--nourish-dark)]">Desktop</span>
        </>
      ) : (
        <>
          <Smartphone size={18} className="text-[var(--nourish-subtext)]" />
          <span className="text-sm font-medium text-[var(--nourish-dark)]">Phone</span>
        </>
      )}
    </button>
  );
}
