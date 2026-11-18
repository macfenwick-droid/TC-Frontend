/**
 * Analytics / ads IDs — same accounts as the current site (sport-spectacle-hub index.html + lib/gtag.ts).
 *
 * Tracking only loads when NEXT_PUBLIC_ENABLE_TRACKING === "true", so local dev and the
 * test deployment don't send fake conversions into Google Ads / TikTok. Turn it on in
 * production at the domain cutover (see PLAN.md §7).
 */
export const trackingConfig = {
  enabled: process.env.NEXT_PUBLIC_ENABLE_TRACKING === "true",

  googleAdsId: "AW-18273584532",
  ga4Id: "G-3ZPCPGJGLW",
  tiktokPixelId: "DAK4FCJC77UES975328G",

  // Google Ads → Goals → Conversions. Value after the slash in send_to.
  conversionLabels: {
    ticketSubmitted: "77BlCOvc98ccEJSLw4lE",
    saleCompleted: "DfDKCO7c98ccEJSLw4lE",
  },
} as const;
