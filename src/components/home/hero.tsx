import { BadgeCheck, Check, Clock, DollarSign, Music, Percent, Star, Zap } from "lucide-react";
import { Container } from "@/components/brand/container";
import { Cta } from "@/components/brand/cta";
import { TrustpilotBadge } from "@/components/brand/trustpilot-badge";

// Copy from the current site's Hero (business content — keep verbatim).
const trustStrip = [
  { icon: Clock, label: "Paid in 5 min" },
  { icon: Percent, label: "0% seller fees for PayPal payments" },
  { icon: DollarSign, label: "$2M+ paid out" },
];

const offerChecks = ["Zero seller fees with PayPal", "PayPal or Venmo", "Sent within 5 minutes"];

/** Home hero — design layout (copy left, floating offer card right), current site's copy. */
export function Hero() {
  return (
    <section className="relative">
      {/* Soft colour blobs behind the hero, from the design */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 -right-16 -z-10 size-[520px] rounded-full bg-mint blur-[70px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-32 -z-10 size-[420px] rounded-full bg-butter blur-[70px]" />

      <Container className="relative grid items-center gap-14 pt-10 pb-20 sm:pb-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex animate-rise items-center gap-2 rounded-full border border-line bg-white py-1.5 pr-4 pl-1.5 text-sm font-semibold shadow-[0_8px_20px_-16px_rgba(22,19,31,0.5)]">
            <span className="grid size-6 place-items-center rounded-full bg-brand">
              <BadgeCheck className="size-3.5" strokeWidth={3} aria-hidden="true" />
            </span>
            Trusted by 50,000+ sellers
          </span>

          <p className="animate-rise text-sm font-medium text-muted-foreground [animation-delay:0.05s]">
            TicketCricket is a ticket reseller and secondary marketplace.
          </p>

          <h1 className="animate-rise text-[52px] leading-[0.95] font-extrabold tracking-[-0.04em] [animation-delay:0.1s] sm:text-7xl lg:text-[84px]">
            Sell Your <br />
            Tickets. <br />
            <span className="relative inline-block">
              <span className="relative z-10">Get Paid</span>
              <span aria-hidden="true" className="absolute inset-x-0 bottom-1 -z-0 h-4 rounded-full bg-brand/60 sm:h-5" />
            </span>{" "}
            <br className="sm:hidden" />
            Fast.
          </h1>

          <p className="max-w-xl animate-rise text-lg leading-relaxed text-muted-foreground [animation-delay:0.2s] sm:text-xl">
            Instant cash offers in minutes. No listing fees, no waiting for buyers, no hassle, just fast money in your
            pocket.
          </p>

          <div className="flex animate-rise flex-wrap gap-3 [animation-delay:0.3s]">
            <Cta href="/sell" size="lg" withArrow>
              Get My Offer
            </Cta>
            <Cta href="/how-it-works" variant="secondary" size="lg">
              How It Works
            </Cta>
          </div>

          <ul className="flex animate-rise flex-wrap gap-x-6 gap-y-3 [animation-delay:0.45s]">
            {trustStrip.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-[15px] font-semibold">
                <span className="grid size-6 place-items-center rounded-full bg-mint text-link">
                  <Icon className="size-3.5" strokeWidth={2.6} aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <TrustpilotBadge className="animate-rise [animation-delay:0.6s]" />
        </div>

        <HeroVisual />
      </Container>
    </section>
  );
}

/** Decorative sample offer (same sample as the current site's hero card). Hidden from screen readers. */
function HeroVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto hidden w-full max-w-[440px] py-10 md:block">
      <div className="animate-rise [animation-delay:0.3s]">
        <div className="flex rotate-2 animate-float flex-col gap-5 rounded-[28px] border border-line bg-white p-7 shadow-[0_30px_60px_-24px_rgba(22,19,31,0.28)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">Your Offer</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-xs font-bold text-link">
              <span className="size-2 animate-live rounded-full bg-brand" />
              Live
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-lilac">
              <Music className="size-6" />
            </span>
            <span className="flex flex-col">
              <span className="font-heading text-2xl font-extrabold">BTS</span>
              <span className="text-sm text-muted-foreground">Sec 105 · Row C · 2 tickets</span>
            </span>
          </div>

          <div className="border-t border-dashed border-line" />

          <div className="flex items-end justify-between">
            <span className="font-heading text-6xl leading-none font-extrabold tracking-[-0.04em]">$600</span>
            <span className="pb-1 text-sm font-semibold text-muted-foreground">per ticket</span>
          </div>

          <ul className="flex flex-col gap-2.5">
            {offerChecks.map((c) => (
              <li key={c} className="flex items-center gap-2.5 text-sm font-medium">
                <span className="grid size-5 place-items-center rounded-full bg-brand">
                  <Check className="size-3" strokeWidth={3.2} />
                </span>
                {c}
              </li>
            ))}
          </ul>

          <span className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink font-bold text-white">
            Accept Offer →
          </span>
        </div>
      </div>

      <div className="absolute -top-4 -right-6 animate-pop [animation-delay:0.6s]">
        <div className="flex animate-float items-center gap-3 rounded-[18px] border border-line bg-white py-3 pr-4 pl-3 shadow-[0_18px_32px_-16px_rgba(22,19,31,0.3)] [animation-delay:0.8s]">
          <span className="grid size-9 place-items-center rounded-xl bg-butter">
            <Star className="size-4 fill-ink" />
          </span>
          <span className="text-sm font-bold">4.9 · 50K+ sellers</span>
        </div>
      </div>

      <div className="absolute -bottom-2 -left-10 animate-pop [animation-delay:0.9s]">
        <div className="flex animate-float items-center gap-3 rounded-[18px] border border-line bg-white py-3 pr-4 pl-3 shadow-[0_18px_32px_-16px_rgba(22,19,31,0.3)]">
          <span className="grid size-9 place-items-center rounded-xl bg-brand">
            <Zap className="size-4" />
          </span>
          <span className="text-sm font-bold">Payout sent 5 min ago</span>
        </div>
      </div>
    </div>
  );
}
