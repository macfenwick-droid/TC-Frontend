import type { ReactNode } from "react";
import { Container } from "@/components/brand/container";
import { Logo } from "@/components/brand/logo";
import { SellerReview, trustPoints } from "@/components/sell/sell-layout";

/**
 * Split card from the design's sign-up board: ink panel (logo + the current site's seller
 * trust points and review, no new copy) on the left, form on the right. The panel hides on small screens.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <Container className="py-8 sm:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[32px] border border-line bg-white shadow-[0_30px_80px_-40px_rgba(20,24,38,0.35)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <aside className="hidden flex-col gap-10 bg-ink p-10 text-white lg:flex">
          <Logo tone="dark" asLink={false} />
          <ul className="flex flex-col gap-6">
            {trustPoints.map(({ icon: Icon, title, desc, bg }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className={`grid size-9 shrink-0 place-items-center rounded-full text-ink ${bg}`}>
                  <Icon className="size-4" strokeWidth={2.4} aria-hidden="true" />
                </span>
                <span className="flex flex-col gap-1">
                  <b className="text-[17px] leading-snug">{title}</b>
                  <span className="text-[15px] leading-normal text-on-dark-muted">{desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <SellerReview className="mt-auto border-transparent" />
        </aside>
        <section className="flex min-w-0 animate-rise flex-col justify-center p-6 sm:p-10">{children}</section>
      </div>
    </Container>
  );
}
