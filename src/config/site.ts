/**
 * Site-wide facts. Copy here comes from the current site (sport-spectacle-hub) —
 * change only with the owner's OK, it is business content.
 */

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ticketcricket.co").replace(/\/+$/, "");

export const siteConfig = {
  name: "TicketCricket",
  url: siteUrl,
  // Verbatim from the current site's index.html (secondary-market disclosure).
  description:
    "TicketCricket is a secondary ticket marketplace. Prices are set by sellers and may be above or below face value.",
  twitterHandle: "@TicketCricket",
  logo: "/logo.png",

  contact: {
    phone: "253-213-0319",
    phoneHref: "tel:+12532130319",
    location: "Seattle, WA",
    generalEmail: "general@ticketcricket.co",
    transfersEmail: "transfers@ticketcricket.co",
  },

  /** New Trustpilot badge only. Existing "4.9" seller ratings from the current site stay as-is. */
  trustpilot: {
    url: "https://www.trustpilot.com/review/ticketcricket.co",
    rating: 4.5,
  },

  sellerRating: "4.9",

  blogUrl: "https://blogs.ticketcricket.co/",

  /** Off unless explicitly enabled, so test deployments never get indexed. */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
} as const;

export type SiteConfig = typeof siteConfig;
