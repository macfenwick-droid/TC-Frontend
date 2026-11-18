import Link from "next/link";
import { cacheLife } from "next/cache";
import { MapPin, Phone } from "lucide-react";
import { Container } from "@/components/brand/container";
import { Logo } from "@/components/brand/logo";
import { TrustpilotBadge } from "@/components/brand/trustpilot-badge";
import { footerNav } from "@/config/nav";
import { siteConfig } from "@/config/site";

// Reading the clock during prerender needs a cache boundary under Cache Components.
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const columnTitle = "text-[13px] font-bold tracking-[0.14em] text-brand uppercase";
// min-h-6: 24px tap targets (WCAG 2.5.8).
const footerLink = "inline-flex min-h-6 items-center text-white/80 transition-colors hover:text-brand";

// Same categories the current site lists in its footer.
const CATEGORIES = ["NFL", "NBA", "MLB", "NHL", "Concerts"];

/** Site footer. All copy is from the current site's footer. */
export function Footer() {
  const { contact } = siteConfig;
  return (
    <footer className="bg-ink text-white">
      <Container className="flex flex-col gap-12 pt-16 pb-10 sm:pt-[72px]">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="flex max-w-sm flex-col gap-4">
            <Logo tone="dark" />
            <p className="text-[15px] leading-relaxed text-on-dark-muted">
              The fastest way to sell your tickets. Get instant offers and cash in minutes.
            </p>
            <TrustpilotBadge tone="dark" />
          </div>

          <div className="flex flex-wrap gap-x-16 gap-y-10">
            <div className="flex flex-col gap-3">
              <h2 className={columnTitle}>Quick Links</h2>
              <ul className="flex flex-col gap-2">
                {footerNav.quickLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={footerLink}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className={columnTitle}>Legal</h2>
              <ul className="flex flex-col gap-2">
                {footerNav.legal.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className={footerLink}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className={columnTitle}>Contact</h2>
              <ul className="flex flex-col gap-2">
                <li>
                  <a href={contact.phoneHref} className={`inline-flex items-center gap-2.5 ${footerLink}`}>
                    <Phone className="size-4" aria-hidden="true" />
                    {contact.phone}
                  </a>
                </li>
                <li className="inline-flex items-center gap-2.5 text-on-dark-muted">
                  <MapPin className="size-4" aria-hidden="true" />
                  {contact.location}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-ink-2 pt-8">
          <p className="text-sm leading-relaxed text-on-dark-muted">
            TicketCricket is a ticket reseller and secondary marketplace, not the primary ticket provider. Prices
            are set by sellers and may be higher or lower than face value.
          </p>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p className="text-sm text-on-dark-muted">
              © <CopyrightYear /> TicketCricket. All rights reserved.
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Ticket categories">
              {CATEGORIES.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-ink-2 px-3 py-1 text-xs font-bold tracking-[0.06em] text-white/80"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
