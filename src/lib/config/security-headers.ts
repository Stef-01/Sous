export interface Header {
  key: string;
  value: string;
}

const STRICT_TRANSPORT_SECURITY =
  "max-age=63072000; includeSubDomains; preload";

interface HttpsHeaderEnv {
  VERCEL?: string;
  SOUS_FORCE_HTTPS_HEADERS?: string;
}

/**
 * HSTS and `upgrade-insecure-requests` are correct on deployed HTTPS hosts, but
 * break local `next start` over plain HTTP in WebKit: static assets are upgraded
 * to https://localhost and fail before hydration. Keep local prod/e2e honest,
 * while preserving strict transport headers on Vercel and opt-in self-hosts.
 */
export function shouldUseHttpsOnlyHeaders(
  env: HttpsHeaderEnv = process.env as HttpsHeaderEnv,
): boolean {
  return env.VERCEL === "1" || env.SOUS_FORCE_HTTPS_HEADERS === "1";
}

export function buildSecurityHeaders({
  httpsOnly = shouldUseHttpsOnlyHeaders(),
}: {
  httpsOnly?: boolean;
} = {}): Header[] {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://unpkg.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: https://vitals.vercel-insights.com",
    "media-src 'self' blob: data:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(httpsOnly ? ["upgrade-insecure-requests"] : []),
  ];

  const headers: Header[] = [
    { key: "Content-Security-Policy", value: cspDirectives.join("; ") },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value:
        "camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), interest-cohort=()",
    },
  ];

  if (httpsOnly) {
    headers.push({
      key: "Strict-Transport-Security",
      value: STRICT_TRANSPORT_SECURITY,
    });
  }

  return headers;
}
