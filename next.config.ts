import type { NextConfig } from "next";

// Webpack's development runtime evaluates source maps. Keep that allowance
// strictly local: production never receives `unsafe-eval`.
const developmentScriptPolicy =
  process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${developmentScriptPolicy}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://storage.yandexcloud.net https://s3.twcstorage.ru",
  "media-src 'self' blob: https://storage.yandexcloud.net https://s3.twcstorage.ru",
  `connect-src 'self'${process.env.NODE_ENV === "development" ? " ws: http://localhost:1443 http://127.0.0.1:1443" : ""}`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  generateBuildId: async () => {
    const sha = process.env.LIGHTYAR_BUILD_SHA;
    return sha && /^[0-9a-f]{40}$/.test(sha) ? sha : null;
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'swiper'],
  },
  images: {
    qualities: [75, 90],
    ...(process.env.NODE_ENV === 'development' ? { dangerouslyAllowLocalIP: true } : {}),
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.twcstorage.ru",
        pathname: "/424f064a-878c-480c-8980-cdf6c368ff22/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "storage.yandexcloud.net",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "1443",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "1443",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
