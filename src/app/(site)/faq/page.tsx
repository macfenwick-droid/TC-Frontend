import type { Metadata } from "next";
import { Container } from "@/components/brand/container";
import { Cta } from "@/components/brand/cta";
import { SectionHeading } from "@/components/brand/section-heading";
import { FaqBrowser } from "@/components/faq/faq-browser";
import { JsonLd, faqPageJsonLd } from "@/components/seo/json-ld";
import { faqs } from "@/content/faqs";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about selling tickets, payments, and how TicketCricket works.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd(faqs)} />

      <section>
        <Container className="pt-12 pb-10 sm:pt-16">
          <SectionHeading
            as="h1"
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            description="Find answers to common questions about selling tickets, payments, and how TicketCricket works."
            className="animate-rise"
          />
        </Container>
      </section>

      <section>
        <Container className="pb-20">
          <FaqBrowser />
        </Container>
      </section>

      <section>
        <Container className="pb-20 sm:pb-24">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[32px] bg-sky p-8 sm:p-12 lg:flex-row lg:items-center">
            <div className="flex max-w-xl flex-col gap-3">
              <h2 className="text-3xl leading-tight font-extrabold sm:text-4xl">Still Have Questions?</h2>
              <p className="text-lg leading-relaxed text-ink-2">
                Our team is here to help. Reach out and we&apos;ll respond as quickly as possible.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Cta href="/contact" variant="secondary" size="lg">
                Contact Support
              </Cta>
              <Cta href="/sell" size="lg" withArrow>
                Sell My Tickets
              </Cta>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
