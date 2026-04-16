import type { Metadata } from "next";
import { StartupLanding } from "@/components/marketing/startup-landing";

export const metadata: Metadata = {
  title: "Sous — From feed to fork, with trust",
  description:
    "Sous combines tailored food discovery, weekly planning, pantry-aware recipes, and gap-fill ordering in one flow — with AI systems built for nutrition credibility, including guidance shaped with input from Stanford clinicians.",
  openGraph: {
    title: "Sous — From feed to fork, with trust",
    description:
      "Personal food media meets credible nutrition: one continuous flow from reels to real meals.",
    siteName: "Sous",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sous — From feed to fork, with trust",
    description:
      "Personal food media meets credible nutrition: one continuous flow from reels to real meals.",
  },
};

export default function HomePage() {
  return <StartupLanding />;
}
