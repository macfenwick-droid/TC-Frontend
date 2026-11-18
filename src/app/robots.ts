import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

// Private / per-user pages. They also carry `noindex` metadata on the page itself.
const PRIVATE_PATHS = [
  "/api/",
  "/auth",
  "/reset-password",
  "/thank-you",
  "/offer/",
  "/active-sales",
  "/sales",
  "/settings",
  "/sell/search",
];

export default function robots(): MetadataRoute.Robots {
  // Test / preview deployments: block everything so they never compete with the live site.
  if (!siteConfig.allowIndexing) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE_PATHS }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
