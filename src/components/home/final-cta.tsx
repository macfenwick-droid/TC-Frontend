import { Container } from "@/components/brand/container";
import { Cta } from "@/components/brand/cta";

function Sparkle({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" fill="currentColor" />
    </svg>
  );
}

/** Closing CTA band — design's yellow card, current site's copy. Reused on How It Works. */
export function FinalCta({
  title = (
    <>
      Ready to Sell <br className="hidden sm:block" />
      Your Tickets?
    </>
  ),
  body = "Get an instant offer. No fees, no hassle, no waiting. Just fast cash for your tickets.",
  cta = "Get Your Instant Offer",
}: {
  title?: React.ReactNode;
  body?: React.ReactNode;
  cta?: string;
}) {
  return (
    <section>
      <Container className="py-16 sm:py-24">
        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-[32px] bg-yellow px-6 py-14 text-center sm:rounded-[40px] sm:px-14 sm:py-[72px]">
          <Sparkle className="absolute top-8 left-8 size-9 animate-float text-coral sm:top-10 sm:left-12 sm:size-11" />
          <Sparkle className="absolute right-8 bottom-8 size-7 animate-float text-[#7A5CFF] [animation-delay:1s] sm:right-12 sm:bottom-10 sm:size-9" />
          <h2 className="max-w-3xl text-4xl leading-[1.02] font-extrabold text-balance sm:text-6xl">{title}</h2>
          {body && <p className="max-w-xl text-lg leading-relaxed text-ink-2">{body}</p>}
          <Cta href="/sell" size="lg" withArrow>
            {cta}
          </Cta>
        </div>
      </Container>
    </section>
  );
}
