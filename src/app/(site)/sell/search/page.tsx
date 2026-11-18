import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/brand/container";
import { EventSearchResults } from "@/components/sell/event-search-results";
import { PageGlow } from "@/components/brand/glow";

export const metadata: Metadata = {
  title: "Find your event",
  robots: { index: false, follow: true },
};

export default function SellSearchPage() {
  return (
    <>
      <PageGlow />
      <Container className="flex max-w-3xl flex-col gap-6 pt-8 pb-20 sm:pt-10 sm:pb-24">
        <Link
          href="/sell"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to sell form
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl leading-none font-extrabold sm:text-5xl">Find your event</h1>
          <p className="text-muted-foreground">Pick your event to continue selling your tickets.</p>
        </div>
        {/* Reads ?q= from the URL, so it renders in the browser. */}
        <Suspense fallback={<div className="h-[52px] rounded-[14px] border-[1.5px] border-line bg-white" />}>
          <EventSearchResults />
        </Suspense>
      </Container>
    </>
  );
}
