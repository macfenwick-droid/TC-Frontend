import { Container } from "@/components/brand/container";
import { Glow } from "@/components/brand/glow";
import { tintClasses, type Tint } from "@/components/brand/tint-card";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

// Same four stats as the current site (D2). The seller rating stays 4.9 (D1).
const stats: { value: string; label: string; tint: Tint }[] = [
  { value: "50K+", label: "Tickets Purchased", tint: "butter" },
  { value: "5 min", label: "Average Payout", tint: "mint" },
  { value: "0%", label: "Seller Fees with PayPal", tint: "peach" },
  { value: `${siteConfig.sellerRating}★`, label: "Seller Rating", tint: "sky" },
];

export function Stats() {
  return (
    <section aria-label="TicketCricket in numbers" className="relative">
      <Glow tone="butter" className="top-1/2 left-1/2 h-[420px] w-[900px] max-w-[160vw] -translate-1/2" />
      <Container className="py-16 sm:py-20">
        <dl className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {stats.map(({ value, label, tint }) => (
            <div key={label} className={cn("flex flex-col-reverse gap-2 rounded-[28px] p-6 sm:p-8", tintClasses[tint])}>
              <dt className="text-sm font-semibold sm:text-base">{label}</dt>
              <dd className="font-heading text-4xl leading-none font-extrabold tracking-[-0.04em] sm:text-[56px]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
