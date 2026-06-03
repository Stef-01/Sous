import type { NextConfig } from "next";

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
    // own JS chunks load from 'self', so hydration is unaffected.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: https://vitals.vercel-insights.com",
      "media-src 'self' blob: data:",
      "worker-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: csp },
      // Clickjacking: belt-and-suspenders with CSP frame-ancestors.
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      // Camera (food recognition) + microphone (voice cook) are first-party
      // only; geolocation/payment/USB are never used.
      {
        key: "Permissions-Policy",
        value:
          "camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), interest-cohort=()",
      },
    ];

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
