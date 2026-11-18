import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

// Public, indexable pages only. Account, offer and auth pages are disallowed in robots.ts.
const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/sell", priority: 0.9, changeFrequency: "monthly" },
  { path: "/sell-season-tickets", priority: 0.8, changeFrequency: "monthly" },
  { path: "/how-it-works", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/news", priority: 0.5, changeFrequency: "daily" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteConfig.url}${path === "/" ? "" : path}`,
    changeFrequency,
    priority,
  }));
}
