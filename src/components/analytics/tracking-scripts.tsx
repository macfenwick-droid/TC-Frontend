import Script from "next/script";
import { trackingConfig } from "@/config/tracking";

const { googleAdsId, ga4Id, tiktokPixelId } = trackingConfig;

// Same snippets the current site has inline in index.html.
const gtagInit = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${googleAdsId}');
gtag('config', '${ga4Id}', { send_page_view: false });
`;

const tiktokInit = `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('${tiktokPixelId}');
  ttq.page();
}(window, document, 'ttq');
`;

/**
 * Inline init stubs for <head>: define `window.gtag` / `window.ttq` before hydration so
 * the first GA4 page_view and any early events are queued, exactly like the old
 * index.html. Server-rendered plain scripts (no next/script needed for tiny inline code).
 */
export function TrackingHeadScripts() {
  if (!trackingConfig.enabled) return null;

  return (
    <>
      <script id="gtag-init" dangerouslySetInnerHTML={{ __html: gtagInit }} />
      <script id="tiktok-pixel" dangerouslySetInnerHTML={{ __html: tiktokInit }} />
    </>
  );
}

/** The gtag.js library itself; loads after hydration. Renders nothing unless enabled. */
export function TrackingScripts() {
  if (!trackingConfig.enabled) return null;

  return (
    <Script
      id="gtag-lib"
      src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
      strategy="afterInteractive"
    />
  );
}
