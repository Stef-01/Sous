import type { Metadata, Viewport } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Sous — Meal Explorer",
  description:
    "Find the perfect sides for your favourite meal. Discover culturally appropriate side dishes with beautiful interactive pairing.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://sous.vercel.app"
  ),
  openGraph: {
    title: "Sous — Meal Explorer",
    description:
      "Discover culturally authentic side dishes for any meal. Visualize balanced plates with the ADA Plate Method.",
    siteName: "Sous",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sous — ADA Plate Method visualization with culturally diverse foods",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sous — Meal Explorer",
    description:
      "Discover culturally authentic side dishes for any meal. Visualize balanced plates with the ADA Plate Method.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.variable} antialiased font-sans min-h-dvh`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
