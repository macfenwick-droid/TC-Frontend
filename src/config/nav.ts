import { legalUrls } from "@/config/legal";
import { siteConfig } from "@/config/site";

export type NavLink = { href: string; label: string; external?: boolean };

/** Header links — same set and order as the current site's header. */
export const mainNav: NavLink[] = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/news", label: "News" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: siteConfig.blogUrl, label: "Blog", external: true },
];

/**
 * Shortcut to the seller dashboard in the header, for everyone: signed-out sellers are sent
 * to sign in and then straight back here (RequireAuth's ?redirect).
 */
export const activeSalesLink: NavLink = { href: "/active-sales", label: "Active Sales" };

/** Signed-in account links — same as the current site's account dropdown. */
export const accountNav: NavLink[] = [
  { href: "/active-sales", label: "Active Sales" },
  { href: "/sales", label: "My Sales" },
  { href: "/settings", label: "Settings" },
];

/** Footer columns — same links as the current site's footer. */
export const footerNav = {
  quickLinks: [
    { href: "/sell", label: "Sell Tickets" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/faq", label: "FAQ" },
  ],
  legal: [
    // Opens Termly in a new tab, like the current site.
    { href: legalUrls.privacy, label: "Privacy Policy", external: true },
    { href: legalUrls.terms, label: "Terms of Service", external: true },
  ],
} satisfies Record<string, NavLink[]>;
