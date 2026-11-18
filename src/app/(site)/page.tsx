import type { Metadata } from "next";
import { Glow } from "@/components/brand/glow";
import { Benefits } from "@/components/home/benefits";
import { Comparison } from "@/components/home/comparison";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { OldVsNew } from "@/components/home/old-vs-new";
import { Stats } from "@/components/home/stats";
import { ValueChart } from "@/components/home/value-chart";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  // Same title as the current site's home page.
  title: { absolute: siteConfig.name },
  alternates: { canonical: "/" },
};

/** Home — same sections and order as the current site, in the new design. */
export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      {/* Light sections share one backdrop so the hero's colour glows flow down the page. */}
      <div className="relative isolate overflow-hidden">
        <Hero />
        <OldVsNew />
        <Benefits />
        <Stats />
        <Comparison />
        <ValueChart />
        <FinalCta />
        <Glow tone="lilac" className="-bottom-40 -left-40 size-[560px]" />
        <Glow tone="sky" className="-right-40 -bottom-24 size-[480px]" />
      </div>
    </>
  );
}
