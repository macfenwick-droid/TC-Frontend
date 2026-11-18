import type { Metadata } from "next";
import { Banknote, Check, DollarSign, FileText, Send } from "lucide-react";
import { Container } from "@/components/brand/container";
import { SectionHeading } from "@/components/brand/section-heading";
import { tintClasses, type Tint } from "@/components/brand/tint-card";
import { FinalCta } from "@/components/home/final-cta";
import { cn } from "@/lib/utils";
import { PageGlow } from "@/components/brand/glow";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Selling your tickets has never been easier. Here's how we turn your unused tickets into cash in minutes.",
  alternates: { canonical: "/how-it-works" },
};

// Copy from the current site's How It Works page.
const steps: { icon: typeof FileText; title: string; body: string; detail: string; tint: Tint; label: string }[] = [
  {
    icon: FileText,
    title: "Enter Your Ticket Details",
    body: "Tell us about your event — the name, date, venue, and seat information. It only takes about 60 seconds to fill out our simple form.",
    detail: "Event name, date, section, row & quantity",
    tint: "mint",
    label: "text-link",
  },
  {
    icon: DollarSign,
    title: "Receive Your Instant Offer",
    body: "Our team quickly evaluates your tickets and sends you a competitive offer. No haggling, no lowball offers — just a fair price.",
    detail: "Usually within minutes, often seconds",
    tint: "butter",
    label: "text-amber-fg",
  },
  {
    icon: Send,
    title: "Accept & Transfer",
    body: "If you accept our offer, simply transfer your tickets to us. We'll guide you through the process step by step.",
    detail: "Works with Ticketmaster, AXS, SeatGeek & more",
    tint: "sky",
    label: "text-blue-fg",
  },
  {
    icon: Banknote,
    title: "Get Paid Instantly",
    body: "Once we receive your tickets, we pay you immediately via PayPal or Venmo (3% surcharge applies). No waiting, no delays.",
    detail: "Typically paid within 5 minutes of transfer",
    tint: "peach",
    label: "text-[#9A3412]",
  },
];

const guarantees = [
  "Zero seller fees — for PayPal payments.",
  "Fair, competitive pricing",
  "Real human support",
  "Works for last-minute tickets",
  "Multiple payout options",
  "Secure ticket transfers",
];

export default function HowItWorksPage() {
  return (
    <>
      <PageGlow long />
      {/* Hero + step timeline */}
      <section>
        <Container className="flex flex-col gap-14 pt-12 pb-20 sm:pt-16">
          <SectionHeading
            as="h1"
            eyebrow="The Process"
            title="How TicketCricket Works"
            description="Selling your tickets has never been easier. Here's how we turn your unused tickets into cash in minutes."
            className="animate-rise"
          />

          <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <span aria-hidden="true" className="absolute top-[27px] right-[calc((100%-72px)/4-29px)] left-7 hidden h-1 rounded-full bg-ink lg:block" />
            {steps.map((s, i) => (
              <li key={s.title} className="relative flex flex-col gap-3.5">
                <span
                  className={cn(
                    "grid size-[58px] animate-pop place-items-center rounded-full border-[3px] border-ink font-heading text-[22px] font-extrabold",
                    tintClasses[s.tint]
                  )}
                  style={{ animationDelay: `${0.2 + i * 0.15}s` }}
                >
                  {i + 1}
                </span>
                <a href={`#step-${i + 1}`} className="font-heading text-[22px] leading-tight font-bold hover:text-link">
                  {s.title}
                </a>
                <span className="text-muted-foreground">{s.detail}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Step details */}
      <section>
        <Container className="flex flex-col gap-16 py-20 sm:gap-[72px] sm:py-24">
          {steps.map(({ icon: Icon, title, body, detail, tint, label }, i) => (
            <div
              key={title}
              id={`step-${i + 1}`}
              className="grid scroll-mt-24 items-center gap-8 lg:grid-cols-2 lg:gap-14"
            >
              <div className={cn("flex flex-col gap-4", i % 2 === 1 && "lg:order-2")}>
                <span className={cn("font-heading text-lg font-extrabold", label)}>
                  STEP {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-4xl leading-[1.05] font-extrabold sm:text-[44px]">{title}</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">{body}</p>
              </div>
              <div className={cn("flex justify-center rounded-[32px] p-8 sm:p-10", tintClasses[tint])}>
                <div className="flex w-full max-w-[380px] animate-float flex-col items-center gap-4 rounded-[22px] bg-white p-7 text-center shadow-[0_24px_48px_-24px_rgba(22,19,31,0.3)]">
                  <span className="grid size-16 place-items-center rounded-2xl bg-ink text-brand">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <p className="font-semibold">{detail}</p>
                </div>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* Every sale includes */}
      <section>
        <Container className="flex flex-col items-center gap-8 py-20 sm:py-24">
          <h2 className="text-sm font-bold tracking-[0.12em] text-muted-foreground uppercase">
            Every sale includes
          </h2>
          <ul className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {guarantees.map((g) => (
              <li key={g} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 font-semibold">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {g}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <FinalCta title="Ready to Sell Your Tickets?" body={null} cta="Get My Instant Offer" />
    </>
  );
}
