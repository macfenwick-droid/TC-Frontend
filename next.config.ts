import path from "node:path";
import type { NextConfig } from "next";
import { apiProxyTarget } from "./src/config/backend";
import { legalUrls } from "./src/config/legal";

// FastAPI backend. Browser calls go to same-origin `/api/*` and are proxied here, so the
// backend's httpOnly auth cookies stay first-party (same as vercel.json in the old app).
const API_PROXY_TARGET = apiProxyTarget();

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    // Pin the root: a stray package-lock.json in a parent dir would otherwise be picked.
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
    ];
  },

  async redirects() {
    return [
      // Legacy offer sub-pages from the old app were never wired to the backend.
      // Accept/reject lives on /offer/:token, so send any old link there.
      {
        source: "/offer/:token/:step(accept|transfer|confirm|payment|complete)",
        destination: "/offer/:token",
        permanent: false,
      },
      // Privacy Policy and Terms live on Termly (the old app opened them from these routes).
      { source: "/privacy", destination: legalUrls.privacy, permanent: false },
      { source: "/terms", destination: legalUrls.terms, permanent: false },
    ];
  },
};

export default nextConfig;
