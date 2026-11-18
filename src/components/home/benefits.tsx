import { Clock, Headphones, Shield, TrendingUp, Wallet, Zap } from "lucide-react";
import { Container } from "@/components/brand/container";
import { SectionHeading } from "@/components/brand/section-heading";
import { TintCard, tintClasses, type Tint } from "@/components/brand/tint-card";
import { cn } from "@/lib/utils";

// Copy from the current site's Benefits section.
const benefits: { icon: typeof Zap; title: string; body: string; tint: Tint }[] = [
  {
    icon: Zap,
    title: "Instant Offers",
    body: "Get a competitive offer in minutes. No waiting for buyers to come along.",
    tint: "mint",
  },
  {
    icon: Clock,
    title: "Paid in Minutes",
    body: "Once you accept, get paid within 5 minutes to your preferred method.",
    tint: "sky",
  },
  {
    icon: Shield,
    title: "Zero seller fees — for PayPal payments",
    body: "Keep 100% of your offer with PayPal. Venmo payouts have a 3% surcharge.",
    tint: "butter",
  },
  {
    icon: Wallet,
    title: "Your Payout Choice",
    body: "PayPal or Venmo (3% surcharge applies) — pick whatever works best for you.",
    tint: "peach",
  },
  {
    icon: TrendingUp,
    title: "Last-Minute Expert",
    body: "Event tonight? We specialize in buying tickets right up to showtime.",
    tint: "lilac",
  },
  {
    icon: Headphones,
    title: "Real Human Support",
    body: "Questions? Chat with a real person, not a bot. We're here to help.",
    tint: "mint",
  },
];

export function Benefits() {
  return (
    <section>
      <Container className="flex flex-col gap-12 py-20 sm:py-24">
        <SectionHeading
          eyebrow="Why us"
          eyebrowTone="butter"
          title="Why Sellers Choose Us"
          description="We've made selling tickets as simple as it should be"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, body, tint }, i) => (
            <TintCard key={title} tint="white" lift className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className={cn("grid size-14 place-items-center rounded-2xl", tintClasses[tint])}>
                  <Icon className="size-6" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="font-heading text-sm font-extrabold text-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-2xl leading-tight font-extrabold">{title}</h3>
              <p className="leading-relaxed text-muted-foreground">{body}</p>
            </TintCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
