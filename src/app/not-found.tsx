import type { Metadata } from "next";
import { Home, Ticket } from "lucide-react";
import { Container } from "@/components/brand/container";
import { Cta } from "@/components/brand/cta";
import { CurrentPath } from "@/components/site/current-path";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export const metadata: Metadata = {
  title: "Ticket Not Found",
  robots: { index: false, follow: true },
};

// Floating ticket stubs in the background (decoration from the design).
const STUBS = [
  "left-[6%] top-[18%] h-[54px] w-[90px] bg-yellow -rotate-12",
  "right-[8%] top-[14%] h-11 w-[70px] bg-[#FF8A6B] [animation-delay:2s]",
  "left-[12%] bottom-[16%] h-10 w-16 bg-[#B9A8FF] [animation-delay:4s]",
  "right-[12%] bottom-[22%] h-[58px] w-24 bg-[#7CC0F5] [animation-delay:1s]",
];

/** 404 — design layout ("4 [ticket] 4"), current site's copy and actions. */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="relative flex flex-1 flex-col overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
          {STUBS.map((cls) => (
            <span key={cls} className={`absolute animate-drift rounded-xl ${cls}`} />
          ))}
        </div>

        <Container className="relative flex flex-col items-center gap-6 py-14 text-center sm:py-20">
          <div className="flex items-center justify-center gap-4 sm:gap-8" role="img" aria-label="404">
            <span className="font-heading text-[120px] leading-[0.85] font-extrabold tracking-[-0.06em] sm:text-[200px]">
              4
            </span>
            <span className="relative block h-[150px] w-[110px] origin-top animate-swing rounded-[22px] border-4 border-ink bg-brand shadow-[8px_10px_0_var(--tc-ink)] sm:h-[220px] sm:w-[160px] sm:rounded-[26px]">
              <span className="absolute top-1/2 -left-4 size-7 -translate-y-1/2 rounded-full border-4 border-ink bg-cream" />
              <span className="absolute top-1/2 -right-4 size-7 -translate-y-1/2 rounded-full border-4 border-ink bg-cream" />
              <span className="absolute inset-x-4 top-1/2 border-t-[3px] border-dashed border-ink" />
              <Ticket className="absolute top-5 left-1/2 size-9 -translate-x-1/2 sm:top-8 sm:size-12" />
            </span>
            <span className="font-heading text-[120px] leading-[0.85] font-extrabold tracking-[-0.06em] sm:text-[200px]">
              4
            </span>
          </div>

          <h1 className="animate-rise text-4xl leading-none font-extrabold sm:text-6xl">Ticket Not Found</h1>
          <p className="max-w-md animate-rise text-lg leading-relaxed text-muted-foreground [animation-delay:0.1s]">
            Looks like this page has been sold out. Let&apos;s get you back somewhere useful.
          </p>

          <div className="flex animate-rise flex-col gap-3 [animation-delay:0.2s] sm:flex-row">
            <Cta href="/" variant="secondary" size="lg">
              <Home className="size-4" aria-hidden="true" />
              Go Home
            </Cta>
            <Cta href="/sell" size="lg" withArrow>
              Sell Tickets
            </Cta>
          </div>

          <CurrentPath className="font-mono text-xs text-subtle" />
        </Container>
      </main>
      <Footer />
    </>
  );
}
