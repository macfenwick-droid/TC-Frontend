import { trackingConfig } from "@/config/tracking";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const { googleAdsId: GOOGLE_ADS_ID, ga4Id: GA4_ID, conversionLabels: CONVERSION_LABELS } = trackingConfig;

type ConversionParams = {
  value?: number;
  currency?: string;
  transactionId?: string;
};

const reportConversion = (label: string, params: ConversionParams = {}) => {
  if (typeof window === "undefined" || !window.gtag || !label || label.startsWith("REPLACE_WITH")) return;
  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${label}`,
    ...(params.value !== undefined ? { value: params.value } : {}),
    ...(params.currency ? { currency: params.currency } : {}),
    ...(params.transactionId ? { transaction_id: params.transactionId } : {}),
  });
};

export const googleAds = {
  // Fired when a seller submits tickets to sell (the /thank-you flow).
  ticketSubmitted: (params?: ConversionParams) => reportConversion(CONVERSION_LABELS.ticketSubmitted, params),
  // Fired when a seller accepts an offer — the completed sale.
  saleCompleted: (params?: ConversionParams) => reportConversion(CONVERSION_LABELS.saleCompleted, params),
};

type EnhancedConversionUser = {
  email?: string | null;
  phone_number?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

// Enhanced conversions: attach the signed-in user's info to the next conversion so
// Google can match it to a Google account and improve attribution. Call this right
// BEFORE firing a conversion (e.g. googleAds.ticketSubmitted()). gtag hashes these
// values itself — pass them in plain text, never pre-hashed. Only fields we actually
// have are sent; we don't collect the seller's street/city/postal code, so those are
// omitted (email alone is the strongest match signal).
export const setUserData = (u: EnhancedConversionUser) => {
  if (typeof window === "undefined" || !window.gtag) return;

  const address: Record<string, string> = {};
  if (u.first_name) address.first_name = u.first_name;
  if (u.last_name) address.last_name = u.last_name;

  const userData: Record<string, unknown> = {};
  if (u.email) userData.email = u.email.trim().toLowerCase();
  if (u.phone_number) userData.phone_number = u.phone_number.trim();
  if (Object.keys(address).length > 0) userData.address = address;

  if (Object.keys(userData).length === 0) return;
  window.gtag("set", "user_data", userData);
};

// Sends a GA4 page_view on client-side navigations. GA4's automatic page_view is
// disabled (see TrackingScripts), so the RouteChangeTracker sends one per route change.
export const trackPageView = (path: string) => {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "page_view", {
    send_to: GA4_ID,
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
};
