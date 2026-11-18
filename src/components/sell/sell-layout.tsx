import type { ReactNode } from "react";
import { Clock, Shield, Star, Wallet, Zap } from "lucide-react";
import { Container } from "@/components/brand/container";
import { Eyebrow } from "@/components/brand/eyebrow";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

// Trust points and review — copy from the current site's sell sidebars.
export const trustPoints = [
  { icon: Zap, title: "Instant Offers", desc: "Get a cash offer in minutes", bg: "bg-brand" },
  { icon: Shield, title: "Zero seller fees — for PayPal payments", desc: "Venmo payouts have a 3% surcharge", bg: "bg-yellow" },
  { icon: Clock, title: "Paid in 5 Minutes", desc: "Fast payout after you accept", bg: "bg-[#7CC0F5]" },
  { icon: Wallet, title: "Choose Your Payout", desc: "PayPal or Venmo (3% surcharge applies)", bg: "bg-[#FF8A6B]" },
];

/**
 * Shared shell for /sell and /sell-season-tickets: heading + form on the left,
 * trust panel on the right (stacks under the form on small screens).
 */
export function SellLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
}) {
  return (
    <Container className="grid items-start gap-10 pt-8 pb-20 sm:pt-10 sm:pb-24 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="flex min-w-0 flex-col gap-7">
        <div className="flex animate-rise flex-col gap-3">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-[42px] leading-none font-extrabold sm:text-6xl">{title}</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-[19px]">{description}</p>
        </div>
        {children}
      </section>

      <aside className="flex animate-rise flex-col gap-5 [animation-delay:0.2s] lg:sticky lg:top-24">
        <ul className="flex flex-col gap-5 rounded-[28px] bg-ink p-7 text-white sm:p-8">
          {trustPoints.map(({ icon: Icon, title: t, desc, bg }) => (
            <li key={t} className="flex items-start gap-3.5">
              <span className={`grid size-9 shrink-0 place-items-center rounded-full text-ink ${bg}`}>
                <Icon className="size-4" strokeWidth={2.4} aria-hidden="true" />
              </span>
              <span className="flex flex-col gap-1">
                <b className="text-[17px] leading-snug">{t}</b>
                <span className="text-[15px] leading-normal text-on-dark-muted">{desc}</span>
              </span>
            </li>
          ))}
        </ul>

        <SellerReview />
      </aside>
    </Container>
  );
}

/** The current site's seller review card (sell sidebars, auth panel). */
export function SellerReview({ className }: { className?: string }) {
  return (
    <figure className={cn("flex flex-col gap-3 rounded-[28px] border border-line bg-white p-7 text-ink", className)}>
      <span className="flex items-center gap-1" role="img" aria-label={`Rated ${siteConfig.sellerRating} out of 5`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="grid size-6 place-items-center rounded bg-brand">
            <Star className="size-3.5 fill-ink text-ink" aria-hidden="true" />
          </span>
        ))}
        <span className="ml-1.5 text-sm font-bold">{siteConfig.sellerRating}/5</span>
      </span>
      <blockquote className="text-[17px] leading-normal font-medium">
        &ldquo;Got my offer in minutes and was paid in under 5 minutes. Incredibly easy!&rdquo;
      </blockquote>
      <figcaption className="text-sm text-muted-foreground">— Tom W., Seattle</figcaption>
    </figure>
  );
}
