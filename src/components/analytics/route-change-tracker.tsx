"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureGclidFromUrl } from "@/lib/attribution";
import { trackPageView } from "@/lib/gtag";

/**
 * Sends a GA4 page_view on every route change (initial load included) and captures
 * `?gclid=` once on landing. Must sit inside <Suspense> (useSearchParams).
 */
export function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureGclidFromUrl();
  }, []);

  useEffect(() => {
    const qs = searchParams.toString();
    trackPageView(pathname + (qs ? `?${qs}` : ""));
  }, [pathname, searchParams]);

  return null;
}
