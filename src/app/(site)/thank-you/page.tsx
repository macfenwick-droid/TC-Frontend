import type { Metadata } from "next";
import { Check, Ticket } from "lucide-react";
import { Container } from "@/components/brand/container";
import { Cta } from "@/components/brand/cta";
import { SubmissionSummary } from "@/components/sell/submission-summary";
import { PageGlow } from "@/components/brand/glow";

export const metadata: Metadata = {
  title: "Thank You",
  robots: { index: false, follow: false },
};

// Copy from the current site's Thank You page.
const nextSteps = [
  "Our team reviews your ticket details and verifies availability",
  "You'll receive an offer via email and/or phone within hours",
  "Accept the offer and get paid instantly via your preferred method",
];

const stepBg = ["bg-brand", "bg-yellow", "bg-[#7CC0F5]"];

export default function ThankYouPage() {
  return (
    <>
      <PageGlow />
      <Container className="flex max-w-2xl flex-col items-center gap-8 py-14 text-center sm:py-20">
        <span className="grid size-24 animate-pop place-items-center rounded-full bg-brand shadow-[0_18px_40px_-16px_rgba(43,212,125,0.8)]">
          <Check className="size-12" strokeWidth={3} aria-hidden="true" />
        </span>

        <div className="flex animate-rise flex-col gap-4 [animation-delay:0.15s]">
          <h1 className="text-5xl leading-none font-extrabold sm:text-6xl">Thank You!</h1>
          <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Your ticket submission has been received. Our team will review your tickets and contact you with an offer
            within the next few hours.
          </p>
        </div>

        <SubmissionSummary />

        <section className="w-full animate-rise rounded-[28px] bg-ink p-7 text-left text-white [animation-delay:0.25s] sm:p-8">
          <h2 className="mb-5 text-2xl font-bold">What happens next?</h2>
          <ol className="flex flex-col gap-4">
            {nextSteps.map((s, i) => (
              <li key={s} className="flex items-start gap-3.5">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full font-heading font-extrabold text-ink ${stepBg[i]}`}
                >
                  {i + 1}
                </span>
                <span className="pt-1 text-[17px] leading-snug text-on-dark-muted">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Cta href="/active-sales" variant="secondary" size="lg">
            Active Sales
          </Cta>
          <Cta href="/sell" size="lg" withArrow>
            <Ticket className="size-4" aria-hidden="true" />
            Sell More Tickets
          </Cta>
        </div>

        <p className="text-sm text-muted-foreground">Questions? Check out our support options.</p>
      </Container>
    </>
  );
}
