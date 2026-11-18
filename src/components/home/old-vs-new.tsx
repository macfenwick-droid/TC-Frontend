import { Check, X } from "lucide-react";
import { Container } from "@/components/brand/container";
import { Cta } from "@/components/brand/cta";
import { SectionHeading } from "@/components/brand/section-heading";

// Copy from the current site's OldVsNew section.
const oldWay = [
  "Create a listing and wait for buyers",
  "Deal with lowball offers and negotiations",
  "Pay 10–20% in seller fees",
  "Risk scams and no-shows",
  "Wait days or weeks for payment",
];

const newWay = [
  "Get an instant offer",
  "Fair, competitive pricing guaranteed",
  "Zero seller fees — for PayPal payments.",
  "Secure, verified transactions",
  "Get paid in under 5 minutes",
];

export function OldVsNew() {
  return (
    <section className="border-y border-line bg-white">
      <Container className="flex flex-col gap-12 py-20 sm:py-24">
        <SectionHeading
          align="center"
          eyebrow="The Difference"
          title="A Better Way to Sell"
          description="Stop dealing with the hassle of traditional ticket marketplaces"
        />

        <div className="relative grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col gap-6 rounded-[28px] border border-line bg-cream p-7 sm:p-9">
            <h3 className="text-2xl font-extrabold text-muted-foreground">The Old Way</h3>
            <ul className="flex flex-col gap-4">
              {oldWay.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[17px] text-muted-foreground">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-peach text-[#9A3412]">
                    <X className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="line-through decoration-subtle/60">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 z-10 hidden size-16 -translate-1/2 place-items-center rounded-full border-4 border-white bg-ink font-heading text-lg font-extrabold text-white lg:grid"
          >
            VS
          </span>

          <div className="relative flex flex-col gap-6 overflow-hidden rounded-[28px] bg-brand p-7 sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-2xl font-extrabold">The TicketCricket Way</h3>
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold tracking-[0.08em] text-white uppercase">
                Recommended
              </span>
            </div>
            <ul className="flex flex-col gap-4">
              {newWay.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[17px] font-semibold">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-ink text-brand">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-center">
          <Cta href="/sell" size="lg" withArrow>
            Try the Better Way
          </Cta>
        </div>
      </Container>
    </section>
  );
}
