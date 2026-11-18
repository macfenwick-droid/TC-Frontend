import { Container } from "@/components/brand/container";
import { PortalNav } from "@/components/portal/portal-nav";
import { RequireAuth } from "@/components/portal/require-auth";
import { PageGlow } from "@/components/brand/glow";

/** Seller dashboard: Active Sales, My Sales, Settings. Signed-in only. */
export default function PortalLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PageGlow />
      <Container className="grid items-start gap-6 pt-6 pb-20 sm:pt-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <PortalNav />
        <div className="flex min-w-0 flex-col gap-7">
          <RequireAuth>{children}</RequireAuth>
        </div>
      </Container>
    </>
  );
}
