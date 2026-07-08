import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./src/lib/config/security-headers";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 430, 768, 1024, 1280],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      // Dev/preview: no headers, so HMR + the live preview iframe are untouched.
      return [];
    }

    // Production Content-Security-Policy. Permissive where a standard Next +
    // React + Framer app genuinely needs it (inline bootstrap/JSON-LD → script
    // 'unsafe-inline'; Framer/Tailwind injected styles → style 'unsafe-inline';
    // camera/photo blobs → img/media blob:+data:), strict where it costs
    // nothing (object-src none, base-uri self, frame-ancestors none). Next's
    // own JS chunks load from 'self', so hydration is unaffected. HTTPS-only
    // transport directives stay deployed-only inside the helper so local
    // `next start` over HTTP remains usable in WebKit e2e.
    const securityHeaders = buildSecurityHeaders();

    return [
      {
        // Security headers on every route.
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Cache static data files aggressively — they only change on deploy.
        source: "/:path*\\.(json|js|css|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
