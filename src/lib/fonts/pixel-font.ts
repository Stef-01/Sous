/**
 * Pixel font (pet-room Phase A) — loaded ONLY by the Tamagotchi screen via
 * className, so the bitmap face never leaks into the app's type system.
 * Pixelify Sans stays legible at 10-13px where true 8×8 faces don't.
 */

import { Pixelify_Sans } from "next/font/google";

export const pixelFont = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});
