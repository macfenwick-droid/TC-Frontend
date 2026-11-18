// Captures the Google Click Identifier (gclid) from the landing URL and stores it
// so it can be attached to a lead when the user later submits a sell form.
//
// We use a first-party COOKIE scoped to the registrable domain (e.g. ".ticketcricket.co")
// rather than localStorage, because:
//   - it is shared across www and non-www (localStorage is per-exact-origin), and
//   - it survives the sign-in OAuth redirect round trip (which can change origin).
// Complements the Google tag setup in src/lib/gtag.ts.

const GCLID_COOKIE = "tc_gclid";
// Google accepts offline conversions for a click up to ~90 days old.
const GCLID_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

// Returns "; domain=.ticketcricket.co" so www and non-www share the cookie.
// Omits the domain attribute on localhost / single-label hosts, and on *.vercel.app
// test deployments (vercel.app is a public suffix, so browsers reject a cookie scoped
// to it and the gclid would be lost).
const cookieDomainAttr = (): string => {
  const host = window.location.hostname;
  const parts = host.split(".");
  if (host === "localhost" || parts.length < 2 || host.endsWith(".vercel.app")) return "";
  return `; domain=.${parts.slice(-2).join(".")}`;
};

// Run once on app load: if the URL has a ?gclid=..., persist it (survives navigation,
// www/non-www redirects, and the sign-in round trip).
export const captureGclidFromUrl = (): void => {
  try {
    const gclid = new URLSearchParams(window.location.search).get("gclid");
    if (!gclid) return;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      `${GCLID_COOKIE}=${encodeURIComponent(gclid)}` +
      `; Max-Age=${GCLID_MAX_AGE_SECONDS}; Path=/${cookieDomainAttr()}; SameSite=Lax${secure}`;
  } catch {
    // Cookies may be unavailable/blocked — safe to ignore.
  }
};

// Returns the stored gclid, or null. (The browser auto-expires the cookie after ~90 days.)
export const getStoredGclid = (): string | null => {
  try {
    const match = document.cookie.match(/(?:^|;\s*)tc_gclid=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};
