import type { Metadata } from "next";
import { StartupLanding } from "@/components/marketing/startup-landing";
import { meals, sides } from "@/data";

export const metadata: Metadata = {
  title: "Sous | Make your diet work for you",
  description:
    "Add sides to what you already cook, then layer in chef- and clinician-informed mains. Pairing logic that fits your taste, not another restrictive overhaul.",
  openGraph: {
    title: "Sous | Make your diet work for you",
    description:
      "Gradual, realistic meals: sides first, mains from our library, and a path toward creator-led recipes you trust.",
    siteName: "Sous",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sous | Make your diet work for you",
    description:
      "Gradual, realistic meals: sides first, mains from our library, and a path toward creator-led recipes you trust.",
  },
};

export default function HomePage() {
  return (
    <StartupLanding
      catalogStats={{ meals: meals.length, sides: sides.length }}
    />
  );
}
