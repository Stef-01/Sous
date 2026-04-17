import type { Metadata } from "next";
import { StartupLanding } from "@/components/marketing/startup-landing";

export const metadata: Metadata = {
  title: "Sous — You don't need more recipes",
  description:
    "A small app for home cooks who are tired of the feed. One craving, three sides that belong, and a short cook flow. Sous collapses the distance from saved to cooked.",
  openGraph: {
    title: "Sous — You don't need more recipes",
    description:
      "One main, three pairings, one cook flow. The app for home cooks who are done scrolling.",
    siteName: "Sous",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sous — You don't need more recipes",
    description:
      "One main, three pairings, one cook flow. The app for home cooks who are done scrolling.",
  },
};

export default function HomePage() {
  return <StartupLanding />;
}
