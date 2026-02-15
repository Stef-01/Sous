import type { Metadata, Viewport } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
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
  title: "NOURISH — Meal Pairer",
  description:
    "Find the perfect sides for your favourite meal. Discover culturally appropriate side dishes with beautiful interactive pairing.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://nourish-meal-pairer.vercel.app"
  ),
  openGraph: {
    title: "NOURISH — Meal Pairer",
    description:
      "Discover culturally authentic side dishes for any meal. Visualize balanced plates with the ADA Plate Method.",
    siteName: "NOURISH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOURISH — Meal Pairer",
    description:
      "Discover culturally authentic side dishes for any meal. Visualize balanced plates with the ADA Plate Method.",
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
      </body>
    </html>
  );
}
