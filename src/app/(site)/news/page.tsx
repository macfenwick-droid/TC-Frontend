import type { Metadata } from "next";
import { Container } from "@/components/brand/container";
import { NewsDashboard } from "@/components/news/news-dashboard";

const description =
  "Live ESPN results, injuries, headlines and a ticket-demand signal for NFL, college football, NBA and NHL teams.";

export const metadata: Metadata = {
  // Same tab title as the current site ("Team News | TicketCricket").
  title: "Team News",
  description,
  alternates: { canonical: "/news" },
};

export default function NewsPage() {
  return (
    <>
      <section>
        <Container className="flex flex-col gap-4 pt-12 pb-10 sm:pt-16">
          <h1 className="animate-rise text-5xl leading-[1.02] font-extrabold sm:text-6xl lg:text-7xl">
            Sports <span className="text-link">News</span> &amp; Insights
          </h1>
          <p className="max-w-2xl animate-rise text-lg leading-relaxed text-muted-foreground [animation-delay:0.1s] sm:text-xl">
            {description}
          </p>
        </Container>
      </section>
      <section className="min-h-[60vh]">
        <Container className="pb-20 sm:pb-24">
          <NewsDashboard />
        </Container>
      </section>
    </>
  );
}
