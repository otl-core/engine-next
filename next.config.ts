import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  transpilePackages: ["@otl-core/block-registry", "@otl-core/section-registry"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  headers: async () => [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      headers: [
        {
          key: "Cache-Control",
          value: `public, s-maxage=${process.env.CDN_CACHE_SECONDS || "60"}, stale-while-revalidate=${process.env.CDN_SWR_SECONDS || "300"}`,
        },
      ],
    },
  ],
};

export default nextConfig;
