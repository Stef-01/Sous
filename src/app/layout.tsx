import type { Metadata, Viewport } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/providers";
import { AuthProvider } from "@/components/auth-provider";
import { DeviceFrame } from "@/components/shared/device-frame";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { ToastHost } from "@/components/shared/toast-host";
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
  title: "Sous — Cook Confidently Tonight",
  description:
    "Tell Sous what you're craving. Get 3 perfectly paired sides and step-by-step guided cooking — from craving to table in 60 seconds.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://sous.vercel.app",
  ),
  openGraph: {
    title: "Sous — Cook Confidently Tonight",
    description:
      "Tell Sous what you're craving. Get 3 perfectly paired sides and step-by-step guided cooking — from craving to table in 60 seconds.",
    siteName: "Sous",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sous — cooking confidence app with guided recipes and smart side dish pairing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sous — Cook Confidently Tonight",
    description:
      "Tell Sous what you're craving. Get 3 perfectly paired sides and step-by-step guided cooking — from craving to table in 60 seconds.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body
          className={`${inter.variable} ${dmSerif.variable} antialiased font-sans min-h-dvh`}
        >
          <Providers>
            <ErrorBoundary>
              <DeviceFrame>{children}</DeviceFrame>
            </ErrorBoundary>
            <ToastHost />
          </Providers>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </AuthProvider>
  );
}
